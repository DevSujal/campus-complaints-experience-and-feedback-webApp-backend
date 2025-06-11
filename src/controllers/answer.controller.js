import prisma from "../prismaClient.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createAnswer = asyncHandler(async (req, res) => {
  const questionId = parseInt(req.body.questionId);

  const { text = "" } = req.body;

  if (!questionId) {
    throw new ApiError(400, "question id not found");
  }
  if (!text || text.length === 0) {
    throw new ApiError(400, "answer text is required");
  }

  const question = await prisma.question.findUnique({
    where: {
      questionId,
    },
  });

  if (!question) {
    throw new ApiError(400, "invalid question id");
  }

  if (question.userId !== req.user.userId) {
    throw new ApiError(
      403,
      "forbidden for other users only specific user allowed"
    );
  }

  const answer = await prisma.answer.create({
    data: {
      text,
      givenBy: {
        connect: {
          userId: req.user.userId,
        },
      },
      question: {
        connect: {
          questionId,
        },
      },
    },
  });

  if (!answer) {
    throw new ApiError(500, "internal server error while generating answer");
  }

  res.json(new ApiResponse(201, answer, "answer created successfully"));
});

const getAnswer = asyncHandler(async (req, res) => {
  const questionId = parseInt(req.params.questionId, 10);

  if (!questionId) {
    throw new ApiError(400, "question id not found");
  }

  const answer = await prisma.answer.findUnique({
    where: {
      questionId,
    },
  });

  if (!answer) {
    throw new ApiError(500, "internal server error");
  }

  res.json(new ApiResponse(200, answer, "answer retrieved successfully"));
});

export { createAnswer, getAnswer };

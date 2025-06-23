import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import prisma from "../prismaClient.js";
import ApiResponse from "../utils/ApiResponse.js";

const createQuestion = asyncHandler(async (req, res) => {
  const interviewExperienceId = parseInt(req.body.interviewExperienceId, 10);
  const { title, description } = req.body;

  if (!interviewExperienceId) {
    throw new ApiError(400, "interview experience id not found");
  }

  const question = await prisma.question.create({
    data: {
      title,
      description,
      askedBy: {
        connect: {
          userId: req.user.userId,
        },
      },
      interviewExperience: {
        connect: {
          interviewExperienceId,
        },
      },
      askedByName: req.user.name,
    },
  });

  if (!question) {
    throw new ApiError(500, "something happend while generating question");
  }

  res.json(new ApiResponse(201, question, "successfully created question"));
});

const getQuestionsByExperienceId = asyncHandler(async (req, res) => {
  const interviewExperienceId = parseInt(req.params.interviewExperience, 10);

  if (!interviewExperienceId) {
    throw new ApiError(400, "interview experience id not found");
  }

  const questions = await prisma.question.findMany({
    where: { interviewExperienceId },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!questions) {
    throw new ApiError(500, "something went wrong while retrieving questions");
  }

  res.json(new ApiResponse(200, questions, "questions retrieved successfully"));
});

export { createQuestion, getQuestionsByExperienceId };

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import prisma from "../prismaClient.js";
import ApiResponse from "../utils/ApiResponse.js";

const createFeedback = asyncHandler(async (req, res) => {
  const complaintId = parseInt(req.body.complaintId, 10);
  const { isAnonymous = false, message = "" } = req.body;

  if (!complaintId) {
    throw new ApiError(400, "complaint id is needed");
  }

  if (!message || message.length === 0) {
    throw new ApiError(400, "message is required");
  }

  const feedback = await prisma.feedback.create({
    data: {
      complaint: {
        connect: {
          complaintId,
        },
      },
      givenBy: {
        connect: {
          userId: req.user.userId,
        },
      },

      isAnonymous,
      message,
      givenByName: isAnonymous ? null : user.name,
    },
  });

  if (!feedback) {
    throw new ApiError(500, "something went wrong which creating feedback");
  }

  if (feedback.isAnonymous) {
    delete feedback.userId;
    delete feedback.givenByName;
  }

  res.json(new ApiResponse(201, feedback, "feedback created successfully"));
});

const getFeedbacksOfComplaint = asyncHandler(async (req, res) => {
  const complaintId = parseInt(req.params.complaintId);

  if (!complaintId) {
    throw new ApiError(400, "complaint id is required");
  }

  const feedbacks = await prisma.feedback.findMany({
    where: {
      complaintId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!feedbacks) {
    throw new ApiError(500, "internal server error");
  }

  const filteredFeedbacks = feedbacks.map((feedback) => {
    if (feedback.isAnonymous) {
      const { givenBy, givenByName, ...rest } = feedback;
      return rest;
    }

    return feedback;
  });

  res.json(
    new ApiResponse(200, filteredFeedbacks, "feedbacks retrieved successfully")
  );
});

export { createFeedback, getFeedbacksOfComplaint };

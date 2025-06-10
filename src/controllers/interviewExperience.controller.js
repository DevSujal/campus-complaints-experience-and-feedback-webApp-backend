import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import prisma from "../prismaClient.js";
import ApiResponse from "../utils/ApiResponse.js";

const createExperience = asyncHandler(async (req, res) => {
  const {
    companyName = "",
    roleApplied = "",
    experience = "",
    tips = "",
  } = req.body;

  if (
    [companyName, roleApplied, experience].some(
      (field) => !field || field.length == 0
    )
  ) {
    throw new ApiError(400, "All fields are mandatory");
  }

  const newExperiece = await prisma.interviewExperience.create({
    data: {
      companyName,
      roleApplied,
      experience,
      tips,
      givenBy: {
        connect: {
          userId: req.user.userId,
        },
      },
    },
  });

  if (!newExperiece) {
    throw new ApiError(
      500,
      "internal server error while creating new Experience"
    );
  }

  res.json(
    new ApiResponse(201, newExperiece, "new Experience created successfully")
  );
});

const getExperienceById = asyncHandler(async (req, res) => {
  const interviewExperienceId = parseInt(req.params.interviewExperienceId, 10);

  if (!interviewExperienceId) {
    throw new ApiError(400, "interviewExperienceId is missing");
  }

  const experience = await prisma.interviewExperience.findUnique({
    where: {
      interviewExperienceId,
    },
  });

  if (!experience) {
    throw new ApiError(400, "invalid interviewExperienceId");
  }

  res.json(
    new ApiResponse(
      200,
      experience,
      "successfully retrieved interview experience"
    )
  );
});

// const

export { createExperience, getExperienceById };

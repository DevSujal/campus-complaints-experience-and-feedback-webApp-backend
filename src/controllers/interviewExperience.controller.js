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
      givenByName: req.user.name,
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

const getInterviewExperiences = asyncHandler(async (req, res) => {
  // limit how many complaints to fetch at a time
  const { cursor, limit = 10 } = req.query;
  const take = parseInt(limit, 10) || 10;

  const interviewExperiences = await prisma.interviewExperience.findMany({
    // we need to fetch extra one to check if these is more complaints or not
    //  to update nextCursor
    take: take + 1,
    orderBy: {
      createdAt: "desc",
    },
    // spread operator is used to spread skip and cursor into findMany
    // cursor means from where to start
    ...(cursor && {
      // skip : 1 means skip the current cursor so that it doesn't appear again
      skip: 1,
      cursor: {
        interviewExperienceId: parseInt(cursor, 10),
      },
    }),
  });

  let nextCursor = null;

  if (interviewExperiences.length > take) {
    // these will remove the extra one
    const nextItem = interviewExperiences.pop();
    nextCursor = nextItem?.complaintId;
  }

  res.json(
    new ApiResponse(
      200,
      { interviewExperiences, nextCursor },
      "interview experiences retrieved successfully"
    )
  );
});

const getUserInterviewExperience = asyncHandler(async (req, res) => {
  const interviewExperiences = await prisma.interviewExperience.findMany({
    where: {
      userId: req.user.userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!interviewExperiences) {
    throw new ApiError(500, "internal server error");
  }

  res.json(
    new ApiResponse(
      200,
      interviewExperiences,
      "user interview experiences retrieved successfully"
    )
  );
});

const countExperience = asyncHandler(async (_, res) => {
  const experiencesCount = await prisma.interviewExperience.count();
  if (typeof experiencesCount != "number" && !experiencesCount) {
    throw new ApiError(500, "something went wrong while counting experience");
  }

  res.json(
    new ApiResponse(
      200,
      { experiencesCount },
      "successfully retrieved experience count"
    )
  );
});

export {
  createExperience,
  getExperienceById,
  getInterviewExperiences,
  getUserInterviewExperience,
  countExperience,
};

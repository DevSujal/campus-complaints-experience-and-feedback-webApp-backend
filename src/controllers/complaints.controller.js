import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import prisma from "../prismaClient.js";
import ApiResponse from "../utils/ApiResponse.js";

const createComplaint = asyncHandler(async (req, res) => {
  const { title = "", description = "", isAnonymous = false } = req.body;

  if (
    !title ||
    !description ||
    title.length === 0 ||
    description.length === 0
  ) {
    throw new ApiError(400, "title or description missing");
  }

  const complaint = await prisma.complaint.create({
    data: {
      title,
      description,
      isAnonymous,
      createdBy: {
        connect: {
          userId: req.user.userId,
        },
      },
    },
  });

  if (!complaint) {
    throw new ApiError(500, "internal server error");
  }

  if (isAnonymous) {
    delete complaint.createdById;
  }

  res.json(new ApiResponse(201, complaint, "complaint created successfully"));
});

const getUserComplaints = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const complaints = await prisma.complaint.findMany({
    where: {
      createdById: userId,
    },
  });

  if (!complaints) {
    throw new ApiError(
      500,
      "something happend while retrieving user complaints"
    );
  }

  const filteredComplaints = complaints.map((complaint) => {
    if (complaint.isAnonymous) {
      const { createdById, createdBy, ...rest } = complaint;
      return rest;
    }

    return complaint;
  });

  res.json(
    new ApiResponse(
      200,
      filteredComplaints,
      "all complaints retrieved successfully"
    )
  );
});

const getComplaintById = asyncHandler(async (req, res) => {
  // , 10 ensures parsing happened on base 10
  //Strings starting with "0" as octal (base 8),
  // Strings starting with "0x" as hexadecimal (base 16),
  // Other strings as base 10.
  const complaintId = parseInt(req.params.complaintId, 10);

  if (!complaintId) {
    throw new ApiError(400, "complaintId is not there");
  }

  const complaint = await prisma.complaint.findUnique({
    where: {
      complaintId,
    },
  });

  if (!complaint) {
    throw new ApiError(500, "internal server error");
  }

  if (complaint.isAnonymous) {
    delete complaint.createdById;
  }

  res.json(new ApiResponse(200, complaint, "complaint retrieved successfully"));
});

export { createComplaint, getUserComplaints, getComplaintById };

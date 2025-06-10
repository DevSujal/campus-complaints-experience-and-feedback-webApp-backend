import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import prisma from "../prismaClient.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Status } from "@prisma/client";

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

const assignStaffToComplaint = asyncHandler(async (req, res) => {
  const { user } = req;
  const { staffEmail } = req.body;
  const complaintId = parseInt(req.body.complaintId, 10);

  if (!user) {
    throw new ApiError(401, "unauthorized access");
  }

  if (!staffEmail) {
    throw new ApiError(400, "staff email required to assign complaint");
  }

  const staff = await prisma.user.findUnique({
    where: {
      email: staffEmail,
    },
  });

  if (!staff) {
    throw new ApiError(400, "invalid email  given");
  }

  if (staff.role !== "STAFF") {
    throw new ApiError(400, "only staff email required");
  }

  const updatedComplaint = await prisma.complaint.update({
    where: {
      complaintId,
    },
    data: {
      assignedTo: {
        connect: {
          userId: staff.userId,
        },
      },
    },
  });

  if (!updatedComplaint) {
    throw new ApiError(500, "internal server error");
  }

  if (updatedComplaint.isAnonymous) {
    delete updatedComplaint.createdById;
  }

  res.json(
    new ApiResponse(200, updatedComplaint, "staff assigned successfully")
  );
});

const changeStatusOfComplaint = asyncHandler(async (req, res) => {
  const { status = "" } = req.body;
  const complaintId = parseInt(req.body.complaintId, 10);

  if (!complaintId) {
    throw new ApiError(400, "complaint id is needed");
  }

  if (!req?.user || req?.user?.role !== "STAFF") {
    throw new ApiError(401, "unauthorized access");
  }

  if (status && !Object.values(Status).includes(status.toUpperCase())) {
    throw new ApiError(400, "status should be pending, inprogress, resolved");
  }

  const updatedComplaint = await prisma.complaint.update({
    where: {
      complaintId,
    },
    data: {
      status: status?.toUpperCase() || "PENDING",
    },
  });

  if (!updatedComplaint) {
    throw new ApiError(500, "internal server error");
  }

  if (updatedComplaint.isAnonymous) {
    delete updatedComplaint.createdById;
  }

  res.json(
    new ApiResponse(200, updatedComplaint, "status updated successfully")
  );
});

const deleteComplaint = asyncHandler(async (req, res) => {
  const complaintId = parseInt(req.body.complaintId, 10);

  const deletedComplaint = await prisma.complaint.delete({
    where: {
      complaintId,
    },
  });

  if (!deletedComplaint) {
    throw new ApiError(500, "something happend while deleting complaint");
  }

  if (deletedComplaint.isAnonymous) {
    delete deletedComplaint.createdById;
  }

  res.json(
    new ApiResponse(200, deletedComplaint, "complaint deleted successfully")
  );
});

const getComplaints = asyncHandler(async (req, res) => {
  // limit how many complaints to fetch at a time
  const { lastComplaintId, limit = 10 } = req.query;
  const take = parseInt(limit, 10) || 10;

  const complaints = await prisma.complaint.findMany({
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
        complaintId: parseInt(lastComplaintId, 10),
      },
    }),
  });

  let nextCursor = null;

  if (complaints.length > take) {
    // these will remove the extra one
    const nextItem = complaints.pop();
    nextCursor = nextItem?.complaintId;
  }

  res.json(
    new ApiResponse(
      200,
      { complaints, nextCursor },
      "complaints retrieved successfully"
    )
  );
});

export {
  createComplaint,
  getUserComplaints,
  getComplaintById,
  assignStaffToComplaint,
  changeStatusOfComplaint,
  deleteComplaint,
  getComplaints,
};

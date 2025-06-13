import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";

const validateUser = asyncHandler(async (req, _, next) => {
  // we know typically athorization will look like
  // Authorization: Bearer <token>
  // thats why we are spliting it taking taking the 2nd position which is token
  const accessToken =
    req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];

  if (!accessToken) {
    throw new ApiError(401, "unauthorized access");
  }

  const decodedAccessToken = jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET
  );

  const user = await prisma.user.findUnique({
    where: {
      userId: decodedAccessToken?.userId,
    },
  });

  if (!user) {
    throw new ApiError(401, "invalid access token");
  }

  delete user.password;

  req.user = user;

  next();
});

const validateAdmin = asyncHandler(async (req, _, next) => {
  const { user } = req;

  if (!user) {
    throw new ApiError(401, "unauthorized access");
  }

  if (user.role !== "ADMIN") {
    throw new ApiError(403, "admin's only allowed to use these route");
  }

  next();
});

const validateStaff = asyncHandler(async (req, _, next) => {
  const { user } = req;

  if (!user) {
    throw new ApiError(401, "unauthorized access");
  }

  if (user.role !== "STAFF") {
    throw new ApiError(403, "staff's only allowed to use these route");
  }

  next();
});

export { validateUser, validateStaff, validateAdmin };

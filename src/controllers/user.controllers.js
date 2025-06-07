import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import prisma from "../prismaClient.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;

const OPTION = {
  httpOnly : true,
  secure: true,
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.userId,
      name: user.name,
      email: user.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.userId,
      name: user.name,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

const generateRefreshAndAccessToken = async (userId) => {
  try {
    const user = await prisma.user.findUnique({ where: { userId } });

    if (!user) {
      throw new ApiError(400, "user not existed");
    }

    const refreshToken = generateRefreshToken(user);
    const accessToken = generateAccessToken(user);

    console.log(refreshToken, accessToken)
    await prisma.user.update({
      where: { userId },
      data: { refreshToken },
    });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      error?.message ||
        "something went wrong which generating access and refresh tokens"
    );
  }
};

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "email and password is required to login");
  }
  // await is most important because database may be in different quantinent hence
  // it needs time to fetch the user hence we have to wait
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (!existingUser) {
    throw new ApiError(404, "user not found with the given email", [
      { field: "email" },
    ]);
  }

  // to match the password is correct or not
  const isMatched = await bcrypt.compare(password, existingUser.password);

  if (!isMatched) {
    throw new ApiError(401, "password is incorrect", [{ field: "password" }]);
  }

  const { refreshToken, accessToken } = await generateRefreshAndAccessToken(
    existingUser.userId
  );

  console.log(refreshToken, accessToken)
  if (!refreshToken || !accessToken) {
    throw new ApiError(500, "internal server error", [
      { field: "refreshToken" },
    ]);
  }

  delete existingUser.password;

  res
    .status(200)
    .cookie("accessToken", accessToken, OPTION)
    .cookie("refreshToken", refreshToken, OPTION)
    .json(new ApiResponse(200, existingUser, "user loggedin successfully"));
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if ([name, email, password].some((field) => !field || field.length == 0)) {
    throw new ApiError(
      400,
      "name, email and password are required to register"
    );
  }

  if (!email.includes("@", ".")) {
    throw new ApiError(400, "email is not valid");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new ApiError(409, "user with email already existed");
  }

  if (role && !Object.values(Role).includes(role.toUpperCase())) {
    throw new ApiError(400, "role must be STUDENT, STAFF or ADMIN", [
      { field: "role" },
    ]);
  }
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role?.toUpperCase() || Role.STUDENT,
    },
  });

  delete newUser.password;

  res.json(new ApiResponse(201, newUser, "user created successfully"));
});

export { loginUser, registerUser };

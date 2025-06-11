import prisma from "../prismaClient.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";


const createAnswer = asyncHandler(async (req, res) => {
  const questionId = parseInt(req.query.questionId, 10);

  if (!questionId) {
    throw new ApiError(400, "question id not found");
  }

  const answer = await prisma.answer.create({
    data : {
        
    }
  })
});

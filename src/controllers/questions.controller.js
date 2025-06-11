import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import prisma from "../prismaClient.js";

const createQuestion = asyncHandler(async (req, res) => {
  const interviewExperienceId = parseInt(req.body.interviewExperienceId, 10);
  const {title, description} = req.body

  if (!interviewExperienceId) {
    throw new ApiError(400, "interview experience id not found");
  }

  const question = prisma.question.create({
    data : {
        title,
        description,
        askedBy : {
            connect : {
                userId : req.user.userId
            }
        }
        
    }
  })
});

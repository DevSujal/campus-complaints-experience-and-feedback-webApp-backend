import { Router } from "express";
import { validateUser } from "../middleware/user.middleware.js";
import {
  createExperience,
  getExperienceById,
  getInterviewExperiences,
  getUserInterviewExperience,
} from "../controllers/interviewExperience.controller.js";

const router = Router();

router.route("/create-experience").post(validateUser, createExperience);
router.route("/get-experience-by-id").get(validateUser, getExperienceById);
router
  .route("/get-user-interview-experience")
  .get(validateUser, getUserInterviewExperience);
router
  .route("/get-interview-experiences")
  .get(validateUser, getInterviewExperiences);

export default router;

import { Router } from "express";
import { validateUser } from "../middleware/user.middleware.js";
import {
  countExperience,
  createExperience,
  getExperienceById,
  getInterviewExperiences,
  getUserInterviewExperience,
} from "../controllers/interviewExperience.controller.js";

const router = Router();

router
  .route("/create-interview-experience")
  .post(validateUser, createExperience);
router
  .route("/get-interview-experience-by-id/:interviewExperienceId")
  .get(validateUser, getExperienceById);
router
  .route("/get-user-interview-experience")
  .get(validateUser, getUserInterviewExperience);
router
  .route("/get-interview-experiences")
  .get(validateUser, getInterviewExperiences);
router.route("/count-interview-experiences").get(validateUser, countExperience);

export default router;

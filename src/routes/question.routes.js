import { Router } from "express";
import { validateUser } from "../middleware/user.middleware.js";
import {
  createQuestion,
  getQuestionsByExperienceId,
} from "../controllers/questions.controller.js";

const router = Router();

router.route("/create-question").post(validateUser, createQuestion);
router
  .route("/get-questions-by-experience-id/:interviewExperienceId")
  .get(validateUser, getQuestionsByExperienceId);

export default router;

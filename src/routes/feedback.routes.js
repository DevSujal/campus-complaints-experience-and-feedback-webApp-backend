import { Router } from "express";
import { validateUser } from "../middleware/user.middleware.js";
import {
  createFeedback,
  getFeedbacksOfComplaint,
} from "../controllers/feedback.controller.js";

const router = Router();

router.route("/create-feedback").post(validateUser, createFeedback);
router
  .route("/get-complaint-feedbacks/:complaintId")
  .get(validateUser, getFeedbacksOfComplaint); 

export default router;

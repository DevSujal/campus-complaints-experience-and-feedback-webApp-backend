import { Router } from "express";
import { validateUser } from "../middleware/user.middleware.js";
import {
  createExperience,
  getExperienceById,
} from "../controllers/interviewExperience.controller.js";

const router = Router();

router.route("/create-experience").post(validateUser, createExperience);
router.route("/get-experience-by-id").get(validateUser, getExperienceById);

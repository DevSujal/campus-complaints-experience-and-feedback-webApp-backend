import { Router } from "express";
import { validateUser } from "../middleware/user.middleware.js";
import { createAnswer, getAnswer } from "../controllers/answer.controller.js";

const router = Router();

router.route("/create-answer").post(validateUser, createAnswer);
router.route("/get-answer/:questionId").get(getAnswer);

export default router;

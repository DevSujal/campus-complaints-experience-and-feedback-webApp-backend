import { Router } from "express";
import { validateUser } from "../middleware/user.middleware.js";
import { createQuestion } from "../controllers/questions.controller.js";

const router = Router();

router.route("/create-question").post(validateUser, createQuestion);

export default router;

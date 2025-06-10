import { Router } from "express";
import { validateUser } from "../middleware/user.middleware.js";

const router = Router();

router.route("/create-experience").post(validateUser, createExperience);

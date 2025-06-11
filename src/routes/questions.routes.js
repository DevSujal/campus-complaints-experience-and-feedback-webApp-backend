import { Router } from "express";
import { validateUser } from "../middleware/user.middleware";

const router = Router();

router.route("/create-question").post(validateUser, createQuestion);

export default router;

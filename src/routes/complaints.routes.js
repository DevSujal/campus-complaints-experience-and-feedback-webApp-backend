import { Router } from "express";
import { validateUser } from "../middleware/user.middleware.js";
import {
  createComplaint,
  getUserComplaints,
  getComplaintById,
} from "../controllers/complaints.controller.js";
const router = Router();

router.route("/create-complaint").post(validateUser, createComplaint);
router.route("/get-user-complaints").get(validateUser, getUserComplaints);
router.route("/get-complaint/:complaintId").get(validateUser, getComplaintById);

export default router;

import { Router } from "express";
import {
  validateUser,
  validateAdmin,
  validateStaff,
} from "../middleware/user.middleware.js";
import {
  createComplaint,
  getUserComplaints,
  getComplaintById,
  assignStaffToComplaint,
  changeStatusOfComplaint,
  deleteComplaint,
  getComplaints,
  countComplaints,
  countResolvedComplaints,
} from "../controllers/complaints.controller.js";
const router = Router();

router.route("/create-complaint").post(validateUser, createComplaint);
router.route("/get-user-complaints").get(validateUser, getUserComplaints);
router.route("/get-complaint/:complaintId").get(validateUser, getComplaintById);
router
  .route("/assign-staff-to-complaint")
  .put(validateUser, validateAdmin, assignStaffToComplaint);

router
  .route("/change-status")
  .put(validateUser, validateStaff, changeStatusOfComplaint);

router.route("/delete-complaint").delete(validateUser, deleteComplaint);
router.route("/get-complaints").get(validateUser, getComplaints);
router.route("/count-complaints").get(validateUser, countComplaints);
router.route("/count-resolved-complaints").get(validateUser, countResolvedComplaints);
export default router;

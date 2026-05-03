import express from "express";
import { requireAuth } from "@clerk/express";
import {
  addCourse,
  updateRoleToEductor,
  getAllCourses,
  getDashboardData,
  getEnrolledStudents,
  toggleCoursePublish,
  getCourseForEdit,
  updateCourse,
} from "../controllers/educatorController.js";
import upload from "../configs/multer.js";
import protectEducator from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/update-role", updateRoleToEductor);

router.post(
  "/add-course",
  upload.single("courseImage"),
  protectEducator,
  addCourse,
);

router.get("/course/:courseId", protectEducator, getCourseForEdit);
router.put(
  "/course/:courseId",
  upload.single("courseImage"),
  protectEducator,
  updateCourse,
);

router.get("/courses", protectEducator, getAllCourses);

router.patch(
  "/course/:courseId/toggle-publish",
  requireAuth(),
  toggleCoursePublish,
);

router.get("/enrolled-students", protectEducator, getEnrolledStudents);

router.get("/dashboard-data", protectEducator, getDashboardData);

export default router;

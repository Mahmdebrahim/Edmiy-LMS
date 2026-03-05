import express from "express";
import { requireAuth } from "@clerk/express";
import {
  addCourse,
  updateRoleToEductor,
  getAllCourses,
  getDashboardData,
  getEnrolledStudents,
} from "../controllers/educatorController.js";
import upload from "../configs/multer.js";
import protectEducator from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/update-role",updateRoleToEductor);

router.post("/add-course", upload.single("courseImage"), protectEducator, addCourse);

router.get("/courses", protectEducator, getAllCourses);

router.get("/enrolled-students", protectEducator, getEnrolledStudents);

router.get("/dashboard-data", protectEducator, getDashboardData);

export default router;

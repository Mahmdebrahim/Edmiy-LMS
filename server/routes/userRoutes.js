import express from "express";

const router = express.Router();

import {
  getEnrolledCourses,
  getUserProfile,
  purchaseCourse,
  getCourseProgress,
  updateCourseProgress,
  addRating
} from "../controllers/userController.js";

router.get("/profile", getUserProfile);
router.get("/enrolled-courses", getEnrolledCourses);
router.post("/purchase-course", purchaseCourse);
router.post("/update-progress", updateCourseProgress);
router.post("/course-progress", getCourseProgress);
router.post("/add-rating", addRating);

export default router;

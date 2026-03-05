import express from "express";

const router = express.Router();

import {getEnrolledCourses,getUserProfile,purchaseCourse} from "../controllers/userController.js";

router.get("/profile", getUserProfile);
router.get("/enrolled-courses", getEnrolledCourses);
router.post("/purchase-course", purchaseCourse);
export default router;
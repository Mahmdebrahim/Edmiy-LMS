import express from "express";

const router = express.Router();

import {getAllCourses,getCourseById} from "../controllers/courseController.js";

router.get("/all", getAllCourses);
router.get("/:courseId", getCourseById);

export default router;
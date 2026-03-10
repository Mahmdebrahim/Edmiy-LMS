// routes/reviewRoutes.js
import express from "express";
import {
  addReview,
  getCourseReviews,
  editReview,
  deleteReview,
  getUserReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/add", addReview); // POST /api/review/add
router.get("/course/:courseId", getCourseReviews); // GET  /api/review/course/:courseId
router.get("/user/:courseId", getUserReview); // GET  /api/review/user/:courseId
router.put("/edit/:reviewId", editReview); // PUT  /api/review/edit/:reviewId
router.delete("/delete/:reviewId", deleteReview); // DELETE /api/review/delete/:reviewId

export default router;

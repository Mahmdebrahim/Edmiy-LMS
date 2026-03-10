import express from "express";

const router = express.Router();

import {
  getEnrolledCourses,
  getUserProfile,
  purchaseCourse,
  getCourseProgress,
  updateCourseProgress,
  getAllProgress,
  addRating,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getCart,
  addToCart,
  removeFromCart,
  checkoutCart,
} from "../controllers/userController.js";

router.get("/profile", getUserProfile);
router.get("/enrolled-courses", getEnrolledCourses);
router.post("/purchase-course", purchaseCourse);
router.post("/update-progress", updateCourseProgress);
router.get("/course-progress", getCourseProgress);
router.get("/all-progress", getAllProgress);
router.post("/add-rating", addRating);
router.post("/wishlist/add", addToWishlist);
router.post("/wishlist/remove", removeFromWishlist);
router.get("/wishlist", getWishlist);
router.get("/cart", getCart);
router.post("/cart/add", addToCart);
router.post("/cart/remove", removeFromCart);
router.post("/cart/checkout", checkoutCart);
export default router;

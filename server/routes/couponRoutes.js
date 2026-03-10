import express from "express";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import {
  createCoupon,
  validateCoupon,
  getEducatorCoupons,
  toggleCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";

const router = express.Router();

router.post("/validate", requireAuth(), validateCoupon); // Student
router.post("/create", requireAuth(), createCoupon); // Educator
router.get("/educator", requireAuth(), getEducatorCoupons); // Educator
router.patch("/toggle/:couponId", requireAuth(), toggleCoupon); // Educator
router.delete("/delete/:couponId", requireAuth(), deleteCoupon); // Educator

export default router;

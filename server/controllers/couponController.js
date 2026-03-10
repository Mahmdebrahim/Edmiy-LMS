import Coupon from "../models/Coupon.js";
import Course from "../models/Course.js";

// Educator creates coupon
export const createCoupon = async (req, res) => {
  try {
    const { code, courseId, discount, maxUses, expiresAt } = req.body;
    const educatorId = req.auth.userId;

    // Verify educator owns the course
    const course = await Course.findById(courseId);
    if (!course)
      return res.json({ success: false, message: "Course not found" });
    if (course.courseEducator !== educatorId)
      return res.json({ success: false, message: "Not authorized" });

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing)
      return res.json({
        success: false,
        message: "Coupon code already exists",
      });

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      courseId,
      educatorId,
      discount,
      maxUses,
      expiresAt: new Date(expiresAt),
    });

    res.json({ success: true, coupon });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Validate coupon (student applies it)
export const validateCoupon = async (req, res) => {
  try {
    const { code, courseId } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon)
      return res.json({ success: false, message: "Invalid coupon code" });
    if (!coupon.isActive)
      return res.json({
        success: false,
        message: "Coupon is no longer active",
      });
    if (coupon.courseId.toString() !== courseId)
      return res.json({
        success: false,
        message: "Coupon not valid for this course",
      });
    if (coupon.usedCount >= coupon.maxUses)
      return res.json({
        success: false,
        message: "Coupon has reached its usage limit",
      });
    if (new Date() > coupon.expiresAt)
      return res.json({ success: false, message: "Coupon has expired" });

    res.json({
      success: true,
      discount: coupon.discount,
      couponId: coupon._id,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get educator's coupons
export const getEducatorCoupons = async (req, res) => {
  try {
    const educatorId = req.auth.userId;
    const coupons = await Coupon.find({ educatorId }).populate(
      "courseId",
      "courseTitle",
    );
    res.json({ success: true, coupons });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Toggle coupon active/inactive
export const toggleCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const educatorId = req.auth.userId;

    const coupon = await Coupon.findById(couponId);
    if (!coupon)
      return res.json({ success: false, message: "Coupon not found" });
    if (coupon.educatorId !== educatorId)
      return res.json({ success: false, message: "Not authorized" });

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({ success: true, isActive: coupon.isActive });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const educatorId = req.auth.userId;

    const coupon = await Coupon.findById(couponId);
    if (!coupon)
      return res.json({ success: false, message: "Coupon not found" });
    if (coupon.educatorId !== educatorId)
      return res.json({ success: false, message: "Not authorized" });

    await coupon.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

import { CourseProgress } from "../models/CourseProgress.js";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Course from "../models/Course.js";
import Stripe from "stripe";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";
//* Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};

//* Get Enrrolled Courses for a User With Lecture Links
const getEnrolledCourses = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const user = await User.findById(userId).populate("enrolledCourses");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({ success: true, enrolledCourses: user.enrolledCourses });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch enrolled courses",
      error: error.message,
    });
  }
};

//* Purchase Course
const purchaseCourse = async (req, res) => {
  try {
    const { courseId, couponCode } = req.body;
    const { userId } = req.auth();
    const { origin } = req.headers;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Base price after course discount
    let finalPrice = parseFloat(
      (
        course.coursePrice -
        (course.coursePrice * course.discount) / 100
      ).toFixed(2),
    );

    let appliedCoupon = null;

    // Validate and apply coupon
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

      if (!coupon)
        return res.json({ success: false, message: "Invalid coupon code" });
      if (!coupon.isActive)
        return res.json({ success: false, message: "Coupon is inactive" });
      if (coupon.courseId.toString() !== courseId)
        return res.json({
          success: false,
          message: "Coupon not valid for this course",
        });
      if (coupon.usedCount >= coupon.maxUses)
        return res.json({
          success: false,
          message: "Coupon usage limit reached",
        });
      if (new Date() > coupon.expiresAt)
        return res.json({ success: false, message: "Coupon has expired" });

      // Apply coupon discount on top of course discount
      finalPrice = parseFloat(
        (finalPrice - (finalPrice * coupon.discount) / 100).toFixed(2),
      );
      appliedCoupon = coupon;
    }

    const purchase = new Purchase({
      userId,
      courseId,
      amount: finalPrice,
    });
    await purchase.save();

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = process.env.CURRENCY?.toLowerCase() || "usd";

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: course.courseTitle },
            unit_amount: Math.floor(finalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/my-enrollments`,
      cancel_url: `${origin}/course/${courseId}`,
      metadata: {
        purchaseId: purchase._id.toString(),
        couponId: appliedCoupon?._id?.toString() || "",
      },
    });

    res.status(200).json({ success: true, checkoutUrl: session.url });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to purchase course", error: error.message });
  }
};

//* Update Your Course Progress (Optional, Can Be Used to Track Which Lectures User Has Watched)
const updateCourseProgress = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { courseId, lectureId } = req.body;

    let courseProgress = await CourseProgress.findOne({ userId, courseId });

    if (!courseProgress) {
      courseProgress = new CourseProgress({
        userId,
        courseId,
        lectureCompleted: [lectureId],
      });
    }

    if (!courseProgress.lectureCompleted.includes(lectureId)) {
      courseProgress.lectureCompleted.push(lectureId);
    }

    await courseProgress.save();
    res.status(200).json({ success: true, message: "Progress Updated" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update course progress",
      error: error.message,
    });
  }
};

//* Get User Course Progress
const getCourseProgress = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { courseId } = req.query;

    const courseProgress = await CourseProgress.findOne({ userId, courseId });
    if (!courseProgress) {
      return res.status(404).json({ message: "Course progress not found" });
    }

    res.status(200).json({ success: true, courseProgress });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch course progress",
      error: error.message,
    });
  }
};

//* Get All Progress (For Educator Dashboard)
const getAllProgress = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const progressList = await CourseProgress.find({ userId });
    res.status(200).json({ success: true, progressList });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch progress", error: error.message });
  }
};

//* Add Rating and Review Logic Here (Optional)
const addRating = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { courseId, rating, comment } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const user = await User.findById(userId);
    if (!user.enrolledCourses.includes(courseId)) {
      return res
        .status(403)
        .json({ message: "You must enroll in the course to rate it" });
    }
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const existingRating = course.courseRatings.find(
      (r) => r.userId === userId,
    );
    if (existingRating) {
      existingRating.rating = rating;
      existingRating.comment = comment;
    } else {
      course.courseRatings.push({ userId, rating, comment });
    }

    await course.save();
    res.status(200).json({ success: true, message: "Rating added" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add rating", error: error.message });
  }
};

//* Add to Wishlist
const addToWishlist = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { courseId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.wishlist.includes(courseId)) {
      return res
        .status(200)
        .json({ success: true, message: "Already in wishlist" });
    }

    user.wishlist.push(courseId);
    await user.save();

    res.status(200).json({ success: true, message: "Added to wishlist" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add to wishlist", error: error.message });
  }
};

//* Remove from Wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { courseId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wishlist = user.wishlist.filter((id) => id.toString() !== courseId);
    await user.save();

    res.status(200).json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to remove from wishlist",
        error: error.message,
      });
  }
};

//* Get Wishlist
const getWishlist = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const user = await User.findById(userId).populate({
      path: "wishlist",
      populate: { path: "courseEducator", select: "name imageUrl" },
    }
      
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch wishlist", error: error.message });
  }
};

// Get Cart
const getCart = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: { path: "courseEducator", select: "name imageUrl" },
    });
    res.status(200).json({ success: true, items: cart?.items || [] });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch cart", error: error.message });
  }
};

// Add to Cart
const addToCart = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { courseId } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if already enrolled
    const user = await User.findById(userId);
    if (user.enrolledCourses.includes(courseId)) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [courseId] });
    } else {
      if (cart.items.includes(courseId)) {
        return res.status(400).json({ message: "Already in cart" });
      }
      cart.items.push(courseId);
    }

    await cart.save();
    res.status(200).json({ success: true, message: "Added to cart" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add to cart", error: error.message });
  }
};

// Remove from Cart
const removeFromCart = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { courseId } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((id) => id.toString() !== courseId);
    await cart.save();

    res.status(200).json({ success: true, message: "Removed from cart" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to remove from cart", error: error.message });
  }
};

// Checkout Cart — purchase all items
const checkoutCart = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { origin } = req.headers;
    // coupons = { courseId: "COUPONCODE", courseId2: "CODE2" }
    const { coupons = {} } = req.body;

    const cart = await Cart.findOne({ userId }).populate("items");
    if (!cart || cart.items.length === 0)
      return res.json({ success: false, message: "Cart is empty" });

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = process.env.CURRENCY?.toLowerCase() || "usd";

    const purchaseIds = [];
    const couponIds = [];
    const line_items = [];

    await Promise.all(
      cart.items.map(async (course) => {
        let finalPrice = parseFloat(
          (
            course.coursePrice -
            (course.coursePrice * course.discount) / 100
          ).toFixed(2),
        );

        let appliedCoupon = null;
        const couponCode = coupons[course._id.toString()];

        if (couponCode) {
          const coupon = await Coupon.findOne({
            code: couponCode.toUpperCase(),
          });
          if (
            coupon &&
            coupon.isActive &&
            coupon.courseId.toString() === course._id.toString() &&
            coupon.usedCount < coupon.maxUses &&
            new Date() <= coupon.expiresAt
          ) {
            finalPrice = parseFloat(
              (finalPrice - (finalPrice * coupon.discount) / 100).toFixed(2),
            );
            appliedCoupon = coupon;
          }
        }

        const purchase = await Purchase.create({
          userId,
          courseId: course._id,
          amount: finalPrice,
        });
        purchaseIds.push(purchase._id.toString());
        couponIds.push(appliedCoupon?._id?.toString() || "");

        line_items.push({
          price_data: {
            currency,
            product_data: { name: course.courseTitle },
            unit_amount: Math.floor(finalPrice * 100),
          },
          quantity: 1,
        });
      }),
    );

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${origin}/my-enrollments`,
      cancel_url: `${origin}/cart`,
      metadata: {
        purchaseIds: purchaseIds.join(","),
        couponIds: couponIds.join(","), // parallel array مع purchaseIds
        cartId: cart._id.toString(),
      },
    });

    res.json({ success: true, checkoutUrl: session.url });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
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
};

import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Course from "../models/Course.js";
import Stripe from "stripe";
// Get User Profile
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

// Get Enrrolled Courses for a User With Lecture Links
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

// Purchase Course
const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { userId } = await req.auth();
    const { origin } = req.headers;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const purchase = new Purchase({
      userId,
      courseId,
      amount: (
        course.coursePrice -
        (course.coursePrice * course.discount) / 100
      ).toFixed(2),
    });
    await purchase.save();

    // Sripe Payment Logic Here (Create Checkout Session and Return URL)
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = process.env.CURRENCY.toLocaleLowerCase() || "usd";

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: course.courseTitle,
            },
            unit_amount: Math.floor(purchase.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/my-enrollments`,
      cancel_url: `${origin}/`,
      metadata: {
        purchaseId: purchase._id.toString(),
      },
    });
    res.status(200).json({ success: true, checkoutUrl: session.url });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to purchase course", error: error.message });
  }
};

export { getUserProfile, getEnrolledCourses, purchaseCourse };

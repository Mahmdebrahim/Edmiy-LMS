// controllers/reviewController.js
import Review from "../models/Review.js";
import Course from "../models/Course.js";

// Add Review
const addReview = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { courseId, rating, comment } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (!course.enrolledStudents.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You must be enrolled to review this course" });
    }

    const existing = await Review.findOne({ courseId, userId });
    if (existing)
      return res
        .status(400)
        .json({ message: "You already reviewed this course" });

    const review = await Review.create({ courseId, userId, rating, comment });

    res.status(201).json({ success: true, review });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add review", error: error.message });
  }
};

// Get Reviews for a Course
const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 5 } = req.query;

    const total = await Review.countDocuments({ courseId });
    const reviews = await Review.find({ courseId })
      .populate({ path: "userId", select: "name imageUrl" })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      reviews,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch reviews", error: error.message });
  }
};

// Edit Review
const editReview = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.userId !== userId)
      return res.status(403).json({ message: "Not authorized" });

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;
    await review.save();

    res.status(200).json({ success: true, review });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to edit review", error: error.message });
  }
};

// Delete Review
const deleteReview = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.userId !== userId)
      return res.status(403).json({ message: "Not authorized" });

    await review.deleteOne();
    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete review", error: error.message });
  }
};

// Get User's Review for a Course
const getUserReview = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { courseId } = req.params;

    const review = await Review.findOne({ courseId, userId });
    res.status(200).json({ success: true, review: review || null });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch review", error: error.message });
  }
};

export { addReview, getCourseReviews, editReview, deleteReview, getUserReview };

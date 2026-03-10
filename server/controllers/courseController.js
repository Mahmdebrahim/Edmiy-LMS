import Course from "../models/Course.js";
import Review from "../models/Review.js";

// Get All Courses
const getAllCourses = async (req, res) => {
  try {
    const {
      search,
      minPrice,
      maxPrice,
      sort,
      minRating,
      page = 1,
      limit = 8,
    } = req.query;

    const filter = { isPublished: true };
    if (search) filter.courseTitle = { $regex: search, $options: "i" };
    if (minPrice || maxPrice) {
      filter.coursePrice = {};
      if (minPrice) filter.coursePrice.$gte = Number(minPrice);
      if (maxPrice) filter.coursePrice.$lte = Number(maxPrice);
    }

    let sortOption = {};
    if (sort === "price-asc") sortOption = { coursePrice: 1 };
    else if (sort === "price-desc") sortOption = { coursePrice: -1 };
    else if (sort === "newest") sortOption = { createdAt: -1 };
    else if (sort === "popular") sortOption = { enrolledStudents: -1 };

    let courses = await Course.find(filter)
      .sort(sortOption)
      .populate({ path: "courseEducator", select: "name imageUrl" });

    const coursesWithRating = await Promise.all(
      courses.map(async (course) => {
        const reviews = await Review.find({ courseId: course._id });
        const avgRating = reviews.length
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;
        return {
          ...course.toObject(),
          avgRating,
          totalReviews: reviews.length,
        };
      }),
    );

    let filtered = coursesWithRating;
    if (minRating) {
      filtered = coursesWithRating.filter(
        (course) => course.avgRating >= Number(minRating),
      );
    }

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / Number(limit));
    const paginated = filtered.slice(
      (Number(page) - 1) * Number(limit),
      Number(page) * Number(limit),
    );

    res.status(200).json({
      success: true,
      courses: paginated,
      total,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch courses", error: error.message });
  }
};

// Get Course By ID
const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate({
      path: "courseEducator",
      select: "name imageUrl",
    });

    if (!course) return res.status(404).json({ message: "Course not found" });

    const reviews = await Review.find({ courseId });
    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.status(200).json({
      success: true,
      course: { ...course.toObject(), avgRating, totalReviews: reviews.length },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch course", error: error.message });
  }
};

export { getAllCourses, getCourseById };

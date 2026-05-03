import { clerkClient } from "@clerk/express";
import Course from "../models/Course.js";
import Purchase from "../models/Purchase.js";
import Review from "../models/Review.js";
import User from "../models/User.js";

import { cloudinary } from "../configs/cloudinary.js";

// Update Role to Educator
const updateRoleToEductor = async (req, res) => {
  try {
    const { userId } = await req.auth();

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role: "educator" },
    });

    res
      .status(200)
      .json({
        success: "true",
        message: "Role updated to educator successfully",
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update role", error: error.message });
  }
};

// Add New Course
const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.file;
    const { userId } = await req.auth();

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!imageFile) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const imageResponse = await cloudinary.uploader.upload(imageFile.path);

    const parsedCourseData = JSON.parse(courseData);
    parsedCourseData.courseThumbnail = imageResponse.secure_url;
    parsedCourseData.courseEducator = userId;

    const newCourse = new Course(parsedCourseData);
    await newCourse.save();

    res
      .status(201)
      .json({ message: "Course added successfully", course: newCourse });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add course", error: error.message });
  }
};

// Get single course for editing
export const getCourseForEdit = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.auth();

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.courseEducator !== userId)
      return res.status(403).json({ message: "Not authorized" });

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.auth();
    const { courseData } = req.body;
    const imageFile = req.file;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.courseEducator !== userId)
      return res.status(403).json({ message: "Not authorized" });

    const parsedData = JSON.parse(courseData);

    if (imageFile) {
      const imageResponse = await cloudinary.uploader.upload(imageFile.path);
      parsedData.courseThumbnail = imageResponse.secure_url;
    }

    // update 
    Object.assign(course, parsedData);
    await course.save();

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Educator Courses
const getAllCourses = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const courses = await Course.find({ courseEducator: userId });
    res.status(200).json({ success: true, courses });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch courses", error: error.message });
  }
};

// Toggle course published status
const toggleCoursePublish = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.auth();

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.courseEducator !== userId)
      return res.status(403).json({ message: "Not authorized" });

    course.isPublished = !course.isPublished;
    await course.save();

    res.json({ success: true, isPublished: course.isPublished });
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle course", error: error.message });
  }
};

// Get Dashboard Data — MongoDB Aggregation Pipeline (optimized)
const getDashboardData = async (req, res) => {
  try {
    const { userId } = req.auth();

    // 1. Lightweight course fetch (only fields we need)
    const courses = await Course.find(
      { courseEducator: userId },
      { courseTitle: 1, isPublished: 1 },
    ).lean();
    const courseIds = courses.map((c) => c._id);

    const emptyRatingDist = [1, 2, 3, 4, 5].map((s) => ({
      rating: `${s} Star`,
      count: 0,
    }));

    if (courseIds.length === 0) {
      return res.json({
        success: true,
        data: {
          totalRevenue: 0,
          totalStudents: 0,
          totalCourses: 0,
          publishedCourses: 0,
          avgRating: 0,
          totalReviews: 0,
          revenueGrowth: 0,
          studentsGrowth: 0,
          thisMonthRevenue: 0,
          thisMonthStudents: 0,
          monthlyRevenue: [],
          monthlyStudents: [],
          coursesSales: [],
          ratingDistribution: emptyRatingDist,
          recentEnrollments: [],
        },
      });
    }

    // Date boundaries
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // 2. Run all 3 queries in parallel using Promise.all
    const [purchaseStats, reviewStats, recentEnrollments] = await Promise.all([
      // ── Purchase Aggregation (single DB pass with $facet) ──
      Purchase.aggregate([
        { $match: { courseId: { $in: courseIds }, status: "completed" } },
        {
          $facet: {
            totals: [
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: "$amount" },
                  uniqueStudents: { $addToSet: "$userId" },
                },
              },
              {
                $project: {
                  _id: 0,
                  totalRevenue: { $round: ["$totalRevenue", 2] },
                  totalStudents: { $size: "$uniqueStudents" },
                },
              },
            ],
            thisMonth: [
              { $match: { createdAt: { $gte: startOfThisMonth } } },
              {
                $group: {
                  _id: null,
                  revenue: { $sum: "$amount" },
                  students: { $addToSet: "$userId" },
                },
              },
              {
                $project: {
                  _id: 0,
                  revenue: { $round: ["$revenue", 2] },
                  students: { $size: "$students" },
                },
              },
            ],
            lastMonth: [
              {
                $match: {
                  createdAt: {
                    $gte: startOfLastMonth,
                    $lt: startOfThisMonth,
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  revenue: { $sum: "$amount" },
                  students: { $addToSet: "$userId" },
                },
              },
              {
                $project: {
                  _id: 0,
                  revenue: { $round: ["$revenue", 2] },
                  students: { $size: "$students" },
                },
              },
            ],
            monthly: [
              { $match: { createdAt: { $gte: sixMonthsAgo } } },
              {
                $group: {
                  _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                  },
                  revenue: { $sum: "$amount" },
                  students: { $addToSet: "$userId" },
                },
              },
              {
                $project: {
                  revenue: { $round: ["$revenue", 2] },
                  students: { $size: "$students" },
                },
              },
              { $sort: { "_id.year": 1, "_id.month": 1 } },
            ],
            byCourse: [
              {
                $group: {
                  _id: "$courseId",
                  revenue: { $sum: "$amount" },
                  students: { $addToSet: "$userId" },
                },
              },
              {
                $project: {
                  revenue: { $round: ["$revenue", 2] },
                  students: { $size: "$students" },
                },
              },
              { $sort: { revenue: -1 } },
              { $limit: 5 },
            ],
          },
        },
      ]),

      // ── Review Aggregation (single DB pass) ──
      Review.aggregate([
        { $match: { courseId: { $in: courseIds } } },
        {
          $facet: {
            summary: [
              {
                $group: {
                  _id: null,
                  avgRating: { $avg: "$rating" },
                  totalReviews: { $sum: 1 },
                },
              },
            ],
            distribution: [
              { $group: { _id: "$rating", count: { $sum: 1 } } },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ]),

      // ── Recent Enrollments (needs populate, so regular query) ──
      Purchase.find({ courseId: { $in: courseIds }, status: "completed" })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("userId", "name imageUrl")
        .populate("courseId", "courseTitle")
        .lean(),
    ]);

    // 3. Extract & format results (O(1) — no loops over raw data)
    const pData = purchaseStats[0];
    const totals = pData.totals[0] || {
      totalRevenue: 0,
      totalStudents: 0,
    };
    const thisMonth = pData.thisMonth[0] || { revenue: 0, students: 0 };
    const lastMonth = pData.lastMonth[0] || { revenue: 0, students: 0 };

    // Growth %
    const revenueGrowth =
      lastMonth.revenue > 0
        ? parseFloat(
            (
              ((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) *
              100
            ).toFixed(1),
          )
        : thisMonth.revenue > 0
          ? 100
          : 0;

    const studentsGrowth =
      lastMonth.students > 0
        ? parseFloat(
            (
              ((thisMonth.students - lastMonth.students) /
                lastMonth.students) *
              100
            ).toFixed(1),
          )
        : thisMonth.students > 0
          ? 100
          : 0;

    // Fill 6-month chart data (aggregation only returns months with data)
    const monthlyMap = new Map();
    pData.monthly.forEach((m) =>
      monthlyMap.set(`${m._id.year}-${m._id.month}`, m),
    );

    const monthlyRevenue = [];
    const monthlyStudents = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const mData = monthlyMap.get(key);
      const label = d.toLocaleString("en", { month: "short" });
      monthlyRevenue.push({ month: label, revenue: mData?.revenue || 0 });
      monthlyStudents.push({ month: label, students: mData?.students || 0 });
    }

    // Map course IDs → titles for top courses chart
    const courseMap = new Map(
      courses.map((c) => [c._id.toString(), c.courseTitle]),
    );
    const coursesSales = pData.byCourse.map((c) => {
      const title = courseMap.get(c._id.toString()) || "Unknown";
      return {
        name: title.length > 20 ? title.slice(0, 20) + "..." : title,
        students: c.students,
        revenue: c.revenue,
      };
    });

    // Rating distribution (fill missing stars with 0)
    const rData = reviewStats[0];
    const reviewSummary = rData.summary[0] || {
      avgRating: 0,
      totalReviews: 0,
    };
    const distMap = new Map(
      rData.distribution.map((d) => [d._id, d.count]),
    );
    const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
      rating: `${star} Star`,
      count: distMap.get(star) || 0,
    }));

    // Format recent enrollments
    const formattedEnrollments = recentEnrollments.map((p) => ({
      student: p.userId,
      courseTitle: p.courseId?.courseTitle || "Deleted Course",
      amount: p.amount,
      date: p.createdAt,
    }));

    const publishedCourses = courses.filter((c) => c.isPublished).length;

    res.json({
      success: true,
      data: {
        totalRevenue: totals.totalRevenue,
        totalStudents: totals.totalStudents,
        totalCourses: courses.length,
        publishedCourses,
        avgRating: parseFloat((reviewSummary.avgRating || 0).toFixed(1)),
        totalReviews: reviewSummary.totalReviews,
        revenueGrowth,
        studentsGrowth,
        thisMonthRevenue: thisMonth.revenue,
        thisMonthStudents: thisMonth.students,
        monthlyRevenue,
        monthlyStudents,
        coursesSales,
        ratingDistribution,
        recentEnrollments: formattedEnrollments,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

// Get Enrolled Students for a Course With Purchases Data
const getEnrolledStudents = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const courses = await Course.find({ courseEducator: userId }).populate(
      "enrolledStudents",
      "name email imageUrl",
    );

    const courseIds = courses.map((course) => course._id);

    if (courseIds.length === 0) {
      return res.status(200).json({ success: true, enrolledStudents: [], uniqueStudents: [] });
    }

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl")
      .populate("courseId", "courseTitle");

    const enrolledStudents = purchases.map((purchase) => ({
      student: purchase.userId,
      courseTitle: purchase.courseId.courseTitle,
      purchaseDate: purchase.createdAt,
    }));

    const uniqueStudentsMap = new Map();
    enrolledStudents.forEach((enrollment) => {
      const studentId = enrollment.student?._id;
      if (!studentId) return;

      const idString = studentId.toString();
      if (!uniqueStudentsMap.has(idString)) {
        uniqueStudentsMap.set(idString, {
          student: enrollment.student,
          coursesCount: 1,
          firstEnrollment: enrollment.purchaseDate,
        });
      } else {
        const existing = uniqueStudentsMap.get(idString);
        existing.coursesCount += 1;
        if (new Date(enrollment.purchaseDate) < new Date(existing.firstEnrollment)) {
          existing.firstEnrollment = enrollment.purchaseDate;
        }
      }
    });

    const uniqueStudents = Array.from(uniqueStudentsMap.values());

    res.json({ success: true, enrolledStudents, uniqueStudents });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch enrolled students",
      error: error.message,
    });
  }
};

export {
  updateRoleToEductor,
  addCourse,
  getAllCourses,
  getDashboardData,
  getEnrolledStudents,
  toggleCoursePublish,
};

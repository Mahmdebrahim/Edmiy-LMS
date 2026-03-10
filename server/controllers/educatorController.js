import { clerkClient } from "@clerk/express";
import Course from "../models/Course.js";
import Purchase from "../models/Purchase.js";
// import User from "../models/User.js";

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

// Get Dashboard Data (e.g., total courses, total students, etc.)
const getDashboardData = async (req, res) => {
  try {
    const { userId } = await req.auth();

    const courses = await Course.find({ courseEducator: userId });
    const courseIds = courses.map((course) => course._id);

    const totalCourses = courses.length;

    // Calculate total earnings from purchases
    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    });

    const totalEarnings = purchases.reduce(
      (sum, purchase) => sum + purchase.amount,
      0,
    );

    // Get total students enrolled in the educator's courses
    const enrolledStudents = [];
    for (const courseId of courseIds) {
      const course =
        await Course.findById(courseId).populate("enrolledStudents");
      enrolledStudents.push(...course.enrolledStudents);
    }
    const totalStudents = new Set(enrolledStudents).size;

    res.status(200).json({
      success: true,
      dashboardData: {
        totalCourses,
        totalEarnings,
        enrolledStudents,
        totalStudents,
      },
    });
  } catch (error) {
    res.status(500).json({
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
      return res.status(200).json({ success: true, students: [] });
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
    res.json({ success: true, enrolledStudents });
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
};

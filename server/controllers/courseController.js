import Course from "../models/Course.js";

// Get All Courses
const getAllCourses = async (req, res) => {
    console.log("[getAllCourses] Request received");
    console.log("req.user →", req.user); 
    console.log("req.userId / req.auth →", req.userId || req.auth);
  try {
    const courses = await Course.find({ isPublished: true })
      .select(["-courseContent", "-enrolledStudents"])
      .populate({ path: "courseEducator", select: "name imageUrl" });
    res.status(200).json({ success: true, courses });
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
    const course = await Course.findById(courseId).populate(
      "courseEducator",
      "name imageUrl",
    );
    // Remove Course if IsPreviewFree is False and User is Not Enrolled
    course.courseContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        if (!lecture.isPreviewFree) {
          lecture.lectureUrl = "";
        }
      });
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json({ success: true, course });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch course", error: error.message });
  }
};

export { getAllCourses, getCourseById };


import { createContext, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import humanizeDuration from "humanize-duration";
import useCustomQuery from "../hooks/useCustomQuery.js";
import axiosInstance from "../config/axios.config.js";
import { toast } from "react-toastify";
import { useEffect } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user } = useUser();
  const [isEducator, setIsEducator] = useState(false);
  const [userData, setUserData] = useState(null);

  // all courses data for both students and educators
  const { data: coursesData, isLoading: coursesLoading } = useCustomQuery({
    queryKey: ["courses"],
    URL: "/api/course/all",
  });
  const allCourses = coursesData?.courses || [];

  // enrolled courses data for students
  const { data: enrolledCoursesData } = useCustomQuery({
    queryKey: ["enrolledCourses"],
    URL: "/api/user/enrolled-courses",
    config: {},
    options: { enabled: !!user }, // ✅ استنى لحد ما user يكون موجود
  });
  const enrolledCourses = enrolledCoursesData?.enrolledCourses.reverse() || [];

  // cart data for students
  const { data: cartData } = useCustomQuery({
    queryKey: ["cart"],
    URL: "/api/user/cart",
    options: { enabled: !!user },
  });
  const cartItems = cartData?.items || [];

  const fetchUserData = async () => {
    try {
      const { data } = await axiosInstance.get("/api/user/profile");
      setIsEducator(user.publicMetadata.role === "educator");
      if (data.success) {
        setUserData(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  //helper functions
  const calcAvgRatin = (course) => {
    if (!course.courseRatings?.length) return 0;
    let totalRate = 0;
    course.courseRatings.forEach((rating) => (totalRate += rating.rating));
    return Math.round((totalRate / course.courseRatings.length) * 10) / 10;
  };

  const calcChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent?.map((lec) => (time += lec.lectureDuration || 0));
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calcCourseDuration = (course) => {
    let time = 0;
    course.courseContent?.map((ch) =>
      ch.chapterContent?.map((lec) => (time += lec.lectureDuration || 0)),
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calcLecTime = (lecTime) => {
    return humanizeDuration(lecTime * 60 * 1000, { units: ["h", "m"] });
  };

  const calcLecturesNo = (course) => {
    let totalLectures = 0;
    course.courseContent?.forEach(
      (ch) => (totalLectures += ch.chapterContent?.length || 0),
    );
    return totalLectures;
  };

  const logToken = async () => {
    const token = await window.Clerk?.session?.getToken({
      template: "long-lived",
    });
    console.log("Clerk Token:", token);
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
      logToken();
    }
  }, [user]);

  const value = {
    allCourses,
    coursesLoading,
    calcAvgRatin,
    calcChapterTime,
    calcCourseDuration,
    calcLecturesNo,
    calcLecTime,
    isEducator,
    setIsEducator,
    userData,
    enrolledCourses,
    cartItems,
    currency: import.meta.env.VITE_CURRENCY || "$",
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

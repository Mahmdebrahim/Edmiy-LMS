import { createContext, useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import humanizeDuration from "humanize-duration";
import useCustomQuery from "../hooks/useCustomQuery.js";
import axiosInstance from "../config/axios.config.js";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user } = useUser();
  const { isLoaded: authLoaded } = useAuth();
  const [isEducator, setIsEducator] = useState(false);
  const [userData, setUserData] = useState(null);

  const { data: coursesData, isLoading: coursesLoading } = useCustomQuery({
    queryKey: ["courses"],
    URL: "/api/course/all",
  });
  const allCourses = coursesData?.courses || [];

  const { data: enrolledCoursesData, isLoading: enrolledCoursesLoading } = useCustomQuery({
    queryKey: ["enrolledCourses"],
    URL: "/api/user/enrolled-courses",
    options: {
      enabled: !!user && authLoaded,
    },
  });
  const enrolledCourses = enrolledCoursesData?.enrolledCourses?.reverse() || [];



  


  const { data: cartData } = useCustomQuery({
    queryKey: ["cart"],
    URL: "/api/user/cart",
    options: {
      enabled: !!user && authLoaded,
    },
  });
  const cartItems = cartData?.items || [];

  const fetchUserData = async () => {
    try {
      const { data } = await axiosInstance.get("/api/user/profile");
      setIsEducator(user?.publicMetadata?.role === "educator");
      if (data?.success) {
        setUserData(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      if (error.response?.status !== 401) {
        toast.error("Failed to load profile");
      }
    }
  };

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
      skipCache: true,
    });
    console.log("Clerk Token:", token);
  };

  useEffect(() => {
    if (user && authLoaded) {
      fetchUserData();
      logToken();
    }
  }, [user, authLoaded]);

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
    enrolledCoursesLoading,
    cartItems,
    currency: import.meta.env.VITE_CURRENCY || "$",
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

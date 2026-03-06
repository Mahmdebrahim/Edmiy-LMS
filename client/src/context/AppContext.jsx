import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useAuth, useUser } from "@clerk/clerk-react";
import humanizeDuration from "humanize-duration";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);

  const fetchAllCourses = async () => {
    setTimeout(() => {
      setAllCourses(dummyCourses);
    }, 3000);
  };

  const calcAvgRatin = (course) => {
    if (course.courseRatings.length === 0) return 0;
    let totalRate = 0;
    course.courseRatings.forEach((rating) => (totalRate += rating.rating));
    return totalRate / course.courseRatings.length;
  };

  const calcChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.map((lec) => (time += lec.lectureDuration));
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calcCourseDuration = (course) => {
    let time = 0;
    course.courseContent.map((ch) =>
      ch.chapterContent.map((lec) => (time += lec.lectureDuration)),
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calcLecTime = (lecTime) => {
    return humanizeDuration(lecTime * 60 * 1000, { units: ["h", "m"] });
  };

  const calcLecturesNo = (course) => {
    let totalLectures = 0;
    course.courseContent.forEach(
      (ch) => (totalLectures += ch.chapterContent.length),
    );
    return totalLectures;
  };

  const updateRole = async () => {
    const token = await getToken({ template: "long-lived" });
    console.log(token);
    const res = await fetch("http://localhost:5000/api/educator/update-role", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (res.ok) {
      setIsEducator(true);
    }
    return data;
  };

  const logToken = async () => {
    const token = await getToken({ template: "long-lived" }); // ← مع template
    console.log(token);
  };

  useEffect(() => {
   logToken();
  }, [user]);

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const value = {
    allCourses,
    calcAvgRatin,
    calcChapterTime,
    calcCourseDuration,
    calcLecturesNo,
    calcLecTime,
    updateRole,
    isEducator,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

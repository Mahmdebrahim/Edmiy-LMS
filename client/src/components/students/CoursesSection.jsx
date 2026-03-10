import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import CourseCard from "./courseCard";
import CourseCardSkeleton from "../skeletons/CourseCardSkeleton";
function CoursesSection() {
  const { allCourses, coursesLoading } = useContext(AppContext);

  return (
    <div className="py-16 md:px-40 px-8">
      <h2 className="text-3xl font-semibold text-gray-800">
        Learn from the best
      </h2>
      <p className="text-sm md:text-base text-gray-500 mt-3">
        Discover our top-rated courses across various categories. From coding
        and design to
        <br /> business and wellness, our courses are crafted to deliver results
        .
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 md:px-0 md:my-16 gap-6 my-10">
        {coursesLoading
          ? Array(4)
              .fill(0)
              .map((_, i) => <CourseCardSkeleton key={i} />)
          : allCourses
              .slice(0, 4)
              .map((course, i) => <CourseCard key={i} course={course} />)}
      </div>

      <Link
        to={"/course-list"}
        onClick={() => window.scrollTo(0, 0)}
        className="text-gray-500 border border-gray-500/30 px-10 py-3 rounded block text-center max-w-xs mx-auto"
      >
        Show all courses
      </Link>
    </div>
  );
}

export default CoursesSection;

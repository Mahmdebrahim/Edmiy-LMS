import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { Rating } from "primereact/rating";

function CourseCard({ course }) {
  const { calcAvgRatin } = useContext(AppContext);

  // حساب السعر بعد الخصم
  const discountedPrice = (
    course.coursePrice -
    (course.discount * course.coursePrice) / 100
  ).toFixed(2);

  const hasDiscount = course.discount > 0;

  return (
    <Link
      to={`/course/${course._id}`}
      onClick={() => scrollTo(0, 0)}
      className="border border-gray-500/30 pb-6 overflow-hidden rounded-lg hover:shadow-lg hover:-translate-y-1.5 hover:border-blue-500 transition duration-300 group"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          className="w-full h-48 object-center group-hover:scale-105 transition-transform duration-300"
          src={course.courseThumbnail}
          alt={course.courseTitle}
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-1 right-2 z-10">
            <div className="relative">
              {/* Star Shape Background */}
              <div className="bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-2xl border-4 border-white transform -rotate-12">
                <div className="text-center">
                  <div className="text-xs font-bold">SAVE</div>
                  <div className="text-xs font-black leading-none">
                    {course.discount}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 text-left">
        {/* Title */}
        <h3 className="text-base font-semibold line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
          {course.courseTitle}
        </h3>

        {/* Educator */}
        <p className="text-gray-600 text-sm mb-2">{course.educator.name}</p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-gray-800">
            {calcAvgRatin(course).toFixed(1)}
          </span>
          <Rating
            value={calcAvgRatin(course)}
            readOnly
            cancel={false}
            pt={{
              item: { className: "p-rating-item" }, // اختياري
              onIcon: {
                className: "text-yellow-500 !text-yellow-500",
              },
              offIcon: {
                className: "text-gray-300",
              },
            }}
          />
          <span className="text-gray-400 text-xs">
            ({course.courseRatings.length})
          </span>
        </div>

        {/* Price Section */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <p className="text-xl font-bold text-gray-900">${discountedPrice}</p>

          {hasDiscount && (
            <>
              <del className="text-gray-400 text-sm">${course.coursePrice}</del>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default CourseCard;

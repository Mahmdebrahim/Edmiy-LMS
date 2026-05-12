import React from "react";
import { assets } from "../../assets/assets";
import { MoveRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BecomeInstructor = () => {
  const Navigate = useNavigate();
  return (
    <section className="py-20 px-6 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-7xl mx-auto bg-blue-500/10 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Decorative Shapes */}
        <div className="absolute top-8 right-8 opacity-20 hidden md:block">
          {/* Replicating the dot pattern from image */}
          <div className="grid grid-cols-3 gap-2">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-orange-400 rounded-full"
              ></div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-8 left-8 opacity-20 hidden md:block">
          <div className="grid grid-cols-3 gap-2">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-orange-400 rounded-full"
              ></div>
            ))}
          </div>
        </div>

        <div className="flex-1 text-center md:text-left z-10">
          <p className="text-blue-600 font-bold text-lg mb-4 tracking-wide uppercase">
            Start Your Journey
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight max-w-xl relative">
            Master New Skills with{" "}
            <span className="text-blue-600">Expert-Led</span>{" "}
            <span className="relative inline-block">
              Courses
              <img
                src={assets.sketch}
                alt=""
                className="absolute -bottom-2 left-0 w-full h-3 object-contain opacity-60"
              />
            </span>
          </h2>
          <p className="mt-6 text-gray-600 text-lg max-w-lg">
            Join thousands of learners worldwide and gain access to high-quality
            education that fits your schedule.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-6 z-10 relative">
          {/* Arrow Asset */}
          <img
            src={assets.arrow}
            alt="Arrow"
            className="hidden lg:block absolute -left-68 top-2/3 -translate-y-1/2 w-52 rotate-20 "
          />

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3"
            onClick={() => Navigate("/course-list")}
          >
            Explore All Courses
            <MoveRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default BecomeInstructor;

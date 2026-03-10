import React from "react";
import { assets } from "../../assets/assets";
import SearchBar from "../common/searchBar";
import { Star } from "lucide-react";

function Hero() {
  return (
    <div className="flex flex-col items-center justify-center w-full md:pt-36 pt-20 px-7 md:px-0 space-y-7 text-center bg-linear-to-b from-blue-300/50">
      <div className="flex items-center gap-1">
        <div className="flex  -space-x-3 pr-3">
          <img
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200"
            alt="user3"
            className="size-8 object-cover rounded-full border-2 border-white hover:-translate-y-0.5 transition z-1"
          />
          <img
            src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200"
            alt="user1"
            className="size-8 object-cover rounded-full border-2 border-white hover:-translate-y-0.5 transition z-2"
          />
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
            alt="user2"
            className="size-8 object-cover rounded-full border-2 border-white hover:-translate-y-0.5 transition z-3"
          />
          <img
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200"
            alt="user3"
            className="size-8 object-cover rounded-full border-2 border-white hover:-translate-y-0.5 transition z-4"
          />
          <img
            src="https://randomuser.me/api/portraits/men/75.jpg"
            alt="user5"
            className="size-8 rounded-full border-2 border-white hover:-translate-y-0.5 transition z-5"
          />
        </div>

        <div>
          <div className="flex ">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-star text-transparent fill-blue-600"
                  aria-hidden="true"
                >
                  <Star size={20} className="text-blue-500 fill-blue-500" />
                </svg>
              ))}
          </div>
          <p className="text-sm text-gray-700">Used by 10,000+ users</p>
        </div>
      </div>
      <h1 className="text-home-heading-small md:text-home-heading-large relative font-bold text-gray-800 max-w-3xl mx-auto">
        Elevate your skills with learning makes a real{" "}
        <span className="text-blue-600"> difference today</span>
        <img
          src={assets.sketch}
          alt="sketch underline"
          className="hidden md:block absolute -bottom-7 right-0 w-32 md:w-auto" 
        />
      </h1>

      <p className="hidden md:block text-gray-500 max-w-2xl mx-auto">
        We bring together world-class instructors, interactive content, and a
        supportive community to help you achieve your personal and professional
        goals.
      </p>

      <p className="md:hidden text-gray-500 max-w-sm mx-auto">
        We bring together world-class instructors to help you achieve your
        professional goals.
      </p>

      <SearchBar />
    </div>
  );
}

export default Hero;

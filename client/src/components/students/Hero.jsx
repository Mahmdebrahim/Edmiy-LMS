import React from "react";
import { assets } from "../../assets/assets";
import SearchBar from "../common/searchBar";

function Hero() {
  return (
    <div className="flex flex-col items-center justify-center w-full md:pt-36 pt-20 px-7 md:px-0 space-y-7 text-center bg-linear-to-b from-blue-300/50">
      <h1 className="text-home-heading-small md:text-home-heading-large relative font-bold text-gray-800 max-w-3xl mx-auto">
        Elevate your skills with learning makes a real{" "}
        <span className="text-blue-600"> difference today</span>
        <img
          src={assets.sketch}
          alt="sketch underline"
          className="hidden md:block absolute -bottom-7 right-0 w-32 md:w-auto" // أضفت w للتحكم في الحجم
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

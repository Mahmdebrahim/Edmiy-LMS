import React, { useState } from "react";
import { assets } from "../../assets/assets";
import { Quote } from "lucide-react";

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      text: "Edmiy has completely transformed the way I learn. The courses are high quality and the platform is so intuitive. The instructors are truly world-class and supportive throughout the journey.",
      name: "Sara Alexander",
      role: "Product Designer, USA",
      image: assets.profile_img_1,
      rating: 5
    },
    {
      text: "As an instructor, Edmiy gives me all the tools I need to reach students globally. The dashboard is powerful and easy to use. I've seen my student engagement grow significantly.",
      name: "Melissa Roberts",
      role: "Graphic Designer, UK",
      image: assets.profile_img_2,
      rating: 4
    },
    {
      text: "I've tried many LMS platforms, but Edmiy stands out with its clean design and excellent support. The community features are a game changer for collaborative learning.",
      name: "Ahmed Ali",
      role: "Software Developer, Egypt",
      image: assets.profile_img_3,
      rating: 5
    },
    {
      text: "The diversity of courses on Edmiy is amazing. I found exactly what I needed to advance my career and the certification process is very professional.",
      name: "Laila Hassan",
      role: "Data Scientist, UAE",
      image: assets.profile_img_1,
      rating: 5
    },
    {
      text: "Learning at my own pace has never been easier. Edmiy's mobile responsiveness is a game changer for me. I can study anywhere, anytime.",
      name: "David Smith",
      role: "Entrepreneur, Canada",
      image: assets.profile_img_2,
      rating: 4
    },
    {
      text: "The community and certificates from Edmiy have helped me land my dream job. Thank you for this amazing platform and the great instructors!",
      name: "Yasmine Gamal",
      role: "Web Developer, Germany",
      image: assets.profile_img_3,
      rating: 5
    },
  ];

  // Grouping testimonials into chunks of 2
  const testimonialChunks = [];
  for (let i = 0; i < testimonials.length; i += 2) {
    testimonialChunks.push(testimonials.slice(i, i + 2));
  }

  const renderCard = (testimonial, index) => (
    <div
      key={index}
      className="bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-4xl p-6 md:p-8 pt-10 md:pt-12 mt-10 md:mt-12 relative w-full lg:w-[calc(50%-1rem)] text-center flex flex-col items-center shrink-0"
    >
      {/* Avatar with Quote Icon */}
      <div className="absolute -top-10 md:-top-12 left-1/2 -translate-x-1/2 w-20 h-20 md:w-24 md:h-24">
        <div className="relative w-full h-full p-1 bg-white rounded-full border border-blue-100">
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="w-full h-full rounded-full object-cover"
          />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white p-1.5 rounded-full border-4 border-white shadow-sm">
            <Quote size={12} fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Decorative Arrow */}
      <img 
        src={assets.arrow} 
        alt="" 
        className="absolute top-0 right-2 w-24 md:w-32 rotate-180  md:block"
      />

      {/* Rating Stars */}
      <div className="flex gap-1 mb-6 mt-4 md:mt-8">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < testimonial.rating ? "text-orange-400 fill-orange-400" : "text-gray-200 fill-gray-200"}`}
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Feedback Text */}
      <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-8 flex-1 italic">
        "{testimonial.text}"
      </p>

      {/* User Info */}
      <div className="mt-auto">
        <p className="font-bold text-gray-900 text-lg md:text-xl mb-1">
          {testimonial.name}
        </p>
        <p className="text-blue-600 font-medium text-sm md:text-base">
          {testimonial.role}
        </p>
      </div>
    </div>
  );

  return (
    <section className="py-24 px-6 bg-blue-50/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm font-semibold mb-4 uppercase tracking-wider">
            Testimonials
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            Feedback From{" "}
            <span className="relative inline-block text-blue-600">
              Student
            </span>
          </h2>
        </div>

        {/* Slider Container */}
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {testimonialChunks.map((chunk, chunkIndex) => (
              <div key={chunkIndex} className="w-full shrink-0 flex flex-col lg:flex-row gap-8 justify-center items-stretch px-2 md:px-4">
                {chunk.map((testimonial, index) => renderCard(testimonial, index))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Pagination Dots */}
        <div className="flex justify-center gap-3 mt-12">
          {testimonialChunks.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-3 rounded-full transition-all duration-300 ${
                activeIndex === i ? "w-8 bg-blue-600" : "w-3 bg-blue-200 hover:bg-blue-300 cursor-pointer"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;


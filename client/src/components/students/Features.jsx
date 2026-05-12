import React from "react";
import { BookOpen, Users, Award, ShieldCheck, Zap, Globe } from "lucide-react";

const features = [
  {
    title: "Expert Instructors",
    description: "Learn from industry professionals with years of real-world experience in their fields.",
    icon: <Users className="w-8 h-8 text-blue-600" />,
  },
  {
    title: "Flexible Learning",
    description: "Study at your own pace, on any device, at any time that suits your busy schedule.",
    icon: <Zap className="w-8 h-8 text-yellow-500" />,
  },
  {
    title: "Recognized Certificates",
    description: "Earn certificates of completion that you can share with employers and on LinkedIn.",
    icon: <Award className="w-8 h-8 text-purple-600" />,
  },
  {
    title: "Lifetime Access",
    description: "Once you enroll in a course, you have unlimited access to its content forever.",
    icon: <ShieldCheck className="w-8 h-8 text-green-600" />,
  },
  {
    title: "Global Community",
    description: "Connect with students from around the world and share knowledge and experiences.",
    icon: <Globe className="w-8 h-8 text-indigo-600" />,
  },
  {
    title: "Hands-on Projects",
    description: "Apply what you learn with practical projects and assignments that build your portfolio.",
    icon: <BookOpen className="w-8 h-8 text-red-500" />,
  },
];

const Features = () => {
  return (
    <section className="py-20 px-6 md:px-16 lg:px-24 xl:px-32 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm font-semibold mb-4">
            Why Choose Us
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Key Features
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
            We provide the best tools and environment for your educational journey.
            Discover why Edmiy is the preferred choice for thousands of learners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group"
            >
              <div className="mb-6 p-3 bg-white rounded-2xl w-fit shadow-sm">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

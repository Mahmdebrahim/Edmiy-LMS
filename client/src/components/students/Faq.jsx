import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqsData = [
  {
    question: "How do I enroll in a course?",
    answer: "Enrollment is simple! Browse our course catalog, click on the course you're interested in, and hit the 'Enroll Now' button. If it's a paid course, you'll be directed to the payment gateway.",
  },
  {
    question: "Can I access courses on mobile?",
    answer: "Yes, Edmiy is fully responsive. You can learn on the go using your smartphone or tablet through any modern web browser.",
  },
  {
    question: "Do I get a certificate upon completion?",
    answer: "Absolutely! Once you complete all the lessons and assignments in a course, you'll be able to download a digital certificate of completion to showcase your achievement.",
  },
  {
    question: "Is there a refund policy?",
    answer: "We offer a 30-day money-back guarantee for most courses. If you're not satisfied with the content, you can request a refund within the first 30 days of purchase.",
  },
  {
    question: "How can I contact the instructor?",
    answer: "Each course has a dedicated Q&A section where you can post your questions. Instructors regularly monitor these sections and provide guidance to students.",
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-20 px-6 md:px-16 lg:px-24 xl:px-32 bg-gray-50/50">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <div className="inline-block bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
          FAQ
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 max-w-2xl mb-12">
          Find answers to the most common questions about our platform and courses. 
          Still have questions? Reach out to our support team.
        </p>

        <div className="w-full space-y-4 text-left">
          {faqsData.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <button
                className="w-full flex items-center justify-between p-5 md:p-6 cursor-pointer focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-gray-800 text-lg md:text-xl">
                  {faq.question}
                </span>
                <ChevronDown
                  size={24}
                  className={`text-gray-500 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-5 md:p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-50">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;

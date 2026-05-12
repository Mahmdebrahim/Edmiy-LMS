import React from 'react'
import Hero from '../../components/students/Hero'
import Companies from '../../components/students/Companies'
import CoursesSection from '../../components/students/CoursesSection';
import Testimonials from '../../components/students/Testimonials';
import CallToAction from '../../components/students/CallToAction';
import Faq from '../../components/students/Faq';
import Features from '../../components/students/Features';
import BecomeInstructor from '../../components/students/BecomeInstructor';

function Home() {
  return (
    <div className="w-full">
      <Hero />
      <Companies />
      <Features />
      <CoursesSection/>
      <BecomeInstructor />
      <Testimonials/>
      <Faq />
      <CallToAction/>
    </div>
  );
}

export default Home;

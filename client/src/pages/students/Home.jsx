import React from 'react'
import Hero from '../../components/students/Hero'

import Companies from '../../components/students/companies'
import CoursesSection from '../../components/students/CoursesSection';
import Testimonials from '../../components/students/Testimonials';
import CallToAction from '../../components/students/CallToAction';

function Home() {
  return (
    <div className="flex flex-col items-center space-y-7 text-center">
      <Hero />
      <Companies />
      <CoursesSection/>
      <Testimonials/>
      <CallToAction/>
    </div>
  );
}

export default Home

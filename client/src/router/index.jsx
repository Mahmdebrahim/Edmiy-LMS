import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

import StudentLayout from "../pages/students/StdLayout";
import Home from "../pages/students/Home";
import CourseList from "../pages/students/CourseList";
import CourseDetails from "../pages/students/CourseDetails";
import MyEnrollments from "../pages/students/MyEnrollments";
import Player from "../pages/students/Player";
import Wishlist from "../pages/students/Wishlist";
import Cart from "../pages/students/Cart";

import Educator from "../pages/educator/Educator";
import EduLayout from "../pages/educator/EduLayout";
import MyCourses from "../pages/educator/MyCourses";
import AddCourse from "../pages/educator/AddCourse";
import StudentEnrolled from "../pages/educator/StudentEnrolled";
import Dashboard from "../pages/educator/Dashboard";

import Error500 from "../pages/ErrorPage";
import PageNotFound from "../pages/PageNotFound";


// Create router with JSX Route elements
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Student Layout */}
      <Route path="/" element={<StudentLayout />}>
        <Route index element={<Home />} />
        <Route path="/course-list" element={<CourseList />} />
        <Route path="/course-list/:input" element={<CourseList />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/my-enrollments" element={<MyEnrollments />} />
        <Route path="/player/:id" element={<Player />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
      </Route>

      {/* Educator Layout */}
      <Route
        path="/educator"
        element={<EduLayout />}
        errorElement={<Error500 />}
      >
        <Route index element={<Educator />} />
        <Route path="/educator/dashboard" element={<Dashboard />} />
        <Route path="/educator/my-courses" element={<MyCourses />} />
        <Route path="/educator/add-course" element={<AddCourse />} />
        <Route
          path="/educator/student-enrolled"
          element={<StudentEnrolled />}
        />
      </Route>

      {/* Page Not Found */}
      <Route path="*" element={<PageNotFound />} />
    </>,
  ),
);

export default router;

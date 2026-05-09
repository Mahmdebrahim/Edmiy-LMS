import {
  Navigate,
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
import Wishlist from "../pages/students/wishlist";
import Cart from "../pages/students/Cart";

import EduLayout from "../pages/educator/EduLayout";
import MyCourses from "../pages/educator/MyCourses";
import AddCourse from "../pages/educator/AddCourse";
import EditCourse from "../pages/educator/EditCourse";
import StudentEnrolled from "../pages/educator/StudentEnrolled";
import Enrollments from "../pages/educator/Enrollments";
import Dashboard from "../pages/educator/Dashboard";
import Coupons from "../pages/educator/Coupons";

import { RequireAuth } from "../components/guards/RequireAuth";
import { RequireEducator } from "../components/guards/RequireEducator";

import Error500 from "../pages/ErrorPage";
import PageNotFound from "../pages/PageNotFound";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* ── Student Layout ── */}
      <Route path="/" element={<StudentLayout />}>
        {/* Public */}
        <Route index element={<Home />} />
        <Route path="course-list" element={<CourseList />} />
        <Route path="course-list/:input" element={<CourseList />} />
        <Route path="course/:id" element={<CourseDetails />} />

        {/* Protected */}
        <Route element={<RequireAuth />}>
          <Route path="my-enrollments" element={<MyEnrollments />} />
          <Route path="player/:id" element={<Player />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="cart" element={<Cart />} />
        </Route>
      </Route>

      {/* ── Educator Layout — educator ── */}
      <Route element={<RequireAuth />}>
        <Route element={<RequireEducator />}>
          <Route
            path="/educator"
            element={<EduLayout />}
            errorElement={<Error500 />}
          >
            <Route
              index
              element={<Navigate to="/educator/dashboard" replace />}
            />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="my-courses" element={<MyCourses />} />
            <Route path="add-course" element={<AddCourse />} />
            <Route path="edit-course/:id" element={<EditCourse />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="student-enrolled" element={<StudentEnrolled />} />
            <Route path="enrollments" element={<Enrollments />} />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<PageNotFound />} />
    </>,
  ),
);

export default router;

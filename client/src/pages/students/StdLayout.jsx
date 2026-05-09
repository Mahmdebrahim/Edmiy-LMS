import { Outlet } from "react-router-dom";
import StudentNavbar from "../../components/students/StudentNav";
import Footer from "../../components/layout/Footer";

const StudentLayout = () => {
  return (
    <div className="root-layout">
      <StudentNavbar />
      <div className="">
        <Outlet />
      </div>
      <Footer/>
    </div>
  );
};

export default StudentLayout;

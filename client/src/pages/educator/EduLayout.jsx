import { Outlet } from "react-router-dom";
import EducatorNavbar from "../../components/educator/EducatorNavbar";
import EducatorSidebar from "../../components/layout/sidebar";
import EduFooter from "../../components/layout/EduFooter";

const EduLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <EducatorSidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <EducatorNavbar />

        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className=" min-h-full flex flex-col">
            <div className="flex-1 p-6">
              <Outlet />
            </div>
            <EduFooter />
          </div>
        </main>
      </div>
    </div>
  );
};

export default EduLayout;

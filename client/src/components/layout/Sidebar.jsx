import { useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useUser, UserButton  } from "@clerk/clerk-react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  SquarePlus,
  Tag,
  Users,
  ClipboardList,
  ChevronDown,
} from "lucide-react";

const groups = [
  {
    items: [
      {
        name: "Dashboard",
        path: "/educator/dashboard",
        icon: <LayoutDashboard size={18} />,
      },
    ],
  },
  {
    label: "Course Management",
    items: [
      {
        name: "My Courses",
        path: "/educator/my-courses",
        icon: <BookOpen size={18} />,
      },
      {
        name: "Add Course",
        path: "/educator/add-course",
        icon: <SquarePlus size={18} />,
      },
      { name: "Coupons", path: "/educator/coupons", icon: <Tag size={18} /> },
    ],
  },
  {
    label: "Students",
    items: [
      {
        name: "All Students",
        path: "/educator/student-enrolled",
        icon: <Users size={18} />,
      },
      {
        name: "Enrollments",
        path: "/educator/enrollments",
        icon: <ClipboardList size={18} />,
      },
    ],
  },
];

const EducatorSidebar = () => {
  const { user } = useUser();

  const [openGroups, setOpenGroups] = useState(groups.map((g) => !!g.label));

  const toggleGroup = (index) => {
    setOpenGroups((prev) =>
      prev.map((open, i) => (i === index ? !open : open)),
    );
  };

  return (
    <aside className="bg-white border-r border-gray-100 w-16 md:w-64 flex flex-col min-h-screen transition-all duration-300 p-2">
      <Link to="/" className="flex items-center mx- px- py-1">
        <img className="h-12 hidden md:block" src={assets.logo2} alt="Logo" />
        <img className="h-8 mx-auto md:hidden" src={assets.logoo} alt="Logo" />
      </Link>
      <nav className="flex-1 pt-2 overflow-y-auto">
        {groups.map((group, gi) => (
          <div key={gi} className="mb-1">
            
            {group.label ? (
              <>
                <button
                  onClick={() => toggleGroup(gi)}
                  className="hidden md:flex w-full items-center justify-between px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${openGroups[gi] ? "rotate-180" : ""}`}
                  />
                </button>

                <div className="md:hidden mx-3 my-2 border-t border-gray-100" />
              </>
            ) : null}

            <div
              className={`overflow-hidden transition-all duration-200 ${
                group.label && !openGroups[gi] ? "max-h-0" : "max-h-96"
              }`}
            >
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 md:mx-2 md:px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`
                  }
                >
                  <span className="shrink-0 max-[768px]:mx-auto ">{item.icon}</span>
                  <span className="hidden md:block">{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-100 ">
        <div className="flex items-center gap-3 px-2 py-2 transition-colors">
          <UserButton/>
          <div className="hidden md:block min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default EducatorSidebar;

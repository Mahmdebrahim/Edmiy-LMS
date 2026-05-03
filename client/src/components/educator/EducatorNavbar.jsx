import { Link } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import { dummyEducatorData, assets } from "../../assets/assets";

const EducatorNavbar = () => {
  const { user } = useUser();
  const EducatorData = dummyEducatorData;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex  justify-end px-4 py-5 md:px-8">
        <div className="flex items-center gap-6 text-gray-600">
          <span className="hidden md:inline">
            Hi!, {user?.firstName || "Educator"}
          </span>

          {user ? (
            user?.imageUrl && (
              <img
                src={user.imageUrl}
                alt={user.firstName}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            )
          ) : (
            <img
              className="max-w-8"
              src={assets.profile_img}
              alt={EducatorData.name}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default EducatorNavbar;

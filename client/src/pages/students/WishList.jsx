import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Heart, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import useCustomQuery, { useCustomMutation } from "../../hooks/useCustomQuery";
import { AppContext } from "../../context/AppContext";
import CourseCard from "../../components/students/courseCard";
import CourseCardSkeleton from "../../components/skeletons/CourseCardSkeleton";

export default function Wishlist() {
  const navigate = useNavigate();
  const { user } = useUser();

 const { data, isLoading, isFetching } = useCustomQuery({
   queryKey: ["wishlist"],
   URL: "/api/user/wishlist",
   options: {
     enabled: !!user,
     staleTime: 30000, 
   },
 });

  const loading = !user || isLoading;
  const wishlist = data?.wishlist || [];

  const { mutate: removeFromWishlist } = useCustomMutation({
    URL: "/api/user/wishlist/remove",
    invalidateKeys: ["wishlist"],
    onSuccess: () => toast.success("Removed from wishlist"),
    onError: () => toast.error("Failed to remove"),
  });

  return (
    <div className="relative md:px-36 px-4 pt-20 pb-16 text-left min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Heart size={28} className="text-blue-500" />
        <h1 className="text-3xl font-bold text-gray-800">My Wishlist</h1>
      </div>
      <p className="text-gray-500 mb-8">
        <span
          className="text-blue-600 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Home
        </span>{" "}
        / <span>Wishlist</span>
      </p>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && wishlist.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <Heart size={64} className="text-gray-200 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-gray-500 mb-6">
            Save courses you're interested in and come back later.
          </p>
          <button
            onClick={() => navigate("/course-list")}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Courses
          </button>
        </div>
      )}

      {/* Wishlist Cards */}
      {!loading && wishlist.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-6">
            {wishlist.length} {wishlist.length === 1 ? "course" : "courses"}{" "}
            saved
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlist.map((course) => (
              <div key={course._id} className="relative group">
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

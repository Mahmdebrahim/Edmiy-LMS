import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Star, Users, Heart, ShoppingCart } from "lucide-react";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { useCustomMutation } from "../../hooks/useCustomQuery";
import useCustomQuery from "../../hooks/useCustomQuery";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
function CourseCard({ course }) {
  const { enrolledCourses, cartItems } = useContext(AppContext);
  const { user } = useUser();
  const navigate = useNavigate();

  const discountedPrice = (
    course.coursePrice -
    (course.discount * course.coursePrice) / 100
  ).toFixed(2);

  const hasDiscount = course.discount > 0;
  const avgRating = (course.avgRating || 0).toFixed(1);
  const totalReviews = course.totalReviews || 0;
  const studentCount = course.enrolledStudents?.length || 0;
  const isEnrolled = enrolledCourses.some((c) => c._id === course._id);
  const isInCart = cartItems.some((c) => c._id === course._id);

  const { data: wishlistData } = useCustomQuery({
    queryKey: ["wishlist"],
    URL: "/api/user/wishlist",
    options: { enabled: !!user },
  });
  const isInWishlist = wishlistData?.wishlist?.some(
    (c) => c._id === course._id,
  );

  const { mutate: addToWishlist, isPending: addingWishlist } =
    useCustomMutation({
      URL: "/api/user/wishlist/add",
      invalidateKeys: ["wishlist"],
      onSuccess: () => toast.success("Added to wishlist!"),
      onError: () => toast.error("Failed to add to wishlist"),
    });

  const { mutate: removeFromWishlist, isPending: removingWishlist } =
    useCustomMutation({
      URL: "/api/user/wishlist/remove",
      invalidateKeys: ["wishlist"],
      onSuccess: () => toast.success("Removed from wishlist"),
      onError: () => toast.error("Failed to remove from wishlist"),
    });

  const { mutate: addToCart, isPending: addingCart } = useCustomMutation({
    URL: "/api/user/cart/add",
    invalidateKeys: ["cart"],
    onSuccess: () => toast.success("Added to cart!"),
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to add to cart"),
  });

  const { mutate: removeFromCart, isPending: removingCart } = useCustomMutation(
    {
      URL: "/api/user/cart/remove",
      invalidateKeys: ["cart"],
      onSuccess: () => toast.success("Removed from cart"),
      onError: () => toast.error("Failed to remove from cart"),
    },
  );

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please login first!");
      return;
    }
    if (isInWishlist) removeFromWishlist({ courseId: course._id });
    else addToWishlist({ courseId: course._id });
  };

  const handleCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please login first!");
      return;
    }
    if (isInCart) removeFromCart({ courseId: course._id });
    else addToCart({ courseId: course._id });
  };

  const parseHTMLDescription = (htmlString) => {
    if (!htmlString) return { paragraphs: [] };
    if (!/<[^>]*>/.test(htmlString)) return { paragraphs: [htmlString] };
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");
      return {
        paragraphs: Array.from(doc.querySelectorAll("p"))
          .map((p) => p.textContent.trim())
          .filter(Boolean),
      };
    } catch {
      return { paragraphs: [] };
    }
  };

  const description = parseHTMLDescription(course.courseDescription);

  return (
    <div
      // to={`/course/${course._id}`}
      onClick={() => window.scrollTo(0, 0)}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group max-w-xs flex flex-col relative"
    >
      {/* Thumbnail */}
      <div className="relative h-38 overflow-hidden p-4">
        <img
          className="w-full h-full rounded-xl object-cover"
          src={course.courseThumbnail}
          alt={course.courseTitle}
        />
        {hasDiscount && (
          <div className="absolute top-5 right-5 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            {course.discount}% OFF
          </div>
        )}

        {/* Wishlist button on thumbnail */}

        <button
          onClick={handleWishlist}
          disabled={addingWishlist || removingWishlist}
          className={`absolute top-5 left-5 p-1.5 rounded-full shadow-md transition-all cursor-pointer ${
            isInWishlist
              ? "bg-white text-red-500"
              : "bg-white/90 text-gray-400 hover:text-red-500"
          }`}
        >
          {addingWishlist || removingWishlist ? (
            <ClipLoader size={12} color="#ef4444" />
          ) : (
            <Heart size={14} fill={isInWishlist ? "currentColor" : "none"} />
          )}
        </button>
      </div>

      <div className="p-4 text-left flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
          {course.courseTitle}
        </h3>

        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {description.paragraphs[0]}
        </p>

        <p className="text-sm text-blue-600 mb-3">
          {course.courseEducator.name}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-gray-800">
              {avgRating}
            </span>
            <span className="text-xs text-gray-400">({totalReviews})</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Users size={14} />
            <span>{studentCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <p className="text-lg font-bold text-gray-900">${discountedPrice}</p>
          {hasDiscount && (
            <del className="text-gray-400 text-sm">${course.coursePrice}</del>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-auto flex gap-2">
          {isEnrolled ? (
            <button
              onClick={() => {
                navigate(`/player/${course._id}`);
                window.scrollTo(0, 0);
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-2 px-4 rounded-xl cursor-pointer"
            >
              Watch Now
            </button>
          ) : (
            <>
              {isInCart ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/cart");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 font-semibold py-2 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-colors cursor-pointer"
                >
                  <ShoppingCart size={15} />
                  Go to Cart
                </button>
              ) : (
                <button
                  onClick={handleCart}
                  disabled={addingCart}
                  className="flex-1 flex items-center justify-center gap-2 font-semibold py-2 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-colors cursor-pointer disabled:opacity-70"
                >
                  {addingCart ? (
                    <ClipLoader size={14} color="#fff" />
                  ) : (
                    <>
                      <ShoppingCart size={15} /> Add to Cart
                    </>
                  )}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo(0, 0);
                  navigate(`/course/${course._id}`);
                }}
                className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center cursor-pointer"
              >
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseCard;

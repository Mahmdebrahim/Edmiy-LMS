import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  Trash2,
  ShoppingCart,
  ArrowRight,
  Star,
  BookOpen,
  Clock,
  Tag,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import useCustomQuery, { useCustomMutation } from "../../hooks/useCustomQuery";
import CourseCardSkeleton from "../../components/skeletons/CourseCardSkeleton";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { ClipLoader } from "react-spinners";
import { useState } from "react";

export default function Cart() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { calcCourseDuration, calcLecturesNo } = useContext(AppContext);

  const { data, isLoading } = useCustomQuery({
    queryKey: ["cart"],
    URL: "/api/user/cart",
    options: { enabled: isLoaded && !!user },
  });
  const cartItems = data?.items || [];

  const { mutate: removeFromCart, isPending: removing } = useCustomMutation({
    URL: "/api/user/cart/remove",
    invalidateKeys: ["cart"],
    onSuccess: () => toast.success("Removed from cart"),
    onError: () => toast.error("Failed to remove"),
  });

  const { mutate: checkout, isPending: checkingOut } = useCustomMutation({
    URL: "/api/user/cart/checkout",
    invalidateKeys: ["cart", "enrolledCourses"],
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Checkout failed"),
  });

  // Calculate totals
  // Add coupon state — object { courseId: { code, discount } }
  const [coupons, setCoupons] = useState({});
  const [couponInputs, setCouponInputs] = useState({});
  const [couponErrors, setCouponErrors] = useState({});

  const { mutate: validateCoupon, isPending: validatingCoupon } =
    useCustomMutation({
      URL: "/api/coupon/validate",
      onSuccess: (data, variables) => {
        if (data.success) {
          setCoupons((prev) => ({
            ...prev,
            [variables.courseId]: {
              code: variables.code,
              discount: data.discount,
            },
          }));
          setCouponErrors((prev) => ({ ...prev, [variables.courseId]: "" }));
          toast.success(`Coupon applied! ${data.discount}% off`);
        } else {
          setCouponErrors((prev) => ({
            ...prev,
            [variables.courseId]: data.message,
          }));
        }
      },
      onError: (_, variables) =>
        setCouponErrors((prev) => ({
          ...prev,
          [variables.courseId]: "Failed to validate",
        })),
    });

  const handleApplyCoupon = (courseId) => {
    const code = couponInputs[courseId]?.trim();
    if (!code) return;
    validateCoupon({ code: code.toUpperCase(), courseId });
  };

  const handleRemoveCoupon = (courseId) => {
    setCoupons((prev) => {
      const n = { ...prev };
      delete n[courseId];
      return n;
    });
    setCouponInputs((prev) => ({ ...prev, [courseId]: "" }));
    setCouponErrors((prev) => ({ ...prev, [courseId]: "" }));
  };

  // Updated totals with coupons
  const subtotal = cartItems.reduce((sum, course) => {
    const base =
      course.coursePrice - (course.discount * course.coursePrice) / 100;
    const coupon = coupons[course._id];
    return sum + (coupon ? base - (base * coupon.discount) / 100 : base);
  }, 0);

  const totalDiscount = cartItems.reduce((sum, course) => {
    return sum + (course.discount * course.coursePrice) / 100;
  }, 0);

  const couponSavings = cartItems.reduce((sum, course) => {
    const base =
      course.coursePrice - (course.discount * course.coursePrice) / 100;
    const coupon = coupons[course._id];
    return sum + (coupon ? (base * coupon.discount) / 100 : 0);
  }, 0);

  // Updated checkout — send coupons map { courseId: code }
  const handleCheckout = () => {
    const couponCodes = {};
    Object.entries(coupons).forEach(([courseId, { code }]) => {
      couponCodes[courseId] = code;
    });
    checkout({ coupons: couponCodes });
  };

  const originalTotal = cartItems.reduce(
    (sum, course) => sum + course.coursePrice,
    0,
  );

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen md:px-36 px-4 pt-20 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart size={28} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">My Cart</h1>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-100 rounded-2xl animate-pulse"
                />
              ))}
          </div>
          <div className="w-full lg:w-80 h-64 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Empty state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen md:px-36 px-4 pt-20 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart size={28} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">My Cart</h1>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <ShoppingCart size={64} className="text-gray-200 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-500 mb-6">
            Browse courses and add them to your cart.
          </p>
          <button
            onClick={() => navigate("/course-list")}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:px-36 px-4 pt-20 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <ShoppingCart size={28} className="text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">My Cart</h1>
      </div>
      <p className="text-gray-500 mb-8">
        <span
          className="text-blue-600 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Home
        </span>{" "}
        / <span>Cart</span>
      </p>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left — Cart Items */}
        <div className="flex-1 space-y-4">
          <p className="text-sm text-gray-500 mb-4">
            {cartItems.length} {cartItems.length === 1 ? "course" : "courses"}{" "}
            in cart
          </p>

          {cartItems.map((course) => {
            const base =
              course.coursePrice - (course.discount * course.coursePrice) / 100;
            const appliedCoupon = coupons[course._id];
            const finalPrice = appliedCoupon
              ? (base - (base * appliedCoupon.discount) / 100).toFixed(2)
              : base.toFixed(2);
            const hasDiscount = course.discount > 0;
            const avgRating = (course.avgRating || 0).toFixed(1);

            return (
              <div
                key={course._id}
                className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div
                    onClick={() => navigate(`/course/${course._id}`)}
                    className="w-36 h-24 rounded-xl overflow-hidden shrink-0 cursor-pointer"
                  >
                    <img
                      src={course.courseThumbnail}
                      alt={course.courseTitle}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      onClick={() => navigate(`/course/${course._id}`)}
                      className="font-semibold text-gray-800 line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors mb-1"
                    >
                      {course.courseTitle}
                    </h3>
                    <p className="text-sm text-blue-600 mb-2">
                      {course.courseEducator?.name}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Star
                          size={12}
                          className="text-yellow-500 fill-yellow-500"
                        />
                        <span>{avgRating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen size={12} />
                        <span>{calcLecturesNo(course)} lectures</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{calcCourseDuration(course)}</span>
                      </div>
                    </div>

                    {/* Price + Remove */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-800">
                          ${finalPrice}
                        </span>
                        {(hasDiscount || appliedCoupon) && (
                          <del className="text-sm text-gray-400">
                            ${course.coursePrice}
                          </del>
                        )}
                        {hasDiscount && (
                          <span className="text-xs bg-red-100 text-red-500 px-1.5 py-0.5 rounded font-medium">
                            {course.discount}% OFF
                          </span>
                        )}
                        {appliedCoupon && (
                          <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-medium">
                            +{appliedCoupon.discount}% coupon
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart({ courseId: course._id })}
                        disabled={removing}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Coupon Input per course */}
                <div className="mt-3 pt-3 border-t border-gray-50">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Tag size={13} className="text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                          {appliedCoupon.discount}% off
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveCoupon(course._id)}
                        className="text-gray-400 hover:text-red-500 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Have a coupon for this course?"
                        value={couponInputs[course._id] || ""}
                        onChange={(e) =>
                          setCouponInputs((prev) => ({
                            ...prev,
                            [course._id]: e.target.value.toUpperCase(),
                          }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleApplyCoupon(course._id)
                        }
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleApplyCoupon(course._id)}
                        disabled={
                          validatingCoupon || !couponInputs[course._id]?.trim()
                        }
                        className="px-4 py-2 text-sm font-medium bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 cursor-pointer"
                      >
                        {validatingCoupon ? (
                          <ClipLoader size={13} color="#fff" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                  )}
                  {couponErrors[course._id] && (
                    <p className="text-xs text-red-500 mt-1">
                      {couponErrors[course._id]}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right — Order Summary */}
        <div className="w-full lg:w-80 lg:sticky lg:top-5 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Original Price</span>
                <span>${originalTotal.toFixed(2)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Course Discount</span>
                  <span>- ${totalDiscount.toFixed(2)}</span>
                </div>
              )}
              {couponSavings > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon Savings</span>
                  <span>- ${couponSavings.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-800">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            {(totalDiscount > 0 || couponSavings > 0) && (
              <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2 mb-4 text-sm text-green-700 text-center">
                You save{" "}
                <span className="font-bold">
                  ${(totalDiscount + couponSavings).toFixed(2)}
                </span>{" "}
                on this order!
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {checkingOut ? (
                "Processing..."
              ) : (
                <>
                  Checkout <ArrowRight size={16} />
                </>
              )}
            </button>

            <button
              onClick={() => navigate("/course-list")}
              className="w-full py-3 mt-3 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-xl transition-colors cursor-pointer text-sm"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

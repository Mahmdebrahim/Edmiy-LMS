import React, { useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import useCustomQuery, { useCustomMutation } from "../../hooks/useCustomQuery";
import { useUser } from "@clerk/clerk-react";
import { Rating } from "primereact/rating";
import { Accordion, AccordionTab } from "primereact/accordion";
import { ShieldAlert } from "lucide-react";
import {
  PlayCircle,
  Lock,
  Clock,
  CheckCircle,
  AlarmClock,
  ArrowLeft,
  Heart,
  Star,
  BookOpen,
  Users,
  ShoppingCart,
  Tag,
  X,
} from "lucide-react";
import Youtube from "react-youtube";
import { PropagateLoader, ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const {
    calcChapterTime,
    calcCourseDuration,
    calcLecturesNo,
    calcLecTime,
    enrolledCourses,
  } = useContext(AppContext);

  const [playedData, setPlayedData] = useState(null);
  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");

  const { data, isLoading, error } = useCustomQuery({
    queryKey: ["course", id],
    URL: `/api/course/${id}`,
  });
  const courseData = data?.course;

  const { data: wishlistData } = useCustomQuery({
    queryKey: ["wishlist"],
    URL: "/api/user/wishlist",
    options: { enabled: !!user },
  });
  const isInWishlist = wishlistData?.wishlist?.some((c) => c._id === id);

  const { data: cartData } = useCustomQuery({
    queryKey: ["cart"],
    URL: "/api/user/cart",
    options: { enabled: !!user },
  });
  const isInCart = cartData?.items?.some((c) => c._id === id);
  const isAlreadyEnrolled = enrolledCourses.some(
    (c) => c._id === id || c === id,
  );

  const { mutate: enrollCourse, isPending } = useCustomMutation({
    URL: "/api/user/purchase-course",
    invalidateKeys: ["enrolledCourses"],
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to enroll");
    },
  });

  const { mutate: addToWishlist, isPending: addingToWishlist } =
    useCustomMutation({
      URL: "/api/user/wishlist/add",
      invalidateKeys: ["wishlist"],
      onSuccess: () => toast.success("Added to wishlist!"),
      onError: () => toast.error("Failed to add to wishlist"),
    });

  const { mutate: removeFromWishlist, isPending: removingFromWishlist } =
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

  const { mutate: removeFromCart } = useCustomMutation({
    URL: "/api/user/cart/remove",
    invalidateKeys: ["cart"],
    onSuccess: () => toast.success("Removed from cart"),
    onError: () => toast.error("Failed to remove from cart"),
  });

  const { mutate: validateCoupon, isPending: validatingCoupon } =
    useCustomMutation({
      URL: "/api/coupon/validate",
      onSuccess: (data) => {
        if (data.success) {
          setCouponCode(couponInput);
          setCouponDiscount(data.discount);
          setCouponError("");
          toast.success(`Coupon applied! ${data.discount}% off`);
        } else {
          setCouponError(data.message);
          setCouponDiscount(0);
          setCouponCode("");
        }
      },
      onError: () => setCouponError("Failed to validate coupon"),
    });

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    setCouponError("");
    validateCoupon({ code: couponInput, courseId: id });
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponInput("");
    setCouponDiscount(0);
    setCouponError("");
  };

  const handleEnroll = () => {
    if (!user) {
      toast.error("Please login first!");
      return;
    }
    console.log("couponCode being sent:", couponCode);
    enrollCourse({ courseId: id, couponCode: couponCode || undefined });
  };

  const handleCart = () => {
    if (!user) {
      toast.error("Please login first!");
      return;
    }
    if (isInCart) removeFromCart({ courseId: id });
    else addToCart({ courseId: id });
  };

  const handleWishlist = () => {
    if (!user) {
      toast.error("Please login first!");
      return;
    }
    if (isInWishlist) removeFromWishlist({ courseId: id });
    else addToWishlist({ courseId: id });
  };

  const parseHTMLDescription = (htmlString) => {
    if (!htmlString) return { mainHeading: "", paragraphs: [], listItems: [] };
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");
      return {
        mainHeading: doc.querySelector("h2")?.textContent || "",
        paragraphs: Array.from(doc.querySelectorAll("p"))
          .map((p) => p.textContent.trim())
          .filter(Boolean),
        listItems: Array.from(doc.querySelectorAll("ul li"))
          .map((li) => li.textContent.trim())
          .filter(Boolean),
      };
    } catch {
      return { mainHeading: "", paragraphs: [], listItems: [] };
    }
  };

  if (isLoading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen">
        <div className="absolute top-0 left-0 w-full h-2/5 -z-1 bg-linear-to-b from-blue-300/50"></div>
        <PropagateLoader color="#155dfc" />
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Course not found
          </h2>
          <button
            onClick={() => navigate("/course-list")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Browse All Courses
          </button>
        </div>
      </div>
    );
  }

  const description = parseHTMLDescription(courseData.courseDescription);
  const avgRating = (courseData.avgRating || 0).toFixed(1);
  const totalReviews = courseData.totalReviews || 0;

  // discountedPrice first, then finalPrice depends on it
  const discountedPrice = (
    courseData.coursePrice -
    (courseData.discount * courseData.coursePrice) / 100
  ).toFixed(2);

  const finalPrice =
    couponDiscount > 0
      ? (
          parseFloat(discountedPrice) -
          (parseFloat(discountedPrice) * couponDiscount) / 100
        ).toFixed(2)
      : discountedPrice;

  const ActionButtons = () => (
    <>
      {isAlreadyEnrolled && (
        <p className="text-blue-500 font-semibold mb-2 flex items-center gap-1 text-sm">
          <ShieldAlert size={16} />
          You already own this course
        </p>
      )}

      {isAlreadyEnrolled ? (
        <button
          onClick={() => navigate(`/player/${id}`)}
          className="w-full py-3 rounded-lg bg-blue-500 text-white font-medium cursor-pointer hover:bg-blue-600 transition-colors mb-2"
        >
          Go to Course
        </button>
      ) : (
        <>
          {/* Cart + Wishlist */}
          <div className="flex gap-2 mb-2">
            {isInCart ? (
              <button
                onClick={() => navigate("/cart")}
                className="flex-1 py-3 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors cursor-pointer"
              >
                Go to Cart
              </button>
            ) : (
              <button
                onClick={handleCart}
                disabled={addingCart}
                className="flex-1 py-3 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-70"
              >
                {addingCart ? (
                  <ClipLoader size={16} color="#fff" />
                ) : (
                  "Add to Cart"
                )}
              </button>
            )}
            <button
              onClick={handleWishlist}
              disabled={addingToWishlist || removingFromWishlist}
              className="p-3 rounded-lg border border-blue-500 text-blue-500 transition-all cursor-pointer"
            >
              {addingToWishlist || removingFromWishlist ? (
                <ClipLoader size={16} color="#3b82f6" />
              ) : (
                <Heart
                  size={18}
                  fill={isInWishlist ? "currentColor" : "none"}
                />
              )}
            </button>
          </div>

          {/* Buy Now */}
          <button
            onClick={handleEnroll}
            disabled={isPending}
            className="w-full py-3 rounded-lg border-2 border-blue-600 text-blue-600 font-medium hover:bg-blue-50 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {isPending ? "Processing..." : "Buy Now"}
          </button>
        </>
      )}
    </>
  );

  return (
    <>
      <div className="relative md:py-36 md:px-36 px-4 md:pt-25 pt-20">
        <div className="absolute top-0 left-0 w-full h-2/5 -z-1 bg-linear-to-b from-blue-300/50"></div>

        <button
          onClick={() => navigate("/course-list")}
          className="flex items-center w-fit gap-2 text-gray-500 hover:text-gray-700 transition-colors pb-4 py-2 rounded-lg cursor-pointer"
        >
          <ArrowLeft size={18} />
          Back to Courses
        </button>

        <div className="flex lg:flex-row flex-col gap-10 relative items-start justify-between text-left">
          {/* Left Column */}
          <div className="w-full lg:max-w-2xl z-10 text-gray-500">
            <h1 className="md:text-course-details-heading-large text-2xl font-semibold text-gray-800">
              {courseData.courseTitle}
            </h1>
            <p
              className="pt-4 md:text-base text-sm"
              dangerouslySetInnerHTML={{
                __html: courseData.courseDescription.slice(0, 200),
              }}
            />

            <div className="flex flex-wrap items-center gap-2 mb-3 pt-3">
              <span className="text-sm font-semibold text-gray-800">
                {avgRating}
              </span>
              <Rating
                value={Number(avgRating)}
                readOnly
                cancel={false}
                pt={{
                  onIcon: { className: "text-yellow-500 !text-yellow-500" },
                  offIcon: { className: "text-gray-300" },
                }}
              />
              <span className="text-blue-500 text-sm">
                ({totalReviews} {totalReviews === 1 ? "rating" : "ratings"})
              </span>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <Users size={14} />
                <span>{courseData.enrolledStudents?.length || 0} students</span>
              </div>
            </div>

            <p className="text-sm">
              Course by{" "}
              <span className="text-blue-500 underline">
                {courseData.courseEducator.name}
              </span>
            </p>

            {/* Mobile Card */}
            <div className="lg:hidden mt-6 rounded-xl overflow-hidden bg-white shadow-md">
              {playedData ? (
                <Youtube
                  videoId={playedData.videoId}
                  opts={{ playerVars: { autoplay: 1 } }}
                  iframeClassName="w-full aspect-video"
                />
              ) : (
                <img
                  src={courseData.courseThumbnail}
                  alt="courseThumbnail"
                  className="w-full"
                />
              )}
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-2xl font-semibold text-gray-800">
                    ${discountedPrice}
                  </p>
                  {courseData.discount > 0 && (
                    <del className="text-gray-400">
                      ${courseData.coursePrice}
                    </del>
                  )}
                  {courseData.discount > 0 && (
                    <p className="text-gray-500">{courseData.discount}% off</p>
                  )}
                </div>
                <div className="mt-6">
                  {/* Coupon input هنا مباشرة */}
                  {!isAlreadyEnrolled && !isInCart && (
                    <div className="mb-3">
                      {couponCode ? (
                        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Tag size={14} className="text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                              {couponCode}
                            </span>
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                              {couponDiscount}% off
                            </span>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-gray-400 hover:text-red-500 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Coupon code"
                            value={couponInput}
                            onChange={(e) => {
                              setCouponInput(e.target.value.toUpperCase());
                              setCouponError("");
                            }}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleApplyCoupon()
                            }
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={validatingCoupon || !couponInput.trim()}
                            className="px-4 py-2 text-sm font-medium bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 cursor-pointer"
                          >
                            {validatingCoupon ? (
                              <ClipLoader size={14} color="#fff" />
                            ) : (
                              "Apply"
                            )}
                          </button>
                        </div>
                      )}
                      {couponError && (
                        <p className="text-xs text-red-500 mt-1">
                          {couponError}
                        </p>
                      )}
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-bold text-gray-800">
                        ${finalPrice}
                      </span>
                      <del className="text-gray-400 text-sm">
                        ${discountedPrice}
                      </del>
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                        Extra {couponDiscount}% off
                      </span>
                    </div>
                  )}

                  <ActionButtons />
                </div>
              </div>
            </div>

            {/* Course Structure */}
            <div className="pt-12 text-gray-800">
              <h2 className="text-2xl font-bold mb-4">Course Structure</h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                <span>{courseData.courseContent?.length || 0} sections</span>
                <span>•</span>
                <span>{calcLecturesNo(courseData)} lectures</span>
                <span>•</span>
                <span>{calcCourseDuration(courseData)}</span>
              </div>
              <Accordion activeIndex={0}>
                {courseData.courseContent?.map((chapter, i) => (
                  <AccordionTab
                    key={chapter.chapterId || i}
                    header={
                      <div className="flex justify-between items-center w-full pr-4">
                        <span className="font-semibold text-gray-900">
                          {chapter.chapterTitle}
                        </span>
                        <span className="text-sm text-gray-500 hidden sm:block">
                          {chapter.chapterContent?.length || 0} lectures •{" "}
                          {calcChapterTime(chapter)}
                        </span>
                      </div>
                    }
                  >
                    <div className="space-y-1">
                      {chapter.chapterContent?.map((lecture, idx) => (
                        <div
                          key={lecture.lectureId || idx}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {lecture.isPreviewFree ? (
                              <PlayCircle size={18} className="text-blue-600" />
                            ) : (
                              <Lock size={18} className="text-gray-400" />
                            )}
                            <span className="text-sm text-gray-700">
                              {lecture.lectureTitle}
                            </span>
                            {lecture.isPreviewFree && (
                              <span
                                onClick={() =>
                                  setPlayedData({
                                    videoId: lecture.lectureUrl
                                      .split("/")
                                      .pop(),
                                  })
                                }
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium cursor-pointer"
                              >
                                Preview
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock size={14} />
                            <span className="hidden sm:block">
                              {calcLecTime(lecture.lectureDuration)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionTab>
                ))}
              </Accordion>

              <div className="pt-6 space-y-6">
                {(description.mainHeading ||
                  description.paragraphs.length > 0) && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">
                      {description.mainHeading || "Course Description"}
                    </h2>
                    <div className="space-y-4">
                      {description.paragraphs.map((paragraph, index) => (
                        <p
                          key={index}
                          className="text-gray-700 leading-relaxed"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {description.listItems.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">
                      What you'll learn
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {description.listItems.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle
                            size={20}
                            className="text-green-600 mt-0.5 shrink-0"
                          />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Card */}
          <div className="hidden lg:block lg:sticky top-5 w-80 xl:w-96 z-10 rounded-xl overflow-hidden bg-white shadow-md shrink-0">
            {playedData ? (
              <Youtube
                videoId={playedData.videoId}
                opts={{ playerVars: { autoplay: 1 } }}
                iframeClassName="w-full aspect-video"
              />
            ) : (
              <img
                src={courseData.courseThumbnail}
                alt="courseThumbnail"
                className="w-full"
              />
            )}
            <div className="p-5">
              <div className="flex gap-1.5 text-red-500 items-center">
                <AlarmClock size={18} />
                <p className="text-sm">
                  <span className="font-medium">5 days</span> left at this
                  price!
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <p className="text-4xl font-semibold text-gray-800">
                  ${discountedPrice}
                </p>
                {courseData.discount > 0 && (
                  <del className="text-gray-400 text-lg">
                    ${courseData.coursePrice}
                  </del>
                )}
                {courseData.discount > 0 && (
                  <p className="text-gray-500">{courseData.discount}% off</p>
                )}
              </div>

              <div className="flex gap-3 items-center pt-2 mt-2 border-t border-gray-100 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span>{avgRating}</span>
                  <span className="text-xs text-gray-400">
                    ({totalReviews})
                  </span>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{calcCourseDuration(courseData)}</span>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="flex items-center gap-1">
                  <BookOpen size={14} />
                  <span>{calcLecturesNo(courseData)}</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="mt-6">
                  {/* Coupon input هنا مباشرة */}
                  {!isAlreadyEnrolled && !isInCart && (
                    <div className="mb-3">
                      {couponCode ? (
                        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Tag size={14} className="text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                              {couponCode}
                            </span>
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                              {couponDiscount}% off
                            </span>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-gray-400 hover:text-red-500 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Coupon code"
                            value={couponInput}
                            onChange={(e) => {
                              setCouponInput(e.target.value.toUpperCase());
                              setCouponError("");
                            }}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleApplyCoupon()
                            }
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={validatingCoupon || !couponInput.trim()}
                            className="px-4 py-2 text-sm font-medium bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 cursor-pointer"
                          >
                            {validatingCoupon ? (
                              <ClipLoader size={14} color="#fff" />
                            ) : (
                              "Apply"
                            )}
                          </button>
                        </div>
                      )}
                      {couponError && (
                        <p className="text-xs text-red-500 mt-1">
                          {couponError}
                        </p>
                      )}
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-bold text-gray-800">
                        ${finalPrice}
                      </span>
                      <del className="text-gray-400 text-sm">
                        ${discountedPrice}
                      </del>
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                        Extra {couponDiscount}% off
                      </span>
                    </div>
                  )}

                  <ActionButtons />
                </div>
              </div>

              <div className="pt-6">
                <p className="text-lg font-medium text-gray-800 mb-3">
                  What's in the course?
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  {[
                    "Lifetime access with free updates.",
                    "Step-by-step, hands-on project guidance.",
                    "Downloadable resources and source code.",
                    "Quizzes to test your knowledge.",
                    "Certificate of completion.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle
                        size={15}
                        className="text-green-500 mt-0.5 shrink-0"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseDetails;

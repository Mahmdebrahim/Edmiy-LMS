import React, { useState } from "react";
import { Rating } from "primereact/rating";
import { useCustomMutation } from "../../hooks/useCustomQuery";
import useCustomQuery from "../../hooks/useCustomQuery";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import { Pencil, Trash2, Star } from "lucide-react";

export default function Ratingg({ courseId }) {
  const { user } = useUser();
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: userReviewData, isLoading } = useCustomQuery({
    queryKey: ["userReview", courseId],
    URL: `/api/review/user/${courseId}`,
    options: { enabled: !!user && !!courseId },
  });
  const existingReview = userReviewData?.review;

  const { data: reviewsData } = useCustomQuery({
    queryKey: ["courseReviews", courseId],
    URL: `/api/review/course/${courseId}`,
    options: { enabled: !!courseId },
  });
  const reviews = reviewsData?.reviews || [];
  const totalReviews = reviewsData?.total || 0;

  const { mutate: addReview, isPending: adding } = useCustomMutation({
    URL: "/api/review/add",
    invalidateKeys: ["userReview", "courseReviews", "courses", "course"],
    onSuccess: () => {
      toast.success("Review added!");
      setRating(null);
      setComment("");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to add review"),
  });

  const { mutate: editReview, isPending: editing } = useCustomMutation({
    URL: `/api/review/edit/${existingReview?._id}`,
    method: "put",
    invalidateKeys: ["userReview", "courseReviews", "courses", "course"],
    onSuccess: () => {
      toast.success("Review updated!");
      setIsEditing(false);
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to update"),
  });

  const { mutate: deleteReview, isPending: deleting } = useCustomMutation({
    URL: `/api/review/delete/${existingReview?._id}`,
    method: "delete",
    invalidateKeys: ["userReview", "courseReviews", "courses", "course"],
    onSuccess: () => toast.success("Review deleted"),
    onError: () => toast.error("Failed to delete review"),
  });

  const handleSubmit = () => {
    if (!rating) return toast.error("Please select a rating");
    if (!comment.trim()) return toast.error("Please write a comment");
    addReview({ courseId, rating, comment });
  };

  const handleEdit = () => {
    editReview({
      rating: rating || existingReview?.rating,
      comment: comment || existingReview?.comment,
    });
  };

  // avg rating
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
        1,
      )
    : 0;

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="mt-6 space-y-6">
      {/* Reviews Summary */}
      {totalReviews > 0 && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-800">{avgRating}</p>
            <Rating
              value={Number(avgRating)}
              readOnly
              cancel={false}
              pt={{
                onIcon: { className: "text-yellow-500 !text-yellow-500" },
                offIcon: { className: "text-gray-300" },
              }}
            />
            <p className="text-xs text-gray-500 mt-1">{totalReviews} reviews</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const percent = totalReviews ? (count / totalReviews) * 100 : 0;
              return (
                <div
                  key={star}
                  className="flex items-center gap-2 text-xs text-gray-500"
                >
                  <span className="w-2">{star}</span>
                  <Star
                    size={10}
                    className="text-yellow-500"
                    fill="currentColor"
                  />
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-4">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/*  Your Review أو Form */}
      {existingReview && !isEditing ? (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">Your Review</p>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setRating(existingReview.rating);
                  setComment(existingReview.comment);
                }}
                className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => deleteReview()}
                disabled={deleting}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <Rating
            value={existingReview.rating}
            readOnly
            cancel={false}
            pt={{
              onIcon: { className: "text-yellow-500 !text-yellow-500" },
              offIcon: { className: "text-gray-300" },
            }}
          />
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            {existingReview.comment}
          </p>
        </div>
      ) : (
        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            {isEditing ? "Edit Your Review" : "Rate This Course"}
          </p>
          <Rating
            value={rating}
            onChange={(e) => setRating(e.value)}
            cancel={false}
            pt={{
              onIcon: {
                className:
                  "text-yellow-500 hover:!text-yellow-500 !text-yellow-500",
              },
              offIcon: { className: "hover:text-yellow-500 text-gray-300" },
            }}
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this course..."
            rows={3}
            className="w-full mt-3 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={isEditing ? handleEdit : handleSubmit}
              disabled={adding || editing}
              className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-colors cursor-pointer"
            >
              {adding || editing
                ? "Saving..."
                : isEditing
                  ? "Update Review"
                  : "Submit Review"}
            </button>
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setRating(null);
                  setComment("");
                }}
                className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* All Reviews */}
      {reviews.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-gray-800">
            Student Reviews
          </h4>
          {reviews.map((review) => (
            <div
              key={review._id}
              className="flex gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm"
            >
              <img
                src={review.userId?.imageUrl || "/default-avatar.png"}
                alt={review.userId?.name}
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">
                    {review.userId?.name}
                  </p>
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <Rating
                  value={review.rating}
                  readOnly
                  cancel={false}
                  pt={{
                    onIcon: {
                      className: "text-yellow-500 !text-yellow-500 text-xs",
                    },
                    offIcon: { className: "text-gray-300 text-xs" },
                  }}
                />
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

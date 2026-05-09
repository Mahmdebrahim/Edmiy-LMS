import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Editor } from "primereact/editor";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Upload,
  GripVertical,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { ClipLoader } from "react-spinners";
import axiosInstance from "../../config/axios.config";
import { useQueryClient } from "@tanstack/react-query";


const emptyLecture = () => ({
  lectureTitle: "",
  lectureDuration: 0,
  lectureUrl: "",
  isPreviewFree: false,
  lectureOrder: 1,
});

const emptyChapter = () => ({
  chapterOrder: 1,
  chapterTitle: "",
  chapterContent: [emptyLecture()],
});

function AddCourse() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toastRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState({ 0: true });

  const [courseData, setCourseData] = useState({
    courseTitle: "",
    courseDescription: "",
    coursePrice: 0,
    discount: 0,
    courseContent: [emptyChapter()],
  });

  // ── Thumbnail ──
  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  // ── Course field ──
  const updateCourse = (field, value) => {
    setCourseData((prev) => ({ ...prev, [field]: value }));
  };

  // ── Chapter ──
  const addChapter = () => {
    setCourseData((prev) => ({
      ...prev,
      courseContent: [
        ...prev.courseContent,
        { ...emptyChapter(), chapterOrder: prev.courseContent.length + 1 },
      ],
    }));
    setExpandedChapters((prev) => ({
      ...prev,
      [courseData.courseContent.length]: true,
    }));
  };

  const removeChapter = (ci) => {
    setCourseData((prev) => ({
      ...prev,
      courseContent: prev.courseContent
        .filter((_, i) => i !== ci)
        .map((ch, i) => ({ ...ch, chapterOrder: i + 1 })),
    }));
  };

  const updateChapter = (ci, field, value) => {
    setCourseData((prev) => ({
      ...prev,
      courseContent: prev.courseContent.map((ch, i) =>
        i === ci ? { ...ch, [field]: value } : ch,
      ),
    }));
  };

  const toggleChapter = (ci) => {
    setExpandedChapters((prev) => ({ ...prev, [ci]: !prev[ci] }));
  };

  // ── Lecture ──
  const addLecture = (ci) => {
    setCourseData((prev) => ({
      ...prev,
      courseContent: prev.courseContent.map((ch, i) =>
        i === ci
          ? {
              ...ch,
              chapterContent: [
                ...ch.chapterContent,
                {
                  ...emptyLecture(),
                  lectureOrder: ch.chapterContent.length + 1,
                },
              ],
            }
          : ch,
      ),
    }));
  };

  const removeLecture = (ci, li) => {
    setCourseData((prev) => ({
      ...prev,
      courseContent: prev.courseContent.map((ch, i) =>
        i === ci
          ? {
              ...ch,
              chapterContent: ch.chapterContent
                .filter((_, j) => j !== li)
                .map((lec, j) => ({ ...lec, lectureOrder: j + 1 })),
            }
          : ch,
      ),
    }));
  };

  const updateLecture = (ci, li, field, value) => {
    setCourseData((prev) => ({
      ...prev,
      courseContent: prev.courseContent.map((ch, i) =>
        i === ci
          ? {
              ...ch,
              chapterContent: ch.chapterContent.map((lec, j) =>
                j === li ? { ...lec, [field]: value } : lec,
              ),
            }
          : ch,
      ),
    }));
  };

  // ── Validate ──
  const validate = () => {
    if (!courseData.courseTitle.trim()) return "Course title is required";
    if (!courseData.courseDescription.trim()) return "Description is required";
    if (!thumbnail) return "Thumbnail is required";
    if (courseData.coursePrice <= 0) return "Price must be greater than 0";
    for (const ch of courseData.courseContent) {
      if (!ch.chapterTitle.trim()) return "All chapters must have a title";
      for (const lec of ch.chapterContent) {
        if (!lec.lectureTitle.trim()) return "All lectures must have a title";
        if (!lec.lectureUrl.trim()) return "All lectures must have a URL";
        if (lec.lectureDuration <= 0)
          return "All lectures must have a duration";
      }
    }
    return null;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      toastRef.current.show({
        severity: "warn",
        summary: "Validation",
        detail: error,
        life: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("courseData", JSON.stringify(courseData));
      formData.append("courseImage", thumbnail);

      const { data } = await axiosInstance.post(
        "/api/educator/add-course",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (data.course) {
        toastRef.current.show({
          severity: "success",
          summary: "Success",
          detail: "Course created successfully!",
          life: 3000,
        });
        queryClient.invalidateQueries({ queryKey: ["myCourses"] });
        setTimeout(() => navigate("/educator/my-courses"), 1500);
      }
    } catch (err) {
      toastRef.current.show({
        severity: "error",
        summary: "Error",
        detail: err?.response?.data?.message || "Failed to create course",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Toast ref={toastRef} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add New Course</h1>
          <p className="text-gray-500 text-sm mt-1">
            Fill in the details to create your course.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left — Main Info */}
        <div className="xl:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              Basic Information
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete JavaScript Course"
                  value={courseData.courseTitle}
                  onChange={(e) => updateCourse("courseTitle", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Price + Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={courseData.coursePrice}
                    onChange={(e) => updateCourse("coursePrice", e.target.value)}
                    type="number"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500!"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Discount (%)
                  </label>
                  <input
                    value={courseData.discount}
                    onChange={(e) => updateCourse("discount", e.target.value)}
                    type="number"
                    suffix="%"
                    min={0}
                    max={100}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Description <span className="text-red-500">*</span>
                </label>
                <Editor
                  value={courseData.courseDescription}
                  onTextChange={(e) =>
                    updateCourse("courseDescription", e.htmlValue || "")
                  }
                  style={{ height: "200px" }}
                />
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800">
                Course Content
              </h2>
              <button
                onClick={addChapter}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                <Plus size={16} /> Add Chapter
              </button>
            </div>

            <div className="space-y-3">
              {courseData.courseContent.map((chapter, ci) => (
                <div
                  key={chapter.chapterId}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  {/* Chapter Header */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50">
                    <GripVertical
                      size={16}
                      className="text-gray-400 shrink-0"
                    />
                    <input
                      type="text"
                      placeholder={`Chapter ${ci + 1} title`}
                      value={chapter.chapterTitle}
                      onChange={(e) =>
                        updateChapter(ci, "chapterTitle", e.target.value)
                      }
                      className="flex-1 bg-transparent text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400">
                        {chapter.chapterContent.length} lectures
                      </span>
                      <button
                        onClick={() => toggleChapter(ci)}
                        className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {expandedChapters[ci] ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                      {courseData.courseContent.length > 1 && (
                        <button
                          onClick={() => removeChapter(ci)}
                          className="p-1 text-gray-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lectures */}
                  {expandedChapters[ci] && (
                    <div className="p-4 space-y-3">
                      {chapter.chapterContent.map((lecture, li) => (
                        <div
                          key={lecture.lectureId}
                          className="bg-gray-50 rounded-xl p-4 space-y-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-gray-400 shrink-0">
                              #{li + 1}
                            </span>
                            <input
                              type="text"
                              placeholder="Lecture title"
                              value={lecture.lectureTitle}
                              onChange={(e) =>
                                updateLecture(
                                  ci,
                                  li,
                                  "lectureTitle",
                                  e.target.value,
                                )
                              }
                              className="flex-1 bg-white px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() =>
                                updateLecture(
                                  ci,
                                  li,
                                  "isPreviewFree",
                                  !lecture.isPreviewFree,
                                )
                              }
                              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                                lecture.isPreviewFree
                                  ? "bg-green-50 text-green-600"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {lecture.isPreviewFree ? (
                                <Eye size={13} />
                              ) : (
                                <EyeOff size={13} />
                              )}
                              {lecture.isPreviewFree ? "Free" : "Paid"}
                            </button>
                            {chapter.chapterContent.length > 1 && (
                              <button
                                onClick={() => removeLecture(ci, li)}
                                className="p-1.5 text-gray-400 hover:text-red-500 cursor-pointer"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">
                                YouTube URL
                              </label>
                              <input
                                type="text"
                                placeholder="https://youtu.be/..."
                                value={lecture.lectureUrl}
                                onChange={(e) =>
                                  updateLecture(
                                    ci,
                                    li,
                                    "lectureUrl",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-white px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">
                                Duration (minutes)
                              </label>
                              <InputNumber
                                value={lecture.lectureDuration}
                                onValueChange={(e) =>
                                  updateLecture(
                                    ci,
                                    li,
                                    "lectureDuration",
                                    e.value || 0,
                                  )
                                }
                                min={0}
                                suffix=" min"
                                inputClassName="w-full bg-white px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 h-9.5"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => addLecture(ci)}
                        className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Plus size={14} /> Add Lecture
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Thumbnail + Summary */}
        <div className="space-y-6 sticky top-6">
          {/* Thumbnail */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              Course Thumbnail <span className="text-red-500">*</span>
            </h2>

            <div
              onClick={() => document.getElementById("thumbnailInput").click()}
              className="relative cursor-pointer group"
            >
              {thumbnailPreview ? (
                <div className="relative">
                  <img
                    src={thumbnailPreview}
                    alt="thumbnail preview"
                    className="w-full aspect-video object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      Change Image
                    </span>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl aspect-video flex flex-col items-center justify-center gap-2 hover:border-blue-300 transition-colors">
                  <Upload size={24} className="text-gray-400" />
                  <p className="text-sm text-gray-400">
                    Click to upload thumbnail
                  </p>
                  <p className="text-xs text-gray-300">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
            <input
              id="thumbnailInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnail}
            />
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Chapters</span>
                <span className="font-medium">
                  {courseData.courseContent.length}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Lectures</span>
                <span className="font-medium">
                  {courseData.courseContent.reduce(
                    (sum, ch) => sum + ch.chapterContent.length,
                    0,
                  )}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Total Duration</span>
                <span className="font-medium">
                  {courseData.courseContent.reduce(
                    (sum, ch) =>
                      sum +
                      ch.chapterContent.reduce(
                        (s, l) => s + (l.lectureDuration || 0),
                        0,
                      ),
                    0,
                  )}{" "}
                  min
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-gray-800">
                <span className="font-medium">Final Price</span>
                <span className="font-bold">
                  $
                  {(
                    courseData.coursePrice -
                    (courseData.coursePrice * courseData.discount) / 100
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <ClipLoader size={16} color="#fff" />
            ) : (
              <Plus size={16} />
            )}
            {loading ? "Creating..." : "Create Course"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddCourse;

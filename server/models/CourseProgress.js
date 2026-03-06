import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    completed: { type: Boolean, default: false },
    lectureCompleted: [{ type: String }], 
  },
  { minimize: false, timestamps: true }, 
);

courseProgressSchema.index({ userId: 1, courseId: 1 });

export const CourseProgress = mongoose.model(
  "CourseProgress",
  courseProgressSchema,
);



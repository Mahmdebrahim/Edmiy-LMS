import React, { useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Accordion, AccordionTab } from "primereact/accordion";
import { PlayCircle, Lock, Clock, CheckCircle } from "lucide-react";
import { AppContext } from "../../context/AppContext";
import { PropagateLoader } from "react-spinners";
import YouTube from "react-youtube";
import Ratingg from "../../components/students/Rating";
import useCustomQuery, { useCustomMutation } from "../../hooks/useCustomQuery";
import { useUser } from "@clerk/clerk-react";

function Player() {
  const { id } = useParams();
  const { user } = useUser();
  const { calcCourseDuration, calcChapterTime, calcLecTime, calcLecturesNo } =
    useContext(AppContext);
  const [playerData, setPlayerData] = useState(null);

  const {
    data: courseRes,
    isLoading: courseLoading,
    error,
  } = useCustomQuery({
    queryKey: ["course", id],
    URL: `/api/course/${id}`,
  });
  const courseData = courseRes?.course;

  const { data: progressRes } = useCustomQuery({
    queryKey: ["progress", id],
    URL: "/api/user/course-progress",
    options: { enabled: !!user },
    config: { params: { courseId: id } },
  });
  const completedLectures = progressRes?.courseProgress?.lectureCompleted || [];

  const { mutate: markComplete } = useCustomMutation({
    URL: "/api/user/update-progress",
    invalidateKeys: ["progress", "allProgress"],
  });

  const handleMarkComplete = (lectureId) => {
    markComplete({ courseId: id, lectureId });
  };

  const handlePlayLecture = (lecture, sectionIndex, lectureIndex) => {
    setPlayerData({
      ...lecture,
      section: sectionIndex + 1,
      lecture: lectureIndex + 1,
    });
  };

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PropagateLoader color="#155dfc" />
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Course Not Found</h2>
          <p className="mt-4 text-gray-600">
            The link may be incorrect or the course has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-4 sm:p-10 md:px-36">
        <div className="flex flex-col xl:flex-row gap-10 items-start">
          {/* Left — Video + Reviews */}
          <div className="flex-1 w-full">
            {/* Video Player */}
            <div className="w-full">
              {playerData ? (
                <div className="w-full">
                  <YouTube
                    videoId={playerData.lectureUrl.split("/").pop()}
                    iframeClassName="w-full aspect-video rounded-xl"
                  />
                  <div className="flex justify-between items-center mt-3 px-1">
                    <p className="text-sm text-gray-700 font-medium">
                      {playerData.section}.{playerData.lecture} —{" "}
                      {playerData.lectureTitle}
                    </p>
                    <button
                      onClick={() => handleMarkComplete(playerData.lectureId)}
                      className={`flex items-center gap-1 text-sm cursor-pointer transition-colors ${
                        completedLectures.includes(playerData.lectureId)
                          ? "text-green-600 font-medium"
                          : "text-blue-600 hover:text-blue-800"
                      }`}
                    >
                      <CheckCircle size={16} />
                      {completedLectures.includes(playerData.lectureId)
                        ? "Completed"
                        : "Mark Complete"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-video bg-gray-100 rounded-xl flex flex-col items-center justify-center">
                  <PlayCircle size={56} className="text-gray-300 mb-3" />
                  <p className="text-gray-500">
                    Select a lecture to start watching
                  </p>
                </div>
              )}
            </div>

            {/*  Reviews تحت الفيديو */}
            <div className="mt-8">
              <Ratingg courseId={id} />
            </div>
          </div>

          {/* Right — Sticky Sidebar */}
          <div className="xl:sticky xl:top-5 w-full xl:w-96 shrink-0">
            <div className="bg-white border border-gray-100 rounded-lg p-2 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">
                  Course Structure
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                  <span>{courseData.courseContent?.length || 0} sections</span>
                  <span>•</span>
                  <span>{calcLecturesNo(courseData)} lectures</span>
                  <span>•</span>
                  <span>{calcCourseDuration(courseData)}</span>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto max-h-[70vh]">
                <Accordion activeIndex={0}>
                  {courseData.courseContent?.map((chapter, i) => (
                    <AccordionTab
                      key={chapter.chapterId || i}
                      header={
                        <div className="flex justify-between items-center w-full pr-2">
                          <span className="font-semibold text-gray-900 text-sm">
                            {chapter.chapterTitle}
                          </span>
                          <span className="text-xs text-gray-500 shrink-0 ml-2">
                            {chapter.chapterContent?.length || 0} •{" "}
                            {calcChapterTime(chapter)}
                          </span>
                        </div>
                      }
                    >
                      <div className="space-y-1">
                        {chapter.chapterContent?.map((lecture, idx) => {
                          const isCompleted = completedLectures.includes(
                            lecture.lectureId,
                          );
                          return (
                            <div
                              key={lecture.lectureId || idx}
                              onClick={() => handlePlayLecture(lecture, i, idx)}
                              className={`flex items-center justify-between p-2.5 rounded-lg transition-colors cursor-pointer group ${
                                playerData?.lectureId === lecture.lectureId
                                  ? "bg-blue-50 border border-blue-100"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {isCompleted ? (
                                  <CheckCircle
                                    size={15}
                                    className="text-green-500 shrink-0"
                                  />
                                ) : playerData?.lectureId ===
                                  lecture.lectureId ? (
                                  <PlayCircle
                                    size={15}
                                    className="text-blue-600 shrink-0"
                                  />
                                ) : (
                                  <PlayCircle
                                    size={15}
                                    className="text-gray-400 shrink-0"
                                  />
                                )}
                                <span
                                  className={`text-xs truncate ${
                                    isCompleted
                                      ? "line-through text-green-600"
                                      : playerData?.lectureId ===
                                          lecture.lectureId
                                        ? "text-blue-700 font-medium"
                                        : "text-gray-700"
                                  }`}
                                >
                                  {lecture.lectureTitle}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0 ml-2">
                                <Clock size={11} />
                                <span>
                                  {calcLecTime(lecture.lectureDuration)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionTab>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Player;

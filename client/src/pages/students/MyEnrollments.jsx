import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Rating } from "primereact/rating";
import { ProgressBar } from "primereact/progressbar";
import { Skeleton } from "primereact/skeleton"; // ← أضفناه
import { AppContext } from "../../context/AppContext";
// import { useUser } from "@clerk/clerk-react";
import useCustomQuery from "../../hooks/useCustomQuery";

export default function MyEnrollments() {
  const { enrolledCourses, calcAvgRatin, calcCourseDuration, userData } =
    useContext(AppContext);
  // const { user } = useUser();
  const navigate = useNavigate();

  // ✅ جيب كل الـ progress من الباك
  const { data: progressData, isLoading: progressLoading } = useCustomQuery({
    queryKey: ["allProgress"],
    URL: "/api/user/all-progress",
    options: { enabled: !!userData },
  });

  const progressList = progressData?.progressList || [];

  const getProgress = (courseId) => {
    const progress = progressList.find((p) => p.courseId === courseId);
    return {
      lectureCompleted: progress?.lectureCompleted?.length || 0,
      totalLectures: enrolledCourses.find((c) => c._id === courseId)
        ? enrolledCourses
            .find((c) => c._id === courseId)
            .courseContent?.reduce(
              (acc, ch) => acc + (ch.chapterContent?.length || 0),
              0,
            )
        : 0,
    };
  };

  const loading = progressLoading || !progressData;

  if (loading) {
    return (
      <div className="md:px-36 px-8 pt-10">
        <h2 className="text-home-heading-small text-gray-800 font-bold mb-4">
          My Enrollments
        </h2>
        <div className="card">
          <DataTable
            value={Array.from({ length: 3 })}
            className="p-datatable-striped"
          >
            <Column
              header="Thumbnail"
              body={() => (
                <Skeleton shape="rectangle" height="80px" className="w-24" />
              )}
              style={{ width: "10%" }}
            />
            <Column
              header="Course Title"
              body={() => <Skeleton height="1.5rem" className="w-full" />}
              style={{ width: "30%" }}
            />
            <Column
              header="Duration"
              body={() => <Skeleton height="1.5rem" />}
              style={{ width: "15%" }}
            />
            <Column
              header="Reviews"
              body={() => <Skeleton height="1.5rem" />}
              style={{ width: "15%" }}
            />
            <Column
              header="Completed"
              body={() => <Skeleton height="1.5rem" />}
              style={{ width: "15%" }}
            />
            <Column
              header="Status"
              body={() => <Skeleton height="1.5rem" />}
              style={{ width: "15%" }}
            />
          </DataTable>
        </div>
      </div>
    );
  }

  return (
    <div className="md:px-36 px-8 pt-10">
      <h2 className="text-home-heading-small text-gray-800 font-bold mb-4">
        My Enrollments
      </h2>
      <div className="card">
        <DataTable
          value={enrolledCourses}
          header={<span className="text-xl font-bold">Courses</span>}
          footer={`In total there are ${enrolledCourses.length} courses`}
        >
          <Column
            header="Thumbnail"
            body={(rowData) => (
              <img
                src={rowData.courseThumbnail}
                alt={rowData.courseTitle}
                className="w-26 shadow-2 border-round"
              />
            )}
            style={{ width: "10%" }}
          />

          <Column
            header="Course Title"
            body={(rowData) => {
              const { lectureCompleted, totalLectures } = getProgress(
                rowData._id,
              );
              const percent = totalLectures
                ? (lectureCompleted / totalLectures) * 100
                : 0;
              return (
                <div className="flex flex-col gap-4 w-full">
                  <span className="font-medium">{rowData.courseTitle}</span>
                  <ProgressBar
                    value={percent}
                    displayValueTemplate={(v) => `${Math.round(v)}%`}
                    style={{ height: "14px" }}
                  />
                </div>
              );
            }}
            style={{ width: "30%", minWidth: "220px" }}
          />

          <Column
            header="Duration"
            body={(rowData) => <span>{calcCourseDuration(rowData)}</span>}
            style={{ width: "15%" }}
          />

          <Column
            header="Reviews"
            body={(rowData) => (
              <Rating
                value={calcAvgRatin(rowData)}
                readOnly
                cancel={false}
                pt={{
                  onIcon: { className: "text-yellow-500 !text-yellow-500" },
                  offIcon: { className: "text-gray-300" },
                }}
              />
            )}
            style={{ width: "15%" }}
          />

          <Column
            header="Completed"
            body={(rowData) => {
              const { lectureCompleted, totalLectures } = getProgress(
                rowData._id,
              );
              return `${lectureCompleted} / ${totalLectures} Lectures`;
            }}
            style={{ width: "15%" }}
          />

          <Column
            header="Status"
            body={(rowData) => {
              const { lectureCompleted, totalLectures } = getProgress(
                rowData._id,
              );
              const isCompleted =
                totalLectures > 0 && lectureCompleted === totalLectures;
              return (
                <button
                  onClick={() => navigate(`/player/${rowData._id}`)}
                  className={`p-button p-button-text p-button-rounded p-button-sm ${isCompleted ? "text-green-600" : "text-blue-600"}`}
                >
                  {isCompleted ? "Completed" : "On Going"}
                </button>
              );
            }}
            style={{ width: "15%" }}
          />
        </DataTable>
      </div>
    </div>
  );
}

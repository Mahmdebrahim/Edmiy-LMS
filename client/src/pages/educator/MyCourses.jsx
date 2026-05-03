import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import useCustomQuery, { useCustomMutation } from "../../hooks/useCustomQuery";
import { PropagateLoader, ClipLoader } from "react-spinners";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
function MyCourses() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { currency } = useContext(AppContext);

  const { data, isLoading } = useCustomQuery({
    queryKey: ["myCourses"],
    URL: "/api/educator/courses",
    options: { enabled: isLoaded && !!user },
  });

  const courses = data?.courses;

  const {
    mutate: togglePublish,
    isPending: toggling,
    variables: togglingVars,
  } = useCustomMutation({
    URL: "",
    method: "patch",
    invalidateKeys: ["myCourses", "courses"],
    onSuccess: (data) => {
      toast.success(
        data.isPublished ? "Course published!" : "Course unpublished",
      );
    },
    onError: () => toast.error("Failed to update course status"),
  });

  const handleTogglePublish = (courseId) => {
    togglePublish({
      _url: `/api/educator/course/${courseId}/toggle-publish`,
    });
  };

  if (isLoading || !courses) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <PropagateLoader color="#155dfc" />
      </div>
    );
  }

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-xl font-semibold text-gray-800">My Courses</h3>
      <span className="text-sm text-gray-500">
        Total {courses.length} courses
      </span>
    </div>
  );

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage and track your published and unpublished courses.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <DataTable
          value={courses}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          header={header}
          emptyMessage="No courses found. Start creating your first course!"
          tableStyle={{ minWidth: "50rem" }}
          className="p-datatable-sm"
        >
          {/* Course */}
          <Column
            header="Course"
            body={(row) => (
              <div className="flex items-center gap-4">
                <img
                  src={row.courseThumbnail}
                  alt={row.courseTitle}
                  className="w-16 h-12 rounded-lg object-cover border border-gray-200"
                />
                <span className="font-medium text-sm text-gray-800">
                  {row.courseTitle.length > 50
                    ? row.courseTitle.substring(0, 50) + "..."
                    : row.courseTitle}
                </span>
              </div>
            )}
            style={{ width: "40%" }}
          />

          {/* Price */}
          <Column
            header="Price"
            body={(row) => (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">
                  {currency}
                  {(
                    row.coursePrice -
                    (row.coursePrice * row.discount) / 100
                  ).toFixed(2)}
                </span>
                {row.discount > 0 && (
                  <span className="text-xs text-gray-400 line-through">
                    {currency}
                    {row.coursePrice}
                  </span>
                )}
              </div>
            )}
            style={{ width: "12%" }}
          />

          {/* Students */}
          <Column
            header="Students"
            body={(row) => (
              <span className="text-sm text-gray-600">
                {row.enrolledStudents?.length || 0}
              </span>
            )}
            style={{ width: "12%" }}
          />

          {/* Status — clickable toggle */}
          <Column
            header="Status"
            body={(row) => {
              const isToggling =
                toggling && togglingVars?._url?.includes(row._id);

              return (
                <button
                  onClick={() => handleTogglePublish(row._id)}
                  disabled={isToggling}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    row.isPublished
                      ? "bg-green-50 text-green-600 hover:bg-green-100"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {isToggling ? (
                    <>
                      <ClipLoader size={10} color="currentColor" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          row.isPublished ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                      {row.isPublished ? "Published" : "Draft"}
                    </>
                  )}
                </button>
              );
            }}
            style={{ width: "15%" }}
          />

          {/* Created */}
          <Column
            header="Created"
            body={(row) => (
              <span className="text-sm text-gray-500">
                {new Date(row.createdAt).toLocaleDateString()}
              </span>
            )}
            style={{ width: "15%" }}
          />
          <Column
            header=""
            body={(row) => (
              <button
                onClick={() => navigate(`/educator/edit-course/${row._id}`)}
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
              >
                <Pencil size={15} />
              </button>
            )}
            style={{ width: "5%" }}
          />
        </DataTable>
      </div>
    </div>
  );
}

export default MyCourses;

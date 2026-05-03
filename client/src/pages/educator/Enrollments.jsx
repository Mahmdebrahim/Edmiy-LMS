import React from "react";
import useCustomQuery from "../../hooks/useCustomQuery";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Skeleton } from "primereact/skeleton";
import { useUser } from "@clerk/clerk-react";

function Enrollments() {
  const { user, isLoaded } = useUser();

  const { data, isLoading } = useCustomQuery({
    queryKey: ["enrolledStudents"],
    URL: "/api/educator/enrolled-students",
    options: { enabled: isLoaded && !!user },
  });

  const enrollments = data?.enrolledStudents;



  const header = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-xl font-semibold text-gray-800">Recent Enrollments</h3>
      <span className="text-sm text-gray-500">
        Total {enrollments?.length || 0} enrollments
      </span>
    </div>
  );

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Enrollments</h1>
        <p className="text-gray-500 text-sm mt-1">
          Track all student enrollments across your courses.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        {isLoading || !isLoaded ? (
          <div>
            <DataTable
              value={Array.from({ length: 5 })}
              tableStyle={{ minWidth: "50rem" }}
              className="p-datatable-sm"
              paginator={false}
            >
              {/* Student */}
              <Column
                header="Student"
                body={() => (
                  <div className="flex items-center gap-3">
                    <Skeleton shape="circle" size="2.5rem" className="bg-gray-200 shrink-0" />
                    <Skeleton height="1rem" width="120px" className="bg-gray-200" />
                  </div>
                )}
                style={{ width: "40%" }}
              />

              {/* Course */}
              <Column
                header="Course"
                body={() => (
                  <Skeleton height="1rem" width="160px" className="bg-gray-200" />
                )}
                style={{ width: "40%" }}
              />

              {/* Date */}
              <Column
                header="Date"
                body={() => (
                  <Skeleton height="1rem" width="90px" className="bg-gray-200" />
                )}
                style={{ width: "20%" }}
              />
            </DataTable>
          </div>
        ) : (
          <DataTable
            value={enrollments}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          header={header}
          emptyMessage="No enrollments found yet."
          tableStyle={{ minWidth: "50rem" }}
          className="p-datatable-sm"
        >
          {/* Student */}
          <Column
            header="Student"
            body={(row) => (
              <div className="flex items-center gap-3">
                <img
                  src={
                    row.student?.imageUrl ||
                    `https://ui-avatars.com/api/?name=${row.student?.name || "Student"}&background=random`
                  }
                  alt={row.student?.name || "Student"}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <span className="font-medium text-sm text-gray-800">
                  {row.student?.name || "Unknown Student"}
                </span>
              </div>
            )}
            style={{ width: "40%" }}
          />

          {/* Course */}
          <Column
            header="Course"
            body={(row) => (
              <span className="text-sm text-gray-600 font-medium">
                {row.courseTitle?.length > 40
                  ? row.courseTitle.substring(0, 40) + "..."
                  : row.courseTitle}
              </span>
            )}
            style={{ width: "40%" }}
          />

          {/* Date */}
          <Column
            header="Date"
            body={(row) => (
              <span className="text-sm text-gray-500">
                {new Date(row.purchaseDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
            style={{ width: "20%" }}
          />
        </DataTable>
        )}
      </div>
    </div>
  );
}

export default Enrollments;

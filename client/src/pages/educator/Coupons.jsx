import React, { useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { ClipLoader, PropagateLoader } from "react-spinners";
import useCustomQuery, { useCustomMutation } from "../../hooks/useCustomQuery";
import { toast as toastify } from "react-toastify";
import { Skeleton } from "primereact/skeleton";
function Coupons() {
  const { user, isLoaded } = useUser();
  const toastRef = useRef(null);

  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    code: "",
    courseId: "",
    discount: 10,
    maxUses: 100,
    expiresAt: null,
  });

  // ── Queries ──
  const {
    data: couponsData,
    isLoading: loadingCoupons,
    isError: couponsError,
    refetch,
  } = useCustomQuery({
    queryKey: ["educatorCoupons"],
    URL: "/api/coupon/educator",
    options: { enabled: isLoaded && !!user },
  });
  const coupons = couponsData?.coupons || [];

  const { data: coursesData } = useCustomQuery({
    queryKey: ["myCourses"],
    URL: "/api/educator/courses",
    options: { enabled: isLoaded && !!user },
  });
  const courseOptions = (coursesData?.courses || []).map((c) => ({
    label: c.courseTitle,
    value: c._id,
  }));

  // ── Create ──
  const { mutate: createCoupon, isPending: creating } = useCustomMutation({
    URL: "/api/coupon/create",
    invalidateKeys: ["educatorCoupons"],
    onSuccess: (data) => {
      if (data.success) {
        toastRef.current?.show({
          severity: "success",
          summary: "Created!",
          detail: `Coupon ${data.coupon.code} created`,
          life: 3000,
        });
        setShowDialog(false);
        resetForm();
      } else {
        toastRef.current?.show({
          severity: "error",
          summary: "Error",
          detail: data.message,
          life: 3000,
        });
      }
    },
    onError: () =>
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to create coupon",
        life: 3000,
      }),
  });

  // ── Toggle ──
  const {
    mutate: toggleCoupon,
    isPending: toggling,
    variables: togglingVars,
  } = useCustomMutation({
    URL: "",
    method: "patch",
    invalidateKeys: ["educatorCoupons"],
    onSuccess: (data) => {
      toastify.success(
        data.isActive ? "Coupon activated" : "Coupon deactivated",
      );
    },
    onError: () => toastify.error("Failed to toggle coupon"),
  });

  // ── Delete ──
  const {
    mutate: deleteCoupon,
    isPending: deleting,
    variables: deletingVars,
  } = useCustomMutation({
    URL: "",
    method: "delete",
    invalidateKeys: ["educatorCoupons"],
    onSuccess: () => toastify.success("Coupon deleted"),
    onError: () => toastify.error("Failed to delete coupon"),
  });

  // ── Form ──
  const resetForm = () =>
    setForm({
      code: "",
      courseId: "",
      discount: 10,
      maxUses: 100,
      expiresAt: null,
    });

  const handleSubmit = () => {
    if (!form.code.trim())
      return toastRef.current?.show({
        severity: "warn",
        summary: "Required",
        detail: "Coupon code is required",
        life: 3000,
      });
    if (!form.courseId)
      return toastRef.current?.show({
        severity: "warn",
        summary: "Required",
        detail: "Please select a course",
        life: 3000,
      });
    if (!form.expiresAt)
      return toastRef.current?.show({
        severity: "warn",
        summary: "Required",
        detail: "Expiry date is required",
        life: 3000,
      });
    createCoupon({ ...form, code: form.code.toUpperCase() });
  };

  const handleDelete = (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    deleteCoupon({ _url: `/api/coupon/delete/${couponId}` });
  };

  // ── Loading ──
  // if (!isLoaded || loadingCoupons) {
  //   return (

  //   );
  // }

  // ── Error ──
  if (couponsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500">Failed to load coupons.</p>
        <button
          onClick={() => refetch()}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── Dialog Footer ──
  const dialogFooter = (
    <div className="flex justify-end gap-3 pt-2">
      <button
        onClick={() => {
          setShowDialog(false);
          resetForm();
        }}
        disabled={creating}
        className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-sm font-medium disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        disabled={creating}
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors cursor-pointer text-sm font-medium disabled:opacity-70 flex items-center gap-2"
      >
        {creating ? <ClipLoader size={14} color="#fff" /> : <Plus size={14} />}
        {creating ? "Creating..." : "Create Coupon"}
      </button>
    </div>
  );

  return (
    <div className="space-y-6 pb-8">
      <Toast ref={toastRef} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Coupons</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage discount coupons for your courses.
          </p>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors cursor-pointer text-sm"
        >
          <Plus size={16} /> New Coupon
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        {loadingCoupons || !isLoaded ? (
          <div>
            <DataTable
              value={Array.from({ length: 5 })} 
              tableStyle={{ minWidth: "50rem" }}
              className="p-datatable-sm"
              paginator={false}
            >
              {/* Code Column */}
              <Column
                header="Code"
                body={() => (
                  <div className="flex items-center gap-2">
                    <Skeleton
                      shape="circle"
                      size="14px"
                      className="bg-gray-200"
                    />
                    <Skeleton
                      height="1rem"
                      width="80px"
                      className="bg-gray-200"
                    />
                  </div>
                )}
                style={{ width: "15%" }}
              />

              {/* Course Column */}
              <Column
                header="Course"
                body={() => (
                  <Skeleton
                    height="1rem"
                    width="100%"
                    className="bg-gray-200"
                  />
                )}
                style={{ width: "25%" }}
              />

              {/* Discount Column */}
              <Column
                header="Discount"
                body={() => (
                  <Skeleton
                    shape="rectangle"
                    height="1.5rem"
                    width="60px"
                    borderRadius="12px"
                    className="bg-gray-200"
                  />
                )}
                style={{ width: "10%" }}
              />

              {/* Usage Column */}
              <Column
                header="Usage"
                body={() => (
                  <div className="flex flex-col gap-2">
                    <Skeleton
                      height="0.8rem"
                      width="60px"
                      className="bg-gray-200"
                    />
                    <Skeleton
                      height="0.4rem"
                      width="80px"
                      borderRadius="4px"
                      className="bg-gray-200"
                    />
                  </div>
                )}
                style={{ width: "15%" }}
              />

              {/* Expires Column */}
              <Column
                header="Expires"
                body={() => (
                  <Skeleton
                    height="1rem"
                    width="90px"
                    className="bg-gray-200"
                  />
                )}
                style={{ width: "15%" }}
              />

              {/* Status Column */}
              <Column
                header="Status"
                body={() => (
                  <Skeleton
                    shape="rectangle"
                    height="1.8rem"
                    width="70px"
                    borderRadius="20px"
                    className="bg-gray-200"
                  />
                )}
                style={{ width: "12%" }}
              />

              {/* Actions Column */}
              <Column
                header=""
                body={() => (
                  <Skeleton
                    shape="circle"
                    size="1.5rem"
                    className="bg-gray-200"
                  />
                )}
                style={{ width: "8%" }}
              />
            </DataTable>
          </div>
        ) : (
          <DataTable
            value={coupons}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            emptyMessage="No coupons yet. Create your first coupon!"
            tableStyle={{ minWidth: "50rem" }}
            className="p-datatable-sm"
          >
            {/* Code */}
            <Column
              header="Code"
              body={(row) => (
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-blue-500" />
                  <span className="font-mono font-bold text-gray-800 text-sm">
                    {row.code}
                  </span>
                </div>
              )}
              style={{ width: "15%" }}
            />

            {/* Course */}
            <Column
              header="Course"
              body={(row) => (
                <span className="text-sm text-gray-700 line-clamp-1">
                  {row.courseId?.courseTitle || "—"}
                </span>
              )}
              style={{ width: "25%" }}
            />

            {/* Discount */}
            <Column
              header="Discount"
              body={(row) => (
                <span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full">
                  {row.discount}% OFF
                </span>
              )}
              style={{ width: "10%" }}
            />

            {/* Usage */}
            <Column
              header="Usage"
              body={(row) => (
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-700">
                    {row.usedCount} / {row.maxUses}
                  </span>
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min((row.usedCount / row.maxUses) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              style={{ width: "15%" }}
            />

            {/* Expires */}
            <Column
              header="Expires"
              body={(row) => {
                const expired = new Date() > new Date(row.expiresAt);
                return (
                  <span
                    className={`text-sm ${expired ? "text-red-500" : "text-gray-500"}`}
                  >
                    {new Date(row.expiresAt).toLocaleDateString()}
                    {expired && <span className="ml-1 text-xs">(Expired)</span>}
                  </span>
                );
              }}
              style={{ width: "15%" }}
            />

            {/* Status */}
            <Column
              header="Status"
              body={(row) => {
                const isToggling =
                  toggling && togglingVars?._url?.includes(row._id);
                return (
                  <button
                    onClick={() =>
                      toggleCoupon({ _url: `/api/coupon/toggle/${row._id}` })
                    }
                    disabled={isToggling}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      row.isActive
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {isToggling ? (
                      <ClipLoader size={10} color="currentColor" />
                    ) : row.isActive ? (
                      <ToggleRight size={14} />
                    ) : (
                      <ToggleLeft size={14} />
                    )}
                    {row.isActive ? "Active" : "Inactive"}
                  </button>
                );
              }}
              style={{ width: "12%" }}
            />

            {/* Delete */}
            <Column
              header=""
              body={(row) => {
                const isDeleting =
                  deleting && deletingVars?._url?.includes(row._id);
                return (
                  <button
                    onClick={() => handleDelete(row._id)}
                    disabled={isDeleting}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                  >
                    {isDeleting ? (
                      <ClipLoader size={14} color="#ef4444" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                );
              }}
              style={{ width: "8%" }}
            />
          </DataTable>
        )}
      </div>

      {/* Dialog */}
      <Dialog
        visible={showDialog}
        onHide={() => {
          setShowDialog(false);
          resetForm();
        }}
        header={
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-blue-600" />
            <span className="font-semibold text-gray-800">
              Create New Coupon
            </span>
          </div>
        }
        footer={dialogFooter}
        className="w-full max-w-md"
        draggable={false}
      >
        <div className="space-y-4 pt-2">
          {/* Code */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Coupon Code <span className="text-red-500">*</span>
            </label>
            <InputText
              value={form.code}
              onChange={(e) =>
                setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))
              }
              placeholder="e.g. SAVE20"
              disabled={creating}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">
              Converted to uppercase automatically
            </p>
          </div>

          {/* Course */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Course <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={form.courseId}
              onChange={(e) => setForm((p) => ({ ...p, courseId: e.value }))}
              options={courseOptions}
              placeholder="Select a course"
              disabled={creating}
              className="w-full"
              pt={{
                root: { className: "w-full border border-gray-200 rounded-xl" },
                input: { className: "px-4 py-2.5 text-sm" },
              }}
            />
          </div>

          {/* Discount + Max Uses */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Discount (%)
              </label>
              <InputNumber
                value={form.discount}
                onValueChange={(e) =>
                  setForm((p) => ({ ...p, discount: e.value || 0 }))
                }
                min={1}
                max={100}
                suffix="%"
                disabled={creating}
                inputClassName="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Max Uses
              </label>
              <InputNumber
                value={form.maxUses}
                onValueChange={(e) =>
                  setForm((p) => ({ ...p, maxUses: e.value || 1 }))
                }
                min={1}
                disabled={creating}
                inputClassName="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <Calendar
              value={form.expiresAt}
              onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.value }))}
              minDate={new Date()}
              dateFormat="dd/mm/yy"
              placeholder="Select expiry date"
              disabled={creating}
              className="w-full"
              inputClassName="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
              showIcon
            />
          </div>

          {/* Preview */}
          {form.code && form.discount && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
              <Tag size={16} className="text-blue-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-blue-700 font-mono">
                  {form.code}
                </p>
                <p className="text-xs text-blue-500">
                  {form.discount}% off • {form.maxUses} uses max
                </p>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}

export default Coupons;

import React, { useContext } from "react";
import ReactApexChart from "react-apexcharts";
import { useUser } from "@clerk/clerk-react";
import { AppContext } from "../../context/AppContext";
import useCustomQuery from "../../hooks/useCustomQuery";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import {
  DollarSign,
  Users,
  BookOpen,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

function Dashboard() {
  const { user, isLoaded } = useUser();
  const { currency } = useContext(AppContext);

  const { data, isLoading } = useCustomQuery({
    queryKey: ["dashboardData"],
    URL: "/api/educator/dashboard-data",
    options: { enabled: isLoaded && !!user },
  });

  const d = data?.data;

  // ── Skeleton Loading State ──
  if (isLoading || !d) {
    return (
      <div className="space-y-8 pb-8 animate-pulse">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-48 bg-gray-100 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5"
            >
              <div className="flex justify-between mb-4">
                <div className="h-10 w-10 bg-gray-100 rounded-xl" />
                <div className="h-5 w-12 bg-gray-50 rounded-full" />
              </div>
              <div className="h-7 w-24 bg-gray-200 rounded-lg mb-2" />
              <div className="h-4 w-20 bg-gray-100 rounded-lg mb-1" />
              <div className="h-3 w-28 bg-gray-50 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="h-80 bg-white rounded-2xl border border-gray-100 p-5" />
          <div className="h-80 bg-white rounded-2xl border border-gray-100 p-5" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="h-80 bg-white rounded-2xl border border-gray-100 p-5" />
          <div className="h-80 bg-white rounded-2xl border border-gray-100 p-5" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="h-6 w-40 bg-gray-200 rounded-lg mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-8 w-8 bg-gray-100 rounded-full shrink-0" />
                <div className="h-4 flex-1 bg-gray-100 rounded-lg" />
                <div className="h-4 w-20 bg-gray-100 rounded-lg" />
                <div className="h-4 w-16 bg-gray-50 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── KPI Cards ──
  const kpis = [
    {
      label: "Total Revenue",
      value: `${currency}${d.totalRevenue.toLocaleString()}`,
      icon: <DollarSign size={22} className="text-blue-600" />,
      bg: "bg-blue-50",
      growth: d.revenueGrowth,
      sub: `${currency}${d.thisMonthRevenue.toLocaleString()} this month`,
    },
    {
      label: "Total Students",
      value: d.totalStudents.toLocaleString(),
      icon: <Users size={22} className="text-purple-600" />,
      bg: "bg-purple-50",
      growth: d.studentsGrowth,
      sub: `${d.thisMonthStudents} new this month`,
    },
    {
      label: "Total Courses",
      value: d.totalCourses,
      icon: <BookOpen size={22} className="text-green-600" />,
      bg: "bg-green-50",
      growth: null,
      sub: `${d.publishedCourses} published`,
    },
    {
      label: "Avg Rating",
      value: d.avgRating.toFixed(1),
      icon: <Star size={22} className="text-yellow-500" />,
      bg: "bg-yellow-50",
      growth: null,
      sub: `from ${d.totalReviews} reviews`,
    },
  ];

  // ── Growth Badge ──
  const GrowthBadge = ({ value }) => {
    if (value === null || value === undefined) return null;
    if (value > 0)
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
          <TrendingUp size={12} /> +{value}%
        </span>
      );
    if (value < 0)
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
          <TrendingDown size={12} /> {value}%
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
        <Minus size={12} /> 0%
      </span>
    );
  };

  // ── Chart Configs ──
  const chartBase = {
    grid: { borderColor: "#f1f5f9" },
    dataLabels: { enabled: false },
  };

  const revenueChartOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: { curve: "smooth", width: 3 },
    colors: ["#3b82f6"],
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05 },
    },
    xaxis: { categories: d.monthlyRevenue.map((m) => m.month) },
    yaxis: { labels: { formatter: (v) => `${currency}${v}` } },
    tooltip: { y: { formatter: (v) => `${currency}${v.toLocaleString()}` } },
    ...chartBase,
  };

  const studentsChartOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    colors: ["#8b5cf6"],
    plotOptions: { bar: { borderRadius: 6, columnWidth: "50%" } },
    xaxis: { categories: d.monthlyStudents.map((m) => m.month) },
    tooltip: { y: { formatter: (v) => `${v} students` } },
    ...chartBase,
  };

  const coursesChartOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    colors: ["#10b981"],
    plotOptions: { bar: { borderRadius: 4, horizontal: true } },
    xaxis: { categories: d.coursesSales.map((c) => c.name) },
    tooltip: {
      y: {
        formatter: (v) =>
          `${currency}${v.toLocaleString()}`,
      },
    },
    ...chartBase,
  };

  const ratingChartOptions = {
    chart: { type: "donut" },
    colors: ["#ef4444", "#f97316", "#eab308", "#3b82f6", "#10b981"],
    labels: d.ratingDistribution.map((r) => r.rating),
    legend: { position: "bottom" },
    dataLabels: { enabled: true },
    plotOptions: { pie: { donut: { size: "60%" } } },
  };
  const ratingChartSeries = d.ratingDistribution.map((r) => r.count);

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here's what's happening with your courses.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${kpi.bg}`}>{kpi.icon}</div>
              <GrowthBadge value={kpi.growth} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
            <p className="text-sm font-medium text-gray-600 mt-0.5">
              {kpi.label}
            </p>
            <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Monthly Revenue
          </h3>
          <ReactApexChart
            options={revenueChartOptions}
            series={[
              {
                name: "Revenue",
                data: d.monthlyRevenue.map((m) => m.revenue),
              },
            ]}
            type="area"
            height={250}
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Student Growth
          </h3>
          <ReactApexChart
            options={studentsChartOptions}
            series={[
              {
                name: "New Students",
                data: d.monthlyStudents.map((m) => m.students),
              },
            ]}
            type="bar"
            height={250}
          />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Top Courses by Revenue
          </h3>
          {d.coursesSales.length === 0 ? (
            <div className="flex items-center justify-center h-62.5 text-gray-400 text-sm">
              No sales data yet
            </div>
          ) : (
            <ReactApexChart
              options={coursesChartOptions}
              series={[
                {
                  name: "Revenue",
                  data: d.coursesSales.map((c) => c.revenue),
                },
              ]}
              type="bar"
              height={250}
            />
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Rating Distribution
          </h3>
          {ratingChartSeries.every((v) => v === 0) ? (
            <div className="flex items-center justify-center h-62.5 text-gray-400 text-sm">
              No ratings yet
            </div>
          ) : (
            <ReactApexChart
              options={ratingChartOptions}
              series={ratingChartSeries}
              type="donut"
              height={250}
            />
          )}
        </div>
      </div>

      {/* Recent Enrollments Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Recent Enrollments
        </h3>
        <DataTable
          value={d.recentEnrollments || []}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10]}
          emptyMessage="No students enrolled yet"
          tableStyle={{ minWidth: "40rem" }}
          className="p-datatable-sm"
        >
          <Column
            header="#"
            body={(_, { rowIndex }) => (
              <span className="text-gray-500 text-sm">{rowIndex + 1}</span>
            )}
            style={{ width: "5%" }}
          />
          <Column
            header="Student"
            body={(row) => (
              <div className="flex items-center gap-3">
                <img
                  src={
                    row.student?.imageUrl ||
                    `https://ui-avatars.com/api/?name=${row.student?.name || "S"}&background=random`
                  }
                  alt={row.student?.name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
                <span className="font-medium text-sm">
                  {row.student?.name || "Unknown"}
                </span>
              </div>
            )}
            style={{ width: "30%" }}
          />
          <Column
            header="Course"
            body={(row) => (
              <span className="text-sm text-gray-700">{row.courseTitle}</span>
            )}
            style={{ width: "35%" }}
          />
          <Column
            header="Amount"
            body={(row) => (
              <span className="text-sm font-medium text-green-600">
                {currency}
                {row.amount.toLocaleString()}
              </span>
            )}
            style={{ width: "15%" }}
          />
          <Column
            header="Date"
            body={(row) => (
              <span className="text-sm text-gray-400">
                {new Date(row.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
            style={{ width: "15%" }}
          />
        </DataTable>
      </div>
    </div>
  );
}

export default Dashboard;

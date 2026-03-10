import React, { useState, useEffect } from "react";
import SearchBar from "../../components/common/searchBar";
import { useNavigate, useParams } from "react-router-dom";
import CourseCard from "../../components/students/courseCard";
import CourseCardSkeleton from "../../components/skeletons/CourseCardSkeleton";
import useCustomQuery from "../../hooks/useCustomQuery";
import { useDebounce } from "../../hooks/useDebounce";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Star,
  DollarSign,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function CourseList() {
  const navigate = useNavigate();
  const { input } = useParams();

  const [search, setSearch] = useState(input || "");
  const [sort, setSort] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [page, setPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(8);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 500);
  const hasFilters = sort || minPrice || maxPrice || minRating;

  // Reset on filter change
  useEffect(() => {
    setPage(1);
    setVisibleCount(8);
  }, [debouncedSearch, sort, minPrice, maxPrice, minRating]);

  useEffect(() => {
    setSearch(input || "");
  }, [input]);

  const { data, isLoading } = useCustomQuery({
    queryKey: [
      "courses",
      debouncedSearch,
      sort,
      minPrice,
      maxPrice,
      minRating,
      page,
    ],
    URL: "/api/course/all",
    config: {
      params: {
        search: debouncedSearch || undefined,
        sort: sort || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        minRating: minRating || undefined,
        page,
        limit: 16,
      },
    },
  });

  const courses = data?.courses || [];
  const totalPages = data?.totalPages || 1;
  const totalCourses = data?.total || 0;
  const visibleCourses = courses.slice(0, visibleCount);
  const hasMoreInPage = visibleCount < courses.length;

  const handleClearAll = () => {
    setSearch("");
    setSort("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setPage(1);
    setVisibleCount(8);
    navigate("/course-list");
  };

  const handlePageChange = (p) => {
    setPage(p);
    setVisibleCount(8);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  return (
    <div className="relative md:px-36 px-8 pt-20 text-left">
      {/* Header */}
      <div className="flex flex-wrap md:flex-row px-4 md:px-0 flex-col gap-6 items-start justify-between w-full">
        <div>
          <h1 className="text-4xl font-semibold text-gray-800">Course List</h1>
          <p className="text-gray-500">
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => navigate("/")}
            >
              Home
            </span>{" "}
            / <span>Course List</span>
          </p>
        </div>
        <SearchBar value={search} />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center gap-3 px-4 md:px-0 mt-8">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
            showFilters || hasFilters
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
          }`}
        >
          <SlidersHorizontal size={16} />
          Filters
          {hasFilters && (
            <span className="bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {[sort, minPrice, maxPrice, minRating].filter(Boolean).length}
            </span>
          )}
          <ChevronDown
            size={14}
            className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
          />
        </button>

        {search && (
          <div className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 text-sm">
            <p>"{search}"</p>
            <X
              size={14}
              className="cursor-pointer hover:text-red-500"
              onClick={handleClearAll}
            />
          </div>
        )}

        {hasFilters && (
          <button
            onClick={handleClearAll}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
          >
            <X size={14} /> Clear All
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mt-4 px-4 md:px-0">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <ArrowUpDown size={12} /> Sort By
                </label>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">Default</option>
                    <option value="newest">Newest</option>
                    <option value="popular">Most Popular</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <DollarSign size={12} /> Min Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-7 pr-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <DollarSign size={12} /> Max Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="999"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-7 pr-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Star size={12} /> Min Rating
                </label>
                <div className="relative">
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">All Ratings</option>
                    <option value="4.5">★★★★★ 4.5+</option>
                    <option value="4">★★★★☆ 4.0+</option>
                    <option value="3.5">★★★☆☆ 3.5+</option>
                    <option value="3">★★★☆☆ 3.0+</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {hasFilters && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                {sort && (
                  <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full">
                    {sort}{" "}
                    <X
                      size={12}
                      className="cursor-pointer"
                      onClick={() => setSort("")}
                    />
                  </span>
                )}
                {minPrice && (
                  <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full">
                    Min ${minPrice}{" "}
                    <X
                      size={12}
                      className="cursor-pointer"
                      onClick={() => setMinPrice("")}
                    />
                  </span>
                )}
                {maxPrice && (
                  <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full">
                    Max ${maxPrice}{" "}
                    <X
                      size={12}
                      className="cursor-pointer"
                      onClick={() => setMaxPrice("")}
                    />
                  </span>
                )}
                {minRating && (
                  <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full">
                    ★ {minRating}+{" "}
                    <X
                      size={12}
                      className="cursor-pointer"
                      onClick={() => setMinRating("")}
                    />
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div className="px-4 py-10 md:py-16">
        {!isLoading && (
          <p className="text-sm text-gray-500 mb-6">
            Showing {visibleCourses.length} of {totalCourses} courses
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            Array(8)
              .fill(0)
              .map((_, i) => <CourseCardSkeleton key={i} />)
          ) : courses.length > 0 ? (
            visibleCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))
          ) : (
            <div className="col-span-full flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
              <svg
                className="mb-6 h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mb-2 text-xl font-semibold text-gray-700">
                No courses found
              </h3>
              <p className="mb-6 max-w-md text-gray-500">
                Sorry, we couldn't find any courses matching your criteria.
              </p>
              <button
                onClick={handleClearAll}
                className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white shadow transition hover:bg-blue-700"
              >
                Show All Courses
              </button>
            </div>
          )}
        </div>

        {/* Load More + Pagination */}
        {!isLoading && courses.length > 0 && (
          <div className="flex flex-col items-center gap-6 mt-10">
            <div className="flex items-center gap-3">
              {/* Show More */}
              {hasMoreInPage && (
                <button
                  onClick={() => setVisibleCount((v) => v + 8)}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-blue-500 text-blue-600 font-medium hover:bg-blue-50 transition-all cursor-pointer"
                >
                  Show More
                  <ChevronDown size={18} />
                </button>
              )}

              {/* Show Less — يظهر بس لو شايف أكتر من 8 */}
              {visibleCount > 8 && (
                <button
                  onClick={() => {
                    window.scrollTo({ top:0, behavior: "smooth" });
                    setVisibleCount(8)
                  }}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-gray-300 text-gray-500 font-medium hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Show Less
                  <ChevronDown size={18} className="rotate-180" />
                </button>
              )}
            </div>

            {/* Pagination — shows after all page courses are visible */}
            {!hasMoreInPage && totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} /> Prev
                </button>

                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => {
                      const showPage =
                        p === 1 || p === totalPages || Math.abs(p - page) <= 1;
                      const showDots =
                        (p === 2 && page > 3) ||
                        (p === totalPages - 1 && page < totalPages - 2);
                      if (!showPage && !showDots) return null;
                      if (showDots)
                        return (
                          <span
                            key={p}
                            className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm"
                          >
                            ...
                          </span>
                        );
                      return (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`w-9 h-9 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                            page === p
                              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                              : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    },
                  )}
                </div>

                <button
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, page + 1))
                  }
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseList;

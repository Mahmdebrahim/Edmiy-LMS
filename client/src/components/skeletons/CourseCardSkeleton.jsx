function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse max-w-xs flex flex-col">
      {/* Image */}
      <div className="relative h-38 ">
        <div className="w-100 h-full  bg-gray-200" />
      </div>

      <div className="p-4 text-left flex flex-col flex-1">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />

        {/* Description */}
        <div className="h-3 bg-gray-200 rounded mb-1 w-full" />
        <div className="h-3 bg-gray-200 rounded mb-4 w-5/6" />

        {/* Educator + Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded-full" />
            <div className="h-3 w-6 bg-gray-200 rounded" />
            <div className="h-4 w-4 bg-gray-200 rounded-full" />
            <div className="h-3 w-8 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-12" />
        </div>

        {/* Button */}
        <div className="mt-auto">
          <div className="w-full h-10 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default CourseCardSkeleton;

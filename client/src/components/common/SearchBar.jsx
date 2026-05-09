import { assets } from "../../assets/assets";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const searchValue = watch("search");

  const onSubmit = (data) => {
    const searchTerm = data.search?.trim();
    if (searchTerm) {
      navigate(`/course-list/${searchTerm}`);
      reset();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex items-center gap-2 max-w-md w-full relative"
    >
      <div className="flex items-center w-full border pl-3 gap-2 bg-white border-gray-500/30 h-11.5 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
        <img
          src={assets.search_icon}
          alt="search"
          className="w-5 h-5 opacity-60"
        />
        <input
          {...register("search", {
            required: "Please enter a search term",
            minLength: {
              value: 2,
              message: "Search must be at least 2 characters",
            },
          })}
          type="text"
          placeholder="Search for courses..."
          className="w-full h-full outline-none text-gray-700 placeholder-gray-400 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={!searchValue?.trim()}
        className="bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-32 h-11.5 rounded-md text-sm text-white transition-all font-medium"
      >
        Search
      </button>

      {errors.search && (
        <p className="absolute -bottom-6 text-red-500 text-xs">
          {errors.search.message}
        </p>
      )}
    </form>
  );
}

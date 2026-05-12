import { Link } from "react-router-dom";
import Navbar from "../layout/Navbar";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import axiosInstance from "../../config/axios.config";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, BookOpen } from "lucide-react";
import useCustomQuery from "../../hooks/useCustomQuery";
import { useUser } from "@clerk/clerk-react";

const StudentNavbar = () => {
  const { isEducator, setIsEducator, cartItems } = useContext(AppContext);
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();

  const { data: wishlistData } = useCustomQuery({
    queryKey: ["wishlist"],
    URL: "/api/user/wishlist",
    options: { enabled: isLoaded && !!user },
  });
  const wishlistCount = wishlistData?.wishlist?.length || 0;
 const { data: cartData } = useCustomQuery({
   queryKey: ["cart"],
   URL: "/api/user/cart",
   options: { enabled: isLoaded && !!user },
 });
 const cartCount = cartData?.items?.length || 0;

  const updateRole = async () => {
    if (isEducator) {
      navigate("/educator/dashboard");
      return;
    }
    const { data } = await axiosInstance.post("/api/educator/update-role");
    if (data.success) {
      setIsEducator(true);
      toast.success(data.message);
    }
    return data;
  };

  return (
    <Navbar>
      {/* Desktop Specific Items */}
      <div className="hidden md:flex items-center gap-6 text-gray-600 font-medium">
        <button
          onClick={updateRole}
          className="hover:text-blue-600 transition-colors cursor-pointer"
        >
          {isEducator ? "Educator Dashboard" : "Become Educator"}
        </button>
        <span className="text-gray-200">|</span>
        <Link to="/my-enrollments" className="hover:text-blue-600 transition-colors">
          My Enrollments
        </Link>

        <div className="flex items-center gap-4 ml-2">
          {/* Wishlist Icon */}
          <Link to="/wishlist" className="relative group p-2 hover:bg-gray-100/50 rounded-full transition-all">
            <Heart
              size={22}
              className={`transition-color text-gray-500 group-hover:text-red-500`}
            />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link to="/cart" className="relative group p-2 hover:bg-gray-100/50 rounded-full transition-all">
            <ShoppingCart
              size={22}
              className={`transition-color text-gray-500 group-hover:text-blue-600`}
            />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Specific Items (Passed as children to Navbar's mobile menu "Quick Actions" section) */}
      <div className="md:hidden w-full">
        <button
          onClick={updateRole}
          className="flex items-center gap-4 w-full p-4 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
        >
          <BookOpen size={20} className="text-gray-400" />
          <span className="font-medium">
            {isEducator ? "Educator Dashboard" : "Become Educator"}
          </span>
        </button>
      </div>
    </Navbar>
  );
};

export default StudentNavbar;

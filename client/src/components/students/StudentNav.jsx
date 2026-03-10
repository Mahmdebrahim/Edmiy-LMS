import { Link } from "react-router-dom";
import Navbar from "../layout/navbar";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import axiosInstance from "../../config/axios.config";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
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
    <Navbar className="navbar-student">
      <div className="hidden md:flex items-center gap-5 text-gray-500">
        <div className="flex items-center gap-4 text-gray-500">
          <button
            onClick={updateRole}
            className="cursor-pointer transition-none"
          >
            {isEducator ? "Educator Dashboard" : "Become Educator"}
          </button>
          <span className="text-gray-300">|</span>
          <Link to="/my-enrollments">My Enrollments</Link>

          {/* Wishlist */}
          <Link to="/wishlist" className="relative flex items-center">
            <Heart
              size={20}
              // className={wishlistCount > 0 ? "text-red-500" : ""}
              // fill={wishlistCount > 0 ? "currentColor" : "none"}
            />
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative flex items-center">
            <ShoppingCart
              size={20}
              // className={cartCount > 0 ? "text-blue-600" : ""}
            />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-blue-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </Navbar>
  );
};

export default StudentNavbar;

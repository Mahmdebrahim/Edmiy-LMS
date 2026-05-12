import React, { useState } from "react";
import { Link, useMatch } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import {
  Menu,
  X,
  Home,
  Heart,
  ShoppingCart,
  BookOpen,
  GraduationCap,
  UserPlus,
} from "lucide-react";

const Navbar = ({ children }) => {
  const { openSignIn } = useClerk();
  const { user } = useUser();
  const isCourseDetails = useMatch("/course/:courseId");
  const isHome = useMatch("/");

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav
        className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 sticky top-0 z-40 transition-all duration-300 ${
          isCourseDetails || isHome
            ? "bg-linear-to-b from-35% from-white to-blue-200 backdrop-blur-md"
            : "bg-white"
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={assets.logo2}
            alt="Edmiy Logo"
            className="w-28 lg:w-32 transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {user && <div className="flex items-center gap-6">{children}</div>}

          {user ? (
            <div className="flex items-center gap-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <button
              onClick={() => openSignIn()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full cursor-pointer font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <UserPlus size={18} />
              <span>Create Account</span>
            </button>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center gap-4">
          {user && (
            <div className="scale-110">
              <UserButton afterSignOutUrl="/" />
            </div>
          )}

          <button
            onClick={toggleMenu}
            className="text-gray-700 hover:bg-gray-200 transition-colors"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMenu}
      />

      {/* Mobile Slide-over Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-white z-60 shadow-2xl transform transition-transform duration-500 ease-in-out md:hidden flex flex-col ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <span className="font-bold text-xl text-blue-600">Menu</span>
          <button
            onClick={toggleMenu}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <MobileNavLink
            to="/"
            icon={<Home size={20} />}
            label="Home"
            onClick={toggleMenu}
          />

          {user ? (
            <>
              <MobileNavLink
                to="/my-enrollments"
                icon={<GraduationCap size={20} />}
                label="My Enrollments"
                onClick={toggleMenu}
              />
              <MobileNavLink
                to="/wishlist"
                icon={<Heart size={20} />}
                label="Wishlist"
                onClick={toggleMenu}
              />
              <MobileNavLink
                to="/cart"
                icon={<ShoppingCart size={20} />}
                label="Cart"
                onClick={toggleMenu}
              />
              <div className="pt-4 mt-4 border-t border-gray-100">
                {/* Pass through children if they are links, or render educator dashboard specifically */}
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Quick Actions
                </div>
                {children}
              </div>
            </>
          ) : (
            <div className="pt-4">
              <button
                onClick={() => {
                  toggleMenu();
                  openSignIn();
                }}
                className="w-full bg-blue-600 text-white p-4 rounded-xl font-semibold shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                <UserPlus size={20} />
                Create Account
              </button>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 text-center">
          <img
            src={assets.logo2}
            alt="Logo"
            className="w-24 mx-auto opacity-50"
          />
        </div>
      </div>
    </>
  );
};

const MobileNavLink = ({ to, icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-4 p-4 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
  >
    <span className="text-gray-400 group-hover:text-blue-600">{icon}</span>
    <span className="font-medium">{label}</span>
  </Link>
);

export default Navbar;

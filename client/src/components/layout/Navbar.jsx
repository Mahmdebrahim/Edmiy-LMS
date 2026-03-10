import React from "react";
import { Link, useMatch } from "react-router-dom"; 
import {assets} from '../../assets/assets'
import {
  useClerk,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
const Navbar = ({ children }) => {
  const { openSignIn } = useClerk();
  const { user } = useUser();
  // console.log(user)
  const isEdu = useMatch("/educator/*");
  const isCourseDetails = useMatch("/course/:courseId");
  const isHome = useMatch("/");

  const [open, setOpen] = React.useState(false);
  // console.log(children);
  return (
    <nav
      className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 relative transition-none ${isCourseDetails || isHome ? "bg-blue-300/50" : "bg-white"}`}
    >
      {/* Logo */}
      <Link to="/">
        <img
          src={assets.logo}
          alt=""
          className="w-28 lg:w-32 coursor-pointer"
        />
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8">
        {user && children}
        {user ? (
          <UserButton />
        ) : (
          <button
            onClick={() => openSignIn()}
            className="bg-blue-600 text-white px-5 py-2 rounded-full cursor-pointer "
          >
            Create Account
          </button>
        )}
      </div>
      <div className="sm:hidden flex items-center gap-4">
        {user ? (
          <UserButton />
        ) : (
          <button onClick={() => openSignIn()}>
            <img src={assets.user_icon} alt="" />
          </button>
        )}
        <button
          onClick={() => (open ? setOpen(false) : setOpen(true))}
          aria-label="Menu"
        >
          {/* Menu Icon SVG */}
          <svg
            width="21"
            height="15"
            viewBox="0 0 21 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="21" height="1.5" rx=".75" fill="#426287" />
            <rect x="8" y="6" width="13" height="1.5" rx=".75" fill="#426287" />
            <rect
              x="6"
              y="13"
              width="15"
              height="1.5"
              rx=".75"
              fill="#426287"
            />
          </svg>
        </button>
      </div>
      {/* Mobile Menu */}
      <div
        className={`${open ? "flex" : "hidden"} absolute top-15 left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm md:hidden`}
      >
        {/* <Link to="/" className="block">
          Home
        </Link>
        <Link to="/about" className="block">
          About
        </Link>
        <Link to="/contact" className="block">
          Contact
        </Link>
        <button className="cursor-pointer px-6 py-2 mt-2 bg-blue-500 hover:bg-blue-500 transition text-white rounded-full text-sm">
          Login
        </button> */}
        {/* {children} */}
        <button
          onClick={() => openSignIn()}
          className="bg-blue-600 text-white px-5 py-2 rounded-full cursor-pointer "
        >
          Create Account
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

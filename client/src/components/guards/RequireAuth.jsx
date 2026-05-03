import { useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router-dom";
import { PropagateLoader } from "react-spinners";

export const RequireAuth = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PropagateLoader color="#155dfc" />
      </div>
    );

  if (!isSignedIn) return <Navigate to="/" replace />;

  return <Outlet />;
};

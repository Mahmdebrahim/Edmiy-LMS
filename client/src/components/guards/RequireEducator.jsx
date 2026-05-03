import { useUser } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router-dom";
import { PropagateLoader } from "react-spinners";

export const RequireEducator = () => {
  const { isLoaded, user } = useUser();

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PropagateLoader color="#155dfc" />
      </div>
    );

  if (user?.publicMetadata?.role !== "educator")
    return <Navigate to="/" replace />;

  return <Outlet />;
};

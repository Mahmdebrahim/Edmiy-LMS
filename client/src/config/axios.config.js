import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
  withCredentials: true,
});

axiosInstance.interceptors.request.use(async (config) => {
  if (
    window.Clerk?.session &&
    typeof window.Clerk.session.getToken === "function"
  ) {
    try {
      const token = await window.Clerk.session.getToken({
        template: "long-lived",
        skipCache: true,
      });
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn("Failed to get Clerk token:", err);
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (window.Clerk?.session?.getToken) {
        try {
          const newToken = await window.Clerk.session.getToken({
            template: "long-lived",
            skipCache: true,
          });
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (err) {
          console.error("Token refresh failed:", err);
        }
      }

      if (window.location.pathname !== "/sign-in") {
        window.location.href = "/sign-in";
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;

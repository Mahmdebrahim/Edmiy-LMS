import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
});

// ✅ بيضيف Clerk token تلقائي لكل request
axiosInstance.interceptors.request.use(async (config) => {
  const token = await window.Clerk?.session?.getToken({
    template: "long-lived",
  });
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;

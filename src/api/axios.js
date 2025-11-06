import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // send cookies automatically
});

// Request interceptor: attach access token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Determine if this is a login/signup request
    const isAuthRequest =
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/signup");

    // Only handle refresh for non-login/signup requests
    if (!isAuthRequest && (error.response?.status === 401 || error.response?.status === 403)&& !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh the token
const res = await axios.post("http://localhost:5000/api/auth/refresh_token",{}, {
  withCredentials: true,
});       
 localStorage.setItem("accessToken", res.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(originalRequest); // Retry original request
      } catch (err) {
        // Refresh failed → redirect to unauthorized page
        window.location.href = "/login";
      }
    }

    // For login/signup errors or other errors → reject so component handles it
    return Promise.reject(error);
  }
);

export default api;

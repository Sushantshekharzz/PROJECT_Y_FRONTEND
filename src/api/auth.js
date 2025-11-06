import api from "./axios";

// Login
export const login = (data) => api.post("/auth/login", data);

// Signup
export const signup = (data) => api.post("/auth/signup", data);

// Logout
export const logout = () => api.post("/auth/logout");

// Refresh token (if needed manually)
export const refreshToken = () => api.post("/auth/refresh_token");
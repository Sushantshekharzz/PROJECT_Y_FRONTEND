import { createContext, useState, useEffect } from "react";
import api from "../api/axios";
import { refreshToken } from "../api/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    // List of protected routes
    const protectedRoutes = ["/ingestion", "/cleaning", "/transformation", "/visualization"];
    const currentPath = window.location.pathname.toLowerCase();

    if (!protectedRoutes.includes(currentPath)) {
      // Public route → skip refreshToken
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const res = await refreshToken();
        setUser(res.data.user);
        console.log("rrrr",res)
        localStorage.setItem("accessToken", res.data.accessToken);
      } catch (err) {
        setUser(null);
        navigate("/login"); // immediately redirect if not authenticated

        console.error("User not authenticated", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

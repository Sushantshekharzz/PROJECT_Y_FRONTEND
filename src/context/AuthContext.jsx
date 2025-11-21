import { createContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { refreshToken } from "../api/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const protectedRoutes = ["/ingestion", "/cleaning", "/transformation", "/visualization"];

  useEffect(() => {
    const currentPath = location.pathname.toLowerCase();

    if (!protectedRoutes.includes(currentPath)) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      setLoading(true);
      try {
        const res = await refreshToken(); // uses httpOnly cookie
        setUser(res.data.user);
        window.accessToken = res.data.accessToken; // store token in memory
      } catch (err) {
        setUser(null);
        navigate("/login");
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

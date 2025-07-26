import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin, validateLogin } from "../apis";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const validateAdmin = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          const { data } = await validateLogin();
          setUser(data.data);
        } else {
          navigate("/login");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Session expired");
      } finally {
        setLoading(false);
      }
    };

    validateAdmin();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await loginAdmin({ email, password });

      localStorage.setItem("authToken", data.data.token);
      localStorage.setItem("adminId", data.data.admin._id);
      setUser(data.data.admin);
      navigate("/");
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("adminId");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, error, login, logout, setError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

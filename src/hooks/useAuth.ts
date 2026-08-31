import { useState, useEffect } from "react";
import api, { getCsrfCookie } from "../lib/axios";

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  login_type?: string; 
  roles?: string[];
  permissions?: string[];
  created_at: string;
}

interface AuthResponse {
  status: string;
  data?: User;
  message?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setError(null);
      await getCsrfCookie();
      const response = await api.get<AuthResponse>("/api/user");

      if (response.data.status === "success" && response.data.data) {
        setUser(response.data.data);
        return true;
      }

      setUser(null);
      return false;
    } catch (err: any) {
      console.error("Fetch user error:", err);
      setUser(null);
      if (err.response?.status !== 401) {
        setError(err.message || "Failed to fetch user");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    window.location.href = "http://localhost:8000/api/auth/google";
  };

  const logout = async () => {
    try {
      setLoading(true);
      await getCsrfCookie();
      await api.post("/api/logout");
      sessionStorage.removeItem("welcomed_this_session");
      setUser(null);
      window.location.href = "/login";
    } catch (err: any) {
      console.error("Logout error:", err);
      setError(err.message || "Failed to logout");
    } finally {
      setLoading(false);
    }
  };

  // Cek autentikasi & tangkap token Google OAuth sekali saja saat mount
  useEffect(() => {
    const initAuth = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      const loginSuccess = hash === '#success' || params.get('login') === 'success';
      const token = params.get('token');
      const loginError = params.get("error");

      if (loginError) {
        setError(decodeURIComponent(loginError));
        window.history.replaceState({}, "", "/login");
        setLoading(false);
        return;
      }

      if (loginSuccess || token) {
        if (token) localStorage.setItem('auth_token', token);
        window.history.replaceState({}, '', '/dashboard');
        await getCsrfCookie();
        await fetchUser();
      } else {
        await fetchUser();
      }
    };

    initAuth();
  }, []);

  return {
    user,
    loading,
    error,
    loginWithGoogle,
    logout,
    fetchUser,
    isAuthenticated: !!user,
  };
};
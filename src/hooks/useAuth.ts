import { useState, useEffect } from 'react';
import api, { getCsrfCookie } from '../lib/axios';

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
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

  // Fetch user data
  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ FIX: Pastikan selalu ambil CSRF cookie dulu
      await getCsrfCookie();
      
      const response = await api.get<AuthResponse>('/api/user');
      
      if (response.data.status === 'success' && response.data.data) {
        setUser(response.data.data);
        return true;
      }
      
      setUser(null);
      return false;
    } catch (err: any) {
      console.error('Fetch user error:', err);
      setUser(null);
      
      if (err.response?.status !== 401) {
        setError(err.message || 'Failed to fetch user');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login Redirect
  const loginWithGoogle = () => {
    window.location.href = 'http://localhost:8000/auth/google';
  };

  // Handle logout
  const logout = async () => {
    try {
      setLoading(true);
      
      // Get fresh CSRF token before logout
      await getCsrfCookie();
      
      await api.post('/api/logout');
      
      setUser(null);
      window.location.href = '/login';
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    const initAuth = async () => {
      // ✅ FIX: Cek hash parameter untuk success
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      
      const loginSuccess = hash === '#success' || params.get('login') === 'success';
      const loginError = params.get('error');

      if (loginError) {
        setError(decodeURIComponent(loginError));
        // Clean URL
        window.history.replaceState({}, '', '/login');
        setLoading(false);
        return;
      }

      if (loginSuccess) {
        // Ambil CSRF cookie dulu
        await getCsrfCookie();
        
        // Fetch user
        const success = await fetchUser();
        
        // Clean URL dan redirect ke dashboard jika sukses
        window.history.replaceState({}, '', '/');
        
        if (success) {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/login';
        }
      } else {
        // Cek apakah user sudah login
        await fetchUser();
        setLoading(false);
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
    isAuthenticated: !!user
  };
};
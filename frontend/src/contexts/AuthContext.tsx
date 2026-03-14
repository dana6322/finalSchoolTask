import { useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/index';
import api from '../services/api';
import { AuthContext } from './AuthContextSetup';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore user from localStorage on mount and fetch fresh data
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
        // Fetch fresh user data from backend
        api.get('/user/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(response => {
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          })
          .catch(err => console.error('Failed to fetch fresh user data:', err));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('user');
      }
    }
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, refreshToken: newRefreshToken } = response.data;
      
      setToken(newToken);
      setRefreshToken(newRefreshToken);
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      // Fetch current user data
      const userResponse = await api.get('/user/me', {
        headers: { Authorization: `Bearer ${newToken}` }
      });
      setUser(userResponse.data);
      localStorage.setItem('user', JSON.stringify(userResponse.data));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, userName?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', { email, password, userName });
      const { token: newToken, refreshToken: newRefreshToken } = response.data;
      
      setToken(newToken);
      setRefreshToken(newRefreshToken);
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      // Fetch current user data
      const userResponse = await api.get('/user/me', {
        headers: { Authorization: `Bearer ${newToken}` }
      });
      setUser(userResponse.data);
      localStorage.setItem('user', JSON.stringify(userResponse.data));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (refreshToken) {
        try {
          await api.post('/auth/logout', { refreshToken });
        } catch (err) {
          console.error('Logout API call failed:', err);
        }
      }
    } finally {
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setIsLoading(false);
    }
  }, [refreshToken]);

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, login, register, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * AuthContext — manages authentication state.
 *
 * On mount: tries to refresh the token (httpOnly cookie may still be valid)
 * Exposes: user, login, register, logout, isAuthenticated, loading
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  authApi,
  setAccessToken,
  clearAccessToken,
  mapUser,
} from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true on mount while we check cookie

  // Try silent refresh on first load
  useEffect(() => {
    authApi
      .refresh()
      .then(({ data }) => {
        setAccessToken(data.data.accessToken);
        setUser(mapUser(data.data.user));
      })
      .catch(() => {
        // No valid cookie — user is not logged in
        clearAccessToken();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { data } = await authApi.login({ email, password });
    setAccessToken(data.data.accessToken);
    setUser(mapUser(data.data.user));
    return data.data.user;
  }, []);

  const register = useCallback(async ({ name, username, email, password }) => {
    const { data } = await authApi.register({ name, username, email, password });
    // Registration no longer logs the user in automatically, it just returns email
    return data.data.email;
  }, []);

  const verifyOtp = useCallback(async ({ email, otp }) => {
    const { data } = await authApi.verifyOtp({ email, otp });
    setAccessToken(data.data.accessToken);
    setUser(mapUser(data.data.user));
    return data.data.user;
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await authApi.me();
      setUser(mapUser(data.data.user));
    } catch {
      // If fetching fails, clear everything
      clearAccessToken();
      setUser(null);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // silent
    }
    clearAccessToken();
    setUser(null);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated, login, register, verifyOtp, logout, updateUser, fetchMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

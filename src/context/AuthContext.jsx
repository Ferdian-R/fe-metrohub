import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success) {
      // Respons login tidak memuat permissions, jadi ambil profil lengkap dari /auth/me
      const me = await api.get('/auth/me').catch(() => null);
      setUser(me?.data || res.data?.user || null);
      return { ...res, data: { ...res.data, user: me?.data || res.data?.user } };
    }
    return res;
  };

  // Dipakai setelah ubah password: sesi sudah dicabut server, cukup bersihkan state lokal
  const clearSession = () => setUser(null);

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      setUser(null);
    }
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    return user.permissions?.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchUser, hasPermission, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

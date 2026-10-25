import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Inisialisasi default dengan user Admin Nadia Pratama (sesuai Figma A-02) agar preview UI langsung tampil
  const [user, setUser] = useState({
    id: 1,
    nama: 'Nadia Pratama',
    email: 'admin@metro.demo',
    role: 'Admin',
    permissions: ['core:dashboard', 'core:pengguna', 'core:lokasi', 'magang:kelola', 'keuangan:kelola', 'keuangan:lihat'],
  });
  const [loading] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      }
    } catch {
      // Pertahankan user sesi jika ada
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success) {
        setUser(res.data.user);
        return res;
      }
    } catch (err) {
      // Demo fallback untuk pengujian Figma UI
      if (email === 'admin@metro.demo' || email === 'admin@metrohub.local') {
        const mockAdmin = {
          id: 1,
          nama: 'Nadia Pratama',
          email,
          role: 'Admin',
          permissions: ['core:dashboard', 'core:pengguna', 'core:lokasi', 'magang:kelola', 'keuangan:kelola', 'keuangan:lihat'],
        };
        setUser(mockAdmin);
        return { success: true, data: { user: mockAdmin } };
      }
      if (email === 'magang@metro.demo') {
        const mockIntern = {
          id: 2,
          nama: 'Raka Aditya',
          email,
          role: 'Anak Magang',
          permissions: ['magang:absen'],
        };
        setUser(mockIntern);
        return { success: true, data: { user: mockIntern } };
      }
      if (email === 'nonaktif@metro.demo') {
        throw new Error('Akun Anda berstatus nonaktif. Hubungi Admin.');
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // continue
    } finally {
      setUser(null);
    }
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    return user.permissions?.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchUser, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

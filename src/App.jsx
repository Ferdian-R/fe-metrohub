import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './modules/core/pages/LoginPage';
import { AdminInternsPage } from './modules/magang/pages/AdminInternsPage';
import { AdminInternDetailPage } from './modules/magang/pages/AdminInternDetailPage';
import { AdminAttendancePage } from './modules/magang/pages/AdminAttendancePage';
import { AdminLogbookPage } from './modules/magang/pages/AdminLogbookPage';
import { AdminTasksPage } from './modules/magang/pages/AdminTasksPage';
import { InternDashboardPage } from './modules/magang/pages/InternDashboardPage';
import { InternAttendancePage } from './modules/magang/pages/InternAttendancePage';
import { InternLogbookPage } from './modules/magang/pages/InternLogbookPage';
import { InternTasksPage } from './modules/magang/pages/InternTasksPage';
import { InternProfilePage } from './modules/magang/pages/InternProfilePage';
import { AdminUsersPage } from './modules/pengaturan/pages/AdminUsersPage';
import { AdminLocationPage } from './modules/pengaturan/pages/AdminLocationPage';
import { CategoriesPage } from './modules/keuangan/pages/CategoriesPage';
import { TransactionsPage } from './modules/keuangan/pages/TransactionsPage';
import { FinanceSummaryPage } from './modules/keuangan/pages/FinanceSummaryPage';
import { AdminDashboardPage } from './modules/core/pages/AdminDashboardPage';
import { AccountProfilePage } from './modules/core/pages/AccountProfilePage';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f5]">
        <div className="w-8 h-8 border-4 border-[#17362f] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Pengarah berdasarkan permission (bukan nama role), sesuai CR-03
const RoleBasedRedirect = () => {
  const { hasPermission } = useAuth();

  // Jika Peserta / Anak Magang (punya magang:absen dan bukan pengelola)
  if (hasPermission('magang:absen') && !hasPermission('magang:kelola')) {
    return <Navigate to="/magang/dashboard" replace />;
  }

  // Jika punya akses dashboard (Super Admin, atau Finance / Operasional Magang yang memiliki izin dashboard)
  if (hasPermission('core:dashboard')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Jika tanpa akses dashboard:
  // Role Operasional Magang diarahkan langsung ke Data Anak Magang
  if (hasPermission('magang:kelola')) {
    return <Navigate to="/admin/magang/interns" replace />;
  }

  // Role Finance diarahkan langsung ke Transaksi atau Ringkasan Keuangan
  if (hasPermission('keuangan:kelola')) {
    return <Navigate to="/admin/keuangan/transaksi" replace />;
  }
  if (hasPermission('keuangan:lihat')) {
    return <Navigate to="/admin/keuangan/ringkasan" replace />;
  }

  // Role Pengaturan Pengguna
  if (hasPermission('core:pengguna')) {
    return <Navigate to="/admin/pengaturan/pengguna" replace />;
  }

  return <Navigate to="/admin/profil" replace />;
};

// Halaman tanpa izin ditolak di frontend juga (backend tetap memeriksa dan membalas 403)
const RequirePermission = ({ permission, permissions, children }) => {
  const { hasPermission } = useAuth();
  const allowed = permissions
    ? permissions.some((p) => hasPermission(p))
    : hasPermission(permission);

  if (allowed) return children;
  return (
    <div className="py-24 text-center text-slate-500">
      <ShieldAlert className="w-10 h-10 mx-auto text-slate-300 mb-3" />
      <p className="text-base font-semibold text-slate-800">Akses ditolak</p>
      <p className="text-xs mt-1">Role Anda tidak memiliki izin untuk membuka halaman ini.</p>
    </div>
  );
};

const guard = (permission, element) => {
  if (Array.isArray(permission)) {
    return <RequirePermission permissions={permission}>{element}</RequirePermission>;
  }
  return <RequirePermission permission={permission}>{element}</RequirePermission>;
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<RoleBasedRedirect />} />

              {/* Portal Admin Routes */}
              <Route path="admin/dashboard" element={guard('core:dashboard', <AdminDashboardPage />)} />
              <Route path="admin/magang/interns" element={guard('magang:kelola', <AdminInternsPage />)} />
              <Route path="admin/magang/interns/:id" element={guard('magang:kelola', <AdminInternDetailPage />)} />
              <Route path="admin/magang/absensi" element={guard('magang:kelola', <AdminAttendancePage />)} />
              <Route path="admin/magang/logbook" element={guard('magang:kelola', <AdminLogbookPage />)} />
              <Route path="admin/magang/penugasan" element={guard('magang:kelola', <AdminTasksPage />)} />
              <Route path="admin/pengaturan/pengguna" element={guard('core:pengguna', <AdminUsersPage />)} />
              <Route path="admin/pengaturan/lokasi" element={guard('core:lokasi', <AdminLocationPage />)} />
              <Route path="admin/keuangan/transaksi" element={guard('keuangan:kelola', <TransactionsPage />)} />
              <Route path="admin/keuangan/kategori" element={guard('keuangan:kelola', <CategoriesPage />)} />
              <Route path="admin/profil" element={<AccountProfilePage />} />
              <Route path="admin/keuangan/ringkasan" element={guard(['keuangan:lihat', 'keuangan:kelola'], <FinanceSummaryPage />)} />

              {/* Portal Anak Magang Routes (M-01) */}
              <Route path="magang/dashboard" element={guard('magang:absen', <InternDashboardPage />)} />
              <Route path="magang/absensi" element={guard('magang:absen', <InternAttendancePage />)} />
              <Route path="magang/logbook" element={guard('magang:absen', <InternLogbookPage />)} />
              <Route path="magang/tugas" element={guard('magang:absen', <InternTasksPage />)} />
              <Route path="magang/profil" element={guard('magang:absen', <InternProfilePage />)} />

              {/* Universal dashboard fallback */}
              <Route path="dashboard" element={<RoleBasedRedirect />} />
            </Route>

            <Route path="*" element={<RoleBasedRedirect />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

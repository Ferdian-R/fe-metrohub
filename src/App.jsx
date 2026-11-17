import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { getRoleType } from './utils/roleUtils';
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

// Pengarah berdasarkan autentikasi dan peran (role) pengguna
const RoleBasedRedirect = () => {
  const { user, hasPermission } = useAuth();
  const roleType = getRoleType(user);

  // Peserta Magang -> Dashboard Portal Magang
  if (roleType === 'intern') {
    return <Navigate to="/magang/dashboard" replace />;
  }

  // Pengelola Keuangan -> Langsung ke Transaksi Keuangan
  if (roleType === 'finance') {
    return <Navigate to="/admin/keuangan/transaksi" replace />;
  }

  // Operasional Magang -> Langsung ke Data Anak Magang
  if (roleType === 'operasional_magang') {
    return <Navigate to="/admin/magang/interns" replace />;
  }

  // Super Admin / Pengguna dengan hak dashboard -> Dashboard Admin
  if (roleType === 'admin' || hasPermission('core:dashboard')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/admin/profil" replace />;
};

// Halaman tanpa izin ditolak di frontend juga (backend tetap memeriksa dan membalas 403)
const RequirePermission = ({ permission, permissions, module, children }) => {
  const { user, hasPermission } = useAuth();
  const roleType = getRoleType(user);

  // Super Admin memiliki akses penuh ke seluruh rute admin
  if (roleType === 'admin') return children;

  // Staf Finance / Pengelola Keuangan: HANYA boleh mengakses modul keuangan & profil
  if (roleType === 'finance') {
    if (module === 'keuangan' || module === 'profil') return children;
    const allowed = permissions
      ? permissions.some((p) => hasPermission(p))
      : permission ? hasPermission(permission) : false;
    if (allowed) return children;
    return (
      <div className="py-24 text-center text-slate-500">
        <ShieldAlert className="w-10 h-10 mx-auto text-slate-300 mb-3" />
        <p className="text-base font-semibold text-slate-800">Akses ditolak</p>
        <p className="text-xs mt-1">Akun Pengelola Keuangan hanya memiliki akses ke Modul Keuangan.</p>
      </div>
    );
  }

  // Staf Operasional Magang: HANYA boleh mengakses modul magang & profil
  if (roleType === 'operasional_magang') {
    if (module === 'magang' || module === 'profil') return children;
    const allowed = permissions
      ? permissions.some((p) => hasPermission(p))
      : permission ? hasPermission(permission) : false;
    if (allowed) return children;
    return (
      <div className="py-24 text-center text-slate-500">
        <ShieldAlert className="w-10 h-10 mx-auto text-slate-300 mb-3" />
        <p className="text-base font-semibold text-slate-800">Akses ditolak</p>
        <p className="text-xs mt-1">Akun Operasional Magang hanya memiliki akses ke Modul Magang.</p>
      </div>
    );
  }

  // Peserta Magang: HANYA boleh mengakses portal magang
  if (roleType === 'intern') {
    if (module === 'intern') return children;
    return (
      <div className="py-24 text-center text-slate-500">
        <ShieldAlert className="w-10 h-10 mx-auto text-slate-300 mb-3" />
        <p className="text-base font-semibold text-slate-800">Akses ditolak</p>
        <p className="text-xs mt-1">Akun Peserta Magang hanya dapat mengakses Portal Magang.</p>
      </div>
    );
  }

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

const guard = (permission, module, element) => {
  return (
    <RequirePermission
      permission={Array.isArray(permission) ? undefined : permission}
      permissions={Array.isArray(permission) ? permission : undefined}
      module={module}
    >
      {element}
    </RequirePermission>
  );
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
              <Route path="admin/dashboard" element={guard('core:dashboard', 'core', <AdminDashboardPage />)} />
              <Route path="admin/magang/interns" element={guard('magang:kelola', 'magang', <AdminInternsPage />)} />
              <Route path="admin/magang/interns/:id" element={guard('magang:kelola', 'magang', <AdminInternDetailPage />)} />
              <Route path="admin/magang/absensi" element={guard('magang:kelola', 'magang', <AdminAttendancePage />)} />
              <Route path="admin/magang/logbook" element={guard('magang:kelola', 'magang', <AdminLogbookPage />)} />
              <Route path="admin/magang/penugasan" element={guard('magang:kelola', 'magang', <AdminTasksPage />)} />
              <Route path="admin/pengaturan/pengguna" element={guard('core:pengguna', 'core', <AdminUsersPage />)} />
              <Route path="admin/pengaturan/lokasi" element={guard('core:lokasi', 'core', <AdminLocationPage />)} />
              <Route path="admin/keuangan/transaksi" element={guard('keuangan:kelola', 'keuangan', <TransactionsPage />)} />
              <Route path="admin/keuangan/kategori" element={guard('keuangan:kelola', 'keuangan', <CategoriesPage />)} />
              <Route path="admin/profil" element={guard(null, 'profil', <AccountProfilePage />)} />
              <Route path="admin/keuangan/ringkasan" element={guard(['keuangan:lihat', 'keuangan:kelola'], 'keuangan', <FinanceSummaryPage />)} />

              {/* Portal Anak Magang Routes (M-01) */}
              <Route path="magang/dashboard" element={guard('magang:absen', 'intern', <InternDashboardPage />)} />
              <Route path="magang/absensi" element={guard('magang:absen', 'intern', <InternAttendancePage />)} />
              <Route path="magang/logbook" element={guard('magang:absen', 'intern', <InternLogbookPage />)} />
              <Route path="magang/tugas" element={guard('magang:absen', 'intern', <InternTasksPage />)} />
              <Route path="magang/profil" element={guard('magang:absen', 'intern', <InternProfilePage />)} />

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

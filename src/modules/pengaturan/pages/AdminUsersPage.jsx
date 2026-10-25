import React, { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import {
  Plus,
  ChevronDown,
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  UserCheck,
} from 'lucide-react';

const INITIAL_USERS = [
  {
    id: 'usr-1',
    name: 'Nadia Pratama',
    email: 'admin@metro.demo',
    role: 'Admin',
    status: 'Aktif',
    lastAccess: '20 Okt 2026, 08.02',
  },
  {
    id: 'usr-2',
    name: 'Raka Aditya',
    email: 'raka@metro.demo',
    role: 'Anak Magang',
    status: 'Aktif',
    lastAccess: '20 Okt 2026, 08.11',
  },
  {
    id: 'usr-3',
    name: 'Ayu Lestari',
    email: 'nonaktif@metro.demo',
    role: 'Admin',
    status: 'Nonaktif',
    lastAccess: '30 Sep 2026, 16.40',
  },
];

export const AdminUsersPage = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('pengguna');

  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('metro_users_list');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_USERS;
  });

  useEffect(() => {
    localStorage.setItem('metro_users_list', JSON.stringify(users));
  }, [users]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('Semua role');
  const [statusFilter, setStatusFilter] = useState('Semua status');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deactivateUser, setDeactivateUser] = useState(null);

  const [addForm, setAddForm] = useState({
    name: 'Dewi Lestari',
    email: 'dewi@metro.demo',
    role: 'Admin',
    status: 'Aktif',
  });
  const [addEmailError, setAddEmailError] = useState('');

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'Admin',
    status: 'Aktif',
  });
  const [editEmailError, setEditEmailError] = useState('');

  const handleOpenEdit = (user) => {
    setEditUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setEditEmailError('');
  };

  const handleSaveAddUser = (e) => {
    e.preventDefault();
    const trimmedEmail = addForm.email.trim().toLowerCase();
    const trimmedName = addForm.name.trim();
    if (!trimmedName) return;

    const exists = users.some((u) => u.email.toLowerCase() === trimmedEmail);
    if (exists) {
      setAddEmailError('Email sudah digunakan oleh akun lain. Gunakan email berbeda.');
      return;
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      name: trimmedName,
      email: trimmedEmail,
      role: addForm.role,
      status: addForm.status,
      lastAccess: 'Baru ditambahkan',
    };

    setUsers([newUser, ...users]);
    setIsAddModalOpen(false);
    setAddEmailError('');

    showToast({
      title: 'Pengguna ditambahkan',
      message: `${newUser.name} · ${newUser.email} · ${newUser.role} · ${newUser.status}`,
    });
  };

  const handleSaveEditUser = (e) => {
    e.preventDefault();
    if (!editUser) return;
    const trimmedEmail = editForm.email.trim().toLowerCase();
    const trimmedName = editForm.name.trim();
    if (!trimmedName) return;

    const exists = users.some(
      (u) => u.id !== editUser.id && u.email.toLowerCase() === trimmedEmail
    );
    if (exists) {
      setEditEmailError('Email sudah digunakan oleh akun lain. Gunakan email berbeda.');
      return;
    }

    const updatedList = users.map((u) => {
      if (u.id === editUser.id) {
        return {
          ...u,
          name: trimmedName,
          email: trimmedEmail,
          role: editForm.role,
          status: editForm.status,
        };
      }
      return u;
    });

    setUsers(updatedList);
    setEditUser(null);
    setEditEmailError('');

    showToast({
      title: 'Perubahan pengguna tersimpan',
      message: `${trimmedName} · ${trimmedEmail} · ${editForm.role} · ${editForm.status}`,
    });
  };

  const handleConfirmDeactivate = () => {
    if (!deactivateUser) return;
    const target = deactivateUser;
    const updated = users.map((u) => (u.id === target.id ? { ...u, status: 'Nonaktif' } : u));
    setUsers(updated);
    setDeactivateUser(null);

    showToast({
      title: `Akun ${target.name.split(' ')[0]} dinonaktifkan`,
      message: `${target.email} · Nonaktif - tidak dapat login. Riwayat magang tetap tersimpan.`,
    });
  };

  const handleReactivateUser = (user) => {
    const updated = users.map((u) => (u.id === user.id ? { ...u, status: 'Aktif' } : u));
    setUsers(updated);
    showToast({
      title: 'Akun diaktifkan kembali',
      message: `${user.name} (${user.email}) kini dapat login kembali ke sistem.`,
    });
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'Semua role' || u.role === roleFilter;
    const matchStatus = statusFilter === 'Semua status' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const hasDeactivatedIntern = users.some(
    (u) => u.role === 'Anak Magang' && u.status === 'Nonaktif'
  );
  return (
    <div className="space-y-6 w-full pb-16 font-sans">
      {/* Header Halaman & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight font-lexend">
            Pengguna dan Role
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1 font-source-sans">
            Kelola akun, role, dan status akses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setAddForm({
              name: 'Dewi Lestari',
              email: 'dewi@metro.demo',
              role: 'Admin',
              status: 'Aktif',
            });
            setAddEmailError('');
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#17362f] hover:bg-[#122b25] active:scale-[0.99] text-white text-xs md:text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Tabs Navigasi: Pengguna | Role dan Hak Akses */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('pengguna')}
            className={`pb-3 px-1 text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'pengguna'
                ? 'border-[#17362f] text-[#17362f]'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Pengguna
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('role_akses')}
            className={`pb-3 px-1 text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'role_akses'
                ? 'border-[#17362f] text-[#17362f]'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Role dan Hak Akses
          </button>
        </nav>
      </div>

      {activeTab === 'pengguna' ? (
        <>
          {/* Filter Bar (Search + Dropdown Role & Status) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau email"
                className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#17362f] transition"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full md:w-44 appearance-none bg-white border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-700 py-2.5 pl-3.5 pr-8 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#17362f] cursor-pointer"
                >
                  <option value="Semua role">Semua role</option>
                  <option value="Admin">Admin</option>
                  <option value="Anak Magang">Anak Magang</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative flex-1 md:flex-none">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full md:w-44 appearance-none bg-white border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-700 py-2.5 pl-3.5 pr-8 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#17362f] cursor-pointer"
                >
                  <option value="Semua status">Semua status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Tabel Pengguna */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-source-sans">
                      NAMA DAN EMAIL
                    </th>
                    <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-source-sans">
                      ROLE
                    </th>
                    <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-source-sans">
                      STATUS AKUN
                    </th>
                    <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-source-sans">
                      AKSES TERAKHIR
                    </th>
                    <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-source-sans">
                      AKSI
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-source-sans">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        Tidak ada pengguna yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((item) => {
                      const isAktif = item.status === 'Aktif';

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-4 px-6">
                            <p className="font-semibold text-slate-900 text-xs">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {item.email}
                            </p>
                          </td>

                          <td className="py-4 px-6 text-slate-700 font-medium">
                            {item.role}
                          </td>

                          <td className="py-4 px-6">
                            {isAktif ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e7f5ec] text-[#176a43] border border-[#c6e9d4]">
                                Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                Nonaktif · tidak dapat login
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6 text-slate-600">
                            {item.lastAccess}
                          </td>

                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="text-xs font-semibold text-[#17362f] hover:underline cursor-pointer"
                              >
                                Ubah
                              </button>

                              {isAktif ? (
                                <button
                                  type="button"
                                  onClick={() => setDeactivateUser(item)}
                                  className="text-xs font-medium text-slate-600 hover:text-rose-600 cursor-pointer"
                                >
                                  Nonaktifkan
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleReactivateUser(item)}
                                  className="text-xs font-medium text-[#176a43] hover:underline cursor-pointer"
                                >
                                  Aktifkan
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {hasDeactivatedIntern && (
              <div className="p-4 px-6 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-400 font-source-sans">
                Periode magang dan bukti historis tidak dihapus.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-[#e7f5ec] text-[#176a43] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-lexend">Admin</h3>
                  <p className="text-xs text-slate-500 font-source-sans">Akses penuh operasional internal</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 font-source-sans">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#176a43] shrink-0 mt-0.5" />
                  <span><strong>Manajemen Magang:</strong> Data peserta, monitor absensi, tinjau logbook, dan buat penugasan tugas.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#176a43] shrink-0 mt-0.5" />
                  <span><strong>Manajemen Keuangan:</strong> Pencatatan transaksi pemasukan/pengeluaran, kategori anggaran, dan ringkasan keuangan.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#176a43] shrink-0 mt-0.5" />
                  <span><strong>Pengaturan Sistem:</strong> Kelola akun pengguna, status akses (aktif/nonaktif), dan koordinat radius kantor.</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-lexend">Anak Magang</h3>
                  <p className="text-xs text-slate-500 font-source-sans">Akses mandiri aktivitas magang pribadi</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 font-source-sans">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Dashboard Mandiri:</strong> Pantau sisa hari magang dan tenggat tugas terdekat.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Absensi & Lokasi:</strong> Check-in dan check-out dengan foto selfie dan verifikasi koordinat kantor.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Logbook & Tugas:</strong> Catat progres kerja harian dan perbarui status tugas yang ditugaskan.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-400">Tidak memiliki akses ke manajemen keuangan atau data peserta lain.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal 1: Tambah Pengguna (F18) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 md:p-7 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 font-lexend">
                Tambah Pengguna
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddUser} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-source-sans">
                  Nama lengkap
                </label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-source-sans">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => {
                    setAddForm({ ...addForm, email: e.target.value });
                    if (addEmailError) setAddEmailError('');
                  }}
                  placeholder="nama@metro.demo"
                  className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition ${
                    addEmailError
                      ? 'border-rose-400 focus:ring-1 focus:ring-rose-500 bg-rose-50/20 text-slate-900'
                      : 'border-slate-300 focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f] text-slate-900'
                  }`}
                />
                {addEmailError ? (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium font-source-sans">
                    {addEmailError}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1 font-source-sans">
                    Gunakan email unik untuk setiap akun.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-source-sans">
                  Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => setAddForm({ ...addForm, role: 'Admin' })}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                      addForm.role === 'Admin'
                        ? 'border-[#17362f] bg-[#edf6f1] text-slate-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="add_role"
                      checked={addForm.role === 'Admin'}
                      onChange={() => setAddForm({ ...addForm, role: 'Admin' })}
                      className="accent-[#17362f]"
                    />
                    <span>Admin</span>
                  </label>

                  <label
                    onClick={() => setAddForm({ ...addForm, role: 'Anak Magang' })}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                      addForm.role === 'Anak Magang'
                        ? 'border-[#17362f] bg-[#edf6f1] text-slate-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="add_role"
                      checked={addForm.role === 'Anak Magang'}
                      onChange={() => setAddForm({ ...addForm, role: 'Anak Magang' })}
                      className="accent-[#17362f]"
                    />
                    <span>Anak Magang</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-source-sans">
                  Status akun
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => setAddForm({ ...addForm, status: 'Aktif' })}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                      addForm.status === 'Aktif'
                        ? 'border-[#17362f] bg-[#edf6f1] text-slate-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="add_status"
                      checked={addForm.status === 'Aktif'}
                      onChange={() => setAddForm({ ...addForm, status: 'Aktif' })}
                      className="accent-[#17362f]"
                    />
                    <span>Aktif</span>
                  </label>

                  <label
                    onClick={() => setAddForm({ ...addForm, status: 'Nonaktif' })}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                      addForm.status === 'Nonaktif'
                        ? 'border-[#17362f] bg-[#edf6f1] text-slate-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="add_status"
                      checked={addForm.status === 'Nonaktif'}
                      onChange={() => setAddForm({ ...addForm, status: 'Nonaktif' })}
                      className="accent-[#17362f]"
                    />
                    <span>Nonaktif</span>
                  </label>
                </div>
              </div>

              <div className="bg-[#edf6f1] border border-[#cde6d7] rounded-xl p-3.5 text-xs text-slate-800 space-y-1">
                <p className="font-bold text-[#17362f]">
                  Membuat akun Anak Magang baru?
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Gunakan Tambah Anak Magang agar akun terhubung dengan data peserta.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#17362f] hover:bg-[#122b25] active:scale-[0.99] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Ubah Pengguna (F19) */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 md:p-7 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 font-lexend">
                Ubah Pengguna
              </h2>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-source-sans">
                  Nama lengkap
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-source-sans">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => {
                    setEditForm({ ...editForm, email: e.target.value });
                    if (editEmailError) setEditEmailError('');
                  }}
                  className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition ${
                    editEmailError
                      ? 'border-rose-400 focus:ring-1 focus:ring-rose-500 bg-rose-50/20 text-slate-900'
                      : 'border-slate-300 focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f] text-slate-900'
                  }`}
                />
                {editEmailError ? (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium font-source-sans">
                    {editEmailError}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1 font-source-sans">
                    Gunakan email unik untuk setiap akun.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-source-sans">
                  Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => setEditForm({ ...editForm, role: 'Admin' })}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                      editForm.role === 'Admin'
                        ? 'border-[#17362f] bg-[#edf6f1] text-slate-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="edit_role"
                      checked={editForm.role === 'Admin'}
                      onChange={() => setEditForm({ ...editForm, role: 'Admin' })}
                      className="accent-[#17362f]"
                    />
                    <span>Admin</span>
                  </label>

                  <label
                    onClick={() => setEditForm({ ...editForm, role: 'Anak Magang' })}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                      editForm.role === 'Anak Magang'
                        ? 'border-[#17362f] bg-[#edf6f1] text-slate-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="edit_role"
                      checked={editForm.role === 'Anak Magang'}
                      onChange={() => setEditForm({ ...editForm, role: 'Anak Magang' })}
                      className="accent-[#17362f]"
                    />
                    <span>Anak Magang</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-source-sans">
                  Status akun
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => setEditForm({ ...editForm, status: 'Aktif' })}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                      editForm.status === 'Aktif'
                        ? 'border-[#17362f] bg-[#edf6f1] text-slate-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="edit_status"
                      checked={editForm.status === 'Aktif'}
                      onChange={() => setEditForm({ ...editForm, status: 'Aktif' })}
                      className="accent-[#17362f]"
                    />
                    <span>Aktif</span>
                  </label>

                  <label
                    onClick={() => setEditForm({ ...editForm, status: 'Nonaktif' })}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                      editForm.status === 'Nonaktif'
                        ? 'border-[#17362f] bg-[#edf6f1] text-slate-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="edit_status"
                      checked={editForm.status === 'Nonaktif'}
                      onChange={() => setEditForm({ ...editForm, status: 'Nonaktif' })}
                      className="accent-[#17362f]"
                    />
                    <span>Nonaktif</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#17362f] hover:bg-[#122b25] active:scale-[0.99] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Nonaktifkan Pengguna (F20) */}
      {deactivateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 md:p-7 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 font-lexend">
                Nonaktifkan Pengguna?
              </h2>
              <button
                type="button"
                onClick={() => setDeactivateUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 font-source-sans">
              <p className="text-base font-bold text-slate-900">
                {deactivateUser.name}
              </p>
              <p className="text-xs text-slate-500">
                {deactivateUser.email} · {deactivateUser.role}
              </p>
              <p className="text-xs text-slate-600 font-medium pt-1">
                Status akun: <span className="font-semibold text-emerald-700">Aktif</span> → <span className="font-semibold text-rose-600">Nonaktif</span>
              </p>
            </div>

            <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl p-4 text-xs space-y-1 font-source-sans">
              <p className="font-bold text-amber-900">
                Pengguna tidak dapat login
              </p>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                Data magang, absensi, logbook, dan riwayat tugas tetap tersimpan. Akun tidak dihapus permanen.
              </p>
            </div>

            <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeactivateUser(null)}
                className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivate}
                className="px-5 py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] active:scale-[0.99] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                Nonaktifkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
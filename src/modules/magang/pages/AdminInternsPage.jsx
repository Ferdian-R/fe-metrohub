import { useToast } from '../../../context/ToastContext';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  X,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { magangService } from '../services/magangService';

export const AdminInternsPage = () => {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // State untuk data akun terhubung setelah F01 (Tambah)
  const [lastAddedAccount, setLastAddedAccount] = useState(null);

  // Success Banner State
  const { showToast } = useToast();

  // Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatusKerja, setFilterStatusKerja] = useState('Semua status kerja');
  const [filterPeriode, setFilterPeriode] = useState('Semua periode');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    kampus: '',
    email: '',
    password: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    status_kerja: 'Remote',
  });

  const [formErrors, setFormErrors] = useState({});

  const fetchInterns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await magangService.getAllInterns();
      const data = res?.data || [];
      setInterns(data);
    } catch (err) {
      console.error('Failed to load interns:', err);
      setError(err?.message || 'Gagal memuat data anak magang');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterns();
  }, [fetchInterns]);

  const formatDateToID = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const d = String(date.getDate()).padStart(2, '0');
    const m = months[date.getMonth()];
    const y = date.getFullYear();
    return `${d} ${m} ${y}`;
  };

  // Filter Data
  const filteredInterns = useMemo(() => {
    return interns.filter((intern) => {
      const nama = intern.nama || '';
      const kampus = intern.asal_kampus || intern.kampus || '';
      const email = intern.email || '';
      const statusKerjaNormalized = intern.status_kerja === 'ONSITE' ? 'On-site' : 'Remote';
      const statusPeriode = intern.masa_magang_aktif ? 'Aktif' : 'Berakhir';

      const matchSearch =
        nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kampus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatusKerja =
        filterStatusKerja === 'Semua status kerja' ||
        statusKerjaNormalized.toLowerCase() === filterStatusKerja.toLowerCase();

      const matchPeriode =
        filterPeriode === 'Semua periode' ||
        statusPeriode.toLowerCase() === filterPeriode.toLowerCase();

      return matchSearch && matchStatusKerja && matchPeriode;
    });
  }, [interns, searchQuery, filterStatusKerja, filterPeriode]);

  // Buka Modal Tambah (F01)
  const handleOpenAddModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      nama: '',
      kampus: '',
      email: '',
      password: '',
      tanggal_mulai: today,
      tanggal_selesai: '',
      status_kerja: 'Remote',
    });
    setFormErrors({});
    setShowPassword(false);
    setShowAddModal(true);
  };

  // Simpan Tambah Anak Magang (F01)
  const handleSaveAdd = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.nama.trim()) errors.nama = 'Nama lengkap wajib diisi.';
    if (!formData.kampus.trim()) errors.kampus = 'Asal kampus wajib diisi.';
    if (!formData.email.trim()) errors.email = 'Email wajib diisi.';
    if (!formData.password || formData.password.length < 8) {
      errors.password = 'Password minimal 8 karakter.';
    }

    if (formData.tanggal_mulai && formData.tanggal_selesai) {
      if (new Date(formData.tanggal_selesai) < new Date(formData.tanggal_mulai)) {
        errors.tanggal_selesai = 'Tanggal selesai harus sama dengan atau setelah tanggal mulai.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        nama: formData.nama.trim(),
        email: formData.email.trim(),
        password: formData.password,
        asal_kampus: formData.kampus.trim(),
        tanggal_mulai: formData.tanggal_mulai,
        tanggal_selesai: formData.tanggal_selesai,
        status_kerja: formData.status_kerja === 'On-site' ? 'ONSITE' : 'REMOTE',
      };

      const res = await magangService.createIntern(payload);
      setShowAddModal(false);

      showToast({
        title: `${payload.nama} berhasil ditambahkan`,
        message: `Akun ${payload.email} terhubung dengan peserta ${payload.nama}.`,
      });

      setLastAddedAccount({
        nama: payload.nama,
        email: payload.email,
        role: 'Anak Magang',
        status: 'Aktif',
      });

      await fetchInterns();
    } catch (err) {
      console.error('Failed to create intern:', err);
      const errMsg = err?.message || 'Gagal menambahkan data anak magang';
      if (err?.details && Array.isArray(err.details)) {
        const fieldErrors = {};
        err.details.forEach((d) => {
          fieldErrors[d.field] = d.message;
        });
        setFormErrors(fieldErrors);
      } else {
        setFormErrors({ general: errMsg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Buka Modal Ubah (F02)
  const handleOpenEditModal = (intern) => {
    setSelectedIntern(intern);
    setFormData({
      nama: intern.nama || '',
      kampus: intern.asal_kampus || intern.kampus || '',
      email: intern.email || '',
      password: '',
      tanggal_mulai: intern.tanggal_mulai || '',
      tanggal_selesai: intern.tanggal_selesai || '',
      status_kerja: intern.status_kerja === 'ONSITE' ? 'On-site' : 'Remote',
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  // Simpan Ubah Anak Magang (F02)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.nama.trim()) errors.nama = 'Nama lengkap wajib diisi.';
    if (!formData.kampus.trim()) errors.kampus = 'Asal kampus wajib diisi.';
    if (!formData.email.trim()) errors.email = 'Email wajib diisi.';

    if (new Date(formData.tanggal_selesai) < new Date(formData.tanggal_mulai)) {
      errors.tanggal_selesai = 'Tanggal selesai harus sama dengan atau setelah tanggal mulai.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        nama: formData.nama.trim(),
        email: formData.email.trim(),
        asal_kampus: formData.kampus.trim(),
        tanggal_mulai: formData.tanggal_mulai,
        tanggal_selesai: formData.tanggal_selesai,
      };

      await magangService.updateIntern(selectedIntern.id, payload);

      const newStatusKerjaEnum = formData.status_kerja === 'On-site' ? 'ONSITE' : 'REMOTE';
      if (selectedIntern.status_kerja !== newStatusKerjaEnum) {
        await magangService.updateStatusKerja(selectedIntern.id, newStatusKerjaEnum);
      }

      setShowEditModal(false);

      showToast({
        title: `Data ${payload.nama} tersimpan`,
        message: `Perubahan diterapkan pada peserta. Akun ${payload.email} tetap terhubung.`,
      });
      setLastAddedAccount(null);

      await fetchInterns();
    } catch (err) {
      console.error('Failed to update intern:', err);
      const errMsg = err?.message || 'Gagal mengubah data anak magang';
      if (err?.details && Array.isArray(err.details)) {
        const fieldErrors = {};
        err.details.forEach((d) => {
          fieldErrors[d.field] = d.message;
        });
        setFormErrors(fieldErrors);
      } else {
        setFormErrors({ general: errMsg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight font-lexend">
            Data Anak Magang
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Data peserta, periode, dan status kerja.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="self-start sm:self-auto px-4 py-2.5 bg-[#17362f] hover:bg-[#122b25] active:scale-[0.99] text-white text-xs md:text-sm font-semibold rounded-lg flex items-center gap-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Anak Magang</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs md:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchInterns}
            className="px-3 py-1 bg-white border border-rose-300 rounded-lg text-rose-700 hover:bg-rose-50 font-medium text-xs transition"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, kampus, atau email"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-[#fbfcfc] text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f] transition placeholder:text-slate-400"
          />
        </div>

        <div className="w-full md:w-52">
          <select
            value={filterStatusKerja}
            onChange={(e) => setFilterStatusKerja(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs md:text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#17362f] cursor-pointer"
          >
            <option value="Semua status kerja">Semua status kerja</option>
            <option value="On-site">On-site</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        <div className="w-full md:w-48">
          <select
            value={filterPeriode}
            onChange={(e) => setFilterPeriode(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs md:text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#17362f] cursor-pointer"
          >
            <option value="Semua periode">Semua periode</option>
            <option value="Aktif">Aktif</option>
            <option value="Berakhir">Berakhir</option>
          </select>
        </div>
      </div>

      {/* Tabel Data Anak Magang */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-4 font-semibold">Nama dan Email</th>
                <th className="px-5 py-4 font-semibold">Kampus</th>
                <th className="px-5 py-4 font-semibold">Periode</th>
                <th className="px-5 py-4 font-semibold">Status Kerja</th>
                <th className="px-5 py-4 font-semibold">Status Periode</th>
                <th className="px-5 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#17362f] mb-2" />
                    <span>Memuat data anak magang...</span>
                  </td>
                </tr>
              ) : filteredInterns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    Belum ada data anak magang.
                  </td>
                </tr>
              ) : (
                filteredInterns.map((intern) => {
                  const statusKerjaLabel = intern.status_kerja === 'ONSITE' ? 'On-site' : 'Remote';
                  const isAktif = intern.masa_magang_aktif ?? true;
                  const periodeText = `${formatDateToID(intern.tanggal_mulai)}—${formatDateToID(intern.tanggal_selesai)}`;

                  return (
                    <tr key={intern.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900 leading-snug">
                          {intern.nama} · <span className="font-normal font-mono text-slate-500">{intern.email}</span>
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">
                        {intern.asal_kampus || intern.kampus || '-'}
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {periodeText}
                      </td>
                      <td className="px-5 py-4 text-slate-700 font-medium">
                        {statusKerjaLabel}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            isAktif
                              ? 'bg-[#e7f5ec] text-[#206941]'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {isAktif ? 'Aktif' : 'Berakhir'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap font-medium">
                        <Link
                          to={`/admin/magang/interns/${intern.id}`}
                          className="text-[#17362f] hover:text-[#285e51] hover:underline mr-4 transition"
                        >
                          Lihat Detail
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(intern)}
                          className="text-[#17362f] hover:text-[#285e51] hover:underline transition"
                        >
                          Ubah
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Menampilkan {filteredInterns.length} peserta</span>
          <span>1 dari 1 halaman</span>
        </div>
      </div>

      {/* Tabel Akun Terhubung */}
      {lastAddedAccount && (
        <div className="space-y-2 animate-fadeIn">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-white text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-4 font-semibold">Akun terhubung</th>
                    <th className="px-5 py-4 font-semibold">Email</th>
                    <th className="px-5 py-4 font-semibold">Role</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  <tr>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {lastAddedAccount.nama}
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-mono">
                      {lastAddedAccount.email}
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium">
                      {lastAddedAccount.role}
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium">
                      {lastAddedAccount.status}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Tambah Anak Magang (F01) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-semibold text-slate-900 font-lexend">
                Tambah Anak Magang
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formErrors.general && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formErrors.general}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Nama lengkap peserta"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f]"
                />
                {formErrors.nama && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.nama}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asal kampus
                </label>
                <input
                  type="text"
                  required
                  value={formData.kampus}
                  onChange={(e) => setFormData({ ...formData, kampus: e.target.value })}
                  placeholder="Nama universitas / institut"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f]"
                />
                {formErrors.kampus && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.kampus}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email akun
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (formErrors.email) setFormErrors({ ...formErrors, email: null });
                  }}
                  placeholder="peserta@kampus.ac.id"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-xs md:text-sm text-slate-900 focus:outline-none ${
                    formErrors.email
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-slate-300 focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f]'
                  }`}
                />
                {formErrors.email && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password akun awal
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (formErrors.password) setFormErrors({ ...formErrors, password: null });
                    }}
                    placeholder="Minimal 8 karakter"
                    className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border text-xs md:text-sm text-slate-900 focus:outline-none ${
                      formErrors.password
                        ? 'border-rose-500 bg-rose-50/20'
                        : 'border-slate-300 focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.password}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal mulai
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal_mulai}
                    onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#17362f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal selesai
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal_selesai}
                    onChange={(e) => {
                      setFormData({ ...formData, tanggal_selesai: e.target.value });
                      if (formErrors.tanggal_selesai) setFormErrors({ ...formErrors, tanggal_selesai: null });
                    }}
                    className={`w-full px-3 py-2 rounded-lg border text-xs text-slate-800 focus:outline-none ${
                      formErrors.tanggal_selesai
                        ? 'border-rose-500 bg-rose-50/20'
                        : 'border-slate-300 focus:ring-1 focus:ring-[#17362f]'
                    }`}
                  />
                  {formErrors.tanggal_selesai && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.tanggal_selesai}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status kerja
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition text-xs font-medium ${
                      formData.status_kerja === 'On-site'
                        ? 'border-[#17362f] bg-[#eef5f2] text-[#17362f]'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status_kerja_add"
                      checked={formData.status_kerja === 'On-site'}
                      onChange={() => setFormData({ ...formData, status_kerja: 'On-site' })}
                      className="accent-[#17362f]"
                    />
                    <span>On-site</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition text-xs font-medium ${
                      formData.status_kerja === 'Remote'
                        ? 'border-[#17362f] bg-[#eef5f2] text-[#17362f]'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status_kerja_add"
                      checked={formData.status_kerja === 'Remote'}
                      onChange={() => setFormData({ ...formData, status_kerja: 'Remote' })}
                      className="accent-[#17362f]"
                    />
                    <span>Remote</span>
                  </label>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#eef6f2] border border-[#d2e7dc] text-xs text-[#20493e]">
                <p className="font-bold text-[#17362f]">Akun dibuat bersama peserta</p>
                <p className="text-[11px] text-[#3d6559] mt-0.5">
                  Email dan password ini akan langsung dapat digunakan oleh peserta untuk masuk ke MetroHub.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#17362f] hover:bg-[#122b25] disabled:bg-slate-400 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Simpan Peserta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Ubah Data Anak Magang (F02) */}
      {showEditModal && selectedIntern && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-semibold text-slate-900 font-lexend">
                Ubah Data Anak Magang
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formErrors.general && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formErrors.general}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#17362f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asal kampus
                </label>
                <input
                  type="text"
                  required
                  value={formData.kampus}
                  onChange={(e) => setFormData({ ...formData, kampus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#17362f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (formErrors.email) setFormErrors({ ...formErrors, email: null });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-xs md:text-sm text-slate-900 focus:outline-none ${
                    formErrors.email
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-slate-300 focus:ring-1 focus:ring-[#17362f]'
                  }`}
                />
                {formErrors.email && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal mulai
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal_mulai}
                    onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#17362f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal selesai
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal_selesai}
                    onChange={(e) => {
                      setFormData({ ...formData, tanggal_selesai: e.target.value });
                      if (formErrors.tanggal_selesai) setFormErrors({ ...formErrors, tanggal_selesai: null });
                    }}
                    className={`w-full px-3 py-2 rounded-lg border text-xs text-slate-800 focus:outline-none ${
                      formErrors.tanggal_selesai
                        ? 'border-rose-500 bg-rose-50/20'
                        : 'border-slate-300 focus:ring-1 focus:ring-[#17362f]'
                    }`}
                  />
                  {formErrors.tanggal_selesai && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.tanggal_selesai}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status kerja
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition text-xs font-medium ${
                      formData.status_kerja === 'On-site'
                        ? 'border-[#17362f] bg-[#eef5f2] text-[#17362f]'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status_kerja_edit"
                      checked={formData.status_kerja === 'On-site'}
                      onChange={() => setFormData({ ...formData, status_kerja: 'On-site' })}
                      className="accent-[#17362f]"
                    />
                    <span>On-site</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition text-xs font-medium ${
                      formData.status_kerja === 'Remote'
                        ? 'border-[#17362f] bg-[#eef5f2] text-[#17362f]'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status_kerja_edit"
                      checked={formData.status_kerja === 'Remote'}
                      onChange={() => setFormData({ ...formData, status_kerja: 'Remote' })}
                      className="accent-[#17362f]"
                    />
                    <span>Remote</span>
                  </label>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#eef6f2] border border-[#d2e7dc] text-xs text-[#20493e]">
                <p className="font-bold text-[#17362f]">Memperbarui peserta</p>
                <p className="text-[11px] text-[#3d6559] mt-0.5">
                  Perubahan tersimpan pada akun peserta yang sama.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#17362f] hover:bg-[#122b25] disabled:bg-slate-400 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInternsPage;

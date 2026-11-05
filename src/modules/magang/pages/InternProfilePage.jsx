import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ShieldCheck, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { magangService } from '../services/magangService';

export const InternProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await magangService.getInternMe();
      setProfile(res?.data || null);
    } catch (err) {
      console.error('Failed to load intern profile:', err);
      // Fallback ke auth user jika ada
      if (!user) {
        setError(err?.message || 'Gagal memuat profil peserta magang');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatDateToID = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const nama = profile?.nama || user?.nama || 'Peserta Magang';
  const email = profile?.email || user?.email || '-';
  const asalKampus = profile?.asal_kampus || '-';
  const statusKerja = profile?.status_kerja === 'REMOTE' ? 'Remote' : 'On-site';
  const isAktif = profile?.masa_magang_aktif ?? true;
  const isAkunAktif = profile?.akun_aktif ?? true;
  const sisaHari = profile?.sisa_hari ?? 0;
  const periode = profile?.tanggal_mulai && profile?.tanggal_selesai
    ? `${formatDateToID(profile.tanggal_mulai)} — ${formatDateToID(profile.tanggal_selesai)}`
    : '-';

  // Get initials
  const initials = nama
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <div className="space-y-6 w-full pb-12 font-sans">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight font-lexend">
          Profil
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Informasi akun dan masa magang Anda.
        </p>
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
            onClick={fetchProfile}
            className="px-3 py-1 bg-white border border-rose-300 rounded text-xs font-semibold"
          >
            Coba lagi
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#17362f] mb-3" />
          <p className="text-sm">Memuat informasi profil...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Kolom Kiri: Kartu Identitas Akun */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-2xs flex flex-col items-center justify-center">
            {/* Avatar Lingkaran Besar */}
            <div className="w-24 h-24 rounded-full bg-[#dbe8e2] text-[#17362f] font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              {initials || 'MG'}
            </div>

            {/* Nama & Email */}
            <h2 className="text-lg font-bold text-slate-900 font-lexend">
              {nama}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {email}
            </p>

            {/* Badge Akun Aktif */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-4 ${
              isAkunAktif
                ? 'bg-[#e7f5ec] text-[#176a43] border border-[#c6e9d4]'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {isAkunAktif ? 'Akun aktif' : 'Akun nonaktif'}
            </span>

            {/* Tombol Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Akun</span>
            </button>
          </div>

          {/* Kolom Kanan: Kartu Informasi Magang */}
          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-8 shadow-2xs space-y-6">
            <h2 className="text-lg font-bold text-slate-900 font-lexend">
              Informasi magang
            </h2>

            <div className="divide-y divide-slate-100 text-xs md:text-sm">
              <div className="py-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center">
                <span className="text-slate-500 w-36 shrink-0 mb-1 sm:mb-0">
                  Asal kampus
                </span>
                <span className="font-bold text-slate-800">
                  {asalKampus}
                </span>
              </div>

              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center">
                <span className="text-slate-500 w-36 shrink-0 mb-1 sm:mb-0">
                  Periode
                </span>
                <span className="font-bold text-slate-800">
                  {periode}
                </span>
              </div>

              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center">
                <span className="text-slate-500 w-36 shrink-0 mb-1 sm:mb-0">
                  Status penempatan
                </span>
                <span className="font-bold text-slate-800">
                  {statusKerja}
                </span>
              </div>

              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center">
                <span className="text-slate-500 w-36 shrink-0 mb-1 sm:mb-0">
                  Status masa magang
                </span>
                <span className="font-bold text-slate-800">
                  {isAktif ? `Aktif · ${sisaHari} hari tersisa` : 'Masa magang berakhir'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternProfilePage;

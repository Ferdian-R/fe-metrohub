import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { magangService } from '../services/magangService';

export const InternDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [internProfile, setInternProfile] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [myTasks, setMyTasks] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileRes, attRes, tasksRes] = await Promise.allSettled([
        magangService.getInternMe(),
        magangService.getTodayAttendance(),
        magangService.getMyTasks(),
      ]);

      if (profileRes.status === 'fulfilled') {
        setInternProfile(profileRes.value?.data || null);
      }
      if (attRes.status === 'fulfilled') {
        setTodayAttendance(attRes.value?.data || null);
      }
      if (tasksRes.status === 'fulfilled') {
        setMyTasks(tasksRes.value?.data || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err?.message || 'Gagal memuat ringkasan dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatDateLong = (dateObj = new Date()) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const dayName = days[dateObj.getDay()];
    const dateNum = dateObj.getDate();
    const monthName = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${dayName}, ${dateNum} ${monthName} ${year}`;
  };

  const formatShortDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatTimeWIB = (timeStr) => {
    if (!timeStr) return null;
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return timeStr;
      return d.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB';
    } catch {
      return timeStr;
    }
  };

  // Determine current action card
  const getActionRecommendation = () => {
    if (!todayAttendance) {
      return {
        judul: 'Mulai presensi hari ini',
        deskripsi: 'Ambil foto wajah dan pastikan koordinat GPS aktif untuk melakukan check-in.',
        aksiLabel: 'Mulai Check-in',
        targetUrl: '/magang/absensi',
      };
    }

    if (!todayAttendance.sudah_checkin) {
      return {
        judul: 'Belum melakukan check-in',
        deskripsi: 'Ambil foto wajah dan lokasi terkini untuk membuka akses pengisian logbook.',
        aksiLabel: 'Lakukan Check-in',
        targetUrl: '/magang/absensi',
      };
    }

    if (!todayAttendance.logbook_tersimpan) {
      return {
        judul: 'Isi logbook harian',
        deskripsi: 'Check-in telah tercatat. Isi catatan aktivitas hari ini sebelum melakukan check-out.',
        aksiLabel: 'Tulis Logbook',
        targetUrl: '/magang/logbook',
      };
    }

    if (!todayAttendance.sudah_checkout) {
      return {
        judul: 'Siap menyelesaikan absensi',
        deskripsi: 'Check-in dan logbook sudah tersimpan. Ambil foto serta lokasi baru untuk check-out.',
        aksiLabel: 'Lanjut Check-out',
        targetUrl: '/magang/absensi',
      };
    }

    return {
      judul: 'Absensi hari ini lengkap',
      deskripsi: 'Seluruh tahapan presensi dan logbook hari ini telah berhasil diselesaikan.',
      aksiLabel: 'Lihat Absensi',
      targetUrl: '/magang/absensi',
    };
  };

  // Calculate internship progress percent
  const getInternProgressPercent = () => {
    if (!internProfile?.tanggal_mulai || !internProfile?.tanggal_selesai) return 50;
    const start = new Date(internProfile.tanggal_mulai).getTime();
    const end = new Date(internProfile.tanggal_selesai).getTime();
    const now = new Date().getTime();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const action = getActionRecommendation();
  const progressPercent = getInternProgressPercent();
  const statusKerjaLabel = internProfile?.status_kerja === 'REMOTE' ? 'Remote' : 'On-site';

  const checkinTime = formatTimeWIB(todayAttendance?.absensi?.jam_checkin);
  const checkoutTime = formatTimeWIB(todayAttendance?.absensi?.jam_checkout);

  return (
    <div className="space-y-6 w-full">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight font-lexend">
          Dashboard Saya
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          {formatDateLong()} · {statusKerjaLabel}
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
            onClick={fetchDashboardData}
            className="px-3 py-1 bg-white border border-rose-300 rounded text-xs font-semibold"
          >
            Coba lagi
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#17362f] mb-3" />
          <p className="text-sm">Memuat informasi dashboard...</p>
        </div>
      ) : (
        <>
          {/* Card Aksi Utama (Hero Card) */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 md:p-8 shadow-2xs">
            <div className="max-w-2xl space-y-3">
              <span className="text-[11px] font-bold text-[#17362f] tracking-wider uppercase">
                Tindakan Hari Ini
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight font-lexend">
                {action.judul}
              </h2>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                {action.deskripsi}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate(action.targetUrl)}
                  className="px-5 py-2.5 bg-[#17362f] hover:bg-[#122b25] text-white text-xs md:text-sm font-semibold rounded-lg shadow-xs transition"
                >
                  {action.aksiLabel}
                </button>
              </div>
            </div>
          </div>

          {/* Grid Dua Kolom: Status Hari Ini & Masa Magang */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Card 1: Status Hari Ini */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-6 md:p-7 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-slate-900 font-lexend">
                    Status hari ini
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                    todayAttendance?.sudah_checkout
                      ? 'bg-[#e7f5ec] text-[#206941]'
                      : todayAttendance?.sudah_checkin
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {todayAttendance?.sudah_checkout
                      ? 'Selesai'
                      : todayAttendance?.sudah_checkin
                      ? 'Dalam proses'
                      : 'Belum mulai'}
                  </span>
                </div>

                {/* Stepper Timeline */}
                <div className="space-y-5">
                  {/* Step 1: Check-in */}
                  <div className="flex items-start gap-4">
                    <div className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                      todayAttendance?.sudah_checkin
                        ? 'bg-[#e7f5ec] text-[#206941]'
                        : 'border border-slate-300 text-slate-400'
                    }`}>
                      1
                    </div>
                    <div>
                      <p className="font-bold text-xs md:text-sm text-slate-800">Check-in</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {checkinTime || 'Belum dilakukan'}
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Logbook */}
                  <div className="flex items-start gap-4">
                    <div className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                      todayAttendance?.logbook_tersimpan
                        ? 'bg-[#e7f5ec] text-[#206941]'
                        : 'border border-slate-300 text-slate-400'
                    }`}>
                      2
                    </div>
                    <div>
                      <p className="font-bold text-xs md:text-sm text-slate-800">Logbook</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {todayAttendance?.logbook_tersimpan ? 'Sudah tersimpan' : 'Belum diisi'}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Check-out */}
                  <div className="flex items-start gap-4">
                    <div className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                      todayAttendance?.sudah_checkout
                        ? 'bg-[#e7f5ec] text-[#206941]'
                        : 'border border-slate-300 text-slate-400'
                    }`}>
                      3
                    </div>
                    <div>
                      <p className="font-bold text-xs md:text-sm text-slate-800">Check-out</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {checkoutTime || 'Belum dilakukan'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Masa Magang */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-6 md:p-7 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900 font-lexend mb-4">
                  Masa magang
                </h3>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-lexend">
                    {internProfile?.sisa_hari ?? 0}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    hari tersisa
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-6">
                  {internProfile?.tanggal_selesai
                    ? `tersisa hingga ${formatShortDate(internProfile.tanggal_selesai)}`
                    : 'Periode belum ditentukan'}
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-[#17362f] h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
                  <span>{formatShortDate(internProfile?.tanggal_mulai)}</span>
                  <span>{formatShortDate(internProfile?.tanggal_selesai)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Bawah: Tugas Mendatang / Berjalan */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 md:p-7 shadow-2xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold text-slate-900 font-lexend">
                  Tugas Saya
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar tugas yang diberikan pembimbing untuk Anda.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/magang/tugas')}
                className="text-xs font-semibold text-[#17362f] hover:underline flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {myTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada tugas yang diberikan kepada Anda saat ini.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myTasks.slice(0, 3).map((task) => {
                  const isSelesai = task.status === 'SELESAI';
                  const isTerlambat = Boolean(task.terlambat);

                  let statusBadge = 'bg-amber-50 text-amber-700';
                  let statusText = 'Dikerjakan';
                  if (isSelesai) {
                    statusBadge = 'bg-[#e7f5ec] text-[#206941]';
                    statusText = 'Selesai';
                  } else if (isTerlambat) {
                    statusBadge = 'bg-rose-50 text-rose-700';
                    statusText = 'Terlambat';
                  } else if (task.status === 'BELUM_DIKERJAKAN') {
                    statusBadge = 'bg-slate-100 text-slate-600';
                    statusText = 'Belum Dikerjakan';
                  }

                  return (
                    <div
                      key={task.id}
                      onClick={() => navigate('/magang/tugas')}
                      className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-lg cursor-pointer transition"
                    >
                      <div>
                        <h4 className="font-semibold text-slate-800 text-xs md:text-sm">
                          {task.judul}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Tenggat: {formatShortDate(task.tenggat)}
                        </p>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${statusBadge}`}>
                        {statusText}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default InternDashboardPage;

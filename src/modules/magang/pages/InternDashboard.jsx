import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { magangService } from '../services/magangService';
import { useAuth } from '../../../context/AuthContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  MapPin,
  CalendarCheck2,
} from 'lucide-react';

export const InternDashboard = () => {
  const { user } = useAuth();
  const [internInfo, setInternInfo] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, tasksRes, attRes] = await Promise.all([
          magangService.getInternMe().catch(() => ({ data: null })),
          magangService.getMyTasks().catch(() => ({ data: [] })),
          magangService.getTodayAttendance().catch(() => ({ data: null })),
        ]);
        setInternInfo(meRes.data);
        setTasks(tasksRes.data || []);
        setTodayAttendance(attRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Hitung sisa hari magang (MG-08)
  const calculateDaysLeft = () => {
    if (!internInfo?.tanggal_selesai) return null;
    const end = new Date(internInfo.tanggal_selesai);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = calculateDaysLeft();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-xl shadow-indigo-600/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-semibold tracking-wider uppercase mb-2">
            Peserta Magang
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Halo, {user?.nama || 'Anak Magang'}!</h1>
          <p className="text-xs text-indigo-100 mt-1 max-w-md">
            Selamat datang di Portal MetroHub. Jangan lupa lakukan check-in dan catat kegiatan logbook harian Anda.
          </p>
        </div>

        {daysLeft !== null && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-bold text-2xl text-amber-300">
              {daysLeft}
            </div>
            <div>
              <p className="text-xs text-indigo-200">Sisa Masa Magang</p>
              <p className="text-sm font-bold text-white">{daysLeft} Hari Lagi</p>
            </div>
          </div>
        )}
      </div>

      {/* Grid Status Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card Kehadiran Hari Ini */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Status Absensi Hari Ini</span>
            <CalendarCheck2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="my-3">
            <p className="text-xl font-bold text-slate-800">
              {todayAttendance?.jam_checkout
                ? 'Selesai (Check-out)'
                : todayAttendance?.jam_checkin
                ? 'Sudah Check-in'
                : 'Belum Presensi'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Check-in: {todayAttendance?.jam_checkin || '-'} | Check-out: {todayAttendance?.jam_checkout || '-'}
            </p>
          </div>
          <Link
            to="/absensi"
            className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            Buka Halaman Presensi <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card Status Kerja */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Mode Penempatan</span>
            <MapPin className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="my-3">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                internInfo?.status_kerja === 'remote'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {internInfo?.status_kerja === 'remote' ? 'Remote (WFA)' : 'On-site (Kantor Metro)'}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              {internInfo?.asal_kampus || 'Universitas Mitra'}
            </p>
          </div>
          <p className="text-[11px] text-slate-400">
            {internInfo?.status_kerja === 'remote'
              ? 'Absensi dapat dari lokasi mana pun'
              : 'Absensi wajib dalam radius kantor'}
          </p>
        </div>

        {/* Card Tugas Aktif */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tugas Belum Selesai</span>
            <Briefcase className="w-5 h-5 text-amber-500" />
          </div>
          <div className="my-3">
            <p className="text-2xl font-bold text-slate-800">
              {tasks.filter((t) => t.status !== 'Selesai').length}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Tugas aktif dalam antrean Anda</p>
          </div>
          <Link
            to="/tugas"
            className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            Lihat Semua Tugas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

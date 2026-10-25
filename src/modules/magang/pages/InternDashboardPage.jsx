import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { magangService } from '../services/magangService';

export const InternDashboardPage = () => {
  const navigate = useNavigate();

  // State data inisial sesuai token Figma M-01
  const [dashboardData, setDashboardData] = useState({
    tanggalFormatted: 'Selasa, 20 Oktober 2026',
    statusKerja: 'On-site',
    tindakan: {
      judul: 'Siap menyelesaikan absensi',
      deskripsi: 'Check-in dan logbook sudah tersimpan. Ambil foto serta lokasi baru untuk check-out.',
      aksiLabel: 'Lanjut Check-out',
      targetUrl: '/magang/absensi',
    },
    statusHariIni: {
      badge: 'Dalam proses',
      steps: [
        { id: 1, label: 'Check-in', waktu: '08.12 WIB', status: 'completed' },
        { id: 2, label: 'Logbook', waktu: 'Tersimpan · 12.30 WIB', status: 'saved' },
        { id: 3, label: 'Check-out', waktu: 'Belum dilakukan', status: 'pending' },
      ],
    },
    masaMagang: {
      sisaHari: 72,
      tenggatFormatted: 'tersisa hingga 31 Desember 2026',
      rentang: '1 Agustus — 31 Desember 2026',
      persen: 60,
    },
    tenggatTerdekat: [
      {
        id: 1,
        tanggal: '22',
        bulan: 'OKT',
        judul: 'Implementasi halaman laporan',
        keterangan: 'Dikerjakan · Tenggat dalam 2 hari',
        status: 'Dikerjakan',
        statusType: 'success',
      },
      {
        id: 2,
        tanggal: '18',
        bulan: 'OKT',
        judul: 'Audit komponen formulir',
        keterangan: 'Belum dikerjakan · Melewati tenggat',
        status: 'Terlambat',
        statusType: 'danger',
      },
    ],
  });

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const [todayAttRes] = await Promise.allSettled([
          magangService.getTodayAttendance(),
        ]);

        if (todayAttRes.status === 'fulfilled' && todayAttRes.value?.data) {
          const att = todayAttRes.value.data;
          setDashboardData((prev) => ({
            ...prev,
            statusHariIni: {
              ...prev.statusHariIni,
              steps: [
                {
                  id: 1,
                  label: 'Check-in',
                  waktu: att.jam_masuk ? (att.jam_masuk + ' WIB') : 'Belum dilakukan',
                  status: att.jam_masuk ? 'completed' : 'pending',
                },
                prev.statusHariIni.steps[1],
                {
                  id: 3,
                  label: 'Check-out',
                  waktu: att.jam_pulang ? (att.jam_pulang + ' WIB') : 'Belum dilakukan',
                  status: att.jam_pulang ? 'completed' : 'pending',
                },
              ],
            },
          }));
        }
      } catch {
        // Pertahankan tampilan token Figma
      }
    };

    fetchRealData();
  }, []);

  return (
    <div className="space-y-6 w-full">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight font-lexend">
          Dashboard Saya
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1 font-source-sans">
          {dashboardData.tanggalFormatted} · Status kerja {dashboardData.statusKerja}
        </p>
      </div>

      {/* Tindakan Berikutnya - Hero Action Banner */}
      <div className="bg-[#17362f] rounded-2xl p-6 md:p-7 text-white flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
        <div className="space-y-1.5 max-w-2xl">
          <p className="text-[11px] font-bold tracking-widest text-[#8eb8aa] uppercase font-source-sans">
            TINDAKAN BERIKUTNYA
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight font-lexend">
            {dashboardData.tindakan.judul}
          </h2>
          <p className="text-xs md:text-sm text-[#9ebcb0] leading-relaxed font-source-sans">
            {dashboardData.tindakan.deskripsi}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(dashboardData.tindakan.targetUrl)}
          className="self-start md:self-auto px-5 py-2.5 bg-white hover:bg-[#f2f6f4] active:scale-[0.99] text-[#17362f] text-sm font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer shrink-0 font-source-sans"
        >
          <span>{dashboardData.tindakan.aksiLabel}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid 2 Kolom: Status hari ini & Masa magang */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Status hari ini */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-lexend">
                Status hari ini
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fef7ee] text-[#b45309] border border-[#fed7aa] font-source-sans">
                {dashboardData.statusHariIni.badge}
              </span>
            </div>

            {/* Stepper Timeline */}
            <div className="mt-6 space-y-1">
              {dashboardData.statusHariIni.steps.map((step, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === dashboardData.statusHariIni.steps.length - 1;

                return (
                  <div key={step.id} className="flex items-start gap-4">
                    {/* Kolom Indikator & Garis */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isFirst
                            ? 'bg-[#17362f] text-white shadow-xs'
                            : 'bg-white border border-slate-300 text-slate-600'
                        }`}
                      >
                        {step.id}
                      </div>
                      {!isLast && (
                        <div className="w-0.5 h-7 bg-slate-200 my-1" />
                      )}
                    </div>

                    {/* Kolom Teks */}
                    <div className="pt-0.5">
                      <p
                        className={`text-sm font-bold leading-tight font-source-sans ${
                          isFirst ? 'text-slate-900' : 'text-slate-800'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 font-source-sans">
                        {step.waktu}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 2: Masa magang */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <div>
            <p className="text-sm font-medium text-slate-500 font-source-sans">
              Masa magang
            </p>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight font-lexend">
              {dashboardData.masaMagang.sisaHari} hari
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-source-sans">
              {dashboardData.masaMagang.tenggatFormatted}
            </p>
          </div>

          <div className="mt-5">
            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#17362f] rounded-full transition-all duration-500"
                style={{ width: `${dashboardData.masaMagang.persen}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2.5 font-medium font-source-sans">
              {dashboardData.masaMagang.rentang}
            </p>
          </div>
        </div>
      </div>

      {/* Card 3: Tenggat terdekat */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-lexend">
              Tenggat terdekat
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-source-sans">
              Tugas yang perlu mendapat perhatian.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/magang/tugas')}
            className="text-xs font-semibold text-[#17362f] hover:underline cursor-pointer font-source-sans"
          >
            Lihat semua
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {dashboardData.tenggatTerdekat.map((item) => (
            <div
              key={item.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5">
                {/* Kotak Tanggal */}
                <div className="w-11 h-11 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-slate-800 leading-none">
                    {item.tanggal}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mt-1">
                    {item.bulan}
                  </span>
                </div>

                {/* Konten Tugas */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-source-sans">
                    {item.judul}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-source-sans">
                    {item.keterangan}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="self-start sm:self-auto">
                {item.statusType === 'danger' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] font-source-sans">
                    {item.status}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#e7f5ec] text-[#176a43] border border-[#c6e9d4] font-source-sans">
                    {item.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
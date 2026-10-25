import React, { useState } from 'react';
import {
  ChevronDown,
  X,
} from 'lucide-react';

const INITIAL_ATTENDANCE_DATA = [
  {
    id: 1,
    tanggal: '20 Okt 2026',
    rawDate: '2026-10-20',
    peserta: 'Raka Aditya',
    checkin: '08.12 WIB',
    checkout: 'Belum check-out',
    kelengkapan: 'Belum lengkap',
    kelengkapanType: 'warning',
    logbook: 'Sudah diisi',
    logbookTime: 'Disimpan 12.30 WIB',
    logbookContent:
      'Menyelesaikan struktur tabel laporan dan memperbaiki validasi filter periode pada halaman admin.',
    checkinDetail: {
      time: '08.12 WIB',
      photoLabel: 'DEMO · foto check-in',
      photoDesc: 'Ilustrasi, bukan bukti absensi nyata',
      coords: '-7.747033, 110.355398',
      radiusStatus: 'On-site · Dalam radius',
      radiusDesc: 'Jarak 42 m · Radius kantor 100 m',
    },
    checkoutDetail: null,
    checkoutStatusNote: 'Belum tercatat',
    checkoutStatusMessage:
      'Belum ada foto, waktu, atau koordinat check-out untuk hari ini.',
    detailSummary:
      'Check-in 08.12 WIB telah tercatat. Logbook disimpan pada 12.30 WIB.',
  },
  {
    id: 2,
    tanggal: '19 Okt 2026',
    rawDate: '2026-10-19',
    peserta: 'Salsa Maharani',
    checkin: '08.04 WIB',
    checkout: 'Tidak tercatat',
    kelengkapan: 'Check-out tidak tercatat',
    kelengkapanType: 'danger',
    logbook: 'Sudah diisi',
    logbookTime: 'Disimpan 16.45 WIB',
    logbookContent:
      'Implementasi responsivitas mobile pada navigasi header dan evaluasi user feedback form.',
    checkinDetail: {
      time: '08.04 WIB',
      photoLabel: 'DEMO · foto check-in',
      photoDesc: 'Ilustrasi, bukan bukti absensi nyata',
      coords: '-7.747033, 110.355398',
      radiusStatus: 'On-site · Dalam radius',
      radiusDesc: 'Jarak 38 m · Radius kantor 100 m',
    },
    checkoutDetail: null,
    checkoutStatusNote: 'Tidak tercatat',
    checkoutStatusMessage:
      'Peserta tidak melakukan check-out pada mesin/sistem hingga jam operasional berakhir.',
    detailSummary:
      'Check-in 08.04 WIB telah tercatat. Check-out otomatis ditandai tidak tercatat.',
  },
  {
    id: 3,
    tanggal: '18 Okt 2026',
    rawDate: '2026-10-18',
    peserta: 'Raka Aditya',
    checkin: '08.18 WIB',
    checkout: '17.06 WIB',
    kelengkapan: 'Lengkap',
    kelengkapanType: 'success',
    logbook: 'Sudah diisi',
    logbookTime: 'Disimpan 17.00 WIB',
    logbookContent:
      'Menyelesaikan integrasi API absensi dan penyesuaian styling badge sesuai token design system.',
    checkinDetail: {
      time: '08.18 WIB',
      photoLabel: 'DEMO · foto check-in',
      photoDesc: 'Ilustrasi, bukan bukti absensi nyata',
      coords: '-7.747033, 110.355398',
      radiusStatus: 'On-site · Dalam radius',
      radiusDesc: 'Jarak 42 m · Radius kantor 100 m',
    },
    checkoutDetail: {
      time: '17.05 WIB',
      photoLabel: 'DEMO · foto check-out',
      photoDesc: 'Ilustrasi, bukan bukti absensi nyata',
      coords: '-7.747033, 110.355398',
      radiusStatus: 'On-site · Dalam radius',
      radiusDesc: 'Jarak 42 m · Radius kantor 100 m',
    },
    checkoutStatusNote: null,
    checkoutStatusMessage: null,
    detailSummary: null,
  },
  {
    id: 4,
    tanggal: '18 Okt 2026',
    rawDate: '2026-10-18',
    peserta: 'Dimas Nugraha',
    checkin: '08.00 WIB',
    checkout: '17.02 WIB',
    kelengkapan: 'Lengkap',
    kelengkapanType: 'success',
    logbook: 'Sudah diisi',
    logbookTime: 'Disimpan 16.55 WIB',
    logbookContent:
      'Penyusunan dokumentasi testing dan validasi schema filter data absensi.',
    checkinDetail: {
      time: '08.00 WIB',
      photoLabel: 'DEMO · foto check-in',
      photoDesc: 'Ilustrasi, bukan bukti absensi nyata',
      coords: '-7.747033, 110.355398',
      radiusStatus: 'On-site · Dalam radius',
      radiusDesc: 'Jarak 25 m · Radius kantor 100 m',
    },
    checkoutDetail: {
      time: '17.02 WIB',
      photoLabel: 'DEMO · foto check-out',
      photoDesc: 'Ilustrasi, bukan bukti absensi nyata',
      coords: '-7.747033, 110.355398',
      radiusStatus: 'On-site · Dalam radius',
      radiusDesc: 'Jarak 25 m · Radius kantor 100 m',
    },
    checkoutStatusNote: null,
    checkoutStatusMessage: null,
    detailSummary: null,
  },
];

export const AdminAttendancePage = () => {
  const [selectedPeserta, setSelectedPeserta] = useState('Semua peserta');
  const [dariTanggal, setDariTanggal] = useState('');
  const [sampaiTanggal, setSampaiTanggal] = useState('');
  const [attendanceList, setAttendanceList] = useState(INITIAL_ATTENDANCE_DATA);
  const [activeModalItem, setActiveModalItem] = useState(null);

  const handleApplyFilter = () => {
    let filtered = [...INITIAL_ATTENDANCE_DATA];

    if (selectedPeserta !== 'Semua peserta') {
      filtered = filtered.filter((item) => item.peserta === selectedPeserta);
    }

    if (dariTanggal) {
      filtered = filtered.filter((item) => item.rawDate >= dariTanggal);
    }

    if (sampaiTanggal) {
      filtered = filtered.filter((item) => item.rawDate <= sampaiTanggal);
    }

    setAttendanceList(filtered);
  };

  const handleResetFilter = () => {
    setSelectedPeserta('Semua peserta');
    setDariTanggal('');
    setSampaiTanggal('');
    setAttendanceList(INITIAL_ATTENDANCE_DATA);
  };

  const getKelengkapanBadge = (type, label) => {
    if (type === 'success') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e7f5ec] text-[#176a43] border border-[#c6e9d4]">
          {label}
        </span>
      );
    }
    if (type === 'danger') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fef2f2] text-[#b91c1c] border border-rose-200">
          {label}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fef9c3] text-[#854d0e] border border-amber-200">
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight font-['Lexend']">
          Rekap Absensi
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Bukti foto, lokasi, dan logbook peserta.
        </p>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          {/* Peserta Dropdown */}
          <div className="w-full lg:w-48">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Peserta
            </label>
            <div className="relative">
              <select
                value={selectedPeserta}
                onChange={(e) => setSelectedPeserta(e.target.value)}
                className="w-full h-11 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] appearance-none cursor-pointer transition"
              >
                <option value="Semua peserta">Semua peserta</option>
                <option value="Raka Aditya">Raka Aditya</option>
                <option value="Salsa Maharani">Salsa Maharani</option>
                <option value="Dimas Nugraha">Dimas Nugraha</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Dari Tanggal */}
          <div className="w-full lg:w-44">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dari
            </label>
            <div className="relative">
              <input
                type="date"
                value={dariTanggal}
                onChange={(e) => setDariTanggal(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] transition"
              />
            </div>
          </div>

          {/* Sampai Tanggal */}
          <div className="w-full lg:w-44">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sampai
            </label>
            <div className="relative">
              <input
                type="date"
                value={sampaiTanggal}
                onChange={(e) => setSampaiTanggal(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] transition"
              />
            </div>
          </div>

          {/* Actions Button */}
          <div className="flex items-center gap-2 pt-2 lg:pt-0">
            <button
              type="button"
              onClick={handleApplyFilter}
              className="h-11 px-5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-sm font-semibold transition active:scale-95 shadow-2xs"
            >
              Terapkan Filter
            </button>
            {(selectedPeserta !== 'Semua peserta' || dariTanggal || sampaiTanggal) && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="h-11 px-3 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabel Rekap Absensi */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fbfcfb] border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Tanggal</th>
                <th className="py-3.5 px-5">Peserta</th>
                <th className="py-3.5 px-5">Check-in</th>
                <th className="py-3.5 px-5">Check-out</th>
                <th className="py-3.5 px-5">Kelengkapan</th>
                <th className="py-3.5 px-5">Logbook</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {attendanceList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-sm">
                    Tidak ada data absensi untuk filter yang dipilih.
                  </td>
                </tr>
              ) : (
                attendanceList.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-5 text-slate-700 whitespace-nowrap">
                      {row.tanggal}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900 whitespace-nowrap">
                      {row.peserta}
                    </td>
                    <td className="py-4 px-5 text-slate-700 whitespace-nowrap">
                      {row.checkin}
                    </td>
                    <td className="py-4 px-5 text-slate-700 whitespace-nowrap">
                      {row.checkout}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      {getKelengkapanBadge(row.kelengkapanType, row.kelengkapan)}
                    </td>
                    <td className="py-4 px-5 text-slate-700 whitespace-nowrap">
                      {row.logbook}
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setActiveModalItem(row)}
                        className="text-[#176a43] hover:text-[#0f462c] font-semibold text-sm transition hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Bukti Absensi (A-04 / Detail Bukti Absensi) */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-100">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 font-['Lexend']">
                  Detail Absensi
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {activeModalItem.peserta} · {activeModalItem.tanggal} · Hanya baca untuk Admin
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Status Badge */}
              <div>
                {getKelengkapanBadge(
                  activeModalItem.kelengkapanType,
                  activeModalItem.kelengkapan
                )}
              </div>

              {/* Grid 2 Kolom Check-in & Check-out */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kolom Check-in */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-slate-900 font-['Lexend']">
                    Check-in · {activeModalItem.checkinDetail.time}
                  </h3>

                  {/* Foto Box Check-in */}
                  <div className="h-44 bg-[#e8ecea] rounded-xl border border-slate-200 flex flex-col items-center justify-center p-4 text-center select-none">
                    <div className="w-16 h-16 flex flex-col items-center justify-center mb-1">
                      <div className="w-7 h-7 rounded-full bg-[#8fa99e]" />
                      <div className="w-14 h-7 mt-1 bg-[#8fa99e] rounded-t-full" />
                    </div>
                    <p className="text-xs font-semibold text-slate-600">
                      {activeModalItem.checkinDetail.photoLabel}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {activeModalItem.checkinDetail.photoDesc}
                    </p>
                  </div>

                  {/* Koordinat & Radius Check-in */}
                  <div>
                    <p className="text-xs text-slate-400">Koordinat contoh</p>
                    <p className="text-sm font-medium text-slate-800 font-mono mt-0.5">
                      {activeModalItem.checkinDetail.coords}
                    </p>
                  </div>

                  <div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e7f5ec] text-[#176a43] border border-[#c6e9d4]">
                      {activeModalItem.checkinDetail.radiusStatus}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      {activeModalItem.checkinDetail.radiusDesc}
                    </p>
                  </div>
                </div>

                {/* Kolom Check-out */}
                <div className="space-y-3">
                  {activeModalItem.checkoutDetail ? (
                    <>
                      <h3 className="text-base font-semibold text-slate-900 font-['Lexend']">
                        Check-out · {activeModalItem.checkoutDetail.time}
                      </h3>

                      {/* Foto Box Check-out */}
                      <div className="h-44 bg-[#e8ecea] rounded-xl border border-slate-200 flex flex-col items-center justify-center p-4 text-center select-none">
                        <div className="w-16 h-16 flex flex-col items-center justify-center mb-1">
                          <div className="w-7 h-7 rounded-full bg-[#8fa99e]" />
                          <div className="w-14 h-7 mt-1 bg-[#8fa99e] rounded-t-full" />
                        </div>
                        <p className="text-xs font-semibold text-slate-600">
                          {activeModalItem.checkoutDetail.photoLabel}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {activeModalItem.checkoutDetail.photoDesc}
                        </p>
                      </div>

                      {/* Koordinat & Radius Check-out */}
                      <div>
                        <p className="text-xs text-slate-400">Koordinat contoh</p>
                        <p className="text-sm font-medium text-slate-800 font-mono mt-0.5">
                          {activeModalItem.checkoutDetail.coords}
                        </p>
                      </div>

                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e7f5ec] text-[#176a43] border border-[#c6e9d4]">
                          {activeModalItem.checkoutDetail.radiusStatus}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          {activeModalItem.checkoutDetail.radiusDesc}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-3 h-full flex flex-col justify-start">
                      <h3 className="text-base font-semibold text-slate-900 font-['Lexend']">
                        Check-out
                      </h3>

                      {activeModalItem.kelengkapanType === 'danger' ? (
                        <div className="p-3.5 bg-[#fef2f2] rounded-lg border border-rose-200 space-y-1">
                          <p className="text-sm font-semibold text-[#b91c1c]">
                            {activeModalItem.checkoutStatusNote}
                          </p>
                          <p className="text-xs text-[#b91c1c]/90 leading-relaxed">
                            {activeModalItem.checkoutStatusMessage}
                          </p>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-[#fffbeb] rounded-lg border border-amber-200 space-y-1">
                          <p className="text-sm font-semibold text-[#b45309]">
                            {activeModalItem.checkoutStatusNote}
                          </p>
                          <p className="text-xs text-[#b45309]/90 leading-relaxed">
                            {activeModalItem.checkoutStatusMessage}
                          </p>
                        </div>
                      )}

                      {activeModalItem.detailSummary && (
                        <p className="text-xs text-slate-500 leading-relaxed pt-1">
                          {activeModalItem.detailSummary}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Logbook Terkait Box */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-base font-semibold text-slate-900 font-['Lexend']">
                  Logbook terkait
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {activeModalItem.logbookContent}
                </p>
                <p className="text-xs text-slate-400 font-medium pt-1">
                  {activeModalItem.logbookTime}
                </p>
              </div>

              {/* Disclaimer Demo */}
              <p className="text-xs text-slate-400">
                Demo · Foto dan koordinat contoh, bukan bukti absensi nyata.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-start bg-slate-50/50">
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-sm font-semibold transition active:scale-95 shadow-2xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

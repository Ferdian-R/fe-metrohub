import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  ChevronRight,
  X,
  Calendar,
} from 'lucide-react';

const INITIAL_LOGBOOK_DATA = [
  {
    id: 1,
    tanggal: '20 Okt 2026',
    tanggalLengkap: '20 Oktober 2026',
    rawMonth: '2026-10',
    peserta: 'Raka Aditya',
    savedStatus: 'Tersimpan · 12.30 WIB',
    isi: 'Menyelesaikan struktur tabel laporan dan memperbaiki validasi filter periode pada halaman admin.',
    absensi: {
      checkin: '08.12 WIB',
      checkout: 'Belum tercatat',
      keterangan: 'On-site · Selasa, 20 Oktober 2026',
    },
  },
  {
    id: 2,
    tanggal: '19 Okt 2026',
    tanggalLengkap: '19 Oktober 2026',
    rawMonth: '2026-10',
    peserta: 'Salsa Maharani',
    savedStatus: 'Tersimpan · 16.45 WIB',
    isi: 'Menyusun dokumentasi endpoint internal dan menguji contoh respons API untuk modul pengguna.',
    absensi: {
      checkin: '08.04 WIB',
      checkout: 'Tidak tercatat',
      keterangan: 'Remote · Senin, 19 Oktober 2026',
    },
  },
  {
    id: 3,
    tanggal: '18 Okt 2026',
    tanggalLengkap: '18 Oktober 2026',
    rawMonth: '2026-10',
    peserta: 'Raka Aditya',
    savedStatus: 'Tersimpan · 17.00 WIB',
    isi: 'Audit aksesibilitas formulir dan memperbaiki label kontrol yang belum terhubung.',
    absensi: {
      checkin: '08.18 WIB',
      checkout: '17.06 WIB',
      keterangan: 'On-site · Minggu, 18 Oktober 2026',
    },
  },
  {
    id: 4,
    tanggal: '18 Okt 2026',
    tanggalLengkap: '18 Oktober 2026',
    rawMonth: '2026-10',
    peserta: 'Dimas Nugraha',
    savedStatus: 'Tersimpan · 16.55 WIB',
    isi: 'Penyusunan dokumentasi testing dan validasi schema filter data absensi.',
    absensi: {
      checkin: '08.00 WIB',
      checkout: '17.02 WIB',
      keterangan: 'On-site · Minggu, 18 Oktober 2026',
    },
  },
];

export const AdminLogbookPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeserta, setSelectedPeserta] = useState('Semua peserta');
  const [selectedBulan, setSelectedBulan] = useState('Oktober 2026');
  const [activeModalItem, setActiveModalItem] = useState(null);

  // Filter list data
  const filteredList = INITIAL_LOGBOOK_DATA.filter((item) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      item.isi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.peserta.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPeserta =
      selectedPeserta === 'Semua peserta' || item.peserta === selectedPeserta;

    const matchesBulan =
      selectedBulan === 'Semua bulan' ||
      (selectedBulan === 'Oktober 2026' && item.rawMonth === '2026-10') ||
      (selectedBulan === 'September 2026' && item.rawMonth === '2026-09') ||
      (selectedBulan === 'Agustus 2026' && item.rawMonth === '2026-08');

    return matchesSearch && matchesPeserta && matchesBulan;
  });

  return (
    <div className="space-y-6">
      {/* Header Halaman Sesuai Figma */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight font-lexend">
          Logbook Peserta
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Catatan harian peserta dan absensi terkait.
        </p>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Input Cari Isi Logbook */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari isi logbook"
              className="w-full h-11 px-4 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] transition"
            />
          </div>

          {/* Dropdown Peserta */}
          <div className="w-full md:w-56 relative">
            <select
              value={selectedPeserta}
              onChange={(e) => setSelectedPeserta(e.target.value)}
              className="w-full h-11 pl-4 pr-9 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] appearance-none cursor-pointer transition"
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

          {/* Dropdown Bulan */}
          <div className="w-full md:w-52 relative">
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="w-full h-11 pl-4 pr-9 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] appearance-none cursor-pointer transition"
            >
              <option value="Oktober 2026">Oktober 2026</option>
              <option value="September 2026">September 2026</option>
              <option value="Agustus 2026">Agustus 2026</option>
              <option value="Semua bulan">Semua bulan</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* List Logbook Card Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Tidak ada catatan logbook yang sesuai dengan filter.
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className="p-5 md:p-6 flex flex-col sm:flex-row items-start gap-4 md:gap-8 hover:bg-slate-50/70 transition"
            >
              {/* Kolom Tanggal */}
              <div className="w-full sm:w-36 shrink-0 text-sm text-slate-700 font-normal">
                {item.tanggal}
              </div>

              {/* Kolom Isi Catatan & Aksi */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  {item.peserta}
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {item.isi}
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveModalItem(item)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#176a43] hover:text-[#0f462c] transition hover:underline cursor-pointer"
                  >
                    <span>Lihat absensi hari ini</span>
                    <span aria-hidden="true">&gt;</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Detail Logbook (A-05 / Detail Logbook) */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-100">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 font-lexend">
                  Detail Logbook
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {activeModalItem.peserta} · {activeModalItem.tanggalLengkap}
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
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Status Pill Tersimpan */}
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e7f5ec] text-[#176a43] border border-[#c6e9d4]">
                  {activeModalItem.savedStatus}
                </span>
              </div>

              {/* Card 1: Pekerjaan hari ini */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
                <h3 className="text-base font-semibold text-slate-900 font-lexend">
                  Pekerjaan hari ini
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {activeModalItem.isi}
                </p>
              </div>

              {/* Card 2: Absensi terkait */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-base font-semibold text-slate-900 font-lexend">
                  Absensi terkait
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Kolom Check-in */}
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Check-in</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {activeModalItem.absensi.checkin}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {activeModalItem.absensi.keterangan}
                    </p>
                  </div>

                  {/* Kolom Check-out */}
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Check-out</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {activeModalItem.absensi.checkout}
                    </p>
                  </div>
                </div>
              </div>

              {/* Note Informasi */}
              <p className="text-xs text-slate-400 pt-1">
                Hanya baca. Isi logbook dikelola peserta sebelum check-out.
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

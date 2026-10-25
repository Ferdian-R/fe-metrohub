import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import {
  CheckCircle2,
  AlertCircle,
  Lock,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const InternLogbookPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Mode Skenario / State Logbook (sesuai Figma M-03)
  // 'saved': Tersimpan 12.30 WIB (Desktop default di Image 1)
  // 'draft': Draf belum disimpan (08.12 WIB)
  // 'locked': Terkunci setelah check-out (17.05 WIB)
  // 'error_network': Simulasi gagal simpan (Koneksi terputus)
  const [logbookState, setLogbookState] = useState('saved');

  // Input state pekerjaan hari ini
  const [isiPekerjaan, setIsiPekerjaan] = useState(
    'Menyelesaikan struktur tabel laporan dan memperbaiki validasi filter periode pada halaman admin.'
  );

  const [validationError, setValidationError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedTime, setSavedTime] = useState('12.30 WIB');

  // Handler Perubahan Skenario
  const handleScenarioChange = (e) => {
    const val = e.target.value;
    setLogbookState(val);
    setValidationError('');

    if (val === 'draft') {
      setSavedTime('');
    } else if (val === 'saved') {
      setSavedTime('12.30 WIB');
    } else if (val === 'locked') {
      setSavedTime('12.30 WIB');
    }
  };

  // Handler Simpan Logbook dengan Validasi (MG04 & Validasi spasi)
  const handleSaveLogbook = () => {
    setValidationError('');

    // Validasi kosong atau hanya spasi (sesuai varian baris bawah Figma)
    if (!isiPekerjaan || isiPekerjaan.trim() === '') {
      setValidationError('Isi pekerjaan hari ini; spasi saja tidak dapat disimpan.');
      return;
    }

    // Jika skenario sedang dalam simulasi gagal simpan
    if (logbookState === 'error_network') {
      setIsSaving(true);
      setTimeout(() => {
        setIsSaving(false);
        showToast({
          title: 'Gagal menyimpan logbook',
          message: 'Koneksi terputus. Catatan Anda tetap aman di editor.',
          type: 'error',
        });
      }, 600);
      return;
    }

    // Simulasi penyimpanan berhasil
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setLogbookState('saved');
      setSavedTime('12.30 WIB');
      showToast({
        title: 'Logbook berhasil disimpan',
        message: 'Catatan pekerjaan hari ini telah tersimpan dan check-out terbuka.',
      });
    }, 500);
  };

  // Riwayat logbook 3 hari sebelumnya (sesuai Figma M-03 Image 1)
  const riwayatList = [
    {
      tanggal: '19 Okt 2026',
      catatan: 'Menyusun pengujian komponen filter dan memperbaiki tampilan mobile.',
    },
    {
      tanggal: '18 Okt 2026',
      catatan: 'Audit aksesibilitas formulir dan label kontrol.',
    },
    {
      tanggal: '17 Okt 2026',
      catatan: 'Melanjutkan integrasi data dummy untuk halaman laporan.',
    },
  ];

  const isLocked = logbookState === 'locked';

  return (
    <div className="space-y-6 w-full pb-12 font-sans">
      {/* Header Halaman & Dropdown Alat Demo Skenario */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight font-lexend">
            Logbook
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1 font-source-sans">
            Catatan pekerjaan pribadi selama masa magang.
          </p>
        </div>

        {/* Alat Demo Skenario M-03 */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <label className="text-xs font-medium text-slate-500 font-source-sans whitespace-nowrap">
            Alat demo skenario
          </label>
          <div className="relative">
            <select
              value={logbookState}
              onChange={handleScenarioChange}
              className="appearance-none bg-white border border-slate-300 hover:border-slate-400 text-xs font-semibold text-slate-800 py-2 pl-3.5 pr-8 rounded-xl shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#17362f] cursor-pointer"
            >
              <option value="saved">Tersimpan · 12.30 WIB (Normal)</option>
              <option value="draft">Draf belum disimpan (08.12 WIB)</option>
              <option value="locked">Terkunci setelah check-out (17.05 WIB)</option>
              <option value="error_network">Gagal simpan / koneksi terputus</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid Konten: Editor Logbook (Kiri 2 Kolom) & Riwayat + Status (Kanan 1 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Kolom Kiri: Form Editor Logbook */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-5">
          {/* Header Card Logbook */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-source-sans">
                HARI INI
              </p>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 font-lexend mt-0.5">
                Selasa, 20 Oktober 2026
              </h2>
            </div>

            {/* Badge Status Logbook */}
            <div>
              {logbookState === 'saved' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e7f5ec] text-[#176a43] border border-[#c6e9d4] font-source-sans">
                  {savedTime ? ('Tersimpan · ' + savedTime) : 'Tersimpan'}
                </span>
              )}
              {logbookState === 'draft' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fef9ee] text-[#b45309] border border-[#fde68a] font-source-sans">
                  Belum disimpan
                </span>
              )}
              {logbookState === 'locked' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 font-source-sans">
                  <Lock className="w-3 h-3" />
                  <span>Terkunci</span>
                </span>
              )}
              {logbookState === 'error_network' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] font-source-sans">
                  Gagal disimpan
                </span>
              )}
            </div>
          </div>

          {/* Form Textarea Pekerjaan Hari Ini */}
          <div className="space-y-1.5">
            <label
              htmlFor="logbook-input"
              className="block text-xs font-semibold text-slate-700 font-source-sans"
            >
              Pekerjaan hari ini
            </label>

            <textarea
              id="logbook-input"
              rows={5}
              readOnly={isLocked || isSaving}
              value={isiPekerjaan}
              onChange={(e) => {
                setIsiPekerjaan(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="Tuliskan ringkasan aktivitas, progres tugas, atau kendala pekerjaan hari ini..."
              className={
                'w-full p-4 rounded-xl text-sm leading-relaxed transition font-source-sans ' +
                (validationError
                  ? 'border border-rose-400 bg-rose-50/20 text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-400'
                  : isLocked
                  ? 'bg-slate-50 border border-slate-200 text-slate-700 cursor-not-allowed select-text'
                  : 'bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f]')
              }
            />

            {/* Pesan Validasi Error (Kosong / Hanya Spasi) */}
            {validationError ? (
              <p className="text-xs font-medium text-rose-600 font-source-sans pt-1">
                {validationError}
              </p>
            ) : (
              <p className="text-xs text-slate-500 font-source-sans pt-0.5">
                {isLocked
                  ? 'Disimpan 12.30 WIB.'
                  : logbookState === 'saved'
                  ? 'Disimpan 12.30 WIB. Masih dapat diubah sebelum check-out.'
                  : 'Perubahan belum disimpan. Catatan dapat diubah sebelum check-out.'}
              </p>
            )}
          </div>

          {/* Banner Informasi Sesuai State */}
          {renderStateBanner()}

          {/* Tombol Aksi di Bagian Bawah */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
            {/* Tombol Kembali ke Absensi */}
            <button
              type="button"
              onClick={() => navigate('/magang/absensi')}
              className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 active:scale-[0.99] text-slate-800 text-xs font-semibold rounded-lg shadow-2xs transition cursor-pointer text-center"
            >
              Kembali ke Absensi
            </button>

            {/* Tombol Simpan / Aksi Utama */}
            {!isLocked && (
              <>
                {logbookState === 'saved' ? (
                  <>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleSaveLogbook}
                      className="px-5 py-2.5 bg-[#4a7368] hover:bg-[#3b6157] active:scale-[0.99] text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer text-center"
                    >
                      {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/magang/absensi')}
                      className="px-5 py-2.5 bg-[#17362f] hover:bg-[#122b25] active:scale-[0.99] text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Lanjut Check-out</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : logbookState === 'error_network' ? (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveLogbook}
                    className="px-5 py-2.5 bg-[#17362f] hover:bg-[#122b25] active:scale-[0.99] text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer text-center"
                  >
                    {isSaving ? 'Menyimpan...' : 'Coba Simpan Lagi'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveLogbook}
                    className="px-5 py-2.5 bg-[#17362f] hover:bg-[#122b25] active:scale-[0.99] text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer text-center"
                  >
                    {isSaving ? 'Menyimpan...' : 'Simpan Logbook'}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Quick Switch Helper Bar */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 font-medium">Uji state cepat:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setLogbookState('draft');
                  setValidationError('');
                }}
                className={
                  'px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ' +
                  (logbookState === 'draft'
                    ? 'bg-[#17362f] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                }
              >
                Draf Belum Simpan
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogbookState('saved');
                  setValidationError('');
                }}
                className={
                  'px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ' +
                  (logbookState === 'saved'
                    ? 'bg-[#17362f] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                }
              >
                Tersimpan (Normal)
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogbookState('locked');
                  setValidationError('');
                }}
                className={
                  'px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ' +
                  (logbookState === 'locked'
                    ? 'bg-[#17362f] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                }
              >
                Terkunci (Check-out)
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsiPekerjaan('   ');
                  handleSaveLogbook();
                }}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
              >
                Tes Spasi Kosong
              </button>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Card Riwayat Terbaru (Figma M-03 Image 1) & Status Hari Ini */}
        <div className="space-y-6">
          {/* Card 1: Riwayat Terbaru */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-lexend">
                Riwayat terbaru
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {riwayatList.map((item, idx) => (
                <div key={idx} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                  <p className="text-xs font-bold text-slate-800 font-source-sans">
                    {item.tanggal}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed font-source-sans">
                    {item.catatan}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Status Hari Ini (Kompak) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-lexend">
                Status hari ini
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-source-sans">
                Selasa, 20 Oktober 2026
              </p>
            </div>

            <div className="space-y-3 text-xs font-source-sans">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Status kerja</span>
                <span className="font-semibold text-slate-800">On-site</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Check-in</span>
                <span className="font-bold text-slate-900">08.12 WIB</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Logbook</span>
                <span className="font-bold text-slate-900">
                  {isLocked
                    ? 'Tersimpan · 12.30 WIB'
                    : logbookState === 'saved'
                    ? 'Tersimpan · 12.30 WIB'
                    : 'Belum disimpan'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Check-out</span>
                <span className="font-semibold text-slate-800">
                  {isLocked ? '17.05 WIB' : 'Belum dilakukan'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-slate-400 text-[11px] font-source-sans">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Demo · data contoh</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper Banner Info berdasarkan State
  function renderStateBanner() {
    if (isSaving) {
      return (
        <div className="bg-[#edf6f1] border border-[#cde6d7] rounded-xl p-3.5 flex items-start gap-3">
          <div className="w-4 h-4 border-2 border-[#176a43] border-t-transparent rounded-full animate-spin shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#176a43] font-source-sans">
              Menyimpan logbook...
            </h4>
            <p className="text-[11px] text-[#176a43]/90 mt-0.5 font-source-sans">
              Tunggu sampai status penyimpanan muncul.
            </p>
          </div>
        </div>
      );
    }

    if (logbookState === 'error_network') {
      return (
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-3.5 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#b91c1c] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#b91c1c] font-source-sans">
              Logbook belum tersimpan
            </h4>
            <p className="text-[11px] text-[#991b1b] mt-0.5 font-source-sans">
              Koneksi terputus. Catatan Anda tetap ada di editor.
            </p>
          </div>
        </div>
      );
    }

    if (logbookState === 'draft') {
      return (
        <div className="bg-[#edf6f1] border border-[#cde6d7] rounded-xl p-3.5 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-[#176a43] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#176a43] font-source-sans">
              Check-in tercatat · 08.12 WIB
            </h4>
            <p className="text-[11px] text-[#176a43]/90 mt-0.5 font-source-sans">
              Simpan logbook ini untuk membuka langkah check-out.
            </p>
          </div>
        </div>
      );
    }

    if (logbookState === 'saved') {
      return (
        <div className="bg-[#edf6f1] border border-[#cde6d7] rounded-xl p-3.5 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-[#176a43] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#176a43] font-source-sans">
              Check-out kini tersedia
            </h4>
            <p className="text-[11px] text-[#176a43]/90 mt-0.5 font-source-sans">
              Ambil foto dan lokasi baru di halaman Absensi.
            </p>
          </div>
        </div>
      );
    }

    if (logbookState === 'locked') {
      return (
        <div className="bg-[#f0f4f8] border border-slate-200 rounded-xl p-3.5 flex items-start gap-3">
          <Lock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-800 font-source-sans">
              Logbook tidak dapat diubah
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5 font-source-sans">
              Check-out telah tercatat pada 17.05 WIB.
            </p>
          </div>
        </div>
      );
    }

    return null;
  }
};

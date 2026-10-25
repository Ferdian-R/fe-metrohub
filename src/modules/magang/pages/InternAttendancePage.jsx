import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import {
  Camera,
  RefreshCw,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  User,
  ArrowRight,
} from 'lucide-react';

export const InternAttendancePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [selectedScenario, setSelectedScenario] = useState('normal');
  const [flowState, setFlowState] = useState('checkout_ready');
  const [hasPhoto, setHasPhoto] = useState(true);
  const [hasLocation, setHasLocation] = useState(true);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);

  const [attendanceRecord, setAttendanceRecord] = useState({
    statusKerja: 'On-site',
    checkInTime: '08.12 WIB',
    logbookTime: 'Tersimpan · 12.30 WIB',
    checkOutTime: 'Belum dilakukan',
  });

  const handleScenarioChange = (e) => {
    const val = e.target.value;
    setSelectedScenario(val);
    if (val === 'normal') {
      setHasPhoto(true);
      setHasLocation(true);
      setAttendanceRecord((prev) => ({ ...prev, statusKerja: 'On-site' }));
    } else if (val === 'incomplete') {
      setHasPhoto(false);
      setHasLocation(false);
    } else if (val === 'out_of_radius') {
      setHasPhoto(true);
      setHasLocation(true);
      setAttendanceRecord((prev) => ({ ...prev, statusKerja: 'On-site' }));
    } else if (val === 'remote_ready') {
      setHasPhoto(true);
      setHasLocation(true);
      setAttendanceRecord((prev) => ({ ...prev, statusKerja: 'Remote' }));
    } else if (val === 'remote_no_coords') {
      setHasPhoto(true);
      setHasLocation(false);
      setAttendanceRecord((prev) => ({ ...prev, statusKerja: 'Remote' }));
    }
  };

  const handleTakePhoto = () => {
    setIsCapturingPhoto(true);
    setTimeout(() => {
      setHasPhoto(true);
      setIsCapturingPhoto(false);
      showToast({
        title: 'Foto wajah siap',
        message: 'Foto demo berhasil diambil dan tervalidasi.',
      });
    }, 500);
  };

  const handleRefreshLocation = () => {
    setIsRefreshingLocation(true);
    setTimeout(() => {
      setHasLocation(true);
      setIsRefreshingLocation(false);
      showToast({
        title: 'Lokasi diperbarui',
        message: 'Koordinat GPS tervalidasi di dalam radius kantor.',
      });
    }, 500);
  };

  const handleSaveCheckIn = () => {
    setAttendanceRecord((prev) => ({
      ...prev,
      checkInTime: '08.12 WIB',
    }));
    setFlowState('checkin_done');
    showToast({
      title: 'Check-in berhasil disimpan',
      message: 'Kehadiran 08.12 WIB tercatat. Lanjutkan mengisi logbook hari ini.',
    });
  };

  const handleSaveCheckOut = () => {
    setAttendanceRecord((prev) => ({
      ...prev,
      checkOutTime: '17.05 WIB',
    }));
    setFlowState('completed');
    showToast({
      title: 'Check-out berhasil disimpan',
      message: 'Absensi hari ini lengkap dan telah tervalidasi.',
    });
  };

  const handleResetFlow = (targetState) => {
    if (targetState === 'checkin_ready') {
      setFlowState('checkin_ready');
      setAttendanceRecord({
        statusKerja: 'On-site',
        checkInTime: 'Belum dilakukan',
        logbookTime: 'Belum disimpan',
        checkOutTime: 'Belum dilakukan',
      });
    } else if (targetState === 'checkout_ready') {
      setFlowState('checkout_ready');
      setAttendanceRecord({
        statusKerja: 'On-site',
        checkInTime: '08.12 WIB',
        logbookTime: 'Tersimpan · 12.30 WIB',
        checkOutTime: 'Belum dilakukan',
      });
    }
    setHasPhoto(true);
    setHasLocation(true);
    setSelectedScenario('normal');
  };

  const isBlockedByScenario =
    selectedScenario === 'incomplete' ||
    selectedScenario === 'out_of_radius' ||
    selectedScenario === 'camera_denied' ||
    selectedScenario === 'location_denied' ||
    selectedScenario === 'location_timeout' ||
    selectedScenario === 'remote_no_coords' ||
    selectedScenario === 'internship_ended' ||
    selectedScenario === 'storage_unknown' ||
    !hasPhoto ||
    !hasLocation;

  return (
    <div className="space-y-6 w-full pb-12 font-sans">
      {/* Header Halaman & Dropdown Alat Demo Skenario */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight font-lexend">
            Absensi
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1 font-source-sans">
            Selasa, 20 Oktober 2026 · {attendanceRecord.statusKerja}
          </p>
        </div>

        {/* Alat Demo Skenario (Sesuai Figma M-02 Top-Right) */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <label className="text-xs font-medium text-slate-500 font-source-sans whitespace-nowrap">
            Alat demo skenario
          </label>
          <div className="relative">
            <select
              value={selectedScenario}
              onChange={handleScenarioChange}
              className="appearance-none bg-white border border-slate-300 hover:border-slate-400 text-xs font-semibold text-slate-800 py-2 pl-3.5 pr-8 rounded-xl shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#17362f] cursor-pointer"
            >
              <option value="normal">Dalam radius · normal</option>
              <option value="incomplete">Foto dan lokasi belum lengkap</option>
              <option value="out_of_radius">Di luar radius kantor (245 m)</option>
              <option value="camera_denied">Izin kamera ditolak</option>
              <option value="location_denied">Izin lokasi ditolak</option>
              <option value="location_timeout">Lokasi belum ditemukan</option>
              <option value="remote_no_coords">Remote · koordinat tetap diperlukan</option>
              <option value="remote_ready">Remote · koordinat siap</option>
              <option value="internship_ended">Masa magang telah berakhir</option>
              <option value="storage_unknown">Status penyimpanan belum diketahui</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid Utama: Form Absensi (Kiri 2 Kolom) & Status Hari Ini (Kanan 1 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Kolom Kiri: Form Kartu Absensi */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-6">
          {/* Stepper Indikator Langkah */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-source-sans">
              <span
                className={`font-semibold ${
                  flowState === 'checkin_ready'
                    ? 'text-[#17362f]'
                    : 'text-slate-400'
                }`}
              >
                1 · Check-in
              </span>
              <span className="text-slate-300">/</span>
              <span
                className={`font-semibold ${
                  flowState === 'checkin_done'
                    ? 'text-[#17362f]'
                    : 'text-slate-400'
                }`}
              >
                2 · Logbook
              </span>
              <span className="text-slate-300">/</span>
              <span
                className={`font-semibold ${
                  flowState === 'checkout_ready' || flowState === 'completed'
                    ? 'text-[#17362f]'
                    : 'text-slate-400'
                }`}
              >
                3 · Check-out
              </span>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 font-source-sans">
              Hari ini
            </span>
          </div>

          {/* STATE 1: CHECK-IN SIAP */}
          {flowState === 'checkin_ready' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h2 className="text-xl font-bold text-slate-900 font-lexend">
                Check-in
              </h2>

              {/* Area Preview Foto */}
              <div className="bg-[#f0f3f1] border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center min-h-[220px] text-center">
                {hasPhoto ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 shadow-inner">
                      <User className="w-9 h-9" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 tracking-wide font-source-sans mt-2">
                      DEMO · foto baru 08.11
                    </p>
                    <p className="text-[11px] text-slate-500 font-source-sans">
                      Ilustrasi, bukan bukti absensi nyata
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2 text-slate-400">
                    <Camera className="w-12 h-12 stroke-[1.5]" />
                    <p className="text-xs font-bold text-slate-700 font-source-sans mt-2">
                      Ambil foto wajah untuk check-in
                    </p>
                    <p className="text-[11px] text-slate-400 font-source-sans">
                      Simulasi kamera
                    </p>
                  </div>
                )}
              </div>

              {/* Tombol Aksi Kamera & Lokasi */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleTakePhoto}
                    disabled={isCapturingPhoto}
                    className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-600" />
                    <span>{hasPhoto ? 'Ambil Ulang Foto' : 'Ambil Foto'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRefreshLocation}
                    disabled={isRefreshingLocation}
                    className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshingLocation ? 'animate-spin' : ''}`} />
                    <span>Perbarui Lokasi</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 font-source-sans">
                  Ambil foto wajah langsung dari kamera, lalu perbarui lokasi.
                </p>
              </div>

              {/* Box Kondisi Lokasi & Pesan Skenario */}
              {renderScenarioFeedback()}

              {/* Tombol Simpan Check-in */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isBlockedByScenario}
                  onClick={handleSaveCheckIn}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition shadow-sm ${
                    isBlockedByScenario
                      ? 'bg-[#c1d1cb] text-white cursor-not-allowed'
                      : 'bg-[#17362f] hover:bg-[#122b25] active:scale-[0.99] text-white cursor-pointer'
                  }`}
                >
                  Simpan Check-in
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: CHECK-IN BERHASIL */}
          {flowState === 'checkin_done' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-xl font-bold text-slate-900 font-lexend">
                Check-in berhasil
              </h2>

              <div className="bg-[#edf6f1] border border-[#cde6d7] rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#176a43] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#176a43] font-source-sans">
                    Check-in tersimpan · 08.12 WIB
                  </h4>
                  <p className="text-xs text-[#176a43]/90 mt-0.5 font-source-sans">
                    Selanjutnya, isi logbook pekerjaan hari ini.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-base font-bold text-slate-900 font-lexend">
                  Lengkapi logbook sebelum pulang
                </h3>
                <p className="text-xs text-slate-600 font-source-sans leading-relaxed">
                  Check-out belum tersedia karena logbook hari ini belum disimpan.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/magang/logbook')}
                    className="px-5 py-2.5 bg-[#17362f] hover:bg-[#122b25] active:scale-[0.99] text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <span>Isi Logbook</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled
                    className="px-5 py-2.5 bg-[#e2ebe6] text-slate-400 text-xs font-semibold rounded-lg cursor-not-allowed"
                  >
                    Simpan Check-out
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 font-source-sans pt-1">
                  Simpan logbook untuk membuka check-out. Foto dan lokasi baru tetap diperlukan.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-source-sans">
                  Demo shortcut: simulasikan logbook selesai disimpan
                </span>
                <button
                  type="button"
                  onClick={() => setFlowState('checkout_ready')}
                  className="text-xs font-semibold text-[#17362f] hover:underline cursor-pointer"
                >
                  Lanjut ke Check-out &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: CHECK-OUT SIAP */}
          {flowState === 'checkout_ready' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h2 className="text-xl font-bold text-slate-900 font-lexend">
                Check-out
              </h2>

              <div className="bg-[#f0f3f1] border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center min-h-[220px] text-center">
                {hasPhoto ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 shadow-inner">
                      <User className="w-9 h-9" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 tracking-wide font-source-sans mt-2">
                      DEMO · foto baru 17.04
                    </p>
                    <p className="text-[11px] text-slate-500 font-source-sans">
                      Ilustrasi, bukan bukti absensi nyata
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2 text-slate-400">
                    <Camera className="w-12 h-12 stroke-[1.5]" />
                    <p className="text-xs font-bold text-slate-700 font-source-sans mt-2">
                      Ambil foto baru untuk check-out
                    </p>
                    <p className="text-[11px] text-slate-400 font-source-sans">
                      Simulasi kamera
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleTakePhoto}
                    disabled={isCapturingPhoto}
                    className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-600" />
                    <span>{hasPhoto ? 'Ambil Ulang Foto' : 'Ambil Foto'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRefreshLocation}
                    disabled={isRefreshingLocation}
                    className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshingLocation ? 'animate-spin' : ''}`} />
                    <span>Perbarui Lokasi</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 font-source-sans">
                  Gunakan foto dan lokasi baru; bukti check-in tidak dipakai ulang.
                </p>
              </div>

              {renderScenarioFeedback()}

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isBlockedByScenario}
                  onClick={handleSaveCheckOut}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition shadow-sm ${
                    isBlockedByScenario
                      ? 'bg-[#c1d1cb] text-white cursor-not-allowed'
                      : 'bg-[#17362f] hover:bg-[#122b25] active:scale-[0.99] text-white cursor-pointer'
                  }`}
                >
                  Simpan Check-out
                </button>
                <p className="text-[11px] text-center text-slate-500 mt-2 font-source-sans">
                  Ambil foto dan lokasi baru untuk check-out.
                </p>
              </div>
            </div>
          )}

          {/* STATE 4: SELESAI */}
          {flowState === 'completed' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-xl font-bold text-slate-900 font-lexend">
                Absensi hari ini lengkap
              </h2>

              <div className="bg-[#edf6f1] border border-[#cde6d7] rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#176a43] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#176a43] font-source-sans">
                    Check-out tersimpan · 17.05 WIB
                  </h4>
                  <p className="text-xs text-[#176a43]/90 mt-0.5 font-source-sans">
                    Seluruh langkah hari ini telah selesai.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="text-lg font-bold text-slate-900 font-lexend">
                  Terima kasih, Raka
                </h3>
                <p className="text-xs text-slate-700 font-source-sans leading-relaxed">
                  Check-in 08.12 WIB, logbook 12.30 WIB, dan check-out 17.05 WIB telah tercatat.
                </p>
                <p className="text-xs text-slate-500 font-source-sans leading-relaxed">
                  Absensi tidak dapat dikirim ulang. Logbook hari ini kini hanya dapat dilihat.
                </p>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => navigate('/magang/logbook')}
                    className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs transition active:scale-95 cursor-pointer"
                  >
                    Lihat Logbook
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Shortcut Bar Cepat */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 font-medium">Uji alur cepat:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleResetFlow('checkin_ready')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                  flowState === 'checkin_ready'
                    ? 'bg-[#17362f] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                1. Check-in Siap
              </button>
              <button
                type="button"
                onClick={() => setFlowState('checkin_done')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                  flowState === 'checkin_done'
                    ? 'bg-[#17362f] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                2. Menunggu Logbook
              </button>
              <button
                type="button"
                onClick={() => handleResetFlow('checkout_ready')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                  flowState === 'checkout_ready'
                    ? 'bg-[#17362f] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                3. Check-out Siap
              </button>
              <button
                type="button"
                onClick={() => setFlowState('completed')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                  flowState === 'completed'
                    ? 'bg-[#17362f] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                4. Lengkap
              </button>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Card Status Hari Ini */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 font-lexend">
              Status hari ini
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-source-sans">
              Selasa, 20 Oktober 2026
            </p>
          </div>

          <div className="space-y-4 text-xs font-source-sans">
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Status kerja</span>
              <span className="font-semibold text-slate-800">
                {attendanceRecord.statusKerja}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Check-in</span>
              <span
                className={`font-semibold ${
                  attendanceRecord.checkInTime !== 'Belum dilakukan'
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {attendanceRecord.checkInTime}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Logbook</span>
              <span
                className={`font-semibold ${
                  attendanceRecord.logbookTime !== 'Belum disimpan'
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {attendanceRecord.logbookTime}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Check-out</span>
              <span
                className={`font-semibold ${
                  attendanceRecord.checkOutTime !== 'Belum dilakukan'
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {attendanceRecord.checkOutTime}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-start gap-2 text-slate-500 text-[11px] leading-relaxed font-source-sans">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>Demo foto dan lokasi; bukan bukti absensi nyata.</span>
            </div>
            <p className="text-[10px] text-slate-400 font-source-sans pl-6">
              Demo · data contoh
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  function renderScenarioFeedback() {
    if (selectedScenario === 'incomplete') {
      return (
        <div className="bg-[#fef9ee] border border-[#fde68a] rounded-xl p-3.5 space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#b45309] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#b45309] font-source-sans">
                Foto dan lokasi belum lengkap
              </p>
              <p className="text-[11px] text-[#92400e] leading-relaxed font-source-sans mt-0.5">
                Ambil foto wajah dan perbarui lokasi sebelum menyimpan absensi.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pl-6 pt-1">
            <button
              type="button"
              onClick={handleTakePhoto}
              className="px-3 py-1 bg-white border border-[#fed7aa] text-xs font-semibold text-[#b45309] rounded-lg shadow-2xs hover:bg-amber-50 cursor-pointer"
            >
              Ambil Foto
            </button>
            <button
              type="button"
              onClick={handleRefreshLocation}
              className="px-3 py-1 bg-white border border-[#fed7aa] text-xs font-semibold text-[#b45309] rounded-lg shadow-2xs hover:bg-amber-50 cursor-pointer"
            >
              Perbarui Lokasi
            </button>
          </div>
        </div>
      );
    }

    if (selectedScenario === 'out_of_radius') {
      return (
        <div className="bg-[#fef9ee] border border-[#fde68a] rounded-xl p-3.5 space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#b45309] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#b45309] font-source-sans">
                Di luar radius kantor
              </p>
              <p className="text-[11px] text-[#92400e] leading-relaxed font-source-sans mt-0.5">
                On-site · Jarak 245 m dari kantor, di luar radius 100 m. Mendekatlah lalu perbarui lokasi.
              </p>
            </div>
          </div>
          <div className="pl-6 pt-1">
            <button
              type="button"
              onClick={() => setSelectedScenario('normal')}
              className="px-3 py-1 bg-white border border-[#fed7aa] text-xs font-semibold text-[#b45309] rounded-lg shadow-2xs hover:bg-amber-50 cursor-pointer"
            >
              Coba Lagi Lokasi
            </button>
          </div>
        </div>
      );
    }

    if (selectedScenario === 'camera_denied') {
      return (
        <div className="bg-[#fef9ee] border border-[#fde68a] rounded-xl p-3.5 space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#b45309] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#b45309] font-source-sans">
                Izin kamera ditolak
              </p>
              <p className="text-[11px] text-[#92400e] leading-relaxed font-source-sans mt-0.5">
                Izinkan kamera melalui pengaturan browser, lalu coba kembali. Foto harus diambil langsung.
              </p>
            </div>
          </div>
          <div className="pl-6 pt-1">
            <button
              type="button"
              onClick={() => setSelectedScenario('normal')}
              className="px-3 py-1 bg-white border border-[#fed7aa] text-xs font-semibold text-[#b45309] rounded-lg shadow-2xs hover:bg-amber-50 cursor-pointer"
            >
              Coba Lagi Kamera
            </button>
          </div>
        </div>
      );
    }

    if (selectedScenario === 'location_denied') {
      return (
        <div className="bg-[#fef9ee] border border-[#fde68a] rounded-xl p-3.5 space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#b45309] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#b45309] font-source-sans">
                Izin lokasi ditolak
              </p>
              <p className="text-[11px] text-[#92400e] leading-relaxed font-source-sans mt-0.5">
                Aktifkan izin lokasi browser agar koordinat dapat digunakan untuk absensi.
              </p>
            </div>
          </div>
          <div className="pl-6 pt-1">
            <button
              type="button"
              onClick={() => setSelectedScenario('normal')}
              className="px-3 py-1 bg-white border border-[#fed7aa] text-xs font-semibold text-[#b45309] rounded-lg shadow-2xs hover:bg-amber-50 cursor-pointer"
            >
              Coba Lagi Lokasi
            </button>
          </div>
        </div>
      );
    }

    if (selectedScenario === 'location_timeout') {
      return (
        <div className="bg-[#fef9ee] border border-[#fde68a] rounded-xl p-3.5 space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#b45309] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#b45309] font-source-sans">
                Lokasi belum ditemukan
              </p>
              <p className="text-[11px] text-[#92400e] leading-relaxed font-source-sans mt-0.5">
                Pencarian lokasi melewati batas waktu. Periksa koneksi lalu perbarui lokasi.
              </p>
            </div>
          </div>
          <div className="pl-6 pt-1">
            <button
              type="button"
              onClick={() => setSelectedScenario('normal')}
              className="px-3 py-1 bg-white border border-[#fed7aa] text-xs font-semibold text-[#b45309] rounded-lg shadow-2xs hover:bg-amber-50 cursor-pointer"
            >
              Coba Lagi Lokasi
            </button>
          </div>
        </div>
      );
    }

    if (selectedScenario === 'remote_no_coords') {
      return (
        <div className="bg-[#fef9ee] border border-[#fde68a] rounded-xl p-3.5 space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#b45309] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#b45309] font-source-sans">
                Remote · koordinat tetap diperlukan
              </p>
              <p className="text-[11px] text-[#92400e] leading-relaxed font-source-sans mt-0.5">
                Salsa Maharani - Foto demo siap. Radius kantor tidak membatasi absensi Remote, tetapi lokasi belum tersedia.
              </p>
            </div>
          </div>
          <div className="pl-6 pt-1">
            <button
              type="button"
              onClick={() => setSelectedScenario('remote_ready')}
              className="px-3 py-1 bg-white border border-[#fed7aa] text-xs font-semibold text-[#b45309] rounded-lg shadow-2xs hover:bg-amber-50 cursor-pointer"
            >
              Perbarui Lokasi
            </button>
          </div>
        </div>
      );
    }

    if (selectedScenario === 'remote_ready') {
      return (
        <div className="bg-[#e7f5ec] border border-[#c6e9d4] rounded-xl p-3.5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#d2edd9] rounded-lg text-[#176a43] shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#176a43] font-source-sans">
                Lokasi Remote tersedia
              </h4>
              <p className="text-[11px] text-[#176a43]/90 mt-0.5 font-source-sans">
                -7.747033, 110.355398 · 245 m dari kantor. Tidak ada penolakan radius untuk Remote.
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-white/80 border border-[#b2dfc4] text-[#176a43] rounded text-[11px] font-bold font-source-sans shrink-0">
            Lokasi valid
          </span>
        </div>
      );
    }

    if (selectedScenario === 'internship_ended') {
      return (
        <div className="bg-[#fef9ee] border border-[#fde68a] rounded-xl p-3.5 space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#b45309] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#b45309] font-source-sans">
                Masa magang telah berakhir
              </p>
              <p className="text-[11px] text-[#92400e] leading-relaxed font-source-sans mt-0.5">
                Dimas Saputra - Periode berakhir 30 September 2026. Absensi reguler tidak tersedia; riwayat tetap tersimpan.
              </p>
            </div>
          </div>
          <div className="pl-6 pt-1">
            <button
              type="button"
              onClick={() => navigate('/magang/dashboard')}
              className="px-3 py-1 bg-white border border-[#fed7aa] text-xs font-semibold text-[#b45309] rounded-lg shadow-2xs hover:bg-amber-50 cursor-pointer"
            >
              Lihat Riwayat
            </button>
          </div>
        </div>
      );
    }

    if (selectedScenario === 'storage_unknown') {
      return (
        <div className="bg-[#fef9ee] border border-[#fde68a] rounded-xl p-3.5 space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#b45309] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#b45309] font-source-sans">
                Status penyimpanan belum diketahui
              </p>
              <p className="text-[11px] text-[#92400e] leading-relaxed font-source-sans mt-0.5">
                Jangan kirim ulang untuk menghindari absensi ganda. Periksa apakah check-in sudah tercatat.
              </p>
            </div>
          </div>
          <div className="pl-6 pt-1">
            <button
              type="button"
              onClick={() => setSelectedScenario('normal')}
              className="px-3 py-1 bg-white border border-[#fed7aa] text-xs font-semibold text-[#b45309] rounded-lg shadow-2xs hover:bg-amber-50 cursor-pointer"
            >
              Muat status terbaru
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-[#e7f5ec] border border-[#c6e9d4] rounded-xl p-3.5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#d2edd9] rounded-lg text-[#176a43] shrink-0 mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#176a43] font-source-sans">
              Berada dalam radius kantor
            </h4>
            <p className="text-[11px] text-[#176a43]/90 mt-0.5 font-source-sans">
              Jarak 42 m · Radius kantor 100 m {flowState === 'checkout_ready' ? '· Lokasi baru 17.04 WIB' : '· Lokasi baru 08.11 WIB'}
            </p>
            <p className="text-[10px] text-[#176a43]/70 font-mono mt-1">
              Koordinat contoh: -7.747033, 110.355398
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 bg-white/80 border border-[#b2dfc4] text-[#176a43] rounded text-[11px] font-bold font-source-sans shrink-0">
          Lokasi valid
        </span>
      </div>
    );
  }
};

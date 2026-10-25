import React, { useState, useEffect } from 'react';
import { CameraCapture } from '../components/CameraCapture';
import { useGeolocation } from '../hooks/useGeolocation';
import { magangService } from '../services/magangService';
import {
  CalendarCheck2,
  MapPin,
  Clock,
  BookOpen,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
} from 'lucide-react';

export const AttendancePage = () => {
  const { latitude, longitude, accuracy, error: geoError, refetchLocation } = useGeolocation();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Status Hari Ini
  const [attendance, setAttendance] = useState(null);
  const [logbook, setLogbook] = useState(null);
  const [logbookContent, setLogbookContent] = useState('');
  const [logbookSaved, setLogbookSaved] = useState(false);

  // Form check-in / check-out
  const [photoBlob, setPhotoBlob] = useState(null);
  const [activeStep, setActiveStep] = useState(1); // 1: Checkin, 2: Logbook, 3: Checkout

  const loadTodayData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // 1. Ambil absensi hari ini
      const attRes = await magangService.getTodayAttendance().catch(() => ({ data: null }));
      setAttendance(attRes.data);

      // 2. Ambil logbook hari ini
      const lbRes = await magangService.getTodayLogbook().catch(() => ({ data: null }));
      if (lbRes.data) {
        setLogbook(lbRes.data);
        setLogbookContent(lbRes.data.isi || '');
        setLogbookSaved(true);
      }

      // Tentukan step aktif
      if (!attRes.data?.jam_checkin) {
        setActiveStep(1); // Belum checkin
      } else if (!lbRes.data?.isi) {
        setActiveStep(2); // Sudah checkin, perlu isi logbook
      } else if (!attRes.data?.jam_checkout) {
        setActiveStep(3); // Sudah logbook, siap checkout
      } else {
        setActiveStep(4); // Sudah selesai semua hari ini
      }
    } catch (err) {
      setErrorMessage(err.message || 'Gagal memuat status hari ini.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayData();
  }, []);

  const handleCheckin = async () => {
    if (!photoBlob) {
      setErrorMessage('Harap ambil foto wajah terlebih dahulu.');
      return;
    }
    if (!latitude || !longitude) {
      setErrorMessage('Koordinat lokasi tidak ditemukan. Pastikan izin GPS aktif.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('foto', photoBlob, 'checkin.jpg');
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);

      await magangService.checkIn(formData);
      setSuccessMessage('Check-in berhasil disimpan!');
      setPhotoBlob(null);
      await loadTodayData();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal melakukan check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveLogbook = async () => {
    if (!logbookContent.trim()) {
      setErrorMessage('Isi logbook kegiatan harian tidak boleh kosong.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await magangService.saveTodayLogbook(logbookContent.trim());
      setSuccessMessage('Logbook kegiatan berhasil disimpan!');
      setLogbookSaved(true);
      await loadTodayData();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menyimpan logbook.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    if (!photoBlob) {
      setErrorMessage('Harap ambil foto wajah saat check-out.');
      return;
    }
    if (!latitude || !longitude) {
      setErrorMessage('Koordinat lokasi tidak ditemukan.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('foto', photoBlob, 'checkout.jpg');
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);

      await magangService.checkOut(formData);
      setSuccessMessage('Check-out berhasil! Presensi hari ini telah lengkap.');
      setPhotoBlob(null);
      await loadTodayData();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal melakukan check-out.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Presensi & Logbook Harian</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Selesaikan 3 alur harian: Check-in pagi, pengisian logbook kegiatan, dan Check-out di akhir jam kerja.
        </p>
      </div>

      {/* Notifikasi feedback */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* GPS Status Card */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5 text-xs text-slate-600">
          <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
          {latitude && longitude ? (
            <span>
              Koordinat GPS: <strong>{latitude.toFixed(6)}, {longitude.toFixed(6)}</strong> (Akurasi: ±{Math.round(accuracy || 0)}m)
            </span>
          ) : geoError ? (
            <span className="text-rose-500 font-medium">{geoError}</span>
          ) : (
            <span>Mendeteksi koordinat lokasi Anda...</span>
          )}
        </div>
        <button
          type="button"
          onClick={refetchLocation}
          className="text-xs text-indigo-600 font-semibold hover:underline"
        >
          Perbarui GPS
        </button>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Step 1 Checkin */}
        <div
          className={`p-4 rounded-2xl border transition ${
            attendance?.jam_checkin
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
              : activeStep === 1
              ? 'bg-indigo-50/60 border-indigo-200 text-indigo-900 ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200 text-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Langkah 1</span>
            {attendance?.jam_checkin ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <Clock className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <h3 className="font-semibold text-sm">Check-in Masuk</h3>
          <p className="text-xs mt-1">
            {attendance?.jam_checkin
              ? `Tercatat pada: ${attendance.jam_checkin}`
              : 'Ambil foto wajah dan lokasi GPS'}
          </p>
        </div>

        {/* Step 2 Logbook */}
        <div
          className={`p-4 rounded-2xl border transition ${
            logbookSaved
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
              : activeStep === 2
              ? 'bg-indigo-50/60 border-indigo-200 text-indigo-900 ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Langkah 2</span>
            {logbookSaved ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : !attendance?.jam_checkin ? (
              <Lock className="w-4 h-4 text-slate-300" />
            ) : (
              <BookOpen className="w-4 h-4 text-indigo-500" />
            )}
          </div>
          <h3 className="font-semibold text-sm">Isi Logbook Harian</h3>
          <p className="text-xs mt-1">
            {logbookSaved ? 'Logbook tersimpan' : 'Wajib diisi sebelum check-out terbuka'}
          </p>
        </div>

        {/* Step 3 Checkout */}
        <div
          className={`p-4 rounded-2xl border transition ${
            attendance?.jam_checkout
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
              : activeStep === 3
              ? 'bg-indigo-50/60 border-indigo-200 text-indigo-900 ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Langkah 3</span>
            {attendance?.jam_checkout ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : !logbookSaved ? (
              <Lock className="w-4 h-4 text-slate-300" />
            ) : (
              <LogOut className="w-4 h-4 text-indigo-500" />
            )}
          </div>
          <h3 className="font-semibold text-sm">Check-out Selesai</h3>
          <p className="text-xs mt-1">
            {attendance?.jam_checkout
              ? `Tercatat pada: ${attendance.jam_checkout}`
              : 'Foto wajah dan lokasi akhir hari'}
          </p>
        </div>
      </div>

      {/* Form Area Berdasarkan Step Aktif */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        {/* Step 1: Form Check-in */}
        {activeStep === 1 && (
          <div className="space-y-4 max-w-lg mx-auto text-center">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-50 text-indigo-600 mb-1">
              <CalendarCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Ambil Foto Check-in Pagi</h3>
            <p className="text-xs text-slate-500">
              Sesuai aturan (BR-03), foto wajah wajib diambil secara langsung dari kamera perangkat Anda.
            </p>

            <CameraCapture onPhotoCaptured={(blob) => setPhotoBlob(blob)} />

            <button
              type="button"
              onClick={handleCheckin}
              disabled={!photoBlob || submitting || !latitude}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition"
            >
              {submitting ? 'Menyimpan Check-in...' : 'Simpan Presensi Check-in'}
            </button>
          </div>
        )}

        {/* Step 2: Form Logbook */}
        {activeStep === 2 && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Catatan Logbook Kegiatan Hari Ini</h3>
                <p className="text-xs text-slate-500">
                  Tuliskan aktivitas dan pekerjaan yang Anda selesaikan hari ini (MG-04).
                </p>
              </div>
            </div>

            <textarea
              rows={6}
              value={logbookContent}
              onChange={(e) => setLogbookContent(e.target.value)}
              placeholder="Contoh: Hari ini mengerjakan antarmuka modul magang pada halaman absensi dan mengintegrasikan Geolocation API..."
              className="w-full p-4 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveLogbook}
                disabled={submitting || !logbookContent.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium text-xs rounded-xl shadow-sm flex items-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                {submitting ? 'Menyimpan...' : 'Simpan Logbook Hari Ini'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Form Check-out */}
        {activeStep === 3 && (
          <div className="space-y-4 max-w-lg mx-auto text-center">
            <div className="inline-flex p-3 rounded-2xl bg-amber-50 text-amber-600 mb-1">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Ambil Foto Check-out Sore</h3>
            <p className="text-xs text-slate-500">
              Logbook Anda sudah tercatat. Silakan ambil foto wajah dan kirimkan lokasi check-out untuk menutup presensi hari ini.
            </p>

            <CameraCapture onPhotoCaptured={(blob) => setPhotoBlob(blob)} />

            <button
              type="button"
              onClick={handleCheckout}
              disabled={!photoBlob || submitting || !latitude}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-semibold text-sm rounded-xl shadow-md shadow-amber-600/20 transition"
            >
              {submitting ? 'Menyimpan Check-out...' : 'Simpan Presensi Check-out'}
            </button>
          </div>
        )}

        {/* Step 4: Selesai Hari Ini */}
        {activeStep === 4 && (
          <div className="text-center py-8 space-y-3 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Presensi Hari Ini Telah Lengkap!</h3>
            <p className="text-xs text-slate-500">
              Check-in ({attendance?.jam_checkin}), logbook harian, dan Check-out ({attendance?.jam_checkout}) Anda telah sukses tercatat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

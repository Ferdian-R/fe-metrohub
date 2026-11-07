import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import {
  Camera,
  RefreshCw,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { magangService } from '../services/magangService';

// NF-07: foto dikompres di browser, maksimal 500 KB per foto
const MAX_PHOTO_BYTES = 500 * 1024;
const MAX_PHOTO_SIDE = 1024;

const compressToJpeg = async (source, srcW, srcH) => {
  const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(srcW, srcH));
  let w = Math.round(srcW * scale);
  let h = Math.round(srcH * scale);
  const canvas = document.createElement('canvas');
  const toBlob = (q) => new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', q));

  for (let attempt = 0; attempt < 6; attempt++) {
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(source, 0, 0, w, h);
    for (const q of [0.8, 0.65, 0.5, 0.4]) {
      const blob = await toBlob(q);
      if (blob && blob.size <= MAX_PHOTO_BYTES) return blob;
    }
    w = Math.round(w * 0.75);
    h = Math.round(h * 0.75);
  }
  return null;
};

export const InternAttendancePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Status API Hari Ini
  const [todayData, setTodayData] = useState(null);

  // Media & Lokasi States
  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [coords, setCoords] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Video / Kamera streaming state
  const videoRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);

  const fetchTodayStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await magangService.getTodayAttendance();
      setTodayData(res?.data || null);
    } catch (err) {
      console.error('Failed to load today attendance:', err);
      setError(err?.message || 'Gagal memuat status kehadiran hari ini');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayStatus();
  }, [fetchTodayStatus]);

  // Cleanup camera stream
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Request GPS Location
  const requestCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation tidak didukung pada browser ini.');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLocationLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocationError('Gagal mendeteksi lokasi GPS. Pastikan izin lokasi aktif.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  useEffect(() => {
    requestCurrentLocation();
  }, [requestCurrentLocation]);

  // Start Camera Stream
  // BR-03: foto wajib diambil langsung dari kamera; tidak ada jalur unggah dari galeri/file.
  const handleStartCamera = async () => {
    setCameraError(null);
    try {
      stopCameraStream();
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('MediaDevices API tidak tersedia');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Webcam stream failed:', err);
      const denied = err?.name === 'NotAllowedError' || err?.name === 'SecurityError';
      setCameraError(
        denied
          ? 'Akses kamera ditolak. Izinkan akses kamera di pengaturan browser, lalu coba lagi.'
          : 'Kamera tidak dapat dibuka. Pastikan perangkat memiliki kamera dan halaman dibuka melalui HTTPS.'
      );
    }
  };

  // Capture Photo from Video Canvas
  const handleCaptureFromVideo = async () => {
    const video = videoRef.current;
    if (!video) return;
    const blob = await compressToJpeg(video, video.videoWidth || 640, video.videoHeight || 480);
    if (!blob) {
      showToast({ title: 'Foto gagal diproses', message: 'Silakan ambil ulang foto.', type: 'error' });
      return;
    }
    setPhotoBlob(blob);
    setPhotoPreview(URL.createObjectURL(blob));
    stopCameraStream();
    showToast({
      title: 'Foto wajah siap',
      message: 'Foto berhasil diambil dan siap dikirim.',
    });
  };

  // Submit Check-in or Check-out
  const handleSendAttendance = async (actionType) => {
    if (!photoBlob) {
      showToast({
        title: 'Foto wajah diperlukan',
        message: 'Silakan ambil foto wajah terlebih dahulu.',
      });
      return;
    }

    if (!coords) {
      showToast({
        title: 'Lokasi GPS diperlukan',
        message: 'Aktifkan izin lokasi browser untuk memverifikasi posisi Anda.',
      });
      requestCurrentLocation();
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('foto', photoBlob, 'foto.jpg');
      formData.append('latitude', coords.latitude);
      formData.append('longitude', coords.longitude);

      if (actionType === 'checkin') {
        await magangService.checkIn(formData);
        showToast({
          title: 'Check-in berhasil',
          message: 'Kehadiran Anda telah tercatat. Silakan melanjutkan isi logbook hari ini.',
        });
      } else {
        await magangService.checkOut(formData);
        showToast({
          title: 'Check-out berhasil',
          message: 'Absensi hari ini telah lengkap.',
        });
      }

      setPhotoBlob(null);
      setPhotoPreview(null);
      await fetchTodayStatus();
    } catch (err) {
      console.error('Attendance submit error:', err);
      showToast({
        title: 'Gagal mengirim absensi',
        message: err?.message || 'Terjadi kesalahan sistem',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateLong = () => {
    const d = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
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

  const statusKerja = todayData?.status_kerja === 'REMOTE' ? 'Remote' : 'On-site';
  const checkinTime = formatTimeWIB(todayData?.absensi?.jam_checkin);
  const checkoutTime = formatTimeWIB(todayData?.absensi?.jam_checkout);

  return (
    <div className="space-y-6 w-full pb-12 font-sans">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight font-lexend">
          Absensi
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          {formatDateLong()} · {statusKerja}
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
            onClick={fetchTodayStatus}
            className="px-3 py-1 bg-white border border-rose-300 rounded text-xs font-semibold"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Masa Magang Berakhir / Belum Mulai Banner */}
      {todayData && todayData.dalam_masa_magang === false && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs md:text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
          <span>
            Masa magang Anda belum dimulai atau sudah berakhir. Anda tidak dapat melakukan check-in / check-out untuk hari ini.
          </span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#17362f] mb-3" />
          <p className="text-sm">Memeriksa status kehadiran hari ini...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Kolom Kiri: Form Kartu Absensi */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-6">
            {/* Header Status Alur */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-[#17362f] tracking-wide uppercase">
                {!todayData?.sudah_checkin
                  ? 'Langkah 1: Check-in Harian'
                  : !todayData?.sudah_checkout
                  ? 'Langkah 3: Check-out Harian'
                  : 'Absensi Hari Ini Lengkap'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                todayData?.sudah_checkout
                  ? 'bg-[#e7f5ec] text-[#206941]'
                  : todayData?.sudah_checkin
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {todayData?.sudah_checkout ? 'Selesai' : todayData?.sudah_checkin ? 'Check-in Tercatat' : 'Belum Check-in'}
              </span>
            </div>

            {/* Input Foto Wajah */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Foto Wajah Terkini (Maks. 500 KB)
                </label>
                {photoBlob && (
                  <span className="text-[11px] text-[#206941] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Foto Siap
                  </span>
                )}
              </div>

              {/* Area Preview Foto / Webcam */}
              <div className="w-full h-64 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl overflow-hidden flex flex-col items-center justify-center relative">
                {isCameraActive ? (
                  <div className="w-full h-full relative bg-black flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 inset-x-0 flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleCaptureFromVideo}
                        className="px-5 py-2 bg-[#17362f] text-white rounded-full text-xs font-semibold shadow-lg hover:bg-[#122b25] flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Ambil Foto</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCameraStream}
                        className="px-4 py-2 bg-slate-800 text-white rounded-full text-xs font-semibold shadow-lg hover:bg-slate-700"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : photoPreview ? (
                  <div className="w-full h-full relative group">
                    <img
                      src={photoPreview}
                      alt="Preview Foto Absensi"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleStartCamera}
                        className="px-3.5 py-1.5 bg-white/95 text-slate-800 rounded-lg text-xs font-semibold shadow flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Foto Ulang
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        Ambil foto wajah menggunakan kamera
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Pastikan pencahayaan cukup dan wajah terlihat jelas
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleStartCamera}
                        className="px-4 py-2 bg-[#17362f] hover:bg-[#122b25] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-2 transition"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Buka Kamera</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {cameraError && (
                <p className="text-[11px] text-rose-600 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
                  <span>{cameraError}</span>
                </p>
              )}
            </div>

            {/* Input Lokasi GPS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Koordinat Lokasi GPS
                </label>
                <button
                  type="button"
                  onClick={requestCurrentLocation}
                  disabled={locationLoading}
                  className="text-xs font-semibold text-[#17362f] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${locationLoading ? 'animate-spin' : ''}`} />
                  <span>Perbarui Lokasi</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                    <MapPin className="w-4 h-4 text-[#17362f]" />
                  </div>
                  <div>
                    {coords ? (
                      <>
                        <p className="font-mono text-xs font-semibold text-slate-800">
                          {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Akurasi GPS: &plusmn;{Math.round(coords.accuracy || 10)} meter
                        </p>
                      </>
                    ) : locationLoading ? (
                      <p className="text-xs text-slate-400">Mendeteksi koordinat GPS...</p>
                    ) : (
                      <p className="text-xs text-rose-600">{locationError || 'Lokasi belum terdeteksi'}</p>
                    )}
                  </div>
                </div>

                {coords && (
                  <span className="text-[11px] font-semibold text-[#206941] bg-[#e7f5ec] px-2.5 py-0.5 rounded-full">
                    GPS Aktif
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              {!todayData?.sudah_checkin ? (
                <button
                  type="button"
                  disabled={submitting || !photoBlob || !todayData?.bisa_checkin}
                  onClick={() => handleSendAttendance('checkin')}
                  className="w-full sm:w-auto px-6 py-3 bg-[#17362f] hover:bg-[#122b25] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs md:text-sm font-semibold rounded-lg shadow-xs transition flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Kirim Check-in Hari Ini</span>
                </button>
              ) : !todayData?.sudah_checkout ? (
                <div className="w-full flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    disabled={submitting || !photoBlob || !todayData?.bisa_checkout}
                    onClick={() => handleSendAttendance('checkout')}
                    className="w-full sm:w-auto px-6 py-3 bg-[#17362f] hover:bg-[#122b25] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs md:text-sm font-semibold rounded-lg shadow-xs transition flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Kirim Check-out Hari Ini</span>
                  </button>

                  {!todayData?.logbook_tersimpan && (
                    <button
                      type="button"
                      onClick={() => navigate('/magang/logbook')}
                      className="text-xs font-semibold text-[#17362f] hover:underline flex items-center gap-1"
                    >
                      <span>Isi logbook terlebih dahulu</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-[#e7f5ec] text-[#206941] rounded-lg text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Anda sudah menyelesaikan seluruh tahapan presensi hari ini.</span>
                </div>
              )}
            </div>

            {/* MG-03: tombol simpan baru aktif setelah foto diambil */}
            {!photoBlob && !todayData?.sudah_checkout && todayData?.dalam_masa_magang !== false && (
              <p className="text-[11px] text-slate-500 -mt-3">
                Tombol kirim aktif setelah foto wajah diambil dari kamera.
              </p>
            )}
          </div>

          {/* Kolom Kanan: Rincian Status Hari Ini */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-7 shadow-2xs space-y-6">
            <h3 className="text-base font-semibold text-slate-900 font-lexend">
              Status Presensi Hari Ini
            </h3>

            <div className="space-y-4">
              {/* Check-in info */}
              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Check-in</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {checkinTime ? `Pukul ${checkinTime}` : 'Belum dilakukan'}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  todayData?.sudah_checkin ? 'bg-[#e7f5ec] text-[#206941]' : 'bg-slate-200 text-slate-600'
                }`}>
                  {todayData?.sudah_checkin ? 'Tercatat' : 'Belum'}
                </span>
              </div>

              {/* Logbook info */}
              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Logbook Harian</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {todayData?.logbook_tersimpan ? 'Catatan tersimpan' : 'Belum diisi'}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  todayData?.logbook_tersimpan ? 'bg-[#e7f5ec] text-[#206941]' : 'bg-slate-200 text-slate-600'
                }`}>
                  {todayData?.logbook_tersimpan ? 'Tersimpan' : 'Belum'}
                </span>
              </div>

              {/* Check-out info */}
              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Check-out</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {checkoutTime ? `Pukul ${checkoutTime}` : 'Belum dilakukan'}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  todayData?.sudah_checkout ? 'bg-[#e7f5ec] text-[#206941]' : 'bg-slate-200 text-slate-600'
                }`}>
                  {todayData?.sudah_checkout ? 'Tercatat' : 'Belum'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#eef6f2] border border-[#d2e7dc] text-xs text-[#20493e]">
              <p className="font-bold text-[#17362f]">Ketentuan Presensi</p>
              <p className="text-[11px] text-[#3d6559] mt-1 leading-relaxed">
                Urutan wajib harian: Check-in &rarr; Pengisian Logbook &rarr; Check-out. Peserta On-site wajib berada dalam radius kantor.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternAttendancePage;

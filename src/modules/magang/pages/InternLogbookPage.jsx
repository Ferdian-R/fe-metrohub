import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import {
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { magangService } from '../services/magangService';

export const InternLogbookPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Status Kehadiran Hari Ini
  const [todayAttendance, setTodayAttendance] = useState(null);

  // Form Logbook Hari Ini
  const [isiPekerjaan, setIsiPekerjaan] = useState('');
  const [savedTime, setSavedTime] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Riwayat Logbook
  const [riwayatList, setRiwayatList] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [attRes, logbookTodayRes, historyRes] = await Promise.allSettled([
        magangService.getTodayAttendance(),
        magangService.getTodayLogbook(),
        magangService.getMyLogbooks(),
      ]);

      if (attRes.status === 'fulfilled') {
        setTodayAttendance(attRes.value?.data || null);
      }
      if (logbookTodayRes.status === 'fulfilled' && logbookTodayRes.value?.data) {
        const lb = logbookTodayRes.value.data;
        setIsiPekerjaan(lb.isi || '');
        if (lb.updated_at) {
          const d = new Date(lb.updated_at);
          setSavedTime(
            d.toLocaleTimeString('id-ID', {
              timeZone: 'Asia/Jakarta',
              hour: '2-digit',
              minute: '2-digit',
            }) + ' WIB'
          );
        }
      }
      if (historyRes.status === 'fulfilled') {
        setRiwayatList(historyRes.value?.data || []);
      }
    } catch (err) {
      console.error('Failed to load logbook data:', err);
      setError(err?.message || 'Gagal memuat data logbook');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler Simpan Logbook
  const handleSaveLogbook = async () => {
    setValidationError('');

    if (!isiPekerjaan || isiPekerjaan.trim() === '') {
      setValidationError('Isi pekerjaan hari ini; spasi saja tidak dapat disimpan.');
      return;
    }

    try {
      setIsSaving(true);
      await magangService.saveTodayLogbook(isiPekerjaan.trim());

      const now = new Date();
      setSavedTime(
        now.toLocaleTimeString('id-ID', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
        }) + ' WIB'
      );

      showToast({
        title: 'Logbook berhasil disimpan',
        message: 'Catatan pekerjaan hari ini telah tersimpan.',
      });

      await fetchData();
    } catch (err) {
      console.error('Failed to save logbook:', err);
      showToast({
        title: 'Gagal menyimpan logbook',
        message: err?.message || 'Terjadi kesalahan sistem saat menyimpan logbook.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateToID = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const isCheckedIn = Boolean(todayAttendance?.sudah_checkin);
  const isCheckedOut = Boolean(todayAttendance?.sudah_checkout);
  const isLocked = !isCheckedIn || isCheckedOut;

  return (
    <div className="space-y-6 w-full pb-12 font-sans">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight font-lexend">
          Logbook
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Catatan pekerjaan pribadi selama masa magang.
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
            onClick={fetchData}
            className="px-3 py-1 bg-white border border-rose-300 rounded text-xs font-semibold"
          >
            Coba lagi
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#17362f] mb-3" />
          <p className="text-sm">Memuat catatan logbook...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Editor Logbook (Kiri 2 Kolom) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-[#17362f] tracking-wide uppercase">
                Catatan Hari Ini
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                isCheckedOut
                  ? 'bg-slate-100 text-slate-600'
                  : savedTime
                  ? 'bg-[#e7f5ec] text-[#206941]'
                  : 'bg-amber-50 text-amber-700'
              }`}>
                {isCheckedOut
                  ? 'Terkunci (Sudah Check-out)'
                  : savedTime
                  ? `Tersimpan · ${savedTime}`
                  : 'Belum disimpan'}
              </span>
            </div>

            {/* Warning jika belum check-in */}
            {!isCheckedIn && (
              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
                <span>Lakukan check-in terlebih dahulu sebelum dapat mengisi logbook hari ini.</span>
                <button
                  type="button"
                  onClick={() => navigate('/magang/absensi')}
                  className="font-bold underline hover:text-amber-900 ml-2"
                >
                  Ke Absensi
                </button>
              </div>
            )}

            {/* Warning jika sudah check-out */}
            {isCheckedOut && (
              <div className="p-3.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Logbook terkunci dan tidak dapat diubah setelah melakukan check-out.</span>
              </div>
            )}

            {/* Textarea Pekerjaan */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Pekerjaan yang Diselesaikan Hari Ini
              </label>
              <textarea
                rows={6}
                disabled={isLocked}
                value={isiPekerjaan}
                onChange={(e) => {
                  setIsiPekerjaan(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="Rincikan modul, fitur, atau riset yang Anda kerjakan hari ini..."
                className={`w-full p-3.5 rounded-lg border text-xs md:text-sm text-slate-900 focus:outline-none transition resize-none ${
                  isLocked ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'bg-white'
                } ${
                  validationError
                    ? 'border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f]'
                }`}
              />
              {validationError && (
                <p className="text-[11px] text-rose-600 mt-1">{validationError}</p>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                disabled={isLocked || isSaving}
                onClick={handleSaveLogbook}
                className="px-6 py-2.5 bg-[#17362f] hover:bg-[#122b25] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs md:text-sm font-semibold rounded-lg shadow-xs transition flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Simpan Catatan</span>
              </button>

              {savedTime && !isCheckedOut && (
                <button
                  type="button"
                  onClick={() => navigate('/magang/absensi')}
                  className="text-xs font-semibold text-[#17362f] hover:underline flex items-center gap-1"
                >
                  <span>Lanjut ke Check-out</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Riwayat Logbook */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-7 shadow-2xs space-y-5">
            <h3 className="text-base font-semibold text-slate-900 font-lexend">
              Riwayat Logbook
            </h3>

            {riwayatList.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Belum ada riwayat logbook tersimpan.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {riwayatList.map((item) => (
                  <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">
                      {formatDateToID(item.tanggal)}
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                      {item.isi}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InternLogbookPage;

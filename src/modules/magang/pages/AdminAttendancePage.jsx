import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  X,
  Loader2,
  AlertCircle,
  PencilLine,
} from 'lucide-react';
import { magangService } from '../services/magangService';
import { useToast } from '../../../context/ToastContext';

// Rekap BE mengirim nama di `nama_anak_magang` (MG-09)
const getInternName = (item) =>
  item?.nama_anak_magang || item?.intern?.user?.nama || `Peserta #${item?.intern_id}`;

// ISO datetime → "HH:mm" dalam WIB untuk <input type="time">
const toTimeInputWIB = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

// Tanggal absensi (YYYY-MM-DD) + jam WIB → ISO dengan offset +07:00
const toIsoWIB = (tanggal, time) => `${tanggal}T${time}:00+07:00`;

const EMPTY_KOREKSI = { jam_checkin: '', jam_checkout: '', keterangan: '' };

export const AdminAttendancePage = () => {
  const { showToast } = useToast();
  const [attendances, setAttendances] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPesertaId, setSelectedPesertaId] = useState('all');
  const [dariTanggal, setDariTanggal] = useState('');
  const [sampaiTanggal, setSampaiTanggal] = useState('');
  const [activeModalItem, setActiveModalItem] = useState(null);

  // MG-10: koreksi absensi
  const [koreksiItem, setKoreksiItem] = useState(null);
  const [koreksiForm, setKoreksiForm] = useState(EMPTY_KOREKSI);
  const [koreksiError, setKoreksiError] = useState(null);
  const [koreksiSubmitting, setKoreksiSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedPesertaId !== 'all') params.intern_id = selectedPesertaId;
      if (dariTanggal) params.dari = dariTanggal;
      if (sampaiTanggal) params.sampai = sampaiTanggal;

      const [attRes, internsRes] = await Promise.all([
        magangService.getAllAttendances(params),
        magangService.getAllInterns(),
      ]);

      setAttendances(attRes?.data || []);
      setInterns(internsRes?.data || []);
    } catch (err) {
      console.error('Failed to load attendances / interns:', err);
      setError(err?.message || 'Gagal memuat data rekap absensi');
    } finally {
      setLoading(false);
    }
  }, [selectedPesertaId, dariTanggal, sampaiTanggal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleResetFilter = () => {
    setSelectedPesertaId('all');
    setDariTanggal('');
    setSampaiTanggal('');
  };

  const openKoreksi = (item) => {
    setActiveModalItem(null);
    setKoreksiItem(item);
    setKoreksiError(null);
    setKoreksiForm({
      jam_checkin: toTimeInputWIB(item.jam_checkin),
      jam_checkout: toTimeInputWIB(item.jam_checkout),
      keterangan: '',
    });
  };

  const closeKoreksi = () => {
    if (koreksiSubmitting) return;
    setKoreksiItem(null);
    setKoreksiForm(EMPTY_KOREKSI);
    setKoreksiError(null);
  };

  const handleSubmitKoreksi = async (e) => {
    e.preventDefault();
    const item = koreksiItem;
    const keterangan = koreksiForm.keterangan.trim();

    if (!koreksiForm.jam_checkin) {
      setKoreksiError('Jam check-in wajib diisi.');
      return;
    }
    if (koreksiForm.jam_checkout && koreksiForm.jam_checkout < koreksiForm.jam_checkin) {
      setKoreksiError('Jam check-out tidak boleh sebelum jam check-in.');
      return;
    }
    if (!keterangan) {
      setKoreksiError('Keterangan koreksi wajib diisi.');
      return;
    }

    // Kirim hanya jam yang berubah agar detik pada data asli tidak ikut terhapus
    const payload = { keterangan_koreksi: keterangan };
    if (koreksiForm.jam_checkin !== toTimeInputWIB(item.jam_checkin)) {
      payload.jam_checkin = toIsoWIB(item.tanggal, koreksiForm.jam_checkin);
    }
    const checkoutAsli = toTimeInputWIB(item.jam_checkout);
    if (koreksiForm.jam_checkout !== checkoutAsli) {
      payload.jam_checkout = koreksiForm.jam_checkout
        ? toIsoWIB(item.tanggal, koreksiForm.jam_checkout)
        : null;
    }

    try {
      setKoreksiSubmitting(true);
      setKoreksiError(null);
      await magangService.correctAttendance(item.id, payload);
      showToast({
        title: 'Absensi berhasil dikoreksi',
        message: `Data ${getInternName(item)} tanggal ${formatDateToID(item.tanggal)} telah diperbarui.`,
      });
      setKoreksiItem(null);
      setKoreksiForm(EMPTY_KOREKSI);
      await fetchData();
    } catch (err) {
      setKoreksiError(err?.details?.[0]?.message || err?.message || 'Gagal menyimpan koreksi absensi');
    } finally {
      setKoreksiSubmitting(false);
    }
  };

  const formatDateToID = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTimeWIB = (timeStr) => {
    if (!timeStr) return '-';
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      return date.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB';
    } catch {
      return timeStr;
    }
  };

  const getKelengkapanBadge = (att) => {
    if (att.jam_checkin && att.jam_checkout) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e7f5ec] text-[#176a43] border border-[#c6e9d4]">
          Lengkap
        </span>
      );
    }
    if (att.checkout_terlambat) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fef2f2] text-[#b91c1c] border border-rose-200">
          Check-out tidak tercatat
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fef9c3] text-[#854d0e] border border-amber-200">
        Belum lengkap
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight font-lexend">
          Rekap Absensi
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Bukti foto, lokasi, dan logbook peserta.
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

      {/* Filter Card */}
      <form onSubmit={handleApplyFilter} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          {/* Peserta Dropdown */}
          <div className="w-full lg:w-56">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Peserta
            </label>
            <div className="relative">
              <select
                value={selectedPesertaId}
                onChange={(e) => setSelectedPesertaId(e.target.value)}
                className="w-full h-10 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs md:text-sm text-slate-800 font-medium focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] appearance-none cursor-pointer transition"
              >
                <option value="all">Semua peserta</option>
                {interns.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nama}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Dari Tanggal */}
          <div className="w-full lg:w-44">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dari tanggal
            </label>
            <input
              type="date"
              value={dariTanggal}
              onChange={(e) => setDariTanggal(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs md:text-sm text-slate-800 focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] transition"
            />
          </div>

          {/* Sampai Tanggal */}
          <div className="w-full lg:w-44">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sampai tanggal
            </label>
            <input
              type="date"
              value={sampaiTanggal}
              onChange={(e) => setSampaiTanggal(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs md:text-sm text-slate-800 focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] transition"
            />
          </div>

          {/* Actions Button */}
          <div className="flex items-center gap-2 pt-2 lg:pt-0">
            <button
              type="submit"
              className="h-10 px-4 bg-[#17362f] hover:bg-[#122b25] text-white text-xs md:text-sm font-semibold rounded-lg shadow-xs transition"
            >
              Terapkan Filter
            </button>
            <button
              type="button"
              onClick={handleResetFilter}
              className="h-10 px-3 text-slate-500 hover:text-slate-800 text-xs md:text-sm font-medium transition"
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      {/* Tabel Rekap Absensi */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-4 font-semibold">Tanggal</th>
                <th className="px-5 py-4 font-semibold">Peserta</th>
                <th className="px-5 py-4 font-semibold">Check-in</th>
                <th className="px-5 py-4 font-semibold">Check-out</th>
                <th className="px-5 py-4 font-semibold">Kelengkapan</th>
                <th className="px-5 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#17362f] mb-2" />
                    <span>Memuat rekap absensi...</span>
                  </td>
                </tr>
              ) : attendances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    Belum ada data absensi yang sesuai filter.
                  </td>
                </tr>
              ) : (
                attendances.map((item) => {
                  const internName = getInternName(item);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-4 font-medium text-slate-900 whitespace-nowrap">
                        {formatDateToID(item.tanggal)}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800">
                        {internName}
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {formatTimeWIB(item.jam_checkin)}
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {item.jam_checkout ? formatTimeWIB(item.jam_checkout) : (
                          <span className="text-slate-400">Belum check-out</span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {getKelengkapanBadge(item)}
                          {item.keterangan_koreksi && (
                            <span
                              title={`Dikoreksi oleh ${item.nama_admin_koreksi || 'admin'}: ${item.keterangan_koreksi}`}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200"
                            >
                              Dikoreksi
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setActiveModalItem(item)}
                            className="text-xs text-[#17362f] hover:underline font-semibold"
                          >
                            Lihat Bukti
                          </button>
                          <button
                            type="button"
                            onClick={() => openKoreksi(item)}
                            className="text-xs text-slate-600 hover:text-[#17362f] hover:underline font-semibold"
                          >
                            Koreksi
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Menampilkan {attendances.length} catatan absensi</span>
          <span>1 dari 1 halaman</span>
        </div>
      </div>

      {/* MODAL LIHAT BUKTI ABSENSI */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <div>
                <span className="text-[10px] font-bold text-[#17362f] uppercase tracking-wider">
                  Bukti Kehadiran
                </span>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {getInternName(activeModalItem)} — {formatDateToID(activeModalItem.tanggal)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Check-in Detail */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wide text-slate-800">
                    Check-in ({formatTimeWIB(activeModalItem.jam_checkin)})
                  </h4>
                  {activeModalItem.jarak_checkin_meter != null && (
                    <span className="text-[11px] font-medium text-[#17362f] bg-[#eef5f2] px-2 py-0.5 rounded">
                      {activeModalItem.jarak_checkin_meter} m dari kantor
                    </span>
                  )}
                </div>

                {activeModalItem.foto_checkin ? (
                  <div className="w-full max-w-xs mx-auto overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    <img
                      src={`/api/v1/magang/attendances/photos/${activeModalItem.foto_checkin}`}
                      alt="Foto Check-in"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x300?text=Foto+Absensi';
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-2">
                    Foto check-in tidak tersedia
                  </p>
                )}

                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Koordinat:</span>
                  <span className="font-mono text-slate-700">
                    {activeModalItem.lat_checkin ?? '-'}, {activeModalItem.lng_checkin ?? '-'}
                  </span>
                </div>
              </div>

              {/* Check-out Detail */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wide text-slate-800">
                    Check-out ({activeModalItem.jam_checkout ? formatTimeWIB(activeModalItem.jam_checkout) : 'Belum dilakukan'})
                  </h4>
                  {activeModalItem.jarak_checkout_meter != null && (
                    <span className="text-[11px] font-medium text-[#17362f] bg-[#eef5f2] px-2 py-0.5 rounded">
                      {activeModalItem.jarak_checkout_meter} m dari kantor
                    </span>
                  )}
                </div>

                {activeModalItem.foto_checkout ? (
                  <div className="w-full max-w-xs mx-auto overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    <img
                      src={`/api/v1/magang/attendances/photos/${activeModalItem.foto_checkout}`}
                      alt="Foto Check-out"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x300?text=Foto+Absensi';
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-2">
                    {activeModalItem.checkout_terlambat
                      ? 'Peserta tidak melakukan check-out hingga akhir hari operasional.'
                      : 'Belum ada foto dan data check-out.'}
                  </p>
                )}

                {activeModalItem.jam_checkout && activeModalItem.lat_checkout != null && (
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Koordinat:</span>
                    <span className="font-mono text-slate-700">
                      {activeModalItem.lat_checkout ?? '-'}, {activeModalItem.lng_checkout ?? '-'}
                    </span>
                  </div>
                )}
              </div>

              {/* MG-10: riwayat koreksi */}
              {activeModalItem.keterangan_koreksi && (
                <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-1.5">
                  <h4 className="font-bold text-xs uppercase tracking-wide text-sky-800">
                    Koreksi Admin
                  </h4>
                  <p className="text-xs text-slate-700 whitespace-pre-line">
                    {activeModalItem.keterangan_koreksi}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Dikoreksi oleh{' '}
                    <span className="font-semibold text-slate-700">
                      {activeModalItem.nama_admin_koreksi || 'admin'}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                type="button"
                onClick={() => openKoreksi(activeModalItem)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
              >
                <PencilLine className="w-3.5 h-3.5" />
                Koreksi Absensi
              </button>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-2 bg-[#17362f] text-white text-xs font-semibold rounded-lg hover:bg-[#122b25] transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KOREKSI ABSENSI (MG-10) */}
      {koreksiItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs animate-fadeIn">
          <form
            onSubmit={handleSubmitKoreksi}
            className="bg-white rounded-xl max-w-md w-full p-6 md:p-7 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5"
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-[#17362f] uppercase tracking-wider">
                  Koreksi Absensi
                </span>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {getInternName(koreksiItem)} — {formatDateToID(koreksiItem.tanggal)}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeKoreksi}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {koreksiItem.keterangan_koreksi && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-700">Koreksi sebelumnya</span>
                {koreksiItem.nama_admin_koreksi ? ` oleh ${koreksiItem.nama_admin_koreksi}` : ''}:{' '}
                {koreksiItem.keterangan_koreksi}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jam check-in (WIB)
                </label>
                <input
                  type="time"
                  required
                  value={koreksiForm.jam_checkin}
                  onChange={(e) => setKoreksiForm((f) => ({ ...f, jam_checkin: e.target.value }))}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jam check-out (WIB)
                </label>
                <input
                  type="time"
                  value={koreksiForm.jam_checkout}
                  onChange={(e) => setKoreksiForm((f) => ({ ...f, jam_checkout: e.target.value }))}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] transition"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {koreksiItem.jam_checkout
                    ? 'Kosongkan untuk menghapus jam check-out.'
                    : 'Isi bila peserta tidak sempat check-out.'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keterangan koreksi <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={koreksiForm.keterangan}
                onChange={(e) => setKoreksiForm((f) => ({ ...f, keterangan: e.target.value }))}
                placeholder="Contoh: Sistem tidak bisa diakses pukul 08.00–09.00, peserta hadir sesuai konfirmasi pembimbing."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] transition resize-y"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Keterangan dan nama Anda akan tersimpan sebagai riwayat koreksi.
              </p>
            </div>

            {koreksiError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{koreksiError}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                type="button"
                onClick={closeKoreksi}
                disabled={koreksiSubmitting}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={koreksiSubmitting || !koreksiForm.keterangan.trim()}
                className="px-4 py-2 bg-[#17362f] text-white text-xs font-semibold rounded-lg hover:bg-[#122b25] disabled:bg-slate-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {koreksiSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan Koreksi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminAttendancePage;

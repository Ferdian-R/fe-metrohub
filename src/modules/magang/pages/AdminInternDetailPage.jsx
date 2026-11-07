import { useToast } from '../../../context/ToastContext';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  X,
  Loader2,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { magangService } from '../services/magangService';

export const AdminInternDetailPage = () => {
  const { id } = useParams();
  const [intern, setIntern] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // State Tabs: 'ringkasan', 'absensi', 'logbook', 'tugas'
  const [activeTab, setActiveTab] = useState('ringkasan');

  // Tab Data States
  const [attendances, setAttendances] = useState([]);
  const [logbooks, setLogbooks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  // Modal Ubah Status Kerja
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatusKerja, setNewStatusKerja] = useState('Remote');

  // Modal Ubah Data
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nama: '',
    kampus: '',
    email: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
  });

  const { showToast } = useToast();

  const fetchInternDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await magangService.getInternDetail(id);
      const data = res?.data;
      setIntern(data);
      if (data) {
        setEditForm({
          nama: data.nama || '',
          kampus: data.asal_kampus || data.kampus || '',
          email: data.email || '',
          tanggal_mulai: data.tanggal_mulai || '',
          tanggal_selesai: data.tanggal_selesai || '',
        });
        setNewStatusKerja(data.status_kerja === 'ONSITE' ? 'Remote' : 'On-site');
      }
    } catch (err) {
      console.error('Failed to load intern detail:', err);
      setError(err?.message || 'Gagal memuat detail anak magang');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInternDetail();
  }, [fetchInternDetail]);

  // Fetch data per tab
  useEffect(() => {
    if (!id) return;
    const loadTabData = async () => {
      setTabLoading(true);
      try {
        if (activeTab === 'absensi') {
          const res = await magangService.getAllAttendances({ intern_id: id });
          setAttendances(res?.data || []);
        } else if (activeTab === 'logbook') {
          const res = await magangService.getAllLogbooks({ intern_id: id });
          setLogbooks(res?.data || []);
        } else if (activeTab === 'tugas') {
          const res = await magangService.getAllTasks({ intern_id: id });
          setTasks(res?.data || []);
        }
      } catch (err) {
        console.error(`Failed to load tab ${activeTab}:`, err);
      } finally {
        setTabLoading(false);
      }
    };

    if (activeTab !== 'ringkasan') {
      loadTabData();
    }
  }, [id, activeTab]);

  const formatDateToID = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getSisaHari = (selesaiStr) => {
    if (!selesaiStr) return 0;
    const selesai = new Date(selesaiStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = selesai - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Simpan Perubahan Status Kerja
  const handleSaveStatusKerja = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const enumVal = newStatusKerja === 'On-site' ? 'ONSITE' : 'REMOTE';
      await magangService.updateStatusKerja(id, enumVal);
      setShowStatusModal(false);
      showToast({
        title: 'Status kerja berhasil diperbarui',
        message: `Status kerja ${intern.nama} diubah menjadi ${newStatusKerja}.`,
      });
      await fetchInternDetail();
    } catch (err) {
      console.error('Failed to update status kerja:', err);
      showToast({
        title: 'Gagal mengubah status kerja',
        message: err?.message || 'Terjadi kesalahan sistem',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Simpan Ubah Data Peserta
  const handleSaveEditData = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        nama: editForm.nama.trim(),
        asal_kampus: editForm.kampus.trim(),
        email: editForm.email.trim(),
        tanggal_mulai: editForm.tanggal_mulai,
        tanggal_selesai: editForm.tanggal_selesai,
      };
      await magangService.updateIntern(id, payload);
      setShowEditModal(false);
      showToast({
        title: 'Data peserta tersimpan',
        message: `Data ${editForm.nama} berhasil diperbarui.`,
      });
      await fetchInternDetail();
    } catch (err) {
      console.error('Failed to update intern data:', err);
      showToast({
        title: 'Gagal memperbarui data',
        message: err?.message || 'Terjadi kesalahan sistem',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#17362f] mb-3" />
        <p className="text-sm">Memuat informasi anak magang...</p>
      </div>
    );
  }

  if (error || !intern) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/magang/interns"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#17362f] hover:text-[#285f52] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Data Anak Magang</span>
        </Link>
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error || 'Data anak magang tidak ditemukan'}</span>
          </div>
          <button
            onClick={fetchInternDetail}
            className="px-3 py-1 bg-white border border-rose-300 rounded text-xs font-semibold"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  const statusKerjaLabel = intern.status_kerja === 'ONSITE' ? 'On-site' : 'Remote';
  const isAktif = intern.masa_magang_aktif ?? true;
  const isAkunAktif = intern.akun_aktif ?? true;
  const sisaHari = getSisaHari(intern.tanggal_selesai);
  const periodeDisplay = `${formatDateToID(intern.tanggal_mulai)} — ${formatDateToID(intern.tanggal_selesai)}`;

  return (
    <div className="space-y-6 w-full">
      {/* Tombol Kembali ke Data Anak Magang */}
      <Link
        to="/admin/magang/interns"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#17362f] hover:text-[#285f52] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Data Anak Magang</span>
      </Link>

      {/* Profil Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div>
          <span className="text-[11px] font-bold text-[#17362f] tracking-wider uppercase">
            {isAktif ? 'PESERTA AKTIF' : 'PESERTA SELESAI'}
          </span>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight font-lexend mt-0.5">
            {intern.nama}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            {intern.asal_kampus || intern.kampus} · <span className="font-mono text-slate-600">{intern.email}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition"
          >
            Ubah Data
          </button>
          <button
            type="button"
            onClick={() => {
              setNewStatusKerja(statusKerjaLabel === 'On-site' ? 'Remote' : 'On-site');
              setShowStatusModal(true);
            }}
            className="px-4 py-2 bg-[#17362f] hover:bg-[#122b25] text-white text-xs font-semibold rounded-lg shadow-xs transition"
          >
            Ubah Status Kerja
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-8 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('ringkasan')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'ringkasan'
              ? 'border-[#17362f] text-[#17362f] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Ringkasan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('absensi')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'absensi'
              ? 'border-[#17362f] text-[#17362f] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Absensi
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logbook')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'logbook'
              ? 'border-[#17362f] text-[#17362f] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Logbook
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tugas')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'tugas'
              ? 'border-[#17362f] text-[#17362f] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Tugas
        </button>
      </div>

      {/* Tab Content: Ringkasan */}
      {activeTab === 'ringkasan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card Kiri: Informasi Magang */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-6 md:p-7 shadow-2xs">
            <h3 className="text-base font-semibold text-slate-900 font-lexend mb-5">
              Informasi magang
            </h3>

            <div className="divide-y divide-slate-100 text-xs md:text-sm">
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500">Asal kampus</span>
                <span className="font-semibold text-slate-800">{intern.asal_kampus || intern.kampus || '-'}</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500">Periode</span>
                <span className="font-semibold text-slate-800">{periodeDisplay}</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500">Sisa masa magang</span>
                <span className="font-semibold text-slate-800">{sisaHari} hari kalender</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500">Status kerja</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{statusKerjaLabel}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewStatusKerja(statusKerjaLabel === 'On-site' ? 'Remote' : 'On-site');
                      setShowStatusModal(true);
                    }}
                    className="text-xs text-[#17362f] hover:underline font-semibold"
                  >
                    Ubah
                  </button>
                </div>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500">Status periode</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  isAktif ? 'bg-[#e7f5ec] text-[#206941]' : 'bg-slate-100 text-slate-500'
                }`}>
                  {isAktif ? 'Aktif' : 'Berakhir'}
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500">Status akun</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  isAkunAktif ? 'bg-[#e7f5ec] text-[#206941]' : 'bg-rose-50 text-rose-700'
                }`}>
                  {isAkunAktif ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>
          </div>

          {/* Card Kanan: Ringkasan Status */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-6 md:p-7 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 font-lexend">
                Status Operasional
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 mb-6">
                Data sinkron dengan server backend
              </p>

              <div className="space-y-4 text-xs text-slate-600">
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span>ID Peserta</span>
                  <span className="font-mono font-bold text-slate-800">#{intern.id}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span>Penempatan Saat Ini</span>
                  <span className="font-semibold text-slate-800">{statusKerjaLabel}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span>Masa Magang</span>
                  <span className="font-semibold text-slate-800">{isAktif ? 'Sedang Berjalan' : 'Selesai'}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-6">
              Gunakan tab navigasi di atas untuk memeriksa riwayat absensi, logbook harian, dan daftar penugasan peserta.
            </p>
          </div>
        </div>
      )}

      {/* Tab Absensi */}
      {activeTab === 'absensi' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {tabLoading ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#17362f] mb-2" />
              <span>Memuat data absensi...</span>
            </div>
          ) : attendances.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Belum ada data absensi untuk peserta ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-white text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-4 font-semibold">Tanggal</th>
                    <th className="px-5 py-4 font-semibold">Check-in</th>
                    <th className="px-5 py-4 font-semibold">Check-out</th>
                    <th className="px-5 py-4 font-semibold">Jarak / Lokasi</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {attendances.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/80">
                      <td className="px-5 py-4 font-medium text-slate-900">{formatDateToID(att.tanggal)}</td>
                      <td className="px-5 py-4">{att.jam_checkin ? new Date(att.jam_checkin).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB' : '-'}</td>
                      <td className="px-5 py-4">{att.jam_checkout ? new Date(att.jam_checkout).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB' : 'Belum'}</td>
                      <td className="px-5 py-4 text-slate-500">{att.jarak_checkin_meter != null ? `${att.jarak_checkin_meter} m dari kantor` : '-'}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            att.jam_checkin && att.jam_checkout
                              ? 'bg-[#e7f5ec] text-[#206941]'
                              : att.checkout_terlambat
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {att.jam_checkin && att.jam_checkout
                              ? 'Lengkap'
                              : att.checkout_terlambat
                              ? 'Check-out tidak tercatat'
                              : 'Belum Lengkap'}
                          </span>
                          {att.keterangan_koreksi && (
                            <span
                              title={`Dikoreksi oleh ${att.nama_admin_koreksi || 'admin'}: ${att.keterangan_koreksi}`}
                              className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700"
                            >
                              Dikoreksi
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Logbook */}
      {activeTab === 'logbook' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {tabLoading ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#17362f] mb-2" />
              <span>Memuat data logbook...</span>
            </div>
          ) : logbooks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Belum ada catatan logbook untuk peserta ini.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {logbooks.map((lb) => (
                <div key={lb.id} className="p-5 hover:bg-slate-50/80 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-900 text-xs md:text-sm">{formatDateToID(lb.tanggal)}</span>
                    <span className="text-[11px] text-slate-400">
                      {lb.updated_at ? new Date(lb.updated_at).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB' : ''}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed">{lb.isi}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Tugas */}
      {activeTab === 'tugas' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {tabLoading ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#17362f] mb-2" />
              <span>Memuat data tugas...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Belum ada tugas yang ditugaskan kepada peserta ini.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <div key={task.id} className="p-5 hover:bg-slate-50/80 transition flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs md:text-sm">{task.judul}</h4>
                    <p className="text-xs text-slate-500 mt-1">{task.deskripsi}</p>
                    {task.catatan_progres && (
                      <p className="text-[11px] text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                        <strong>Catatan:</strong> {task.catatan_progres}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-1 ${
                      task.status === 'SELESAI'
                        ? 'bg-[#e7f5ec] text-[#206941]'
                        : task.terlambat
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {task.status === 'SELESAI' ? 'Selesai' : task.terlambat ? 'Terlambat' : task.status === 'DIKERJAKAN' ? 'Dikerjakan' : 'Belum Dikerjakan'}
                    </span>
                    <p className="text-[11px] text-slate-400">Tenggat: {formatDateToID(task.tenggat)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL UBAH STATUS KERJA */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-xl max-w-md w-full p-6 md:p-7 shadow-2xl relative border border-slate-200">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-xl font-semibold text-slate-900 font-lexend">
                Ubah Status Kerja
              </h3>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              {intern.nama} · <span className="font-mono text-slate-600">{intern.email}</span>
            </p>

            <form onSubmit={handleSaveStatusKerja} className="space-y-4">
              <div className="text-xs text-slate-600">
                Status saat ini: <strong className="text-slate-800">{statusKerjaLabel}</strong>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status kerja baru
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition text-xs font-medium ${
                      newStatusKerja === 'On-site'
                        ? 'border-[#17362f] bg-[#eef5f2] text-[#17362f] font-semibold'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status_kerja_modal"
                      checked={newStatusKerja === 'On-site'}
                      onChange={() => setNewStatusKerja('On-site')}
                      className="accent-[#17362f]"
                    />
                    <span>On-site</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition text-xs font-medium ${
                      newStatusKerja === 'Remote'
                        ? 'border-[#17362f] bg-[#eef5f2] text-[#17362f] font-semibold'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status_kerja_modal"
                      checked={newStatusKerja === 'Remote'}
                      onChange={() => setNewStatusKerja('Remote')}
                      className="accent-[#17362f]"
                    />
                    <span>Remote</span>
                  </label>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#eef6f2] border border-[#d2e7dc] text-xs text-[#20493e]">
                <p className="font-bold text-[#17362f]">Berlaku untuk absensi berikutnya</p>
                <p className="text-[11px] text-[#3d6559] mt-0.5">
                  Tidak mengubah status, foto, atau lokasi pada absensi yang sudah tercatat.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowStatusModal(false)}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#17362f] hover:bg-[#122b25] disabled:bg-slate-400 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Simpan Status Kerja</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL UBAH DATA */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-900 font-lexend">
                Ubah Data Peserta
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditData} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama lengkap
                </label>
                <input
                  type="text"
                  required
                  value={editForm.nama}
                  onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#17362f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asal kampus
                </label>
                <input
                  type="text"
                  required
                  value={editForm.kampus}
                  onChange={(e) => setEditForm({ ...editForm, kampus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#17362f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#17362f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal mulai
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.tanggal_mulai}
                    onChange={(e) => setEditForm({ ...editForm, tanggal_mulai: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal selesai
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.tanggal_selesai}
                    onChange={(e) => setEditForm({ ...editForm, tanggal_selesai: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#17362f] hover:bg-[#122b25] disabled:bg-slate-400 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInternDetailPage;

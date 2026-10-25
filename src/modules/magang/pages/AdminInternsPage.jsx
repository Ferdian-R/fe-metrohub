import React, { useState, useEffect } from 'react';
import { magangService } from '../services/magangService';
import {
  Users,
  UserPlus,
  Plus,
  Briefcase,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Send,
} from 'lucide-react';

export const AdminInternsPage = () => {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [targetIntern, setTargetIntern] = useState(null);

  // Form Tambah Intern
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [asalKampus, setAsalKampus] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [statusKerja, setStatusKerja] = useState('onsite');

  // Form Buat Tugas
  const [taskJudul, setTaskJudul] = useState('');
  const [taskDeskripsi, setTaskDeskripsi] = useState('');
  const [taskTenggat, setTaskTenggat] = useState('');

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInterns = async () => {
    try {
      const res = await magangService.getAllInterns();
      setInterns(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  const handleCreateIntern = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setMessage('');

    try {
      await magangService.createIntern({
        nama,
        email,
        asal_kampus: asalKampus,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        status_kerja: statusKerja,
      });
      setMessage('Anak magang berhasil didaftarkan beserta akun loginnya!');
      setShowAddModal(false);
      // Reset form
      setNama('');
      setEmail('');
      setAsalKampus('');
      setTanggalMulai('');
      setTanggalSelesai('');
      await fetchInterns();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menambahkan anak magang.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatusKerja = async (intern) => {
    const nextStatus = intern.status_kerja === 'onsite' ? 'remote' : 'onsite';
    try {
      await magangService.updateStatusKerja(intern.id, nextStatus);
      await fetchInterns();
    } catch (err) {
      alert(err.message || 'Gagal mengubah status kerja.');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!targetIntern) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      await magangService.createTask({
        intern_id: targetIntern.id,
        judul: taskJudul,
        deskripsi: taskDeskripsi,
        tenggat: taskTenggat,
      });
      setMessage(`Tugas berhasil diberikan kepada ${targetIntern.nama || 'anak magang'}.`);
      setShowTaskModal(false);
      setTaskJudul('');
      setTaskDeskripsi('');
      setTaskTenggat('');
    } catch (err) {
      setErrorMsg(err.message || 'Gagal membuat tugas.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Data Anak Magang</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data mahasiswa magang, atur status penempatan on-site/remote, dan beri tugas baru.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowAddModal(true);
            setErrorMsg('');
            setMessage('');
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-sm flex items-center gap-2 self-start md:self-auto transition"
        >
          <UserPlus className="w-4 h-4" /> Tambah Anak Magang
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{message}</span>
        </div>
      )}

      {/* Tabel Data Anak Magang */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Nama & Kampus</th>
                <th className="px-5 py-3.5">Email Akun</th>
                <th className="px-5 py-3.5">Periode Magang</th>
                <th className="px-5 py-3.5">Status Kerja</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {interns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    Belum ada data anak magang. Klik tombol "Tambah Anak Magang" di atas.
                  </td>
                </tr>
              ) : (
                interns.map((intern) => (
                  <tr key={intern.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{intern.nama || intern.user?.nama}</p>
                      <p className="text-[11px] text-slate-400">{intern.asal_kampus}</p>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                      {intern.email || intern.user?.email}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-700">
                        {intern.tanggal_mulai} s/d {intern.tanggal_selesai}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatusKerja(intern)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                          intern.status_kerja === 'remote'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                        title="Klik untuk ubah On-site / Remote"
                      >
                        {intern.status_kerja === 'remote' ? 'Remote (WFA)' : 'On-site (Kantor)'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setTargetIntern(intern);
                          setShowTaskModal(true);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-medium rounded-lg text-xs transition"
                      >
                        Beri Tugas
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Magang */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="font-bold text-slate-800 text-base mb-1">Tambah Anak Magang Baru</h3>
            <p className="text-xs text-slate-500 mb-4">
              Menambahkan anak magang sekaligus membuatkan akun login dan akses absensi (MG-01).
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateIntern} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Misal: John Doe"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Akun</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Asal Kampus</label>
                  <input
                    type="text"
                    required
                    value={asalKampus}
                    onChange={(e) => setAsalKampus(e.target.value)}
                    placeholder="Universitas Andalas"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={tanggalSelesai}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Penempatan Kerja</label>
                <select
                  value={statusKerja}
                  onChange={(e) => setStatusKerja(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                >
                  <option value="onsite">On-site (Wajib dalam radius kantor)</option>
                  <option value="remote">Remote (Boleh absen dari mana pun)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  {submitting ? 'Mendaftarkan...' : 'Daftarkan Anak Magang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Beri Tugas */}
      {showTaskModal && targetIntern && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-slate-800 text-base mb-1">Beri Tugas Baru</h3>
            <p className="text-xs text-slate-500 mb-4">
              Untuk anak magang: <strong className="text-slate-700">{targetIntern.nama || targetIntern.user?.nama}</strong>
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Tugas</label>
                <input
                  type="text"
                  required
                  value={taskJudul}
                  onChange={(e) => setTaskJudul(e.target.value)}
                  placeholder="Misal: Buat wireframe modul magang"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tenggat Waktu (Deadline)</label>
                <input
                  type="date"
                  required
                  value={taskTenggat}
                  onChange={(e) => setTaskTenggat(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Tugas</label>
                <textarea
                  rows={4}
                  value={taskDeskripsi}
                  onChange={(e) => setTaskDeskripsi(e.target.value)}
                  placeholder="Instruksi pengerjaan dan deliverable yang diharapkan..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Mengirim...' : 'Kirim Penugasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

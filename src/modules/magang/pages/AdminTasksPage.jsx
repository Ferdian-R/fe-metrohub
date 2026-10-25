import React, { useState } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  X,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

const INTERNS_MAP = {
  'Raka Aditya': 'raka@metro.demo',
  'Salsa Maharani': 'salsa@metro.demo',
  'Dimas Nugraha': 'dimas@metro.demo',
};

const INITIAL_TASKS = [
  {
    id: 1,
    judul: 'Implementasi halaman laporan',
    peserta: 'Raka Aditya',
    email: 'raka@metro.demo',
    tenggat: '22 Okt 2026',
    rawTenggat: '2026-10-22',
    tenggatFormatted: '22 Oktober 2026',
    status: 'Dikerjakan',
    isTerlambat: false,
    deskripsi:
      'Buat halaman laporan operasional sesuai rancangan dan pastikan tampilan responsif.',
    catatanProgres: 'Tabel utama selesai, lanjut validasi filter.',
  },
  {
    id: 2,
    judul: 'Audit komponen formulir',
    peserta: 'Raka Aditya',
    email: 'raka@metro.demo',
    tenggat: '18 Okt 2026',
    rawTenggat: '2026-10-18',
    tenggatFormatted: '18 Oktober 2026',
    status: 'Belum Dikerjakan',
    isTerlambat: true,
    deskripsi:
      'Periksa seluruh komponen formulir, pastikan label dan aria attributes terhubung.',
    catatanProgres: 'Belum ada pembaruan.',
  },
  {
    id: 3,
    judul: 'Dokumentasi API internal',
    peserta: 'Salsa Maharani',
    email: 'salsa@metro.demo',
    tenggat: '25 Okt 2026',
    rawTenggat: '2026-10-25',
    tenggatFormatted: '25 Oktober 2026',
    status: 'Selesai',
    isTerlambat: false,
    deskripsi:
      'Dokumentasikan format response JSON untuk seluruh endpoint modul pengguna dan magang.',
    catatanProgres: 'Dokumentasi telah diperiksa.',
  },
];

export const AdminTasksPage = () => {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeserta, setSelectedPeserta] = useState('Semua peserta');
  const [selectedStatus, setSelectedStatus] = useState('Semua status');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDetailTask, setSelectedDetailTask] = useState(null);

  // Form State Beri Tugas (F07)
  const [formData, setFormData] = useState({
    penerima: 'Raka Aditya',
    judul: '',
    deskripsi: '',
    tenggat: '',
  });

  // Success Banner State
  const [successBanner, setSuccessBanner] = useState(null);

  // Open Add Task Modal
  const handleOpenAddModal = () => {
    setFormData({
      penerima: 'Raka Aditya',
      judul: 'Validasi filter transaksi',
      deskripsi:
        'Periksa filter periode, jenis, dan kategori pada daftar transaksi. Cocokkan hasil dengan data contoh dan pastikan reset filter menampilkan daftar semula.',
      tenggat: '2026-10-23',
    });
    setShowAddModal(true);
  };

  // Handle Submit Beri Tugas
  const handleSubmitTask = (e) => {
    e.preventDefault();

    if (!formData.judul.trim()) return;

    const dateObj = new Date(formData.tenggat || '2026-10-23');
    const day = dateObj.getDate() || 23;
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthsLong = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthShort = monthsShort[dateObj.getMonth()] || 'Okt';
    const monthLong = monthsLong[dateObj.getMonth()] || 'Oktober';
    const year = dateObj.getFullYear() || 2026;

    const newTask = {
      id: Date.now(),
      judul: formData.judul,
      peserta: formData.penerima,
      email: INTERNS_MAP[formData.penerima] || 'peserta@metro.demo',
      tenggat: `${day} ${monthShort} ${year}`,
      rawTenggat: formData.tenggat || '2026-10-23',
      tenggatFormatted: `${day} ${monthLong} ${year}`,
      status: 'Belum Dikerjakan',
      isTerlambat: false,
      deskripsi: formData.deskripsi,
      catatanProgres: 'Belum ada pembaruan.',
    };

    setTasks([newTask, ...tasks]);
    setShowAddModal(false);

    setSuccessBanner({
      title: 'Tugas berhasil diberikan',
      message: `${formData.judul} ditambahkan untuk ${formData.penerima}.`,
    });
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      task.judul.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPeserta =
      selectedPeserta === 'Semua peserta' || task.peserta === selectedPeserta;

    const matchesStatus =
      selectedStatus === 'Semua status' ||
      (selectedStatus === 'Terlambat' && task.isTerlambat) ||
      task.status === selectedStatus;

    return matchesSearch && matchesPeserta && matchesStatus;
  });

  const getStatusBadge = (task) => {
    if (task.status === 'Selesai') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e7f5ec] text-[#176a43] border border-[#c6e9d4]">
          Selesai
        </span>
      );
    }
    if (task.status === 'Dikerjakan') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e7f5ec] text-[#176a43] border border-[#c6e9d4]">
          Dikerjakan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        Belum Dikerjakan
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Success Banner AFTER F07 */}
      {successBanner && (
        <div className="p-4 bg-[#e7f5ec] border border-[#c6e9d4] rounded-xl flex items-start justify-between gap-3 animate-in fade-in">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-[#176a43]">
              {successBanner.title}
            </h4>
            <p className="text-xs text-[#176a43]/90">
              {successBanner.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="text-[#176a43]/70 hover:text-[#176a43] p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Halaman Sesuai Figma */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight font-lexend">
            Penugasan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau tugas dan catatan progres peserta.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="self-start sm:self-auto px-5 py-2.5 bg-[#17362f] hover:bg-[#122b25] active:scale-[0.99] text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Beri Tugas</span>
        </button>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Input Cari Judul Tugas */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari judul tugas"
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

          {/* Dropdown Status */}
          <div className="w-full md:w-52 relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-11 pl-4 pr-9 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] appearance-none cursor-pointer transition"
            >
              <option value="Semua status">Semua status</option>
              <option value="Dikerjakan">Dikerjakan</option>
              <option value="Belum Dikerjakan">Belum Dikerjakan</option>
              <option value="Selesai">Selesai</option>
              <option value="Terlambat">Terlambat</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Penugasan Sesuai Figma */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fbfcfb] border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Judul Tugas</th>
                <th className="py-3.5 px-5">Peserta</th>
                <th className="py-3.5 px-5">Tenggat</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Catatan Progres Terbaru</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    Tidak ada tugas yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900 leading-tight">
                        {task.judul}
                      </p>
                      {task.isTerlambat && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fef2f2] text-[#b91c1c] border border-rose-200 mt-1">
                          Terlambat
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-slate-700 whitespace-nowrap">
                      {task.peserta}
                    </td>
                    <td className="py-4 px-5 text-slate-700 whitespace-nowrap">
                      {task.tenggat}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      {getStatusBadge(task)}
                    </td>
                    <td className="py-4 px-5 text-slate-700 max-w-xs md:max-w-md truncate">
                      {task.catatanProgres}
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedDetailTask(task)}
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

      {/* ======================================================== */}
      {/* MODAL F07: Beri Tugas                                   */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-xl font-semibold text-slate-900 font-lexend">
                Beri Tugas
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitTask} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Field Penerima */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Penerima
                </label>
                <div className="relative">
                  <select
                    value={formData.penerima}
                    onChange={(e) =>
                      setFormData({ ...formData, penerima: e.target.value })
                    }
                    className="w-full h-11 pl-3 pr-9 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] appearance-none cursor-pointer transition"
                  >
                    <option value="Raka Aditya">Raka Aditya</option>
                    <option value="Salsa Maharani">Salsa Maharani</option>
                    <option value="Dimas Nugraha">Dimas Nugraha</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {INTERNS_MAP[formData.penerima]}
                </p>
              </div>

              {/* Field Judul Tugas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul tugas
                </label>
                <input
                  type="text"
                  required
                  value={formData.judul}
                  onChange={(e) =>
                    setFormData({ ...formData, judul: e.target.value })
                  }
                  placeholder="Misal: Validasi filter transaksi"
                  className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] transition"
                />
              </div>

              {/* Field Deskripsi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  rows={4}
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  placeholder="Instruksi dan rincian penugasan peserta..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] transition resize-none leading-relaxed"
                />
              </div>

              {/* Field Tenggat */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tenggat
                </label>
                <input
                  type="date"
                  required
                  value={formData.tenggat}
                  onChange={(e) =>
                    setFormData({ ...formData, tenggat: e.target.value })
                  }
                  className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] transition"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-sm font-semibold transition active:scale-95 shadow-2xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#17362f] hover:bg-[#122b25] text-white rounded-lg text-sm font-semibold transition active:scale-95 shadow-2xs cursor-pointer"
                >
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL F08: Detail Tugas (Read Only)                     */}
      {/* ======================================================== */}
      {selectedDetailTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-100">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 font-lexend">
                  Detail Tugas
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedDetailTask.peserta} · {selectedDetailTask.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailTask(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Status Badge */}
              <div>
                {getStatusBadge(selectedDetailTask)}
              </div>

              {/* Field Judul Tugas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul tugas
                </label>
                <div className="p-3.5 bg-[#fbfcfb] border border-slate-200 rounded-lg text-sm font-medium text-slate-800">
                  {selectedDetailTask.judul}
                </div>
              </div>

              {/* Field Deskripsi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi
                </label>
                <div className="p-3.5 bg-[#fbfcfb] border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed min-h-[80px]">
                  {selectedDetailTask.deskripsi || '-'}
                </div>
              </div>

              {/* Field Tenggat */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tenggat
                </label>
                <div className="p-3.5 bg-[#fbfcfb] border border-slate-200 rounded-lg text-sm font-medium text-slate-800">
                  {selectedDetailTask.tenggatFormatted || selectedDetailTask.tenggat}
                </div>
              </div>

              {/* Field Catatan Progres Terbaru */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan progres terbaru
                </label>
                <div className="p-3.5 bg-[#fbfcfb] border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed min-h-[80px]">
                  {selectedDetailTask.catatanProgres}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-start bg-slate-50/50">
              <button
                type="button"
                onClick={() => setSelectedDetailTask(null)}
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

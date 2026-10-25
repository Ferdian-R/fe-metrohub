import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  X,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

export const AdminInternsPage = () => {
  // Data Awal sesuai Mockup Figma A-02
  const [interns, setInterns] = useState([
    {
      id: 1,
      nama: 'Raka Aditya',
      email: 'raka@metro.demo',
      kampus: 'Universitas Negeri Yogyakarta',
      tanggal_mulai: '2026-08-01',
      tanggal_selesai: '2026-12-31',
      periodeFormatted: '01 Agu 2026 — 31 Des 2026',
      status_kerja: 'On-site',
      status_periode: 'Aktif',
    },
    {
      id: 2,
      nama: 'Salsa Maharani',
      email: 'salsa@metro.demo',
      kampus: 'Universitas Gadjah Mada',
      tanggal_mulai: '2026-09-15',
      tanggal_selesai: '2027-01-15',
      periodeFormatted: '15 Sep 2026 — 15 Jan 2027',
      status_kerja: 'Remote',
      status_periode: 'Aktif',
    },
    {
      id: 3,
      nama: 'Dimas Saputra',
      email: 'dimas@metro.demo',
      kampus: 'Universitas Amikom',
      tanggal_mulai: '2026-06-01',
      tanggal_selesai: '2026-09-30',
      periodeFormatted: '01 Jun 2026 — 30 Sep 2026',
      status_kerja: 'On-site',
      status_periode: 'Berakhir',
    },
  ]);

  // Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatusKerja, setFilterStatusKerja] = useState('Semua status kerja');
  const [filterPeriode, setFilterPeriode] = useState('Semua periode');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);

  // Form State (Tambah)
  const [formData, setFormData] = useState({
    nama: '',
    kampus: '',
    email: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    status_kerja: 'Remote',
  });

  // Validation Errors
  const [formErrors, setFormErrors] = useState({});

  // Success Notification Banner
  const [successBanner, setSuccessBanner] = useState(null);

  // Filter Logic
  const filteredInterns = useMemo(() => {
    return interns.filter((intern) => {
      const matchSearch =
        intern.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intern.kampus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intern.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatusKerja =
        filterStatusKerja === 'Semua status kerja' ||
        intern.status_kerja.toLowerCase() === filterStatusKerja.toLowerCase();

      const matchPeriode =
        filterPeriode === 'Semua periode' ||
        intern.status_periode.toLowerCase() === filterPeriode.toLowerCase();

      return matchSearch && matchStatusKerja && matchPeriode;
    });
  }, [interns, searchQuery, filterStatusKerja, filterPeriode]);

  // Format Tanggal ke "DD Mmm YYYY"
  const formatDateToID = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const d = String(date.getDate()).padStart(2, '0');
    const m = months[date.getMonth()];
    const y = date.getFullYear();
    return `${d} ${m} ${y}`;
  };

  // Buka Modal Tambah dengan Pre-fill opsional (F01 contoh Nabila)
  const handleOpenAddModal = () => {
    setFormData({
      nama: 'Nabila Putri',
      kampus: 'Universitas Negeri Yogyakarta',
      email: 'nabila@metro.demo',
      tanggal_mulai: '2026-10-20',
      tanggal_selesai: '2026-12-31',
      status_kerja: 'Remote',
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  // Simpan Tambah Anak Magang (F01)
  const handleSaveAdd = (e) => {
    e.preventDefault();
    const errors = {};

    // Validasi 1: Cek apakah email sudah digunakan
    const emailExist = interns.some(
      (item) => item.email.toLowerCase() === formData.email.trim().toLowerCase()
    );
    if (emailExist) {
      errors.email = 'Email sudah digunakan. Gunakan email lain untuk peserta baru.';
    }

    // Validasi 2: Periode tidak valid (tanggal selesai < tanggal mulai)
    if (formData.tanggal_mulai && formData.tanggal_selesai) {
      if (new Date(formData.tanggal_selesai) < new Date(formData.tanggal_mulai)) {
        errors.tanggal_selesai = 'Tanggal selesai harus sama dengan atau setelah tanggal mulai.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newIntern = {
      id: Date.now(),
      nama: formData.nama.trim(),
      email: formData.email.trim(),
      kampus: formData.kampus.trim(),
      tanggal_mulai: formData.tanggal_mulai,
      tanggal_selesai: formData.tanggal_selesai,
      periodeFormatted: `${formatDateToID(formData.tanggal_mulai)} — ${formatDateToID(formData.tanggal_selesai)}`,
      status_kerja: formData.status_kerja === 'Remote' ? 'Remote' : 'On-site',
      status_periode: new Date(formData.tanggal_selesai) >= new Date() ? 'Aktif' : 'Berakhir',
    };

    setInterns([newIntern, ...interns]);
    setShowAddModal(false);

    // Tampilkan success banner sesuai Figma: "AFTER F01 / SKENARIO BARU SAJA"
    setSuccessBanner({
      title: `${newIntern.nama} berhasil ditambahkan`,
      subtitle: `Akun ${newIntern.email} terhubung dengan peserta ${newIntern.nama}.`,
    });
  };

  // Buka Modal Ubah (F02)
  const handleOpenEditModal = (intern) => {
    setSelectedIntern(intern);
    setFormData({
      nama: intern.nama,
      kampus: intern.kampus,
      email: intern.email,
      tanggal_mulai: intern.tanggal_mulai,
      tanggal_selesai: intern.tanggal_selesai,
      status_kerja: intern.status_kerja,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  // Simpan Ubah Anak Magang (F02)
  const handleSaveEdit = (e) => {
    e.preventDefault();
    const errors = {};

    // Cek duplikasi email terhadap intern lain
    const emailExist = interns.some(
      (item) =>
        item.id !== selectedIntern.id &&
        item.email.toLowerCase() === formData.email.trim().toLowerCase()
    );
    if (emailExist) {
      errors.email = 'Email sudah digunakan. Gunakan email lain.';
    }

    if (new Date(formData.tanggal_selesai) < new Date(formData.tanggal_mulai)) {
      errors.tanggal_selesai = 'Tanggal selesai harus sama dengan atau setelah tanggal mulai.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const updatedList = interns.map((item) => {
      if (item.id === selectedIntern.id) {
        return {
          ...item,
          nama: formData.nama.trim(),
          email: formData.email.trim(),
          kampus: formData.kampus.trim(),
          tanggal_mulai: formData.tanggal_mulai,
          tanggal_selesai: formData.tanggal_selesai,
          periodeFormatted: `${formatDateToID(formData.tanggal_mulai)} — ${formatDateToID(formData.tanggal_selesai)}`,
          status_kerja: formData.status_kerja,
          status_periode: new Date(formData.tanggal_selesai) >= new Date() ? 'Aktif' : 'Berakhir',
        };
      }
      return item;
    });

    setInterns(updatedList);
    setShowEditModal(false);

    // Tampilkan success banner sesuai Figma: "AFTER F02 / peserta yang sama"
    setSuccessBanner({
      title: `Data ${formData.nama} tersimpan`,
      subtitle: `Perubahan diterapkan pada peserta yang sama. Akun ${formData.email} tetap terhubung.`,
    });
  };

  // Buka Detail Modal
  const handleOpenDetailModal = (intern) => {
    setSelectedIntern(intern);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Success Notification Banner Sesuai Figma */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-[#eaf4ef] border border-[#a4d4bc] text-[#17362f] flex items-start justify-between transition animate-fadeIn">
          <div>
            <h4 className="font-bold text-sm text-[#17362f] leading-snug">
              {successBanner.title}
            </h4>
            <p className="text-xs text-[#3b6357] mt-0.5">{successBanner.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="text-[#3b6357] hover:text-[#17362f] p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Halaman Sesuai Figma */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-[26px] font-bold text-slate-900 tracking-tight leading-tight">
            Data Anak Magang
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Data peserta, periode, dan status kerja.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="self-start sm:self-auto px-4 py-2.5 bg-[#17362f] hover:bg-[#122b25] active:scale-[0.99] text-white text-xs md:text-sm font-semibold rounded-lg flex items-center gap-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Anak Magang</span>
        </button>
      </div>

      {/* Filter Bar Sesuai Figma */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, kampus, atau email"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-[#fbfcfc] text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f] transition placeholder:text-slate-400"
          />
        </div>

        {/* Dropdown Status Kerja */}
        <div className="w-full md:w-52">
          <select
            value={filterStatusKerja}
            onChange={(e) => setFilterStatusKerja(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs md:text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f] cursor-pointer"
          >
            <option value="Semua status kerja">Semua status kerja</option>
            <option value="On-site">On-site</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        {/* Dropdown Periode */}
        <div className="w-full md:w-48">
          <select
            value={filterPeriode}
            onChange={(e) => setFilterPeriode(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs md:text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f] cursor-pointer"
          >
            <option value="Semua periode">Semua periode</option>
            <option value="Aktif">Aktif</option>
            <option value="Berakhir">Berakhir</option>
          </select>
        </div>
      </div>

      {/* Tabel Data Anak Magang Sesuai Figma */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-4 font-semibold">Nama dan Email</th>
                <th className="px-5 py-4 font-semibold">Kampus</th>
                <th className="px-5 py-4 font-semibold">Periode</th>
                <th className="px-5 py-4 font-semibold">Status Kerja</th>
                <th className="px-5 py-4 font-semibold">Status Periode</th>
                <th className="px-5 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInterns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-xs">
                    Tidak ada data peserta magang yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredInterns.map((intern) => (
                  <tr key={intern.id} className="hover:bg-slate-50/80 transition">
                    {/* Nama dan Email */}
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900 leading-snug">{intern.nama}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{intern.email}</p>
                    </td>

                    {/* Kampus */}
                    <td className="px-5 py-4 text-slate-600 font-medium">
                      {intern.kampus}
                    </td>

                    {/* Periode */}
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                      {intern.periodeFormatted}
                    </td>

                    {/* Status Kerja */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium text-slate-700">
                        {intern.status_kerja}
                      </span>
                    </td>

                    {/* Status Periode */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          intern.status_periode === 'Aktif'
                            ? 'bg-[#e7f5ec] text-[#206941]'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {intern.status_periode}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="px-5 py-4 text-right whitespace-nowrap font-medium">
                      <button
                        type="button"
                        onClick={() => handleOpenDetailModal(intern)}
                        className="text-[#17362f] hover:text-[#285e51] hover:underline mr-4 transition"
                      >
                        Lihat Detail
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(intern)}
                        className="text-[#17362f] hover:text-[#285e51] hover:underline transition"
                      >
                        Ubah
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tabel Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Menampilkan {filteredInterns.length} peserta</span>
          <span>1 dari 1 halaman</span>
        </div>
      </div>

      {/* MODAL 1: Tambah Anak Magang (F01) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Tambah Anak Magang
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Nabila Putri"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asal kampus
                </label>
                <input
                  type="text"
                  required
                  value={formData.kampus}
                  onChange={(e) => setFormData({ ...formData, kampus: e.target.value })}
                  placeholder="Universitas Negeri Yogyakarta"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (formErrors.email) setFormErrors({ ...formErrors, email: null });
                  }}
                  placeholder="nabila@metro.demo"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-xs md:text-sm text-slate-900 focus:outline-none ${
                    formErrors.email
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-slate-300 focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f]'
                  }`}
                />
                {formErrors.email && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal mulai
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal_mulai}
                    onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#17362f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal selesai
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal_selesai}
                    onChange={(e) => {
                      setFormData({ ...formData, tanggal_selesai: e.target.value });
                      if (formErrors.tanggal_selesai) setFormErrors({ ...formErrors, tanggal_selesai: null });
                    }}
                    className={`w-full px-3 py-2 rounded-lg border text-xs text-slate-800 focus:outline-none ${
                      formErrors.tanggal_selesai
                        ? 'border-rose-500 bg-rose-50/20'
                        : 'border-slate-300 focus:ring-1 focus:ring-[#17362f]'
                    }`}
                  />
                  {formErrors.tanggal_selesai && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.tanggal_selesai}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status kerja
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition text-xs font-medium ${
                      formData.status_kerja === 'On-site'
                        ? 'border-[#17362f] bg-[#eef5f2] text-[#17362f]'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status_kerja_add"
                      checked={formData.status_kerja === 'On-site'}
                      onChange={() => setFormData({ ...formData, status_kerja: 'On-site' })}
                      className="accent-[#17362f]"
                    />
                    <span>On-site</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition text-xs font-medium ${
                      formData.status_kerja === 'Remote'
                        ? 'border-[#17362f] bg-[#eef5f2] text-[#17362f]'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status_kerja_add"
                      checked={formData.status_kerja === 'Remote'}
                      onChange={() => setFormData({ ...formData, status_kerja: 'Remote' })}
                      className="accent-[#17362f]"
                    />
                    <span>Remote</span>
                  </label>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#eef6f2] border border-[#d2e7dc] text-xs text-[#20493e]">
                <p className="font-bold text-[#17362f]">Akun dibuat bersama peserta</p>
                <p className="text-[11px] text-[#3d6559] mt-0.5">
                  Email ini digunakan untuk akun Anak Magang yang terhubung dengan peserta.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#17362f] hover:bg-[#122b25] text-white text-xs font-semibold rounded-lg shadow-xs transition"
                >
                  Simpan Peserta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Ubah Data Anak Magang (F02) */}
      {showEditModal && selectedIntern && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Ubah Data Anak Magang
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
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
                  value={formData.kampus}
                  onChange={(e) => setFormData({ ...formData, kampus: e.target.value })}
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
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (formErrors.email) setFormErrors({ ...formErrors, email: null });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-xs md:text-sm text-slate-900 focus:outline-none ${
                    formErrors.email
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-slate-300 focus:ring-1 focus:ring-[#17362f]'
                  }`}
                />
                {formErrors.email && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal mulai
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal_mulai}
                    onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#17362f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal selesai
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal_selesai}
                    onChange={(e) => {
                      setFormData({ ...formData, tanggal_selesai: e.target.value });
                      if (formErrors.tanggal_selesai) setFormErrors({ ...formErrors, tanggal_selesai: null });
                    }}
                    className={`w-full px-3 py-2 rounded-lg border text-xs text-slate-800 focus:outline-none ${
                      formErrors.tanggal_selesai
                        ? 'border-rose-500 bg-rose-50/20'
                        : 'border-slate-300 focus:ring-1 focus:ring-[#17362f]'
                    }`}
                  />
                  {formErrors.tanggal_selesai && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.tanggal_selesai}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status kerja
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition text-xs font-medium ${
                      formData.status_kerja === 'On-site'
                        ? 'border-[#17362f] bg-[#eef5f2] text-[#17362f]'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status_kerja_edit"
                      checked={formData.status_kerja === 'On-site'}
                      onChange={() => setFormData({ ...formData, status_kerja: 'On-site' })}
                      className="accent-[#17362f]"
                    />
                    <span>On-site</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition text-xs font-medium ${
                      formData.status_kerja === 'Remote'
                        ? 'border-[#17362f] bg-[#eef5f2] text-[#17362f]'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status_kerja_edit"
                      checked={formData.status_kerja === 'Remote'}
                      onChange={() => setFormData({ ...formData, status_kerja: 'Remote' })}
                      className="accent-[#17362f]"
                    />
                    <span>Remote</span>
                  </label>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#eef6f2] border border-[#d2e7dc] text-xs text-[#20493e]">
                <p className="font-bold text-[#17362f]">Memperbarui peserta yang sama</p>
                <p className="text-[11px] text-[#3d6559] mt-0.5">
                  Perubahan tersimpan pada data {formData.nama.split(' ')[0]}. Tidak membuat akun baru.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#17362f] hover:bg-[#122b25] text-white text-xs font-semibold rounded-lg shadow-xs transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Detail Anak Magang */}
      {showDetailModal && selectedIntern && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-7 shadow-2xl relative border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold text-[#17362f] uppercase tracking-wider">
                  Detail Peserta
                </span>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {selectedIntern.nama}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Email Akun:</span>
                <span className="font-semibold text-slate-800 font-mono">{selectedIntern.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Asal Kampus:</span>
                <span className="font-semibold text-slate-800">{selectedIntern.kampus}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Periode Magang:</span>
                <span className="font-semibold text-slate-800">{selectedIntern.periodeFormatted}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Status Penempatan:</span>
                <span className="font-semibold text-slate-800">{selectedIntern.status_kerja}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Status Periode:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    selectedIntern.status_periode === 'Aktif'
                      ? 'bg-[#e7f5ec] text-[#206941]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {selectedIntern.status_periode}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowDetailModal(false);
                  handleOpenEditModal(selectedIntern);
                }}
                className="px-4 py-2 bg-[#17362f] text-white text-xs font-semibold rounded-lg hover:bg-[#122b25] transition"
              >
                Ubah Data Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

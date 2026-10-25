import React, { useState, useMemo } from 'react';
import {
  Plus,
  X,
  CheckCircle2,
} from 'lucide-react';

export const AdminInternsPage = () => {
  // Skenario View: 'normal', 'after_f01', 'after_f02'
  const [activeScenario, setActiveScenario] = useState('normal');

  // Data Awal sesuai Mockup Figma A-02
  const [interns, setInterns] = useState([
    {
      id: 1,
      nama: 'Raka Aditya',
      email: 'raka@metro.demo',
      kampus: 'Universitas Negeri Yogyakarta',
      tanggal_mulai: '2026-08-01',
      tanggal_selesai: '2026-12-31',
      periodeFormatted: '01 Agu—31 Des 2026',
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
      periodeFormatted: '15 Sep 2026—15 Jan 2027',
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
      periodeFormatted: '01 Jun 2026—30 Sep 2026',
      status_kerja: 'On-site',
      status_periode: 'Berakhir',
    },
  ]);

  // Data Khusus untuk Skenario AFTER F01 (Peserta Baru Nabila)
  const [recentAddedIntern, setRecentAddedIntern] = useState({
    nama: 'Nabila Putri',
    email: 'nabila@metro.demo',
    kampus: 'Universitas Negeri Yogyakarta',
    periodeFormatted: '20 Okt—31 Des 2026',
    status_kerja: 'Remote',
    status_periode: 'Aktif',
  });

  // Data Khusus untuk Skenario AFTER F02 (Update Raka)
  const [recentUpdatedIntern, setRecentUpdatedIntern] = useState({
    nama: 'Raka Aditya',
    email: 'raka@metro.demo',
    kampus: 'Universitas Negeri Yogyakarta',
    periodeFormatted: '01 Agustus—31 Desember 2026',
    status_kerja: 'On-site',
    status_periode: 'Aktif',
  });

  // Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatusKerja, setFilterStatusKerja] = useState('Semua status kerja');
  const [filterPeriode, setFilterPeriode] = useState('Semua periode');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    kampus: '',
    email: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    status_kerja: 'Remote',
  });

  // Form Validation Errors
  const [formErrors, setFormErrors] = useState({});

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

  const formatDateToID = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const d = String(date.getDate()).padStart(2, '0');
    const m = months[date.getMonth()];
    const y = date.getFullYear();
    return `${d} ${m} ${y}`;
  };

  // Buka Modal Tambah (F01)
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

  // Simpan Tambah Anak Magang (F01) -> Mengarahkan ke Skenario AFTER F01
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
      periodeFormatted: `${formatDateToID(formData.tanggal_mulai)}—${formatDateToID(formData.tanggal_selesai)}`,
      status_kerja: formData.status_kerja === 'Remote' ? 'Remote' : 'On-site',
      status_periode: new Date(formData.tanggal_selesai) >= new Date() ? 'Aktif' : 'Berakhir',
    };

    setInterns([...interns, newIntern]);
    setRecentAddedIntern(newIntern);
    setShowAddModal(false);
    setActiveScenario('after_f01');
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

  // Simpan Ubah Anak Magang (F02) -> Mengarahkan ke Skenario AFTER F02
  const handleSaveEdit = (e) => {
    e.preventDefault();
    const errors = {};

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

    const updated = {
      ...selectedIntern,
      nama: formData.nama.trim(),
      email: formData.email.trim(),
      kampus: formData.kampus.trim(),
      tanggal_mulai: formData.tanggal_mulai,
      tanggal_selesai: formData.tanggal_selesai,
      periodeFormatted: `${formatDateToID(formData.tanggal_mulai)}—${formatDateToID(formData.tanggal_selesai)}`,
      status_kerja: formData.status_kerja,
      status_periode: new Date(formData.tanggal_selesai) >= new Date() ? 'Aktif' : 'Berakhir',
    };

    setInterns(interns.map((item) => (item.id === selectedIntern.id ? updated : item)));
    setRecentUpdatedIntern(updated);
    setShowEditModal(false);
    setActiveScenario('after_f02');
  };

  return (
    <div className="space-y-8">
      {/* Scenario Switcher Tabs untuk mempermudah review Figma */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-white rounded-xl border border-slate-200">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-2">
          Pilih Tampilan Skenario Figma:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveScenario('normal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeScenario === 'normal'
                ? 'bg-[#17362f] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tabel Utama (A-02)
          </button>
          <button
            type="button"
            onClick={() => setActiveScenario('after_f01')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeScenario === 'after_f01'
                ? 'bg-[#17362f] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            AFTER F01 (Peserta Baru Ditambahkan)
          </button>
          <button
            type="button"
            onClick={() => setActiveScenario('after_f02')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeScenario === 'after_f02'
                ? 'bg-[#17362f] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            AFTER F02 (Peserta Diperbarui)
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. SKENARIO UTAMA: TABEL A-02                           */}
      {/* ======================================================== */}
      {activeScenario === 'normal' && (
        <div className="space-y-6 animate-fadeIn">
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

          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, kampus, atau email"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-[#fbfcfc] text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f] transition placeholder:text-slate-400"
              />
            </div>

            <div className="w-full md:w-52">
              <select
                value={filterStatusKerja}
                onChange={(e) => setFilterStatusKerja(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs md:text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#17362f] cursor-pointer"
              >
                <option value="Semua status kerja">Semua status kerja</option>
                <option value="On-site">On-site</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div className="w-full md:w-48">
              <select
                value={filterPeriode}
                onChange={(e) => setFilterPeriode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs md:text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#17362f] cursor-pointer"
              >
                <option value="Semua periode">Semua periode</option>
                <option value="Aktif">Aktif</option>
                <option value="Berakhir">Berakhir</option>
              </select>
            </div>
          </div>

          {/* Tabel Utama */}
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
                  {filteredInterns.map((intern) => (
                    <tr key={intern.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900 leading-snug">{intern.nama}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{intern.email}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">
                        {intern.kampus}
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {intern.periodeFormatted}
                      </td>
                      <td className="px-5 py-4 text-slate-700 font-medium">
                        {intern.status_kerja}
                      </td>
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
                      <td className="px-5 py-4 text-right whitespace-nowrap font-medium">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedIntern(intern);
                            setShowDetailModal(true);
                          }}
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
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Menampilkan {filteredInterns.length} peserta</span>
              <span>1 dari 1 halaman</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SKENARIO: AFTER F01 (PERSIS GAMBAR ATAS FIGMA)        */}
      {/* ======================================================== */}
      {activeScenario === 'after_f01' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Eyebrow Label */}
          <p className="text-[11px] font-bold tracking-wider text-[#245244] uppercase">
            AFTER F01 / SKENARIO BARU SAJA — PESERTA AKTIF 2 → 3
          </p>

          {/* Banner Sukses Nabila */}
          <div className="p-4 md:p-5 rounded-xl bg-[#eaf4ef] border border-[#a4d4bc] text-[#17362f]">
            <h4 className="font-bold text-sm md:text-base text-[#17362f]">
              {recentAddedIntern.nama} berhasil ditambahkan
            </h4>
            <p className="text-xs text-[#3b6357] mt-0.5">
              Akun {recentAddedIntern.email} terhubung dengan peserta {recentAddedIntern.nama}.
            </p>
          </div>

          {/* Tabel Peserta Aktif 3 Orang */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-white text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-4 font-semibold">Nama dan email</th>
                    <th className="px-5 py-4 font-semibold">Kampus</th>
                    <th className="px-5 py-4 font-semibold">Periode</th>
                    <th className="px-5 py-4 font-semibold">Status kerja</th>
                    <th className="px-5 py-4 font-semibold">Status periode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {/* Row 1: Raka */}
                  <tr className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      Raka Aditya · <span className="font-normal font-mono text-slate-600">raka@metro.demo</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">Universitas Negeri Yogyakarta</td>
                    <td className="px-5 py-4 text-slate-600">01 Agu–31 Des 2026</td>
                    <td className="px-5 py-4 text-slate-700">On-site</td>
                    <td className="px-5 py-4 italic text-[#245244] font-medium">Aktif</td>
                  </tr>

                  {/* Row 2: Salsa */}
                  <tr className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      Salsa Maharani · <span className="font-normal font-mono text-slate-600">salsa@metro.demo</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">Universitas Gadjah Mada</td>
                    <td className="px-5 py-4 text-slate-600">15 Sep 2026–15 Jan 2027</td>
                    <td className="px-5 py-4 text-slate-700">Remote</td>
                    <td className="px-5 py-4 italic text-[#245244] font-medium">Aktif</td>
                  </tr>

                  {/* Row 3: Nabila (Baru Ditambahkan) */}
                  <tr className="hover:bg-slate-50/70 transition bg-[#f9fbfb]">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {recentAddedIntern.nama} · <span className="font-normal font-mono text-slate-600">{recentAddedIntern.email}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{recentAddedIntern.kampus}</td>
                    <td className="px-5 py-4 text-slate-600">{recentAddedIntern.periodeFormatted}</td>
                    <td className="px-5 py-4 text-slate-700">{recentAddedIntern.status_kerja}</td>
                    <td className="px-5 py-4 italic text-[#245244] font-medium">Aktif</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel Akun Terhubung Sesuai Figma */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-white text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-4 font-semibold">Akun terhubung</th>
                    <th className="px-5 py-4 font-semibold">Email</th>
                    <th className="px-5 py-4 font-semibold">Role</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  <tr>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {recentAddedIntern.nama}
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-mono">
                      {recentAddedIntern.email}
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium">
                      Anak Magang
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium">
                      Aktif
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. SKENARIO: AFTER F02 (PERSIS GAMBAR BAWAH FIGMA)       */}
      {/* ======================================================== */}
      {activeScenario === 'after_f02' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Section Heading */}
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            AFTER F02 / peserta yang sama
          </h2>

          {/* Banner Sukses Raka */}
          <div className="p-4 md:p-5 rounded-xl bg-[#eaf4ef] border border-[#a4d4bc] text-[#17362f]">
            <h4 className="font-bold text-sm md:text-base text-[#17362f]">
              Data {recentUpdatedIntern.nama} tersimpan
            </h4>
            <p className="text-xs text-[#3b6357] mt-0.5">
              Perubahan diterapkan pada peserta yang sama. Akun {recentUpdatedIntern.email} tetap terhubung.
            </p>
          </div>

          {/* Ringkasan Data Peserta Sesuai Figma */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-1">
            <h3 className="font-semibold text-slate-900 text-sm md:text-base">
              {recentUpdatedIntern.nama} · {recentUpdatedIntern.kampus}
            </h3>
            <p className="text-xs text-slate-500">
              {recentUpdatedIntern.periodeFormatted} · {recentUpdatedIntern.status_kerja} · {recentUpdatedIntern.status_periode}
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL TAMBAH ANAK MAGANG (F01)                          */}
      {/* ======================================================== */}
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
                  placeholder="Universitas Negeri Yogyakarta"
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
                  placeholder="nabila@metro.demo"
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

      {/* ======================================================== */}
      {/* MODAL UBAH ANAK MAGANG (F02)                            */}
      {/* ======================================================== */}
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
    </div>
  );
};

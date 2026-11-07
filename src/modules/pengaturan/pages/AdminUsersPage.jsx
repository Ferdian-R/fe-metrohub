import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { coreService } from '../../core/services/coreService';
import { Plus, ChevronDown, ChevronRight, X, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

const ROLE_ANAK_MAGANG = 'Anak Magang';

const MODUL_LABEL = {
  core: 'Core (Dashboard, Pengguna, Lokasi)',
  magang: 'Manajemen Magang',
  keuangan: 'Manajemen Keuangan',
};

const inputClass =
  'w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f]';

const formatTanggal = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'Asia/Jakarta' }).format(d);
};

const errorMessage = (err, fallback) => err?.details?.[0]?.message || err?.message || fallback;

const Toggle = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={onChange}
    className={
      'w-11 h-6 flex items-center rounded-full p-1 transition shrink-0 ' +
      (disabled ? 'opacity-60 cursor-not-allowed ' : 'cursor-pointer ') +
      (checked ? 'bg-[#17362f]' : 'bg-slate-200')
    }
  >
    <div className={'bg-white w-4 h-4 rounded-full shadow-md transform transition ' + (checked ? 'translate-x-5' : '')} />
  </button>
);

const RadioCards = ({ name, options, value, onChange }) => (
  <div className="grid grid-cols-2 gap-3">
    {options.map((opt) => (
      <label
        key={opt.value}
        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
          value === opt.value
            ? 'border-[#17362f] bg-[#edf6f1] text-slate-900 font-semibold'
            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
        }`}
      >
        <input
          type="radio"
          name={name}
          checked={value === opt.value}
          onChange={() => onChange(opt.value)}
          className="accent-[#17362f]"
        />
        <span>{opt.label}</span>
      </label>
    ))}
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
    <div className="bg-white rounded-xl max-w-md w-full p-6 md:p-7 shadow-2xl relative border border-slate-100 max-h-[95vh] overflow-y-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 font-lexend">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const STATUS_OPTIONS = [
  { value: true, label: 'Aktif' },
  { value: false, label: 'Nonaktif' },
];

export const AdminUsersPage = () => {
  const { showToast } = useToast();
  const { user: currentUser, fetchUser } = useAuth();

  const [activeTab, setActiveTab] = useState('pengguna');

  // ===== Data pengguna & role =====
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError('');
      const [u, r] = await Promise.all([coreService.getUsers(), coreService.getRoles()]);
      setUsers(u?.data || []);
      setRoles(r?.data || []);
    } catch (err) {
      setLoadError(errorMessage(err, 'Gagal memuat data pengguna'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ===== Filter =====
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      const matchSearch = !q || u.nama.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = !roleFilter || String(u.role_id) === roleFilter;
      const matchStatus = !statusFilter || String(u.aktif) === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const hasDeactivatedIntern = users.some((u) => u.role === ROLE_ANAK_MAGANG && !u.aktif);

  // Akun Anak Magang dibuat lewat Data Anak Magang agar terhubung ke data peserta (MG-01)
  const assignableRoles = roles.filter((r) => r.nama !== ROLE_ANAK_MAGANG);
  const roleOptions = (list) => list.map((r) => ({ value: r.id, label: r.nama }));

  // ===== Tambah pengguna =====
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ nama: '', email: '', password: '', role_id: null, aktif: true });
  const [addError, setAddError] = useState('');
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setAddForm({ nama: '', email: '', password: '', role_id: assignableRoles[0]?.id ?? null, aktif: true });
    setAddError('');
    setIsAddModalOpen(true);
  };

  const handleSaveAddUser = async (e) => {
    e.preventDefault();
    if (!addForm.role_id) return setAddError('Pilih role terlebih dahulu.');
    if (addForm.password.length < 8) return setAddError('Password minimal 8 karakter.');
    try {
      setSaving(true);
      setAddError('');
      const res = await coreService.createUser({
        nama: addForm.nama.trim(),
        email: addForm.email.trim().toLowerCase(),
        password: addForm.password,
        role_id: addForm.role_id,
      });
      let created = res?.data;
      if (created && !addForm.aktif) {
        const s = await coreService.setUserStatus(created.id, false);
        created = s?.data || created;
      }
      setIsAddModalOpen(false);
      showToast({
        title: 'Pengguna ditambahkan',
        message: `${created.nama} · ${created.email} · ${created.role} · ${created.aktif ? 'Aktif' : 'Nonaktif'}`,
      });
      loadData();
    } catch (err) {
      setAddError(errorMessage(err, 'Gagal menambah pengguna'));
    } finally {
      setSaving(false);
    }
  };

  // ===== Ubah pengguna =====
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ nama: '', email: '', role_id: null, aktif: true, password: '' });
  const [editError, setEditError] = useState('');

  const handleOpenEdit = (u) => {
    setEditUser(u);
    setEditForm({ nama: u.nama, email: u.email, role_id: u.role_id, aktif: u.aktif, password: '' });
    setEditError('');
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    const patch = {};
    const nama = editForm.nama.trim();
    const email = editForm.email.trim().toLowerCase();
    if (nama !== editUser.nama) patch.nama = nama;
    if (email !== editUser.email) patch.email = email;
    if (editForm.role_id !== editUser.role_id) patch.role_id = editForm.role_id;
    if (editForm.password) {
      if (editForm.password.length < 8) return setEditError('Password baru minimal 8 karakter.');
      patch.password = editForm.password;
    }

    try {
      setSaving(true);
      setEditError('');
      if (Object.keys(patch).length) await coreService.updateUser(editUser.id, patch);
      if (editForm.aktif !== editUser.aktif) await coreService.setUserStatus(editUser.id, editForm.aktif);
      setEditUser(null);
      showToast({
        title: 'Perubahan pengguna tersimpan',
        message: patch.password
          ? `${nama} · password direset, pengguna perlu login ulang.`
          : `${nama} · ${email}`,
      });
      if (editUser.id === currentUser?.id) fetchUser();
      loadData();
    } catch (err) {
      setEditError(errorMessage(err, 'Gagal menyimpan perubahan'));
    } finally {
      setSaving(false);
    }
  };

  // ===== Nonaktifkan / aktifkan =====
  const [deactivateUser, setDeactivateUser] = useState(null);

  const changeStatus = async (u, aktif) => {
    try {
      setSaving(true);
      await coreService.setUserStatus(u.id, aktif);
      showToast(
        aktif
          ? { title: 'Akun diaktifkan kembali', message: `${u.nama} (${u.email}) kini dapat login kembali.` }
          : {
              title: `Akun ${u.nama.split(' ')[0]} dinonaktifkan`,
              message: `${u.email} · tidak dapat login. Riwayat data tetap tersimpan.`,
            }
      );
      setDeactivateUser(null);
      loadData();
    } catch (err) {
      showToast({ title: 'Gagal mengubah status', message: errorMessage(err, 'Terjadi kesalahan'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ===== Role & hak akses (CR-03) =====
  const [permissionCatalog, setPermissionCatalog] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [rolePermissions, setRolePermissions] = useState(new Set());
  const [savedRolePermissions, setSavedRolePermissions] = useState(new Set());
  const [permLoading, setPermLoading] = useState(false);
  const [permError, setPermError] = useState('');

  useEffect(() => {
    if (activeTab !== 'role_akses' || permissionCatalog.length) return;
    coreService
      .getAvailablePermissions()
      .then((res) => setPermissionCatalog(res?.data || []))
      .catch((err) => setPermError(errorMessage(err, 'Gagal memuat daftar hak akses')));
  }, [activeTab, permissionCatalog.length]);

  useEffect(() => {
    if (activeTab === 'role_akses' && !selectedRoleId && roles.length) setSelectedRoleId(roles[0].id);
  }, [activeTab, roles, selectedRoleId]);

  useEffect(() => {
    if (!selectedRoleId) return;
    let cancelled = false;
    setPermLoading(true);
    setPermError('');
    coreService
      .getRolePermissions(selectedRoleId)
      .then((res) => {
        if (cancelled) return;
        const set = new Set(res?.data?.permissions || []);
        setRolePermissions(set);
        setSavedRolePermissions(set);
      })
      .catch((err) => !cancelled && setPermError(errorMessage(err, 'Gagal memuat hak akses role')))
      .finally(() => !cancelled && setPermLoading(false));
    return () => {
      cancelled = true;
    };
  }, [selectedRoleId]);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const isDirty =
    rolePermissions.size !== savedRolePermissions.size ||
    [...rolePermissions].some((p) => !savedRolePermissions.has(p));

  const togglePermission = (code) => {
    setRolePermissions((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleSaveRolePermissions = async () => {
    if (!selectedRoleId) return;
    try {
      setSaving(true);
      setPermError('');
      const res = await coreService.setRolePermissions(selectedRoleId, [...rolePermissions]);
      const set = new Set(res?.data?.permissions || rolePermissions);
      setRolePermissions(set);
      setSavedRolePermissions(set);
      showToast({
        title: 'Perubahan hak akses disimpan',
        message: `Hak akses role ${selectedRole?.nama} berhasil diperbarui.`,
      });
      // Jika role sendiri yang diubah, muat ulang permission agar sidebar ikut berubah
      if (currentUser?.role === selectedRole?.nama) fetchUser();
    } catch (err) {
      setPermError(errorMessage(err, 'Gagal menyimpan hak akses'));
    } finally {
      setSaving(false);
    }
  };

  const selectClass =
    'w-full md:w-44 appearance-none bg-white border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-700 py-2.5 pl-3.5 pr-8 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#17362f] cursor-pointer';

  return (
    <div className="space-y-6 w-full pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight font-lexend">
            {activeTab === 'pengguna' ? 'Pengguna dan Role' : 'Role dan Hak Akses'}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1 font-source-sans">
            {activeTab === 'pengguna'
              ? 'Kelola akun, role, dan status akses.'
              : 'Atur modul yang boleh diakses setiap role.'}
          </p>
        </div>

        {activeTab === 'pengguna' && (
          <button
            type="button"
            onClick={openAdd}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#17362f] hover:bg-[#122b25] active:scale-[0.99] text-white text-xs md:text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {[
            ['pengguna', 'Pengguna'],
            ['role_akses', 'Role dan Hak Akses'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`pb-3 px-1 text-sm font-semibold border-b-2 transition cursor-pointer ${
                activeTab === key
                  ? 'border-[#17362f] text-[#17362f]'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {loadError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs md:text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{loadError}</span>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="px-3 py-1 bg-white border border-rose-300 rounded text-xs font-semibold cursor-pointer"
          >
            Coba lagi
          </button>
        </div>
      )}

      {activeTab === 'pengguna' ? (
        <>
          {/* Filter */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau email"
                className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#17362f] transition"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={selectClass}>
                  <option value="">Semua role</option>
                  {roles.map((r) => (
                    <option key={r.id} value={String(r.id)}>
                      {r.nama}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative flex-1 md:flex-none">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
                  <option value="">Semua status</option>
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Tabel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    {['NAMA DAN EMAIL', 'ROLE', 'STATUS AKUN', 'DIBUAT', 'AKSI'].map((h) => (
                      <th
                        key={h}
                        className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-source-sans whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-source-sans">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#17362f] mb-2" />
                        Memuat pengguna...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        Tidak ada pengguna yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((item) => {
                      const isSelf = item.id === currentUser?.id;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-4 px-6">
                            <p className="font-semibold text-slate-900 text-xs">
                              {item.nama}
                              {isSelf && <span className="ml-1.5 text-[10px] text-slate-400 font-medium">(Anda)</span>}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{item.email}</p>
                          </td>
                          <td className="py-4 px-6 text-slate-700 font-medium whitespace-nowrap">{item.role}</td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            {item.aktif ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e7f5ec] text-[#176a43] border border-[#c6e9d4]">
                                Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                Nonaktif · tidak dapat login
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-slate-600 whitespace-nowrap">{formatTanggal(item.created_at)}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="text-xs font-semibold text-[#17362f] hover:underline cursor-pointer"
                              >
                                Ubah
                              </button>
                              {item.aktif ? (
                                !isSelf && (
                                  <button
                                    type="button"
                                    onClick={() => setDeactivateUser(item)}
                                    className="text-xs font-medium text-slate-600 hover:text-rose-600 cursor-pointer"
                                  >
                                    Nonaktifkan
                                  </button>
                                )
                              ) : (
                                <button
                                  type="button"
                                  disabled={saving}
                                  onClick={() => changeStatus(item, true)}
                                  className="text-xs font-medium text-[#176a43] hover:underline cursor-pointer"
                                >
                                  Aktifkan
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {hasDeactivatedIntern && (
              <div className="p-4 px-6 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-400 font-source-sans">
                Periode magang dan bukti historis tidak dihapus.
              </div>
            )}
          </div>
        </>
      ) : (
        /* Tab Role dan Hak Akses */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-source-sans">Pilih role</h3>
            <div className="space-y-2">
              {roles.map((r) => {
                const active = r.id === selectedRoleId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRoleId(r.id)}
                    className={
                      'w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between cursor-pointer ' +
                      (active ? 'bg-[#edf6f1] border-[#cde6d7]' : 'bg-white border-transparent hover:bg-slate-50')
                    }
                  >
                    <div>
                      <p className={'text-sm font-bold ' + (active ? 'text-[#17362f]' : 'text-slate-800')}>{r.nama}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{r.jumlah_pengguna} pengguna</p>
                    </div>
                    <ChevronRight className={'w-4 h-4 ' + (active ? 'text-[#17362f]' : 'text-slate-400')} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-lexend">
                Hak akses {selectedRole?.nama || ''}
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-source-sans">
                Menu sidebar dan akses API mengikuti hak akses yang aktif di sini.
              </p>
            </div>

            {permLoading || !permissionCatalog.length ? (
              <div className="py-10 text-center text-slate-400">
                {permError ? (
                  <p className="text-xs text-rose-600">{permError}</p>
                ) : (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#17362f]" />
                )}
              </div>
            ) : (
              <div className="space-y-6 font-source-sans">
                {permissionCatalog.map((grp) => (
                  <div key={grp.modul}>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {MODUL_LABEL[grp.modul] || grp.modul}
                    </p>
                    <div className="divide-y divide-slate-100">
                      {grp.permissions.map((p) => (
                        <div key={p.code} className="py-3.5 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold text-slate-900">{p.deskripsi}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{p.code}</p>
                          </div>
                          <Toggle
                            checked={rolePermissions.has(p.code)}
                            onChange={() => togglePermission(p.code)}
                            disabled={saving}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {permError && permissionCatalog.length > 0 && (
              <p className="text-xs text-rose-600 font-medium">{permError}</p>
            )}

            <div className="bg-[#edf6f1] border border-[#cde6d7] rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-slate-700 font-source-sans">
              <ShieldCheck className="w-4 h-4 text-[#176a43] shrink-0" />
              <span>Perubahan berlaku langsung untuk semua pengguna dengan role ini.</span>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              {isDirty && (
                <button
                  type="button"
                  onClick={() => setRolePermissions(savedRolePermissions)}
                  className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Batalkan
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveRolePermissions}
                disabled={!isDirty || saving}
                className="px-5 py-2.5 bg-[#17362f] hover:bg-[#122b25] active:scale-[0.99] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Pengguna */}
      {isAddModalOpen && (
        <Modal title="Tambah Pengguna" onClose={() => setIsAddModalOpen(false)}>
          <form onSubmit={handleSaveAddUser} className="space-y-4 mt-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama lengkap</label>
              <input
                type="text"
                required
                maxLength={100}
                value={addForm.nama}
                onChange={(e) => setAddForm({ ...addForm, nama: e.target.value })}
                placeholder="Masukkan nama lengkap"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                maxLength={150}
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                placeholder="nama@perusahaan.com"
                className={inputClass}
              />
              <p className="text-[11px] text-slate-400 mt-1">Gunakan email unik untuk setiap akun.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password awal</label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                placeholder="Minimal 8 karakter"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role</label>
              <RadioCards
                name="add_role"
                options={roleOptions(assignableRoles)}
                value={addForm.role_id}
                onChange={(v) => setAddForm({ ...addForm, role_id: v })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status akun</label>
              <RadioCards
                name="add_status"
                options={STATUS_OPTIONS}
                value={addForm.aktif}
                onChange={(v) => setAddForm({ ...addForm, aktif: v })}
              />
            </div>

            <div className="bg-[#edf6f1] border border-[#cde6d7] rounded-xl p-3.5 text-xs text-slate-800 space-y-1">
              <p className="font-bold text-[#17362f]">Membuat akun Anak Magang baru?</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Gunakan{' '}
                <Link to="/admin/magang/interns" className="font-semibold underline">
                  Tambah Anak Magang
                </Link>{' '}
                agar akun terhubung dengan data peserta.
              </p>
            </div>

            {addError && <p className="text-xs text-rose-600 font-medium">{addError}</p>}

            <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-[#17362f] hover:bg-[#122b25] active:scale-[0.99] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-60"
              >
                {saving ? 'Menyimpan...' : 'Simpan Pengguna'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Ubah Pengguna */}
      {editUser && (
        <Modal title="Ubah Pengguna" onClose={() => setEditUser(null)}>
          <form onSubmit={handleSaveEditUser} className="space-y-4 mt-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama lengkap</label>
              <input
                type="text"
                required
                maxLength={100}
                value={editForm.nama}
                onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                maxLength={150}
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role</label>
              {editUser.role === ROLE_ANAK_MAGANG ? (
                <p className="text-xs text-slate-500">
                  Anak Magang · role akun anak magang dikelola lewat Data Anak Magang.
                </p>
              ) : (
                <RadioCards
                  name="edit_role"
                  options={roleOptions(assignableRoles)}
                  value={editForm.role_id}
                  onChange={(v) => setEditForm({ ...editForm, role_id: v })}
                />
              )}
            </div>
            {editUser.id !== currentUser?.id && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status akun</label>
                <RadioCards
                  name="edit_status"
                  options={STATUS_OPTIONS}
                  value={editForm.aktif}
                  onChange={(v) => setEditForm({ ...editForm, aktif: v })}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reset password <span className="font-normal text-slate-400">(opsional)</span>
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                placeholder="Kosongkan jika tidak diubah"
                className={inputClass}
              />
              <p className="text-[11px] text-slate-400 mt-1">Reset password akan mengakhiri semua sesi login pengguna.</p>
            </div>

            {editError && <p className="text-xs text-rose-600 font-medium">{editError}</p>}

            <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-[#17362f] hover:bg-[#122b25] active:scale-[0.99] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-60"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Nonaktifkan */}
      {deactivateUser && (
        <Modal title="Nonaktifkan Pengguna?" onClose={() => setDeactivateUser(null)}>
          <div className="space-y-5 mt-4">
            <div className="space-y-1 font-source-sans">
              <p className="text-base font-bold text-slate-900">{deactivateUser.nama}</p>
              <p className="text-xs text-slate-500">
                {deactivateUser.email} · {deactivateUser.role}
              </p>
              <p className="text-xs text-slate-600 font-medium pt-1">
                Status akun: <span className="font-semibold text-emerald-700">Aktif</span> →{' '}
                <span className="font-semibold text-rose-600">Nonaktif</span>
              </p>
            </div>

            <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl p-4 text-xs space-y-1 font-source-sans">
              <p className="font-bold text-amber-900">Pengguna tidak dapat login</p>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                Data magang, absensi, logbook, dan riwayat tugas tetap tersimpan. Akun tidak dihapus permanen.
              </p>
            </div>

            <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeactivateUser(null)}
                className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => changeStatus(deactivateUser, false)}
                className="px-5 py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] active:scale-[0.99] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-60"
              >
                {saving ? 'Memproses...' : 'Nonaktifkan'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminUsersPage;

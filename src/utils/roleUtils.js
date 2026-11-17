/**
 * Helper identifikasi peran (role) pengguna hasil autentikasi.
 * Mendukung deteksi berdasarkan nama role (string) dan/atau permission array dari backend.
 */
export const getRoleType = (user) => {
  if (!user) return 'unknown';

  const role = String(user.role || '').trim().toLowerCase();
  const perms = Array.isArray(user.permissions) ? user.permissions : [];

  // 1. Peserta Magang / Anak Magang
  if (
    role === 'anak magang' ||
    role === 'peserta magang' ||
    (perms.includes('magang:absen') && !perms.includes('magang:kelola'))
  ) {
    return 'intern';
  }

  // 2. Finance / Pengelola Keuangan (hanya modul Keuangan)
  if (
    role.includes('finance') ||
    role.includes('keuangan') ||
    (perms.some((p) => p.startsWith('keuangan:')) &&
      !perms.some((p) => p.startsWith('magang:kelola')) &&
      !perms.includes('core:dashboard'))
  ) {
    return 'finance';
  }

  // 3. Operasional Magang (hanya modul Magang)
  if (
    role.includes('operasional') ||
    (role.includes('magang') && !role.includes('anak') && !role.includes('peserta')) ||
    (perms.some((p) => p.startsWith('magang:kelola')) &&
      !perms.some((p) => p.startsWith('keuangan:')) &&
      !perms.includes('core:dashboard'))
  ) {
    return 'operasional_magang';
  }

  // 4. Super Admin / Admin (semua modul)
  return 'admin';
};

export const isInternRole = (name) => {
  const n = String(name || '').trim().toLowerCase();
  return n === 'anak magang' || n === 'peserta magang';
};

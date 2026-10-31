import api from '../../../api/client';

/**
 * Layanan komunikasi API untuk modul Keuangan.
 */
export const financeService = {
  /**
   * Mengambil daftar kategori keuangan.
   * @param {object} [params] - Parameter filter atau pagination.
   * @returns {Promise<object>} Respons API.
   */
  getCategories: (params) => api.get('/keuangan/categories', { params }),

  /**
   * Membuat kategori keuangan baru.
   * @param {object} data - Data kategori.
   * @returns {Promise<object>} Respons API.
   */
  createCategory: (data) => api.post('/keuangan/categories', data),

  /**
   * Memperbarui kategori keuangan.
   * @param {string | number} id - ID kategori.
   * @param {object} data - Data kategori yang diperbarui.
   * @returns {Promise<object>} Respons API.
   */
  updateCategory: (id, data) => api.put(`/keuangan/categories/${id}`, data),

  /**
   * Mengubah status aktif kategori keuangan.
   * @param {string | number} id - ID kategori.
   * @returns {Promise<object>} Respons API.
   */
  toggleCategoryStatus: (id) => api.patch(`/keuangan/categories/${id}/toggle`),

  /**
   * Menghapus kategori yang belum digunakan.
   * @param {string | number} id - ID kategori.
   * @returns {Promise<object>} Respons API.
   */
  deleteCategory: (id) => api.delete(`/keuangan/categories/${id}`),

  /**
   * Mengambil daftar transaksi dengan filter periode atau pencarian.
   * @param {object} [params] - Parameter filter atau pagination.
   * @returns {Promise<object>} Respons API.
   */
  getTransactions: (params) => api.get('/keuangan/transactions', { params }),

  /**
   * Membuat transaksi keuangan baru.
   * @param {object} data - Data transaksi.
   * @returns {Promise<object>} Respons API.
   */
  createTransaction: (data) => api.post('/keuangan/transactions', data),

  /**
   * Memperbarui transaksi keuangan.
   * @param {string | number} id - ID transaksi.
   * @param {object} data - Data transaksi yang diperbarui.
   * @returns {Promise<object>} Respons API.
   */
  updateTransaction: (id, data) => api.put(`/keuangan/transactions/${id}`, data),

  /**
   * Menghapus transaksi secara soft-delete.
   * @param {string | number} id - ID transaksi.
   * @returns {Promise<object>} Respons API.
   */
  softDeleteTransaction: (id) => api.delete(`/keuangan/transactions/${id}`),

  /**
   * Mengambil ringkasan bulanan dan rincian transaksi per kategori.
   * @param {object} [params] - Parameter bulan atau periode.
   * @returns {Promise<object>} Respons API.
   */
  getMonthlySummary: (params) => api.get('/keuangan/summary', { params }),
};

/**
 * Mengubah angka menjadi format mata uang Rupiah Indonesia.
 * @param {number | string} number - Nilai nominal.
 * @returns {string} Nilai dalam format, misalnya "Rp 1.500.000".
 */
export const formatRupiah = (number) => {
  if (number === null || number === undefined || number === '') return 'Rp 0';

  const numericValue = Number(number);
  if (!Number.isFinite(numericValue)) return 'Rp 0';

  const roundedValue = Math.round(numericValue);
  const formattedValue = new Intl.NumberFormat('id-ID').format(Math.abs(roundedValue));
  return roundedValue < 0 ? `-Rp ${formattedValue}` : `Rp ${formattedValue}`;
};

/**
 * Membersihkan string Rupiah menjadi angka integer.
 * Titik dianggap sebagai pemisah ribuan, sedangkan pecahan setelah koma diabaikan.
 * @param {string | number} value - Nilai Rupiah atau angka.
 * @returns {number} Nilai integer numerik.
 */
export const parseRupiah = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.round(value) : 0;
  }
  if (typeof value !== 'string' || !value.trim()) return 0;

  const trimmedValue = value.trim();
  const isNegative = trimmedValue.startsWith('-') || trimmedValue.includes('(');
  const integerPart = trimmedValue.split(',')[0];
  const digitsOnly = integerPart.replace(/[^0-9]/g, '');
  if (!digitsOnly) return 0;

  const parsedValue = Number.parseInt(digitsOnly, 10);
  return isNegative ? -parsedValue : parsedValue;
};

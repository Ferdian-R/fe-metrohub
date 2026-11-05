import api from '../../../api/client';

/**
 * Layanan komunikasi REST API backend untuk modul Keuangan MetroHub
 * Mengikuti spesifikasi PANDUAN-API.md:
 * - Kategori: GET /keuangan/categories?jenis=&aktif=
 * - Transaksi: GET /keuangan/transactions?bulan=YYYY-MM
 * - Catat Transaksi: POST /keuangan/transactions
 * - Ubah Transaksi: PATCH /keuangan/transactions/:id
 * - Hapus Transaksi: DELETE /keuangan/transactions/:id
 * - Ringkasan: GET /keuangan/summary?bulan=YYYY-MM
 */
export const financeService = {
  // Kategori Keuangan
  getCategories: (params) => api.get('/keuangan/categories', { params }),
  createCategory: (data) => api.post('/keuangan/categories', data),
  updateCategory: (id, data) => api.patch(`/keuangan/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/keuangan/categories/${id}`),

  // Transaksi Keuangan
  getTransactions: (params) => {
    // Sesuai PANDUAN-API.md query parameter menggunakan `bulan`
    const query = { ...params };
    if (query.periode && !query.bulan) {
      query.bulan = query.periode;
      delete query.periode;
    }
    return api.get('/keuangan/transactions', { params: query });
  },
  createTransaction: (data) => {
    // Konversi enum & tipe data sesuai PANDUAN-API.md
    return api.post('/keuangan/transactions', {
      tanggal: data.tanggal,
      jenis: String(data.jenis).toUpperCase(), // 'PEMASUKAN' | 'PENGELUARAN'
      category_id: Number(data.category_id),
      nominal: Number(data.nominal),
      keterangan: data.keterangan || undefined,
    });
  },
  updateTransaction: (id, data) => {
    const payload = {};
    if (data.tanggal) payload.tanggal = data.tanggal;
    if (data.jenis) payload.jenis = String(data.jenis).toUpperCase();
    if (data.category_id !== undefined) payload.category_id = Number(data.category_id);
    if (data.nominal !== undefined) payload.nominal = Number(data.nominal);
    if (data.keterangan !== undefined) payload.keterangan = data.keterangan;
    return api.patch(`/keuangan/transactions/${id}`, payload);
  },
  softDeleteTransaction: (id) => api.delete(`/keuangan/transactions/${id}`),

  // Ringkasan Keuangan Bulanan
  getMonthlySummary: (params) => {
    const query = { ...params };
    if (query.periode && !query.bulan) {
      query.bulan = query.periode;
      delete query.periode;
    }
    return api.get('/keuangan/summary', { params: query });
  },
};

/**
 * Format string Rupiah tanpa spasi setelah Rp (contoh: Rp5.000.000)
 */
export const formatRupiah = (number) => {
  if (number === null || number === undefined || number === '') return 'Rp0';

  const numericValue = Number(number);
  if (!Number.isFinite(numericValue)) return 'Rp0';

  const roundedValue = Math.round(numericValue);
  const formattedValue = new Intl.NumberFormat('id-ID').format(Math.abs(roundedValue));
  return roundedValue < 0 ? `-Rp${formattedValue}` : `Rp${formattedValue}`;
};

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

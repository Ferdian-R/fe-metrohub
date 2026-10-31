/**
 * @file mockFinance.js
 * @description Modul simulasi mock data dan helper kalkulasi keuangan Metro Software (MetroHub).
 * Menggunakan engine LocalStorage browser untuk persistensi data tanpa backend,
 * mendukung soft-delete (BR-09 & BR-10), proteksi kategori (F-16 & F-17),
 * serta kalkulasi saldo berjalan dan ringkasan bulanan (A-07).
 */

// ============================================================================
// 1. STORAGE KEYS & KONSTANTA
// ============================================================================

export const STORAGE_KEYS = {
  CATEGORIES: 'metrohub_finance_categories',
  TRANSACTIONS: 'metrohub_finance_transactions',
};

// ============================================================================
// 2. SEED DATA DEFAULT (INITIAL DATA)
// ============================================================================

/**
 * Data awal kategori keuangan (ku_categories)
 * Skema: { id: string | number, nama: string, jenis: 'pemasukan' | 'pengeluaran', aktif: boolean }
 * @type {Array<{ id: string, nama: string, jenis: 'pemasukan' | 'pengeluaran', aktif: boolean }>}
 */
export const DEFAULT_CATEGORIES = [
  // --- KATEGORI PEMASUKAN ---
  {
    id: 'cat-in-01',
    nama: 'Penjualan Jasa Pembuatan Web',
    jenis: 'pemasukan',
    aktif: true,
  },
  {
    id: 'cat-in-02',
    nama: 'Pelatihan & Workshop',
    jenis: 'pemasukan',
    aktif: true,
  },
  {
    id: 'cat-in-03',
    nama: 'Hibah & Sponsorship',
    jenis: 'pemasukan',
    aktif: false, // Nonaktif / Belum Terpakai
  },

  // --- KATEGORI PENGELUARAN ---
  {
    id: 'cat-out-01',
    nama: 'Operasional Kantor & Internet',
    jenis: 'pengeluaran',
    aktif: true,
  },
  {
    id: 'cat-out-02',
    nama: 'Honor & Transport Magang',
    jenis: 'pengeluaran',
    aktif: true,
  },
  {
    id: 'cat-out-03',
    nama: 'Pembelian Aset Hardware',
    jenis: 'pengeluaran',
    aktif: true, // Aktif namun memiliki 0 transaksi (pengujian F-16 & F-17)
  },
  {
    id: 'cat-out-04',
    nama: 'Langganan Lisensi Software',
    jenis: 'pengeluaran',
    aktif: false, // Nonaktif
  },
];

/**
 * Data awal transaksi keuangan (ku_transactions)
 * Skema: { id: string | number, tanggal: string (YYYY-MM-DD), jenis: 'pemasukan' | 'pengeluaran', category_id: string | number, nominal: number, keterangan: string, dibuat_oleh: string, deleted_at: string | null }
 *
 * Memenuhi:
 * - A-07: Akumulasi saldo bersih September 2026 tepat Rp1.000.000 (+Rp2.000.000 - Rp1.000.000).
 * - Periode Berjalan Oktober 2026: Pemasukan (+Rp5.000.000, +Rp2.500.000) & Pengeluaran (-Rp1.500.000, -Rp300.000, -Rp700.000).
 * - Soft Delete (BR-09 & BR-10): 1 transaksi berstatus soft-delete (deleted_at: '2026-10-15T10:00:00Z').
 * - BR-11: Nominal transaksi selalu bilangan bulat positif (> 0).
 * @type {Array<{ id: string, tanggal: string, jenis: 'pemasukan' | 'pengeluaran', category_id: string, nominal: number, keterangan: string, dibuat_oleh: string, deleted_at: string | null }>}
 */
export const DEFAULT_TRANSACTIONS = [
  // --- SALDO AWAL PERIODE (SEPTEMBER 2026, Akumulasi Bersih: Rp1.000.000) ---
  {
    id: 'tx-202609-001',
    tanggal: '2026-09-12',
    jenis: 'pemasukan',
    category_id: 'cat-in-01',
    nominal: 2000000,
    keterangan: 'DP Pembuatan Website Landing Page PT Mandiri Digital',
    dibuat_oleh: 'Administrator',
    deleted_at: null,
  },
  {
    id: 'tx-202609-002',
    tanggal: '2026-09-26',
    jenis: 'pengeluaran',
    category_id: 'cat-out-01',
    nominal: 1000000,
    keterangan: 'Pembayaran Tagihan Listrik & WiFi Kantor September 2026',
    dibuat_oleh: 'Administrator',
    deleted_at: null,
  },

  // --- PERIODE BERJALAN (OKTOBER 2026) ---
  {
    id: 'tx-202610-001',
    tanggal: '2026-10-03',
    jenis: 'pemasukan',
    category_id: 'cat-in-01',
    nominal: 5000000,
    keterangan: 'Pelunasan Proyek E-Commerce Toko Berkah Sentosa',
    dibuat_oleh: 'Administrator',
    deleted_at: null,
  },
  {
    id: 'tx-202610-002',
    tanggal: '2026-10-08',
    jenis: 'pengeluaran',
    category_id: 'cat-out-01',
    nominal: 1500000,
    keterangan: 'Sewa Working Space & Bandwidth Internet Fiber Oktober 2026',
    dibuat_oleh: 'Administrator',
    deleted_at: null,
  },
  {
    id: 'tx-202610-003',
    tanggal: '2026-10-14',
    jenis: 'pemasukan',
    category_id: 'cat-in-02',
    nominal: 2500000,
    keterangan: 'Honor Narasumber Workshop Frontend Architecture React',
    dibuat_oleh: 'Administrator',
    deleted_at: null,
  },
  {
    id: 'tx-202610-004',
    tanggal: '2026-10-15',
    jenis: 'pengeluaran',
    category_id: 'cat-out-01',
    nominal: 450000,
    keterangan: 'Pengeluaran Dibatalkan: Pembelian ATK Kantor',
    dibuat_oleh: 'Administrator',
    deleted_at: '2026-10-15T10:00:00Z', // Soft Delete: Harus diabaikan dari perhitungan saldo
  },
  {
    id: 'tx-202610-005',
    tanggal: '2026-10-19',
    jenis: 'pengeluaran',
    category_id: 'cat-out-02',
    nominal: 700000,
    keterangan: 'Uang Saku & Transport 2 Siswa Magang Gelombang 1',
    dibuat_oleh: 'Administrator',
    deleted_at: null,
  },
  {
    id: 'tx-202610-006',
    tanggal: '2026-10-24',
    jenis: 'pengeluaran',
    category_id: 'cat-out-01',
    nominal: 300000,
    keterangan: 'Pembelian Snack & Konsumsi Rapat Mingguan Evaluasi Proyek',
    dibuat_oleh: 'Administrator',
    deleted_at: null,
  },
];

// ============================================================================
// 3. HELPER FUNCTIONS KALKULASI & FORMATTING
// ============================================================================

/**
 * Mengubah nilai numerik menjadi format mata uang Rupiah Indonesia (contoh: "Rp 1.500.000").
 * Menangani angka positif, nol, dan negatif secara rapi.
 *
 * @param {number | string} number - Nilai nominal
 * @returns {string} String terformat Rupiah
 */
export const formatRupiah = (number) => {
  if (number === null || number === undefined || number === '') return 'Rp 0';
  const num = Math.round(Number(number));
  if (isNaN(num)) return 'Rp 0';

  const isNegative = num < 0;
  const absValue = Math.abs(num);
  const formatted = new Intl.NumberFormat('id-ID').format(absValue);
  return isNegative ? `-Rp ${formatted}` : `Rp ${formatted}`;
};

/**
 * Membersihkan string format Rupiah atau string angka menjadi tipe data number murni.
 * Mendukung input dengan prefix "Rp", spasi, tanda pemisah titik, desimal koma, atau tanda minus.
 *
 * @param {string | number} value - Input string atau number
 * @returns {number} Nilai integer numerik murni
 */
export const parseRupiah = (value) => {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : Math.round(value);
  }
  if (!value || typeof value !== 'string') return 0;

  const trimmed = value.trim();
  if (!trimmed) return 0;

  const isNegative = trimmed.startsWith('-') || trimmed.includes('(');
  // Hapus desimal setelah koma jika ada (contoh: Rp 1.500.000,00 -> Rp 1.500.000)
  const integerPart = trimmed.split(',')[0];
  const digitsOnly = integerPart.replace(/[^0-9]/g, '');

  if (!digitsOnly) return 0;
  const parsed = parseInt(digitsOnly, 10);
  return isNegative ? -parsed : parsed;
};

/**
 * Menghitung jumlah transaksi AKTIF (deleted_at === null) yang menggunakan category_id tertentu.
 * Digunakan untuk validasi proteksi penghapusan dan penonaktifan kategori (F-16 & F-17).
 *
 * @param {string | number} categoryId - ID kategori yang dicek
 * @param {Array<object>} transactions - Daftar transaksi
 * @returns {number} Jumlah transaksi aktif yang berelasi
 */
export const getCategoryUsageCount = (categoryId, transactions = []) => {
  if (categoryId === undefined || categoryId === null || !Array.isArray(transactions)) {
    return 0;
  }
  const targetId = String(categoryId);
  return transactions.filter(
    (tx) => tx && tx.deleted_at === null && String(tx.category_id) === targetId
  ).length;
};

/**
 * Menghitung saldo bersih (Pemasukan - Pengeluaran) seluruh transaksi AKTIF
 * yang terjadi sebelum tanggal 1 pada targetYearMonth (contoh: sebelum '2026-10-01').
 * Sesuai aturan bisnis A-07.
 *
 * @param {Array<object>} transactions - Daftar seluruh transaksi
 * @param {string | Date} targetYearMonth - Periode target (contoh: '2026-10' atau '2026-10-01')
 * @returns {number} Saldo bersih sebelum periode berjalan
 */
export const getPriorBalance = (transactions = [], targetYearMonth) => {
  if (!Array.isArray(transactions) || !targetYearMonth) return 0;

  let cutoffDate;
  if (typeof targetYearMonth === 'string') {
    const parts = targetYearMonth.split('-');
    const year = parts[0];
    const month = (parts[1] || '01').padStart(2, '0');
    cutoffDate = `${year}-${month}-01`;
  } else if (targetYearMonth instanceof Date) {
    const y = targetYearMonth.getFullYear();
    const m = String(targetYearMonth.getMonth() + 1).padStart(2, '0');
    cutoffDate = `${y}-${m}-01`;
  } else {
    cutoffDate = String(targetYearMonth).slice(0, 7) + '-01';
  }

  return transactions
    .filter((tx) => tx && tx.deleted_at === null && tx.tanggal && tx.tanggal < cutoffDate)
    .reduce((accumulator, tx) => {
      const nominal = Number(tx.nominal) || 0;
      return tx.jenis === 'pemasukan' ? accumulator + nominal : accumulator - nominal;
    }, 0);
};

/**
 * Menyaring transaksi aktif (deleted_at === null), mengurutkannya berdasarkan tanggal secara kronologis (ASC),
 * dan mengkalkulasikan saldo berjalan (running balance) per baris kumulatif.
 * Sesuai aturan bisnis BR-09, BR-10, dan A-07.
 *
 * Rumus:
 * Saldo Baris N = Saldo Baris (N-1) + (jenis === 'pemasukan' ? nominal : -nominal)
 *
 * @param {Array<object>} transactions - Array transaksi (bisa seluruh transaksi atau transaksi periode tertentu)
 * @param {number} [initialPriorBalance=0] - Saldo awal sebelum transaksi baris pertama dieksekusi
 * @returns {Array<object>} Array transaksi lengkap dengan properti `saldo_berjalan`
 */
export const calculateRunningBalances = (transactions = [], initialPriorBalance = 0) => {
  if (!Array.isArray(transactions)) return [];

  // Filter transaksi aktif & buat shallow copy untuk sorting
  const activeTransactions = transactions
    .filter((tx) => tx && tx.deleted_at === null)
    .slice()
    .sort((a, b) => {
      const dateA = a.tanggal || '';
      const dateB = b.tanggal || '';
      const dateComp = dateA.localeCompare(dateB);
      if (dateComp !== 0) return dateComp;
      // Jika tanggal sama, urutkan berdasarkan ID ASC
      return String(a.id || '').localeCompare(String(b.id || ''), undefined, { numeric: true });
    });

  let currentBalance = Number(initialPriorBalance) || 0;

  return activeTransactions.map((tx) => {
    const nominal = Number(tx.nominal) || 0;
    const delta = tx.jenis === 'pemasukan' ? nominal : -nominal;
    currentBalance += delta;
    return {
      ...tx,
      saldo_berjalan: currentBalance,
    };
  });
};

/**
 * Menghitung ringkasan keuangan bulanan secara komprehensif untuk periode tertentu:
 * - totalPemasukan: Total nominal pemasukan bulan berjalan
 * - totalPengeluaran: Total nominal pengeluaran bulan berjalan
 * - selisihPeriode: totalPemasukan - totalPengeluaran
 * - saldoAwal: Saldo sebelum tanggal 1 bulan berjalan
 * - saldoKumulatif: saldoAwal + selisihPeriode
 * - categoryBreakdown: Rincian total & persentase per kategori per jenis
 *
 * @param {Array<object>} transactions - Seluruh daftar transaksi
 * @param {Array<object>} categories - Seluruh daftar kategori
 * @param {string} targetYearMonth - Periode dalam format 'YYYY-MM' (contoh: '2026-10')
 * @returns {object} Objek kalkulasi ringkasan bulanan
 */
export const getMonthlySummary = (transactions = [], categories = [], targetYearMonth) => {
  const normalizedMonth = typeof targetYearMonth === 'string'
    ? targetYearMonth.slice(0, 7)
    : '2026-10';

  // 1. Hitung Saldo Awal Sebelum Bulan Berjalan
  const saldoAwal = getPriorBalance(transactions, normalizedMonth);

  // 2. Filter Transaksi Aktif Pada Bulan Berjalan
  const monthTransactions = (transactions || []).filter(
    (tx) => tx && tx.deleted_at === null && tx.tanggal && tx.tanggal.startsWith(normalizedMonth)
  );

  let totalPemasukan = 0;
  let totalPengeluaran = 0;
  const categoryAccumulator = {};

  monthTransactions.forEach((tx) => {
    const nominal = Number(tx.nominal) || 0;
    const catId = String(tx.category_id);

    if (tx.jenis === 'pemasukan') {
      totalPemasukan += nominal;
    } else if (tx.jenis === 'pengeluaran') {
      totalPengeluaran += nominal;
    }

    if (!categoryAccumulator[catId]) {
      categoryAccumulator[catId] = { nominal: 0, count: 0 };
    }
    categoryAccumulator[catId].nominal += nominal;
    categoryAccumulator[catId].count += 1;
  });

  const selisihPeriode = totalPemasukan - totalPengeluaran;
  const saldoKumulatif = saldoAwal + selisihPeriode;

  // 3. Petakan Breakdown Per Kategori
  const categoryMap = new Map();
  (categories || []).forEach((c) => {
    if (c && c.id !== undefined) {
      categoryMap.set(String(c.id), c);
    }
  });

  // Susun breakdown pemasukan & pengeluaran
  const buildBreakdownForType = (jenisTarget, grandTotal) => {
    const relevantCategories = (categories || []).filter((c) => c && c.jenis === jenisTarget);

    const items = relevantCategories.map((cat) => {
      const catId = String(cat.id);
      const stats = categoryAccumulator[catId] || { nominal: 0, count: 0 };
      const percentage = grandTotal > 0
        ? Math.round((stats.nominal / grandTotal) * 10000) / 100
        : 0;

      return {
        categoryId: cat.id,
        nama: cat.nama,
        jenis: cat.jenis,
        aktif: cat.aktif,
        nominal: stats.nominal,
        count: stats.count,
        percentage,
      };
    });

    // Periksa jika ada transaksi dengan kategori yang belum terdaftar di list kategori
    Object.keys(categoryAccumulator).forEach((catId) => {
      const alreadyIncluded = items.some((it) => String(it.categoryId) === catId);
      if (!alreadyIncluded) {
        // Cek jenis transaksi yang bersangkutan
        const sampleTx = monthTransactions.find((tx) => String(tx.category_id) === catId);
        if (sampleTx && sampleTx.jenis === jenisTarget) {
          const stats = categoryAccumulator[catId];
          const percentage = grandTotal > 0
            ? Math.round((stats.nominal / grandTotal) * 10000) / 100
            : 0;

          items.push({
            categoryId: catId,
            nama: 'Kategori Tak Terdaftar',
            jenis: jenisTarget,
            aktif: false,
            nominal: stats.nominal,
            count: stats.count,
            percentage,
          });
        }
      }
    });

    // Urutkan nominal terbesar ke terkecil
    return items.sort((a, b) => b.nominal - a.nominal);
  };

  const breakdownPemasukan = buildBreakdownForType('pemasukan', totalPemasukan);
  const breakdownPengeluaran = buildBreakdownForType('pengeluaran', totalPengeluaran);

  return {
    periode: normalizedMonth,
    saldoAwal,
    totalPemasukan,
    totalPengeluaran,
    selisihPeriode,
    saldoKumulatif,
    totalTransaksi: monthTransactions.length,
    categoryBreakdown: {
      pemasukan: breakdownPemasukan,
      pengeluaran: breakdownPengeluaran,
    },
  };
};

// ============================================================================
// 4. LOCAL STORAGE ENGINE
// ============================================================================

/**
 * Memeriksa ketersediaan API window.localStorage
 * @returns {boolean}
 */
const hasLocalStorage = () => {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
};

/**
 * Menyimpan data kategori ke LocalStorage
 * @param {Array<object>} categories - Array kategori
 */
export const saveCategories = (categories) => {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('[mockFinance] Gagal menyimpan kategori ke LocalStorage:', err);
  }
};

/**
 * Menyimpan data transaksi ke LocalStorage
 * @param {Array<object>} transactions - Array transaksi
 */
export const saveTransactions = (transactions) => {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (err) {
    console.error('[mockFinance] Gagal menyimpan transaksi ke LocalStorage:', err);
  }
};

/**
 * Memuat data kategori dan transaksi dari LocalStorage.
 * Jika LocalStorage masih kosong atau belum terinisialisasi, fungsi ini otomatis mengisi dengan data default (seed data).
 *
 * @returns {{ categories: Array<object>, transactions: Array<object> }}
 */
export const loadFinanceData = () => {
  if (!hasLocalStorage()) {
    return {
      categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
      transactions: JSON.parse(JSON.stringify(DEFAULT_TRANSACTIONS)),
    };
  }

  let categories = null;
  let transactions = null;

  try {
    const rawCategories = window.localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (rawCategories) {
      categories = JSON.parse(rawCategories);
    }
  } catch (err) {
    console.warn('[mockFinance] Parsing kategori dari LocalStorage gagal, menggunakan default:', err);
  }

  try {
    const rawTransactions = window.localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (rawTransactions) {
      transactions = JSON.parse(rawTransactions);
    }
  } catch (err) {
    console.warn('[mockFinance] Parsing transaksi dari LocalStorage gagal, menggunakan default:', err);
  }

  // Jika belum ada data sama sekali di LocalStorage, inisialisasi dengan DEFAULT
  let needSave = false;

  if (!Array.isArray(categories) || categories.length === 0) {
    categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
    needSave = true;
  }

  if (!Array.isArray(transactions) || transactions.length === 0) {
    transactions = JSON.parse(JSON.stringify(DEFAULT_TRANSACTIONS));
    needSave = true;
  }

  if (needSave) {
    saveCategories(categories);
    saveTransactions(transactions);
  }

  return { categories, transactions };
};

/**
 * Me-reset data di LocalStorage kembali ke nilai default (seed data awal).
 * Mengembalikan objek data segar.
 *
 * @returns {{ categories: Array<object>, transactions: Array<object> }}
 */
export const resetToDefaultData = () => {
  const freshCategories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
  const freshTransactions = JSON.parse(JSON.stringify(DEFAULT_TRANSACTIONS));

  saveCategories(freshCategories);
  saveTransactions(freshTransactions);

  return {
    categories: freshCategories,
    transactions: freshTransactions,
  };
};

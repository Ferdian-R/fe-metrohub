import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Pastikan cookie JWT terkirim otomatis
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorData = error.response?.data || {
      success: false,
      message: error.message || 'Terjadi kesalahan pada jaringan',
    };
    return Promise.reject(errorData);
  }
);

export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Pastikan cookie JWT terkirim otomatis
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Jika mengirim FormData (misal: upload foto absensi), biarkan browser/Axios
  // mengisi Content-Type secara otomatis beserta multipart boundary-nya.
  if (config.data instanceof FormData) {
    if (config.headers) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
        config.headers.delete('content-type');
      }
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
  }
  return config;
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

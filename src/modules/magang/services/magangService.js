import api from '../../../api/client';

export const magangService = {
  // Interns
  getInternMe: () => api.get('/magang/interns/me'),
  getAllInterns: (params) => api.get('/magang/interns', { params }),
  createIntern: (data) => api.post('/magang/interns', data),
  updateStatusKerja: (id, status_kerja) =>
    api.patch(`/magang/interns/${id}/status-kerja`, { status_kerja }),

  // Attendances
  getTodayAttendance: () => api.get('/magang/attendances/today'),
  checkIn: (formData) =>
    api.post('/magang/attendances/checkin', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  checkOut: (formData) =>
    api.post('/magang/attendances/checkout', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyAttendances: (params) => api.get('/magang/attendances/me', { params }),
  getAllAttendances: (params) => api.get('/magang/attendances', { params }),
  correctAttendance: (id, data) => api.patch(`/magang/attendances/${id}`, data),

  // Logbooks
  getTodayLogbook: () => api.get('/magang/logbooks/today'),
  saveTodayLogbook: (isi) => api.put('/magang/logbooks/today', { isi }),
  getMyLogbooks: () => api.get('/magang/logbooks/me'),
  getAllLogbooks: (params) => api.get('/magang/logbooks', { params }),

  // Tasks
  getMyTasks: () => api.get('/magang/tasks/me'),
  updateTaskProgress: (id, data) => api.patch(`/magang/tasks/${id}/progress`, data),
  getAllTasks: (params) => api.get('/magang/tasks', { params }),
  createTask: (data) => api.post('/magang/tasks', data),
  deleteTask: (id) => api.delete(`/magang/tasks/${id}`),
};

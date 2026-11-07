import api from '../../../api/client';

// Endpoint milik Core: dashboard, pengguna, role & hak akses, lokasi kantor, menu, password.
export const coreService = {
  // CR-04
  getDashboard: () => api.get('/dashboard'),

  // CR-03: sidebar sesuai permission
  getMenu: () => api.get('/menu'),

  // CR-02
  getUsers: (params) => api.get('/users', { params }),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.patch(`/users/${id}`, data),
  setUserStatus: (id, aktif) => api.patch(`/users/${id}/status`, { aktif }),

  // CR-03
  getRoles: () => api.get('/roles'),
  getAvailablePermissions: () => api.get('/roles/permissions'),
  getRolePermissions: (id) => api.get(`/roles/${id}/permissions`),
  setRolePermissions: (id, permissions) => api.put(`/roles/${id}/permissions`, { permissions }),

  // CR-05
  getOfficeSettings: () => api.get('/office-settings'),
  updateOfficeSettings: (data) => api.put('/office-settings', data),

  // Profil
  changePassword: (password_lama, password_baru) =>
    api.patch('/auth/password', { password_lama, password_baru }),
};

export default coreService;

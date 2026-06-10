import api from './api';

export const adminService = {
  getUsers: async (role?: string) => {
    const response = await api.get('/admin/users', { params: role ? { role } : {} });
    return response.data;
  },

  getUserById: async (id: number) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id: number, userData: any) => {
    console.log('AdminService: Updating user', id, 'with data:', userData);
    const response = await api.put(`/admin/users/${id}`, userData);
    console.log('AdminService: Update response:', response.data);
    return response.data;
  },

  updateUserRole: async (id: number, role: string) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  createInstructor: async (instructorData: any) => {
    const response = await api.post('/admin/instructors/create', instructorData);
    return response.data;
  },
};

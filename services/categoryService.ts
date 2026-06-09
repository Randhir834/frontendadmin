import api from './api';

export const categoryService = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getCategoryById: async (id: number) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: { name: string; description?: string }) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  updateCategory: async (id: number, data: { name?: string; description?: string }) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

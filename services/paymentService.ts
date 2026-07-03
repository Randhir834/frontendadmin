import api from './api';

export const paymentService = {
  // Get all payments (Admin only)
  getAllPayments: async () => {
    const response = await api.get('/payments/admin/all');
    return response.data;
  },

  // Get payment statistics (Admin only)
  getPaymentStats: async () => {
    const response = await api.get('/payments/admin/stats');
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (id: number) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },
};

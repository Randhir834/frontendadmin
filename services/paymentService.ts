import api from './api';

export const paymentService = {
  createPayment: async (data: { enrollment_id: number; amount: number; payment_method: string }) => {
    const response = await api.post('/payments', data);
    return response.data;
  },

  getPayments: async () => {
    const response = await api.get('/payments');
    return response.data;
  },

  getPaymentById: async (id: number) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },
};

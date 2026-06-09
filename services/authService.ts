import api from './api';

export type PortalRole = 'student' | 'instructor' | 'admin';

export const authService = {
  register: async (data: { name: string; email: string; password: string; role: PortalRole }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { 
    email?: string; 
    phone?: string; 
    identifier?: string; 
    password: string; 
    expectedRole: PortalRole 
  }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  loginWithPhone: async (data: { phone: string; password: string; expectedRole: PortalRole }) => {
    const response = await api.post('/auth/login', { identifier: data.phone, password: data.password, expectedRole: data.expectedRole });
    return response.data;
  },

  loginWithEmail: async (data: { email: string; password: string; expectedRole: PortalRole }) => {
    const response = await api.post('/auth/login', { identifier: data.email, password: data.password, expectedRole: data.expectedRole });
    return response.data;
  },

  refreshToken: async (token: string) => {
    const response = await api.post('/auth/refresh-token', { token });
    return response.data;
  },

  forgotPassword: async (data: { 
    email?: string; 
    phone?: string; 
    identifier?: string; 
    expectedRole: PortalRole; 
    clientOrigin: string 
  }) => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: { token: string; password: string }) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
};

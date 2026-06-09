import api from './api';

export const settingsService = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  getSetting: async (key: string) => {
    const response = await api.get(`/settings/${key}`);
    return response.data;
  },

  updateSetting: async (key: string, value: string) => {
    const response = await api.put(`/settings/${key}`, { value });
    return response.data;
  },
};

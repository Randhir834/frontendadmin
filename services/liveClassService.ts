import api from './api';

export const liveClassService = {
  getLiveClasses: async (filters?: { 
    course_id?: number; 
    instructor_id?: number;
    status?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    const response = await api.get('/live-classes', { params: filters || {} });
    return response.data;
  },

  getLiveClassById: async (id: number) => {
    const response = await api.get(`/live-classes/${id}`);
    return response.data;
  },

  createLiveClass: async (data: { course_id: number; title: string; description?: string; meet_link: string; scheduled_at: string; duration_minutes?: number }) => {
    const response = await api.post('/live-classes', data);
    return response.data;
  },

  updateLiveClass: async (id: number, data: { title?: string; description?: string; meet_link?: string; scheduled_at?: string; duration_minutes?: number; status?: string }) => {
    const response = await api.put(`/live-classes/${id}`, data);
    return response.data;
  },

  deleteLiveClass: async (id: number) => {
    const response = await api.delete(`/live-classes/${id}`);
    return response.data;
  },

  getFilterOptions: async () => {
    const response = await api.get('/live-classes/filters/options');
    return response.data;
  },
};

import api from './api';

export const liveClassService = {
  getLiveClasses: async (filters?: { course_id?: number; instructor_id?: number }) => {
    const params: any = {};
    if (filters?.course_id) params.course_id = filters.course_id;
    if (filters?.instructor_id) params.instructor_id = filters.instructor_id;
    
    const response = await api.get('/live-classes', { params });
    return response.data;
  },

  getFilterOptions: async () => {
    const response = await api.get('/live-classes/filter-options');
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
};

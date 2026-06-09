import api from './api';

export const progressService = {
  updateProgress: async (data: { lesson_id: number; status: string }) => {
    const response = await api.post('/progress', data);
    return response.data;
  },

  getCourseProgress: async (courseId: number) => {
    const response = await api.get(`/progress/course/${courseId}`);
    return response.data;
  },
};

import api from './api';

export const enrollmentService = {
  enrollCourse: async (courseId: number) => {
    const response = await api.post('/enrollments', { course_id: courseId });
    return response.data;
  },

  getEnrollments: async () => {
    const response = await api.get('/enrollments');
    return response.data;
  },

  getEnrollmentById: async (id: number) => {
    const response = await api.get(`/enrollments/${id}`);
    return response.data;
  },

  checkEnrollment: async (courseId: number) => {
    const response = await api.get(`/enrollments/check/${courseId}`);
    return response.data;
  },

  getAllEnrollments: async () => {
    const response = await api.get('/enrollments/all');
    return response.data;
  },
};

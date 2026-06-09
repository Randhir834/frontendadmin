import api from './api';

export const assignmentService = {
  getAssignments: async (courseId: number) => {
    const response = await api.get('/assignments', { params: { course_id: courseId } });
    return response.data;
  },

  getAssignmentById: async (id: number) => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },

  createAssignment: async (data: { course_id: number; title: string; description?: string; due_date?: string; max_score?: number }) => {
    const response = await api.post('/assignments', data);
    return response.data;
  },

  updateAssignment: async (id: number, data: { title?: string; description?: string; due_date?: string; max_score?: number }) => {
    const response = await api.put(`/assignments/${id}`, data);
    return response.data;
  },

  deleteAssignment: async (id: number) => {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
  },

  submitAssignment: async (assignmentId: number, data: FormData) => {
    const response = await api.post(`/assignments/${assignmentId}/submit`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getSubmissions: async (assignmentId: number) => {
    const response = await api.get(`/assignments/${assignmentId}/submissions`);
    return response.data;
  },

  getMySubmissions: async () => {
    const response = await api.get('/assignments/my-submissions');
    return response.data;
  },

  gradeSubmission: async (assignmentId: number, submissionId: number, data: { score: number; status: string }) => {
    const response = await api.put(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, data);
    return response.data;
  },
};

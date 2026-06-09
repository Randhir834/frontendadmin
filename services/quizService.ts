import api from './api';

export const quizService = {
  getQuizzes: async (courseId: number) => {
    const response = await api.get('/quizzes', { params: { course_id: courseId } });
    return response.data;
  },

  getQuizById: async (id: number) => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  createQuiz: async (data: { course_id: number; title: string; description?: string; time_limit_minutes?: number; passing_score?: number }) => {
    const response = await api.post('/quizzes', data);
    return response.data;
  },

  updateQuiz: async (id: number, data: { title?: string; description?: string; time_limit_minutes?: number; passing_score?: number; is_published?: boolean }) => {
    const response = await api.put(`/quizzes/${id}`, data);
    return response.data;
  },

  deleteQuiz: async (id: number) => {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
  },

  addQuestion: async (quizId: number, data: { question_text: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_option: string; marks?: number; sort_order?: number }) => {
    const response = await api.post(`/quizzes/${quizId}/questions`, data);
    return response.data;
  },

  deleteQuestion: async (quizId: number, questionId: number) => {
    const response = await api.delete(`/quizzes/${quizId}/questions/${questionId}`);
    return response.data;
  },

  startAttempt: async (quizId: number) => {
    const response = await api.post(`/quizzes/${quizId}/attempt`);
    return response.data;
  },

  submitAnswer: async (attemptId: number, data: { question_id: number; selected_option: string; is_correct: boolean }) => {
    const response = await api.post(`/quizzes/attempts/${attemptId}/answer`, data);
    return response.data;
  },

  completeAttempt: async (attemptId: number, data: { score: number; total_marks: number }) => {
    const response = await api.post(`/quizzes/attempts/${attemptId}/complete`, data);
    return response.data;
  },

  getMyAttempts: async () => {
    const response = await api.get('/quizzes/my-attempts');
    return response.data;
  },

  getAttemptDetails: async (attemptId: number) => {
    const response = await api.get(`/quizzes/attempts/${attemptId}`);
    return response.data;
  },
};

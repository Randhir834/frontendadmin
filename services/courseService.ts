import api from './api';

export interface CreateCourseData {
  title: string;
  description?: string;
  price?: number;
  thumbnail_url?: string;
  category_id?: number | null;
  status?: 'draft' | 'published' | 'archived';
  duration_value?: number;
  duration_unit?: 'days' | 'weeks' | 'months';
  level?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  what_you_learn?: string;
  requirements?: string;
  instructor_ids?: number[];
}

export interface UpdateCourseData extends Partial<CreateCourseData> {}

export const courseService = {
  getCourses: async (filters?: { 
    status?: string; 
    category_id?: string; 
    search?: string; 
    level?: string; 
    price_range?: string; 
    instructor_id?: string; 
    sort_by?: string; 
    sort_order?: string; 
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/courses${query}`);
    return response.data;
  },

  getPublishedCourses: async (filters?: { 
    search?: string; 
    category_id?: string; 
    level?: string; 
    price_range?: string; 
    sort_by?: string; 
    sort_order?: string; 
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/courses/published${query}`);
    return response.data;
  },

  getCourseById: async (id: number) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  getInstructorCourses: async (instructorId: number) => {
    const response = await api.get(`/courses/instructor/${instructorId}`);
    return response.data;
  },

  createCourse: async (data: CreateCourseData) => {
    const response = await api.post('/courses', data);
    return response.data;
  },

  updateCourse: async (id: number, data: UpdateCourseData) => {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  },

  deleteCourse: async (id: number) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  removeInstructor: async (courseId: number, instructorId: number) => {
    const response = await api.delete(`/courses/${courseId}/instructors/${instructorId}`);
    return response.data;
  },

  getEnrollmentCount: async (courseId: number) => {
    const response = await api.get(`/courses/${courseId}/enrollment-count`);
    return response.data;
  },

  // Get course enrollments (students)
  getCourseEnrollments: async (courseId: number, filters?: {
    status?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/enrollments/course/${courseId}${query}`);
    return response.data;
  },

  // Get course enrollment statistics
  getCourseEnrollmentStats: async (courseId: number) => {
    const response = await api.get(`/enrollments/course/${courseId}/stats`);
    return response.data;
  },

  // Get course materials
  getCourseMaterials: async (courseId: number) => {
    const response = await api.get(`/course-materials/courses/${courseId}/materials`);
    return response.data;
  },

  // Get course sections with lessons
  getCourseSections: async (courseId: number) => {
    const response = await api.get(`/sections/course/${courseId}`);
    return response.data;
  },
};

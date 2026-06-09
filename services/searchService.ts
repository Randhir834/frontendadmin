import api from './api';

export interface SearchResults {
  courses: any[];
  lessons: any[];
  sections: any[];
  assignments: any[];
  quizzes: any[];
  liveClasses: any[];
  categories: any[];
  users: any[];
  enrollments: any[];
}

export interface SearchResponse {
  success: boolean;
  query: string;
  results: SearchResults;
  totalResults: number;
  userRole?: string;
}

export const searchService = {
  /**
   * Universal search across all entities with context-aware prioritization
   */
  globalSearch: async (query: string, contextType?: string | null, contextId?: number | null): Promise<SearchResponse> => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (contextType) params.append('context', contextType);
    if (contextId) params.append('contextId', String(contextId));
    
    const response = await api.get(`/search?${params.toString()}`);
    return response.data;
  },

  /**
   * Search courses with filters
   */
  searchCourses: async (query: string, filters?: { status?: string; category_id?: number }): Promise<any> => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category_id) params.append('category_id', String(filters.category_id));
    
    const response = await api.get(`/search/courses?${params.toString()}`);
    return response.data;
  },
};

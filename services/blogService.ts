import api from './api';
import type { Blog, BlogFormData } from '@/types';

interface GetBlogsParams {
  status?: 'draft' | 'published';
  search?: string;
  page?: number;
  limit?: number;
}

interface BlogsResponse {
  success: boolean;
  blogs: Blog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface BlogResponse {
  success: boolean;
  blog: Blog;
  message?: string;
}

export const blogService = {
  // Get all blogs (with filters)
  getAllBlogs: async (params?: GetBlogsParams): Promise<BlogsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    const url = `/blogs${query ? `?${query}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get blog by ID
  getBlogById: async (id: number): Promise<BlogResponse> => {
    const response = await api.get(`/blogs/${id}`);
    return response.data;
  },

  // Create new blog
  createBlog: async (blogData: BlogFormData): Promise<BlogResponse> => {
    const response = await api.post('/blogs', blogData);
    return response.data;
  },

  // Update blog
  updateBlog: async (id: number, blogData: Partial<BlogFormData>): Promise<BlogResponse> => {
    const response = await api.put(`/blogs/${id}`, blogData);
    return response.data;
  },

  // Delete blog
  deleteBlog: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  },

  // Toggle publish status
  togglePublishStatus: async (id: number): Promise<BlogResponse> => {
    const response = await api.patch(`/blogs/${id}/toggle-publish`);
    return response.data;
  },
};

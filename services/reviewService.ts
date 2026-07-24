import api from './api';
import { Review, ReviewStats, RatingDistribution } from '@/types';

export interface ReviewFilters {
  status?: 'pending' | 'approved' | 'rejected';
  rating?: number;
  page?: number;
  limit?: number;
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  total?: number;
}

export interface ReviewStatsResponse {
  stats: ReviewStats;
  ratingDistribution: RatingDistribution[];
}

// Get all reviews with optional filters (admin only)
export const getAllReviews = async (filters?: ReviewFilters): Promise<ReviewsResponse> => {
  const params = new URLSearchParams();
  
  if (filters?.status) params.append('status', filters.status);
  if (filters?.rating) params.append('rating', filters.rating.toString());
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const { data } = await api.get(`/reviews/all?${params.toString()}`);
  return data;
};

// Get pending reviews (admin only)
export const getPendingReviews = async (): Promise<ReviewsResponse> => {
  const { data } = await api.get('/reviews/pending');
  return data;
};

// Get review statistics (admin only)
export const getReviewStats = async (): Promise<ReviewStatsResponse> => {
  const { data } = await api.get('/reviews/stats');
  return data;
};

// Get single review by ID (admin only)
export const getReviewById = async (id: number): Promise<{ review: Review }> => {
  const { data } = await api.get(`/reviews/${id}`);
  return data;
};

// Approve review (admin only)
export const approveReview = async (id: number): Promise<{ message: string }> => {
  const { data } = await api.put(`/reviews/${id}/approve`);
  return data;
};

// Reject review (admin only)
export const rejectReview = async (id: number, adminNotes?: string): Promise<{ message: string }> => {
  const { data } = await api.put(`/reviews/${id}/reject`, { adminNotes });
  return data;
};

// Update review (admin only)
export const updateReview = async (
  id: number,
  updates: Partial<Pick<Review, 'name' | 'role' | 'rating' | 'message' | 'course_name' | 'admin_notes'>>
): Promise<{ message: string }> => {
  const { data } = await api.put(`/reviews/${id}`, updates);
  return data;
};

// Delete review (admin only)
export const deleteReview = async (id: number): Promise<{ message: string }> => {
  const { data } = await api.delete(`/reviews/${id}`);
  return data;
};

'use client';

import { useEffect, useState } from 'react';
import { 
  Star, 
  Search,
  Eye,
  Check,
  X,
  Trash2,
  Edit2,
  Loader2,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  getAllReviews, 
  getPendingReviews,
  approveReview, 
  rejectReview, 
  deleteReview,
  updateReview,
  getReviewStats
} from '@/services/reviewService';
import { Review, ReviewStats, RatingDistribution } from '@/types';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [ratingDist, setRatingDist] = useState<RatingDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    role: '',
    rating: 5,
    message: '',
    course_name: '',
  });

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [statusFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      if (statusFilter === 'all') {
        const data = await getAllReviews();
        setReviews(data.reviews);
      } else {
        const data = await getAllReviews({ status: statusFilter });
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getReviewStats();
      setStats(data.stats);
      setRatingDist(data.ratingDistribution);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setActionLoading(id);
      await approveReview(id);
      await fetchReviews();
      await fetchStats();
    } catch (error) {
      console.error('Failed to approve review:', error);
      alert('Failed to approve review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    const notes = prompt('Enter reason for rejection (optional):');
    try {
      setActionLoading(id);
      await rejectReview(id, notes || undefined);
      await fetchReviews();
      await fetchStats();
    } catch (error) {
      console.error('Failed to reject review:', error);
      alert('Failed to reject review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }
    try {
      setActionLoading(id);
      await deleteReview(id);
      await fetchReviews();
      await fetchStats();
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert('Failed to delete review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditClick = (review: Review) => {
    setEditingReview(review);
    setEditForm({
      name: review.name,
      role: review.role,
      rating: review.rating,
      message: review.message,
      course_name: review.course_name || '',
    });
  };

  const handleUpdate = async () => {
    if (!editingReview) return;
    try {
      await updateReview(editingReview.id, editForm);
      setEditingReview(null);
      await fetchReviews();
    } catch (error) {
      console.error('Failed to update review:', error);
      alert('Failed to update review');
    }
  };

  const filteredReviews = reviews.filter(review =>
    review.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[#E2E8F0]'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#D1FAE5] text-[#065F46]">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FEE2E2] text-[#991B1B]">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#92400E]">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B]">Review Management</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Manage and moderate student reviews and testimonials
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">Total Reviews</p>
                <p className="text-2xl font-bold text-[#1E293B] mt-1">
                  {stats.total_count}
                </p>
              </div>
              <div className="bg-[#F1F5F9] p-3 rounded-lg">
                <MessageSquare className="w-6 h-6 text-[#6366F1]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">Pending</p>
                <p className="text-2xl font-bold text-[#F59E0B] mt-1">
                  {stats.pending_count}
                </p>
              </div>
              <div className="bg-[#FEF3C7] p-3 rounded-lg">
                <Clock className="w-6 h-6 text-[#F59E0B]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">Approved</p>
                <p className="text-2xl font-bold text-[#10B981] mt-1">
                  {stats.approved_count}
                </p>
              </div>
              <div className="bg-[#D1FAE5] p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-[#10B981]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">Rejected</p>
                <p className="text-2xl font-bold text-[#EF4444] mt-1">
                  {stats.rejected_count}
                </p>
              </div>
              <div className="bg-[#FEE2E2] p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-[#EF4444]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">Avg Rating</p>
                <p className="text-2xl font-bold text-[#1E293B] mt-1">
                  {stats.average_rating ? parseFloat(stats.average_rating.toString()).toFixed(1) : '0.0'}
                </p>
              </div>
              <div className="bg-[#DBEAFE] p-3 rounded-lg">
                <Star className="w-6 h-6 text-[#F59E0B] fill-[#F59E0B]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-[#6366F1] text-white'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#6366F1]" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
            <p className="text-[#64748B]">No reviews found</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-[#F8FAFC] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-[#1E293B]">{review.name}</h3>
                      <span className="text-sm text-[#64748B]">•</span>
                      <span className="text-sm text-[#64748B]">{review.role}</span>
                      {getStatusBadge(review.status)}
                      {renderStars(review.rating)}
                    </div>

                    {/* Message */}
                    <p className="text-[#1E293B] leading-relaxed">{review.message}</p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-xs text-[#64748B]">
                      {review.course_name && (
                        <span>Course: {review.course_name}</span>
                      )}
                      {review.email && (
                        <span>Email: {review.email}</span>
                      )}
                      {review.phone && (
                        <span>Phone: {review.phone}</span>
                      )}
                      <span>
                        Submitted: {new Date(review.created_at).toLocaleDateString()}
                      </span>
                      {review.reviewed_by_name && (
                        <span>Reviewed by: {review.reviewed_by_name}</span>
                      )}
                    </div>

                    {review.admin_notes && (
                      <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-lg p-3">
                        <p className="text-xs font-medium text-[#92400E] mb-1">Admin Notes:</p>
                        <p className="text-sm text-[#78350F]">{review.admin_notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[100px]">
                    {review.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(review.id)}
                          disabled={actionLoading === review.id}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors text-sm disabled:opacity-50"
                        >
                          {actionLoading === review.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(review.id)}
                          disabled={actionLoading === review.id}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-colors text-sm disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleEditClick(review)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={actionLoading === review.id}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-[#E2E8F0] text-[#EF4444] rounded-lg hover:bg-[#FEE2E2] transition-colors text-sm disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-[#1E293B] mb-4">Edit Review</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1">
                  Rating
                </label>
                <select
                  value={editForm.rating}
                  onChange={(e) => setEditForm({ ...editForm, rating: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>{r} Stars</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1">
                  Course Name (Optional)
                </label>
                <input
                  type="text"
                  value={editForm.course_name}
                  onChange={(e) => setEditForm({ ...editForm, course_name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1">
                  Message
                </label>
                <textarea
                  value={editForm.message}
                  onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdate}
                  className="flex-1 px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingReview(null)}
                  className="flex-1 px-4 py-2 bg-[#F1F5F9] text-[#64748B] rounded-lg hover:bg-[#E2E8F0] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

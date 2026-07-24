'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Star, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  Eye,
  Trash2,
  Filter,
  TrendingUp
} from 'lucide-react';
import {
  getAllReviews,
  getPendingReviews,
  getReviewStats,
  approveReview,
  rejectReview,
  deleteReview
} from '@/services/reviewService';
import { Review, ReviewStats, RatingDistribution } from '@/types';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reviewToReject, setReviewToReject] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [selectedStatus]);

  useEffect(() => {
    // Connect to Socket.IO for real-time updates
    const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001', {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[Admin Reviews] Socket connected');
      // Join the admin room to receive admin-specific events
      socket.emit('join-admin-room');
    });

    // Listen for new review submissions
    socket.on('new-review-submitted', (data) => {
      console.log('[Admin Reviews] New review submitted:', data);
      toast.success('New review submitted!', {
        duration: 5000,
      });
      // Refresh the reviews list and stats
      fetchReviews();
      fetchStats();
    });

    socket.on('disconnect', () => {
      console.log('[Admin Reviews] Socket disconnected');
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      if (selectedStatus === 'all') {
        const data = await getAllReviews({ limit: 100 });
        setReviews(data.reviews);
      } else {
        const data = await getAllReviews({ status: selectedStatus, limit: 100 });
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getReviewStats();
      setStats(data.stats);
      setRatingDistribution(data.ratingDistribution);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleApprove = async (review: Review) => {
    if (!confirm(`Are you sure you want to approve this review from ${review.name}?`)) {
      return;
    }

    try {
      setActionLoading(review.id);
      await approveReview(review.id);
      toast.success('Review approved successfully!');
      fetchReviews();
      fetchStats();
    } catch (error) {
      console.error('Failed to approve review:', error);
      toast.error('Failed to approve review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (review: Review) => {
    setReviewToReject(review);
    setRejectNotes('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!reviewToReject) return;

    try {
      setActionLoading(reviewToReject.id);
      await rejectReview(reviewToReject.id, rejectNotes);
      toast.success('Review rejected');
      setShowRejectModal(false);
      setReviewToReject(null);
      setRejectNotes('');
      fetchReviews();
      fetchStats();
    } catch (error) {
      console.error('Failed to reject review:', error);
      toast.error('Failed to reject review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (review: Review) => {
    if (!confirm(`Are you sure you want to permanently delete this review from ${review.name}?`)) {
      return;
    }

    try {
      setActionLoading(review.id);
      await deleteReview(review.id);
      toast.success('Review deleted successfully');
      fetchReviews();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast.error('Failed to delete review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (review: Review) => {
    setSelectedReview(review);
    setShowDetailModal(true);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-indigo-600" />
            Review Management
          </h1>
          <p className="text-gray-600 mt-2">
            Moderate and manage student and parent reviews
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Reviews</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending_count}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved_count}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">{stats.rejected_count}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {stats.average_rating ? parseFloat(stats.average_rating.toString()).toFixed(1) : 'N/A'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-2 p-4 border-b border-gray-200">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
          </div>
          <div className="flex gap-2 p-4">
            {[
              { value: 'pending', label: 'Pending', icon: Clock, color: 'yellow' },
              { value: 'approved', label: 'Approved', icon: CheckCircle, color: 'green' },
              { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'red' },
              { value: 'all', label: 'All Reviews', icon: MessageSquare, color: 'gray' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedStatus === tab.value
                    ? `bg-${tab.color}-100 text-${tab.color}-800 border-2 border-${tab.color}-300`
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Found</h3>
            <p className="text-gray-600">
              {selectedStatus === 'pending' ? 'No pending reviews at the moment' : 
               selectedStatus === 'approved' ? 'No approved reviews yet' :
               selectedStatus === 'rejected' ? 'No rejected reviews' :
               'No reviews have been submitted yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{review.name}</h3>
                          {getStatusBadge(review.status)}
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600">{review.role}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <p className="text-gray-700 leading-relaxed mb-3 pl-15">
                      "{review.message}"
                    </p>

                    {/* Additional Info */}
                    <div className="pl-15 space-y-1">
                      {review.course_name && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Course:</span> {review.course_name}
                        </p>
                      )}
                      {review.email && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span> {review.email}
                        </p>
                      )}
                      {review.phone && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Phone:</span> {review.phone}
                        </p>
                      )}
                      {review.admin_notes && (
                        <p className="text-sm text-red-600">
                          <span className="font-medium">Admin Notes:</span> {review.admin_notes}
                        </p>
                      )}
                      {review.reviewed_by_name && (
                        <p className="text-xs text-gray-500">
                          Reviewed by {review.reviewed_by_name} on{' '}
                          {review.reviewed_at ? new Date(review.reviewed_at).toLocaleDateString() : 'N/A'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleViewDetails(review)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5 text-gray-600" />
                    </button>

                    {review.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(review)}
                          disabled={actionLoading === review.id}
                          className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          {actionLoading === review.id ? (
                            <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleRejectClick(review)}
                          disabled={actionLoading === review.id}
                          className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5 text-red-600" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleDelete(review)}
                      disabled={actionLoading === review.id}
                      className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Review Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900 font-semibold">{selectedReview.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Role</label>
                <p className="text-gray-900">{selectedReview.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Rating</label>
                <div className="mt-1">{renderStars(selectedReview.rating)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Review Message</label>
                <p className="text-gray-900 leading-relaxed mt-1">"{selectedReview.message}"</p>
              </div>
              {selectedReview.email && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{selectedReview.email}</p>
                </div>
              )}
              {selectedReview.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{selectedReview.phone}</p>
                </div>
              )}
              {selectedReview.course_name && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Course</label>
                  <p className="text-gray-900">{selectedReview.course_name}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">{getStatusBadge(selectedReview.status)}</div>
              </div>
              {selectedReview.admin_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Admin Notes</label>
                  <p className="text-gray-900">{selectedReview.admin_notes}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Submitted On</label>
                <p className="text-gray-900">
                  {new Date(selectedReview.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && reviewToReject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Reject Review</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to reject the review from <strong>{reviewToReject.name}</strong>?
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Add notes about why this review was rejected..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setReviewToReject(null);
                  setRejectNotes('');
                }}
                disabled={actionLoading !== null}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={actionLoading !== null}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Reject Review'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

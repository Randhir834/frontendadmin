'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Star, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  Eye,
  Trash2,
  Filter,
  TrendingUp,
  AlertCircle,
  PlusCircle
} from 'lucide-react';
import {
  getAllReviews,
  getReviewStats,
  approveReview,
  rejectReview,
  deleteReview
} from '@/services/reviewService';
import { Review, ReviewStats } from '@/types';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

export default function BlogsManagementPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedBlog, setSelectedBlog] = useState<Review | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [blogToReject, setBlogToReject] = useState<Review | null>(null);
  const [authError, setAuthError] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token) {
        setAuthError(true);
        toast.error('Please login to access this page');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }
      
      try {
        const userData = user ? JSON.parse(user) : null;
        if (userData?.role !== 'admin') {
          setAuthError(true);
          toast.error('Access denied. Admin privileges required.');
          setTimeout(() => router.push('/admin'), 2000);
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [router]);

  useEffect(() => {
    if (!authError) {
      fetchBlogs();
      fetchStats();
    }
  }, [selectedStatus, authError]);

  useEffect(() => {
    // Connect to Socket.IO for real-time updates
    const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001', {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[Admin Blogs] Socket connected');
      socket.emit('join-admin-room');
    });

    socket.on('new-review-submitted', (data) => {
      console.log('[Admin Blogs] New blog post submitted:', data);
      toast.success('New blog post submitted!', {
        duration: 5000,
      });
      fetchBlogs();
      fetchStats();
    });

    socket.on('disconnect', () => {
      console.log('[Admin Blogs] Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      let data;
      if (selectedStatus === 'all') {
        data = await getAllReviews({ limit: 100 });
      } else {
        data = await getAllReviews({ status: selectedStatus, limit: 100 });
      }
      setBlogs(data.reviews || []);
    } catch (error: any) {
      console.error('Failed to fetch blog posts:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to load blog posts');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getReviewStats();
      setStats(data.stats);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handlePublish = async (blog: Review) => {
    if (!confirm(`Are you sure you want to publish this blog post: "${blog.course_name}"?`)) {
      return;
    }

    try {
      setActionLoading(blog.id);
      await approveReview(blog.id);
      toast.success('Blog post published successfully!');
      fetchBlogs();
      fetchStats();
    } catch (error) {
      console.error('Failed to publish blog post:', error);
      toast.error('Failed to publish blog post');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (blog: Review) => {
    setBlogToReject(blog);
    setRejectNotes('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!blogToReject) return;

    try {
      setActionLoading(blogToReject.id);
      await rejectReview(blogToReject.id, rejectNotes);
      toast.success('Blog post rejected');
      setShowRejectModal(false);
      setBlogToReject(null);
      setRejectNotes('');
      fetchBlogs();
      fetchStats();
    } catch (error) {
      console.error('Failed to reject blog post:', error);
      toast.error('Failed to reject blog post');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (blog: Review) => {
    if (!confirm(`Are you sure you want to permanently delete this blog post: "${blog.course_name}"?`)) {
      return;
    }

    try {
      setActionLoading(blog.id);
      await deleteReview(blog.id);
      toast.success('Blog post deleted successfully');
      fetchBlogs();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete blog post:', error);
      toast.error('Failed to delete blog post');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (blog: Review) => {
    setSelectedBlog(blog);
    setShowDetailModal(true);
  };

  const renderFeaturedStars = (priority: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= priority ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
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
            Draft
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Published
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

  const getExcerpt = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="w-8 h-8 text-indigo-600" />
                Blog Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and moderate blog posts for PlayFit Classes
              </p>
            </div>
            <button
              onClick={() => toast('Create blog form coming soon!', { icon: 'ℹ️' })}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-md"
            >
              <PlusCircle className="w-5 h-5" />
              New Blog Post
            </button>
          </div>
        </div>

        {/* Authentication Error */}
        {authError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Authentication Required</h3>
                <p className="text-red-700 text-sm">
                  Please login as an admin to access this page. Redirecting...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Draft Posts</p>
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
                  <p className="text-sm text-gray-600 mb-1">Published</p>
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
                  <p className="text-sm text-gray-600 mb-1">Total Posts</p>
                  <p className="text-3xl font-bold text-indigo-600">{stats.total_count}</p>
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
              { value: 'pending', label: 'Drafts', icon: Clock, color: 'yellow' },
              { value: 'approved', label: 'Published', icon: CheckCircle, color: 'green' },
              { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'red' },
              { value: 'all', label: 'All Posts', icon: FileText, color: 'gray' },
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

        {/* Blog Posts List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Blog Posts Found</h3>
            <p className="text-gray-600">
              {selectedStatus === 'pending' ? 'No draft posts at the moment' : 
               selectedStatus === 'approved' ? 'No published posts yet' :
               selectedStatus === 'rejected' ? 'No rejected posts' :
               'No blog posts have been created yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                        {blog.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-lg text-gray-900">{blog.course_name || 'Untitled Post'}</h3>
                          {getStatusBadge(blog.status)}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">By {blog.name}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600">{blog.role}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-xs text-gray-500">
                            {new Date(blog.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Blog Content Preview */}
                    <p className="text-gray-700 leading-relaxed mb-3 pl-15">
                      {getExcerpt(blog.message)}
                    </p>

                    {/* Featured Priority */}
                    <div className="pl-15 flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-600 font-medium">Featured Priority:</span>
                      {renderFeaturedStars(blog.rating)}
                      <span className="text-xs text-gray-500">({blog.rating}/5)</span>
                    </div>

                    {/* Additional Info */}
                    <div className="pl-15 space-y-1">
                      {blog.email && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span> {blog.email}
                        </p>
                      )}
                      {blog.admin_notes && (
                        <p className="text-sm text-red-600">
                          <span className="font-medium">Admin Notes:</span> {blog.admin_notes}
                        </p>
                      )}
                      {blog.reviewed_by_name && (
                        <p className="text-xs text-gray-500">
                          {blog.status === 'approved' ? 'Published' : 'Reviewed'} by {blog.reviewed_by_name} on{' '}
                          {blog.reviewed_at ? new Date(blog.reviewed_at).toLocaleDateString() : 'N/A'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleViewDetails(blog)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5 text-gray-600" />
                    </button>

                    {blog.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handlePublish(blog)}
                          disabled={actionLoading === blog.id}
                          className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors disabled:opacity-50"
                          title="Publish"
                        >
                          {actionLoading === blog.id ? (
                            <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleRejectClick(blog)}
                          disabled={actionLoading === blog.id}
                          className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5 text-red-600" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleDelete(blog)}
                      disabled={actionLoading === blog.id}
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
      {showDetailModal && selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Blog Post Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Title</label>
                <p className="text-gray-900 font-bold text-xl">{selectedBlog.course_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Author</label>
                <p className="text-gray-900 font-semibold">{selectedBlog.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Author Role</label>
                <p className="text-gray-900">{selectedBlog.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Featured Priority</label>
                <div className="mt-1 flex items-center gap-2">
                  {renderFeaturedStars(selectedBlog.rating)}
                  <span className="text-sm text-gray-600">({selectedBlog.rating}/5)</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Content</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{selectedBlog.message}</p>
                </div>
              </div>
              {selectedBlog.email && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Author Email</label>
                  <p className="text-gray-900">{selectedBlog.email}</p>
                </div>
              )}
              {selectedBlog.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Author Phone</label>
                  <p className="text-gray-900">{selectedBlog.phone}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">{getStatusBadge(selectedBlog.status)}</div>
              </div>
              {selectedBlog.admin_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Admin Notes</label>
                  <p className="text-gray-900">{selectedBlog.admin_notes}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Created On</label>
                <p className="text-gray-900">
                  {new Date(selectedBlog.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
              {selectedBlog.status === 'approved' && (
                <a
                  href={`/blog/${selectedBlog.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  View on Website
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && blogToReject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Reject Blog Post</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to reject the blog post: <strong>"{blogToReject.course_name}"</strong>?
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Add notes about why this post was rejected..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setBlogToReject(null);
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
                  'Reject Post'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

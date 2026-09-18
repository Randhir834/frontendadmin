'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, Search, Filter, Calendar, User } from 'lucide-react';
import { blogService } from '@/services/blogService';
import Button from '@/components/ui/Button';
import type { Blog } from '@/types';

export default function BlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const data = await blogService.getAllBlogs(params);
      setBlogs(data.blogs);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogs();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(id);
      await blogService.deleteBlog(id);
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog');
    } finally {
      setDeleting(null);
    }
  };

  const handleTogglePublish = async (id: number) => {
    try {
      await blogService.togglePublishStatus(id);
      fetchBlogs();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update blog status');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Blog Management</h1>
          <p className="text-text-muted mt-1">Create and manage blog posts</p>
        </div>
        <Button
          size="lg"
          onClick={() => router.push('/admin/blogs/create')}
          className="gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Blog
        </Button>
      </div>

      {/* Blogs List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="bg-card rounded-xl p-12 text-center shadow-sm border border-border">
          <div className="w-16 h-16 bg-hover rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No blogs found</h3>
          <p className="text-text-muted mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first blog post'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button
              onClick={() => router.push('/admin/blogs/create')}
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Blog
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-text-primary truncate">
                      {blog.title}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        blog.status === 'published'
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {blog.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {blog.excerpt && (
                    <p className="text-text-muted text-sm mb-3 line-clamp-2">
                      {blog.excerpt}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{blog.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(blog.publication_date)}</span>
                    </div>
                    {blog.creator_name && (
                      <div className="text-xs">
                        Created by: <span className="font-medium">{blog.creator_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Featured Image */}
                {blog.featured_image_url && (
                  <div className="flex-shrink-0">
                    <img
                      src={blog.featured_image_url}
                      alt={blog.title}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push(`/admin/blogs/${blog.id}/edit`)}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTogglePublish(blog.id)}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(blog.id)}
                  disabled={deleting === blog.id}
                  className="gap-2 ml-auto text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting === blog.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-text-primary">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { blogService } from '@/services/blogService';
import { storageService } from '@/services/storageService';
import type { BlogFormData } from '@/types';

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    author: '',
    excerpt: '',
    featured_image_url: '',
    publication_date: '',
    status: 'draft',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setFetching(true);
        const data = await blogService.getBlogById(Number(id));
        const blog = data.blog;
        
        setFormData({
          title: blog.title,
          content: blog.content,
          author: blog.author,
          excerpt: blog.excerpt || '',
          featured_image_url: blog.featured_image_url || '',
          publication_date: blog.publication_date
            ? new Date(blog.publication_date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          status: blog.status,
        });
      } catch (error) {
        console.error('Error fetching blog:', error);
        alert('Failed to load blog');
        router.push('/admin/blogs');
      } finally {
        setFetching(false);
      }
    };

    fetchBlog();
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const uploadedUrl = await storageService.uploadFile(file, 'blog-images');
      setFormData((prev) => ({ ...prev, featured_image_url: uploadedUrl.url }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await blogService.updateBlog(Number(id), formData);
      router.push('/admin/blogs');
    } catch (error) {
      console.error('Error updating blog:', error);
      alert('Failed to update blog');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Blog</h1>
          <p className="text-gray-600 mt-1">Update your blog post details</p>
        </div>
      </div>

      {/* Form - Same as create page */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            Blog Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter blog title"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Author */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <label htmlFor="author" className="block text-sm font-semibold text-gray-700 mb-2">
            Author Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Enter author name"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.author ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
        </div>

        {/* Excerpt */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <label htmlFor="excerpt" className="block text-sm font-semibold text-gray-700 mb-2">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows={3}
            placeholder="Brief summary of the blog (optional)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">A short description that appears in blog listings</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
            Blog Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={15}
            placeholder="Write your blog content here..."
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
          <p className="text-xs text-gray-500 mt-1">You can use markdown formatting</p>
        </div>

        {/* Featured Image */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Featured Image
          </label>
          
          {formData.featured_image_url ? (
            <div className="space-y-3">
              <img
                src={formData.featured_image_url}
                alt="Featured"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, featured_image_url: '' }))}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Remove Image
              </button>
            </div>
          ) : (
            <div>
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  ) : (
                    <>
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-600">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 5MB)</p>
                    </>
                  )}
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Publication Date and Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="publication_date" className="block text-sm font-semibold text-gray-700 mb-2">
              Publication Date
            </label>
            <input
              type="date"
              id="publication_date"
              name="publication_date"
              value={formData.publication_date}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

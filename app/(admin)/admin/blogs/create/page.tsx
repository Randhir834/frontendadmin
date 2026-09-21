'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, Image as ImageIcon, Trash2, AlertCircle } from 'lucide-react';
import { blogService } from '@/services/blogService';
import { storageService } from '@/services/storageService';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import type { BlogFormData } from '@/types';

export default function CreateBlogPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    author: '',
    excerpt: '',
    featured_image_url: '',
    publication_date: new Date().toISOString().split('T')[0],
    status: 'draft',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
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

  const handleSubmit = async (e: React.FormEvent, publishNow = false) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const dataToSubmit = {
        ...formData,
        status: publishNow ? 'published' as const : formData.status,
      };

      await blogService.createBlog(dataToSubmit);
      router.push('/admin/blogs');
    } catch (error) {
      console.error('Error creating blog:', error);
      alert('Failed to create blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1000px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-hover rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-text-primary" />
        </button>
        <div className="p-2 bg-green-100 rounded-xl">
          <ImageIcon size={32} className="text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Create New Blog</h1>
          <p className="text-gray-600 mt-1">Fill in the details to create a new blog post</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Title */}
        <Card>
          <CardHeader>
            <CardTitle>Blog Title *</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter blog title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </CardContent>
        </Card>

        {/* Author */}
        <Card>
          <CardHeader>
            <CardTitle>Author Name *</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Enter author name"
              className={errors.author ? 'border-red-500' : ''}
            />
            {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
          </CardContent>
        </Card>

        {/* Excerpt */}
        <Card>
          <CardHeader>
            <CardTitle>Excerpt</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={3}
              placeholder="Brief summary of the blog (optional)"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-text-muted mt-1">A short description that appears in blog listings</p>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Blog Content *</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={15}
              placeholder="Write your blog content here..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm resize-none ${
                errors.content ? 'border-red-500' : 'border-border'
              }`}
            />
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
            <p className="text-xs text-text-muted mt-1">You can use markdown formatting</p>
          </CardContent>
        </Card>

        {/* Featured Image */}
        <Card>
          <CardHeader>
            <CardTitle>Featured Image</CardTitle>
          </CardHeader>
          <CardContent>
            {formData.featured_image_url ? (
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={formData.featured_image_url}
                    alt="Featured"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData((prev) => ({ ...prev, featured_image_url: '' }))}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploading ? (
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                    ) : (
                      <>
                        <ImageIcon className="w-12 h-12 text-text-muted mb-3" />
                        <p className="mb-2 text-sm text-text-secondary">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-text-muted">PNG, JPG or GIF (MAX. 5MB)</p>
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
          </CardContent>
        </Card>

        {/* Publication Date and Status */}
        <Card>
          <CardHeader>
            <CardTitle>Publication Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="publication_date" className="block text-sm font-medium text-text-secondary mb-2">
                Publication Date
              </label>
              <Input
                type="date"
                id="publication_date"
                name="publication_date"
                value={formData.publication_date}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-text-secondary mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="secondary"
                disabled={loading}
                className="gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save as Draft'}
              </Button>
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="gap-2"
              >
                <Upload className="w-5 h-5" />
                {loading ? 'Publishing...' : 'Publish Now'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

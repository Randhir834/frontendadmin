'use client';

import { useState, useRef } from 'react';
import { X, Upload, File, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import { courseMaterialService } from '@/services/courseMaterialService';

interface MaterialUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  onSuccess: () => void;
}

export default function MaterialUploadModal({
  isOpen,
  onClose,
  courseId,
  onSuccess,
}: MaterialUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (selectedFile: File) => {
    const validation = courseMaterialService.validateFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    
    // Auto-fill title if empty
    if (!title) {
      const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
      setTitle(fileNameWithoutExt);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      await courseMaterialService.uploadMaterial(courseId, file, {
        title: title.trim(),
        description: description.trim(),
      });

      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      
      onSuccess();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || 'Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setFile(null);
    setTitle('');
    setDescription('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <h2 className="text-xl font-semibold text-[#1E293B]">Upload Course Material</h2>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-[#64748B] hover:text-[#1E293B] disabled:opacity-50"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-2">
              File <span className="text-[#EF4444]">*</span>
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-[#1E88E5] bg-[#EFF6FF]'
                  : 'border-[#CBD5E1] hover:border-[#1E88E5]'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <File className="size-8 text-[#1E88E5]" />
                  <div className="text-left">
                    <p className="font-medium text-[#1E293B]">{file.name}</p>
                    <p className="text-sm text-[#64748B]">
                      {courseMaterialService.formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="size-12 text-[#CBD5E1] mx-auto mb-3" />
                  <p className="text-[#1E293B] mb-1">
                    Drag and drop your file here, or{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#1E88E5] hover:underline"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-sm text-[#64748B]">
                    PDF, Word, PowerPoint, Images, Videos (Max 50MB)
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={courseMaterialService.getAllowedFileTypes()}
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-2">
              Title <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter material title"
              className="w-full px-4 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent"
              disabled={uploading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter material description (optional)"
              rows={3}
              className="w-full px-4 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent resize-none"
              disabled={uploading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-[#FEE2E2] border border-[#EF4444] rounded-lg">
              <p className="text-sm text-[#991B1B]">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploading || !file || !title.trim()}>
              {uploading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="size-4 mr-2" />
                  Upload Material
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

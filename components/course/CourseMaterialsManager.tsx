'use client';

import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Image, 
  Presentation, 
  Trash2, 
  Eye, 
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import SecureFileViewer from '@/components/secure/SecureFileViewer';
import { courseMaterialService, CourseMaterial } from '@/services/courseMaterialService';

interface CourseMaterialsManagerProps {
  courseId: number;
  courseName: string;
  isAdmin: boolean;
}

export default function CourseMaterialsManager({ 
  courseId, 
  courseName, 
  isAdmin 
}: CourseMaterialsManagerProps) {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: ''
  });
  const [viewingMaterial, setViewingMaterial] = useState<CourseMaterial | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch course materials
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await courseMaterialService.getCourseMaterials(courseId);
      setMaterials(data.materials || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [courseId]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = courseMaterialService.validateFile(file);
      
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      setSelectedFile(file);
      setUploadForm(prev => ({
        ...prev,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '')
      }));
      setError(null);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile || !uploadForm.title.trim()) {
      setError('Please select a file and provide a title');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      await courseMaterialService.uploadMaterial(courseId, selectedFile, {
        title: uploadForm.title.trim(),
        description: uploadForm.description.trim()
      });

      setSuccess('Material uploaded successfully');
      setSelectedFile(null);
      setUploadForm({ title: '', description: '' });
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Refresh materials list
      await fetchMaterials();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Handle material deletion
  const handleDelete = async (materialId: number) => {
    if (!confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
      return;
    }

    try {
      await courseMaterialService.deleteMaterial(materialId);
      setSuccess('Material deleted successfully');
      await fetchMaterials();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete material');
    }
  };

  // Handle security violations
  const handleSecurityViolation = async (type: 'screenshot' | 'download') => {
    if (!viewingMaterial) return;

    try {
      if (type === 'screenshot') {
        await courseMaterialService.reportScreenshotAttempt(viewingMaterial.id);
      } else {
        await courseMaterialService.reportDownloadAttempt(viewingMaterial.id);
      }
    } catch (err) {
      console.error('Failed to report security violation:', err);
    }
  };

  // Get file type icon
  const getFileIcon = (fileType: string, mimeType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-600" />;
      case 'ppt':
        return <Presentation className="h-6 w-6 text-orange-600" />;
      case 'image':
        return <Image className="h-6 w-6 text-green-600" />;
      default:
        return <FileText className="h-6 w-6 text-blue-600" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    return courseMaterialService.formatFileSize(bytes);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return courseMaterialService.formatDate(dateString);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Materials</h2>
          <p className="text-gray-600">{courseName}</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Shield className="h-4 w-4" />
          <span>Secure Content Management</span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800">Error</h4>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-800">Success</h4>
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Upload Section (Admin Only) */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload Course Material</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp,.gif"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, PPT, Word documents, Images (max 100MB)
              </p>
            </div>

            {selectedFile && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  {getFileIcon('document', selectedFile.type)}
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Input
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !uploadForm.title.trim() || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Material
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Materials List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Materials</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading materials...</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No materials uploaded yet</p>
              {isAdmin && (
                <p className="text-sm text-gray-400 mt-2">
                  Upload your first course material using the form above
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getFileIcon(material.file_type, material.mime_type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {material.title}
                        </h4>
                        {material.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {material.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{material.file_name}</span>
                          <span>{formatFileSize(material.file_size)}</span>
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{material.uploaded_by_name}</span>
                          </div>
                          <span>{formatDate(material.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        onClick={() => setViewingMaterial(material)}
                        size="sm"
                        variant="outline"
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Button>
                      {isAdmin && (
                        <Button
                          onClick={() => handleDelete(material.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 hover:border-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secure File Viewer */}
      {viewingMaterial && (
        <SecureFileViewer
          materialId={viewingMaterial.id}
          fileName={viewingMaterial.file_name}
          onClose={() => setViewingMaterial(null)}
          onSecurityViolation={handleSecurityViolation}
        />
      )}
    </div>
  );
}
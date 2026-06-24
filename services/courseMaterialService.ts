import api from './api';

export interface CourseMaterial {
  id: number;
  title: string;
  description: string;
  file_type: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_by_name: string;
  created_at: string;
  folder_path?: string; // NEW: folder structure from upload
}

export interface AccessLog {
  id: number;
  user_name: string;
  user_email: string;
  access_type: string;
  ip_address: string;
  user_agent: string;
  access_granted: boolean;
  blocked_reason: string | null;
  accessed_at: string;
}

class CourseMaterialService {
  /**
   * Upload a course material
   */
  async uploadMaterial(
    courseId: number,
    file: File,
    data: { title: string; description?: string; folder_path?: string }
  ): Promise<{ material: CourseMaterial }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.folder_path) {
      formData.append('folder_path', data.folder_path);
    }

    const response = await api.post(`/courses/${courseId}/materials`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Get all materials for a course
   */
  async getCourseMaterials(courseId: number): Promise<{ materials: CourseMaterial[] }> {
    const response = await api.get(`/courses/${courseId}/materials`);
    return response.data;
  }

  /**
   * Delete a course material
   */
  async deleteMaterial(materialId: number): Promise<void> {
    await api.delete(`/materials/${materialId}`);
  }

  /**
   * Get access logs for a material
   */
  async getMaterialAccessLogs(materialId: number, limit = 100): Promise<{ logs: AccessLog[] }> {
    const response = await api.get(`/materials/${materialId}/logs`, {
      params: { limit },
    });
    return response.data;
  }

  /**
   * Get a specific material by ID
   */
  async getMaterialById(materialId: number): Promise<{ material: CourseMaterial }> {
    const response = await api.get(`/materials/${materialId}`);
    return response.data;
  }

  /**
   * Generate a secure viewing token for a material
   */
  async getViewingToken(materialId: number): Promise<{ token: string; expiresAt: string }> {
    const response = await api.post(`/materials/${materialId}/token`);
    return response.data;
  }

  /**
   * Get secure URL for viewing material
   */
  async getSecureUrl(token: string): Promise<{ 
    secureUrl: string; 
    fileName: string; 
    mimeType: string 
  }> {
    const response = await api.get(`/materials/secure/${token}`);
    return response.data;
  }

  /**
   * Report a screenshot attempt
   */
  async reportScreenshotAttempt(materialId: number): Promise<void> {
    await api.post('/materials/report/screenshot', { materialId });
  }

  /**
   * Report a download attempt
   */
  async reportDownloadAttempt(materialId: number): Promise<void> {
    await api.post('/materials/report/download', { materialId });
  }

  /**
   * Get file type category from MIME type
   */
  getFileType(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'ppt';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
    return 'file';
  }

  /**
   * Get file icon based on file type
   */
  getFileIcon(fileType: string): string {
    const iconMap: Record<string, string> = {
      pdf: '📄',
      ppt: '📊',
      image: '🖼️',
      document: '📝',
    };
    return iconMap[fileType] || '📎';
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Get allowed file types
   */
  getAllowedFileTypes(): string {
    return '.pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm';
  }

  /**
   * Validate file
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be less than 100MB',
      };
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not allowed. Please upload PDF, Word, PowerPoint, text, image, or video files.',
      };
    }

    return { valid: true };
  }
}

export const courseMaterialService = new CourseMaterialService();

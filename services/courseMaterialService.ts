import api from './api';

export interface CourseMaterial {
  id: number;
  title: string;
  description: string;
  file_type: 'pdf' | 'ppt' | 'image' | 'document';
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_by_name: string;
  created_at: string;
}

export interface MaterialUploadData {
  title: string;
  description?: string;
}

export interface SecurityViolationReport {
  materialId: number;
  type: 'screenshot' | 'download';
}

export interface AccessLog {
  id: number;
  material_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  access_type: string;
  ip_address: string;
  user_agent: string;
  access_granted: boolean;
  blocked_reason?: string;
  accessed_at: string;
  material_title: string;
}

class CourseMaterialService {
  /**
   * Get all materials for a course
   */
  async getCourseMaterials(courseId: number): Promise<{ materials: CourseMaterial[] }> {
    const response = await api.get(`/courses/${courseId}/materials`);
    return response.data;
  }

  /**
   * Upload a new course material
   */
  async uploadMaterial(
    courseId: number, 
    file: File, 
    data: MaterialUploadData
  ): Promise<{ material: CourseMaterial }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }

    const response = await api.post(`/courses/${courseId}/materials`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
   * Delete a course material
   */
  async deleteMaterial(materialId: number): Promise<{ material: CourseMaterial }> {
    const response = await api.delete(`/materials/${materialId}`);
    return response.data;
  }

  /**
   * Get access logs for a material (admin only)
   */
  async getAccessLogs(materialId: number, limit = 100): Promise<{ logs: AccessLog[] }> {
    const response = await api.get(`/materials/${materialId}/logs?limit=${limit}`);
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
   * Validate file for upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not supported. Please upload PDF, PPT, Word documents, or images.'
      };
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be less than 100MB'
      };
    }

    return { valid: true };
  }

  /**
   * Get file type from MIME type
   */
  getFileType(mimeType: string): 'pdf' | 'ppt' | 'image' | 'document' {
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'ppt';
    if (mimeType.startsWith('image/')) return 'image';
    return 'document';
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
      minute: '2-digit'
    });
  }
}

export const courseMaterialService = new CourseMaterialService();
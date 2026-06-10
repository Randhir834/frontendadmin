'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, BookOpen, Eye, Shield, FileText, Image, Presentation, Clock, User } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SecureFileViewer from '@/components/secure/SecureFileViewer';
import { courseService } from '@/services/courseService';
import { courseMaterialService, CourseMaterial } from '@/services/courseMaterialService';
import type { Course } from '@/types';

export default function InstructorCourseMaterialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const courseId = Number(id);
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingMaterial, setViewingMaterial] = useState<CourseMaterial | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch course details and materials in parallel
        const [courseRes, materialsRes] = await Promise.all([
          courseService.getCourseById(courseId),
          courseMaterialService.getCourseMaterials(courseId)
        ]);

        setCourse(courseRes.course || null);
        setMaterials(materialsRes.materials || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load course materials');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

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
  const getFileIcon = (fileType: string) => {
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

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="size-12 text-dark-200 mx-auto mb-3" />
              <p className="text-sm text-text-muted">{error || 'Course not found or access denied.'}</p>
              <div className="mt-4">
                <Button variant="outline" onClick={() => router.push('/instructor/courses')}>
                  Back to Courses
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/instructor/courses')}
          className="p-2 rounded-lg border border-border hover:bg-hover transition-colors"
          aria-label="Back to courses"
        >
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
            Course Materials
          </h1>
          <p className="text-sm text-text-muted">{course.title}</p>
        </div>
      </div>

      {/* Security Notice */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Secure Content Viewing</h3>
              <p className="text-sm text-blue-700 mt-1">
                These materials are protected against downloads and screenshots. 
                Any attempt to capture or download content will be logged and blocked.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materials List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Materials ({materials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No materials available for this course</p>
              <p className="text-sm text-gray-400 mt-2">
                Materials will appear here once the admin uploads them
              </p>
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
                      {getFileIcon(material.file_type)}
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
                          <span>{courseMaterialService.formatFileSize(material.file_size)}</span>
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{material.uploaded_by_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{courseMaterialService.formatDate(material.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        onClick={() => setViewingMaterial(material)}
                        size="sm"
                        className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Secure View</span>
                      </Button>
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
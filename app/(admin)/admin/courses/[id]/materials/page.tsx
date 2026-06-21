'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Loader2, Upload, FileText, Trash2, Eye, ArrowLeft } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { courseService } from '@/services/courseService';
import { courseMaterialService } from '@/services/courseMaterialService';
import MaterialUploadModal from '@/components/modals/MaterialUploadModal';
import MaterialAccessLogsModal from '@/components/modals/MaterialAccessLogsModal';
import type { Course } from '@/types';

interface CourseMaterial {
  id: number;
  title: string;
  description: string;
  file_type: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_by_name: string;
  created_at: string;
}

export default function AdminCourseMaterialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const courseId = Number(id);

  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterial | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch course details
        const courseRes = await courseService.getCourseById(courseId);
        setCourse(courseRes.course || null);

        // Fetch materials
        await fetchMaterials();
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const fetchMaterials = async () => {
    try {
      const res = await courseMaterialService.getCourseMaterials(courseId);
      setMaterials(res.materials || []);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
      setMaterials([]);
    }
  };

  const handleDelete = async (materialId: number) => {
    if (!confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
      return;
    }

    try {
      await courseMaterialService.deleteMaterial(materialId);
      setMaterials(prev => prev.filter(m => m.id !== materialId));
      alert('Material deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete material:', error);
      alert(error.response?.data?.message || 'Failed to delete material');
    }
  };

  const handleViewLogs = (material: CourseMaterial) => {
    setSelectedMaterial(material);
    setShowLogsModal(true);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-[#1E88E5]" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="size-12 text-[#CBD5E1] mx-auto mb-3" />
              <p className="text-sm text-[#64748B]">Course not found.</p>
              <Link href="/admin/courses" className="inline-block mt-4">
                <Button variant="outline">Back to Courses</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={`/admin/courses/${courseId}`}
            className="inline-flex items-center gap-2 text-sm text-[#1E88E5] hover:underline mb-2"
          >
            <ArrowLeft className="size-4" />
            Back to Course
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-[#1E293B]">
            Course Materials
          </h1>
          <p className="text-sm text-[#64748B] mt-1">{course.title}</p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2"
        >
          <Upload className="size-4" />
          Upload Material
        </Button>
      </div>

      {/* Materials List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Materials ({materials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="size-16 text-[#CBD5E1] mx-auto mb-4" />
              <p className="text-[#64748B] mb-2">No materials uploaded yet</p>
              <p className="text-sm text-[#94A3B8] mb-4">
                Upload course materials to make them available to instructors
              </p>
              <Button onClick={() => setShowUploadModal(true)}>
                <Upload className="size-4 mr-2" />
                Upload First Material
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-start gap-4 p-4 border border-[#E2E8F0] rounded-lg hover:border-[#1E88E5]/20 transition-colors"
                >
                  <div className="text-3xl flex-shrink-0">
                    {courseMaterialService.getFileIcon(material.file_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[#1E293B]">{material.title}</h4>
                    {material.description && (
                      <p className="text-sm text-[#64748B] mt-1 line-clamp-2">
                        {material.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#64748B]">
                      <span>{courseMaterialService.formatFileSize(material.file_size)}</span>
                      <span>•</span>
                      <span>{material.file_type.toUpperCase()}</span>
                      <span>•</span>
                      <span>Uploaded by {material.uploaded_by_name}</span>
                      <span>•</span>
                      <span>{courseMaterialService.formatDate(material.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewLogs(material)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="size-4" />
                      Logs
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(material.id)}
                      className="flex items-center gap-2 text-[#EF4444] border-[#EF4444] hover:bg-[#FEE2E2]"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <MaterialUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        courseId={courseId}
        onSuccess={() => {
          setShowUploadModal(false);
          fetchMaterials();
        }}
      />

      {/* Access Logs Modal */}
      {selectedMaterial && (
        <MaterialAccessLogsModal
          isOpen={showLogsModal}
          onClose={() => {
            setShowLogsModal(false);
            setSelectedMaterial(null);
          }}
          material={selectedMaterial}
        />
      )}
    </div>
  );
}

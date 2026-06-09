'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, Upload, Plus, FileText, Image, Presentation, Trash2, Shield, ExternalLink } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { courseService } from '@/services/courseService';
import { courseMaterialService, type CourseMaterial } from '@/services/courseMaterialService';
import { adminService } from '@/services/adminService';
import SecureFileViewer from '@/components/secure/SecureFileViewer';
import type { CourseInstructor } from '@/types';

interface InstructorOption {
  id: number;
  name: string;
  email: string;
}

interface NewCourseMaterial {
  file: File;
  title: string;
  description: string;
  id: string; // temporary ID for UI
}

export default function AdminEditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const courseId = Number(id);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);
  const [selectedInstructors, setSelectedInstructors] = useState<number[]>([]);
  const [existingMaterials, setExistingMaterials] = useState<CourseMaterial[]>([]);
  const [newMaterials, setNewMaterials] = useState<NewCourseMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [uploadingMaterials, setUploadingMaterials] = useState(false);
  const [viewingMaterial, setViewingMaterial] = useState<CourseMaterial | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    duration_value: '',
    duration_unit: 'days' as 'days' | 'weeks' | 'months',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    language: 'English',
    what_you_learn: '',
    requirements: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, instRes] = await Promise.all([
          courseService.getCourseById(courseId),
          adminService.getUsers('instructor').catch(() => ({ users: [] })),
        ]);
        const c = courseRes.course;
        setCourse(c);
        setInstructors(instRes.users || []);
        setSelectedInstructors(c.instructors?.map((i: CourseInstructor) => i.id) || []);
        setForm({
          title: c.title || '',
          description: c.description || '',
          price: c.price?.toString() || '',
          category_id: c.category_id?.toString() || '',
          duration_value: c.duration_value?.toString() || '',
          duration_unit: c.duration_unit || 'days',
          level: c.level || 'beginner',
          language: c.language || 'English',
          what_you_learn: c.what_you_learn || '',
          requirements: c.requirements || '',
        });

        // Fetch existing course materials
        try {
          setMaterialsLoading(true);
          const materialsRes = await courseMaterialService.getCourseMaterials(courseId);
          setExistingMaterials(materialsRes.materials || []);
        } catch (error) {
          console.error('Failed to fetch course materials:', error);
          setExistingMaterials([]);
        } finally {
          setMaterialsLoading(false);
        }
      } catch {
        alert('Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleInstructor = (instId: number) => {
    setSelectedInstructors((prev) =>
      prev.includes(instId) ? prev.filter((i) => i !== instId) : [...prev, instId]
    );
  };

  // Course Materials Functions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const validation = courseMaterialService.validateFile(file);
      
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      const newMaterial: NewCourseMaterial = {
        file,
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        description: '',
        id: Math.random().toString(36).substring(2, 15) // Temporary ID
      };

      setNewMaterials(prev => [...prev, newMaterial]);
    });

    // Reset file input
    e.target.value = '';
  };

  const updateNewMaterialTitle = (id: string, title: string) => {
    setNewMaterials(prev => 
      prev.map(material => 
        material.id === id ? { ...material, title } : material
      )
    );
  };

  const updateNewMaterialDescription = (id: string, description: string) => {
    setNewMaterials(prev => 
      prev.map(material => 
        material.id === id ? { ...material, description } : material
      )
    );
  };

  const removeNewMaterial = (id: string) => {
    setNewMaterials(prev => prev.filter(material => material.id !== id));
  };

  const deleteExistingMaterial = async (materialId: number) => {
    if (!confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
      return;
    }

    try {
      await courseMaterialService.deleteMaterial(materialId);
      setExistingMaterials(prev => prev.filter(material => material.id !== materialId));
      alert('Material deleted successfully');
    } catch (error) {
      console.error('Failed to delete material:', error);
      alert('Failed to delete material. Please try again.');
    }
  };

  const viewExistingMaterial = (material: CourseMaterial) => {
    setViewingMaterial(material);
  };

  const getFileIcon = (file: File) => {
    const type = courseMaterialService.getFileType(file.type);
    switch (type) {
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

  const getExistingFileIcon = (fileType: string) => {
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

  const uploadNewMaterials = async () => {
    if (newMaterials.length === 0) return;

    setUploadingMaterials(true);
    
    try {
      const uploadPromises = newMaterials.map(material =>
        courseMaterialService.uploadMaterial(courseId, material.file, {
          title: material.title,
          description: material.description
        })
      );

      const results = await Promise.all(uploadPromises);
      
      // Add newly uploaded materials to existing materials
      const uploadedMaterials = results.map(result => result.material);
      setExistingMaterials(prev => [...prev, ...uploadedMaterials]);
      
      // Clear new materials
      setNewMaterials([]);
      
      console.log('All new materials uploaded successfully');
    } catch (error) {
      console.error('Failed to upload some materials:', error);
      throw error; // Re-throw to handle in main submit
    } finally {
      setUploadingMaterials(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Step 1: Update course information
      await courseService.updateCourse(courseId, {
        title: form.title,
        description: form.description || undefined,
        price: form.price ? Number(form.price) : 0,
        category_id: form.category_id ? Number(form.category_id) : undefined,
        duration_value: form.duration_value ? Number(form.duration_value) : 0,
        duration_unit: form.duration_unit,
        level: form.level,
        language: form.language,
        what_you_learn: form.what_you_learn || undefined,
        requirements: form.requirements || undefined,
        instructor_ids: selectedInstructors,
      });

      // Step 2: Upload new materials if any
      if (newMaterials.length > 0) {
        try {
          await uploadNewMaterials();
          alert(`Course updated successfully with ${newMaterials.length} new materials uploaded!`);
        } catch (materialError) {
          alert('Course updated successfully, but some new materials failed to upload. You can try uploading them again.');
        }
      } else {
        alert('Course updated successfully!');
      }
      
      router.push('/admin/courses');
    } catch {
      alert('Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Edit Course</h1>
        <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Course Information</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input label="Course Title" id="title" name="title" value={form.title} onChange={handleChange} required />
              <div className="space-y-1">
                <label htmlFor="description" className="block text-sm font-medium text-text-primary">Description</label>
                <textarea id="description" name="description" rows={4} value={form.description} onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <Input label="Price (₹)" id="price" name="price" type="number" min="0" value={form.price} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Course Details</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Duration Value" id="duration_value" name="duration_value" type="number" min="0" value={form.duration_value} onChange={handleChange} />
                <div className="space-y-1">
                  <label htmlFor="duration_unit" className="block text-sm font-medium text-text-primary">Duration Unit</label>
                  <select id="duration_unit" name="duration_unit" value={form.duration_unit} onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="level" className="block text-sm font-medium text-text-primary">Level</label>
                  <select id="level" name="level" value={form.level} onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <Input label="Language" id="language" name="language" value={form.language} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <label htmlFor="what_you_learn" className="block text-sm font-medium text-text-primary">What You&apos;ll Learn</label>
                <textarea id="what_you_learn" name="what_you_learn" rows={3} value={form.what_you_learn} onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="space-y-1">
                <label htmlFor="requirements" className="block text-sm font-medium text-text-primary">Requirements</label>
                <textarea id="requirements" name="requirements" rows={3} value={form.requirements} onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Materials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Course Materials</span>
            </CardTitle>
            <p className="text-sm text-text-muted mt-1">
              Manage secure course materials. Upload new files, view existing ones, or remove outdated materials.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Existing Materials */}
            {materialsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                <span className="ml-2 text-sm text-text-muted">Loading materials...</span>
              </div>
            ) : existingMaterials.length > 0 ? (
              <div className="space-y-4">
                <h4 className="font-medium text-text-primary flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Existing Materials</span>
                </h4>
                
                <div className="space-y-3">
                  {existingMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="border border-border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          {getExistingFileIcon(material.file_type)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-text-primary truncate">
                              {material.title}
                            </p>
                            <p className="text-sm text-text-muted">
                              {material.file_name} • {courseMaterialService.formatFileSize(material.file_size)}
                            </p>
                            {material.description && (
                              <p className="text-sm text-text-muted mt-1 line-clamp-2">
                                {material.description}
                              </p>
                            )}
                            <p className="text-xs text-text-muted mt-1">
                              Uploaded by {material.uploaded_by_name} • {courseMaterialService.formatDate(material.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => viewExistingMaterial(material)}
                            className="flex items-center space-x-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>View</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteExistingMaterial(material.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-border rounded-lg">
                <FileText className="h-12 w-12 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-muted">No materials uploaded yet</p>
              </div>
            )}

            {/* Upload New Materials */}
            <div className="space-y-4">
              <h4 className="font-medium text-text-primary flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Add New Materials</span>
              </h4>

              {/* File Upload Area */}
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                <input
                  type="file"
                  id="new-course-materials"
                  multiple
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp,.gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="new-course-materials" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-text-muted mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-text-primary mb-2">
                    Upload New Materials
                  </h3>
                  <p className="text-xs text-text-muted mb-3">
                    Drag and drop files here, or click to browse
                  </p>
                  <Button type="button" variant="outline" size="sm">
                    Select Files
                  </Button>
                </label>
              </div>

              <div className="text-xs text-text-muted bg-hover p-3 rounded-lg">
                <strong>Supported formats:</strong> PDF, PPT, Word documents, Images (JPEG, PNG, WebP, GIF)
                <br />
                <strong>Maximum file size:</strong> 100MB per file
              </div>

              {/* New Materials List */}
              {newMaterials.length > 0 && (
                <div className="space-y-3">
                  <h5 className="font-medium text-text-primary flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>New Materials to Upload</span>
                  </h5>
                  
                  {newMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="border border-border rounded-lg p-4 space-y-3 bg-primary-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          {getFileIcon(material.file)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-text-primary truncate">
                              {material.file.name}
                            </p>
                            <p className="text-sm text-text-muted">
                              {courseMaterialService.formatFileSize(material.file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNewMaterial(material.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-1">
                            Title *
                          </label>
                          <Input
                            value={material.title}
                            onChange={(e) => updateNewMaterialTitle(material.id, e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-1">
                            Description
                          </label>
                          <Input
                            value={material.description}
                            onChange={(e) => updateNewMaterialDescription(material.id, e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Assigned Instructors</CardTitle>
              <span className="text-xs text-text-muted">{selectedInstructors.length} selected</span>
            </div>
          </CardHeader>
          <CardContent>
            {instructors.length === 0 ? (
              <p className="text-sm text-text-muted">No instructors available.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {instructors.map((inst) => {
                  const isSelected = selectedInstructors.includes(inst.id);
                  return (
                    <button key={inst.id} type="button" onClick={() => toggleInstructor(inst.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        isSelected ? 'border-primary-500 bg-primary-50' : 'border-border hover:bg-hover'
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isSelected ? 'bg-primary-500 text-text-white' : 'bg-dark-100 text-dark-400'
                        }`}>{inst.name[0]}</div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-text-primary">{inst.name}</p>
                          <p className="text-xs text-text-muted">{inst.email}</p>
                        </div>
                      </div>
                      {isSelected && <Check size={18} className="text-primary-500" />}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving || uploadingMaterials} className="gap-2">
            {saving || uploadingMaterials ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {uploadingMaterials ? 'Uploading Materials...' : 'Saving Changes...'}
              </>
            ) : (
              <>
                Save Changes
                {newMaterials.length > 0 && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    +{newMaterials.length} files
                  </span>
                )}
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>

      {/* Secure File Viewer Modal */}
      {viewingMaterial && (
        <SecureFileViewer
          materialId={viewingMaterial.id}
          fileName={viewingMaterial.file_name}
          onClose={() => setViewingMaterial(null)}
          onSecurityViolation={(type) => {
            console.log(`Security violation: ${type}`);
          }}
        />
      )}
    </div>
  );
}

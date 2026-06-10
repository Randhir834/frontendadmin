'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, X, Upload, Plus, Minus, FileText, Image, Presentation, Trash2, Shield, AlertCircle } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { courseService } from '@/services/courseService';
import { courseMaterialService } from '@/services/courseMaterialService';
import { imageUploadService } from '@/services/imageUploadService';
import api from '@/services/api';

interface InstructorOption {
  id: number;
  name: string;
  email: string;
}

interface CourseMaterial {
  file: File;
  title: string;
  description: string;
  id: string; // temporary ID for UI
}

export default function AdminCreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);
  const [selectedInstructors, setSelectedInstructors] = useState<number[]>([]);
  const [whatYouLearnItems, setWhatYouLearnItems] = useState<string[]>(['']);
  const [requirementItems, setRequirementItems] = useState<string[]>(['']);
  const [courseMaterials, setCourseMaterials] = useState<CourseMaterial[]>([]);
  const [uploadingMaterials, setUploadingMaterials] = useState(false);
  const [courseImage, setCourseImage] = useState<File | null>(null);
  const [courseImagePreview, setCourseImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string>('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    duration_value: '',
    duration_unit: 'days' as 'days' | 'weeks' | 'months',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    language: 'English',
    thumbnail_url: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const instructorsRes = await api.get('/admin/users?role=instructor');
        setInstructors(instructorsRes.data.users || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleInstructor = (id: number) => {
    setSelectedInstructors((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const addWhatYouLearnItem = () => {
    setWhatYouLearnItems([...whatYouLearnItems, '']);
  };

  const removeWhatYouLearnItem = (index: number) => {
    if (whatYouLearnItems.length > 1) {
      setWhatYouLearnItems(whatYouLearnItems.filter((_, i) => i !== index));
    }
  };

  const updateWhatYouLearnItem = (index: number, value: string) => {
    const updated = [...whatYouLearnItems];
    updated[index] = value;
    setWhatYouLearnItems(updated);
  };

  const addRequirementItem = () => {
    setRequirementItems([...requirementItems, '']);
  };

  const removeRequirementItem = (index: number) => {
    if (requirementItems.length > 1) {
      setRequirementItems(requirementItems.filter((_, i) => i !== index));
    }
  };

  const updateRequirementItem = (index: number, value: string) => {
    const updated = [...requirementItems];
    updated[index] = value;
    setRequirementItems(updated);
  };

  // Course Image Upload Functions
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');
    const validation = imageUploadService.validateImage(file);
    
    if (!validation.valid) {
      setImageError(validation.error || 'Invalid image');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setCourseImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    setCourseImage(file);
    e.target.value = '';
  };

  const uploadCourseImage = async (): Promise<string | null> => {
    if (!courseImage) return null;

    try {
      setUploadingImage(true);
      const result = await imageUploadService.uploadImage(courseImage, 'course-thumbnails');
      return result.publicUrl;
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Failed to upload image';
      setImageError(message);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const removeCourseImage = () => {
    setCourseImage(null);
    setCourseImagePreview('');
    setImageError('');
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

      const newMaterial: CourseMaterial = {
        file,
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        description: '',
        id: Math.random().toString(36).substring(2, 15) // Temporary ID
      };

      setCourseMaterials(prev => [...prev, newMaterial]);
    });

    // Reset file input
    e.target.value = '';
  };

  const updateMaterialTitle = (id: string, title: string) => {
    setCourseMaterials(prev => 
      prev.map(material => 
        material.id === id ? { ...material, title } : material
      )
    );
  };

  const updateMaterialDescription = (id: string, description: string) => {
    setCourseMaterials(prev => 
      prev.map(material => 
        material.id === id ? { ...material, description } : material
      )
    );
  };

  const removeMaterial = (id: string) => {
    setCourseMaterials(prev => prev.filter(material => material.id !== id));
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

  const uploadCourseMaterials = async (courseId: number) => {
    if (courseMaterials.length === 0) return;

    setUploadingMaterials(true);
    
    try {
      const uploadPromises = courseMaterials.map(material =>
        courseMaterialService.uploadMaterial(courseId, material.file, {
          title: material.title,
          description: material.description
        })
      );

      await Promise.all(uploadPromises);
      console.log('All course materials uploaded successfully');
    } catch (error) {
      console.error('Failed to upload some materials:', error);
      throw error; // Re-throw to handle in main submit
    } finally {
      setUploadingMaterials(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      alert('Course title is required');
      return;
    }

    if (!form.description.trim()) {
      alert('Course description is required');
      return;
    }

    if (selectedInstructors.length === 0) {
      alert('Please select at least one instructor');
      return;
    }

    try {
      setLoading(true);
      
      let thumbnailUrl = form.thumbnail_url;

      // Step 0: Upload course image if provided
      if (courseImage) {
        const uploadedUrl = await uploadCourseImage();
        if (uploadedUrl) {
          thumbnailUrl = uploadedUrl;
        } else {
          alert('Failed to upload course image. Please try again.');
          return;
        }
      }
      
      const courseData = {
        ...form,
        thumbnail_url: thumbnailUrl,
        price: parseFloat(form.price) || 0,
        duration_value: parseInt(form.duration_value) || 1,
        what_you_learn: whatYouLearnItems.filter(item => item.trim()).join('\n'),
        requirements: requirementItems.filter(item => item.trim()).join('\n'),
        instructor_ids: selectedInstructors,
      };

      // Step 1: Create the course
      const response = await courseService.createCourse(courseData);
      
      if (response.course) {
        // Step 2: Upload course materials if any
        if (courseMaterials.length > 0) {
          try {
            await uploadCourseMaterials(response.course.id);
            alert(`Course created successfully with ${courseMaterials.length} materials uploaded!`);
          } catch (materialError) {
            alert('Course created successfully, but some materials failed to upload. You can add them later.');
          }
        } else {
          alert('Course created successfully!');
        }
        
        router.push(`/admin/courses/${response.course.id}`);
      }
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Failed to create course';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1000px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#1E293B]">Create New Course</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Add a new course to the platform
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Course Title *
              </label>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter course title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe what this course is about..."
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B8A44] focus:border-transparent resize-none"
              />
            </div>

            {/* Course Image Upload */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Course Thumbnail Image
              </label>
              
              {imageError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{imageError}</p>
                </div>
              )}

              {!courseImagePreview ? (
                <div className="border-2 border-dashed border-[#E2E8F0] rounded-lg p-6 text-center hover:border-[#1B8A44] transition-colors">
                  <input
                    type="file"
                    id="course-image"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  <label htmlFor="course-image" className="cursor-pointer">
                    <Image className="h-12 w-12 text-[#64748B] mx-auto mb-2" />
                    <h3 className="text-sm font-medium text-[#1E293B] mb-1">
                      Upload Course Image
                    </h3>
                    <p className="text-xs text-[#64748B] mb-3">
                      Click to browse or drag and drop
                    </p>
                  </label>
                </div>
              ) : (
                <div className="border border-[#E2E8F0] rounded-lg p-4 space-y-3">
                  <div className="relative">
                    <img
                      src={courseImagePreview}
                      alt="Course thumbnail preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeCourseImage}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-[#64748B]">
                    <p><strong>File:</strong> {courseImage?.name}</p>
                    <p><strong>Size:</strong> {imageUploadService.formatFileSize(courseImage?.size || 0)}</p>
                  </div>
                </div>
              )}

              <div className="mt-2 text-xs text-[#64748B] bg-[#F8FAFC] p-3 rounded-lg">
                <strong>Requirements:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Supported formats: JPEG, PNG, WebP, GIF</li>
                  <li>Maximum file size: 5MB</li>
                  <li>Recommended dimensions: 1200x675px (16:9 aspect ratio)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Details */}
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Price (₹)
                </label>
                <Input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Level
                </label>
                <select
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B8A44] focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Language
                </label>
                <Input
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                  placeholder="English"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Duration
                </label>
                <Input
                  name="duration_value"
                  type="number"
                  min="1"
                  value={form.duration_value}
                  onChange={handleChange}
                  placeholder="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Duration Unit
                </label>
                <select
                  name="duration_unit"
                  value={form.duration_unit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B8A44] focus:border-transparent"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What You'll Learn */}
        <Card>
          <CardHeader>
            <CardTitle>What You'll Learn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {whatYouLearnItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateWhatYouLearnItem(index, e.target.value)}
                  placeholder="Enter a learning outcome"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeWhatYouLearnItem(index)}
                  disabled={whatYouLearnItems.length === 1}
                  className="px-2"
                >
                  <Minus className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addWhatYouLearnItem}
              className="flex items-center gap-2"
            >
              <Plus className="size-4" />
              Add Learning Outcome
            </Button>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requirementItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateRequirementItem(index, e.target.value)}
                  placeholder="Enter a requirement"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRequirementItem(index)}
                  disabled={requirementItems.length === 1}
                  className="px-2"
                >
                  <Minus className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRequirementItem}
              className="flex items-center gap-2"
            >
              <Plus className="size-4" />
              Add Requirement
            </Button>
          </CardContent>
        </Card>

        {/* Instructors */}
        <Card>
          <CardHeader>
            <CardTitle>Assign Instructors *</CardTitle>
          </CardHeader>
          <CardContent>
            {instructors.length === 0 ? (
              <p className="text-sm text-[#64748B]">No instructors available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {instructors.map((instructor) => (
                  <div
                    key={instructor.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedInstructors.includes(instructor.id)
                        ? 'border-[#1B8A44] bg-[#1B8A44]/5'
                        : 'border-[#E2E8F0] hover:border-[#1B8A44]/50'
                    }`}
                    onClick={() => toggleInstructor(instructor.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-[#1E293B]">{instructor.name}</h4>
                        <p className="text-sm text-[#64748B]">{instructor.email}</p>
                      </div>
                      {selectedInstructors.includes(instructor.id) && (
                        <Check className="size-5 text-[#1B8A44]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Materials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Secure Course Materials</span>
            </CardTitle>
            <p className="text-sm text-[#64748B] mt-1">
              Upload PDFs, PPTs, and images that will be securely accessible only to assigned instructors.
              Files are protected against downloads and screenshots.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-[#E2E8F0] rounded-lg p-6 text-center hover:border-[#1B8A44] transition-colors">
              <input
                type="file"
                id="course-materials"
                multiple
                accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp,.gif"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="course-materials" className="cursor-pointer">
                <Upload className="h-12 w-12 text-[#64748B] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#1E293B] mb-2">
                  Upload Course Materials
                </h3>
                <p className="text-sm text-[#64748B] mb-4">
                  Drag and drop files here, or click to browse
                </p>
              </label>
            </div>

            <div className="text-xs text-[#64748B] bg-[#F8FAFC] p-3 rounded-lg">
              <strong>Supported formats:</strong> PDF, PPT, Word documents, Images (JPEG, PNG, WebP, GIF)
              <br />
              <strong>Maximum file size:</strong> 100MB per file
              <br />
              <strong>Security:</strong> Files will be encrypted and protected against downloads/screenshots
            </div>

            {/* Uploaded Materials List */}
            {courseMaterials.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-[#1E293B] flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Materials to Upload ({courseMaterials.length})</span>
                </h4>
                
                {courseMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="border border-[#E2E8F0] rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        {getFileIcon(material.file)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#1E293B] truncate">
                            {material.file.name}
                          </p>
                          <p className="text-sm text-[#64748B]">
                            {courseMaterialService.formatFileSize(material.file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMaterial(material.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[#374151] mb-1">
                          Title *
                        </label>
                        <Input
                          value={material.title}
                          onChange={(e) => updateMaterialTitle(material.id, e.target.value)}
                          placeholder="Enter material title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#374151] mb-1">
                          Description
                        </label>
                        <Input
                          value={material.description}
                          onChange={(e) => updateMaterialDescription(material.id, e.target.value)}
                          placeholder="Optional description"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading || uploadingMaterials || uploadingImage}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || uploadingMaterials || uploadingImage}
            className="flex items-center gap-2"
          >
            {loading || uploadingMaterials || uploadingImage ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {uploadingImage ? 'Uploading Image...' : uploadingMaterials ? 'Uploading Materials...' : 'Creating Course...'}
              </>
            ) : (
              <>
                Create Course
                {courseMaterials.length > 0 && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    +{courseMaterials.length} files
                  </span>
                )}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

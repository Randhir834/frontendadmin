'use client';

import { useEffect, useMemo, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Loader2, Users, Edit, Calendar, Clock, DollarSign, Target, 
  CheckCircle, BookOpen, FileText, TrendingUp, Award, UserCheck,
  Search, ExternalLink, GraduationCap
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { courseService } from '@/services/courseService';
import type { Course, EnrolledStudent, CourseMaterial, EnrollmentStats } from '@/types';

export default function AdminCourseViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const courseId = Number(id);
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollmentStats, setEnrollmentStats] = useState<EnrollmentStats | null>(null);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        
        // Fetch course details
        const courseRes = await courseService.getCourseById(courseId);
        setCourse(courseRes.course || null);

        // Fetch enrollment stats
        try {
          const statsRes = await courseService.getCourseEnrollmentStats(courseId);
          setEnrollmentStats(statsRes.stats || null);
        } catch (error) {
          console.error('Failed to fetch enrollment stats:', error);
          setEnrollmentStats(null);
        }

      } catch (error) {
        console.error('Failed to fetch course:', error);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId]);

  // Fetch enrolled students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setStudentsLoading(true);
        const res = await courseService.getCourseEnrollments(courseId, {
          sort_by: 'enrolled_at',
          sort_order: 'desc'
        });
        setStudents(res.enrollments || []);
      } catch (error) {
        console.error('Failed to fetch students:', error);
        setStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };
    fetchStudents();
  }, [courseId]);

  // Fetch course materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setMaterialsLoading(true);
        const res = await courseService.getCourseMaterials(courseId);
        setMaterials(res.materials || []);
      } catch (error) {
        console.error('Failed to fetch materials:', error);
        setMaterials([]);
      } finally {
        setMaterialsLoading(false);
      }
    };
    fetchMaterials();
  }, [courseId]);

  const instructorNames = useMemo(() => {
    if (!course?.instructors?.length) return '';
    return course.instructors.map((i) => i.name).join(', ');
  }, [course]);

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    const lower = searchTerm.toLowerCase();
    return students.filter(s => 
      s.student_name.toLowerCase().includes(lower) || 
      s.student_email.toLowerCase().includes(lower)
    );
  }, [students, searchTerm]);

  const levelLabel: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝';
    if (mimeType?.includes('image')) return '🖼️';
    if (mimeType?.includes('video')) return '🎥';
    if (mimeType?.includes('audio')) return '🎵';
    return '📎';
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

  if (!course) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="size-12 text-dark-200 mx-auto mb-3" />
              <p className="text-sm text-text-muted">Course not found.</p>
              <div className="mt-4">
                <Button variant="outline" onClick={() => router.push('/admin/courses')}>Back to Courses</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">{course.title}</h1>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              course.status === 'published' ? 'bg-success-100 text-success-700' :
              course.status === 'archived' ? 'bg-error-100 text-error-700' :
              'bg-dark-100 text-dark-600'
            }`}>
              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
            </span>
          </div>
          {course.category_name && (
            <p className="text-sm text-text-muted">Category: {course.category_name}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/admin/courses/${course.id}/materials`}>
            <Button variant="outline" className="gap-2">
              <FileText size={16} /> Materials
            </Button>
          </Link>
          <Link href={`/admin/courses/${course.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit size={16} /> Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Enrollment Statistics */}
      {enrollmentStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted mb-1">Total Students</p>
                  <p className="text-2xl font-bold text-text-primary">{enrollmentStats.total_students}</p>
                </div>
                <Users className="size-8 text-primary-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted mb-1">Active Students</p>
                  <p className="text-2xl font-bold text-success-600">{enrollmentStats.active_students}</p>
                </div>
                <UserCheck className="size-8 text-success-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted mb-1">Completed</p>
                  <p className="text-2xl font-bold text-primary-600">{enrollmentStats.students_completed_course}</p>
                </div>
                <Award className="size-8 text-primary-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted mb-1">Avg. Progress</p>
                  <p className="text-2xl font-bold text-warning-600">{enrollmentStats.average_progress || 0}%</p>
                </div>
                <TrendingUp className="size-8 text-warning-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Course Overview */}
          <Card>
            <CardHeader><CardTitle>Course Overview</CardTitle></CardHeader>
            <CardContent>
              {course.description ? (
                <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">{course.description}</p>
              ) : (
                <p className="text-sm text-text-muted">No description provided.</p>
              )}
            </CardContent>
          </Card>

          {/* Learning & Requirements */}
          <Card>
            <CardHeader><CardTitle>Learning & Requirements</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-text-primary mb-2">What you'll learn</p>
                {course.what_you_learn ? (
                  <div className="space-y-1">
                    {course.what_you_learn.split('\n').filter(item => item.trim()).map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-success-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-text-secondary">{item.trim()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">Not set</p>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary mb-2">Requirements</p>
                {course.requirements ? (
                  <div className="space-y-1">
                    {course.requirements.split('\n').filter(item => item.trim()).map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="size-1.5 bg-dark-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-text-secondary">{item.trim()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">Not set</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enrolled Students */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Enrolled Students ({students.length})</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-sm border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-primary-500" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="size-12 text-dark-200 mx-auto mb-3" />
                  <p className="text-sm text-text-muted">
                    {searchTerm ? 'No students found matching your search' : 'No students enrolled yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border border-dark-100 rounded-lg hover:border-primary-200 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="size-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="size-5 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-text-primary truncate">{student.student_name}</h4>
                          <p className="text-xs text-text-muted truncate">{student.student_email}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                            <span>Progress: {student.progress || 0}%</span>
                            <span>•</span>
                            <span className={`px-1.5 py-0.5 rounded ${
                              student.status === 'active' ? 'bg-success-100 text-success-700' :
                              student.status === 'completed' ? 'bg-primary-100 text-primary-700' :
                              'bg-dark-100 text-dark-600'
                            }`}>
                              {student.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-text-muted">
                          Enrolled: {new Date(student.enrolled_at).toLocaleDateString()}
                        </p>
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
              <div className="flex items-center justify-between">
                <CardTitle>Course Materials ({materials.length})</CardTitle>
                <Link href={`/admin/courses/${course.id}/materials`}>
                  <Button variant="outline" size="sm">
                    Manage Materials
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {materialsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-primary-500" />
                </div>
              ) : materials.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="size-12 text-dark-200 mx-auto mb-3" />
                  <p className="text-sm text-text-muted">No materials uploaded yet</p>
                  <Link href={`/admin/courses/${course.id}/materials`} className="inline-block mt-3">
                    <Button variant="outline" size="sm">Upload Materials</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {materials.slice(0, 5).map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-3 border border-dark-100 rounded-lg hover:border-primary-200 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="text-2xl">{getFileIcon(material.mime_type)}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-text-primary truncate">{material.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                            <span>{formatFileSize(material.file_size)}</span>
                            <span>•</span>
                            <span>{new Date(material.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {materials.length > 5 && (
                    <Link href={`/admin/courses/${course.id}/materials`} className="block text-center">
                      <Button variant="outline" size="sm" className="mt-2">
                        View All {materials.length} Materials
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-4">
          {/* Course Details */}
          <Card>
            <CardHeader><CardTitle>Course Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Price</p>
                  <p className="text-sm font-semibold text-text-primary">₹{course.price}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Duration</p>
                  <p className="text-sm font-semibold text-text-primary">{course.duration_value} {course.duration_unit}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target size={16} className="text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Level</p>
                  <p className="text-sm font-semibold text-text-primary">{levelLabel[course.level] || course.level}</p>
                </div>
              </div>
              {course.language && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-text-muted" />
                  <div>
                    <p className="text-xs text-text-muted">Language</p>
                    <p className="text-sm font-semibold text-text-primary">{course.language}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructors */}
          <Card>
            <CardHeader><CardTitle>Instructors</CardTitle></CardHeader>
            <CardContent>
              {course.instructors && course.instructors.length > 0 ? (
                <div className="space-y-2">
                  {course.instructors.map((instructor) => (
                    <div key={instructor.id} className="flex items-center gap-2">
                      <Users size={16} className="text-text-muted flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary truncate">{instructor.name}</p>
                        <p className="text-xs text-text-muted truncate">{instructor.email}</p>
                      </div>
                      {instructor.is_primary && (
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">Primary</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">No instructors assigned.</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/admin/courses/${course.id}/lessons`} className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <BookOpen size={16} />
                  Manage Lessons
                </Button>
              </Link>
              <Link href={`/admin/courses/${course.id}/materials`} className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText size={16} />
                  Manage Materials
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

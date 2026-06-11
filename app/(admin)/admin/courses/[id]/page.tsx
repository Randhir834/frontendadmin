'use client';

import { useEffect, useMemo, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Loader2, Users, Edit, Clock, DollarSign, Target, 
  CheckCircle, BookOpen, FileText, TrendingUp, Award, UserCheck,
  Search, ExternalLink, GraduationCap
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { courseService } from '@/services/courseService';
import type { Course, EnrolledStudent, EnrollmentStats } from '@/types';

export default function AdminCourseViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const courseId = Number(id);
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollmentStats, setEnrollmentStats] = useState<EnrollmentStats | null>(null);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);

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

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-10 animate-spin text-[#1B8A44]" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-4 md:p-8">
        <Card>
          <CardContent>
            <div className="text-center py-16">
              <BookOpen className="size-20 text-[#CBD5E1] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1E293B] mb-2">Course not found</h3>
              <p className="text-sm text-[#64748B] mb-6">The course you're looking for doesn't exist or has been removed.</p>
              <Button variant="outline" onClick={() => router.push('/admin/courses')}>
                Back to Courses
              </Button>
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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl md:text-2xl font-bold text-[#1E293B]">{course.title}</h1>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              course.status === 'published' ? 'bg-[#DCFCE7] text-[#166534]' :
              course.status === 'archived' ? 'bg-[#FEE2E2] text-[#991B1B]' :
              'bg-[#F1F5F9] text-[#475569]'
            }`}>
              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
            </span>
          </div>
          {course.category_name && (
            <p className="text-sm text-[#64748B]">Category: {course.category_name}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/admin/courses/${course.id}/edit`}>
            <Button className="gap-2">
              <Edit size={16} /> Edit Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Enrollment Statistics */}
      {enrollmentStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#DBEAFE] rounded-full flex items-center justify-center flex-shrink-0">
                  <Users size={22} className="text-[#3B82F6]" />
                </div>
                <div>
                  <p className="text-xs text-[#64748B] mb-0.5">Total Students</p>
                  <p className="text-2xl font-bold text-[#1E293B]">{enrollmentStats.total_students}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#DCFCE7] rounded-full flex items-center justify-center flex-shrink-0">
                  <UserCheck size={22} className="text-[#16A34A]" />
                </div>
                <div>
                  <p className="text-xs text-[#64748B] mb-0.5">Active Students</p>
                  <p className="text-2xl font-bold text-[#1E293B]">{enrollmentStats.active_students}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E0F2FE] rounded-full flex items-center justify-center flex-shrink-0">
                  <Award size={22} className="text-[#0284C7]" />
                </div>
                <div>
                  <p className="text-xs text-[#64748B] mb-0.5">Completed</p>
                  <p className="text-2xl font-bold text-[#1E293B]">{enrollmentStats.students_completed_course}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FEF3C7] rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={22} className="text-[#F59E0B]" />
                </div>
                <div>
                  <p className="text-xs text-[#64748B] mb-0.5">Avg. Progress</p>
                  <p className="text-2xl font-bold text-[#1E293B]">{enrollmentStats.average_progress || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Course Overview */}
          <Card>
            <CardHeader><CardTitle>Course Overview</CardTitle></CardHeader>
            <CardContent>
              {course.description ? (
                <p className="text-sm text-[#475569] whitespace-pre-line leading-relaxed">{course.description}</p>
              ) : (
                <p className="text-sm text-[#94A3B8]">No description provided.</p>
              )}
            </CardContent>
          </Card>

          {/* Learning & Requirements */}
          <Card>
            <CardHeader><CardTitle>Learning & Requirements</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-[#1E293B] mb-3">What you'll learn</p>
                {course.what_you_learn ? (
                  <div className="space-y-2">
                    {course.what_you_learn.split('\n').filter(item => item.trim()).map((item, index) => (
                      <div key={index} className="flex items-start gap-2.5">
                        <CheckCircle size={18} className="text-[#16A34A] mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-[#475569]">{item.trim()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#94A3B8]">Not set</p>
                )}
              </div>
              <div className="border-t border-[#E2E8F0] pt-6">
                <p className="text-sm font-semibold text-[#1E293B] mb-3">Requirements</p>
                {course.requirements ? (
                  <div className="space-y-2">
                    {course.requirements.split('\n').filter(item => item.trim()).map((item, index) => (
                      <div key={index} className="flex items-start gap-2.5">
                        <div className="size-1.5 bg-[#94A3B8] rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-[#475569]">{item.trim()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#94A3B8]">Not set</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enrolled Students */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle>Enrolled Students ({students.length})</CardTitle>
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B8A44] focus:border-transparent w-full sm:w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-6 animate-spin text-[#1B8A44]" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="size-16 text-[#CBD5E1] mx-auto mb-4" />
                  <p className="text-sm text-[#64748B] font-medium">
                    {searchTerm ? 'No students found matching your search' : 'No students enrolled yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border border-[#E2E8F0] rounded-lg hover:border-[#1B8A44] hover:shadow-sm transition-all">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="size-12 bg-[#E0F2FE] rounded-full flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="size-6 text-[#0284C7]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[#1E293B] truncate">{student.student_name}</h4>
                          <p className="text-xs text-[#64748B] truncate">{student.student_email}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <span className={`px-2 py-1 rounded font-medium ${
                              student.status === 'active' ? 'bg-[#DCFCE7] text-[#166534]' :
                              student.status === 'completed' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                              'bg-[#F1F5F9] text-[#475569]'
                            }`}>
                              {student.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-[#94A3B8]">Enrolled</p>
                        <p className="text-xs font-medium text-[#64748B]">
                          {new Date(student.enrolled_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-4 md:space-y-6">
          {/* Course Details */}
          <Card>
            <CardHeader><CardTitle>Course Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-lg">
                <div className="p-2 bg-white rounded-lg">
                  <DollarSign size={18} className="text-[#16A34A]" />
                </div>
                <div>
                  <p className="text-xs text-[#64748B] mb-0.5">Price</p>
                  <p className="text-base font-bold text-[#1E293B]">₹{course.price.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-lg">
                <div className="p-2 bg-white rounded-lg">
                  <Clock size={18} className="text-[#F59E0B]" />
                </div>
                <div>
                  <p className="text-xs text-[#64748B] mb-0.5">Duration</p>
                  <p className="text-base font-bold text-[#1E293B]">{course.duration_value} {course.duration_unit}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-lg">
                <div className="p-2 bg-white rounded-lg">
                  <Target size={18} className="text-[#8B5CF6]" />
                </div>
                <div>
                  <p className="text-xs text-[#64748B] mb-0.5">Level</p>
                  <p className="text-base font-bold text-[#1E293B]">{levelLabel[course.level] || course.level}</p>
                </div>
              </div>
              {course.language && (
                <div className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-lg">
                  <div className="p-2 bg-white rounded-lg">
                    <BookOpen size={18} className="text-[#3B82F6]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B] mb-0.5">Language</p>
                    <p className="text-base font-bold text-[#1E293B]">{course.language}</p>
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
                <div className="space-y-3">
                  {course.instructors.map((instructor) => (
                    <div key={instructor.id} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg">
                      <div className="size-10 bg-[#E0F2FE] rounded-full flex items-center justify-center flex-shrink-0">
                        <Users size={18} className="text-[#0284C7]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[#1E293B] truncate">{instructor.name}</p>
                          {instructor.is_primary && (
                            <span className="text-xs bg-[#DBEAFE] text-[#1E40AF] px-2 py-0.5 rounded font-medium">Primary</span>
                          )}
                        </div>
                        <p className="text-xs text-[#64748B] truncate">{instructor.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#94A3B8] text-center py-4">No instructors assigned.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

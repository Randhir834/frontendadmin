'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { 
  GraduationCap,
  BookOpen,
  Video,
  CheckCircle,
  Calendar,
  Clock,
  Mail,
  Phone,
  MapPin,
  School,
  User,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface LiveClass {
  id: number;
  title: string;
  description?: string;
  meet_link: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  created_by_name: string;
}

interface Enrollment {
  enrollment_id: number;
  course_id: number;
  course_title: string;
  course_description: string;
  thumbnail_url?: string;
  enrollment_status: string;
  enrolled_at: string;
  completed_at?: string;
  total_lessons: number;
  manual_completed_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  live_classes: LiveClass[];
  total_live_classes: number;
  level?: string;
  duration_value?: number;
  duration_unit?: string;
}

interface StudentData {
  student: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    date_of_birth?: string;
    age?: number;
    school?: string;
    grade?: string;
    parent_guardian_name?: string;
    location?: string;
    created_at: string;
  };
  enrollments: Enrollment[];
  statistics: {
    total_enrollments: number;
    total_live_classes_scheduled: number;
    total_lessons_completed: number;
    total_lessons: number;
    overall_progress_percentage: number;
  };
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id as string;

  const [data, setData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/students/${studentId}/stats`);
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#6366F1]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p className="text-[#64748B]">Student not found</p>
      </div>
    );
  }

  const { student, enrollments, statistics } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B]">Student Details</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Comprehensive overview of student progress and enrollments
        </p>
      </div>

      {/* Student Profile Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {student.avatar_url ? (
              <img
                src={student.avatar_url}
                alt={student.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#6366F1] flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {student.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Student Info */}
          <div className="flex-grow space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1E293B]">{student.name}</h2>
              <p className="text-[#64748B] text-sm mt-1">
                Member since {new Date(student.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {student.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-[#64748B]" />
                  <span className="text-[#1E293B]">{student.email}</span>
                </div>
              )}
              {student.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-[#64748B]" />
                  <span className="text-[#1E293B]">{student.phone}</span>
                </div>
              )}
              {student.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-[#64748B]" />
                  <span className="text-[#1E293B]">{student.location}</span>
                </div>
              )}
              {student.school && (
                <div className="flex items-center gap-2 text-sm">
                  <School className="w-4 h-4 text-[#64748B]" />
                  <span className="text-[#1E293B]">{student.school}</span>
                </div>
              )}
              {student.grade && (
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-[#64748B]" />
                  <span className="text-[#1E293B]">Grade {student.grade}</span>
                </div>
              )}
              {student.age && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-[#64748B]" />
                  <span className="text-[#1E293B]">{student.age} years old</span>
                </div>
              )}
            </div>

            {student.parent_guardian_name && (
              <div className="pt-4 border-t border-[#E2E8F0]">
                <p className="text-sm text-[#64748B]">
                  Parent/Guardian: <span className="text-[#1E293B] font-medium">{student.parent_guardian_name}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">Total Enrollments</p>
              <p className="text-2xl font-bold text-[#1E293B] mt-1">
                {statistics.total_enrollments}
              </p>
            </div>
            <div className="bg-[#DBEAFE] p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-[#3B82F6]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">Live Classes</p>
              <p className="text-2xl font-bold text-[#1E293B] mt-1">
                {statistics.total_live_classes_scheduled}
              </p>
            </div>
            <div className="bg-[#FEF3C7] p-3 rounded-lg">
              <Video className="w-6 h-6 text-[#F59E0B]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">Lessons Completed</p>
              <p className="text-2xl font-bold text-[#1E293B] mt-1">
                {statistics.total_lessons_completed}/{statistics.total_lessons}
              </p>
            </div>
            <div className="bg-[#D1FAE5] p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-[#10B981]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">Overall Progress</p>
              <p className="text-2xl font-bold text-[#1E293B] mt-1">
                {statistics.overall_progress_percentage}%
              </p>
            </div>
            <div className="bg-[#F1F5F9] p-3 rounded-lg">
              <GraduationCap className="w-6 h-6 text-[#6366F1]" />
            </div>
          </div>
        </div>
      </div>

      {/* Course Enrollments */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#1E293B]">Course Enrollments & Progress</h2>
        
        {enrollments.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
            <BookOpen className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
            <p className="text-[#64748B]">No course enrollments yet</p>
          </div>
        ) : (
          enrollments.map((enrollment) => (
            <div key={enrollment.enrollment_id} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              {/* Course Header */}
              <div className="p-6 border-b border-[#E2E8F0]">
                <div className="flex flex-col md:flex-row gap-4">
                  {enrollment.thumbnail_url && (
                    <img
                      src={enrollment.thumbnail_url}
                      alt={enrollment.course_title}
                      className="w-full md:w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#1E293B]">{enrollment.course_title}</h3>
                        <p className="text-sm text-[#64748B] mt-1">{enrollment.course_description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        enrollment.enrollment_status === 'completed'
                          ? 'bg-[#D1FAE5] text-[#065F46]'
                          : 'bg-[#DBEAFE] text-[#1E40AF]'
                      }`}>
                        {enrollment.enrollment_status}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-[#64748B]">
                      <span>Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                      {enrollment.level && <span>Level: {enrollment.level}</span>}
                      {enrollment.duration_value && enrollment.duration_unit && (
                        <span>Duration: {enrollment.duration_value} {enrollment.duration_unit}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="p-6 bg-[#F8FAFC]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Lesson Progress */}
                  <div>
                    <p className="text-sm font-medium text-[#64748B] mb-2">Lesson Progress</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#1E293B]">
                          {enrollment.completed_lessons} / {enrollment.total_lessons} lessons
                        </span>
                        <span className="text-sm font-medium text-[#6366F1]">
                          {enrollment.progress_percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                        <div
                          className="bg-[#6366F1] h-2 rounded-full transition-all"
                          style={{ width: `${enrollment.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Classes */}
                  <div>
                    <p className="text-sm font-medium text-[#64748B] mb-2">Live Classes Scheduled</p>
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-[#F59E0B]" />
                      <span className="text-2xl font-bold text-[#1E293B]">
                        {enrollment.total_live_classes}
                      </span>
                    </div>
                  </div>

                  {/* Completion Status */}
                  <div>
                    <p className="text-sm font-medium text-[#64748B] mb-2">Status</p>
                    {enrollment.completed_at ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-[#10B981]" />
                        <span className="text-sm text-[#1E293B]">
                          Completed on {new Date(enrollment.completed_at).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[#3B82F6]" />
                        <span className="text-sm text-[#1E293B]">In Progress</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Live Classes List */}
              {enrollment.live_classes.length > 0 && (
                <div className="p-6 border-t border-[#E2E8F0]">
                  <h4 className="font-medium text-[#1E293B] mb-4">Scheduled Live Classes</h4>
                  <div className="space-y-3">
                    {enrollment.live_classes.map((liveClass) => (
                      <div
                        key={liveClass.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]"
                      >
                        <div className="flex-grow">
                          <h5 className="font-medium text-[#1E293B]">{liveClass.title}</h5>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#64748B]">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(liveClass.scheduled_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(liveClass.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span>{liveClass.duration_minutes} min</span>
                            <span>By: {liveClass.created_by_name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            liveClass.status === 'completed'
                              ? 'bg-[#D1FAE5] text-[#065F46]'
                              : liveClass.status === 'cancelled'
                              ? 'bg-[#FEE2E2] text-[#991B1B]'
                              : 'bg-[#DBEAFE] text-[#1E40AF]'
                          }`}>
                            {liveClass.status}
                          </span>
                          <a
                            href={liveClass.meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-[#E2E8F0] rounded transition-colors"
                            title="Open Meet Link"
                          >
                            <ExternalLink className="w-4 h-4 text-[#6366F1]" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

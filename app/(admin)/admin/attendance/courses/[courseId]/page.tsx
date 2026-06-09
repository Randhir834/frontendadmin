'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, TrendingUp, TrendingDown, Calendar, Download, Loader2, CheckCircle2, XCircle, Clock, BarChart3 } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { attendanceService, type AttendanceSummary } from '@/services/attendanceService';
import { courseService } from '@/services/courseService';
import type { Course } from '@/types';

export default function AdminCourseAttendancePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const courseIdNum = Number(courseId);

  const [course, setCourse] = useState<Course | null>(null);
  const [summary, setSummary] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'attendance'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseData, summaryData] = await Promise.all([
          courseService.getCourseById(courseIdNum),
          attendanceService.getAttendanceSummary(courseIdNum)
        ]);
        
        setCourse(courseData.course);
        setSummary(summaryData.summary || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseIdNum]);

  const sortedSummary = [...summary].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.student_name.localeCompare(b.student_name)
        : b.student_name.localeCompare(a.student_name);
    } else {
      return sortOrder === 'asc'
        ? (a.attendance_percentage || 0) - (b.attendance_percentage || 0)
        : (b.attendance_percentage || 0) - (a.attendance_percentage || 0);
    }
  });

  const toggleSort = (field: 'name' | 'attendance') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-[#1E88E5] bg-[#C5E1A5]';
    if (percentage >= 75) return 'text-[#0891B2] bg-[#CFFAFE]';
    if (percentage >= 60) return 'text-[#D97706] bg-[#FEF3C7]';
    return 'text-[#EC407A] bg-[#FEE2E2]';
  };

  const getAttendanceIcon = (percentage: number) => {
    if (percentage >= 75) return <TrendingUp className="size-4" />;
    return <TrendingDown className="size-4" />;
  };

  // Calculate overall stats
  const totalClasses = summary.length > 0 ? Math.max(...summary.map(s => s.total_classes)) : 0;
  const avgAttendance = summary.length > 0
    ? (summary.reduce((sum, s) => sum + (s.attendance_percentage || 0), 0) / summary.length).toFixed(1)
    : '0';
  const studentsAbove90 = summary.filter(s => (s.attendance_percentage || 0) >= 90).length;
  const studentsBelow60 = summary.filter(s => (s.attendance_percentage || 0) < 60).length;

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-[#1E88E5]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/attendance">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-[#1E3A5F]">
            {course?.title || 'Course'} - Attendance Analytics
          </h1>
          <p className="text-sm text-[#78909C]">Detailed attendance statistics and student performance</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => attendanceService.exportCourseSummaryCSV(courseIdNum)}
        >
          <Download className="size-4" />
          Export Report
        </Button>
      </div>

      {/* Course Info Card */}
      {course && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-[#78909C]">Instructor</div>
                <div className="text-base font-medium text-[#1E3A5F] mt-1">
                  {course.instructor_name || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-[#78909C]">Category</div>
                <div className="text-base font-medium text-[#1E3A5F] mt-1">
                  {course.category_name || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-[#78909C]">Level</div>
                <div className="text-base font-medium text-[#1E3A5F] mt-1 capitalize">
                  {course.level || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-[#78909C]">Duration</div>
                <div className="text-base font-medium text-[#1E3A5F] mt-1">
                  {course.duration_value} {course.duration_unit}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Users className="size-5 text-[#78909C] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#1E3A5F]">{summary.length}</div>
              <div className="text-sm text-[#78909C]">Total Students</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Calendar className="size-5 text-[#78909C] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#1E3A5F]">{totalClasses}</div>
              <div className="text-sm text-[#78909C]">Total Classes</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <TrendingUp className="size-5 text-[#1E88E5] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#1E88E5]">{avgAttendance}%</div>
              <div className="text-sm text-[#78909C]">Avg Attendance</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <CheckCircle2 className="size-5 text-[#1E88E5] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#1E88E5]">{studentsAbove90}</div>
              <div className="text-sm text-[#78909C]">Above 90%</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <XCircle className="size-5 text-[#EC407A] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#EC407A]">{studentsBelow60}</div>
              <div className="text-sm text-[#78909C]">Below 60%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#78909C]">Excellent (90-100%)</div>
                <div className="text-2xl font-bold text-[#1E88E5] mt-1">
                  {summary.filter(s => (s.attendance_percentage || 0) >= 90).length}
                </div>
                <div className="text-xs text-[#78909C] mt-1">
                  {summary.length > 0 
                    ? ((summary.filter(s => (s.attendance_percentage || 0) >= 90).length / summary.length) * 100).toFixed(0)
                    : 0}% of students
                </div>
              </div>
              <div className="p-3 bg-[#C5E1A5] rounded-lg">
                <CheckCircle2 className="size-6 text-[#1E88E5]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#78909C]">Good (75-89%)</div>
                <div className="text-2xl font-bold text-[#0891B2] mt-1">
                  {summary.filter(s => {
                    const pct = s.attendance_percentage || 0;
                    return pct >= 75 && pct < 90;
                  }).length}
                </div>
                <div className="text-xs text-[#78909C] mt-1">
                  {summary.length > 0 
                    ? ((summary.filter(s => {
                        const pct = s.attendance_percentage || 0;
                        return pct >= 75 && pct < 90;
                      }).length / summary.length) * 100).toFixed(0)
                    : 0}% of students
                </div>
              </div>
              <div className="p-3 bg-[#CFFAFE] rounded-lg">
                <TrendingUp className="size-6 text-[#0891B2]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#78909C]">Average (60-74%)</div>
                <div className="text-2xl font-bold text-[#D97706] mt-1">
                  {summary.filter(s => {
                    const pct = s.attendance_percentage || 0;
                    return pct >= 60 && pct < 75;
                  }).length}
                </div>
                <div className="text-xs text-[#78909C] mt-1">
                  {summary.length > 0 
                    ? ((summary.filter(s => {
                        const pct = s.attendance_percentage || 0;
                        return pct >= 60 && pct < 75;
                      }).length / summary.length) * 100).toFixed(0)
                    : 0}% of students
                </div>
              </div>
              <div className="p-3 bg-[#FEF3C7] rounded-lg">
                <Clock className="size-6 text-[#D97706]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#78909C]">Poor (Below 60%)</div>
                <div className="text-2xl font-bold text-[#EC407A] mt-1">
                  {summary.filter(s => (s.attendance_percentage || 0) < 60).length}
                </div>
                <div className="text-xs text-[#78909C] mt-1">
                  {summary.length > 0 
                    ? ((summary.filter(s => (s.attendance_percentage || 0) < 60).length / summary.length) * 100).toFixed(0)
                    : 0}% of students
                </div>
              </div>
              <div className="p-3 bg-[#FEE2E2] rounded-lg">
                <XCircle className="size-6 text-[#EC407A]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Summary Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Student-wise Attendance Details</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSort('name')}
                className="flex items-center gap-2"
              >
                Sort by Name
                {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSort('attendance')}
                className="flex items-center gap-2"
              >
                Sort by Attendance
                {sortBy === 'attendance' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {summary.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="size-12 text-[#E0E0E0] mx-auto mb-3" />
              <p className="text-sm text-[#78909C]">No attendance data available for this course yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E0E0E0]">
                    <th className="text-left py-3 px-4 font-medium text-[#374151]">Student</th>
                    <th className="text-center py-3 px-4 font-medium text-[#374151]">Total Classes</th>
                    <th className="text-center py-3 px-4 font-medium text-[#374151]">Present</th>
                    <th className="text-center py-3 px-4 font-medium text-[#374151]">Absent</th>
                    <th className="text-center py-3 px-4 font-medium text-[#374151]">Late</th>
                    <th className="text-center py-3 px-4 font-medium text-[#374151]">Attendance %</th>
                    <th className="text-center py-3 px-4 font-medium text-[#374151]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSummary.map((student) => (
                    <tr key={student.student_id} className="border-b border-[#FAFAFA] hover:bg-[#FAFAFA]">
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-sm font-medium text-[#1E3A5F]">{student.student_name}</div>
                          <div className="text-xs text-[#78909C]">{student.student_email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-[#1E3A5F]">
                        {student.total_classes}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#1E88E5] bg-[#C5E1A5] rounded-full">
                          <CheckCircle2 className="size-3" />
                          {student.present_count}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#EC407A] bg-[#FEE2E2] rounded-full">
                          <XCircle className="size-3" />
                          {student.absent_count}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#D97706] bg-[#FEF3C7] rounded-full">
                          <Clock className="size-3" />
                          {student.late_count}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-bold rounded-full ${getAttendanceColor(student.attendance_percentage || 0)}`}>
                          {(student.attendance_percentage || 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 ${
                          (student.attendance_percentage || 0) >= 75 ? 'text-[#1E88E5]' : 'text-[#EC407A]'
                        }`}>
                          {getAttendanceIcon(student.attendance_percentage || 0)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

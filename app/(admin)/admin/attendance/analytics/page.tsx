'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Users, Calendar, BarChart3, PieChart, Loader2 } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { attendanceService } from '@/services/attendanceService';
import { courseService } from '@/services/courseService';
import { adminService } from '@/services/adminService';
import api from '@/services/api';

interface AnalyticsData {
  totalStudents: number;
  totalCourses: number;
  totalInstructors: number;
  overallAttendanceRate: number;
  monthlyTrends: Array<{
    month: string;
    attendanceRate: number;
    totalClasses: number;
  }>;
  coursePerformance: Array<{
    courseId: number;
    courseTitle: string;
    instructorName: string;
    attendanceRate: number;
    totalStudents: number;
    totalClasses: number;
  }>;
  instructorPerformance: Array<{
    instructorId: number;
    instructorName: string;
    coursesCount: number;
    avgAttendanceRate: number;
    totalStudents: number;
  }>;
}

export default function AttendanceAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Fetch comprehensive analytics data
        const [attendanceData, coursesData, instructorsData] = await Promise.all([
          attendanceService.getAttendanceReports(),
          courseService.getCourses(),
          adminService.getUsers('instructor')
        ]);

        const attendance = attendanceData.attendance || [];
        const courses = coursesData.courses || [];
        const instructors = instructorsData.users || [];

        // Calculate overall statistics
        const totalStudents = new Set(attendance.map((a: any) => a.student_id)).size;
        const totalCourses = courses.length;
        const totalInstructors = instructors.length;
        
        const presentCount = attendance.filter((a: any) => a.status === 'present').length;
        const lateCount = attendance.filter((a: any) => a.status === 'late').length;
        const overallAttendanceRate = attendance.length > 0 
          ? ((presentCount + lateCount) / attendance.length * 100) 
          : 0;

        // Calculate monthly trends (last 6 months)
        const monthlyTrends = calculateMonthlyTrends(attendance);

        // Calculate course performance
        const coursePerformance = calculateCoursePerformance(attendance, courses);

        // Calculate instructor performance
        const instructorPerformance = calculateInstructorPerformance(attendance, instructors, courses);

        setAnalytics({
          totalStudents,
          totalCourses,
          totalInstructors,
          overallAttendanceRate,
          monthlyTrends,
          coursePerformance,
          instructorPerformance
        });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const calculateMonthlyTrends = (attendance: any[]) => {
    const monthlyData: { [key: string]: { present: number; total: number } } = {};
    
    attendance.forEach((record: any) => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { present: 0, total: 0 };
      }
      
      monthlyData[monthKey].total++;
      if (record.status === 'present' || record.status === 'late') {
        monthlyData[monthKey].present++;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        attendanceRate: (data.present / data.total * 100),
        totalClasses: data.total
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  };

  const calculateCoursePerformance = (attendance: any[], courses: any[]) => {
    const courseData: { [key: number]: { present: number; total: number; students: Set<number> } } = {};
    
    attendance.forEach((record: any) => {
      if (!courseData[record.course_id]) {
        courseData[record.course_id] = { present: 0, total: 0, students: new Set() };
      }
      
      courseData[record.course_id].total++;
      courseData[record.course_id].students.add(record.student_id);
      if (record.status === 'present' || record.status === 'late') {
        courseData[record.course_id].present++;
      }
    });

    return courses
      .map((course: any) => {
        const data = courseData[course.id] || { present: 0, total: 0, students: new Set() };
        return {
          courseId: course.id,
          courseTitle: course.title,
          instructorName: course.instructor_name || 'N/A',
          attendanceRate: data.total > 0 ? (data.present / data.total * 100) : 0,
          totalStudents: data.students.size,
          totalClasses: data.total
        };
      })
      .filter((course: any) => course.totalClasses > 0)
      .sort((a: any, b: any) => b.attendanceRate - a.attendanceRate);
  };

  const calculateInstructorPerformance = (attendance: any[], instructors: any[], courses: any[]) => {
    const instructorData: { [key: number]: { present: number; total: number; courses: Set<number>; students: Set<number> } } = {};
    
    attendance.forEach((record: any) => {
      if (!instructorData[record.instructor_id]) {
        instructorData[record.instructor_id] = { present: 0, total: 0, courses: new Set(), students: new Set() };
      }
      
      instructorData[record.instructor_id].total++;
      instructorData[record.instructor_id].courses.add(record.course_id);
      instructorData[record.instructor_id].students.add(record.student_id);
      if (record.status === 'present' || record.status === 'late') {
        instructorData[record.instructor_id].present++;
      }
    });

    return instructors
      .map((instructor: any) => {
        const data = instructorData[instructor.id] || { present: 0, total: 0, courses: new Set(), students: new Set() };
        return {
          instructorId: instructor.id,
          instructorName: instructor.name,
          coursesCount: data.courses.size,
          avgAttendanceRate: data.total > 0 ? (data.present / data.total * 100) : 0,
          totalStudents: data.students.size
        };
      })
      .filter((instructor: any) => instructor.coursesCount > 0)
      .sort((a: any, b: any) => b.avgAttendanceRate - a.avgAttendanceRate);
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

  if (!analytics) {
    return (
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-sm text-[#78909C]">Failed to load analytics data.</p>
            </div>
          </CardContent>
        </Card>
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
          <h1 className="text-xl md:text-2xl font-bold text-[#1E3A5F]">Attendance Analytics</h1>
          <p className="text-sm text-[#78909C]">Comprehensive attendance insights and trends</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Users className="size-5 text-[#1E88E5] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#1E3A5F]">{analytics.totalStudents}</div>
              <div className="text-sm text-[#78909C]">Active Students</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <BarChart3 className="size-5 text-[#AB47BC] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#1E3A5F]">{analytics.totalCourses}</div>
              <div className="text-sm text-[#78909C]">Total Courses</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Users className="size-5 text-[#0891B2] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#1E3A5F]">{analytics.totalInstructors}</div>
              <div className="text-sm text-[#78909C]">Instructors</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <TrendingUp className="size-5 text-[#1E88E5] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#1E88E5]">{analytics.overallAttendanceRate.toFixed(1)}%</div>
              <div className="text-sm text-[#78909C]">Overall Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            Monthly Attendance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.monthlyTrends.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="size-12 text-[#E0E0E0] mx-auto mb-3" />
              <p className="text-sm text-[#78909C]">No trend data available yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.monthlyTrends.map((trend, index) => (
                <div key={trend.month} className="flex items-center justify-between p-3 border border-[#E0E0E0] rounded-lg">
                  <div>
                    <div className="font-medium text-[#1E3A5F]">
                      {new Date(trend.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </div>
                    <div className="text-sm text-[#78909C]">{trend.totalClasses} classes held</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-lg font-bold ${
                      trend.attendanceRate >= 80 ? 'text-[#1E88E5]' : 
                      trend.attendanceRate >= 60 ? 'text-[#D97706]' : 'text-[#EC407A]'
                    }`}>
                      {trend.attendanceRate.toFixed(1)}%
                    </div>
                    {index > 0 && (
                      <div className="flex items-center">
                        {trend.attendanceRate > analytics.monthlyTrends[index - 1].attendanceRate ? (
                          <TrendingUp className="size-4 text-[#1E88E5]" />
                        ) : (
                          <TrendingDown className="size-4 text-[#EC407A]" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5" />
            Top Performing Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.coursePerformance.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="size-12 text-[#E0E0E0] mx-auto mb-3" />
              <p className="text-sm text-[#78909C]">No course performance data available.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E0E0E0]">
                    <th className="text-left py-3 px-4 font-medium text-[#374151]">Course</th>
                    <th className="text-left py-3 px-4 font-medium text-[#374151]">Instructor</th>
                    <th className="text-center py-3 px-4 font-medium text-[#374151]">Students</th>
                    <th className="text-center py-3 px-4 font-medium text-[#374151]">Classes</th>
                    <th className="text-center py-3 px-4 font-medium text-[#374151]">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.coursePerformance.slice(0, 10).map((course) => (
                    <tr key={course.courseId} className="border-b border-[#FAFAFA] hover:bg-[#FAFAFA]">
                      <td className="py-3 px-4">
                        <Link 
                          href={`/admin/attendance/courses/${course.courseId}`}
                          className="text-sm font-medium text-[#1E88E5] hover:underline"
                        >
                          {course.courseTitle}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1E3A5F]">
                        {course.instructorName}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-[#1E3A5F]">
                        {course.totalStudents}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-[#1E3A5F]">
                        {course.totalClasses}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 text-sm font-bold rounded-full ${
                          course.attendanceRate >= 90 ? 'text-[#1E88E5] bg-[#C5E1A5]' :
                          course.attendanceRate >= 75 ? 'text-[#0891B2] bg-[#CFFAFE]' :
                          course.attendanceRate >= 60 ? 'text-[#D97706] bg-[#FEF3C7]' :
                          'text-[#EC407A] bg-[#FEE2E2]'
                        }`}>
                          {course.attendanceRate.toFixed(1)}%
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

      {/* Instructor Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Instructor Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.instructorPerformance.length === 0 ? (
            <div className="text-center py-8">
              <Users className="size-12 text-[#E0E0E0] mx-auto mb-3" />
              <p className="text-sm text-[#78909C]">No instructor performance data available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.instructorPerformance.map((instructor) => (
                <div key={instructor.instructorId} className="p-4 border border-[#E0E0E0] rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-[#1E3A5F]">{instructor.instructorName}</h4>
                      <p className="text-sm text-[#78909C]">
                        {instructor.coursesCount} courses • {instructor.totalStudents} students
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#78909C]">Avg Attendance</span>
                      <span className={`px-2 py-1 text-sm font-bold rounded-full ${
                        instructor.avgAttendanceRate >= 90 ? 'text-[#1E88E5] bg-[#C5E1A5]' :
                        instructor.avgAttendanceRate >= 75 ? 'text-[#0891B2] bg-[#CFFAFE]' :
                        instructor.avgAttendanceRate >= 60 ? 'text-[#D97706] bg-[#FEF3C7]' :
                        'text-[#EC407A] bg-[#FEE2E2]'
                      }`}>
                        {instructor.avgAttendanceRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="size-5" />
              Course Performance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Excellent (90%+)', count: analytics.coursePerformance.filter(c => c.attendanceRate >= 90).length, color: 'bg-[#1E88E5]' },
                { label: 'Good (75-89%)', count: analytics.coursePerformance.filter(c => c.attendanceRate >= 75 && c.attendanceRate < 90).length, color: 'bg-[#0891B2]' },
                { label: 'Average (60-74%)', count: analytics.coursePerformance.filter(c => c.attendanceRate >= 60 && c.attendanceRate < 75).length, color: 'bg-[#D97706]' },
                { label: 'Poor (<60%)', count: analytics.coursePerformance.filter(c => c.attendanceRate < 60).length, color: 'bg-[#EC407A]' }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm text-[#78909C]">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium text-[#1E3A5F]">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="size-5" />
              Instructor Performance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Excellent (90%+)', count: analytics.instructorPerformance.filter(i => i.avgAttendanceRate >= 90).length, color: 'bg-[#1E88E5]' },
                { label: 'Good (75-89%)', count: analytics.instructorPerformance.filter(i => i.avgAttendanceRate >= 75 && i.avgAttendanceRate < 90).length, color: 'bg-[#0891B2]' },
                { label: 'Average (60-74%)', count: analytics.instructorPerformance.filter(i => i.avgAttendanceRate >= 60 && i.avgAttendanceRate < 75).length, color: 'bg-[#D97706]' },
                { label: 'Poor (<60%)', count: analytics.instructorPerformance.filter(i => i.avgAttendanceRate < 60).length, color: 'bg-[#EC407A]' }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm text-[#78909C]">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium text-[#1E3A5F]">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
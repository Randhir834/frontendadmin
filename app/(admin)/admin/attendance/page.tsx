'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Calendar, BarChart3, Download, Filter, Loader2, ClipboardCheck, TrendingUp } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { attendanceService } from '@/services/attendanceService';
import { courseService } from '@/services/courseService';
import { adminService } from '@/services/adminService';
import api from '@/services/api';
import type { Course } from '@/types';

export default function AdminAttendancePage() {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    course_id: '',
    instructor_id: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [coursesData, instructorsData] = await Promise.all([
          courseService.getCourses(),
          adminService.getUsers('instructor')
        ]);
        setCourses(coursesData.courses || []);
        setInstructors(instructorsData.users || []);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        );
        const data = await attendanceService.getAttendanceReports(cleanFilters);
        setAttendanceData(data.attendance || []);
      } catch (error) {
        console.error('Failed to fetch attendance data:', error);
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendanceData();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-[#1E88E5] bg-[#C5E1A5]';
      case 'absent': return 'text-[#EC407A] bg-[#FEE2E2]';
      case 'late': return 'text-[#D97706] bg-[#FEF3C7]';
      default: return 'text-[#78909C] bg-[#FAFAFA]';
    }
  };

  // Calculate statistics
  const stats = {
    totalRecords: attendanceData.length,
    presentCount: attendanceData.filter(record => record.status === 'present').length,
    absentCount: attendanceData.filter(record => record.status === 'absent').length,
    lateCount: attendanceData.filter(record => record.status === 'late').length,
    uniqueStudents: new Set(attendanceData.map(record => record.student_id)).size,
    uniqueCourses: new Set(attendanceData.map(record => record.course_id)).size,
  };

  const attendanceRate = stats.totalRecords > 0 
    ? ((stats.presentCount + stats.lateCount) / stats.totalRecords * 100).toFixed(1)
    : '0';

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1E3A5F]">Attendance Management</h1>
          <p className="text-sm text-[#78909C] mt-1">
            Monitor and analyze attendance across all courses and instructors
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => attendanceService.exportAttendanceCSV({
              ...filters,
              course_id: filters.course_id ? parseInt(filters.course_id) : undefined,
              instructor_id: filters.instructor_id ? parseInt(filters.instructor_id) : undefined
            })}
          >
            <Download className="size-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#1E3A5F]">{stats.totalRecords}</div>
              <div className="text-sm text-[#78909C]">Total Records</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#1E88E5]">{stats.presentCount}</div>
              <div className="text-sm text-[#78909C]">Present</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#EC407A]">{stats.absentCount}</div>
              <div className="text-sm text-[#78909C]">Absent</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#AB47BC]">{attendanceRate}%</div>
              <div className="text-sm text-[#78909C]">Attendance Rate</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#0891B2]">{stats.uniqueStudents}</div>
              <div className="text-sm text-[#78909C]">Active Students</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Course
              </label>
              <select
                value={filters.course_id}
                onChange={(e) => handleFilterChange('course_id', e.target.value)}
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none "
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Instructor
              </label>
              <select
                value={filters.instructor_id}
                onChange={(e) => handleFilterChange('instructor_id', e.target.value)}
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none "
              >
                <option value="">All Instructors</option>
                {instructors.map(instructor => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Start Date
              </label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                End Date
              </label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Data */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-[#1E88E5]" />
            </div>
          ) : attendanceData.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardCheck className="size-12 text-[#E0E0E0] mx-auto mb-3" />
              <p className="text-sm text-[#78909C]">No attendance records found for the selected filters.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E0E0E0]">
                      <th className="text-left py-3 px-4 font-medium text-[#374151]">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-[#374151]">Course</th>
                      <th className="text-left py-3 px-4 font-medium text-[#374151]">Instructor</th>
                      <th className="text-left py-3 px-4 font-medium text-[#374151]">Student</th>
                      <th className="text-left py-3 px-4 font-medium text-[#374151]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((record, index) => (
                      <tr key={index} className="border-b border-[#FAFAFA] hover:bg-[#FAFAFA]">
                        <td className="py-3 px-4 text-sm text-[#1E3A5F]">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-[#1E3A5F]">
                          <Link 
                            href={`/admin/attendance/courses/${record.course_id}`}
                            className="text-[#1E88E5] hover:underline"
                          >
                            {record.course_title}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm text-[#1E3A5F]">
                          {record.instructor_name}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="text-sm font-medium text-[#1E3A5F]">{record.student_name}</div>
                            <div className="text-xs text-[#78909C]">{record.student_email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {attendanceData.map((record, index) => (
                  <div key={index} className="p-4 border border-[#E0E0E0] rounded-lg bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Link 
                          href={`/admin/attendance/courses/${record.course_id}`}
                          className="font-medium text-[#1E88E5] hover:underline text-sm mb-1 block"
                        >
                          {record.course_title}
                        </Link>
                        <p className="text-xs text-[#78909C]">
                          {new Date(record.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-xs text-[#78909C]">Student:</span>
                        <p className="font-medium text-[#1E3A5F]">{record.student_name}</p>
                        <p className="text-xs text-[#78909C]">{record.student_email}</p>
                      </div>
                      <div>
                        <span className="text-xs text-[#78909C]">Instructor:</span>
                        <p className="text-sm text-[#1E3A5F]">{record.instructor_name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
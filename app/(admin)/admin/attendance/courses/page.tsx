'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Users, TrendingUp, Search, Loader2, BarChart3 } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { courseService } from '@/services/courseService';
import type { Course } from '@/types';

export default function AdminAttendanceCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourses();
        const publishedCourses = (data.courses || []).filter((c: Course) => c.status === 'published');
        setCourses(publishedCourses);
        setFilteredCourses(publishedCourses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = courses.filter(course => 
        course.title.toLowerCase().includes(query) ||
        course.category_name?.toLowerCase().includes(query) ||
        course.instructor_name?.toLowerCase().includes(query)
      );
      setFilteredCourses(filtered);
    }
  }, [searchQuery, courses]);

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
          <h1 className="text-xl md:text-2xl font-bold text-[#1E3A5F]">Course Attendance Analytics</h1>
          <p className="text-sm text-[#78909C]">View detailed attendance statistics for each course</p>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-[#78909C]" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <BookOpen className="size-5 text-[#1E88E5] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#1E3A5F]">{courses.length}</div>
              <div className="text-sm text-[#78909C]">Total Courses</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Users className="size-5 text-[#AB47BC] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#AB47BC]">{filteredCourses.length}</div>
              <div className="text-sm text-[#78909C]">Showing</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <BarChart3 className="size-12 text-[#E0E0E0] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#1E3A5F] mb-2">No courses found</h3>
              <p className="text-sm text-[#78909C]">
                {searchQuery ? 'Try adjusting your search query.' : 'No published courses available yet.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="group hover:shadow-lg transition-all duration-200">
              <div className="relative">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-[#1E88E5]/10 to-[#1E88E5]/20 rounded-t-lg flex items-center justify-center">
                    <BookOpen className="size-12 text-[#1E88E5]/60" />
                  </div>
                )}
                
                {/* Category Badge */}
                {course.category_name && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 text-xs font-medium bg-white/90 text-[#1E3A5F] rounded-full shadow-sm">
                      {course.category_name}
                    </span>
                  </div>
                )}

                {/* Enrolled Count Badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 text-xs font-bold bg-[#1E88E5] text-white rounded-full shadow-sm flex items-center gap-1">
                    <Users className="size-3" />
                    {course.enrollment_count || 0}
                  </span>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Title */}
                  <div>
                    <h3 className="font-semibold text-[#1E3A5F] line-clamp-2 group-hover:text-[#1E88E5] transition-colors">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-sm text-[#78909C] line-clamp-2 mt-1">
                        {course.description}
                      </p>
                    )}
                  </div>

                  {/* Instructor Info */}
                  {course.instructor_name && (
                    <div className="flex items-center gap-2 text-sm text-[#78909C]">
                      <Users className="size-4" />
                      <span>Instructor: {course.instructor_name}</span>
                    </div>
                  )}

                  {/* Course Info */}
                  <div className="flex items-center justify-between text-sm text-[#78909C]">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      course.level === 'beginner' ? 'bg-[#EFF6FF] text-[#1E40AF]' :
                      course.level === 'intermediate' ? 'bg-[#FEF3C7] text-[#D97706]' :
                      'bg-[#FEE2E2] text-[#EC407A]'
                    }`}>
                      {course.level?.charAt(0).toUpperCase() + course.level?.slice(1)}
                    </span>
                    <span className="text-xs">
                      {course.duration_value} {course.duration_unit}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#E0E0E0]">
                    <Link href={`/admin/attendance/courses/${course.id}`} className="flex-1">
                      <Button className="w-full flex items-center gap-2">
                        <BarChart3 className="size-4" />
                        View Analytics
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5 text-[#1E88E5]" />
            About Course Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-[#78909C]">
            <p>
              • Click on any course to view detailed attendance statistics and student-wise performance
            </p>
            <p>
              • Track attendance percentages, present/absent/late counts for each student
            </p>
            <p>
              • Identify students with low attendance who may need additional support
            </p>
            <p>
              • Export reports for record-keeping and analysis
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

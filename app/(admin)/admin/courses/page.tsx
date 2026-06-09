'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PlusCircle, BookOpen, Edit, Trash2, Eye, Loader2, Users } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CourseCard from '@/components/ui/CourseCard';
import CourseFilters from '@/components/ui/CourseFilters';
import { courseService } from '@/services/courseService';
import { categoryService } from '@/services/categoryService';
import { adminService } from '@/services/adminService';
import api from '@/services/api';
import type { Course, Category } from '@/types';

function CoursesContent() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    search: searchParams?.get('search') || '',
    category_id: searchParams?.get('category_id') || '',
    level: searchParams?.get('level') || '',
    price_range: searchParams?.get('price_range') || '',
    instructor_id: searchParams?.get('instructor_id') || '',
    sort_by: searchParams?.get('sort_by') || 'created_at',
    sort_order: (searchParams?.get('sort_order') as 'asc' | 'desc') || 'desc'
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      const data = await courseService.getCourses(cleanFilters);
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await adminService.getUsers('instructor');
      setInstructors(response.users || []);
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  useEffect(() => {
    fetchCategories();
    fetchInstructors();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    
    try {
      setDeleting(id);
      await courseService.deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Failed to delete course';
      alert(message);
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (id: number) => {
    window.location.href = `/admin/courses/${id}/edit`;
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  };

  const stats = {
    total: courses.length
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1E3A5F]">Course Management</h1>
          <p className="text-sm text-[#78909C] mt-1">
            Manage all courses, instructors, and content
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Total Courses Counter */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#EFF6FF] text-[#1E40AF] rounded-lg border border-[#DBEAFE]">
            <BookOpen className="size-4" />
            <span className="text-sm font-semibold">{stats.total} Courses</span>
          </div>
          
          <Link href="/admin/courses/create">
            <Button className="flex items-center gap-2">
              <PlusCircle className="size-4" />
              Create Course
            </Button>
          </Link>
        </div>
      </div>



      {/* Course Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-[#1E88E5]" />
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <BookOpen className="size-12 text-[#E0E0E0] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#1E3A5F] mb-2">No courses found</h3>
              <p className="text-sm text-[#78909C] mb-6">
                {filters.search || Object.values(filters).some(v => v && v !== 'created_at' && v !== 'desc')
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating your first course.'
                }
              </p>
              {!filters.search && !Object.values(filters).some(v => v && v !== 'created_at' && v !== 'desc') && (
                <Link href="/admin/courses/create">
                  <Button className="flex items-center gap-2">
                    <PlusCircle className="size-4" />
                    Create First Course
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              userRole="admin"
              onDelete={handleDelete}
              onEdit={handleEdit}
              deleting={deleting === course.id}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminCoursesPage() {
  return (
    <Suspense fallback={
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-[#1E88E5]" />
        </div>
      </div>
    }>
      <CoursesContent />
    </Suspense>
  );
}
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CourseMaterialsManager from '@/components/course/CourseMaterialsManager';
import { courseService } from '@/services/courseService';
import type { Course } from '@/types';

export default function AdminCourseMaterialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const courseId = Number(id);
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ role: string } | null>(null);

  useEffect(() => {
    // Get user info from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }

    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await courseService.getCourseById(courseId);
        setCourse(res.course || null);
      } catch (error) {
        console.error('Failed to fetch course:', error);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

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
                <Button variant="outline" onClick={() => router.push('/admin/courses')}>
                  Back to Courses
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push(`/admin/courses/${courseId}`)}
          className="p-2 rounded-lg border border-border hover:bg-hover transition-colors"
          aria-label="Back to course"
        >
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
            Course Materials
          </h1>
          <p className="text-sm text-text-muted">{course.title}</p>
        </div>
      </div>

      {/* Materials Manager */}
      <CourseMaterialsManager
        courseId={courseId}
        courseName={course.title}
        isAdmin={isAdmin}
      />
    </div>
  );
}
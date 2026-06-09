'use client';

import { useEffect, useMemo, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Users, Edit, Calendar, Clock, DollarSign, Target, CheckCircle, BookOpen, FileText } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { courseService } from '@/services/courseService';
import type { Course } from '@/types';

export default function AdminCourseViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const courseId = Number(id);
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await courseService.getCourseById(courseId);
        setCourse(res.course || null);
      } catch {
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const instructorNames = useMemo(() => {
    if (!course?.instructors?.length) return '';
    return course.instructors.map((i) => i.name).join(', ');
  }, [course]);

  const levelLabel: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">{course.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/admin/courses/${course.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit size={16} /> Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
            <CardContent>
              {course.description ? (
                <p className="text-sm text-text-secondary whitespace-pre-line">{course.description}</p>
              ) : (
                <p className="text-sm text-text-muted">No description provided.</p>
              )}

            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Learning & Requirements</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-text-primary mb-2">What you’ll learn</p>
                {course.what_you_learn ? (
                  <p className="text-sm text-text-secondary whitespace-pre-line">{course.what_you_learn}</p>
                ) : (
                  <p className="text-sm text-text-muted">Not set</p>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary mb-2">Requirements</p>
                {course.requirements ? (
                  <p className="text-sm text-text-secondary whitespace-pre-line">{course.requirements}</p>
                ) : (
                  <p className="text-sm text-text-muted">Not set</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
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

          <Card>
            <CardHeader><CardTitle>Instructors</CardTitle></CardHeader>
            <CardContent>
              {instructorNames ? (
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-text-muted" />
                  <p className="text-sm text-text-secondary">{instructorNames}</p>
                </div>
              ) : (
                <p className="text-sm text-text-muted">No instructors assigned.</p>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { BookOpen, Users, Clock, Star, Edit, Trash2, Eye, Play, CheckCircle2 } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from './Card';
import Button from './Button';
import type { Course } from '@/types';

interface CourseCardProps {
  course: Course;
  userRole: 'admin' | 'instructor' | 'student';
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
  deleting?: boolean;
  showActions?: boolean;
  linkPrefix?: string;
}

export default function CourseCard({ 
  course, 
  userRole, 
  onDelete, 
  onEdit, 
  deleting = false, 
  showActions = true,
  linkPrefix = ''
}: CourseCardProps) {
  const statusColors = {
    published: 'bg-[#DCFCE7] text-[#1B8A44]',
    archived: 'bg-[#F1F5F9] text-[#64748B]',
  };

  const levelColors = {
    beginner: 'bg-[#EFF6FF] text-[#1E40AF]',
    intermediate: 'bg-[#FEF3C7] text-[#D97706]',
    advanced: 'bg-[#FEE2E2] text-[#DC2626]',
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `₹${price.toLocaleString()}`;
  };

  const formatDuration = (value: number, unit: string) => {
    return `${value} ${unit}${value > 1 ? '' : ''}`;
  };

  const instructorNames = course.instructors?.map(i => i.name).join(', ') || course.instructor_name || 'No instructor';

  const getViewLink = () => {
    if (userRole === 'admin') return `${linkPrefix}/admin/courses/${course.id}`;
    if (userRole === 'instructor') return `${linkPrefix}/instructor/courses/${course.id}`;
    return `${linkPrefix}/student/course/${course.id}`;
  };

  const getEditLink = () => {
    if (userRole === 'admin') return `${linkPrefix}/admin/courses/${course.id}/edit`;
    if (userRole === 'instructor') return `${linkPrefix}/instructor/courses/${course.id}/edit`;
    return null;
  };

  return (
    <Link href={getViewLink()}>
      <Card className="group hover:shadow-lg transition-all duration-200 border-[#E2E8F0] hover:border-[#1B8A44]/20 h-full flex flex-col cursor-pointer">
        <div className="relative">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-[#1B8A44]/10 to-[#1B8A44]/20 rounded-t-lg flex items-center justify-center">
              <BookOpen className="size-12 text-[#1B8A44]/60" />
            </div>
          )}

        {/* Progress Bar for Students */}
        {userRole === 'student' && course.is_enrolled && course.progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="flex-1 bg-[#E2E8F0] rounded-full h-2">
                <div 
                  className="bg-[#1B8A44] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <span className="text-[#64748B] font-medium">{Math.round(course.progress || 0)}%</span>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4 flex flex-col flex-1">
        <div className="space-y-2 flex-1">
          {/* Title and Level */}
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-[#1E293B] line-clamp-2 group-hover:text-[#1B8A44] transition-colors">
                {course.title}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${levelColors[course.level]}`}>
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </span>
            </div>
            
            {course.description && (
              <p className="text-sm text-[#64748B] line-clamp-2">
                {course.description}
              </p>
            )}
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <Users className="size-4" />
            <span className="truncate">{instructorNames}</span>
          </div>
        </div>

        {/* Enrollment Status for Students */}
        {userRole === 'student' && course.is_enrolled && (
          <div className="flex items-center gap-2 text-sm text-[#1B8A44] bg-[#DCFCE7] px-3 py-2 rounded-lg">
            <CheckCircle2 className="size-4" />
            <span className="font-medium">Enrolled</span>
          </div>
        )}
      </CardContent>
    </Card>
    </Link>
  );
}
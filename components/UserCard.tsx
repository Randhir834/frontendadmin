'use client';

import { useRouter } from 'next/navigation';
import { Mail, Calendar, Badge, ChevronRight, User, Phone, MapPin, GraduationCap, Award, Users, BookOpen } from 'lucide-react';
import type { User as UserType } from '@/types';
import { getAvatarUrl } from '@/utils/avatarUtils';

interface UserCardProps {
  user: UserType;
  role: 'student' | 'instructor' | 'admin';
}

export default function UserCard({ user, role }: UserCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (role === 'student') {
      router.push(`/admin/students/${user.id}`);
    } else if (role === 'instructor') {
      router.push(`/admin/instructors/${user.id}`);
    } else if (role === 'admin') {
      router.push(`/admin/admins/${user.id}`);
    }
  };
  const getRoleColor = (userRole: string) => {
    switch (userRole) {
      case 'student':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'instructor':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'admin':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div 
      onClick={handleClick}
      className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-primary-300 transition-all duration-300 cursor-pointer card-hover"
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        {/* Avatar and Basic Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {user.avatar_url ? (
              <img 
                src={getAvatarUrl(user.avatar_url, user.name)}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-xl shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate mb-1">
              {user.name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
              <Mail size={14} className="flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            
            {/* Role Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(user.role)}`}
            >
              <Badge size={12} />
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
        </div>

        {/* Action Arrow */}
        <ChevronRight
          size={20}
          className="text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0"
        />
      </div>

      {/* Details Section */}
      <div className="space-y-3 mb-4">
        {/* Student-specific fields */}
        {role === 'student' && (
          <>
            {user.grade && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <GraduationCap size={14} className="text-blue-500" />
                <span className="font-medium">Grade:</span>
                <span>{user.grade}</span>
              </div>
            )}
            
            {user.school && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen size={14} className="text-green-500" />
                <span className="font-medium">School:</span>
                <span className="truncate">{user.school}</span>
              </div>
            )}

            {user.parent_guardian_name && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={14} className="text-orange-500" />
                <span className="font-medium">Guardian:</span>
                <span className="truncate">{user.parent_guardian_name}</span>
              </div>
            )}
          </>
        )}

        {/* Instructor-specific fields */}
        {role === 'instructor' && (
          <>
            {user.specialization && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Award size={14} className="text-purple-500" />
                <span className="font-medium">Specialization:</span>
                <span className="truncate">{user.specialization}</span>
              </div>
            )}
            
            {user.qualifications && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <GraduationCap size={14} className="text-indigo-500" />
                <span className="font-medium">Qualifications:</span>
                <span className="truncate">{user.qualifications}</span>
              </div>
            )}
          </>
        )}

        {/* Common fields */}
        {user.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone size={14} className="text-emerald-500" />
            <span className="font-medium">Phone:</span>
            <span>{user.phone}</span>
          </div>
        )}

        {user.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={14} className="text-red-500" />
            <span className="font-medium">Location:</span>
            <span className="truncate">{user.location}</span>
          </div>
        )}

        {user.date_of_birth && role === 'student' && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} className="text-pink-500" />
            <span className="font-medium">Age:</span>
            <span>{user.age !== undefined ? user.age : getAge(user.date_of_birth)} years</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar size={12} />
          <span>Joined {formatDate(user.created_at)}</span>
        </div>
      </div>

      {/* Hover Gradient Overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:to-primary-500/10 transition-all duration-300 pointer-events-none" />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { 
  X, Mail, Calendar, Badge, User, Loader2, AlertCircle, Phone, MapPin, 
  GraduationCap, Award, Users, BookOpen, Edit, Trash2, Eye, EyeOff 
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { adminService } from '@/services/adminService';
import type { User as UserType } from '@/types';
import { getAvatarUrl } from '@/utils/avatarUtils';

interface UserDetailModalProps {
  userId: number;
  role: 'student' | 'instructor' | 'admin';
  onClose: () => void;
}

export default function UserDetailModal({ userId, role, onClose }: UserDetailModalProps) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await adminService.getUserById(userId);
        setUser(data.user);
        setError(null);
      } catch (err) {
        setError('Failed to load user details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="modal-responsive bg-white shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-xl z-10">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">User Profile</h2>
          <button
            onClick={onClose}
            className="touch-target p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 size={40} className="text-primary-500 animate-spin" />
              <p className="text-gray-600">Loading user details...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <AlertCircle size={40} className="text-red-500" />
              <p className="text-red-600 font-medium">{error}</p>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : user ? (
            <div className="space-y-8">
              {/* Profile Header */}
              <div className="flex flex-col items-center gap-6 pb-6 border-b border-gray-200">
                {user.avatar_url ? (
                  <img 
                    src={getAvatarUrl(user.avatar_url, user.name)}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h3>
                  <p className="text-gray-600 mb-3">{user.email}</p>
                  
                  {/* Role Badge */}
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getRoleColor(user.role)}`}
                  >
                    <Badge size={16} />
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">Personal Information</h4>
                  <button
                    onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {showSensitiveInfo ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showSensitiveInfo ? 'Hide' : 'Show'} Details
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <User size={20} className="text-primary-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">User ID</p>
                        <p className="text-sm font-semibold text-gray-900">#{user.id}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Mail size={20} className="text-primary-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Email Address</p>
                        <p className="text-sm font-semibold text-gray-900 break-all">{user.email}</p>
                      </div>
                    </div>

                    {user.phone && showSensitiveInfo && (
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <Phone size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Phone Number</p>
                          <p className="text-sm font-semibold text-gray-900">{user.phone}</p>
                        </div>
                      </div>
                    )}

                    {user.location && (
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <MapPin size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Location</p>
                          <p className="text-sm font-semibold text-gray-900">{user.location}</p>
                        </div>
                      </div>
                    )}

                    {user.date_of_birth && showSensitiveInfo && role === 'student' && (
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <Calendar size={20} className="text-pink-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Date of Birth</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatDateOnly(user.date_of_birth)} ({user.age !== undefined ? user.age : getAge(user.date_of_birth)} years old)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Role-specific Info */}
                  <div className="space-y-4">
                    {role === 'student' && (
                      <>
                        {user.grade && (
                          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                            <GraduationCap size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">Grade Level</p>
                              <p className="text-sm font-semibold text-blue-900">{user.grade}</p>
                            </div>
                          </div>
                        )}

                        {user.school && (
                          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                            <BookOpen size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs text-green-600 uppercase tracking-wide font-medium">School</p>
                              <p className="text-sm font-semibold text-green-900">{user.school}</p>
                            </div>
                          </div>
                        )}

                        {user.parent_guardian_name && showSensitiveInfo && (
                          <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                            <Users size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs text-orange-600 uppercase tracking-wide font-medium">Parent/Guardian</p>
                              <p className="text-sm font-semibold text-orange-900">{user.parent_guardian_name}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {role === 'instructor' && (
                      <>
                        {user.specialization && (
                          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                            <Award size={20} className="text-purple-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">Specialization</p>
                              <p className="text-sm font-semibold text-purple-900">{user.specialization}</p>
                            </div>
                          </div>
                        )}

                        {user.qualifications && (
                          <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg">
                            <GraduationCap size={20} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs text-indigo-600 uppercase tracking-wide font-medium">Qualifications</p>
                              <p className="text-sm font-semibold text-indigo-900 leading-relaxed">{user.qualifications}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* System Info */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Calendar size={20} className="text-gray-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Member Since</p>
                        <p className="text-sm font-semibold text-gray-900">{formatDate(user.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Calendar size={20} className="text-gray-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Last Updated</p>
                        <p className="text-sm font-semibold text-gray-900">{formatDate(user.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="button-group-responsive pt-4 sm:pt-6 border-t border-gray-200 sticky bottom-0 bg-white -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                <Button variant="outline" className="flex-1 touch-target" onClick={onClose}>
                  Close
                </Button>
                <Button variant="primary" className="flex-1 touch-target flex items-center justify-center gap-2">
                  <Edit size={16} className="hidden sm:inline" />
                  <span className="hidden sm:inline">Edit Profile</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
                <Button variant="ghost" className="flex-1 touch-target text-red-600 hover:bg-red-50 flex items-center justify-center gap-2">
                  <Trash2 size={16} className="hidden sm:inline" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

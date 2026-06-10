'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Mail, Calendar, Badge, User, Loader2, AlertCircle, Phone, MapPin, 
  GraduationCap, Award, Users, BookOpen, Edit, Trash2
} from 'lucide-react';
import Button from '@/components/ui/Button';
import EditUserModal from '@/components/EditUserModal';
import RealTimeNotification from '@/components/RealTimeNotification';
import { adminService } from '@/services/adminService';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { useNotifications } from '@/hooks/useNotifications';
import type { User as UserType } from '@/types';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = parseInt((params?.id as string) || "0");
  
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const { notifications, addNotification, removeNotification } = useNotifications();

  // Set up real-time updates for admin
  useRealTimeUpdates({
    isAdmin: true,
    onUserUpdate: (data) => {
      // Update the user if it's the same user being viewed
      if (data.user && data.user.id === userId) {
        console.log('[StudentProfile] Received real-time update for current user');
        setUser(data.user);
        addNotification('Profile updated in real-time!', 'success');
      }
    }
  });

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

    if (userId) {
      fetchUser();
    }
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

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleUserUpdated = (updatedUser: UserType) => {
    setUser(updatedUser);
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    
    try {
      setDeleting(true);
      await adminService.deleteUser(user.id);
      
      // Show success message and redirect
      alert('Student deleted successfully!');
      router.push('/admin/students');
    } catch (error) {
      console.error('Failed to delete student:', error);
      alert('Failed to delete student. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const confirmDelete = () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`
    );
    
    if (confirmed) {
      handleDeleteUser();
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={40} className="text-primary-500 animate-spin" />
          <p className="text-gray-600">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <AlertCircle size={40} className="text-red-500" />
          <p className="text-red-600 font-medium">{error || 'Student not found'}</p>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {user.avatar_url ? (
            <img 
              src={user.avatar_url.startsWith('http') ? user.avatar_url : `http://localhost:5001${user.avatar_url}`}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              key={user.avatar_url} // Force re-render when avatar changes
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h2>
            <p className="text-gray-600 mb-4 text-lg">{user.email}</p>
            
            {/* Role Badge */}
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getRoleColor(user.role)}`}
            >
              <Badge size={16} />
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="primary" 
              className="flex items-center gap-2"
              onClick={handleEditProfile}
            >
              <Edit size={16} />
              Edit Profile
            </Button>
            <Button 
              variant="ghost" 
              className="text-red-600 hover:bg-red-50 flex items-center gap-2"
              onClick={confirmDelete}
              disabled={deleting}
            >
              <Trash2 size={16} />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User ID */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <User size={20} className="text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-1">User ID</p>
                <p className="text-lg font-semibold text-gray-900">#{user.id}</p>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-1">Email Address</p>
                <p className="text-lg font-semibold text-gray-900 break-all">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Grade */}
          {user.grade && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GraduationCap size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-1">Grade Level</p>
                  <p className="text-lg font-semibold text-gray-900">{user.grade}</p>
                </div>
              </div>
            </div>
          )}

          {/* School */}
          {user.school && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen size={20} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-1">School</p>
                  <p className="text-lg font-semibold text-gray-900">{user.school}</p>
                </div>
              </div>
            </div>
          )}

          {/* Parent/Guardian */}
          {user.parent_guardian_name && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users size={20} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-1">Parent/Guardian</p>
                  <p className="text-lg font-semibold text-gray-900">{user.parent_guardian_name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Phone */}
          {user.phone && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Phone size={20} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-1">Phone Number</p>
                  <p className="text-lg font-semibold text-gray-900">{user.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          {user.location && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <MapPin size={20} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-1">Location</p>
                  <p className="text-lg font-semibold text-gray-900">{user.location}</p>
                </div>
              </div>
            </div>
          )}

          {/* Date of Birth */}
          {user.date_of_birth && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Calendar size={20} className="text-pink-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-1">Date of Birth</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDateOnly(user.date_of_birth)} ({user.age !== undefined ? user.age : getAge(user.date_of_birth)} years old)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Member Since */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar size={20} className="text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-1">Member Since</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(user.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {user && (
        <EditUserModal
          user={user}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {/* Real-time Notifications */}
      {notifications.map((notification) => (
        <RealTimeNotification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}
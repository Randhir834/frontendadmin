'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Mail, Calendar, Badge, User, Loader2, AlertCircle, Phone, MapPin, 
  Edit, Trash2, Eye, EyeOff, Shield
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { adminService } from '@/services/adminService';
import type { User as UserType } from '@/types';
import { getAvatarUrl } from '@/utils/avatarUtils';
import toast from 'react-hot-toast';

export default function AdminDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params?.id as string);

  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  useEffect(() => {
    if (!userId || isNaN(userId)) {
      setError('Invalid user ID');
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await adminService.getUserById(userId);
        setUser(data.user);
        setError(null);
      } catch (err: any) {
        setError('Failed to load administrator details');
        console.error(err);
        toast.error('Failed to load administrator details');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const getRoleColor = (userRole: string) => {
    return 'bg-red-50 text-red-700 border-red-200';
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

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={48} className="text-red-600 animate-spin" />
          <p className="text-gray-600">Loading administrator details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <AlertCircle size={48} className="text-red-500" />
          <p className="text-red-600 font-medium text-lg">{error || 'Administrator not found'}</p>
          <Button variant="outline" onClick={() => router.push('/admin/admins')}>
            Back to Administrators
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/admins')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Back to administrators"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-4 flex-1">
          <div className="p-2 bg-red-100 rounded-xl">
            <Shield size={32} className="text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Administrator Profile</h1>
            <p className="text-gray-600 mt-1">
              View and manage administrator details
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-gray-200">
            {user.avatar_url ? (
              <img 
                src={getAvatarUrl(user.avatar_url, user.name)}
                alt={user.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-100 shadow-lg flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h2>
              <p className="text-gray-600 mb-4 flex items-center gap-2 justify-center sm:justify-start">
                <Mail size={16} />
                {user.email}
              </p>
              
              {/* Role Badge */}
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getRoleColor(user.role)}`}
              >
                <Badge size={16} />
                Administrator
              </span>
            </div>

            {/* Toggle Sensitive Info */}
            <button
              onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showSensitiveInfo ? <EyeOff size={16} /> : <Eye size={16} />}
              {showSensitiveInfo ? 'Hide' : 'Show'} Details
            </button>
          </div>

          {/* Information Grid */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User ID */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <User size={20} className="text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">User ID</p>
                  <p className="text-base font-semibold text-gray-900">#{user.id}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Mail size={20} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Email Address</p>
                  <p className="text-base font-semibold text-gray-900 break-all">{user.email}</p>
                </div>
              </div>

              {/* Phone */}
              {user.phone && showSensitiveInfo && (
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Phone size={20} className="text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Phone Number</p>
                    <p className="text-base font-semibold text-gray-900">{user.phone}</p>
                  </div>
                </div>
              )}

              {/* Location */}
              {user.location && (
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <MapPin size={20} className="text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Location</p>
                    <p className="text-base font-semibold text-gray-900">{user.location}</p>
                  </div>
                </div>
              )}

              {/* Member Since */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Calendar size={20} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Member Since</p>
                  <p className="text-base font-semibold text-gray-900">{formatDate(user.created_at)}</p>
                </div>
              </div>

              {/* Last Updated */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Calendar size={20} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Last Updated</p>
                  <p className="text-base font-semibold text-gray-900">{formatDate(user.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={() => router.push('/admin/admins')}
            >
              <ArrowLeft size={16} />
              Back to List
            </Button>
            <Button
              variant="primary"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={() => toast.info('Edit functionality coming soon')}
            >
              <Edit size={16} />
              Edit Profile
            </Button>
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => toast.error('Delete functionality requires confirmation')}
            >
              <Trash2 size={16} />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

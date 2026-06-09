'use client';

import { useState, useEffect } from 'react';
import { Shield, UserPlus, Loader2, Mail, Calendar } from 'lucide-react';
import { adminService } from '@/services/adminService';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { getAvatarUrl } from '@/utils/avatarUtils';

interface Admin {
  id: number;
  name: string;
  email: string;
  created_at: string;
  avatar_url?: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers('admin');
      setAdmins(response.users || []);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin text-[#1E88E5] mx-auto mb-4" />
          <p className="text-[#78909C]">Loading administrators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1E3A5F] flex items-center gap-2">
            <Shield className="text-[#EC407A]" size={28} />
            Administrators
          </h1>
          <p className="text-sm text-[#78909C] mt-1">Manage system administrators</p>
        </div>
        <Link href="/admin/profile-settings">
          <Button variant="primary" className="flex items-center gap-2">
            <UserPlus size={18} />
            <span>Add Admin</span>
          </Button>
        </Link>
      </div>

      {/* Admin List */}
      {admins.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="mx-auto text-[#B0BEC5] mb-4" size={48} />
          <h3 className="text-lg font-semibold text-[#1E3A5F] mb-2">
            No administrators yet
          </h3>
          <p className="text-[#78909C] mb-4">
            Add your first administrator to get started
          </p>
          <Link href="/admin/profile-settings">
            <Button variant="primary" className="flex items-center gap-2 mx-auto">
              <UserPlus size={18} />
              <span>Add Admin</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map((admin) => (
            <Link
              key={admin.id}
              href={`/admin/admins/${admin.id}`}
              className="bg-white rounded-xl border border-[#E0E0E0] p-5 hover:shadow-lg hover:border-[#1E88E5] transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#F1F8E9] shrink-0">
                  <img
                    src={getAvatarUrl(admin.avatar_url, admin.name)}
                    alt={admin.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1E3A5F] mb-1 truncate">{admin.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#78909C] mb-2">
                    <Mail size={14} />
                    <span className="truncate">{admin.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#78909C]">
                    <Calendar size={14} />
                    <span>
                      Joined {new Date(admin.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E0E0E0]">
                <div className="flex items-center justify-between">
                  <span className="inline-block px-3 py-1 bg-[#C5E1A5] text-[#1E88E5] text-xs font-semibold rounded-md">
                    Administrator
                  </span>
                  <span className="text-xs text-[#1E88E5] font-medium">View Details →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

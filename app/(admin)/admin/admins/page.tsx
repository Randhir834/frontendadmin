'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Loader2, Search, UserCog } from 'lucide-react';
import UserCard from '@/components/UserCard';
import { adminService } from '@/services/adminService';
import type { User } from '@/types';

export default function AdminsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        const data = await adminService.getUsers('admin');
        setUsers(data.users);
      } catch (error) {
        console.error('Failed to fetch admins:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-red-100 rounded-xl">
            <Shield size={32} className="text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Administrators</h1>
            <p className="text-gray-600 mt-1">
              Manage and view all system administrators
            </p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-red-600">{users.length}</p>
          <p className="text-sm text-gray-500">Total Admins</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search administrators by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Administrators Found</h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'No administrators match your search criteria'
              : 'No administrators have been registered yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} role="admin" />
          ))}
        </div>
      )}
    </div>
  );
}

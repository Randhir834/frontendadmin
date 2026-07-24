'use client';

import { useEffect, useState } from 'react';
import { Shield, Loader2, Search } from 'lucide-react';
import UserCard from '@/components/UserCard';
import UserDetailModal from '@/components/UserDetailModal';
import { adminService } from '@/services/adminService';
import type { User } from '@/types';

export default function AdminsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

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
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary flex items-center gap-2">
            <Shield size={28} className="text-red-500" />
            Administrators
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage and view all system administrators
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl sm:text-3xl font-bold text-red-500">{users.length}</p>
          <p className="text-xs text-text-muted">Total Admins</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 size={40} className="text-red-500 animate-spin" />
          <p className="text-sm text-text-muted">Loading administrators...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Shield size={48} className="text-text-muted/30" />
          <p className="text-sm text-text-muted">
            {searchQuery ? 'No administrators found matching your search.' : 'No administrators found.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              className="cursor-pointer"
            >
              <UserCard user={user} role="admin" />
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          role="admin"
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Loader2, Download, Award, PlusCircle } from 'lucide-react';
import UserCard from '@/components/UserCard';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { adminService } from '@/services/adminService';
import type { User } from '@/types';

export default function AdminInstructorsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        const data = await adminService.getUsers('instructor');
        setUsers(data.users);
      } catch (error) {
        console.error('Failed to fetch instructors:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  const handleCreateInstructor = () => {
    router.push('/admin/create-instructor');
  };

  const filteredUsers = users.filter((user) => {
    const matchesSpecialization = !specializationFilter || (user.specialization && user.specialization.toLowerCase().includes(specializationFilter.toLowerCase()));
    const matchesLocation = !locationFilter || (user.location && user.location.toLowerCase().includes(locationFilter.toLowerCase()));
    
    return matchesSpecialization && matchesLocation;
  });

  const uniqueSpecializations = [...new Set(users.map(user => user.specialization).filter(Boolean))];
  const uniqueLocations = [...new Set(users.map(user => user.location).filter(Boolean))];

  const handleExport = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Specialization', 'Qualifications', 'Phone', 'Location', 'Joined Date'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        `"${user.name}"`,
        `"${user.email}"`,
        `"${user.specialization || ''}"`,
        `"${user.qualifications || ''}"`,
        `"${user.phone || ''}"`,
        `"${user.location || ''}"`,
        `"${new Date(user.created_at).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `instructors_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header with Filters - All in One Line */}
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-6 flex-1">
          {/* Title and Description */}
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Users size={32} className="text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Instructors Management
              </h1>
              <p className="text-sm text-gray-600">
                Manage and view all registered instructors
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 ml-auto">
            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm min-w-[160px]"
            >
              <option value="">All Specializations</option>
              {uniqueSpecializations.map(specialization => (
                <option key={specialization} value={specialization}>{specialization}</option>
              ))}
            </select>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm min-w-[140px]"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            <Button 
              variant="outline" 
              className="flex items-center gap-2 whitespace-nowrap"
              onClick={handleExport}
            >
              <Download size={16} />
              Export
            </Button>

            <Button 
              className="flex items-center gap-2 whitespace-nowrap"
              onClick={handleCreateInstructor}
            >
              <PlusCircle size={16} />
              Create Instructor
            </Button>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="text-center">
          <p className="text-3xl font-bold text-purple-600">{users.length}</p>
          <p className="text-sm text-gray-500">Total Instructors</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" text="Loading instructors..." />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="p-4 bg-gray-100 rounded-full">
            <Users size={48} className="text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {specializationFilter || locationFilter ? 'No instructors found' : 'No instructors registered'}
            </h3>
            <p className="text-gray-600 max-w-md">
              {specializationFilter || locationFilter 
                ? 'Try adjusting your filters to find instructors.' 
                : 'There are no instructors registered in the system yet.'}
            </p>
          </div>
          {(specializationFilter || locationFilter) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSpecializationFilter('');
                setLocationFilter('');
              }}
              className="mt-2"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Instructors Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                role="instructor"
              />
            ))}
          </div>
        </div>
      )}


    </div>
  );
}

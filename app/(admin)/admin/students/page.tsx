'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, Loader2, Download } from 'lucide-react';
import UserCard from '@/components/UserCard';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { adminService } from '@/services/adminService';
import type { User } from '@/types';

export default function AdminStudentsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await adminService.getUsers('student');
        setUsers(data.users);
      } catch (error) {
        console.error('Failed to fetch students:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesGrade = !gradeFilter || user.grade === gradeFilter;
    const matchesLocation = !locationFilter || (user.location && user.location.toLowerCase().includes(locationFilter.toLowerCase()));
    
    return matchesGrade && matchesLocation;
  });

  const uniqueGrades = [...new Set(users.map(user => user.grade).filter(Boolean))];
  const uniqueLocations = [...new Set(users.map(user => user.location).filter(Boolean))];

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

  const handleExport = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Age', 'Grade', 'School', 'Guardian', 'Phone', 'Location', 'Date of Birth', 'Joined Date'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        `"${user.name}"`,
        `"${user.email}"`,
        `"${user.age !== undefined ? user.age : (user.date_of_birth ? getAge(user.date_of_birth) : '')}"`,
        `"${user.grade || ''}"`,
        `"${user.school || ''}"`,
        `"${user.parent_guardian_name || ''}"`,
        `"${user.phone || ''}"`,
        `"${user.location || ''}"`,
        `"${user.date_of_birth || ''}"`,
        `"${new Date(user.created_at).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
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
            <div className="p-2 bg-blue-100 rounded-xl">
              <GraduationCap size={32} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Students Management
              </h1>
              <p className="text-sm text-gray-600">
                Manage and view all registered students
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 ml-auto">
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm min-w-[120px]"
            >
              <option value="">All Grades</option>
              {uniqueGrades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
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
          </div>
        </div>
        
        {/* Statistics */}
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">{users.length}</p>
          <p className="text-sm text-gray-500">Total Students</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" text="Loading students..." />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="p-4 bg-gray-100 rounded-full">
            <GraduationCap size={48} className="text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {gradeFilter || locationFilter ? 'No students found' : 'No students registered'}
            </h3>
            <p className="text-gray-600 max-w-md">
              {gradeFilter || locationFilter 
                ? 'Try adjusting your filters to find students.' 
                : 'There are no students registered in the system yet.'}
            </p>
          </div>
          {(gradeFilter || locationFilter) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setGradeFilter('');
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
          {/* Students Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                role="student"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

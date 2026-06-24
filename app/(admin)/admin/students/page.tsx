'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { 
  GraduationCap, 
  BookOpen, 
  Video, 
  TrendingUp, 
  Search,
  Eye,
  Loader2,
  User
} from 'lucide-react';

interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  school?: string;
  grade?: string;
  age?: number;
  created_at: string;
  total_enrollments: number;
  total_live_classes: number;
  lessons_completed: number;
  total_lessons: number;
  progress_percentage: number;
}

export default function AdminStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/students/stats');
      setStudents(res.data.students || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStats = {
    totalStudents: students.length,
    totalEnrollments: students.reduce((sum, s) => sum + s.total_enrollments, 0),
    totalLiveClasses: students.reduce((sum, s) => sum + s.total_live_classes, 0),
    avgProgress: students.length > 0 
      ? Math.round(students.reduce((sum, s) => sum + s.progress_percentage, 0) / students.length)
      : 0
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B]">Students Management</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Track student progress, enrollments, and live classes
          </p>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">Total Students</p>
              <p className="text-2xl font-bold text-[#1E293B] mt-1">
                {totalStats.totalStudents}
              </p>
            </div>
            <div className="bg-[#F1F5F9] p-3 rounded-lg">
              <GraduationCap className="w-6 h-6 text-[#6366F1]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">Total Enrollments</p>
              <p className="text-2xl font-bold text-[#1E293B] mt-1">
                {totalStats.totalEnrollments}
              </p>
            </div>
            <div className="bg-[#DBEAFE] p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-[#3B82F6]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">Total Live Classes</p>
              <p className="text-2xl font-bold text-[#1E293B] mt-1">
                {totalStats.totalLiveClasses}
              </p>
            </div>
            <div className="bg-[#FEF3C7] p-3 rounded-lg">
              <Video className="w-6 h-6 text-[#F59E0B]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">Avg Progress</p>
              <p className="text-2xl font-bold text-[#1E293B] mt-1">
                {totalStats.avgProgress}%
              </p>
            </div>
            <div className="bg-[#D1FAE5] p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-[#10B981]" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#6366F1]" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
              <p className="text-[#64748B]">No students found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Enrollments
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Live Classes
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {student.avatar_url ? (
                          <img
                            src={student.avatar_url}
                            alt={student.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#6366F1] flex items-center justify-center">
                            <span className="text-white font-medium">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-[#1E293B]">{student.name}</p>
                          {student.school && (
                            <p className="text-xs text-[#64748B]">{student.school}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-[#1E293B]">{student.email}</p>
                      {student.phone && (
                        <p className="text-xs text-[#64748B]">{student.phone}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#DBEAFE] text-[#1E40AF]">
                        {student.total_enrollments}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#FEF3C7] text-[#92400E]">
                        {student.total_live_classes}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-full max-w-[100px] bg-[#E2E8F0] rounded-full h-2">
                          <div
                            className="bg-[#10B981] h-2 rounded-full transition-all"
                            style={{ width: `${student.progress_percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#64748B]">
                          {student.lessons_completed}/{student.total_lessons} ({student.progress_percentage}%)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => router.push(`/admin/students/${student.id}`)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

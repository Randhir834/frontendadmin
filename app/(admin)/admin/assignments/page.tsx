'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Eye, Trash2, Search, FileText, Users } from 'lucide-react';

interface Assignment {
  id: number;
  title: string;
  description: string;
  course_title: string;
  course_id: number;
  creator_name: string;
  creator_role: string;
  due_date: string | null;
  max_score: number;
  is_published: boolean;
  submission_count: number;
  student_count: number;
  created_at: string;
  updated_at: string;
}

export default function AdminAssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'instructor'>('all');

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [searchTerm, filterRole, assignments]);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assignments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        setAssignments([]);
        return;
      }

      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (err: any) {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAssignments = () => {
    let filtered = assignments;

    if (searchTerm) {
      filtered = filtered.filter(
        (assignment) =>
          assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.creator_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter((assignment) => assignment.creator_role === filterRole);
    }

    setFilteredAssignments(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assignments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete assignment');

      setAssignments(assignments.filter((a) => a.id !== id));
      alert('Assignment deleted successfully');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Assignments</h1>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Assignments</h1>
        <p className="text-sm text-text-muted mt-1">
          Manage all assignments across the platform
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, course, or creator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Creators</option>
                <option value="admin">Admin Created</option>
                <option value="instructor">Instructor Created</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-text-muted mb-1">Total Assignments</p>
            <p className="text-2xl font-bold text-text-primary">{assignments.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-text-muted mb-1">Published</p>
            <p className="text-2xl font-bold text-green-600">
              {assignments.filter((a) => a.is_published).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-text-muted mb-1">Total Submissions</p>
            <p className="text-2xl font-bold text-blue-600">
              {assignments.reduce((sum, a) => sum + a.submission_count, 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-text-muted mb-1">Students Engaged</p>
            <p className="text-2xl font-bold text-purple-600">
              {assignments.reduce((sum, a) => sum + a.student_count, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assignment List */}
      {filteredAssignments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-text-muted">
              {searchTerm || filterRole !== 'all' ? 'No assignments match your filters' : 'No assignments found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Assignment Details
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Course
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Creator
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Stats
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Created
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-text-primary">{assignment.title}</p>
                          <p className="text-xs text-text-muted line-clamp-1">
                            {assignment.description || 'No description'}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-text-primary">{assignment.course_title}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm text-text-primary">{assignment.creator_name}</p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              assignment.creator_role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {assignment.creator_role}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span className="font-semibold text-text-primary">
                              {assignment.submission_count} submissions
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span className="font-semibold text-text-primary">
                              {assignment.student_count} students
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-text-muted">Max:</span>
                            <span className="font-semibold text-text-primary">
                              {assignment.max_score} pts
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block text-xs px-2 py-1 rounded ${
                              assignment.is_published
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {assignment.is_published ? 'Published' : 'Draft'}
                          </span>
                          {assignment.due_date && (
                            <p className="text-xs text-orange-600">
                              Due: {formatDate(assignment.due_date)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-text-muted">{formatDate(assignment.created_at)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/assignments/${assignment.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(assignment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Eye, Users, BarChart3, Trash2, Search } from 'lucide-react';

interface Quiz {
  id: number;
  title: string;
  description: string;
  course_title: string;
  course_id: number;
  creator_name: string;
  creator_role: string;
  is_published: boolean;
  deadline: string | null;
  question_count: number;
  attempt_count: number;
  total_marks: number;
  max_attempts: number;
  created_at: string;
  updated_at: string;
}

export default function AdminQuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'instructor'>('all');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    filterQuizzes();
  }, [searchTerm, filterRole, quizzes]);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        setQuizzes([]);
        return;
      }

      const data = await response.json();
      setQuizzes(data.quizzes || []);
    } catch (err: any) {
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const filterQuizzes = () => {
    let filtered = quizzes;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.creator_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by creator role
    if (filterRole !== 'all') {
      filtered = filtered.filter((quiz) => quiz.creator_role === filterRole);
    }

    setFilteredQuizzes(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete quiz');

      setQuizzes(quizzes.filter((q) => q.id !== id));
      alert('Quiz deleted successfully');
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
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Quizzes / Tests</h1>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Quizzes / Tests</h1>
        <p className="text-sm text-text-muted mt-1">
          Manage all quizzes and tests across the platform
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
            <p className="text-sm text-text-muted mb-1">Total Quizzes</p>
            <p className="text-2xl font-bold text-text-primary">{quizzes.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-text-muted mb-1">Published</p>
            <p className="text-2xl font-bold text-green-600">
              {quizzes.filter((q) => q.is_published).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-text-muted mb-1">Total Attempts</p>
            <p className="text-2xl font-bold text-blue-600">
              {quizzes.reduce((sum, q) => sum + q.attempt_count, 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-text-muted mb-1">Total Questions</p>
            <p className="text-2xl font-bold text-purple-600">
              {quizzes.reduce((sum, q) => sum + q.question_count, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quiz List */}
      {filteredQuizzes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-text-muted">
              {searchTerm || filterRole !== 'all' ? 'No quizzes match your filters' : 'No quizzes found'}
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
                      Quiz Details
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
                  {filteredQuizzes.map((quiz) => (
                    <tr key={quiz.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-text-primary">{quiz.title}</p>
                          <p className="text-xs text-text-muted line-clamp-1">
                            {quiz.description || 'No description'}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-text-primary">{quiz.course_title}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm text-text-primary">{quiz.creator_name}</p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              quiz.creator_role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {quiz.creator_role}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-text-muted">Questions:</span>
                            <span className="font-semibold text-text-primary">
                              {quiz.question_count}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-text-muted">Attempts:</span>
                            <span className="font-semibold text-text-primary">
                              {quiz.attempt_count}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-text-muted">Marks:</span>
                            <span className="font-semibold text-text-primary">
                              {quiz.total_marks}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block text-xs px-2 py-1 rounded ${
                              quiz.is_published
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {quiz.is_published ? 'Published' : 'Draft'}
                          </span>
                          {quiz.deadline && (
                            <p className="text-xs text-orange-600">
                              Due: {formatDate(quiz.deadline)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-text-muted">{formatDate(quiz.created_at)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/quizzes/${quiz.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/quizzes/${quiz.id}/results`)}
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(quiz.id)}
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

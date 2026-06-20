'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FileText, Calendar, Award, Users, CheckCircle, Clock, TrendingUp, Eye } from 'lucide-react';

interface AssignmentDetails {
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
  allow_late_submissions: boolean;
  created_at: string;
  updated_at: string;
}

interface AssignmentStatistics {
  total_assigned: number;
  total_submitted: number;
  total_graded: number;
  avg_score: string;
  submission_rate: number;
  highest_score: number;
  lowest_score: number;
  late_submissions: number;
}

interface Submission {
  id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  file_url: string | null;
  file_name: string | null;
  submission_text: string | null;
  score: number | null;
  feedback: string | null;
  status: string;
  is_late: boolean;
  submitted_at: string;
  graded_at: string | null;
}

export default function AdminAssignmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = (params?.id as string) || '';

  const [assignment, setAssignment] = useState<AssignmentDetails | null>(null);
  const [statistics, setStatistics] = useState<AssignmentStatistics | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'graded' | 'pending'>('all');

  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentDetails();
      fetchStatistics();
      fetchSubmissions();
    }
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch assignment details');

      const data = await response.json();
      setAssignment(data.assignment);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments/${assignmentId}/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch statistics');

      const data = await response.json();
      setStatistics(data.statistics);
    } catch (err: any) {
      console.error('Error fetching statistics:', err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments/${assignmentId}/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch submissions');

      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (err: any) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      graded: 'bg-green-100 text-green-800',
      submitted: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error || 'Assignment not found'}</p>
          <Button onClick={() => router.push('/admin/assignments')}>
            Back to Assignments
          </Button>
        </div>
      </div>
    );
  }

  const filteredSubmissions = submissions.filter((sub) => {
    if (filter === 'all') return true;
    if (filter === 'graded') return sub.status === 'graded';
    if (filter === 'pending') return sub.status !== 'graded';
    return true;
  });

  const gradedCount = submissions.filter((s) => s.status === 'graded').length;
  const pendingCount = submissions.length - gradedCount;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">{assignment.title}</h1>
        <p className="text-sm text-text-muted mt-1">
          {assignment.course_title} • Created by {assignment.creator_name} ({assignment.creator_role})
        </p>
      </div>

      {/* Assignment Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Assignment Details</CardTitle>
            {assignment.is_published ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Published
              </span>
            ) : (
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                Draft
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-text-muted">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Due Date</span>
              </div>
              <p className="text-sm text-text-primary font-medium">{formatDate(assignment.due_date)}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-text-muted">
                <Award className="w-4 h-4" />
                <span className="text-xs font-medium">Maximum Score</span>
              </div>
              <p className="text-sm text-text-primary font-medium">{assignment.max_score} points</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-text-muted">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Late Submissions</span>
              </div>
              <p className="text-sm text-text-primary font-medium">
                {assignment.allow_late_submissions ? 'Allowed' : 'Not Allowed'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-text-muted">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-medium">Created</span>
              </div>
              <p className="text-sm text-text-primary font-medium">
                {new Date(assignment.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-text-muted mb-2">Description</p>
            <p className="text-sm text-text-primary whitespace-pre-wrap">
              {assignment.description || 'No description provided'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Students Assigned</p>
                  <p className="text-2xl font-bold text-text-primary">{statistics.total_assigned}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Submitted</p>
                  <p className="text-2xl font-bold text-text-primary">{statistics.total_submitted}</p>
                  <p className="text-xs text-text-muted">{statistics.submission_rate}% submission rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Graded</p>
                  <p className="text-2xl font-bold text-text-primary">{statistics.total_graded}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Average Score</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {parseFloat(statistics.avg_score).toFixed(1)}
                  </p>
                  <p className="text-xs text-text-muted">
                    Range: {statistics.lowest_score} - {statistics.highest_score}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Late Submissions Alert */}
      {statistics && statistics.late_submissions > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                <strong>{statistics.late_submissions}</strong> late submission{statistics.late_submissions !== 1 ? 's' : ''}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          All Submissions
        </button>
        <button
          onClick={() => setFilter('graded')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'graded'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Graded
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'pending'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Pending
        </button>
      </div>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">No submissions found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Student
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Submitted At
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Score
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      File
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-text-primary">{submission.student_name}</p>
                          <p className="text-xs text-text-muted">{submission.student_email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm text-text-primary">
                            {new Date(submission.submitted_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-xs text-text-muted">
                            {new Date(submission.submitted_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {submission.is_late && (
                            <span className="text-xs text-yellow-600 font-medium">Late</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(submission.status)}</td>
                      <td className="py-3 px-4">
                        {submission.score !== null ? (
                          <span className="text-sm font-medium text-text-primary">
                            {submission.score} / {assignment.max_score}
                          </span>
                        ) : (
                          <span className="text-sm text-text-muted">Not graded</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {submission.file_url ? (
                          <a
                            href={submission.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-4 h-4" />
                            {submission.file_name || 'Download'}
                          </a>
                        ) : submission.submission_text ? (
                          <span className="text-sm text-text-muted">Text submission</span>
                        ) : (
                          <span className="text-sm text-text-muted">No file</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

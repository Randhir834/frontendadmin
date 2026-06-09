'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, Eye, TrendingUp, TrendingDown, Clock, Award, Users, BarChart3 } from 'lucide-react';

interface Quiz {
  id: number;
  title: string;
  course_title: string;
  creator_name: string;
  creator_role: string;
  total_marks: number;
  passing_score: number;
}

interface Attempt {
  id: number;
  student_name: string;
  student_email: string;
  score: number;
  total_marks: number;
  status: string;
  attempt_number: number;
  time_taken_seconds: number | null;
  started_at: string;
  completed_at: string | null;
}

interface Statistics {
  total_assigned: number;
  total_students_attempted: number;
  total_attempts: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  average_time_seconds: number;
}

export default function AdminQuizResultsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = (params?.id as string) || '';

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');

  useEffect(() => {
    fetchData();
  }, [quizId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication token not found');
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch quiz details
      const quizResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}`, {
        headers,
      });

      if (!quizResponse.ok) {
        throw new Error(`Failed to fetch quiz: ${quizResponse.statusText}`);
      }
      const quizData = await quizResponse.json();
      setQuiz(quizData.quiz || quizData);

      // Fetch attempts
      const attemptsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}/attempts`,
        {
          headers,
        }
      );

      if (!attemptsResponse.ok) {
        throw new Error(`Failed to fetch attempts: ${attemptsResponse.statusText}`);
      }
      const attemptsData = await attemptsResponse.json();
      setAttempts(attemptsData.attempts || []);

      // Fetch statistics
      const statsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}/statistics`,
        {
          headers,
        }
      );

      if (!statsResponse.ok) {
        throw new Error(`Failed to fetch statistics: ${statsResponse.statusText}`);
      }
      const statsData = await statsResponse.json();
      setStatistics(statsData.statistics || statsData);
    } catch (err: any) {
      console.error('Error fetching quiz data:', err);
      alert(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScorePercentage = (score: number, total: number) => {
    return ((score / total) * 100).toFixed(1);
  };

  const getScoreColor = (percentage: number, passingScore: number) => {
    // Convert passing score to percentage if it's not already (assuming it's out of 100)
    const passingPercentage = passingScore > 100 ? (passingScore / 100) : passingScore;
    if (percentage >= passingPercentage) return 'text-green-600';
    if (percentage >= passingPercentage * 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-8">Quiz not found</div>
      </div>
    );
  }

  const completedAttempts = attempts.filter((a) => a.status === 'completed');
  const filteredAttempts = completedAttempts.filter((attempt) => {
    const percentage = parseFloat(getScorePercentage(attempt.score, attempt.total_marks));
    const passingPercentage = quiz.passing_score > 100 ? (quiz.passing_score / 100) : quiz.passing_score;
    
    if (filter === 'all') return true;
    if (filter === 'passed') return percentage >= passingPercentage;
    if (filter === 'failed') return percentage < passingPercentage;
    return true;
  });

  const passedCount = completedAttempts.filter((attempt) => {
    const percentage = parseFloat(getScorePercentage(attempt.score, attempt.total_marks));
    const passingPercentage = quiz.passing_score > 100 ? (quiz.passing_score / 100) : quiz.passing_score;
    return percentage >= passingPercentage;
  }).length;

  const failedCount = completedAttempts.length - passedCount;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Quiz Results</h1>
          <p className="text-sm text-text-muted mt-1">
            {quiz.title} • {quiz.course_title} • Created by {quiz.creator_name} ({quiz.creator_role})
          </p>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Participation</p>
                  <p className="text-xl font-bold text-text-primary">
                    {statistics.total_students_attempted}/{statistics.total_assigned}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Average Score</p>
                  <p className="text-xl font-bold text-text-primary">
                    {statistics.average_score ? statistics.average_score.toFixed(1) : '0'}%
                  </p>
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
                  <p className="text-sm text-text-muted">Highest Score</p>
                  <p className="text-xl font-bold text-text-primary">
                    {statistics.highest_score || 0}/{quiz.total_marks}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Avg. Time</p>
                  <p className="text-xl font-bold text-text-primary">
                    {formatTime(statistics.average_time_seconds)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Pass Rate</p>
                  <p className="text-xl font-bold text-text-primary">
                    {completedAttempts.length > 0 
                      ? ((passedCount / completedAttempts.length) * 100).toFixed(1)
                      : '0'}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pass/Fail Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Passed</p>
                <p className="text-2xl font-bold text-green-600">{passedCount}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedCount}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

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
          All Attempts
        </button>
        <button
          onClick={() => setFilter('passed')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'passed'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Passed
        </button>
        <button
          onClick={() => setFilter('failed')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'failed'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Failed
        </button>
      </div>

      {/* Attempts List */}
      <Card>
        <CardHeader>
          <CardTitle>Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAttempts.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">No attempts found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Student
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Attempt
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Score
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Percentage
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Result
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Time Taken
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Completed At
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttempts.map((attempt) => {
                    const percentage = parseFloat(
                      getScorePercentage(attempt.score, attempt.total_marks)
                    );
                    const passingPercentage = quiz.passing_score > 100 ? (quiz.passing_score / 100) : quiz.passing_score;
                    const passed = percentage >= passingPercentage;

                    return (
                      <tr key={attempt.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {attempt.student_name}
                            </p>
                            <p className="text-xs text-text-muted">{attempt.student_email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-text-primary">#{attempt.attempt_number}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-text-primary">
                            {attempt.score}/{attempt.total_marks}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-sm font-semibold ${getScoreColor(
                              percentage,
                              quiz.passing_score
                            )}`}
                          >
                            {percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {passed ? (
                              <>
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-600">Passed</span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-medium text-red-600">Failed</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-text-primary">
                            {formatTime(attempt.time_taken_seconds)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-text-muted">
                            {attempt.completed_at ? formatDate(attempt.completed_at) : 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/quizzes/attempts/${attempt.id}`)
                            }
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
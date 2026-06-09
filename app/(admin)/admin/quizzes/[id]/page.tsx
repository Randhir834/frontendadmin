'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, BarChart3, Users, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';

interface Quiz {
  id: number;
  title: string;
  description: string;
  course_title: string;
  course_id: number;
  creator_name: string;
  creator_role: string;
  time_limit_minutes: number;
  passing_score: number;
  max_attempts: number;
  deadline: string | null;
  is_published: boolean;
  show_correct_answers: boolean;
  randomize_questions: boolean;
  total_marks: number;
  question_count: number;
  created_at: string;
  updated_at: string;
}

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  marks: number;
  sort_order: number;
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

export default function AdminQuizDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = (params?.id as string) || '';

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  const fetchQuizData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch quiz details
      const quizResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!quizResponse.ok) throw new Error('Failed to fetch quiz');

      const quizData = await quizResponse.json();
      setQuiz(quizData.quiz);
      setQuestions(quizData.questions || []);

      // Fetch statistics
      const statsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}/statistics`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStatistics(statsData.statistics);
      }
    } catch (err: any) {
      alert(err.message);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete quiz');

      alert('Quiz deleted successfully');
      router.push('/admin/quizzes');
    } catch (err: any) {
      alert(err.message);
    }
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

  const formatTime = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
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

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">{quiz.title}</h1>
          <p className="text-sm text-text-muted mt-1">
            {quiz.course_title} • Created by {quiz.creator_name} ({quiz.creator_role})
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/quizzes/${quizId}/results`)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Results
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
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
                <BarChart3 className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-text-muted">Avg Score</p>
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
                <CheckCircle className="w-8 h-8 text-purple-600" />
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
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 font-bold">T</span>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Avg Time</p>
                  <p className="text-xl font-bold text-text-primary">
                    {formatTime(statistics.average_time_seconds)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quiz Information */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {quiz.description && (
            <div>
              <h3 className="text-sm font-medium text-text-muted mb-1">Description</h3>
              <p className="text-text-primary">{quiz.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <h3 className="text-sm font-medium text-text-muted mb-1">Course</h3>
              <p className="text-text-primary font-semibold">{quiz.course_title}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-text-muted mb-1">Creator</h3>
              <p className="text-text-primary font-semibold">
                {quiz.creator_name}
                <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                  quiz.creator_role === 'admin' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {quiz.creator_role}
                </span>
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-text-muted mb-1">Time Limit</h3>
              <p className="text-text-primary font-semibold">{quiz.time_limit_minutes} minutes</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-text-muted mb-1">Passing Score</h3>
              <p className="text-text-primary font-semibold">{quiz.passing_score}%</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-text-muted mb-1">Max Attempts</h3>
              <p className="text-text-primary font-semibold">{quiz.max_attempts}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-text-muted mb-1">Total Marks</h3>
              <p className="text-text-primary font-semibold">{quiz.total_marks}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-text-muted mb-1">Questions</h3>
              <p className="text-text-primary font-semibold">{quiz.question_count}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-text-muted mb-1">Status</h3>
              <p className={`font-semibold ${quiz.is_published ? 'text-green-600' : 'text-gray-600'}`}>
                {quiz.is_published ? 'Published' : 'Draft'}
              </p>
            </div>
          </div>

          {quiz.deadline && (
            <div>
              <h3 className="text-sm font-medium text-text-muted mb-1">Deadline</h3>
              <p className="text-text-primary font-semibold">{formatDate(quiz.deadline)}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2">
              {quiz.show_correct_answers ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm text-text-primary">Show correct answers</span>
            </div>

            <div className="flex items-center gap-2">
              {quiz.randomize_questions ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm text-text-primary">Randomize questions</span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted">Created: </span>
                <span className="text-text-primary">{formatDate(quiz.created_at)}</span>
              </div>
              <div>
                <span className="text-text-muted">Last Updated: </span>
                <span className="text-text-primary">{formatDate(quiz.updated_at)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">No questions added yet</p>
          ) : (
            questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <h4 className="font-medium text-text-primary">
                    Question {index + 1} ({question.marks} {question.marks === 1 ? 'mark' : 'marks'})
                  </h4>
                </div>

                <p className="text-text-primary">{question.question_text}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['A', 'B', 'C', 'D'].map((option) => {
                    const optionKey = `option_${option.toLowerCase()}` as keyof Question;
                    const isCorrect = question.correct_option === option;

                    return (
                      <div
                        key={option}
                        className={`p-3 rounded-lg border-2 ${
                          isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-text-primary">{option}.</span>
                          <span className="text-text-primary flex-1">
                            {question[optionKey] as string}
                          </span>
                          {isCorrect && (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
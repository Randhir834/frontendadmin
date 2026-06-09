'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, TrendingUp, AlertTriangle, Calendar, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { attendanceService } from '@/services/attendanceService';

interface DashboardData {
  todayStats: {
    totalClasses: number;
    studentsPresent: number;
    studentsAbsent: number;
    studentsLate: number;
    attendanceRate: number;
  };
  weeklyTrends: Array<{
    date: string;
    attendanceRate: number;
    totalStudents: number;
  }>;
  alerts: Array<{
    type: 'low_attendance' | 'missing_attendance' | 'course_alert';
    message: string;
    courseId?: number;
    courseName?: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  topCourses: Array<{
    id: number;
    title: string;
    attendanceRate: number;
    studentsCount: number;
  }>;
  recentActivity: Array<{
    id: number;
    instructorName: string;
    courseName: string;
    studentsMarked: number;
    timestamp: string;
  }>;
}

export default function AttendanceDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Fetch attendance data
      const [todayData, weeklyData] = await Promise.all([
        attendanceService.getAttendanceReports({
          start_date: today,
          end_date: today
        }),
        attendanceService.getAttendanceReports({
          start_date: weekAgo,
          end_date: today
        })
      ]);

      const todayAttendance = todayData.attendance || [];
      const weeklyAttendance = weeklyData.attendance || [];

      // Calculate today's stats
      const todayStats = {
        totalClasses: new Set(todayAttendance.map((a: any) => `${a.course_id}-${a.date}`)).size,
        studentsPresent: todayAttendance.filter((a: any) => a.status === 'present').length,
        studentsAbsent: todayAttendance.filter((a: any) => a.status === 'absent').length,
        studentsLate: todayAttendance.filter((a: any) => a.status === 'late').length,
        attendanceRate: todayAttendance.length > 0 
          ? ((todayAttendance.filter((a: any) => a.status === 'present' || a.status === 'late').length) / todayAttendance.length * 100)
          : 0
      };

      // Calculate weekly trends
      const dailyStats: { [key: string]: { present: number; total: number } } = {};
      weeklyAttendance.forEach((record: any) => {
        const date = record.date;
        if (!dailyStats[date]) {
          dailyStats[date] = { present: 0, total: 0 };
        }
        dailyStats[date].total++;
        if (record.status === 'present' || record.status === 'late') {
          dailyStats[date].present++;
        }
      });

      const weeklyTrends = Object.entries(dailyStats)
        .map(([date, stats]) => ({
          date,
          attendanceRate: (stats.present / stats.total * 100),
          totalStudents: stats.total
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Generate alerts
      const alerts: DashboardData['alerts'] = [];

      // Check for courses with low attendance today
      const courseStats: { [key: number]: { title: string; present: number; total: number } } = {};
      todayAttendance.forEach((record: any) => {
        if (!courseStats[record.course_id]) {
          courseStats[record.course_id] = {
            title: record.course_title,
            present: 0,
            total: 0
          };
        }
        courseStats[record.course_id].total++;
        if (record.status === 'present' || record.status === 'late') {
          courseStats[record.course_id].present++;
        }
      });

      Object.entries(courseStats).forEach(([courseId, stats]) => {
        const rate = (stats.present / stats.total * 100);
        if (rate < 60 && stats.total >= 3) {
          alerts.push({
            type: 'low_attendance',
            message: `Low attendance in ${stats.title}: ${rate.toFixed(1)}%`,
            courseId: parseInt(courseId),
            courseName: stats.title,
            priority: 'high'
          });
        }
      });

      // Check for missing attendance (courses that should have had classes today but no attendance marked)
      // This would require additional logic to determine expected classes

      // Calculate top performing courses
      const topCourses = Object.entries(courseStats)
        .map(([id, stats]) => ({
          id: parseInt(id),
          title: stats.title,
          attendanceRate: (stats.present / stats.total * 100),
          studentsCount: stats.total
        }))
        .sort((a, b) => b.attendanceRate - a.attendanceRate)
        .slice(0, 5);

      // Generate recent activity (mock data - in real implementation, you'd track this)
      const recentActivity = todayAttendance
        .reduce((acc: any[], record: any) => {
          const existing = acc.find(a => a.courseId === record.course_id);
          if (existing) {
            existing.studentsMarked++;
          } else {
            acc.push({
              id: record.course_id,
              courseId: record.course_id,
              instructorName: record.instructor_name,
              courseName: record.course_title,
              studentsMarked: 1,
              timestamp: new Date().toISOString()
            });
          }
          return acc;
        }, [])
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

      setDashboardData({
        todayStats,
        weeklyTrends,
        alerts,
        topCourses,
        recentActivity
      });

      setLastUpdated(new Date());

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-[#1E88E5]" />
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-sm text-[#78909C]">Failed to load dashboard data.</p>
              <Button onClick={() => fetchDashboardData()} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/attendance">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#1E3A5F]">Live Attendance Dashboard</h1>
            <p className="text-sm text-[#78909C]">
              Real-time attendance monitoring • Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Calendar className="size-5 text-[#78909C] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#1E3A5F]">{dashboardData.todayStats.totalClasses}</div>
              <div className="text-sm text-[#78909C]">Classes Today</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <CheckCircle2 className="size-5 text-[#1E88E5] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#1E88E5]">{dashboardData.todayStats.studentsPresent}</div>
              <div className="text-sm text-[#78909C]">Present</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <XCircle className="size-5 text-[#EC407A] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#EC407A]">{dashboardData.todayStats.studentsAbsent}</div>
              <div className="text-sm text-[#78909C]">Absent</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Clock className="size-5 text-[#D97706] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#D97706]">{dashboardData.todayStats.studentsLate}</div>
              <div className="text-sm text-[#78909C]">Late</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <TrendingUp className="size-5 text-[#AB47BC] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#AB47BC]">{dashboardData.todayStats.attendanceRate.toFixed(1)}%</div>
              <div className="text-sm text-[#78909C]">Today's Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {dashboardData.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#EC407A]">
              <AlertTriangle className="size-5" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.alerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  alert.priority === 'high' ? 'bg-[#FEF2F2] border-[#FECACA] text-[#EC407A]' :
                  alert.priority === 'medium' ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]' :
                  'bg-[#EFF6FF] border-[#DBEAFE] text-[#1E40AF]'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{alert.message}</span>
                    {alert.courseId && (
                      <Link href={`/admin/attendance/courses/${alert.courseId}`}>
                        <Button variant="ghost" size="sm" className="text-xs">
                          View Details
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5" />
              Weekly Attendance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.weeklyTrends.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="size-12 text-[#E0E0E0] mx-auto mb-3" />
                <p className="text-sm text-[#78909C]">No trend data available.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.weeklyTrends.map((trend, index) => (
                  <div key={trend.date} className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-sm font-medium text-[#1E3A5F]">
                        {new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs text-[#78909C]">{trend.totalStudents} students</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${
                        trend.attendanceRate >= 80 ? 'text-[#1E88E5]' :
                        trend.attendanceRate >= 60 ? 'text-[#D97706]' : 'text-[#EC407A]'
                      }`}>
                        {trend.attendanceRate.toFixed(1)}%
                      </span>
                      {index > 0 && (
                        <div>
                          {trend.attendanceRate > dashboardData.weeklyTrends[index - 1].attendanceRate ? (
                            <TrendingUp className="size-4 text-[#1E88E5]" />
                          ) : trend.attendanceRate < dashboardData.weeklyTrends[index - 1].attendanceRate ? (
                            <TrendingUp className="size-4 text-[#EC407A] rotate-180" />
                          ) : (
                            <div className="size-4" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5" />
              Today's Top Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.topCourses.length === 0 ? (
              <div className="text-center py-8">
                <Users className="size-12 text-[#E0E0E0] mx-auto mb-3" />
                <p className="text-sm text-[#78909C]">No course data available.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.topCourses.map((course, index) => (
                  <div key={course.id} className="flex items-center justify-between p-3 border border-[#E0E0E0] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-[#FFD700]' : index === 1 ? 'bg-[#C0C0C0]' : index === 2 ? 'bg-[#CD7F32]' : 'bg-[#78909C]'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <Link 
                          href={`/admin/attendance/courses/${course.id}`}
                          className="text-sm font-medium text-[#1E88E5] hover:underline"
                        >
                          {course.title}
                        </Link>
                        <div className="text-xs text-[#78909C]">{course.studentsCount} students</div>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-sm font-bold text-[#1E88E5] bg-[#C5E1A5] rounded-full">
                      {course.attendanceRate.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            Recent Attendance Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="size-12 text-[#E0E0E0] mx-auto mb-3" />
              <p className="text-sm text-[#78909C]">No recent activity.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border border-[#E0E0E0] rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-[#1E3A5F]">
                      {activity.instructorName} marked attendance for {activity.courseName}
                    </div>
                    <div className="text-xs text-[#78909C]">
                      {activity.studentsMarked} students • {new Date(activity.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <CheckCircle2 className="size-5 text-[#1E88E5]" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { adminService } from '@/services/adminService';
import type { DashboardStats } from '@/types';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    adminService.getAnalytics().then((data) => setStats(data.stats)).catch(() => setStats(null));
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Analytics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader><CardTitle>Total Students</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-primary-500">{stats?.totalStudents ?? '-'}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Instructors</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-primary-500">{stats?.totalInstructors ?? '-'}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Courses</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-primary-500">{stats?.totalCourses ?? '-'}</p></CardContent>
        </Card>
      </div>
    </div>
  );
}

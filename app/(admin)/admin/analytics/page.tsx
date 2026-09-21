'use client';

import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
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
      <div className="flex items-center gap-4">
        <div className="p-2 bg-blue-100 rounded-xl">
          <BarChart3 size={32} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">View platform performance and insights</p>
        </div>
      </div>
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

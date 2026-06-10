'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, GraduationCap, BookOpen, DollarSign, PlusCircle, Loader2, Shield } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import api from '@/services/api';
import type { DashboardStats } from '@/types';

export default function AdminHomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setStats(res.data.stats || {
          totalStudents: 0,
          totalInstructors: 0,
          totalCourses: 0,
          totalRevenue: 0
        });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        // Set default stats if analytics fails
        setStats({
          totalStudents: 0,
          totalInstructors: 0,
          totalCourses: 0,
          totalRevenue: 0
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: GraduationCap, color: 'text-primary-500', bg: 'bg-primary-50' },
    { label: 'Total Instructors', value: stats?.totalInstructors ?? 0, icon: Users, color: 'text-info', bg: 'bg-[#DBEAFE]' },
    { label: 'Total Courses', value: stats?.totalCourses ?? 0, icon: BookOpen, color: 'text-warning', bg: 'bg-[#FEF3C7]' },
    { label: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString() ?? 0}`, icon: DollarSign, color: 'text-success', bg: 'bg-primary-50' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Admin Dashboard</h1>
        <Link href="/admin/courses/create">
          <Button size="lg" className="gap-2">
            <PlusCircle size={18} />
            Add Course
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statCards.map((card) => (
            <Card key={card.label}>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${card.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <card.icon size={22} className={card.color} />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">{card.label}</p>
                    <p className="text-2xl font-bold text-text-primary">{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quick Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/admin/courses/create" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-hover transition-colors">
                <PlusCircle size={20} className="text-primary-500" />
                <span className="text-sm font-medium text-text-primary">Create New Course</span>
              </Link>
              <Link href="/admin/courses" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-hover transition-colors">
                <BookOpen size={20} className="text-primary-500" />
                <span className="text-sm font-medium text-text-primary">Manage Courses</span>
              </Link>
              <Link href="/admin/instructors" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-hover transition-colors">
                <Users size={20} className="text-info" />
                <span className="text-sm font-medium text-text-primary">Manage Instructors</span>
              </Link>
              <Link href="/admin/students" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-hover transition-colors">
                <GraduationCap size={20} className="text-warning" />
                <span className="text-sm font-medium text-text-primary">Manage Students</span>
              </Link>
              <Link href="/admin/admins" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-hover transition-colors">
                <Shield size={20} className="text-red-500" />
                <span className="text-sm font-medium text-text-primary">Manage Admins</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Courses</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-text-muted">Courses will appear here once created.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

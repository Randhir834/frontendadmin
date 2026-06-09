'use client';

import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function AdminReportsPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Reports & Analytics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader><CardTitle>Total Students</CardTitle></CardHeader>
          <CardContent><p className="text-2xl sm:text-3xl font-bold text-primary-500">-</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Courses</CardTitle></CardHeader>
          <CardContent><p className="text-2xl sm:text-3xl font-bold text-success">-</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Enrollments</CardTitle></CardHeader>
          <CardContent><p className="text-2xl sm:text-3xl font-bold text-info">-</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Revenue</CardTitle></CardHeader>
          <CardContent><p className="text-2xl sm:text-3xl font-bold text-warning">-</p></CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Enrollment Trend</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted">Enrollment trend chart will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

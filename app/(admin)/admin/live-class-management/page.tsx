'use client';

import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function AdminLiveClassManagementPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Live Class Management</h1>
      <Card>
        <CardHeader><CardTitle>Scheduled Live Classes</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted">All scheduled live classes will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { notificationService } from '@/services/notificationService';
import type { Notification } from '@/types';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    notificationService.getNotifications().then((d) => setNotifications(d.notifications)).catch(() => setNotifications([]));
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-yellow-100 rounded-xl">
          <Bell size={32} className="text-yellow-600" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Manage system notifications and alerts</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>My Notifications</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {notifications.length === 0 && <p className="text-sm text-text-muted">No notifications.</p>}
            {notifications.map((n) => (
              <div key={n.id} className="border-b border-border-soft py-2">
                <p className="text-sm font-medium text-text-primary">{n.title}</p>
                <p className="text-xs text-text-muted">{n.message}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

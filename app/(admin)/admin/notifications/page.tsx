'use client';

import { useEffect, useState } from 'react';
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
      <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Notifications</h1>
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

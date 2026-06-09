'use client';

import { useEffect, useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { settingsService } from '@/services/settingsService';
import type { SystemSetting } from '@/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);

  useEffect(() => {
    settingsService.getSettings().then((d) => setSettings(d.settings)).catch(() => setSettings([]));
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-text-primary">System Settings</h1>
      <Card>
        <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {settings.length === 0 && <p className="text-sm text-text-muted">No settings found.</p>}
            {settings.map((s) => (
              <div key={s.id} className="flex items-center justify-between border-b border-border-soft py-2">
                <p className="text-sm font-medium text-text-primary">{s.key}</p>
                <p className="text-sm text-text-secondary">{s.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

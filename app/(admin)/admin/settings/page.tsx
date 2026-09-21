'use client';

import { useEffect, useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
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
      <div className="flex items-center gap-4">
        <div className="p-2 bg-gray-100 rounded-xl">
          <SettingsIcon size={32} className="text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure platform-wide settings and preferences</p>
        </div>
      </div>
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

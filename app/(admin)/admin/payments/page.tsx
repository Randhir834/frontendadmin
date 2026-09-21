'use client';

import { CreditCard } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function AdminPaymentsPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-green-100 rounded-xl">
          <CreditCard size={32} className="text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all payment transactions</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted">Payment/subscription management will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

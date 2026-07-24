import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function AdminPaymentsPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Payments / Subscriptions</h1>
      <Card>
        <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted">Payment/subscription management will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

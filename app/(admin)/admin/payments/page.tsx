'use client';

import { useEffect, useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Search,
  Download,
  Eye,
  Loader2
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { paymentService } from '@/services/paymentService';
import type { Payment, PaymentStats } from '@/types';
import toast from 'react-hot-toast';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    total_payments: 0,
    successful_payments: 0,
    failed_payments: 0,
    total_revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, statsRes] = await Promise.all([
        paymentService.getAllPayments().catch(err => ({ payments: [] })),
        paymentService.getPaymentStats().catch(err => ({ stats: { total_payments: 0, successful_payments: 0, failed_payments: 0, total_revenue: 0 } })),
      ]);
      
      setPayments(paymentsRes.payments || []);
      setStats(statsRes.stats || { total_payments: 0, successful_payments: 0, failed_payments: 0, total_revenue: 0 });
    } catch (error: any) {
      console.error('Failed to fetch payments:', error);
      // Set empty data instead of showing error
      setPayments([]);
      setStats({ total_payments: 0, successful_payments: 0, failed_payments: 0, total_revenue: 0 });
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.razorpay_payment_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number, currency: string = 'INR') => {
    return `₹${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-[#D1FAE5] text-[#065F46] border-[#6EE7B7]',
      pending: 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]',
      failed: 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]',
      refunded: 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]',
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Student Name', 'Email', 'Course', 'Amount', 'Payment ID', 'Status', 'Payment Method'];
    const rows = filteredPayments.map(p => [
      formatDate(p.created_at),
      p.student_name || 'N/A',
      p.student_email || 'N/A',
      p.course_title || 'N/A',
      p.amount.toString(),
      p.razorpay_payment_id || 'N/A',
      p.status,
      p.payment_method || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#1E88E5]" />
          <p className="text-[#64748B]">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B]">Payments & Revenue</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Monitor all transactions and revenue
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">Total Revenue</p>
              <p className="text-2xl font-bold text-[#1E293B] mt-1">
                {formatAmount(Number(stats.total_revenue))}
              </p>
            </div>
            <div className="bg-[#D1FAE5] p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-[#10B981]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">Total Payments</p>
              <p className="text-2xl font-bold text-[#1E293B] mt-1">
                {stats.total_payments}
              </p>
            </div>
            <div className="bg-[#DBEAFE] p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-[#3B82F6]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">Successful</p>
              <p className="text-2xl font-bold text-[#1E293B] mt-1">
                {stats.successful_payments}
              </p>
            </div>
            <div className="bg-[#D1FAE5] p-3 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">Failed</p>
              <p className="text-2xl font-bold text-[#1E293B] mt-1">
                {stats.failed_payments}
              </p>
            </div>
            <div className="bg-[#FEE2E2] p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-[#EF4444]" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search by student, email, course, or payment ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E88E5] bg-white"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-[#1E88E5] text-white font-medium rounded-lg hover:bg-[#1976D2] transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <DollarSign className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
                      <p className="text-[#64748B]">No payments found</p>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4 text-sm text-[#1E293B] whitespace-nowrap">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <div className="font-medium text-[#1E293B]">{payment.student_name || 'N/A'}</div>
                          <div className="text-[#64748B] text-xs">{payment.student_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#1E293B]">
                        <div className="max-w-xs truncate" title={payment.course_title}>
                          {payment.course_title || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#1E293B] whitespace-nowrap">
                        {formatAmount(payment.amount, payment.currency)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#64748B] font-mono text-xs">
                        {payment.razorpay_payment_id || payment.razorpay_order_id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#64748B] capitalize">
                        {payment.payment_method || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

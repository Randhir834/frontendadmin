import AdminDashboardLayout from '@/components/layouts/AdminDashboardLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}

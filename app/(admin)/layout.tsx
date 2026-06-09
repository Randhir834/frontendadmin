import RoleGuard from '@/components/layouts/RoleGuard';

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['admin']}>{children}</RoleGuard>;
}

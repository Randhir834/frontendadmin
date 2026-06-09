import RoleGuard from '@/components/layouts/RoleGuard';

export default function InstructorGroupLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['instructor', 'admin']}>{children}</RoleGuard>;
}
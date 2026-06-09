'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RoleGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Array<'admin' | 'instructor' | 'student'>;
}) {
  const router = useRouter();

  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!rawUser || !token) {
      router.replace('/login');
      return;
    }

    try {
      const user = JSON.parse(rawUser) as { role?: string };
      if (!user?.role || !allowedRoles.includes(user.role as 'admin' | 'instructor' | 'student')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        router.replace('/login');
      }
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.replace('/login');
    }
  }, [allowedRoles, router]);

  return <>{children}</>;
}

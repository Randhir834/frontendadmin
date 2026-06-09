'use client';

import { usePathname } from 'next/navigation';
import AuthLayout from '@/components/layouts/AuthLayout';

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password'
  ) {
    return <>{children}</>;
  }

  return <AuthLayout>{children}</AuthLayout>;
}

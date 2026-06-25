'use client';

import { useEffect } from 'react';
import RoleGuard from '@/components/layouts/RoleGuard';

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  // Prevent bfcache on protected pages
  useEffect(() => {
    // This ensures the page is not cached in browser's back-forward cache
    const preventBfCache = () => {
      // Do nothing - just having this listener prevents bfcache in many browsers
    };

    // Add unload listener to prevent bfcache
    window.addEventListener('unload', preventBfCache);

    // Also check on page show if it was restored from bfcache
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from bfcache - force reload
        window.location.reload();
      }
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('unload', preventBfCache);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  return <RoleGuard allowedRoles={['admin']}>{children}</RoleGuard>;
}

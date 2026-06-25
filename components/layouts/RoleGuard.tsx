'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function RoleGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Array<'admin' | 'instructor' | 'student'>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Check if logout was initiated - prevent bfcache access
      const logoutInitiated = sessionStorage.getItem('logout_initiated');
      if (logoutInitiated === 'true') {
        sessionStorage.removeItem('logout_initiated');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('sessionToken');
        sessionStorage.removeItem('auth_session');
        setIsAuthorized(false);
        setIsChecking(false);
        window.location.href = '/login';
        return false;
      }

      const rawUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      const authSession = sessionStorage.getItem('auth_session');

      // If no token or no auth session, redirect to login
      if (!rawUser || !token || !authSession) {
        setIsAuthorized(false);
        setIsChecking(false);
        router.replace('/login');
        return false;
      }

      try {
        const user = JSON.parse(rawUser) as { role?: string };
        if (!user?.role || !allowedRoles.includes(user.role as 'admin' | 'instructor' | 'student')) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('sessionToken');
          sessionStorage.removeItem('auth_session');
          setIsAuthorized(false);
          setIsChecking(false);
          router.replace('/login');
          return false;
        }
        setIsAuthorized(true);
        setIsChecking(false);
        return true;
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('sessionToken');
        sessionStorage.removeItem('auth_session');
        setIsAuthorized(false);
        setIsChecking(false);
        router.replace('/login');
        return false;
      }
    };

    // Critical: Handle bfcache restoration (back/forward navigation)
    const handlePageShow = (event: PageTransitionEvent) => {
      // If page is loaded from bfcache (persisted), revalidate auth
      if (event.persisted) {
        const hasValidAuth = checkAuth();
        if (!hasValidAuth) {
          // Force reload to ensure clean state
          window.location.reload();
        }
      }
    };

    // Check auth on mount and pathname change
    checkAuth();

    // Listen for visibility change (tab becomes visible)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuth();
      }
    };

    // Listen for focus (window becomes active)
    const handleFocus = () => {
      checkAuth();
    };

    // Listen for popstate (browser back/forward)
    const handlePopState = () => {
      checkAuth();
    };

    // Listen for storage changes (logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user' || e.key === null) {
        checkAuth();
      }
    };

    // Listen for custom logout event
    const handleLogout = () => {
      setIsAuthorized(false);
      router.replace('/login');
    };

    // Add pageshow listener for bfcache detection
    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [allowedRoles, router, pathname]);

  // Prevent rendering of stale content from bfcache
  useEffect(() => {
    // Set a marker to detect if page was loaded from cache
    const unloadHandler = () => {
      // This will be cleared if page is truly unloaded
      // but persist if cached
      sessionStorage.setItem('page_loaded', 'true');
    };

    window.addEventListener('beforeunload', unloadHandler);

    return () => {
      window.removeEventListener('beforeunload', unloadHandler);
    };
  }, []);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Only render children if authorized
  return isAuthorized ? <>{children}</> : null;
}

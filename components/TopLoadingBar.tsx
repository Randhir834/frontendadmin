'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({ 
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.08,
  easing: 'ease',
  speed: 500
});

function TopLoadingBarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept Next.js navigation
    const handleStart = () => NProgress.start();
    const handleComplete = () => NProgress.done();

    // Listen to route change events
    window.addEventListener('beforeunload', handleStart);

    return () => {
      window.removeEventListener('beforeunload', handleStart);
    };
  }, []);

  return null;
}

export default function TopLoadingBar() {
  return (
    <Suspense fallback={null}>
      <TopLoadingBarContent />
    </Suspense>
  );
}

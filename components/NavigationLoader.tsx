'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';

/**
 * Global navigation loader that displays a centered loading UI
 * during page transitions throughout the admin website
 */
export default function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show loading state when route changes
    setIsLoading(true);

    // Hide loading state after Next.js completes navigation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Slightly longer to ensure smooth transition

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 bg-white/90 backdrop-blur-md z-[9999] flex items-center justify-center page-load-fade-in"
      role="status"
      aria-live="polite"
      aria-label="Page loading"
    >
      <div className="flex flex-col items-center gap-5 p-10 bg-white rounded-2xl shadow-2xl border border-gray-200 page-load-zoom-in">
        <LoadingSpinner size="lg" text="" />
        <div className="text-center space-y-1">
          <p className="text-xl font-semibold text-gray-800">
            Loading...
          </p>
          <p className="text-sm text-gray-500">
            Please wait a moment
          </p>
        </div>
      </div>
    </div>
  );
}

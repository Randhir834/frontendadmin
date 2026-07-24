'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';

/**
 * Global navigation loader that displays a brief, professional loading UI
 * during page transitions throughout the admin website.
 * Optimized to show only once per navigation with minimal delay.
 */
export default function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousRouteRef = useRef<string>('');

  useEffect(() => {
    // Create unique route identifier
    const currentRoute = `${pathname}${searchParams.toString()}`;
    
    // Skip if same route (prevents double loading on same page)
    if (currentRoute === previousRouteRef.current) {
      return;
    }
    
    previousRouteRef.current = currentRoute;

    // Clear any existing timers
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
    }

    // Start loading state immediately
    setIsLoading(true);
    
    // Delay showing the loader by 150ms - if page loads fast, user won't see it
    delayTimerRef.current = setTimeout(() => {
      setShouldShow(true);
    }, 150);

    // Auto-hide after max 300ms (quick professional transition)
    loadingTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      setShouldShow(false);
    }, 300);

    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
      }
    };
  }, [pathname, searchParams]);

  // Only render if both loading and should show (after delay)
  if (!isLoading || !shouldShow) return null;

  return (
    <div 
      className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex items-center justify-center transition-opacity duration-200"
      role="status"
      aria-live="polite"
      aria-label="Page loading"
    >
      <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-xl border border-gray-100 animate-fade-in-scale">
        <LoadingSpinner size="lg" text="" />
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-800">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
}

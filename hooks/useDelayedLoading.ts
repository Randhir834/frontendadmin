import { useState, useEffect } from 'react';

/**
 * Hook that delays showing a loading state to prevent flash of loading spinner
 * during fast data fetches or page transitions
 * 
 * @param isLoading - The actual loading state
 * @param delay - Delay in milliseconds before showing loading (default: 500ms)
 * @returns Whether to show the loading indicator
 */
export function useDelayedLoading(isLoading: boolean, delay: number = 500): boolean {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (isLoading) {
      // Only show loading indicator if it takes longer than the delay
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      // Immediately hide loading when done
      setShowLoading(false);
    }
  }, [isLoading, delay]);

  return showLoading;
}

'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsLoading(true);
    
    // Small delay to show loading state and allow smooth transition
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [pathname, children]);

  return (
    <div className="relative min-h-full">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-smooth z-50 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading page..." />
        </div>
      )}
      
      {/* Page Content with Transition */}
      <div 
        className={`transition-all duration-300 ease-out ${
          isLoading 
            ? 'opacity-0 transform translate-y-4 scale-[0.98]' 
            : 'opacity-100 transform translate-y-0 scale-100 page-transition-enter'
        }`}
      >
        {displayChildren}
      </div>
    </div>
  );
}
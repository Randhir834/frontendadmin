'use client';

import { Suspense } from 'react';
import NavigationLoader from '@/components/NavigationLoader';

/**
 * Provider component that wraps the NavigationLoader
 * Uses Suspense to handle the useSearchParams hook requirements
 */
export default function NavigationLoaderProvider() {
  return (
    <Suspense fallback={null}>
      <NavigationLoader />
    </Suspense>
  );
}

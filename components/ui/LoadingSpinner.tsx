import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
};

export default function LoadingSpinner({ 
  size = 'md', 
  message, 
  fullScreen = false,
  className = '' 
}: LoadingSpinnerProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative">
        <Loader2 
          className={`${sizeClasses[size]} animate-spin text-blue-600`}
          strokeWidth={2.5}
        />
        <div className={`${sizeClasses[size]} absolute inset-0 rounded-full bg-blue-100 opacity-20 animate-pulse`} />
      </div>
      {message && (
        <p className="text-sm font-medium text-gray-600 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
}

// Page-level loading component
export function PageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="relative inline-block">
          <Loader2 
            className="h-16 w-16 animate-spin text-blue-600"
            strokeWidth={2.5}
          />
          <div className="h-16 w-16 absolute inset-0 rounded-full bg-blue-100 opacity-20 animate-pulse" />
        </div>
        <p className="mt-6 text-base font-medium text-gray-700 animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}

// Card/Section loading component
export function SectionLoading({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 
          className="h-10 w-10 animate-spin text-blue-600 mx-auto"
          strokeWidth={2.5}
        />
        {message && (
          <p className="mt-3 text-sm text-gray-600 animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

// Inline loading component
export function InlineLoading({ message }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      {message && <span>{message}</span>}
    </div>
  );
}

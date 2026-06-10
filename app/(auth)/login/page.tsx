'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import AdminAuthSplitShell from '@/components/layouts/AdminAuthSplitShell';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  // Detect if the input is email or phone
  const isEmail = identifier.includes('@');
  const inputType = isEmail ? 'email' : 'tel';
  const placeholder = 'Enter your email or phone number';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login({ identifier, password, expectedRole: 'admin' });
      
      if (!data.token || !data.user) {
        throw new Error('Invalid response from server: missing token or user data');
      }
      
      login(data.user, data.token);
      router.push('/dashboard');
    } catch (err: unknown) {
      // Handle different error types
      let message = 'Login failed. Please try again.';
      
      if (err instanceof Error) {
        // Network, timeout, or other errors
        message = err.message;
        
        // Handle specific error types
        if (err.message.includes('ECONNREFUSED') || err.message.includes('ENETUNREACH')) {
          message = 'Cannot connect to server. Please check your connection and try again.';
        } else if (err.message.includes('timeout')) {
          message = 'Request timeout. Please try again.';
        }
      } else {
        const error = err as { response?: { data?: { error?: string } }; message?: string; code?: string };
        
        // Structured API error response
        if (error.response?.data?.error) {
          message = error.response.data.error;
        } else if (error.message) {
          message = error.message;
        } else if (error.code) {
          // Axios error code
          if (error.code === 'ECONNREFUSED' || error.code === 'ENETUNREACH') {
            message = 'Cannot connect to server. Please check your connection.';
          } else if (error.code === 'ENOTFOUND') {
            message = 'Server not found. Please check the backend URL.';
          } else {
            message = `Connection error: ${error.code}`;
          }
        }
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthSplitShell
      leftTitle={
        <>
          Welcome to
          <br />
          <span className="text-yellow-300">PlayFit</span> <span className="text-2xl">🎓</span>
        </>
      }
      leftSubtitle="Empowering administrators to oversee, manage, and deliver exceptional learning experiences."
      leftImage="/images/logininadmin.png"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-text-primary text-center mb-2">Admin Login</h2>
      <p className="text-center text-xs sm:text-sm text-text-muted mb-6 sm:mb-8">Welcome back! Please login to your account.</p>

      {error && (
        <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg bg-hover text-error text-xs sm:text-sm text-center">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Unified Email/Phone Input */}
        <div className="space-y-1.5">
          <label htmlFor="identifier" className="block text-xs sm:text-sm font-medium text-text-primary">
            Email or Phone Number
          </label>
          <div className="relative">
            <div className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
              {isEmail ? (
                <svg width="16" height="16" className="sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              ) : (
                <svg width="16" height="16" className="sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              )}
            </div>
            <input
              id="identifier"
              type={inputType}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={placeholder}
              required
              className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-border text-xs sm:text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-text-primary">Password</label>
          <div className="relative">
            <div className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
              <svg width="16" height="16" className="sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full pl-9 sm:pl-11 pr-9 sm:pr-11 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-border text-xs sm:text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 sm:right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
            >
              {showPassword ? (
                <svg width="16" height="16" className="sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              ) : (
                <svg width="16" height="16" className="sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.78 0 1.53-.09 2.24-.26"/><path d="M2 2l20 20"/></svg>
              )}
            </button>
          </div>
        </div>

        <div className="text-right">
          <Link href="/forgot-password" className="text-xs sm:text-sm text-primary-500 hover:text-primary-600 font-medium">Forgot Password?</Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 active:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? (
            'Signing in...'
          ) : (
            <>
              <svg width="16" height="16" className="sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              Login
            </>
          )}
        </button>
      </form>

    </AdminAuthSplitShell>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import AdminAuthSplitShell from '@/components/layouts/AdminAuthSplitShell';
import { authService } from '@/services/authService';
import { getUserFriendlyError, logTechnicalError } from '@/utils/errorHandler';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword({
        email,
        expectedRole: 'admin',
        clientOrigin: typeof window !== 'undefined' ? window.location.origin : '',
      });
      setSubmitted(true);
    } catch (err: unknown) {
      logTechnicalError('Admin Forgot Password', err);
      const message = getUserFriendlyError(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthSplitShell
      leftTitle={
        <>
          Recover
          <br />
          <span className="text-yellow-300">Admin Access</span> <span className="text-2xl">🔐</span>
        </>
      }
      leftSubtitle="We will generate a secure reset link for admin accounts on this portal."
    >
      <h2 className="text-2xl font-bold text-text-primary text-center mb-2">Forgot Password</h2>
      <p className="text-center text-sm text-text-muted mb-8">
        {submitted
          ? 'Check your inbox for the reset link.'
          : 'Enter your email address and we will send you a password reset link.'}
      </p>

      {submitted ? (
        <div className="text-center space-y-6">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">
              If an admin account exists for <span className="font-medium text-text-primary">{email}</span>, we've sent a password reset link to your email.
            </p>
            <p className="text-sm text-text-secondary">
              The link will <span className="font-medium text-text-primary">expire in 10 minutes</span>. Please check your inbox and spam folder.
            </p>
          </div>
          <Link href="/login" className="inline-flex w-full py-3 rounded-xl bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 active:bg-primary-700 transition-colors items-center justify-center gap-2 shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="p-3 rounded-lg bg-hover text-error text-sm text-center">{error}</div>}
          <Input label="Email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 active:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? 'Sending...' : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                Send reset link
              </>
            )}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-text-muted">
        <Link href="/login" className="text-primary-500 hover:text-primary-600 font-semibold">
          Back to sign in
        </Link>
      </p>
    </AdminAuthSplitShell>
  );
}

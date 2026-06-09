'use client';

import { useState } from 'react';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import AdminAuthSplitShell from '@/components/layouts/AdminAuthSplitShell';
import { authService } from '@/services/authService';

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
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Something went wrong.';
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
      <h2 className="text-2xl font-bold text-text-primary text-center mb-2">Forgot password</h2>
      <p className="text-center text-sm text-text-muted mb-8">Reset your admin password</p>

      {submitted ? (
        <div className="text-center space-y-4">
          <p className="text-sm text-text-secondary">
            If an admin account exists for that email, a reset link was generated. In development, check the API server
            console for the full URL.
          </p>
          <Link href="/login" className="text-primary-500 hover:text-primary-600 font-semibold text-sm inline-block">
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

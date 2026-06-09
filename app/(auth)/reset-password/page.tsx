'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AdminAuthSplitShell from '@/components/layouts/AdminAuthSplitShell';
import Input from '@/components/ui/Input';
import { authService } from '@/services/authService';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Missing reset token.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword({ token, password });
      setDone(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Could not reset password.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-text-primary text-center mb-2">Set a new password</h2>
      <p className="text-center text-sm text-text-muted mb-8">Admin account</p>

      {done ? (
        <div className="text-center space-y-4">
          <p className="text-sm text-text-secondary">Password updated. You can sign in now.</p>
          <Link href="/login" className="text-primary-500 font-semibold">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="p-3 rounded-lg bg-hover text-error text-sm text-center">{error}</div>}
          <Input
            label="New password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Input
            label="Confirm password"
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 active:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? 'Saving...' : 'Update password'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-text-muted">
        <Link href="/login" className="text-primary-500 font-semibold">
          Back to sign in
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AdminAuthSplitShell
      leftTitle={
        <>
          Secure
          <br />
          <span className="text-yellow-300">Admin Credentials</span> <span className="text-2xl">🔒</span>
        </>
      }
      leftSubtitle="Choose a strong password for your administrator account."
    >
      <Suspense fallback={<p className="text-center text-sm text-text-muted">Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AdminAuthSplitShell>
  );
}

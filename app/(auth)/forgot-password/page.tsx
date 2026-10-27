'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminAuthSplitShell from '@/components/layouts/AdminAuthSplitShell';
import OTPInput from '@/components/ui/OTPInput';
import { authService } from '@/services/authService';
import { getUserFriendlyError, logTechnicalError } from '@/utils/errorHandler';

type Step = 'email' | 'otp' | 'password' | 'success';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState(10);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authService.requestPasswordReset({
        email,
        expectedRole: 'admin',
      });
      setExpiryMinutes(response.expiryMinutes || 10);
      setStep('otp');
    } catch (err: unknown) {
      logTechnicalError('Admin Request Password Reset', err);
      const message = getUserFriendlyError(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 4) {
      setError('Please enter the complete 4-digit code.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await authService.verifyPasswordResetOTP({
        email,
        otp,
        expectedRole: 'admin',
      });
      setStep('password');
    } catch (err: unknown) {
      logTechnicalError('Admin Verify OTP', err);
      const message = getUserFriendlyError(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await authService.resetPasswordWithOTP({
        email,
        password,
        expectedRole: 'admin',
      });
      setStep('success');
    } catch (err: unknown) {
      logTechnicalError('Admin Reset Password', err);
      const message = getUserFriendlyError(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await authService.requestPasswordReset({
        email,
        expectedRole: 'admin',
      });
      setExpiryMinutes(response.expiryMinutes || 10);
      setOtp('');
      setError('');
    } catch (err: unknown) {
      logTechnicalError('Admin Resend OTP', err);
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
      leftSubtitle="We'll send a verification code to your email so you can reset your password securely."
    >
      <div className="relative">
        {/* Progress Indicator */}
        <div className="mb-6 xs:mb-7 sm:mb-8">
          <div className="flex items-center justify-center gap-2 xs:gap-3">
            {['email', 'otp', 'password', 'success'].map((s, index) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 xs:w-9 xs:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s
                      ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg scale-110'
                      : ['email', 'otp', 'password', 'success'].indexOf(step) > index
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {['email', 'otp', 'password', 'success'].indexOf(step) > index ? '✓' : index + 1}
                </div>
                {index < 3 && (
                  <div
                    className={`w-8 xs:w-10 h-0.5 ${
                      ['email', 'otp', 'password', 'success'].indexOf(step) > index
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mb-6 xs:mb-7 sm:mb-8">
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 via-rose-600 to-red-600 bg-clip-text text-transparent mb-2 pb-1 leading-tight">
            {step === 'email' && 'Reset Password'}
            {step === 'otp' && 'Verify Code'}
            {step === 'password' && 'Create New Password'}
            {step === 'success' && 'Password Reset'}
          </h2>
          <p className="text-xs xs:text-sm text-gray-600">
            {step === 'email' && 'Enter your email address to receive a verification code.'}
            {step === 'otp' && `Enter the 4-digit code sent to ${email}`}
            {step === 'password' && 'Create a strong password for your account.'}
            {step === 'success' && 'Your password has been successfully reset.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 xs:mb-5 relative">
            <div className="h-1 bg-gradient-to-r from-red-500 to-pink-500 absolute top-0 left-0 right-0 rounded-t-xl"></div>
            <div className="p-3 xs:p-3.5 sm:p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs xs:text-sm text-center pt-4 xs:pt-4.5 sm:pt-5">
              {error}
            </div>
          </div>
        )}

        {/* Step 1: Enter Email */}
        {step === 'email' && (
          <form onSubmit={handleRequestOTP} className="space-y-4 xs:space-y-4.5 sm:space-y-5">
            <div className="space-y-1.5 xs:space-y-2">
              <label htmlFor="email" className="block text-xs xs:text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                  <svg width="16" height="16" className="xs:w-[18px] xs:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@email.com"
                  className="w-full pl-10 xs:pl-12 pr-3 xs:pr-4 py-2.5 xs:py-3 sm:py-3.5 rounded-xl border border-gray-200 text-xs xs:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm transition-all touch-target"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 xs:py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-red-500 text-white font-semibold text-xs xs:text-sm hover:from-red-600 hover:via-rose-600 hover:to-red-600 active:from-red-700 active:via-rose-700 active:to-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 touch-target active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 xs:w-5 xs:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending code...
                </>
              ) : (
                <>
                  <svg width="16" height="16" className="xs:w-[18px] xs:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                  Send verification code
                </>
              )}
            </button>

            <p className="text-center text-xs xs:text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/login" className="font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent hover:from-red-700 hover:to-rose-700">
                Sign in
              </Link>
            </p>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4 xs:space-y-5 sm:space-y-6">
            <div className="space-y-3 xs:space-y-4">
              <p className="text-xs xs:text-sm text-center text-gray-600">
                We've sent a verification code to<br />
                <span className="font-bold text-red-600">{email}</span>
              </p>
              
              <OTPInput
                length={4}
                value={otp}
                onChange={setOtp}
                disabled={loading}
                error={!!error}
                autoFocus
              />

              <p className="text-xs text-center text-gray-500">
                Code expires in {expiryMinutes} minutes
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 4}
              className="w-full py-2.5 xs:py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-red-500 text-white font-semibold text-xs xs:text-sm hover:from-red-600 hover:via-rose-600 hover:to-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 touch-target active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 xs:w-5 xs:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                'Verify code'
              )}
            </button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-xs xs:text-sm text-red-600 hover:text-red-700 font-semibold disabled:opacity-60"
              >
                Resend code
              </button>
              <p className="text-xs xs:text-sm text-gray-600">
                Wrong email?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOtp('');
                    setError('');
                  }}
                  className="font-bold text-red-600 hover:text-red-700"
                >
                  Change it
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Step 3: Create New Password */}
        {step === 'password' && (
          <form onSubmit={handleResetPassword} className="space-y-4 xs:space-y-4.5 sm:space-y-5">
            <div className="space-y-1.5 xs:space-y-2">
              <label htmlFor="password" className="block text-xs xs:text-sm font-semibold text-gray-700">
                New Password
              </label>
              <div className="relative group">
                <div className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                  <svg width="16" height="16" className="xs:w-[18px] xs:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 xs:pl-12 pr-3 xs:pr-4 py-2.5 xs:py-3 sm:py-3.5 rounded-xl border border-gray-200 text-xs xs:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm transition-all touch-target"
                />
              </div>
            </div>

            <div className="space-y-1.5 xs:space-y-2">
              <label htmlFor="confirmPassword" className="block text-xs xs:text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                  <svg width="16" height="16" className="xs:w-[18px] xs:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Re-enter your password"
                  className="w-full pl-10 xs:pl-12 pr-3 xs:pr-4 py-2.5 xs:py-3 sm:py-3.5 rounded-xl border border-gray-200 text-xs xs:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm transition-all touch-target"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 xs:py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-red-500 text-white font-semibold text-xs xs:text-sm hover:from-red-600 hover:via-rose-600 hover:to-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 touch-target active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 xs:w-5 xs:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Resetting password...
                </>
              ) : (
                'Reset password'
              )}
            </button>
          </form>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="space-y-4 xs:space-y-5 sm:space-y-6 text-center">
            <div className="mx-auto w-14 h-14 xs:w-15 xs:h-15 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center shadow-lg animate-in zoom-in">
              <svg width="28" height="28" className="xs:w-[30px] xs:h-[30px] sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div className="space-y-2 xs:space-y-2.5 sm:space-y-3 bg-gradient-to-r from-green-50 to-emerald-50 p-4 xs:p-5 sm:p-6 rounded-2xl border border-green-200">
              <p className="text-sm xs:text-base font-semibold text-gray-800">
                Password Reset Successful!
              </p>
              <p className="text-xs xs:text-sm text-gray-700 leading-relaxed">
                Your admin password has been updated successfully. You can now sign in with your new password.
              </p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="inline-flex w-full py-2.5 xs:py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-red-500 text-white font-semibold text-xs xs:text-sm hover:from-red-600 hover:via-rose-600 hover:to-red-600 transition-all items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 touch-target active:scale-95"
            >
              <svg width="16" height="16" className="xs:w-[18px] xs:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Go to sign in
            </button>
          </div>
        )}
      </div>
    </AdminAuthSplitShell>
  );
}

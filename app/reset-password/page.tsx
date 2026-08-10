'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(token ? null : { type: 'error', message: 'Invalid link: No token found.' });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      setStatus({ type: 'error', message: 'Invalid link: No token found.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    // Dynamic API Base URL depending on environment
    const API_BASE_URL =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000'
        : 'https://stayguwahati-backend.onrender.com';

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Reset failed.');

      setStatus({
        type: 'success',
        message: 'Success! Redirecting to login...',
      });

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        err.message === 'Failed to fetch'
          ? 'Unable to reach server. Please try again in a few seconds.'
          : err.message || 'An error occurred while updating password.';

      setStatus({
        type: 'error',
        message: errorMessage,
      });
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 max-w-md w-full">
      <div className="text-center mb-6 sm:mb-8">
        <div className="bg-teal-50 text-teal-600 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mx-auto text-xl sm:text-2xl mb-3 sm:mb-4 shadow-inner">
          🔒
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
          New Password
        </h1>
        <p className="text-gray-400 text-xs mt-1">Please enter your secure new password</p>
      </div>

      {status && (
        <div
          className={`p-3 rounded-xl mb-4 text-xs font-medium border flex items-center gap-1.5 ${
            status.type === 'success'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
              : 'bg-rose-50 border-rose-100 text-rose-600'
          }`}
        >
          <span>{status.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{status.message}</span>
        </div>
      )}

      {token && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-teal-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition mt-2 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span> Processing...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col justify-between font-sans antialiased">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <span className="text-teal-600 text-xl sm:text-2xl">🏠</span>
            <span className="text-lg sm:text-xl font-bold text-teal-800 tracking-tight">
              StayGuwahati
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content Component Wrapped in Suspense for SearchParams */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Suspense fallback={<div className="text-slate-500 text-sm animate-pulse">Loading form...</div>}>
          <ResetPasswordContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-100 bg-white px-4">
        <p>&copy; 2026 StayGuwahati Platform Unified Core.</p>
      </footer>
    </div>
  );
}
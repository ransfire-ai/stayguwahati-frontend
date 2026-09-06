'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Home, Key, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://stayguwahati-backend.onrender.com';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset link.');
      }

      setStatus({
        type: 'success',
        message: 'Check your email! Link sent successfully.',
      });
      setSubmitted(true);
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        setStatus({
          type: 'error',
          message: 'Server is starting up... Please wait 30 seconds and try again.',
        });
      } else {
        setStatus({
          type: 'error',
          message: err.message || 'An error occurred. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Home className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
            <span className="text-lg sm:text-xl font-bold text-teal-800">StayGuwahati</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 max-w-sm w-full mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <div className="bg-teal-50 text-teal-600 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-inner">
              <Key className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Reset Password</h1>
            <p className="text-gray-400 text-xs mt-1">Enter your email to receive a reset link</p>
          </div>

          {/* Status Banner */}
          {status && (
            <div
              className={`p-3 rounded-xl mb-4 text-xs font-medium border flex items-center gap-1.5 ${
                status.type === 'success'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  : 'bg-rose-50 border-rose-100 text-rose-600'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base sm:text-sm focus:outline-none focus:border-teal-500 transition focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || submitted}
              className="w-full bg-slate-900 hover:bg-teal-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl text-sm transition mt-2 flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : submitted ? (
                <span>Link Sent</span>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 text-center text-xs text-gray-500">
            <Link href="/login" className="text-teal-600 font-bold hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 px-3 text-[10px] text-gray-400 border-t border-gray-100 bg-white">
        <p>&copy; 2026 StayGuwahati Platform Unified Core.</p>
      </footer>
    </div>
  );
}
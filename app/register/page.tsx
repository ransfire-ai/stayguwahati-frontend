'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const BACKEND_URL = 'https://stayguwahati-backend.onrender.com';

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration pipe dropped.');
      }

      setMessage({
        type: 'success',
        text: 'Registration Successful! Redirecting to login...',
      });

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'An unexpected error occurred.',
      });
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col justify-between font-sans antialiased">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <span className="text-teal-600 text-xl sm:text-2xl">🏠</span>
            <span className="text-lg sm:text-xl font-bold text-teal-800 tracking-tight">
              StayGuwahati
            </span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-teal-600 transition">
              Home
            </Link>
            <Link href="/login" className="hover:text-teal-600 transition">
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-gray-100 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="bg-teal-50 text-teal-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl mb-3 shadow-inner">
              👤
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Join Platform
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Register an individual profile to get verified
            </p>
          </div>

          {/* Feedback Message Banner */}
          {message && (
            <div
              className={`text-xs p-3 rounded-xl mb-4 font-medium flex items-center gap-1.5 border ${
                message.type === 'success'
                  ? 'bg-teal-50 text-teal-600 border-teal-100'
                  : 'bg-rose-50 text-rose-600 border-rose-100'
              }`}
            >
              <span>{message.type === 'success' ? '✓' : '⚠️'}</span>
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-teal-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition mt-2 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-sm">⏳</span>
                  <span>Generating Profile...</span>
                </>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <span className="text-xs">✓</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            Already have a traveler profile?{' '}
            <Link href="/login" className="text-teal-600 font-semibold hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-100 bg-white px-4">
        &copy; 2026 StayGuwahati Platform System Core.
      </footer>
    </div>
  );
}
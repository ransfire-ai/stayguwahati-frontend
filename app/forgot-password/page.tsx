'use client';

import React, { FormEvent, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  AlertCircle,
  Home,
} from 'lucide-react';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://stayguwahati-backend.onrender.com';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading || submitted) return;

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch(
        `${BACKEND_URL.replace(/\/+$/, '')}/api/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      let data: { message?: string } = {};

      try {
        data = await response.json();
      } catch {
        // Keep the fallback message below when the server returns no JSON.
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset link.');
      }

      setStatus({
        type: 'success',
        message: data.message || 'Check your email! Link sent successfully.',
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'An error occurred. Please try again.';

      setStatus({
        type: 'error',
        message:
          message === 'Failed to fetch'
            ? 'Server is starting up... Please wait 30 seconds and try again.'
            : message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f3ee] text-[#213c3d]">
      <header className="border-b border-[#dce2dd] bg-[#f8f7f3]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-bold tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#214846] text-white shadow-sm transition group-hover:-translate-y-0.5">
              <Home className="h-4.5 w-4.5" />
            </span>
            <span className="text-[17px]">StayGuwahati</span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-[#cfd9d4] bg-white px-4 py-2 text-sm font-semibold text-[#355452] transition hover:border-[#214846] hover:bg-[#edf3f0]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl items-center px-5 py-8 sm:px-8 lg:py-12">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-[#d9e0db] bg-white shadow-[0_24px_70px_rgba(30,54,51,0.10)] lg:grid-cols-[1.05fr_0.95fr]">
          {/* Brand panel */}
          <section className="relative overflow-hidden bg-[#1d4643] px-7 py-10 text-white sm:px-12 sm:py-14 lg:flex lg:min-h-[620px] lg:flex-col lg:justify-between">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-white/10" />

            <div className="relative">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e7eeeb]">
                Account recovery
              </div>

              <h1 className="max-w-md text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
                Back to your
                <span className="block text-[#f4c85d]">Guwahati stay.</span>
              </h1>

              <p className="mt-6 max-w-md text-sm leading-7 text-[#d5e1dd] sm:text-[15px]">
                Lost your password? No worries. We&apos;ll send a secure reset
                link so you can get back to planning, booking, and managing your
                local stays.
              </p>
            </div>

            <div className="relative mt-10 grid gap-3 sm:grid-cols-3 lg:mt-0 lg:grid-cols-1 xl:grid-cols-3">
              {[
                ['01', 'Secure link', 'Sent to your email'],
                ['02', 'Quick reset', 'Choose a new password'],
                ['03', 'Back in', 'Continue your journey'],
              ].map(([number, title, text]) => (
                <div
                  key={number}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm"
                >
                  <span className="text-[10px] font-bold tracking-[0.18em] text-[#f4c85d]">
                    {number}
                  </span>
                  <h2 className="mt-3 text-sm font-semibold">{title}</h2>
                  <p className="mt-1 text-xs leading-5 text-[#c9d7d2]">{text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Form panel */}
          <section className="flex items-center justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#cfe0da] bg-[#edf5f2] text-[#1d7771] shadow-sm">
                  <KeyRound className="h-6 w-6" />
                </div>

                <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-[#66817c]">
                  Password recovery
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#213c3d]">
                  Reset your password
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#6d7d79]">
                  Enter the email address linked to your StayGuwahati account.
                  We&apos;ll send you a reset link.
                </p>
              </div>

              {status && (
                <div
                  role="status"
                  className={`mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm leading-5 ${
                    status.type === 'success'
                      ? 'border-[#bfe0d1] bg-[#eff9f4] text-[#27654d]'
                      : 'border-[#efc9bd] bg-[#fff5f1] text-[#a34a36]'
                  }`}
                >
                  {status.type === 'success' ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  )}
                  <span>{status.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#59706c]"
                  >
                    Email address
                  </label>

                  <div className="group relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78908a] transition group-focus-within:text-[#1d7771]" />
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      disabled={submitted}
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-[#cfd9d4] bg-[#fbfcfa] py-3.5 pl-11 pr-4 text-sm text-[#213c3d] outline-none transition placeholder:text-[#9aa9a5] focus:border-[#1d7771] focus:bg-white focus:ring-4 focus:ring-[#1d7771]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || submitted}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1d4643] px-5 py-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(29,70,67,0.18)] transition hover:-translate-y-0.5 hover:bg-[#27605c] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#91a39e] disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending reset link...
                    </>
                  ) : submitted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Reset link sent
                    </>
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="my-8 h-px bg-[#e0e5e1]" />

              <p className="text-center text-sm text-[#71817d]">
                Remembered your password?{' '}
                <Link
                  href="/login"
                  className="font-bold text-[#1d7771] transition hover:text-[#155f5a] hover:underline"
                >
                  Sign in instead
                </Link>
              </p>

              <Link
                href="/"
                className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-[#70817d] transition hover:text-[#214846]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to StayGuwahati
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

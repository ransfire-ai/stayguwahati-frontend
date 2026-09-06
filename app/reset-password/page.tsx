// app/reset-password/page.tsx
'use client';

import React, { FormEvent, Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://stayguwahati-backend.onrender.com';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = useMemo(
    () => searchParams.get('token') || '',
    [searchParams]
  );

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');

  const passwordChecks = {
    length: newPassword.length >= 6,
    match: newPassword.length > 0 && newPassword === confirmPassword,
  };

  const canSubmit =
    Boolean(token) &&
    passwordChecks.length &&
    passwordChecks.match &&
    status !== 'loading';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    if (!token) {
      setStatus('error');
      setMessage(
        'This reset link is invalid or incomplete. Please request a new password reset link.'
      );
      return;
    }

    if (newPassword.length < 6) {
      setStatus('error');
      setMessage('Your new password must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('The two passwords do not match.');
      return;
    }

    try {
      setStatus('loading');

      const response = await fetch(
        `${BACKEND_URL.replace(/\/+$/, '')}/api/auth/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            newPassword,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            'We could not update your password. Please try again.'
        );
      }

      setStatus('success');
      setMessage(
        data?.message ||
          'Password updated successfully. You can now sign in.'
      );
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f4ef] text-slate-900">
      <header className="border-b border-[#d9ded8] bg-[#fbfaf7]/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="group flex items-center gap-3 font-extrabold tracking-tight text-[#193f3d]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#173f3c] text-white shadow-sm transition-transform group-hover:scale-105">
              <KeyRound size={19} />
            </span>
            <span className="text-lg">StayGuwahati</span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-[#cfd9d3] bg-white px-4 py-2 text-sm font-semibold text-[#244743] transition hover:border-[#193f3d] hover:bg-[#f0f5f2]"
          >
            <ArrowLeft size={16} />
            Back to sign in
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_12%_10%,rgba(44,103,95,0.16),transparent_28%),radial-gradient(circle_at_88%_0%,rgba(230,177,72,0.16),transparent_24%)]" />

        <div className="relative mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20 lg:py-16">
          <div className="hidden lg:block">
            <div className="max-w-xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#c8d7d0] bg-[#eff6f2] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#2d625b]">
                <ShieldCheck size={15} />
                Secure account recovery
              </div>

              <h1 className="max-w-lg text-5xl font-black leading-[1.02] tracking-tight text-[#183d3b] xl:text-6xl">
                Create a fresh start for your account.
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
                Choose a new password to regain access to your bookings, saved
                stays and StayGuwahati account.
              </p>

              <div className="mt-10 grid gap-4">
                {[
                  [
                    '1',
                    'Choose a new password',
                    'Use at least 6 characters for your new password.',
                  ],
                  [
                    '2',
                    'Confirm it carefully',
                    'Both password fields must match before continuing.',
                  ],
                  [
                    '3',
                    'Sign in again',
                    'Once updated, return to your account securely.',
                  ],
                ].map(([number, title, text]) => (
                  <div
                    key={number}
                    className="flex gap-4 rounded-3xl border border-[#d9e1dc] bg-white/70 p-5 shadow-[0_12px_35px_rgba(30,56,51,0.05)]"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#173f3c] text-sm font-black text-white">
                      {number}
                    </span>

                    <div>
                      <h2 className="font-bold text-[#203f3d]">{title}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[540px]">
            <div className="overflow-hidden rounded-[32px] border border-[#d8dfda] bg-white shadow-[0_25px_80px_rgba(27,60,56,0.12)]">
              <div className="bg-[#173f3c] px-7 py-8 sm:px-10">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-[#f3c85c] ring-1 ring-white/15">
                    <LockKeyhole size={22} />
                  </span>

                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/75">
                    Secure reset
                  </span>
                </div>

                <h1 className="mt-7 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Set a new password
                </h1>

                <p className="mt-2 text-sm leading-6 text-white/70">
                  Make it something memorable to you and difficult for others
                  to guess.
                </p>
              </div>

              <div className="p-6 sm:p-10">
                {status === 'success' ? (
                  <div className="py-3 text-center">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                      <CheckCircle2 size={34} />
                    </div>

                    <h2 className="mt-6 text-2xl font-black text-[#193f3d]">
                      Password updated
                    </h2>

                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                      {message}
                    </p>

                    <button
                      type="button"
                      onClick={() => router.push('/login')}
                      className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#173f3c] px-5 text-sm font-bold text-white shadow-lg shadow-[#173f3c]/15 transition hover:-translate-y-0.5 hover:bg-[#0f312e]"
                    >
                      Continue to sign in
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    noValidate
                  >
                    {!token && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex gap-3">
                          <TriangleAlert
                            className="mt-0.5 shrink-0 text-amber-600"
                            size={19}
                          />

                          <div>
                            <p className="text-sm font-bold text-amber-900">
                              Reset link missing
                            </p>

                            <p className="mt-1 text-xs leading-5 text-amber-800">
                              This page needs a valid reset link from your
                              email.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {status === 'error' && message && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium leading-6 text-red-700">
                        {message}
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="new-password"
                        className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.15em] text-slate-500"
                      >
                        New password
                      </label>

                      <div className="relative">
                        <LockKeyhole
                          size={18}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          id="new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(event) => {
                            setNewPassword(event.target.value);
                            if (status === 'error') setStatus('idle');
                          }}
                          autoComplete="new-password"
                          placeholder="Enter your new password"
                          className="min-h-[58px] w-full rounded-2xl border border-[#d4ddd7] bg-[#fbfcfa] py-3 pl-12 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#2d6a63] focus:ring-4 focus:ring-[#2d6a63]/10"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword((value) => !value)
                          }
                          className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-[#244743]"
                          aria-label={
                            showNewPassword ? 'Hide password' : 'Show password'
                          }
                        >
                          {showNewPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.15em] text-slate-500"
                      >
                        Confirm password
                      </label>

                      <div className="relative">
                        <LockKeyhole
                          size={18}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          id="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(event) => {
                            setConfirmPassword(event.target.value);
                            if (status === 'error') setStatus('idle');
                          }}
                          autoComplete="new-password"
                          placeholder="Repeat your new password"
                          className="min-h-[58px] w-full rounded-2xl border border-[#d4ddd7] bg-[#fbfcfa] py-3 pl-12 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#2d6a63] focus:ring-4 focus:ring-[#2d6a63]/10"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((value) => !value)
                          }
                          className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-[#244743]"
                          aria-label={
                            showConfirmPassword
                              ? 'Hide password'
                              : 'Show password'
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#e1e7e3] bg-[#f8faf8] p-4">
                      <p className="text-xs font-bold text-[#264744]">
                        Password checklist
                      </p>

                      <div className="mt-3 grid gap-2 text-xs">
                        <div
                          className={`flex items-center gap-2 ${
                            passwordChecks.length
                              ? 'text-emerald-700'
                              : 'text-slate-500'
                          }`}
                        >
                          <CheckCircle2 size={15} />
                          At least 6 characters
                        </div>

                        <div
                          className={`flex items-center gap-2 ${
                            passwordChecks.match
                              ? 'text-emerald-700'
                              : 'text-slate-500'
                          }`}
                        >
                          <CheckCircle2 size={15} />
                          Passwords match
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-2xl bg-[#173f3c] px-5 text-sm font-extrabold text-white shadow-lg shadow-[#173f3c]/15 transition hover:-translate-y-0.5 hover:bg-[#0f312e] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Updating password...
                        </>
                      ) : (
                        <>
                          Update password
                          <CheckCircle2 size={18} />
                        </>
                      )}
                    </button>

                    <div className="pt-1 text-center">
                      <Link
                        href="/login"
                        className="text-sm font-bold text-[#2c625c] underline-offset-4 transition hover:text-[#173f3c] hover:underline"
                      >
                        Remembered your password? Sign in
                      </Link>
                    </div>
                  </form>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
              <ShieldCheck size={15} className="text-[#3d7b72]" />
              Your password is securely updated through StayGuwahati.
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#dde3df] bg-white/60 py-5 text-center text-xs text-slate-500">
        © 2026 StayGuwahati Platform Unified Core.
      </footer>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[#f6f4ef]">
          <div className="flex items-center gap-3 text-sm font-semibold text-[#193f3d]">
            <Loader2 size={20} className="animate-spin" />
            Loading...
          </div>
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
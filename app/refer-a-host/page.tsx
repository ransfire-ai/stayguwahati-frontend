// app/refer-a-host/page.tsx
'use client';

import React, { FormEvent, ReactNode, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Gift,
  HeartHandshake,
  Home,
  Mail,
  ShieldCheck,
  Users,
} from 'lucide-react';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://stayguwahati-backend.onrender.com';

const API_BASE_URL = BACKEND_URL.replace(/\/+$/, '').replace(/\/api$/, '');

const faqs = [
  {
    q: 'Who can I refer?',
    a: 'You can refer a friend, family member, neighbour, or property owner in Guwahati who may be interested in hosting guests.',
  },
  {
    q: 'When is the ₹1,000 reward earned?',
    a: 'The referral becomes reward-eligible after the referred host completes their first qualifying verified booking.',
  },
  {
    q: 'Do I need to be a host to refer someone?',
    a: 'No. Travelers and members of the local StayGuwahati community can refer suitable hosts.',
  },
  {
    q: 'Can I refer more than one host?',
    a: 'Yes. You can refer multiple hosts. Each referral is tracked separately and is subject to the current referral programme rules.',
  },
];

export default function ReferAHostPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submitReferral(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const form = e.currentTarget;
      const values = new FormData(form);

      let profile: { name?: string; email?: string } = {};
      if (typeof window !== 'undefined') {
        try {
          const raw =
            sessionStorage.getItem('userProfile') ||
            localStorage.getItem('userProfile');
          profile = raw ? JSON.parse(raw) : {};
        } catch {}
      }

      const token =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('token') || localStorage.getItem('token')
          : null;

      const payload = {
        referrerName: String(values.get('referrerName') || profile.name || '').trim(),
        referrerEmail: String(values.get('referrerEmail') || profile.email || '').trim(),
        hostName: String(values.get('hostName') || '').trim(),
        hostPhone: String(values.get('hostPhone') || '').trim(),
        hostEmail: String(values.get('hostEmail') || '').trim(),
        message: String(values.get('message') || '').trim(),
      };

      const response = await fetch(`${API_BASE_URL}/api/referrals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Unable to submit the referral.');
      }

      setSubmitted(true);
      form.reset();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit the referral. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-[#1f3431] font-sans antialiased">
      {/* Header — aligned with the main StayGuwahati pages */}
      <header className="sticky top-0 z-50 border-b border-[#d9ddd6] bg-[#f7f4ed]/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-[64px] max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#0c3431] shadow-sm">
              <Home className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold tracking-tight text-[#0c3431]">
              Stay<span className="text-[#f2bf45]">Guwahati</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-xs font-semibold text-gray-600 lg:flex">
            <Link href="/" className="transition hover:text-[#0f625a]">Home</Link>
            <Link href="/explore" className="transition hover:text-[#0f625a]">Explore</Link>
            <Link href="/refer-a-host" className="font-bold text-[#0f625a]">Refer a host</Link>
            <Link href="/support" className="transition hover:text-[#0f625a]">Support</Link>
          </nav>

        </div>
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pt-4 text-[11px] text-[#66766f] sm:px-6 lg:px-8">
        <Link href="/" className="hover:text-[#0f625a]">Home</Link>
        <span className="mx-2">/</span>
        <span>Refer a host</span>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-9 pt-7 sm:px-6 sm:pt-10 lg:px-8">
        <div className="rounded-[28px] border border-[#0c3431] bg-[#0c3431] px-6 py-8 text-white shadow-[0_8px_24px_rgba(12,52,49,0.12)] sm:px-9 sm:py-10 lg:px-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_.8fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#0f625a]">
                <Gift className="h-3.5 w-3.5" />
                Refer & earn rewards
              </div>

              <h1 className="mt-4 max-w-2xl text-[36px] font-black leading-[1.05] tracking-[-1.2px] text-white sm:text-[46px]">
                Know a great host in Guwahati?
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#657873] sm:text-[15px]">
                Help someone you know join StayGuwahati. When their first
                qualifying booking is completed, you both can earn a
                <strong className="text-[#1b756c]"> ₹1,000 platform bonus.</strong>
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#referral-form"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#f2bf45] px-5 py-3 text-xs font-bold text-[#0c3431] shadow-sm transition hover:bg-[#e6b33d]"
                >
                  Refer a host <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white px-5 py-3 text-xs font-bold !text-[#0c3431] transition hover:border-[#8fb7ac] hover:bg-[#f7f4ed]"
                >
                  How it works
                </a>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="rounded-[24px] border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0c3431] text-white">
                    <HeartHandshake className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/60">
                      Local community
                    </p>
                    <p className="mt-1 text-lg font-black text-white">
                      Good hosts. Great stays.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Stat icon={<Users />} title="Local network" text="Grow together" />
                  <Stat icon={<Gift />} title="Reward" text="₹1,000 each" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[.88fr_1.12fr]">
          <div className="space-y-6">
            <section
              id="how-it-works"
              className="rounded-2xl border border-[#d9ddd6] bg-white p-6 shadow-[0_3px_14px_rgba(31,52,49,0.04)] sm:p-7"
            >
              <Eyebrow>Simple process</Eyebrow>
              <h2 className="mt-1 text-2xl font-black text-[#0c3431]">How it works</h2>

              <div className="mt-7 space-y-7">
                <Step number="01" title="Submit the host details">
                  Tell us who you think would make a great StayGuwahati host.
                </Step>
                <Step number="02" title="They join and list">
                  We invite the host and guide them through creating and verifying their property.
                </Step>
                <Step number="03" title="Both earn the reward">
                  After their first eligible verified booking, the referral reward is unlocked.
                </Step>
              </div>
            </section>

            <section className="rounded-2xl border border-[#d9ddd6] bg-[#eaf3ee] p-6 sm:p-7">
              <div className="flex gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-[#0f625a] shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0c3431]">Built around trusted local stays</h3>
                  <p className="mt-1.5 text-xs leading-5 text-[#5f716b]">
                    Referrals help us discover more genuine local hosts while keeping
                    the StayGuwahati community personal and reliable.
                  </p>
                </div>
              </div>
            </section>

            <div className="grid gap-3 sm:grid-cols-3">
              <SmallFeature icon={<Users />} text="Grow the local network" />
              <SmallFeature icon={<Home />} text="Support local hosts" />
              <SmallFeature icon={<Gift />} text="Earn together" />
            </div>
          </div>

          {/* Form */}
          <section
            id="referral-form"
            className="rounded-2xl border border-[#d9ddd6] bg-white p-6 shadow-[0_3px_14px_rgba(31,52,49,0.05)] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#e0e6e1] pb-5">
              <div>
                <Eyebrow>Get started</Eyebrow>
                <h2 className="mt-1 text-2xl font-black text-[#0c3431]">Refer a host</h2>
                <p className="mt-1 text-xs text-[#65756f]">
                  Send an invitation to someone who may have a great stay to share.
                </p>
              </div>
              <div className="hidden h-10 w-10 place-items-center rounded-xl bg-[#eaf3ee] text-[#0f625a] sm:grid">
                <Mail className="h-5 w-5" />
              </div>
            </div>

            {submitted ? (
              <div className="py-12 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e5f4ed] text-[#0f625a]">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="mt-5 text-xl font-black text-[#0c3431]">Referral submitted</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#66766f]">
                  The host invitation has been sent. We&apos;ll track the referral
                  as they register and progress toward their first eligible booking.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-6 rounded-xl border border-[#b8ccc5] px-5 py-2.5 text-xs font-bold text-[#0f625a] hover:bg-[#f2f7f5]"
                >
                  Refer another host
                </button>
              </div>
            ) : (
              <form onSubmit={submitReferral} className="mt-6 space-y-6">
                <FormGroup title="Your details">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input name="referrerName" label="Your name" placeholder="Your full name" required />
                    <Input name="referrerEmail" label="Your email" type="email" placeholder="you@example.com" required />
                  </div>
                </FormGroup>

                <FormGroup title="Host details">
                  <Input name="hostName" label="Host's full name" placeholder="Host's full name" required />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input name="hostPhone" label="Host's phone" type="tel" placeholder="+91 98765 43210" required />
                    <Input name="hostEmail" label="Host's email" type="email" placeholder="host@example.com" required />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#526b64]">
                      Message <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      placeholder="Add a short personal message..."
                      className="w-full resize-none rounded-xl border border-[#ccd8d2] bg-[#fffdf9] px-4 py-3 text-sm text-[#1f3431] outline-none transition placeholder:text-[#9aa9a4] focus:border-[#0f625a] focus:ring-4 focus:ring-[#0f625a]/10"
                    />
                  </div>
                </FormGroup>

                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0c3431] py-3.5 text-xs font-black text-white shadow-sm transition hover:bg-[#0f625a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Sending invitation...' : 'Send host invitation'}
                  {!submitting && <ArrowRight className="h-4 w-4" />}
                </button>

                <p className="text-center text-[10px] leading-5 text-[#7a8883]">
                  By submitting, you confirm that you have permission to share the host&apos;s contact details.
                </p>
              </form>
            )}
          </section>
        </div>

        {/* FAQ */}
        <section className="mt-6 rounded-2xl border border-[#d9ddd6] bg-white p-6 sm:p-7">
          <Eyebrow>Need to know</Eyebrow>
          <h2 className="mt-1 text-2xl font-black text-[#0c3431]">Frequently asked questions</h2>

          <div className="mt-5 divide-y divide-[#e0e6e1]">
            {faqs.map((faq, index) => {
              const open = openFaq === index;
              return (
                <div key={faq.q}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : index)}
                    className="flex w-full items-center justify-between gap-5 py-4 text-left"
                  >
                    <span className="text-sm font-bold text-[#294b46]">{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#71847e] transition-transform ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {open && (
                    <p className="max-w-3xl pb-4 text-xs leading-5 text-[#70817c]">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#d9ddd6] bg-[#f7f4ed]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-[11px] text-[#65756f] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>© 2026 StayGuwahati · Local stays, trusted hosts.</span>
          <div className="flex gap-5">
            <Link href="/support" className="hover:text-[#0f625a]">Support</Link>
            <Link href="/privacy-policy" className="hover:text-[#0f625a]">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0f6b62]">
      {children}
    </p>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8f3ef] text-[10px] font-black text-[#0f625a]">
        {number}
      </div>
      <div>
        <h3 className="text-sm font-black text-[#294b46]">{title}</h3>
        <p className="mt-1.5 text-xs leading-5 text-[#697a74]">{children}</p>
      </div>
    </div>
  );
}

function Stat({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-white/20 bg-white p-4">
      <div className="[&>svg]:h-4 [&>svg]:w-4 text-[#0f625a]">{icon}</div>
      <p className="mt-2 text-[11px] font-black text-[#294b46]">{title}</p>
      <p className="mt-0.5 text-[10px] text-[#73827d]">{text}</p>
    </div>
  );
}

function SmallFeature({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="rounded-xl border border-[#d9ddd6] bg-white p-4">
      <div className="[&>svg]:h-4 [&>svg]:w-4 text-[#6a9a79]">{icon}</div>
      <p className="mt-2 text-[11px] font-bold leading-4 text-[#315a55]">{text}</p>
    </div>
  );
}

function FormGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.14em] text-[#0f6b62]">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Input({
  label,
  required,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#526b64]">
        {label} {required && <span className="text-[#0f6b62]">*</span>}
      </label>
      <input
        {...props}
        required={required}
        className="w-full rounded-xl border border-[#ccd8d2] bg-[#fffdf9] px-4 py-3 text-sm text-[#1f3431] outline-none transition placeholder:text-[#9aa9a4] focus:border-[#0f625a] focus:ring-4 focus:ring-[#0f625a]/10"
      />
    </div>
  );
}

"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Gift,
  Users,
  IndianRupee,
  ShieldCheck,
  House,
  Heart,
  Leaf,
  ChevronDown,
  Mail,
  Search,
  UserRound,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const faqs = [
  {
    q: "Who can I refer?",
    a: "You can refer a friend, family member, neighbour, or property owner in Guwahati who may be interested in hosting guests.",
  },
  {
    q: "When will I get the reward?",
    a: "The referral reward is credited after the referred host completes their first eligible verified booking.",
  },
  {
    q: "How will the bonus be credited?",
    a: "Our team verifies the referral and eligible booking, then credits the applicable platform bonus to both accounts.",
  },
  {
    q: "Is there a limit on referrals?",
    a: "You can refer multiple hosts. Eligibility and reward limits may apply according to the current StayGuwahati referral programme.",
  },
];

export default function ReferAHostPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submitReferral = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#f7faf9] text-[#123f3b]">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#dce7e3] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-black text-[19px]">
            <span className="text-[27px]">🏠</span>
            <span>
              Stay<span className="text-[#16867a]">Guwahati</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-[13px] font-semibold md:flex">
            <Link href="/" className="hover:text-[#16867a]">Home</Link>
            <Link href="/explore" className="hover:text-[#16867a]">Explore</Link>
            <Link href="/login?redirect=%2Flist-property" className="hover:text-[#16867a]">List a stay</Link>
            <Link href="/refer-a-host" className="text-[#16867a]">Refer a host</Link>
            <Link href="/support" className="hover:text-[#16867a]">Support</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden rounded-full p-2 hover:bg-[#eef5f2] sm:block" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>
            <Link
              href="/profile"
              className="hidden rounded-xl bg-[#123f3b] px-4 py-2.5 text-xs font-bold text-white sm:block"
            >
              My account
            </Link>
          </div>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="mx-auto max-w-[1240px] px-5 pt-4 text-xs text-[#6c8580] lg:px-8">
        <Link href="/" className="hover:text-[#16867a]">Home</Link>
        <span className="mx-2">›</span>
        <span>Refer a host</span>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-[1240px] items-center gap-8 px-5 py-10 lg:grid-cols-[1fr_1.05fr] lg:px-8 lg:py-14">
          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e9faf4] px-4 py-2 text-[11px] font-black uppercase tracking-wide text-[#16867a]">
              <Gift className="h-4 w-4" />
              Refer & earn rewards
            </div>

            <h1 className="max-w-[600px] text-[42px] font-black leading-[1.03] tracking-[-1.5px] text-[#092e39] sm:text-[52px]">
              Know a great host
              <br />
              in Guwahati?
            </h1>

            <p className="mt-5 max-w-[590px] text-[15px] leading-7 text-[#607873]">
              Invite friends, family, or neighbors to list their property on
              StayGuwahati. When they get their first verified booking, you
              both earn a <strong className="text-[#16867a]">₹1,000 platform bonus.</strong>
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#referral-form"
                className="inline-flex items-center gap-2 rounded-xl bg-[#087c72] px-6 py-3.5 text-sm font-black text-white shadow-[0_8px_20px_rgba(8,124,114,.18)] transition hover:bg-[#066d64]"
              >
                Refer a host now <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-[#16867a] bg-white px-6 py-3.5 text-sm font-bold text-[#155a55] hover:bg-[#eff9f6]"
              >
                <span className="text-[11px]">▶</span> How it works
              </a>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <MiniBenefit icon={<Users />} text="Support local community" />
              <MiniBenefit icon={<IndianRupee />} text="Earn rewards together" />
              <MiniBenefit icon={<ShieldCheck />} text="Trusted & verified listings" />
            </div>
          </div>

          <div className="relative hidden min-h-[350px] overflow-hidden rounded-[34px] bg-gradient-to-br from-[#dff4ee] via-[#eef8f5] to-[#d5eadf] lg:block">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/60 blur-2xl" />
            <div className="absolute bottom-0 left-8 h-56 w-56 rounded-full bg-[#b9dfd0]/50 blur-3xl" />

            <div className="absolute right-8 top-7 rotate-[-4deg] rounded-2xl border border-[#b8d7cc] bg-white/90 px-5 py-4 shadow-lg">
              <div className="text-sm font-black">Good people</div>
              <div className="text-sm font-black">great stays</div>
              <div className="text-sm font-black">Stronger Guwahati</div>
              <span className="absolute -right-1 -top-4 text-3xl">❤️</span>
            </div>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[170px] leading-none">
              🏡
            </div>
            <div className="absolute bottom-8 left-10 text-[90px]">🌴</div>
            <div className="absolute bottom-6 right-10 text-[82px]">🌴</div>

            <div className="absolute bottom-7 right-7 rounded-2xl border border-[#d7cf84] bg-[#fff7c9] px-5 py-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#087c72]">
                  <Gift />
                </div>
                <div>
                  <div className="text-[12px] font-semibold">You both earn</div>
                  <div className="text-2xl font-black">₹1,000</div>
                  <div className="text-[10px] font-bold text-[#6f7651]">platform bonus</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-[1240px] px-5 pb-12 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.08fr]">
          {/* LEFT */}
          <div>
            <div id="how-it-works" className="rounded-2xl border border-[#dfe9e5] bg-white p-6 shadow-[0_2px_8px_rgba(20,60,55,.06)] sm:p-7">
              <h2 className="text-[21px] font-black text-[#092e39]">How it works</h2>

              <div className="mt-6 space-y-6">
                <Step n="1" title="Submit their details">
                  Fill out the form with your friend's contact information.
                  We&apos;ll send them an invite.
                </Step>
                <Step n="2" title="They list their property">
                  Our team will guide them through the listing process and
                  ensure a safe, verified setup.
                </Step>
                <Step n="3" title="You both get rewarded">
                  Once they complete their first qualified stay, ₹1,000 is
                  credited to both of your accounts.
                </Step>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#e8f8f5] p-6 sm:p-7">
              <div className="flex gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#d0eee6] text-[#087c72]">
                  <House className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-black text-[#123f3b]">Be part of a trusted local network</h3>
                  <p className="mt-2 text-sm leading-6 text-[#55736e]">
                    Help local families and property owners earn through
                    homestays. Together we can showcase the warmth of
                    Guwahati to the world.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 text-sm font-bold sm:grid-cols-3">
              <Benefit icon={<Heart />} text="Supports local livelihoods" />
              <Benefit icon={<Leaf />} text="More authentic travel experiences" />
              <Benefit icon={<Users />} text="Builds a stronger Guwahati" />
            </div>
          </div>

          {/* FORM */}
          <div id="referral-form" className="rounded-2xl border border-[#dfe9e5] bg-white p-6 shadow-[0_2px_8px_rgba(20,60,55,.07)] sm:p-7">
            <div className="flex items-start gap-3 border-b border-[#e5ece9] pb-5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f8f5] text-[#087c72]">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-[21px] font-black">Referral Form</h2>
                <p className="text-xs text-[#718681]">Tell us about your friend and their property</p>
              </div>
            </div>

            {submitted ? (
              <div className="py-14 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e5f8ef] text-[#087c72]">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="mt-5 text-2xl font-black">Referral received!</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#687f7a]">
                  Thanks for helping grow the StayGuwahati host community.
                  Our team can follow up with the host details you provided.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 rounded-xl border border-[#16867a] px-5 py-3 text-sm font-bold text-[#16867a]"
                >
                  Submit another referral
                </button>
              </div>
            ) : (
              <form onSubmit={submitReferral} className="mt-5 space-y-6">
                <FormSection title="1. YOUR DETAILS">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Your name" name="referrerName" placeholder="John Doe" required />
                    <Input label="Your email" name="referrerEmail" type="email" placeholder="john@example.com" required />
                  </div>
                </FormSection>

                <FormSection title="2. HOST DETAILS">
                  <Input label="Host's full name" name="hostName" placeholder="Jane Smith" required />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Host's phone" name="hostPhone" type="tel" placeholder="+91 98765 43210" required />
                    <Input label="Host's email" name="hostEmail" type="email" placeholder="jane@example.com" required />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-[#55736e]">
                      Message <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      placeholder="Add a personal message (e.g. Hi! I thought you might be interested in listing your property...)"
                      className="w-full resize-none rounded-xl border border-[#d7e2de] px-4 py-3 text-sm outline-none transition placeholder:text-[#a0afab] focus:border-[#16867a] focus:ring-4 focus:ring-[#16867a]/10"
                    />
                  </div>
                </FormSection>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087c72] py-3.5 text-sm font-black text-white transition hover:bg-[#066d64]"
                >
                  Send referral invite <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* TESTIMONIAL + FAQ */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-2xl border border-[#dfe9e5] bg-white p-6">
            <h2 className="text-[17px] font-black">What our community says</h2>
            <div className="mt-5 flex items-center gap-5">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#d8eee7] text-2xl">
                👩🏻
              </div>
              <div>
                <p className="text-sm italic leading-6 text-[#526d68]">
                  “I referred my cousin to list her homestay and the process
                  was so smooth. We both received the bonus after her first
                  booking!”
                </p>
                <p className="mt-2 text-xs font-bold">— Priyanka Das, Guwahati</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#dfe9e5] bg-white p-6">
            <h2 className="text-[17px] font-black">Frequently asked questions</h2>
            <div className="mt-4 space-y-2">
              {faqs.map((faq, i) => (
                <button
                  key={faq.q}
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full rounded-xl border border-[#e4ebe8] px-4 py-3 text-left"
                >
                  <div className="flex items-center justify-between gap-4 text-sm font-semibold">
                    {faq.q}
                    <ChevronDown className={`h-4 w-4 shrink-0 transition ${openFaq === i ? "rotate-180" : ""}`} />
                  </div>
                  {openFaq === i && (
                    <p className="pt-3 text-xs leading-5 text-[#70827e]">{faq.a}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORT */}
      <section className="border-t border-[#dce9e4] bg-[#edf8f4]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[#d7eee5] text-[#087c72]">
              <Mail />
            </div>
            <div>
              <h3 className="text-sm font-black">Need help?</h3>
              <p className="text-xs text-[#607873]">
                Contact our support team at support@stayguwahati.in
              </p>
            </div>
          </div>
          <Link
            href="/support"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#16867a] bg-white px-5 py-3 text-xs font-black text-[#155a55]"
          >
            Contact support <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function MiniBenefit({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-bold text-[#456660]">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e6f5ef] text-[#16867a]">
        {React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4" })}
      </span>
      {text}
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#e2f6ed] text-[#16867a] font-black">
        {n}
      </div>
      <div>
        <h3 className="text-sm font-black">{title}</h3>
        <p className="mt-1 max-w-md text-xs leading-5 text-[#667d78]">{children}</p>
      </div>
    </div>
  );
}

function Benefit({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-[#315c56]">
      <span className="text-[#54a778]">
        {React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6" })}
      </span>
      <span>{text}</span>
    </div>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-4 text-[11px] font-black tracking-wide text-[#087c72]">{title}</h3>
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
      <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-[#55736e]">
        {label} {required && <span className="text-[#087c72]">*</span>}
      </label>
      <input
        {...props}
        required={required}
        className="w-full rounded-xl border border-[#d7e2de] px-4 py-3 text-sm outline-none transition placeholder:text-[#a0afab] focus:border-[#16867a] focus:ring-4 focus:ring-[#16867a]/10"
      />
    </div>
  );
}

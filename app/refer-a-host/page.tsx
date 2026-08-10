'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ReferAHostPage() {
  // Form State
  const [referrerName, setReferrerName] = useState('');
  const [referrerEmail, setReferrerEmail] = useState('');
  const [hostName, setHostName] = useState('');
  const [hostPhone, setHostPhone] = useState('');
  const [hostEmail, setHostEmail] = useState('');
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const BACKEND_URL =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000'
        : 'https://stayguwahati-backend.onrender.com';

    try {
      // Replace this endpoint with your actual backend referral route when ready
      const response = await fetch(`${BACKEND_URL}/api/referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referrerName,
          referrerEmail,
          hostName,
          hostPhone,
          hostEmail
        }),
      });

      // Simulate a successful API response if the endpoint doesn't exist yet
      if (response.status === 404) {
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Mock delay
      } else if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit referral.');
      }

      setStatus({
        type: 'success',
        message: 'Awesome! Your referral has been submitted. We will contact them soon.',
      });

      // Clear form
      setReferrerName('');
      setReferrerEmail('');
      setHostName('');
      setHostPhone('');
      setHostEmail('');

    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans antialiased text-slate-800 flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <span className="text-teal-600 text-xl sm:text-2xl">🏠</span>
            <span className="text-lg sm:text-xl font-bold text-teal-800 tracking-tight">
              StayGuwahati
            </span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-teal-600 transition">Home</Link>
            <Link href="/explore" className="hover:text-teal-600 transition">Explore</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <div className="inline-flex items-center justify-center bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-2">
            Refer & Earn Rewards 💸
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Know a great host in Guwahati?
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Invite friends, family, or neighbors to list their property on StayGuwahati. 
            When they get their first verified booking, you both earn a <span className="font-bold text-teal-600">₹1,000 platform bonus</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: How it Works */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900">How it works</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">1</div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Submit their details</h3>
                    <p className="text-xs text-slate-500 mt-1">Fill out the form with your friend's contact info. We'll send them an exclusive invite.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">2</div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">They list their property</h3>
                    <p className="text-xs text-slate-500 mt-1">Our team helps them verify and list their Guwahati homestay on our platform.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">3</div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">You both get rewarded</h3>
                    <p className="text-xs text-slate-500 mt-1">Once they complete their first guest stay, ₹1,000 is credited to both of your accounts.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Trust Badge */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl flex items-center gap-4">
              <span className="text-3xl">🤝</span>
              <div>
                <h4 className="font-bold text-sm">Trusted Local Network</h4>
                <p className="text-xs text-slate-400 mt-1">Join 500+ successful hosts already earning through StayGuwahati.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Referral Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-md">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">
                Referral Form
              </h2>

              {status && (
                <div
                  className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-start gap-2 ${
                    status.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}
                >
                  <span className="mt-0.5">{status.type === 'success' ? '🎉' : '⚠️'}</span>
                  <span>{status.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Your Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-teal-700 uppercase tracking-wide">1. Your Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Your Name</label>
                      <input
                        type="text"
                        required
                        value={referrerName}
                        onChange={(e) => setReferrerName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Your Email</label>
                      <input
                        type="email"
                        required
                        value={referrerEmail}
                        onChange={(e) => setReferrerEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Host Details */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-teal-700 uppercase tracking-wide">2. Host Details</h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Host's Full Name</label>
                    <input
                      type="text"
                      required
                      value={hostName}
                      onChange={(e) => setHostName(e.target.value)}
                      placeholder="Jane Smith"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Host's Phone</label>
                      <input
                        type="tel"
                        required
                        value={hostPhone}
                        onChange={(e) => setHostPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Host's Email</label>
                      <input
                        type="email"
                        required
                        value={hostEmail}
                        onChange={(e) => setHostEmail(e.target.value)}
                        placeholder="jane@example.com"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 hover:bg-teal-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin text-base">⏳</span> Sending Invite...
                      </>
                    ) : (
                      'Send Referral Invite'
                    )}
                  </button>
                  <p className="text-center text-[11px] text-slate-400 mt-3">
                    By submitting, you confirm you have permission to share this person's contact details.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-100 bg-white px-4">
        &copy; 2026 StayGuwahati Platform Unified Core. All rights reserved.
      </footer>
    </div>
  );
}
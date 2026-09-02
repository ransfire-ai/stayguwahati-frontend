'use client';

import React, { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://stayguwahati-backend.onrender.com';

interface Homestay {
  _id: string;
  title: string;
  locality?: string;
  pricePerNight: number;
  images?: string[];
  cancellationPolicy?: string;
  isAvailable?: boolean;
}

interface UserProfile {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500">
      <rect width="800" height="500" fill="#e2e8f0"/>
      <text x="400" y="250" text-anchor="middle"
        font-family="Arial,sans-serif" font-size="32" font-weight="700"
        fill="#64748b">StayGuwahati</text>
    </svg>
  `);

function resolveImage(path?: string) {
  if (!path?.trim()) return FALLBACK_IMAGE;
  const value = path.trim();
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  ) {
    return value;
  }
  let normalized = value.replace(/\\/g, '/');
  if (normalized.startsWith('api/')) normalized = normalized.slice(4);
  if (!normalized.startsWith('/')) normalized = `/${normalized}`;
  return `${BACKEND_URL.replace(/\/+$/, '')}${normalized}`;
}

function dateLabel(value: string) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function todayString() {
  return new Date().toISOString().split('T')[0];
}

function getCancellationPolicy(policy?: string) {
  if (policy === 'moderate') {
    return 'Free cancellation up to 5 days before check-in.';
  }
  if (policy === 'strict') {
    return 'Limited cancellation. Contact the host or StayGuwahati support for assistance.';
  }
  return 'Free cancellation up to 24 hours before check-in.';
}

function readProfile(): UserProfile {
  try {
    const raw =
      localStorage.getItem('userProfile') ||
      sessionStorage.getItem('userProfile') ||
      '{}';
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function CheckoutContent() {
  const router = useRouter();
  const params = useSearchParams();

  const id = params.get('id') || '';
  const [property, setProperty] = useState<Homestay | null>(null);
  const [checkIn, setCheckIn] = useState(params.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(params.get('checkOut') || '');
  const [guests, setGuests] = useState(Number(params.get('guests')) || 2);

  const profile = useMemo(() => readProfile(), []);
  const [fullName, setFullName] = useState(profile.name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);
    const value = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    return value > 0 ? value : 0;
  }, [checkIn, checkOut]);

  const total = property ? Number(property.pricePerNight || 0) * nights : 0;

  useEffect(() => {
    if (!id) {
      setError('Property information is missing.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadProperty() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/homestays/${id}`, {
          cache: 'no-store',
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Unable to load this property.');
        }

        const raw = await response.json();
        const p = raw?.data || raw?.homestay || raw;

        setProperty({
          _id: p._id || p.id,
          title: p.title || p.name || 'Homestay',
          locality: p.locality || p.city || 'Guwahati',
          pricePerNight: Number(p.pricePerNight || p.price || 0),
          images: Array.isArray(p.images) ? p.images : [],
          cancellationPolicy: p.cancellationPolicy || 'flexible',
          isAvailable: p.isAvailable !== false,
        });
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setError(err?.message || 'Unable to load this property.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
    return () => controller.abort();
  }, [id]);

  async function submitBooking(event: FormEvent) {
    event.preventDefault();
    setError('');

    const today = todayString();

    if (!property) return setError('Property information is unavailable.');
    if (!property.isAvailable) return setError('This property is currently unavailable.');
    if (!checkIn || !checkOut || nights < 1) {
      return setError('Please select valid check-in and check-out dates.');
    }
    if (checkIn < today) {
      return setError('Check-in date cannot be in the past.');
    }
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      return setError('Please complete your name, email and phone number.');
    }

    setSubmitting(true);

    try {
      const currentProfile = readProfile();

      const response = await fetch(`${BACKEND_URL}/api/bookings`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          homestayId: property._id,
          propertyId: property._id,
          checkIn,
          checkOut,
          guests,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          specialRequests: specialRequests.trim(),
          userId: currentProfile?._id || currentProfile?.id || null,
        }),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        throw new Error('The booking service returned an invalid response.');
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Booking request failed.');
      }

      const booking = data.data || data.booking || {};
      const bookingId = booking._id || booking.id;

      if (!bookingId) {
        throw new Error('Booking was created but no booking reference was returned.');
      }

      router.replace(`/booking-confirmation?id=${encodeURIComponent(bookingId)}`);
    } catch (err: any) {
      setError(err?.message || 'Unable to submit booking request.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center bg-[#f5f1e8] text-[#61756e]">
        Loading your stay…
      </main>
    );
  }

  if (error && !property) {
    return (
      <main className="min-h-screen grid place-items-center bg-[#f5f1e8] p-6">
        <div className="max-w-md text-center">
          <div className="text-4xl">⚠️</div>
          <p className="mt-4 font-semibold text-red-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-5 rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f1e8] px-4 py-8 pb-28 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.back()}
          className="mb-5 text-sm font-bold text-[#35534c] hover:text-teal-700"
        >
          ← Back to property
        </button>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <form
            onSubmit={submitBooking}
            className="rounded-[2rem] bg-[#fffdf7] p-5 shadow-sm ring-1 ring-slate-200 sm:p-8"
          >
            <p className="text-xs font-black uppercase tracking-widest text-[#2f7f72]">
              StayGuwahati booking
            </p>
            <h1 className="mt-2 text-3xl font-black text-[#123c35]">
              Complete your booking
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#61756e]">
              Almost there. Share your details to send a stay request directly to your host.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-bold text-[#35534c]">
                  Full name *
                </span>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-2xl border border-[#d9ddd2] px-4 py-3 outline-none focus:border-[#2f7f72]"
                  placeholder="Your full name"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-xs font-bold text-[#35534c]">
                  Email *
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-[#d9ddd2] px-4 py-3 outline-none focus:border-[#2f7f72]"
                  placeholder="you@example.com"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-xs font-bold text-[#35534c]">
                  Phone *
                </span>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-[#d9ddd2] px-4 py-3 outline-none focus:border-[#2f7f72]"
                  placeholder="10-digit mobile number"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-xs font-bold text-[#35534c]">
                  Check-in *
                </span>
                <input
                  required
                  type="date"
                  min={todayString()}
                  value={checkIn}
                  onChange={(e) => {
                    const next = e.target.value;
                    setCheckIn(next);
                    if (checkOut && next >= checkOut) {
                      const nextDay = new Date(`${next}T00:00:00`);
                      nextDay.setDate(nextDay.getDate() + 1);
                      setCheckOut(nextDay.toISOString().split('T')[0]);
                    }
                  }}
                  className="w-full rounded-2xl border border-[#d9ddd2] px-4 py-3 outline-none focus:border-[#2f7f72]"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-xs font-bold text-[#35534c]">
                  Check-out *
                </span>
                <input
                  required
                  type="date"
                  min={checkIn || todayString()}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-2xl border border-[#d9ddd2] px-4 py-3 outline-none focus:border-[#2f7f72]"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-xs font-bold text-[#35534c]">
                  Guests *
                </span>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full rounded-2xl border border-[#d9ddd2] px-4 py-3 outline-none focus:border-[#2f7f72]"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'guest' : 'guests'}
                    </option>
                  ))}
                  <option value={5}>5+ guests</option>
                </select>
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-bold text-[#35534c]">
                  Special requests{' '}
                  <span className="font-normal text-slate-400">(optional)</span>
                </span>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-[#d9ddd2] px-4 py-3 outline-none focus:border-[#2f7f72]"
                  placeholder="Arrival time, accessibility needs, or anything the host should know."
                />
              </label>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <button
              disabled={submitting || !property?.isAvailable}
              className="mt-6 w-full rounded-2xl bg-[#1d5b4f] py-3.5 text-sm font-black text-white shadow-lg shadow-[#1d5b4f]/20 transition hover:bg-[#123c35] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Sending request…' : 'Confirm your stay request'}
            </button>

            <p className="mt-3 text-center text-xs text-slate-400">
              Your request is sent securely. Host approval is required before confirmation.
            </p>
          </form>

          <aside className="h-fit rounded-[2rem] bg-[#fffdf7] p-5 shadow-sm ring-1 ring-slate-200 sm:p-6 lg:sticky lg:top-6">
            <img
              src={resolveImage(property?.images?.[0])}
              alt={property?.title || 'Property'}
              className="h-48 w-full rounded-2xl object-cover"
            />

            <h2 className="mt-4 text-xl font-black text-[#123c35]">
              {property?.title}
            </h2>
            <p className="mt-1 text-sm text-[#61756e]">
              📍 {property?.locality}, Guwahati
            </p>

            <div className="mt-5 space-y-3 border-t border-[#e5e5d9] pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-[#61756e]">Check-in</span>
                <b>{dateLabel(checkIn)}</b>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#61756e]">Check-out</span>
                <b>{dateLabel(checkOut)}</b>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#61756e]">Guests</span>
                <b>{guests}</b>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#61756e]">Nights</span>
                <b>{nights}</b>
              </div>
            </div>

            <div className="mt-5 border-t border-[#e5e5d9] pt-5">
              <div className="flex justify-between text-sm">
                <span>
                  ₹{Number(property?.pricePerNight || 0).toLocaleString('en-IN')} ×{' '}
                  {nights} nights
                </span>
                <b>₹{total.toLocaleString('en-IN')}</b>
              </div>

              <div className="mt-3 flex justify-between text-lg font-black">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>

              <div className="mt-4 rounded-2xl bg-[#f5f1e8] p-3">
                <p className="text-xs font-bold text-[#35534c]">
                  Good to know
                </p>
                <p className="mt-1 text-xs leading-5 text-[#61756e]">
                  {getCancellationPolicy(property?.cancellationPolicy)}
                </p>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                The final total is recalculated by the server when your request
                is submitted.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f5f1e8] px-4 py-16">
          <div className="mx-auto max-w-3xl rounded-2xl bg-[#fffdf7] p-8 text-center shadow-sm">
            <p className="text-sm font-semibold text-[#61756e]">
              Loading booking details…
            </p>
          </div>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

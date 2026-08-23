'use client';

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, ChevronLeft, CalendarDays, Users, ShieldCheck } from 'lucide-react';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://stayguwahati-backend.onrender.com';

interface Homestay {
  _id: string;
  title: string;
  locality?: string;
  location?: string;
  pricePerNight: number;
  images?: string[];
  image?: string;
  cancellationPolicy?: string;
  isAvailable?: boolean;
}

const today = () => new Date().toISOString().split('T')[0];

const futureDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const imageUrl = (value?: string) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `${BACKEND_URL}${value.startsWith('/') ? '' : '/'}${value}`;
};

function policyText(policy?: string) {
  if (policy === 'moderate') return 'Free cancellation up to 5 days before check-in.';
  if (policy === 'strict') return 'Limited cancellation.';
  return 'Free cancellation up to 24 hours before check-in.';
}

function BookStayContent() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get('id') || '';

  const [property, setProperty] = useState<Homestay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [checkIn, setCheckIn] = useState(params.get('checkIn') || today());
  const [checkOut, setCheckOut] = useState(
    params.get('checkOut') || futureDate(2)
  );
  const [guests, setGuests] = useState(Number(params.get('guests')) || 2);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);
    const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  const total = property ? property.pricePerNight * nights : 0;

  useEffect(() => {
    if (!id) {
      setError('Property ID is missing. Please return to Property Details.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadProperty() {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/homestays/${encodeURIComponent(id)}`,
          {
            cache: 'no-store',
            signal: controller.signal,
            headers: { Accept: 'application/json' },
          }
        );

        if (!response.ok) {
          throw new Error('Unable to load this property.');
        }

        const raw = await response.json();
        const item = raw?.data || raw?.homestay || raw;

        if (!item || !(item._id || item.id)) {
          throw new Error('Property was not found.');
        }

        setProperty({
          _id: item._id || item.id,
          title: item.title || item.name || 'Homestay',
          locality: item.locality || item.city || item.address || 'Guwahati',
          location: item.location || item.state || 'Guwahati, Assam',
          pricePerNight: Number(
            item.pricePerNight || item.price || item.rate || 0
          ),
          images:
            Array.isArray(item.images) && item.images.length
              ? item.images
              : item.image
                ? [item.image]
                : [],
          image: item.image || '',
          cancellationPolicy: item.cancellationPolicy || 'flexible',
          isAvailable: item.isAvailable !== false,
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

  const continueToCheckout = () => {
    if (!property) return;

    if (!checkIn || !checkOut || nights < 1) {
      setError('Please select valid check-in and check-out dates.');
      return;
    }

    const query = new URLSearchParams({
      id: property._id,
      checkIn,
      checkOut,
      guests: String(guests),
    });

    router.push(`/checkout?${query.toString()}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 grid place-items-center">
        <div className="text-center text-slate-500">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-teal-600" />
          <p className="text-sm font-semibold">Loading reservation details…</p>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-slate-50 grid place-items-center p-6">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="font-bold text-red-600">{error || 'Property not found.'}</p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const image = imageUrl(property.images?.[0] || property.image);

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-sm font-bold text-slate-700"
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </button>
          <Link href="/" className="text-base font-black text-slate-900">
            Stay<span className="text-teal-600">Guwahati</span>
          </Link>
          <span className="w-12" />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-widest text-teal-600">
            Book your stay
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Choose dates & guests
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review your reservation details before continuing to checkout.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
            <div className="flex gap-4 border-b border-slate-100 pb-5">
              {image ? (
                <img
                  src={image}
                  alt={property.title}
                  className="h-24 w-28 rounded-2xl object-cover sm:h-28 sm:w-36"
                />
              ) : (
                <div className="h-24 w-28 rounded-2xl bg-slate-100 sm:h-28 sm:w-36" />
              )}
              <div className="min-w-0">
                <h2 className="text-lg font-black text-slate-950">
                  {property.title}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  📍 {property.locality || property.location || 'Guwahati'}
                </p>
                <p className="mt-3 text-sm font-bold text-slate-800">
                  ₹{property.pricePerNight.toLocaleString('en-IN')}
                  <span className="font-normal text-slate-400"> / night</span>
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="rounded-2xl border border-slate-200 p-4">
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                  <CalendarDays className="h-4 w-4 text-teal-600" />
                  Check-in
                </span>
                <input
                  type="date"
                  min={today()}
                  value={checkIn}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCheckIn(value);
                    if (!checkOut || value >= checkOut) {
                      const next = new Date(`${value}T00:00:00`);
                      next.setDate(next.getDate() + 1);
                      setCheckOut(next.toISOString().split('T')[0]);
                    }
                  }}
                  className="mt-2 w-full bg-transparent text-sm font-bold text-slate-900 outline-none"
                />
              </label>

              <label className="rounded-2xl border border-slate-200 p-4">
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                  <CalendarDays className="h-4 w-4 text-teal-600" />
                  Check-out
                </span>
                <input
                  type="date"
                  min={checkIn || today()}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="mt-2 w-full bg-transparent text-sm font-bold text-slate-900 outline-none"
                />
              </label>
            </div>

            <label className="mt-4 block rounded-2xl border border-slate-200 p-4">
              <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                <Users className="h-4 w-4 text-teal-600" />
                Guests
              </span>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="mt-2 w-full bg-transparent text-sm font-bold text-slate-900 outline-none"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'guest' : 'guests'}
                  </option>
                ))}
              </select>
            </label>

            {error && (
              <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                <div>
                  <p className="text-sm font-black text-slate-900">
                    {property.cancellationPolicy === 'moderate'
                      ? 'Moderate cancellation'
                      : property.cancellationPolicy === 'strict'
                        ? 'Strict cancellation'
                        : 'Flexible cancellation'}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {policyText(property.cancellationPolicy)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:sticky lg:top-20">
            <h2 className="text-lg font-black text-slate-950">Reservation summary</h2>

            <div className="mt-5 space-y-3 border-b border-slate-100 pb-5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Price per night</span>
                <b>₹{property.pricePerNight.toLocaleString('en-IN')}</b>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Nights</span>
                <b>{nights || '—'}</b>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Guests</span>
                <b>{guests}</b>
              </div>
            </div>

            <div className="flex justify-between pt-5 text-lg font-black text-slate-950">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>

            <button
              type="button"
              disabled={!property.isAvailable || nights < 1}
              onClick={continueToCheckout}
              className="mt-6 w-full rounded-xl bg-teal-600 py-3.5 text-sm font-black text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to Checkout
            </button>

            <p className="mt-3 text-center text-[11px] text-slate-400">
              You won't be charged yet. Host approval is required.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function BookStayPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen grid place-items-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </main>
      }
    >
      <BookStayContent />
    </Suspense>
  );
}

'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://stayguwahati-backend.onrender.com';

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function statusStyle(status: string) {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'rejected':
    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-100';
    case 'completed':
      return 'bg-blue-50 text-blue-700 border-blue-100';
    default:
      return 'bg-amber-50 text-amber-700 border-amber-100';
  }
}

function BookingConfirmationContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id') || '';

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadBooking = useCallback(async () => {
    if (!id) {
      setError('Booking reference is missing.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/bookings/${encodeURIComponent(id)}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load this booking.');
      }

      setBooking(data.data || data.booking || null);
      setLastUpdated(new Date());
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Unable to load this booking.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBooking();

    const timer = window.setInterval(() => {
      loadBooking();
    }, 30000);

    return () => window.clearInterval(timer);
  }, [loadBooking]);

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center bg-slate-50 text-slate-500">
        Loading your booking…
      </main>
    );
  }

  if (error && !booking) {
    return (
      <main className="min-h-screen grid place-items-center bg-slate-50 p-5">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <div className="text-4xl">⚠️</div>
          <h1 className="mt-4 text-xl font-black text-slate-950">
            Booking could not be loaded
          </h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <button
            onClick={loadBooking}
            className="mt-5 rounded-xl bg-teal-600 px-5 py-3 font-black text-white"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const status = String(booking?.status || 'Requested');
  const isConfirmed = status.toLowerCase() === 'confirmed';
  const isRejected = ['rejected', 'cancelled'].includes(status.toLowerCase());

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200 sm:p-10">
          <div
            className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${
              isConfirmed
                ? 'bg-emerald-50 text-emerald-600'
                : isRejected
                  ? 'bg-red-50 text-red-600'
                  : 'bg-amber-50 text-amber-600'
            } text-3xl`}
          >
            {isConfirmed ? '✓' : isRejected ? '!' : '⏳'}
          </div>

          <p className="mt-5 text-xs font-black uppercase tracking-widest text-teal-600">
            StayGuwahati Booking
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">
            {isConfirmed
              ? 'Your stay is confirmed'
              : isRejected
                ? 'Booking request closed'
                : 'Your request is with the host'}
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            {isConfirmed
              ? 'The host has accepted your booking. Please keep this booking reference for your stay.'
              : isRejected
                ? 'This booking is no longer active. You can return to StayGuwahati and choose another property.'
                : 'Your booking request has been submitted. The host must accept it before the stay is confirmed.'}
          </p>

          {booking && (
            <div className="mt-7 rounded-2xl bg-slate-50 p-5 text-left text-sm">
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span className="text-slate-500">Booking reference</span>
                <b className="max-w-[55%] truncate">{booking._id || booking.id}</b>
              </div>

              <div className="mt-3 space-y-3">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Property</span>
                  <b className="text-right">{booking.propertyName || 'Homestay'}</b>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Check-in</span>
                  <b>{formatDate(booking.checkInDate || booking.checkIn)}</b>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Check-out</span>
                  <b>{formatDate(booking.checkOutDate || booking.checkOut)}</b>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Guests</span>
                  <b>{booking.guests || 1}</b>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Nights</span>
                  <b>{booking.nights || '—'}</b>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Total</span>
                  <b>₹{Number(booking.totalPrice || 0).toLocaleString('en-IN')}</b>
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <span className="text-slate-500">Status</span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${statusStyle(status)}`}
                  >
                    {status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {isConfirmed && booking && (
            <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50 p-5 text-left">
              <h2 className="font-black text-slate-900">Contact host</h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Your host can provide check-in instructions and arrival details.
              </p>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                {booking.phone && (
                  <a
                    href={`tel:${booking.phone}`}
                    className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-black text-white"
                  >
                    📞 Call Host
                  </a>
                )}
                {booking.phone && (
                  <a
                    href={`https://wa.me/${String(booking.phone).replace(/\\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-xl bg-teal-600 px-4 py-3 text-center text-sm font-black text-white"
                  >
                    💬 WhatsApp Host
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 rounded-xl bg-teal-600 px-5 py-3 font-black text-white hover:bg-teal-700"
            >
              View My Bookings
            </button>

            <button
              onClick={() => router.push('/')}
              className="flex-1 rounded-xl border border-slate-200 px-5 py-3 font-black text-slate-700"
            >
              Back to Home
            </button>
          </div>

          <div className="mt-5 text-xs text-slate-400">
            {lastUpdated
              ? `Status checked ${lastUpdated.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}.`
              : ''}
            {!isConfirmed && !isRejected
              ? ' This page checks for host updates automatically.'
              : ''}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen grid place-items-center bg-slate-50 text-slate-500">
          Loading booking confirmation…
        </main>
      }
    >
      <BookingConfirmationContent />
    </Suspense>
  );
}

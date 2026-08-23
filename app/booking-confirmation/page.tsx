// app/booking-confirmation/page.tsx
'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://stayguwahati-backend.onrender.com';

interface Booking {
  _id?: string;
  id?: string;
  propertyName?: string;
  dates?: string;
  checkInDate?: string;
  checkOutDate?: string;
  nights?: number;
  totalPrice?: number;
  status?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  homestayId?: any;
  hostPhone?: string;
  hostName?: string;
}

const formatDate = (value?: string) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

const SUPPORT_EMAIL = 'support@stayguwahati.in';
const SUPPORT_WHATSAPP =
  process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.replace(/\\D/g, '') || '';

const getWhatsAppUrl = (phone: string, message: string) => {
  const digits = phone.replace(/\\D/g, '');
  if (!digits) return '';
  const normalized = digits.startsWith('91') ? digits : `91${digits}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
};

function ConfirmationContent() {
  const router = useRouter();
  const params = useSearchParams();
  const bookingId = params.get('id') || '';

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hostPhone, setHostPhone] = useState('');
  const [hostName, setHostName] = useState('Host');

  useEffect(() => {
    let cancelled = false;

    async function loadBooking() {
      if (!bookingId) {
        setError('Booking ID is missing.');
        setLoading(false);
        return;
      }

      try {
        // The current backend exposes GET /api/bookings?email=...
        // rather than GET /api/bookings/:id, so use the guest email
        // saved by the checkout page and select the requested booking.
        let email = '';

        try {
          email =
            sessionStorage.getItem('bookingConfirmationEmail') ||
            localStorage.getItem('bookingConfirmationEmail') ||
            '';

          if (!email) {
            const profile = JSON.parse(
              localStorage.getItem('userProfile') ||
                sessionStorage.getItem('userProfile') ||
                '{}'
            );
            email = profile?.email || '';
          }
        } catch {
          // Continue with the missing-email error below.
        }

        if (!email) {
          throw new Error(
            'We could not identify the guest email for this booking. Please return to your bookings and try again.'
          );
        }

        const response = await fetch(
          `${BACKEND_URL}/api/bookings?email=${encodeURIComponent(email)}`
        );

        const payload = await response.json().catch(() => ({}));

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || 'Unable to load booking.');
        }

        const bookings: Booking[] = Array.isArray(payload.data)
          ? payload.data
          : [];

        const found = bookings.find(
          (item) => String(item._id || item.id || '') === String(bookingId)
        );

        if (!found) {
          throw new Error(
            'Booking was created, but its details could not be loaded yet. Please refresh in a moment.'
          );
        }

        if (!cancelled) {
          setBooking(found);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Unable to load booking details.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBooking();

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const status = useMemo(
    () => String(booking?.status || 'Requested').toLowerCase(),
    [booking?.status]
  );

  const isConfirmed =
    status === 'confirmed' ||
    status === 'accepted' ||
    status === 'approved';

  const isRejected =
    status === 'rejected' || status === 'cancelled' || status === 'canceled';

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <div className="rounded-3xl bg-white px-8 py-10 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
          <p className="font-semibold text-slate-600">
            Loading your booking…
          </p>
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-7 text-center shadow-sm ring-1 ring-slate-200 sm:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50 text-3xl">
            !
          </div>
          <h1 className="mt-5 text-2xl font-black text-slate-950">
            Booking details unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error || 'We could not find this booking.'}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-black text-white hover:bg-teal-700"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  const guestName =
    `${booking.firstName || ''} ${booking.lastName || ''}`.trim() || 'Guest';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div
            className={`px-6 py-8 text-center sm:px-10 ${
              isRejected
                ? 'bg-red-50'
                : isConfirmed
                  ? 'bg-teal-50'
                  : 'bg-amber-50'
            }`}
          >
            <div
              className={`mx-auto grid h-16 w-16 place-items-center rounded-full text-3xl ${
                isRejected
                  ? 'bg-red-100'
                  : isConfirmed
                    ? 'bg-teal-100'
                    : 'bg-amber-100'
              }`}
            >
              {isRejected ? '×' : isConfirmed ? '✓' : '⏳'}
            </div>

            <h1 className="mt-5 text-3xl font-black text-slate-950">
              {isRejected
                ? 'Booking Request Declined'
                : isConfirmed
                  ? 'Booking Confirmed'
                  : 'Booking Request Submitted'}
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
              {isRejected
                ? 'Unfortunately, the host could not accept this booking request.'
                : isConfirmed
                  ? 'Your stay has been confirmed by the host.'
                  : 'Your request has been sent to the host. The host will review the dates and contact you to confirm the stay.'}
            </p>
          </div>

          <div className="p-6 sm:p-10">
            <div className="flex flex-col gap-1 border-b border-slate-100 pb-5">
              <p className="text-xs font-black uppercase tracking-widest text-teal-600">
                Stay details
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                {booking.propertyName || 'Stay'}
              </h2>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Check-in
                </p>
                <p className="mt-1 font-black text-slate-800">
                  {formatDate(booking.checkInDate)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Check-out
                </p>
                <p className="mt-1 font-black text-slate-800">
                  {formatDate(booking.checkOutDate)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Nights
                </p>
                <p className="mt-1 font-black text-slate-800">
                  {booking.nights || 1}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Guest
                </p>
                <p className="mt-1 font-black text-slate-800">
                  {guestName}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">Total stay price</span>
                <span className="text-2xl font-black text-slate-950">
                  ₹{Number(booking.totalPrice || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="mt-3 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">
                <p>
                  <strong className="text-slate-700">No online payment.</strong>{' '}
                  StayGuwahati does not collect payment online. Any payment
                  arrangement is made directly with the host.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Booking ID
                </span>
                <span className="break-all text-right font-mono text-xs font-bold text-slate-700">
                  {booking._id || booking.id}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Status
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    isRejected
                      ? 'bg-red-100 text-red-700'
                      : isConfirmed
                        ? 'bg-teal-100 text-teal-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {isRejected
                    ? 'Rejected'
                    : isConfirmed
                      ? 'Confirmed'
                      : 'Awaiting Host'}
                </span>
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left">
          <p className="text-xs font-black uppercase tracking-widest text-teal-600">
            Need help?
          </p>
          <h2 className="mt-2 text-lg font-black text-slate-900">
            StayGuwahati Support
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Questions about your booking or stay? Contact our support team.
          </p>

          <div className="mt-4 grid gap-2">
            <a
              href={
                SUPPORT_WHATSAPP
                  ? getWhatsAppUrl(
                      SUPPORT_WHATSAPP,
                      `Hi StayGuwahati Support, I need help with booking ${booking?._id || booking?.id || ''}.`
                    )
                  : `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                      `Help with booking ${booking?._id || booking?.id || ''}`
                    )}`
              }
              target={SUPPORT_WHATSAPP ? "_blank" : undefined}
              rel={SUPPORT_WHATSAPP ? "noreferrer" : undefined}
              className="rounded-xl bg-teal-600 px-4 py-3 text-center text-sm font-black text-white hover:bg-teal-700"
            >
              💬 WhatsApp Support
            </a>

            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                `Support request - booking ${booking?._id || booking?.id || ''}`
              )}`}
              className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-black text-slate-700 hover:border-teal-300 hover:text-teal-700"
            >
              🎧 Contact StayGuwahati
            </a>
          </div>
        </div>

        {status === 'confirmed' && (
          <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-5 text-left">
            <p className="text-xs font-black uppercase tracking-widest text-teal-700">
              Your host
            </p>
            <h2 className="mt-2 text-lg font-black text-slate-900">
              Contact {hostName}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Your booking is confirmed. You can contact the host directly.
            </p>

            <div className="mt-4 grid gap-2">
              {hostPhone ? (
                <>
                  <a
                    href={getWhatsAppUrl(
                      hostPhone,
                      `Hi ${hostName}, I have a confirmed StayGuwahati booking for ${booking?.propertyName || 'your property'}.`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-green-600 px-4 py-3 text-center text-sm font-black text-white hover:bg-green-700"
                  >
                    💬 WhatsApp Host
                  </a>
                  <a
                    href={`tel:${hostPhone}`}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-black text-slate-700 hover:border-teal-300 hover:text-teal-700"
                  >
                    📞 Call Host
                  </a>
                </>
              ) : (
                <p className="rounded-xl bg-white px-4 py-3 text-xs font-semibold text-slate-500">
                  Host contact details will appear here once the host has provided a phone number.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => router.push('/')}
                className="flex-1 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white hover:bg-teal-700"
              >
                Back to Home
              </button>

              <button
                onClick={() => router.back()}
                className="flex-1 rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
            </div>
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
        <main className="grid min-h-screen place-items-center bg-slate-50">
          <p className="font-semibold text-slate-500">
            Loading confirmation…
          </p>
        </main>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}

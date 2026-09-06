// app/book-stay/page.tsx
'use client';

import React, { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  Loader2,
  MapPin,
  ShieldCheck,
  Users,
  UserRound,
  Mail,
  Phone,
  MessageSquare,
  Send,
} from 'lucide-react';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
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

interface PendingBooking {
  id?: string;
  _id?: string;
  propertyId?: string;
  title?: string;
  locality?: string;
  location?: string;
  price?: number;
  pricePerNight?: number;
  image?: string;
  images?: string[];
  cancellationPolicy?: string;
}

interface UserProfile {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const futureDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const money = (value: number) =>
  `₹${Math.max(0, Number(value) || 0).toLocaleString('en-IN')}`;

function imageUrl(value?: string) {
  if (!value) return '';
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

function policyText(policy?: string) {
  if (policy === 'moderate') {
    return 'Free cancellation up to 5 days before check-in.';
  }
  if (policy === 'strict') {
    return 'Cancellation is subject to the host policy.';
  }
  return 'Free cancellation up to 24 hours before check-in.';
}

function readProfile(): UserProfile {
  try {
    const raw =
      localStorage.getItem('userProfile') ||
      sessionStorage.getItem('userProfile') ||
      '{}';

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function BookingContent() {
  const params = useSearchParams();
  const router = useRouter();

  const queryId =
    params.get('id') ||
    params.get('propertyId') ||
    params.get('property_id') ||
    '';

  const [propertyId, setPropertyId] = useState(queryId);
  const [storedBooking, setStoredBooking] =
    useState<PendingBooking | null>(null);
  const [property, setProperty] = useState<Homestay | null>(null);

  const [checkIn, setCheckIn] = useState(
    params.get('checkIn') || today()
  );
  const [checkOut, setCheckOut] = useState(
    params.get('checkOut') || futureDate(2)
  );
  const [guests, setGuests] = useState(
    Math.max(1, Number(params.get('guests')) || 2)
  );

  const profile = useMemo(() => readProfile(), []);
  const [fullName, setFullName] = useState(profile.name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [dateAvailability, setDateAvailability] = useState<'idle' | 'checking' | 'available' | 'unavailable' | 'error'>('idle');
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let stored: PendingBooking | null = null;

    try {
      const raw = sessionStorage.getItem('pendingBooking');
      if (raw) stored = JSON.parse(raw);
    } catch {
      sessionStorage.removeItem('pendingBooking');
    }

    setStoredBooking(stored);

    const storedId =
      stored?.id || stored?._id || stored?.propertyId || '';
    const resolvedId = queryId || storedId;

    setPropertyId(resolvedId);

    // Keep older links working if they only contain sessionStorage data.
    if (!queryId && storedId) {
      const next = new URLSearchParams(params.toString());
      next.set('id', storedId);
      router.replace(`/book-stay?${next.toString()}`);
    }
  }, [queryId, params, router]);

  useEffect(() => {
    if (!propertyId) {
      setLoading(false);
      setError(
        'We could not find the property for this reservation. Please return to the property page and try again.'
      );
      return;
    }

    const controller = new AbortController();

    async function loadProperty() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/homestays/${encodeURIComponent(propertyId)}`,
          {
            cache: 'no-store',
            signal: controller.signal,
            headers: {
              Accept: 'application/json',
              'Cache-Control': 'no-cache',
            },
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

        const normalized: Homestay = {
          _id: String(item._id || item.id),
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
        };

        setProperty(normalized);

        sessionStorage.setItem(
          'pendingBooking',
          JSON.stringify({
            id: normalized._id,
            title: normalized.title,
            locality: normalized.locality,
            location: normalized.location,
            price: normalized.pricePerNight,
            image: normalized.images?.[0] || normalized.image || '',
            images: normalized.images || [],
            cancellationPolicy: normalized.cancellationPolicy,
          })
        );
      } catch (err: unknown) {
        if (
          err instanceof Error &&
          err.name === 'AbortError'
        ) {
          return;
        }

        const fallbackId =
          storedBooking?.id ||
          storedBooking?._id ||
          storedBooking?.propertyId ||
          '';

        if (fallbackId && fallbackId === propertyId) {
          setProperty({
            _id: fallbackId,
            title: storedBooking?.title || 'Homestay',
            locality:
              storedBooking?.locality ||
              storedBooking?.location ||
              'Guwahati',
            location:
              storedBooking?.location || 'Guwahati, Assam',
            pricePerNight: Number(
              storedBooking?.pricePerNight ??
                storedBooking?.price ??
                0
            ),
            images:
              storedBooking?.images?.length
                ? storedBooking.images
                : storedBooking?.image
                  ? [storedBooking.image]
                  : [],
            image: storedBooking?.image || '',
            cancellationPolicy:
              storedBooking?.cancellationPolicy || 'flexible',
            isAvailable: true,
          });
        } else {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load this property.'
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
    return () => controller.abort();
  }, [propertyId, storedBooking]);

  const normalizeBookingDate = (value: unknown) => {
    if (!value) return '';
    if (typeof value === 'string') {
      const direct = value.slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(direct)) return direct;
    }
    const parsed = new Date(String(value));
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().slice(0, 10);
  };

  // Check existing Requested/Confirmed bookings immediately when dates change.
  // The POST endpoint still performs the final overlap check, preventing races.
  useEffect(() => {
    if (!propertyId || !checkIn || !checkOut || checkOut <= checkIn) {
      setDateAvailability('idle');
      setAvailabilityMessage('');
      setCheckingAvailability(false);
      return;
    }

    const controller = new AbortController();

    async function checkAvailability() {
      setCheckingAvailability(true);
      setDateAvailability('checking');
      setAvailabilityMessage('');
      try {
        const baseUrl = BACKEND_URL.replace(/\/+$/, '');
        const url =
          `${baseUrl}/api/bookings/availability` +
          `?propertyId=${encodeURIComponent(propertyId)}` +
          `&checkIn=${encodeURIComponent(checkIn)}` +
          `&checkOut=${encodeURIComponent(checkOut)}`;

        const response = await fetch(url, {
          cache: 'no-store',
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
          },
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok || payload?.success === false) {
          throw new Error(
            payload?.message || `Availability check failed (${response.status}).`
          );
        }

        // Dedicated backend availability endpoint returns the final answer.
        const conflict = payload?.available === false;
        if (conflict) {
          setDateAvailability('unavailable');
          setAvailabilityMessage('These dates are unavailable because this stay is already requested or booked.');
        } else {
          setDateAvailability('available');
          setAvailabilityMessage('Great news — these dates are currently available.');
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;

        // Do not block the customer forever if the public availability request
        // is temporarily unavailable. The POST /api/bookings route still performs
        // the authoritative overlap check immediately before creating a booking.
        setDateAvailability('error');
        setAvailabilityMessage(
          'Date availability is temporarily unavailable. You may still submit your request; the server will verify availability before creating the booking.'
        );
      } finally {
        if (!controller.signal.aborted) setCheckingAvailability(false);
      }
    }

    const timeout = window.setTimeout(checkAvailability, 250);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [propertyId, checkIn, checkOut]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;

    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);
    const diff = Math.ceil(
      (end.getTime() - start.getTime()) / 86400000
    );

    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  const total = property
    ? property.pricePerNight * nights
    : 0;

  const updateCheckIn = (value: string) => {
    setCheckIn(value);
    setDateAvailability('checking');
    setAvailabilityMessage('Checking the new dates…');

    if (!checkOut || value >= checkOut) {
      const next = new Date(`${value}T00:00:00`);
      next.setDate(next.getDate() + 1);
      setCheckOut(next.toISOString().slice(0, 10));
    }
  };

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!property) {
      setError('Property information is unavailable.');
      return;
    }

    if (!property.isAvailable) {
      setError('This property is currently unavailable.');
      return;
    }

    if (!checkIn || !checkOut || nights < 1) {
      setError('Please select valid check-in and check-out dates.');
      return;
    }

    if (checkIn < today()) {
      setError('Check-in date cannot be in the past.');
      return;
    }

    if (checkingAvailability || dateAvailability === 'checking') {
      setError('Please wait while we check whether these dates are available.');
      return;
    }
    if (dateAvailability === 'unavailable') {
      setError('These dates are unavailable. Please choose different dates.');
      return;
    }
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError(
        'Please complete your name, email and phone number.'
      );
      return;
    }

    setSubmitting(true);

    try {
      const currentProfile = readProfile();

      const response = await fetch(
        `${BACKEND_URL}/api/bookings`,
        {
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
            userId:
              currentProfile?._id ||
              currentProfile?.id ||
              null,
          }),
        }
      );

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        throw new Error(
          'The booking service returned an invalid response.'
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Booking request failed.'
        );
      }

      const booking = data.data || data.booking || {};
      const bookingId = booking._id || booking.id;

      if (!bookingId) {
        throw new Error(
          'Booking was created but no booking reference was returned.'
        );
      }

      router.replace(
        `/booking-confirmation?id=${encodeURIComponent(bookingId)}`
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit booking request.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f7f5] text-[#173c3a]">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#123f3d] shadow-lg shadow-[#123f3d]/15">
            <Loader2 className="h-6 w-6 animate-spin text-[#ffd34e]" />
          </div>
          <p className="mt-4 text-sm font-bold text-[#58706e]">
            Preparing your reservation…
          </p>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-[#f6f7f5] px-5 py-8 text-[#173c3a]">
        <div className="mx-auto max-w-xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#1b7772]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to stays
          </Link>

          <div className="mt-8 rounded-[28px] border border-[#d8e7e5] bg-white p-8 text-center shadow-[0_18px_50px_rgba(18,63,61,0.08)]">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#123f3d] font-black text-[#ffd34e]">
              !
            </div>
            <h1 className="mt-5 text-2xl font-black">
              Reservation unavailable
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#607170]">
              {error || 'Property not found.'}
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#123f3d] px-5 py-3 text-sm font-black text-white"
            >
              Explore stays
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const image = imageUrl(
    property.images?.[0] || property.image
  );

  return (
    <main className="min-h-screen bg-[#f6f7f5] pb-12 text-[#173c3a]">
      <header className="sticky top-0 z-40 border-b border-[#d8e5e3] bg-[#f6f7f5]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-black tracking-tight"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0f706c] text-lg shadow-sm">
              🏠
            </span>
            <span className="text-base sm:text-lg">
              Stay<span className="text-[#1b7772]">Guwahati</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-[#cfe0de] bg-white px-3.5 py-2 text-xs font-black text-[#234846]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#103c3a] via-[#164b48] to-[#0e2f31] px-5 py-7 text-white shadow-[0_22px_60px_rgba(18,63,61,0.16)] sm:px-8 sm:py-9">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#74bdb7]/40 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#a7e4de]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Complete your booking
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Reserve {property.title}.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#c8d9d7]">
              Select your stay details and enter your contact information below. Everything is completed on this page—no extra checkout step.
            </p>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_370px]">
          <form
            onSubmit={submitBooking}
            className="space-y-5"
          >
            <section className="rounded-[24px] border border-[#d9e7e5] bg-white p-4 shadow-[0_14px_40px_rgba(18,63,61,0.06)] sm:p-5">
              <div className="flex gap-4">
                {image ? (
                  <img
                    src={image}
                    alt={property.title}
                    className="h-24 w-28 shrink-0 rounded-2xl object-cover sm:h-28 sm:w-36"
                  />
                ) : (
                  <div className="h-24 w-28 shrink-0 rounded-2xl bg-[#e9f0ef] sm:h-28 sm:w-36" />
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1b7772]">
                    Your selected stay
                  </p>
                  <h2 className="mt-1 truncate text-xl font-black sm:text-2xl">
                    {property.title}
                  </h2>
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-[#61716f]">
                    <MapPin className="h-4 w-4 shrink-0 text-[#d59b19]" />
                    <span className="truncate">
                      {property.locality ||
                        property.location ||
                        'Guwahati'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-black text-[#173c3a]">
                    {money(property.pricePerNight)}
                    <span className="font-medium text-[#7a8987]">
                      {' '} / night
                    </span>
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-[#d9e7e5] bg-white p-5 shadow-[0_14px_40px_rgba(18,63,61,0.06)] sm:p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1b7772]">
                Step 1 · Stay details
              </p>
              <h2 className="mt-1 text-xl font-black">
                When are you staying?
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="rounded-2xl border border-[#d6e4e2] bg-[#fbfcfb] p-4 focus-within:border-[#1b7772]">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#71817f]">
                    <CalendarDays className="h-4 w-4 text-[#1b7772]" />
                    Check-in
                  </span>
                  <input
                    required
                    type="date"
                    min={today()}
                    value={checkIn}
                    onChange={(e) => updateCheckIn(e.target.value)}
                    className="mt-2 w-full bg-transparent text-sm font-black text-[#173c3a] outline-none"
                  />
                </label>

                <label className="rounded-2xl border border-[#d6e4e2] bg-[#fbfcfb] p-4 focus-within:border-[#1b7772]">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#71817f]">
                    <CalendarDays className="h-4 w-4 text-[#1b7772]" />
                    Check-out
                  </span>
                  <input
                    required
                    type="date"
                    min={checkIn || today()}
                    value={checkOut}
                    onChange={(e) => { setCheckOut(e.target.value); setDateAvailability('checking'); setAvailabilityMessage('Checking the new dates…'); }}
                    className="mt-2 w-full bg-transparent text-sm font-black text-[#173c3a] outline-none"
                  />
                </label>
              </div>

              {availabilityMessage && (
                <div aria-live="polite" className={`mt-3 flex items-center gap-2 rounded-xl border px-3.5 py-3 text-sm font-semibold ${dateAvailability === 'unavailable' || dateAvailability === 'error' ? 'border-[#f1d2c9] bg-[#fff7f4] text-[#a74a36]' : dateAvailability === 'available' ? 'border-[#bfe3d8] bg-[#f1faf6] text-[#17654f]' : 'border-[#d6e4e2] bg-[#f7faf9] text-[#58706e]'}`}>
                  {checkingAvailability || dateAvailability === 'checking' ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : dateAvailability === 'available' ? <Check className="h-4 w-4 shrink-0 stroke-[3]" /> : <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-current text-[10px]">!</span>}
                  <span>{availabilityMessage}</span>
                </div>
              )}

              <label className="mt-4 block rounded-2xl border border-[#d6e4e2] bg-[#fbfcfb] p-4 focus-within:border-[#1b7772]">
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#71817f]">
                  <Users className="h-4 w-4 text-[#1b7772]" />
                  Guests
                </span>
                <select
                  value={guests}
                  onChange={(e) =>
                    setGuests(
                      Math.max(1, Number(e.target.value))
                    )
                  }
                  className="mt-2 w-full bg-transparent text-sm font-black text-[#173c3a] outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(
                    (count) => (
                      <option key={count} value={count}>
                        {count}{' '}
                        {count === 1 ? 'guest' : 'guests'}
                      </option>
                    )
                  )}
                </select>
              </label>
            </section>

            <section className="rounded-[24px] border border-[#d9e7e5] bg-white p-5 shadow-[0_14px_40px_rgba(18,63,61,0.06)] sm:p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1b7772]">
                Step 2 · Guest details
              </p>
              <h2 className="mt-1 text-xl font-black">
                Who is making the booking?
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-1.5 flex items-center gap-2 text-xs font-bold text-[#506360]">
                    <UserRound className="h-4 w-4" />
                    Full name *
                  </span>
                  <input
                    required
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-[#d6e4e2] bg-[#fbfcfb] px-4 py-3.5 outline-none transition focus:border-[#1b7772]"
                  />
                </label>

                <label>
                  <span className="mb-1.5 flex items-center gap-2 text-xs font-bold text-[#506360]">
                    <Mail className="h-4 w-4" />
                    Email *
                  </span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[#d6e4e2] bg-[#fbfcfb] px-4 py-3.5 outline-none transition focus:border-[#1b7772]"
                  />
                </label>

                <label>
                  <span className="mb-1.5 flex items-center gap-2 text-xs font-bold text-[#506360]">
                    <Phone className="h-4 w-4" />
                    Phone *
                  </span>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-[#d6e4e2] bg-[#fbfcfb] px-4 py-3.5 outline-none transition focus:border-[#1b7772]"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-1.5 flex items-center gap-2 text-xs font-bold text-[#506360]">
                    <MessageSquare className="h-4 w-4" />
                    Special requests
                    <span className="font-normal text-[#93a09e]">
                      (optional)
                    </span>
                  </span>
                  <textarea
                    rows={4}
                    value={specialRequests}
                    onChange={(e) =>
                      setSpecialRequests(e.target.value)
                    }
                    placeholder="Arrival time, accessibility needs, or anything the host should know."
                    className="w-full resize-none rounded-xl border border-[#d6e4e2] bg-[#fbfcfb] px-4 py-3.5 outline-none transition focus:border-[#1b7772]"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-[24px] border border-[#d9e7e5] bg-[#f0f7f6] p-5 sm:p-6">
              <div className="flex gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#123f3d] text-[#ffd34e]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-[#173c3a]">
                    {property.cancellationPolicy === 'moderate'
                      ? 'Moderate cancellation'
                      : property.cancellationPolicy === 'strict'
                        ? 'Strict cancellation'
                        : 'Flexible cancellation'}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#657674]">
                    {policyText(
                      property.cancellationPolicy
                    )}
                  </p>
                </div>
              </div>
            </section>

            {error && (
              <div className="rounded-2xl border border-[#f1d2c9] bg-[#fff7f4] px-4 py-3 text-sm font-semibold text-[#a74a36]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !property.isAvailable || checkingAvailability || dateAvailability === 'unavailable'}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#123f3d] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[#123f3d]/15 transition hover:-translate-y-0.5 hover:bg-[#0d3432] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Sending booking request…</>
              ) : checkingAvailability || dateAvailability === 'checking' ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Checking availability…</>
              ) : dateAvailability === 'unavailable' ? (
                <>Choose different dates</>
              ) : (
                <>Complete booking request<Send className="h-4 w-4" /></>
              )}
            </button>

            <p className="text-center text-xs leading-5 text-[#7c8c8a]">
              No extra checkout page. Your request is submitted directly to StayGuwahati and the host for confirmation.
            </p>
          </form>

          <aside className="h-fit lg:sticky lg:top-20">
            <div className="overflow-hidden rounded-[26px] border border-[#cfe1de] bg-white shadow-[0_18px_48px_rgba(18,63,61,0.10)]">
              <div className="bg-[#123f3d] px-5 py-5 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9cd9d3]">
                  Reservation summary
                </p>
                <h2 className="mt-1 text-xl font-black">
                  Your stay at a glance
                </h2>
              </div>

              <div className="p-5">
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#70807e]">
                      Price per night
                    </span>
                    <b>{money(property.pricePerNight)}</b>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#70807e]">
                      Nights
                    </span>
                    <b>{nights || '—'}</b>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#70807e]">
                      Guests
                    </span>
                    <b>{guests}</b>
                  </div>
                </div>

                <div className="my-5 border-t border-dashed border-[#cfe0de]" />

                <div className="flex items-end justify-between gap-4">
                  <span className="text-xs font-bold text-[#748482]">
                    Estimated total
                    <br />
                    <small className="font-medium text-[#93a09e]">
                      Before applicable taxes
                    </small>
                  </span>
                  <b className="text-2xl">
                    {money(total)}
                  </b>
                </div>

                <div className="mt-5 rounded-2xl bg-[#f6f9f8] p-4">
                  <p className="text-xs font-black text-[#173c3a]">
                    What happens next?
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#657674]">
                    Submit your request on this page. Once the booking is created, you will be taken directly to your booking confirmation.
                  </p>
                </div>

                <div className="mt-5 space-y-2 border-t border-[#e5eeec] pt-5 text-xs text-[#5e706e]">
                  {[
                    'Verified local stays',
                    'Secure reservation process',
                    'Local support when you need it',
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2"
                    >
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#e7f4f1] text-[#1b7772]">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
        <main className="grid min-h-screen place-items-center bg-[#f6f7f5]">
          <Loader2 className="h-8 w-8 animate-spin text-[#1b7772]" />
        </main>
      }
    >
      <BookingContent />
    </Suspense>
  );
}

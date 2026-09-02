'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CalendarDays, Check, ChevronLeft, ChevronRight, Loader2, MapPin, ShieldCheck, Users } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://stayguwahati-backend.onrender.com';

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

const today = () => new Date().toISOString().slice(0, 10);
const futureDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
const money = (value: number) => `₹${Math.max(0, Number(value) || 0).toLocaleString('en-IN')}`;
const imageUrl = (value?: string) => !value ? '' : /^https?:\/\//i.test(value) ? value : `${BACKEND_URL}${value.startsWith('/') ? '' : '/'}${value}`;

function policyText(policy?: string) {
  if (policy === 'moderate') return 'Free cancellation up to 5 days before check-in.';
  if (policy === 'strict') return 'Cancellation is subject to the host policy.';
  return 'Free cancellation up to 24 hours before check-in.';
}

function BookStayContent() {
  const params = useSearchParams();
  const router = useRouter();

  const queryId = params.get('id') || params.get('propertyId') || params.get('property_id') || '';
  const [propertyId, setPropertyId] = useState(queryId);
  const [storedBooking, setStoredBooking] = useState<PendingBooking | null>(null);
  const [property, setProperty] = useState<Homestay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [checkIn, setCheckIn] = useState(params.get('checkIn') || today());
  const [checkOut, setCheckOut] = useState(params.get('checkOut') || futureDate(2));
  const [guests, setGuests] = useState(Math.max(1, Number(params.get('guests')) || 2));

  useEffect(() => {
    let stored: PendingBooking | null = null;
    try {
      const raw = sessionStorage.getItem('pendingBooking');
      if (raw) stored = JSON.parse(raw);
    } catch {
      sessionStorage.removeItem('pendingBooking');
    }
    setStoredBooking(stored);

    const storedId = stored?.id || stored?._id || stored?.propertyId || '';
    const resolvedId = queryId || storedId;
    setPropertyId(resolvedId);

    // Repair old /book-stay links by restoring the id from session storage.
    if (!queryId && storedId) {
      const next = new URLSearchParams(params.toString());
      next.set('id', storedId);
      router.replace(`/book-stay?${next.toString()}`);
    }
  }, [queryId, params, router]);

  useEffect(() => {
    if (!propertyId) {
      setLoading(false);
      setError('We could not find the property for this reservation. Please return to the property page and try again.');
      return;
    }

    const controller = new AbortController();

    async function loadProperty() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${BACKEND_URL}/api/homestays/${encodeURIComponent(propertyId)}`, {
          cache: 'no-store',
          signal: controller.signal,
          headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
        });

        if (!response.ok) throw new Error('Unable to load this property.');

        const raw = await response.json();
        const item = raw?.data || raw?.homestay || raw;
        if (!item || !(item._id || item.id)) throw new Error('Property was not found.');

        const normalized: Homestay = {
          _id: String(item._id || item.id),
          title: item.title || item.name || 'Homestay',
          locality: item.locality || item.city || item.address || 'Guwahati',
          location: item.location || item.state || 'Guwahati, Assam',
          pricePerNight: Number(item.pricePerNight || item.price || item.rate || 0),
          images: Array.isArray(item.images) && item.images.length ? item.images : item.image ? [item.image] : [],
          image: item.image || '',
          cancellationPolicy: item.cancellationPolicy || 'flexible',
          isAvailable: item.isAvailable !== false,
        };

        setProperty(normalized);
        sessionStorage.setItem('pendingBooking', JSON.stringify({
          id: normalized._id,
          title: normalized.title,
          locality: normalized.locality,
          location: normalized.location,
          price: normalized.pricePerNight,
          image: normalized.images?.[0] || normalized.image || '',
          images: normalized.images || [],
          cancellationPolicy: normalized.cancellationPolicy,
        }));
      } catch (err: any) {
        if (err?.name === 'AbortError') return;

        // API fallback: use the hand-off data saved by property-details.
        const fallbackId = storedBooking?.id || storedBooking?._id || storedBooking?.propertyId || '';
        if (fallbackId && fallbackId === propertyId) {
          setProperty({
            _id: fallbackId,
            title: storedBooking?.title || 'Homestay',
            locality: storedBooking?.locality || storedBooking?.location || 'Guwahati',
            location: storedBooking?.location || 'Guwahati, Assam',
            pricePerNight: Number(storedBooking?.pricePerNight ?? storedBooking?.price ?? 0),
            images: storedBooking?.images?.length ? storedBooking.images : storedBooking?.image ? [storedBooking.image] : [],
            image: storedBooking?.image || '',
            cancellationPolicy: storedBooking?.cancellationPolicy || 'flexible',
            isAvailable: true,
          });
        } else {
          setError(err?.message || 'Unable to load this property.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
    return () => controller.abort();
  }, [propertyId, storedBooking]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);
    const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  const total = property ? property.pricePerNight * nights : 0;

  const continueToCheckout = () => {
    if (!property) return;
    if (!checkIn || !checkOut || nights < 1) {
      setError('Please select a valid check-in and check-out date.');
      return;
    }

    const query = new URLSearchParams({
      id: property._id,
      propertyId: property._id,
      checkIn,
      checkOut,
      guests: String(guests),
    });
    router.push(`/checkout?${query.toString()}`);
  };

  const updateCheckIn = (value: string) => {
    setCheckIn(value);
    if (!checkOut || value >= checkOut) {
      const next = new Date(`${value}T00:00:00`);
      next.setDate(next.getDate() + 1);
      setCheckOut(next.toISOString().slice(0, 10));
    }
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f7f5] text-[#173c3a]">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#123f3d] shadow-lg shadow-[#123f3d]/15">
            <Loader2 className="h-6 w-6 animate-spin text-[#ffd34e]" />
          </div>
          <p className="mt-4 text-sm font-bold text-[#58706e]">Preparing your stay…</p>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="sg-shell min-h-screen bg-[#f6f7f5] px-5 py-8 text-[#173c3a]">
        <div className="mx-auto max-w-xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#1b7772]">
            <ArrowLeft className="h-4 w-4" /> Back to stays
          </Link>
          <div className="mt-8 rounded-[28px] border border-[#d8e7e5] bg-white p-8 text-center shadow-[0_18px_50px_rgba(18,63,61,0.08)]">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#123f3d] font-black text-[#ffd34e]">!</div>
            <h1 className="mt-5 text-2xl font-black">Reservation unavailable</h1>
            <p className="mt-3 text-sm leading-6 text-[#607170]">{error || 'Property not found.'}</p>
            <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#123f3d] px-5 py-3 text-sm font-black text-white">
              Explore stays <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const image = imageUrl(property.images?.[0] || property.image);

  return (
    <main className="min-h-screen bg-[#f6f7f5] pb-10 text-[#173c3a]">
      <header className="sticky top-0 z-40 border-b border-[#d8e5e3] bg-[#f6f7f5]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-black tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0f706c] text-lg shadow-sm">🏠</span>
            <span className="text-base sm:text-lg">Stay<span className="text-[#1b7772]">Guwahati</span></span>
          </Link>
          <button type="button" onClick={() => router.back()} className="inline-flex items-center gap-2 rounded-full border border-[#cfe0de] bg-white px-3.5 py-2 text-xs font-black text-[#234846]">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <button type="button" onClick={() => router.back()} className="mb-5 hidden items-center gap-2 text-sm font-bold text-[#1b7772] md:inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to property
        </button>

        <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#103c3a] via-[#164b48] to-[#0e2f31] px-5 py-7 text-white shadow-[0_22px_60px_rgba(18,63,61,0.16)] sm:px-8 sm:py-9">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#74bdb7]/40 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#a7e4de]">
              <ShieldCheck className="h-3.5 w-3.5" /> Reservation request
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Plan your stay in Guwahati.</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#c8d9d7]">Choose your dates and guests, then review everything before checkout.</p>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-5">
            <div className="rounded-[24px] border border-[#d9e7e5] bg-white p-4 shadow-[0_14px_40px_rgba(18,63,61,0.06)] sm:p-5">
              <div className="flex gap-4">
                {image ? <img src={image} alt={property.title} className="h-24 w-28 shrink-0 rounded-2xl object-cover sm:h-28 sm:w-36" /> : <div className="h-24 w-28 shrink-0 rounded-2xl bg-[#e9f0ef] sm:h-28 sm:w-36" />}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1b7772]">Your selected stay</p>
                  <h2 className="mt-1 truncate text-xl font-black sm:text-2xl">{property.title}</h2>
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-[#61716f]"><MapPin className="h-4 w-4 shrink-0 text-[#d59b19]" /><span className="truncate">{property.locality || property.location || 'Guwahati'}</span></div>
                  <p className="mt-3 text-sm font-black text-[#173c3a]">{money(property.pricePerNight)}<span className="font-medium text-[#7a8987]"> / night</span></p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#d9e7e5] bg-white p-5 shadow-[0_14px_40px_rgba(18,63,61,0.06)] sm:p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1b7772]">Stay details</p>
              <h2 className="mt-1 text-xl font-black">When are you staying?</h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="rounded-2xl border border-[#d6e4e2] bg-[#fbfcfb] p-4 focus-within:border-[#1b7772]">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#71817f]"><CalendarDays className="h-4 w-4 text-[#1b7772]" /> Check-in</span>
                  <input type="date" min={today()} value={checkIn} onChange={(e) => updateCheckIn(e.target.value)} className="mt-2 w-full bg-transparent text-sm font-black text-[#173c3a] outline-none" />
                </label>
                <label className="rounded-2xl border border-[#d6e4e2] bg-[#fbfcfb] p-4 focus-within:border-[#1b7772]">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#71817f]"><CalendarDays className="h-4 w-4 text-[#1b7772]" /> Check-out</span>
                  <input type="date" min={checkIn || today()} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="mt-2 w-full bg-transparent text-sm font-black text-[#173c3a] outline-none" />
                </label>
              </div>

              <label className="mt-4 block rounded-2xl border border-[#d6e4e2] bg-[#fbfcfb] p-4 focus-within:border-[#1b7772]">
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#71817f]"><Users className="h-4 w-4 text-[#1b7772]" /> Guests</span>
                <select value={guests} onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))} className="mt-2 w-full bg-transparent text-sm font-black text-[#173c3a] outline-none">
                  {[1,2,3,4,5,6,7,8].map((count) => <option key={count} value={count}>{count} {count === 1 ? 'guest' : 'guests'}</option>)}
                </select>
              </label>

              {error && <div className="mt-4 rounded-2xl border border-[#f1d2c9] bg-[#fff7f4] px-4 py-3 text-sm font-semibold text-[#a74a36]">{error}</div>}
            </div>

            <div className="rounded-[24px] border border-[#d9e7e5] bg-[#f0f7f6] p-5 sm:p-6">
              <div className="flex gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#123f3d] text-[#ffd34e]"><ShieldCheck className="h-5 w-5" /></div>
                <div>
                  <h3 className="font-black text-[#173c3a]">{property.cancellationPolicy === 'moderate' ? 'Moderate cancellation' : property.cancellationPolicy === 'strict' ? 'Strict cancellation' : 'Flexible cancellation'}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#657674]">{policyText(property.cancellationPolicy)}</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="h-fit lg:sticky lg:top-20">
            <div className="overflow-hidden rounded-[26px] border border-[#cfe1de] bg-white shadow-[0_18px_48px_rgba(18,63,61,0.10)]">
              <div className="bg-[#123f3d] px-5 py-5 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9cd9d3]">Reservation summary</p>
                <h2 className="mt-1 text-xl font-black">Your stay at a glance</h2>
              </div>
              <div className="p-5">
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between gap-4"><span className="text-[#70807e]">Price per night</span><b>{money(property.pricePerNight)}</b></div>
                  <div className="flex justify-between gap-4"><span className="text-[#70807e]">Nights</span><b>{nights || '—'}</b></div>
                  <div className="flex justify-between gap-4"><span className="text-[#70807e]">Guests</span><b>{guests}</b></div>
                </div>
                <div className="my-5 border-t border-dashed border-[#cfe0de]" />
                <div className="flex items-end justify-between gap-4"><span className="text-xs font-bold text-[#748482]">Estimated total<br /><small className="font-medium text-[#93a09e]">Before applicable taxes</small></span><b className="text-2xl">{money(total)}</b></div>
                <button type="button" disabled={!property.isAvailable || nights < 1} onClick={continueToCheckout} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ffd34e] px-5 py-4 text-sm font-black text-[#193635] shadow-lg shadow-[#d59b19]/15 transition hover:-translate-y-0.5 hover:bg-[#ffca32] disabled:cursor-not-allowed disabled:opacity-50">
                  Continue to checkout <ChevronRight className="h-4 w-4" />
                </button>
                <p className="mt-4 text-center text-[11px] leading-5 text-[#879593]">You will review the final details before payment.</p>
                <div className="mt-5 space-y-2 border-t border-[#e5eeec] pt-5 text-xs text-[#5e706e]">
                  {['Verified local stays','Secure reservation process','Local support when you need it'].map((item) => <div key={item} className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#e7f4f1] text-[#1b7772]"><Check className="h-3 w-3 stroke-[3]" /></span>{item}</div>)}
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
    <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#f6f7f5]"><Loader2 className="h-8 w-8 animate-spin text-[#1b7772]" /></main>}>
      <BookStayContent />
    </Suspense>
  );
}

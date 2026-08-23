// app/checkout/page.tsx
'use client';

import React, { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://stayguwahati-backend.onrender.com';

interface Homestay {
  _id: string;
  title: string;
  locality?: string;
  pricePerNight: number;
  images?: string[];
}

const dateLabel = (value: string) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
};

function CheckoutContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id') || '';
  const [property, setProperty] = useState<Homestay | null>(null);
  const [checkIn, setCheckIn] = useState(params.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(params.get('checkOut') || '');
  const [guests, setGuests] = useState(Number(params.get('guests')) || 2);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) { setError('Property information is missing.'); setLoading(false); return; }
    fetch(`${BACKEND_URL}/api/homestays/${id}`)
      .then(async r => { if (!r.ok) throw new Error('Unable to load property.'); return r.json(); })
      .then(raw => {
        const p = raw.data || raw.homestay || raw;
        setProperty({
          _id: p._id || p.id,
          title: p.title || p.name || 'Homestay',
          locality: p.locality || p.city || 'Guwahati',
          pricePerNight: Number(p.pricePerNight || p.price || 0),
          images: Array.isArray(p.images) ? p.images : []
        });
      })
      .catch(e => setError(e.message || 'Unable to load property.'))
      .finally(() => setLoading(false));
  }, [id]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const n = Math.ceil((new Date(`${checkOut}T00:00:00`).getTime() - new Date(`${checkIn}T00:00:00`).getTime()) / 86400000);
    return n > 0 ? n : 0;
  }, [checkIn, checkOut]);

  const total = property ? property.pricePerNight * nights : 0;

  async function submitBooking(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!property || !checkIn || !checkOut || nights < 1) return setError('Please select valid check-in and check-out dates.');
    if (!fullName.trim() || !email.trim() || !phone.trim()) return setError('Please complete your name, email and phone number.');
    setSubmitting(true);
    try {
      const profile = JSON.parse(localStorage.getItem('userProfile') || sessionStorage.getItem('userProfile') || '{}');
      const res = await fetch(`${BACKEND_URL}/api/bookings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homestayId: property._id, checkIn, checkOut, guests,
          fullName: fullName.trim(), email: email.trim(), phone: phone.trim(),
          specialRequests: specialRequests.trim(), userId: profile?._id || profile?.id || null
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Booking request failed.');
      const bookingId = data.data?._id || data.data?.id || '';
      router.replace(`/booking-confirmation?id=${encodeURIComponent(bookingId)}`);
    } catch (e: any) {
      setError(e.message || 'Unable to submit booking request.');
    } finally { setSubmitting(false); }
  }

  if (loading) return <main className="min-h-screen grid place-items-center text-slate-500">Loading your stay…</main>;
  if (error && !property) return <main className="min-h-screen grid place-items-center p-6"><div className="max-w-md text-center"><p className="text-red-600 font-semibold">{error}</p><button onClick={() => router.back()} className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-white font-bold">Go Back</button></div></main>;

  return <main className="min-h-screen bg-slate-50 py-8 px-4 sm:py-12">
    <div className="mx-auto max-w-5xl">
      <button onClick={() => router.back()} className="mb-5 text-sm font-bold text-slate-600 hover:text-teal-700">← Back to property</button>
      <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <form onSubmit={submitBooking} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <div className="mb-7"><p className="text-xs font-black uppercase tracking-widest text-teal-600">Request your stay</p><h1 className="mt-2 text-3xl font-black text-slate-950">Guest details</h1><p className="mt-2 text-sm text-slate-500">No online payment is required. Your request will be sent to the host for approval.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-slate-600">Full name *</span><input required value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500" placeholder="Your full name" /></label>
            <label><span className="mb-1.5 block text-xs font-bold text-slate-600">Email *</span><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500" placeholder="you@example.com" /></label>
            <label><span className="mb-1.5 block text-xs font-bold text-slate-600">Phone *</span><input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500" placeholder="10-digit mobile number" /></label>
            <label><span className="mb-1.5 block text-xs font-bold text-slate-600">Check-in *</span><input required type="date" min={new Date().toISOString().split('T')[0]} value={checkIn} onChange={e=>setCheckIn(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500" /></label>
            <label><span className="mb-1.5 block text-xs font-bold text-slate-600">Check-out *</span><input required type="date" min={checkIn || new Date().toISOString().split('T')[0]} value={checkOut} onChange={e=>setCheckOut(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500" /></label>
            <label><span className="mb-1.5 block text-xs font-bold text-slate-600">Guests *</span><select value={guests} onChange={e=>setGuests(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"><option value={1}>1 guest</option><option value={2}>2 guests</option><option value={3}>3 guests</option><option value={4}>4 guests</option><option value={5}>5+ guests</option></select></label>
            <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-slate-600">Special requests <span className="font-normal text-slate-400">(optional)</span></span><textarea value={specialRequests} onChange={e=>setSpecialRequests(e.target.value)} rows={4} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500" placeholder="Arrival time, accessibility needs, etc." /></label>
          </div>
          {error && <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
          <button disabled={submitting} className="mt-6 w-full rounded-xl bg-teal-600 py-3.5 text-sm font-black text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700 disabled:opacity-60">{submitting ? 'Sending request…' : 'Request Booking'}</button>
        </form>

        <aside className="h-fit rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6 lg:sticky lg:top-6">
          {property?.images?.[0] && <img src={property.images[0]} alt={property.title} className="h-48 w-full rounded-2xl object-cover" />}
          <h2 className="mt-4 text-xl font-black text-slate-950">{property?.title}</h2><p className="mt-1 text-sm text-slate-500">📍 {property?.locality}, Guwahati</p>
          <div className="mt-5 border-t border-slate-100 pt-5 space-y-3 text-sm"><div className="flex justify-between"><span className="text-slate-500">Check-in</span><b>{dateLabel(checkIn)}</b></div><div className="flex justify-between"><span className="text-slate-500">Check-out</span><b>{dateLabel(checkOut)}</b></div><div className="flex justify-between"><span className="text-slate-500">Guests</span><b>{guests}</b></div></div>
          <div className="mt-5 border-t border-slate-100 pt-5"><div className="flex justify-between text-sm"><span>₹{property?.pricePerNight.toLocaleString('en-IN')} × {nights || 0} nights</span><b>₹{total.toLocaleString('en-IN')}</b></div><div className="mt-3 flex justify-between text-lg font-black"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div><p className="mt-3 text-xs text-slate-400">Payment is arranged directly with the host. StayGuwahati does not collect payment online.</p></div>
        </aside>
      </div>
    </div>
  </main>;
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 px-4 py-16">
          <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Loading booking details...
            </p>
          </div>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
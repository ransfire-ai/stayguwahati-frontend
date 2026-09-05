 'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Bath, BedDouble, CalendarDays, Check, ChevronLeft,
  ChevronRight, Copy, Heart, Home, ImageIcon, MapPin, MessageCircle,
  ShieldCheck, Share2, Star, UserRound, Users, Wifi, X
} from 'lucide-react';

type Host = {
  name?: string; email?: string; phone?: string; avatar?: string;
  photo?: string; image?: string; profileImage?: string; profilePicture?: string;
  isVerified?: boolean;
};

type Property = {
  id?: string; _id?: string; title?: string; name?: string;
  pricePerNight?: number | string; price?: number | string;
  locality?: string; city?: string; address?: string; description?: string;
  images?: string[]; features?: string[]; amenities?: string[];
  bedrooms?: number | string; guests?: number | string; maxGuests?: number | string;
  bathrooms?: any; bathroomCount?: number | string; bathroomsCount?: number | string;
  numberOfBathrooms?: number | string; rating?: number; reviewsCount?: number;
  host?: Host | string; cancellationPolicy?: string; mapUrl?: string; googleMapsLink?: string;
};

type Review = {
  _id?: string; guestName?: string; rating?: number; comment?: string; createdAt?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || 'https://stayguwahati-backend.onrender.com';
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85',
];

function cleanImage(src: string) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src) || src.startsWith('data:')) return src;
  return `${API}${src.startsWith('/') ? '' : '/'}${src}`;
}

function countOf(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function cancellation(policy?: string) {
  const p = String(policy || 'flexible').toLowerCase();
  if (p === 'strict') return { name: 'Strict', text: 'Cancellation is limited. Contact support for help with changes.' };
  if (p === 'moderate') return { name: 'Moderate', text: 'Free cancellation may be available up to 5 days before check-in.' };
  return { name: 'Flexible', text: 'Free cancellation may be available up to 24 hours before check-in.' };
}

function PropertyDetailsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const propertyId = params.get('id');

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selected, setSelected] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true); setLoadError('');
      let prop: Property | null = null;
      try {
        if (propertyId && propertyId !== 'default') {
          const res = await fetch(`${API}/api/homestays/${encodeURIComponent(propertyId)}`, { cache: 'no-store' });
          if (res.ok) {
            const raw = await res.json();
            prop = raw?.data || raw;
          }
        }
      } catch (e) {
        console.warn('Property fetch failed', e);
      }

      if (!prop && typeof window !== 'undefined') {
        try {
          const cached = sessionStorage.getItem('selectedProperty');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (!propertyId || String(parsed?._id || parsed?.id) === propertyId) prop = parsed;
          }
          if (!prop) {
            const list = JSON.parse(localStorage.getItem('userProperties') || '[]');
            if (Array.isArray(list)) prop = list.find((p: Property) => String(p?._id || p?.id) === propertyId) || null;
          }
        } catch {}
      }

      if (!prop && params.get('title')) {
        prop = {
          id: propertyId || 'default',
          title: params.get('title') || 'StayGuwahati Home',
          locality: params.get('locality') || 'Guwahati',
          pricePerNight: params.get('price') || 1500,
          description: 'A comfortable local stay in Guwahati.',
          images: params.get('image') ? [params.get('image') as string] : []
        };
      }

      if (!prop) {
        if (alive) { setLoadError('We could not load this property. Please check your connection and try again.'); setLoading(false); }
        return;
      }

      const rawImages = Array.isArray(prop.images) ? prop.images.filter(Boolean).map(cleanImage) : [];
      prop.images = rawImages.length ? rawImages : FALLBACK_IMAGES;
      if (alive) { setProperty(prop); setSelected(0); setLoading(false); }
    }
    load();
    return () => { alive = false; };
  }, [propertyId, params]);

  useEffect(() => {
    let alive = true;
    async function loadReviews() {
      if (!propertyId) { setReviewsLoading(false); return; }
      try {
        const res = await fetch(`${API}/api/reviews?propertyId=${encodeURIComponent(propertyId)}`, { cache: 'no-store' });
        const raw = await res.json();
        const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        if (alive) setReviews(list);
      } catch {
        if (alive) setReviews([]);
      } finally {
        if (alive) setReviewsLoading(false);
      }
    }
    loadReviews();
    return () => { alive = false; };
  }, [propertyId]);

  useEffect(() => {
    if (!propertyId) return;
    try {
      const list = JSON.parse(localStorage.getItem('stayguwahati_wishlist') || '[]');
      setSaved(Array.isArray(list) && list.includes(propertyId));
    } catch {}
  }, [propertyId]);

  const derived = useMemo(() => {
    if (!property) return null;
    const b = countOf(property.bedrooms);
    const bathObj = property.bathrooms && typeof property.bathrooms === 'object' ? property.bathrooms : {};
    const bath = countOf(bathObj.total ?? bathObj.count ?? property.bathroomCount ?? property.bathroomsCount ?? property.numberOfBathrooms) ||
      countOf(bathObj.privateAttached) + countOf(bathObj.attached) + countOf(bathObj.dedicated) + countOf(bathObj.shared);
    const guests = countOf(property.maxGuests ?? property.guests) || 2;
    const price = Number(property.pricePerNight ?? property.price ?? 1500) || 1500;
    const amenities = Array.from(new Set((property.features || property.amenities || ['Free Wi-Fi', 'Comfortable stay', 'Local host']).filter(Boolean)));
    const host = typeof property.host === 'string' ? { name: property.host } : (property.host || {});
    const hostName = host.name || 'StayGuwahati Host';
    const avatar = cleanImage(host.avatar || host.photo || host.image || host.profileImage || host.profilePicture || '') ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(hostName)}&background=173f3a&color=fff&size=128`;
    return { b, bath, guests, price, amenities, host, hostName, avatar, policy: cancellation(property.cancellationPolicy) };
  }, [property]);

  function toggleSave() {
    if (!propertyId) { setSaved(v => !v); return; }
    try {
      const old = JSON.parse(localStorage.getItem('stayguwahati_wishlist') || '[]');
      const list = Array.isArray(old) ? old : [];
      const next = list.includes(propertyId) ? list.filter((x: string) => x !== propertyId) : [...list, propertyId];
      localStorage.setItem('stayguwahati_wishlist', JSON.stringify(next));
      setSaved(next.includes(propertyId));
    } catch { setSaved(v => !v); }
  }

  async function share() {
    const url = window.location.href;
    const data = { title: property?.title || 'StayGuwahati', text: 'Check out this stay on StayGuwahati', url };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    } catch {}
  }

  function book() {
    if (!property || !derived) return;
    const id = String(property._id || property.id || propertyId || '');
    if (!id) { alert('This property is missing its booking ID. Please return to Explore and open it again.'); return; }
    const data = { id, title: property.title || property.name || 'Stay', price: derived.price, locality: property.locality || property.city || 'Guwahati', image: property.images?.[selected] || property.images?.[0] || '' };
    sessionStorage.setItem('pendingBooking', JSON.stringify(data));
    router.push(`/book-stay?id=${encodeURIComponent(id)}`);
  }

  if (loading) return <main className="min-h-[70vh] grid place-items-center bg-[#f5f1e9]"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#d6e0da] border-t-[#28655c]" /><p className="mt-4 text-sm font-semibold text-[#62736e]">Loading your stay…</p></div></main>;

  if (!property || !derived) return <main className="min-h-[70vh] grid place-items-center bg-[#f5f1e9] px-5"><div className="max-w-md rounded-3xl border border-[#d7ded8] bg-white p-8 text-center shadow-sm"><MapPin className="mx-auto h-10 w-10 text-[#28655c]"/><h1 className="mt-4 text-2xl font-black">Stay not found</h1><p className="mt-2 text-sm text-[#71827d]">{loadError || 'This property is currently unavailable.'}</p><Link href="/explore" className="mt-6 inline-flex rounded-xl bg-[#173f3a] px-5 py-3 text-sm font-bold text-white">Explore stays</Link></div></main>;

  const images = property.images || FALLBACK_IMAGES;
  const mapQuery = encodeURIComponent(`${property.title || property.name || 'Homestay'} ${property.address || property.locality || property.city || 'Guwahati'}, Assam`);
  const mapHref = property.mapUrl || property.googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const rating = Number(property.rating || (reviews.length ? reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length : 0));

  return (
    <main className="bg-[#f5f1e9] text-[#173f3a]">
      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-bold text-[#46625c] hover:text-[#173f3a]"><ArrowLeft className="h-4 w-4"/> Back to explore</button>
          <div className="flex gap-2">
            <button onClick={share} className="rounded-full border border-[#d5ddd8] bg-white p-2.5 text-[#173f3a] hover:border-[#28655c]" aria-label="Share"><Share2 className="h-4 w-4"/></button>
            <button onClick={toggleSave} className={`rounded-full border p-2.5 ${saved ? 'border-[#cba848] bg-[#fff4c7] text-[#8a6510]' : 'border-[#d5ddd8] bg-white'}`} aria-label="Save"><Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`}/></button>
          </div>
        </div>

        <header className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#e4efe9] px-3 py-1 text-[10px] font-black uppercase tracking-[.16em] text-[#28655c]"><ShieldCheck className="h-3.5 w-3.5"/> Local stay · Guwahati</div>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{property.title || property.name || 'StayGuwahati Home'}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#637670]">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#28655c]"/>{property.locality || property.city || 'Guwahati'}, Assam</span>
              <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-[#e0ad36] text-[#e0ad36]"/>{rating > 0 ? rating.toFixed(1) : 'New'} {reviews.length ? `· ${reviews.length} reviews` : ''}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full border border-[#d6ded9] bg-white px-3 py-2"><BedDouble className="mr-1 inline h-3.5 w-3.5"/> {derived.b || '—'} bedrooms</span><span className="rounded-full border border-[#d6ded9] bg-white px-3 py-2"><Bath className="mr-1 inline h-3.5 w-3.5"/> {derived.bath || '—'} bathrooms</span><span className="rounded-full border border-[#d6ded9] bg-white px-3 py-2"><Users className="mr-1 inline h-3.5 w-3.5"/> Up to {derived.guests} guests</span></div>
        </header>

        <section className="grid h-[440px] gap-2 overflow-hidden rounded-[32px] bg-[#dfe5e1] p-2 sm:h-[560px] md:grid-cols-4 md:grid-rows-2">
          <button onClick={() => {setSelected(0);setGalleryOpen(true)}} className="relative min-h-[230px] overflow-hidden rounded-[24px] md:col-span-2 md:row-span-2"><img src={images[0]} alt={property.title || 'Property'} className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"/><span className="absolute bottom-4 left-4 rounded-full bg-[#173f3a]/90 px-3 py-2 text-xs font-black text-white">Featured view</span></button>
          {images.slice(1,4).map((img, i) => <button key={img+i} onClick={() => {setSelected(i+1);setGalleryOpen(true)}} className={`relative hidden overflow-hidden rounded-[22px] md:block ${i === 2 ? 'row-span-2' : ''}`}><img src={img} alt={`Property view ${i+2}`} className="h-full w-full object-cover transition duration-500 hover:scale-[1.04]"/></button>)}
          <button onClick={() => setGalleryOpen(true)} className="absolute hidden" />
          <div className="flex gap-2 overflow-x-auto p-1 md:hidden">{images.map((img,i)=><button key={img+i} onClick={()=>{setSelected(i);setGalleryOpen(true)}} className="h-16 w-20 shrink-0 overflow-hidden rounded-xl"><img src={img} alt="" className="h-full w-full object-cover"/></button>)}</div>
          <button onClick={() => setGalleryOpen(true)} className="absolute right-7 top-[455px] hidden rounded-full bg-white px-4 py-2 text-xs font-black shadow-lg md:inline-flex items-center gap-2"><ImageIcon className="h-4 w-4"/> View all {images.length} photos</button>
        </section>

        <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_410px]">
          <div className="space-y-8">
            <section className="rounded-[28px] border border-[#d9e0db] bg-white p-6 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#28655c]">About this stay</p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">A comfortable base for your Guwahati visit</h2>
              <p className="mt-5 max-w-3xl text-[15px] leading-8 text-[#60716c]">{property.description || 'Enjoy a comfortable stay hosted locally in Guwahati.'}</p>
            </section>

            <section className="rounded-[28px] border border-[#d9e0db] bg-white p-6 sm:p-8">
              <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#28655c]">What’s included</p><h2 className="mt-2 text-2xl font-black">Amenities & highlights</h2></div><Wifi className="hidden h-7 w-7 text-[#28655c] sm:block"/></div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">{derived.amenities.map((a,i)=><div key={a+i} className="flex items-center gap-3 rounded-2xl bg-[#f4f7f4] p-4 text-sm font-bold"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#dcece4] text-[#28655c]"><Check className="h-4 w-4"/></span>{a}</div>)}</div>
            </section>

            <section className="rounded-[28px] border border-[#d9e0db] bg-white p-6 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#28655c]">Hosted locally</p><h2 className="mt-2 text-2xl font-black">Meet your host</h2>
              <div className="mt-6 flex flex-col gap-5 rounded-3xl bg-[#f4f7f4] p-5 sm:flex-row sm:items-center"><img src={derived.avatar} alt={derived.hostName} className="h-16 w-16 rounded-2xl object-cover"/><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{derived.hostName}</h3>{derived.host.isVerified && <span className="rounded-full bg-[#dcece4] px-2.5 py-1 text-[10px] font-black text-[#28655c]">Verified host</span>}</div><p className="mt-1 text-sm text-[#70817b]">Local host on StayGuwahati</p></div><span className="inline-flex items-center gap-2 text-xs font-bold text-[#28655c]"><UserRound className="h-4 w-4"/> Host profile</span></div>
            </section>

            <section className="rounded-[28px] border border-[#d9e0db] bg-white p-6 sm:p-8">
              <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#28655c]">Guest feedback</p><h2 className="mt-2 text-2xl font-black">Reviews</h2></div><div className="rounded-2xl bg-[#fff2bd] px-4 py-3 text-sm font-black"><Star className="mr-1 inline h-4 w-4 fill-[#d69f22] text-[#d69f22]"/>{rating > 0 ? rating.toFixed(1) : 'New'}</div></div>
              <div className="mt-6 space-y-3">{reviewsLoading ? <p className="text-sm text-[#71827d]">Loading guest reviews…</p> : reviews.length ? reviews.slice(0,4).map((r,i)=><article key={r._id || i} className="rounded-2xl border border-[#e1e6e2] p-5"><div className="flex justify-between gap-3"><strong className="text-sm">{r.guestName || 'Verified guest'}</strong><span className="text-xs text-[#d69f22]">{'★'.repeat(Math.max(0,Math.min(5,Number(r.rating||0))))}</span></div><p className="mt-3 text-sm leading-6 text-[#657670]">{r.comment || 'No written comment provided.'}</p></article>) : <div className="rounded-2xl bg-[#f4f7f4] p-5 text-sm text-[#71827d]">No reviews yet. This stay is ready for its first guest feedback.</div>}</div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-[28px] border border-[#d9e0db] bg-white p-6"><p className="text-xs font-black uppercase tracking-[.18em] text-[#28655c]">Location</p><h2 className="mt-2 text-2xl font-black">Explore the area</h2><p className="mt-3 text-sm leading-6 text-[#71827d]">{property.address || `${property.locality || property.city || 'Guwahati'}, Assam`}</p><a href={mapHref} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#b9cec4] px-4 py-3 text-sm font-black text-[#28655c] hover:bg-[#e8f1ec]"><MapPin className="h-4 w-4"/> Open in Maps</a></div>
              <div className="rounded-[28px] bg-[#173f3a] p-6 text-white"><p className="text-xs font-black uppercase tracking-[.18em] text-[#b7d4c8]">Stay rules</p><h2 className="mt-2 text-2xl font-black">Good to know</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-[#d2e0da]"><li className="flex gap-2"><Check className="mt-1 h-4 w-4 text-[#e9bf52]"/>Follow the host’s check-in instructions.</li><li className="flex gap-2"><Check className="mt-1 h-4 w-4 text-[#e9bf52]"/>Respect the property and local neighbourhood.</li><li className="flex gap-2"><Check className="mt-1 h-4 w-4 text-[#e9bf52]"/>{derived.policy.text}</li></ul></div>
            </section>
          </div>

          <aside className="xl:sticky xl:top-24">
            <div className="overflow-hidden rounded-[32px] border border-[#c9d9d0] bg-white shadow-[0_25px_70px_rgba(23,63,58,.14)]">
              <div className="bg-[#173f3a] p-6 text-white"><p className="text-xs font-black uppercase tracking-[.16em] text-[#b7d4c8]">Reserve this stay</p><div className="mt-3 flex items-end justify-between"><div><span className="text-4xl font-black">₹{derived.price.toLocaleString('en-IN')}</span><span className="ml-1 text-sm text-[#b7d4c8]">/ night</span></div><span className="rounded-full bg-[#e9bf52] px-3 py-1.5 text-[10px] font-black text-[#173f3a]">Verified local stay</span></div></div>
              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#d8e0db]"><div className="border-r border-[#d8e0db] p-4"><p className="text-[10px] font-black uppercase text-[#75857f]">Check-in</p><p className="mt-1 text-sm font-bold">Choose dates</p></div><div className="p-4"><p className="text-[10px] font-black uppercase text-[#75857f]">Check-out</p><p className="mt-1 text-sm font-bold">Choose dates</p></div></div>
                <button onClick={book} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e9bf52] px-5 py-4 text-sm font-black text-[#173f3a] transition hover:brightness-105">Proceed to reservation <ArrowRight className="h-4 w-4"/></button>
                <p className="mt-3 text-center text-xs text-[#71827d]">You will review your booking details before confirming.</p>
                <div className="mt-5 space-y-3 border-t border-[#e1e7e3] pt-5 text-sm"><div className="flex justify-between gap-3"><span className="text-[#71827d]">Cancellation</span><strong className="text-[#28655c]">{derived.policy.name}</strong></div><div className="flex justify-between gap-3"><span className="text-[#71827d]">Hosted by</span><strong>{derived.hostName}</strong></div><div className="flex items-center gap-2 text-xs text-[#71827d]"><ShieldCheck className="h-4 w-4 text-[#28655c]"/> Booking details are reviewed before confirmation.</div></div>
              </div>
            </div>
            <div className="mt-4 rounded-3xl border border-[#d9e0db] bg-white p-5"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e4efe9] text-[#28655c]"><MessageCircle className="h-5 w-5"/></span><div><strong className="text-sm">Need help with this stay?</strong><p className="mt-1 text-xs leading-5 text-[#71827d]">Our support team can help with bookings and property questions.</p><Link href="/support" className="mt-3 inline-block text-xs font-black text-[#28655c]">Contact support →</Link></div></div></div>
          </aside>
        </div>
      </div>

      {galleryOpen && <div className="fixed inset-0 z-[100] bg-[#071f1c]/95 p-4 text-white"><div className="mx-auto flex h-full max-w-7xl flex-col"><div className="flex items-center justify-between py-3"><strong>{property.title || 'Photos'} · {selected+1} / {images.length}</strong><button onClick={()=>setGalleryOpen(false)} className="rounded-full bg-white/10 p-3"><X className="h-5 w-5"/></button></div><div className="relative flex flex-1 items-center justify-center overflow-hidden"><img src={images[selected]} alt="" className="max-h-[78vh] max-w-full rounded-2xl object-contain"/><button onClick={()=>setSelected((selected-1+images.length)%images.length)} className="absolute left-2 rounded-full bg-white/10 p-3"><ChevronLeft/></button><button onClick={()=>setSelected((selected+1)%images.length)} className="absolute right-2 rounded-full bg-white/10 p-3"><ChevronRight/></button></div><div className="flex gap-2 overflow-x-auto py-4">{images.map((img,i)=><button key={img+i} onClick={()=>setSelected(i)} className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${selected===i?'border-[#e9bf52]':'border-transparent'}`}><img src={img} alt="" className="h-full w-full object-cover"/></button>)}</div></div></div>}
      {copied && <div className="fixed bottom-6 left-1/2 z-[101] -translate-x-1/2 rounded-full bg-[#173f3a] px-4 py-3 text-sm font-bold text-white shadow-xl"><Copy className="mr-2 inline h-4 w-4"/> Link copied</div>}
    </main>
  );
}

export default function PropertyDetailsPage() {
  return (
    <div className="min-h-screen bg-[#f5f1e9]">
      <Suspense fallback={<main className="min-h-screen grid place-items-center">Loading stay…</main>}>
        <PropertyDetailsContent />
      </Suspense>
    </div>
  );
}

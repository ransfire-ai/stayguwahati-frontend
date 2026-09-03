'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, Heart, MapPin, Share2, ShieldCheck, Star, Users } from 'lucide-react';
import PropertyImage from '../../components/property/PropertyImage';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    const c = new AbortController();
    (async () => {
      try {
        setLoading(true); setError('');
        let res = await fetch(`${API}/api/homestays/${encodeURIComponent(id)}`, { signal: c.signal, cache: 'no-store' });
        if (!res.ok) res = await fetch(`${API}/api/properties/${encodeURIComponent(id)}`, { signal: c.signal, cache: 'no-store' });
        if (!res.ok) throw new Error('Property details could not be found.');
        const json = await res.json();
        setProperty(json?.data || json?.homestay || json);
      } catch (e:any) { if (e?.name !== 'AbortError') setError(e?.message || 'Unable to load this stay.'); }
      finally { setLoading(false); }
    })();
    return () => c.abort();
  }, [id]);

  const images = useMemo(() => {
    const raw = Array.isArray(property?.images) ? property.images : [];
    const list = raw.length ? raw : [property?.image, property?.imageUrl].filter(Boolean);
    return list.filter(Boolean).slice(0, 4);
  }, [property]);
  const title = property?.title || property?.name || 'Local stay';
  const locality = property?.locality || property?.address || property?.location || 'Guwahati, Assam';
  const bathrooms = typeof property?.bathrooms === 'object' ? (property.bathrooms.total || property.bathrooms.privateAttached || 1) : (property?.bathrooms || 1);
  const price = Number(property?.pricePerNight || property?.price || 0);
  const book = () => router.push(`/book-stay?id=${encodeURIComponent(String(property?._id || id))}`);

  if (loading) return <main className="min-h-screen grid place-items-center bg-[#f7f6f1] text-[#123f3b]"><div className="text-center"><div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#d8e3e0] border-t-[#237c73]"/><p className="mt-4 font-semibold">Loading your stay…</p></div></main>;
  if (error || !property) return <main className="sg-shell min-h-screen bg-[#f7f6f1] px-5 py-20"><Link href="/" className="inline-flex items-center gap-2 font-bold text-[#237c73]"><ArrowLeft size={18}/>Back to stays</Link><div className="mt-8 max-w-xl border border-[#d8e3e0] bg-[#fcfcf9] p-8"><h1 className="text-3xl font-black">Stay unavailable</h1><p className="mt-3 text-[#66727b]">{error || 'Property not found.'}</p></div></main>;

  return <main className="min-h-screen bg-[#f7f6f1] pb-28 text-[#14243a]">
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between py-2"><button onClick={()=>router.back()} className="inline-flex items-center gap-2 text-sm font-bold text-[#237c73]"><ArrowLeft size={18}/>Discover stays</button><div className="flex gap-2"><button aria-label="Share" className="grid h-10 w-10 place-items-center rounded-full border border-[#d8e3e0] bg-white"><Share2 size={18}/></button><button onClick={()=>setSaved(!saved)} aria-label="Save" className="grid h-10 w-10 place-items-center rounded-full border border-[#d8e3e0] bg-white"><Heart size={18} fill={saved?'currentColor':'none'} /></button></div></div>

      <section className="py-8 md:py-12"><p className="mb-4 text-xs font-black tracking-[.2em] text-[#237c73]">VERIFIED LOCAL STAY</p><div className="grid gap-6 lg:grid-cols-[1fr_auto]"><div><h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">{title}</h1><p className="mt-4 flex items-center gap-2 text-base text-[#66727b]"><MapPin size={18} className="text-[#237c73]"/>{locality}</p><div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold"><span className="border border-[#d8e3e0] bg-white px-3 py-2">{property.bedrooms || 1} bedrooms</span><span className="border border-[#d8e3e0] bg-white px-3 py-2">{bathrooms} bathroom{bathrooms>1?'s':''}</span><span className="border border-[#d8e3e0] bg-white px-3 py-2 flex items-center gap-1"><Users size={15}/>{property.maxGuests || 2} guests</span><span className="border border-[#d8e3e0] bg-white px-3 py-2 flex items-center gap-1"><Star size={15} className="fill-[#f4c64e] text-[#d99a16]"/>{Number(property.rating || 0).toFixed(1)} {property.reviewsCount ? `(${property.reviewsCount})` : ''}</span></div></div><div className="hidden lg:block self-end text-right"><div className="text-3xl font-black">₹{price.toLocaleString('en-IN')}</div><div className="text-sm text-[#66727b]">per night</div></div></div></section>

      {images.length > 0 && <section className="grid gap-3 md:grid-cols-2"><div className="relative aspect-[16/10] overflow-hidden bg-[#eaf0ee]">{images[0] && <PropertyImage src={images[0]} alt={title} priority className="object-cover"/>}</div><div className="grid grid-cols-2 gap-3">{images.slice(1,4).map((src:string,i:number)=><div key={src+i} className="relative aspect-square overflow-hidden bg-[#eaf0ee]"><PropertyImage src={src} alt={`${title} photo ${i+2}`} className="object-cover"/></div>)}</div></section>}

      <section className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]"><article className="space-y-12"><div><p className="text-xs font-black tracking-[.2em] text-[#237c73]">ABOUT THIS STAY</p><h2 className="mt-3 text-3xl font-black">A place to settle into Guwahati.</h2><p className="mt-5 max-w-3xl text-lg leading-8 text-[#66727b]">{property.description || 'Enjoy a comfortable local stay and discover Guwahati from a space hosted with care.'}</p></div><div className="border-t border-[#d8e3e0] pt-10"><p className="text-xs font-black tracking-[.2em] text-[#237c73]">WHAT’S INCLUDED</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{(property.features?.length ? property.features : ['Comfortable stay','Local support','Flexible cancellation','Secure booking']).map((x:string)=><div key={x} className="flex items-center gap-3 border-b border-[#e4ebe8] py-3"><Check size={18} className="text-[#237c73]"/><span className="font-semibold">{x}</span></div>)}</div></div><div className="border-t border-[#d8e3e0] pt-10"><p className="text-xs font-black tracking-[.2em] text-[#237c73]">YOUR HOST</p><div className="mt-5 flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-full bg-[#123f3b] font-black text-[#f4c64e]">{(property.host?.name || 'H').slice(0,1)}</div><div><h3 className="text-xl font-black">{property.host?.name || property.owner || 'Your local host'}</h3><p className="text-[#66727b]">Hosting in Guwahati</p></div></div></div><div className="border-t border-[#d8e3e0] pt-10"><p className="text-xs font-black tracking-[.2em] text-[#237c73]">GUEST REVIEWS</p><div className="mt-5 flex items-center gap-3"><div className="text-4xl font-black">{Number(property.rating || 0).toFixed(1)}</div><div className="text-sm text-[#66727b]">Guest rating<br/>{property.reviewsCount || 0} verified reviews</div></div></div></article>
        <aside className="hidden lg:block"><div className="sticky top-24 border border-[#cbded9] bg-[#fcfcf9] p-6"><ShieldCheck className="text-[#237c73]"/><p className="mt-5 text-xs font-black tracking-[.18em] text-[#237c73]">PLAN YOUR STAY</p><div className="mt-2 text-3xl font-black">₹{price.toLocaleString('en-IN')} <span className="text-base font-medium text-[#66727b]">/ night</span></div><p className="mt-3 text-sm leading-6 text-[#66727b]">Choose your dates and continue to a secure booking.</p><button onClick={book} className="mt-6 w-full bg-[#f4c64e] px-5 py-4 font-black text-[#14243a] transition hover:translate-y-[-1px]">Reserve this stay →</button></div></aside></section>
    </div>
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#d8e3e0] bg-[#fcfcf9]/95 p-3 backdrop-blur lg:hidden"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><div><div className="font-black">₹{price.toLocaleString('en-IN')} <span className="text-sm font-medium text-[#66727b]">/ night</span></div></div><button onClick={book} className="bg-[#f4c64e] px-5 py-3 text-sm font-black">Reserve →</button></div></div>
  </main>;
}

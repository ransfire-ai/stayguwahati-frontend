'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, BadgeCheck, BedDouble, Home, Map,
  MapPin, ShieldCheck, Star, UserRound, Users, Wifi, Car
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://stayguwahati-backend.onrender.com';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&q=85';

type Host = { _id?: string; id?: string; hostId?: string; name?: string; phone?: string; avatar?: string; photo?: string; image?: string; profileImage?: string; profilePicture?: string; isVerified?: boolean };
type Property = { _id?: string; id?: string; title?: string; locality?: string; city?: string; pricePerNight?: number|string; price?: number|string; images?: string[]; rating?: number; status?: string; createdAt?: string; host?: Host|string; hostId?: string; ownerId?: string; userId?: string; bedrooms?: number|string; guests?: number|string; maxGuests?: number|string };
type Review = { _id?: string; guestName?: string; rating?: number; comment?: string; createdAt?: string; propertyId?: string };

const getId = (p: Property) => String(p._id || p.id || '');
const getHost = (p: Property): Host => typeof p.host === 'string' ? { name: p.host } : (p.host || {});
const getHostId = (p: Property) => { const h=getHost(p); return String(h.hostId || h._id || h.id || p.hostId || p.ownerId || p.userId || '').trim(); };
const imageUrl = (src?: string) => !src ? FALLBACK_IMAGE : /^https?:\/\//i.test(src) || src.startsWith('data:') ? src : `${BACKEND_URL}${src.startsWith('/')?'':'/'}${src}`;
const price = (v?: number|string) => `₹${Number(v||0).toLocaleString('en-IN')}`;

function HostProfileContent() {
  const router = useRouter();
  const params = useSearchParams();
  const hostId = (params.get('id') || '').trim();
  const [properties,setProperties]=useState<Property[]>([]);
  const [reviews,setReviews]=useState<Review[]>([]);
  const [host,setHost]=useState<Host>({});
  const [loading,setLoading]=useState(true);
  const [reviewsLoading,setReviewsLoading]=useState(true);
  const [error,setError]=useState('');

  useEffect(()=>{
    let alive=true;
    (async()=>{
      try {
        setLoading(true); setError('');
        if(!hostId) throw new Error('This host profile link is missing its host ID.');
        const res=await fetch(`${BACKEND_URL}/api/homestays`,{cache:'no-store',headers:{Accept:'application/json'}});
        if(!res.ok) throw new Error('Unable to load host listings.');
        const data=await res.json();
        const raw:Property[]=data?.success&&Array.isArray(data.data)?data.data:Array.isArray(data?.data)?data.data:Array.isArray(data?.homestays)?data.homestays:Array.isArray(data)?data:[];
        const approved=raw.filter(p=>String(p.status||'approved').toLowerCase()==='approved' && getHostId(p)===hostId);
        if(alive){setProperties(approved); if(approved.length)setHost(getHost(approved[0]));}
      }catch(e:any){if(alive)setError(e?.message||'Unable to load this host profile right now.');}
      finally{if(alive)setLoading(false);}
    })();
    return()=>{alive=false};
  },[hostId]);

  useEffect(()=>{
    let alive=true;
    (async()=>{
      if(!properties.length){setReviews([]);setReviewsLoading(false);return;}
      try{
        setReviewsLoading(true);
        const all=await Promise.all(properties.map(async p=>{
          const id=getId(p); if(!id)return [];
          try{const r=await fetch(`${BACKEND_URL}/api/reviews?propertyId=${encodeURIComponent(id)}`,{cache:'no-store'});if(!r.ok)return [];const d=await r.json();const list=d?.success&&Array.isArray(d.data)?d.data:Array.isArray(d)?d:[];return list.map((x:Review)=>({...x,propertyId:id}));}catch{return []}
        }));
        if(alive)setReviews(all.flat());
      }finally{if(alive)setReviewsLoading(false)}
    })();
    return()=>{alive=false};
  },[properties]);

  const rating=useMemo(()=>{const vals=reviews.length?reviews.map(r=>Number(r.rating||0)):properties.map(p=>Number(p.rating||0)).filter(n=>n>0);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0},[properties,reviews]);
  const memberSince=useMemo(()=>{const dates=properties.map(p=>p.createdAt?new Date(p.createdAt).getTime():NaN).filter(Number.isFinite);return dates.length?new Date(Math.min(...dates)).getFullYear():null},[properties]);
  const verified=properties.some(p=>getHost(p).isVerified===true);
  const name=host.name||'StayGuwahati Host';
  const avatar=imageUrl(host.avatar||host.photo||host.image||host.profileImage||host.profilePicture);

  if(loading)return <main className="grid min-h-screen place-items-center bg-[#f5f1e9]"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#d8e3dd] border-t-[#173f3a]"/><p className="mt-4 text-sm font-bold text-[#71827d]">Loading host profile…</p></div></main>;

  if(error||!properties.length)return <main className="min-h-screen bg-[#f5f1e9] text-[#173f3a]"><header className="border-b border-[#dce4df] bg-white"><div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-7 lg:px-9"><Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#173f3a] text-white"><Home size={18}/></span><span className="text-xl font-black">Stay<span className="text-[#21867b]">Guwahati</span></span></Link><button onClick={()=>router.back()} className="inline-flex items-center gap-2 rounded-xl bg-[#173f3a] px-4 py-2.5 text-xs font-black text-white"><ArrowLeft size={14}/> Back</button></div></header><div className="mx-auto max-w-xl px-5 py-24 text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-[28px] bg-white text-[#28655c] shadow-sm"><UserRound size={30}/></div><h1 className="mt-6 text-3xl font-black">Host profile unavailable</h1><p className="mt-3 text-sm leading-6 text-[#71827d]">{error||'We could not find approved listings for this host.'}</p><Link href="/explore" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#173f3a] px-5 py-3 text-sm font-black text-white">Explore stays <ArrowRight size={16}/></Link></div></main>;

  return <main className="min-h-screen bg-[#f5f1e9] text-[#173f3a]">
    <header className="sticky top-0 z-50 border-b border-[#dce4df] bg-white/95 backdrop-blur-xl"><div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-7 lg:px-9"><Link href="/" className="group flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#173f3a] text-white shadow-sm transition group-hover:scale-105"><Home size={18} strokeWidth={2.6}/></span><span className="text-[20px] font-black tracking-[-.04em]">Stay<span className="text-[#21867b]">Guwahati</span></span></Link><nav className="hidden items-center gap-8 text-xs font-extrabold md:flex"><Link href="/" className="text-[#71827d] hover:text-[#21867b]">Home</Link><Link href="/explore" className="text-[#71827d] hover:text-[#21867b]">Explore</Link><Link href="/map" className="text-[#71827d] hover:text-[#21867b]">Live Map</Link></nav><div className="flex gap-2"><Link href="/map" className="hidden items-center gap-2 rounded-xl border border-[#d6dfda] px-3.5 py-2.5 text-xs font-extrabold sm:inline-flex"><Map size={14}/> Map</Link><button onClick={()=>router.back()} className="inline-flex items-center gap-2 rounded-xl bg-[#173f3a] px-4 py-2.5 text-xs font-extrabold text-white"><ArrowLeft size={14}/> Back</button></div></div></header>

    <section className="border-b border-[#dce4df] bg-white"><div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-7 sm:py-10 lg:px-9"><div className="rounded-[30px] bg-[#eef4f0] p-5 sm:p-7 lg:p-8"><div className="flex flex-col gap-7 lg:flex-row lg:items-center"><div className="relative shrink-0"><div className="h-28 w-28 overflow-hidden rounded-[30px] border-4 border-white bg-[#dcece4] shadow-lg sm:h-32 sm:w-32"><img src={avatar} alt={name} className="h-full w-full object-cover" onError={e=>{e.currentTarget.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=173f3a&color=fff&size=256`}}/></div>{verified&&<span className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-full border-4 border-[#eef4f0] bg-[#21867b] text-white"><BadgeCheck size={17}/></span>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-black uppercase tracking-[.18em] text-[#21867b]">Hosted locally</span>{verified&&<span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-[#28655c]"><ShieldCheck size={12}/> Verified host</span>}</div><h1 className="mt-2 text-3xl font-black tracking-[-.04em] sm:text-4xl">{name}</h1><p className="mt-2 text-sm font-medium text-[#687a74]">A local StayGuwahati host offering stays around Guwahati.</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-[#61736d]">{memberSince&&<span>Member since {memberSince}</span>}<span>{properties.length} {properties.length===1?'property':'properties'}</span><span className="inline-flex items-center gap-1"><Star size={13} fill="currentColor" className="text-amber-400"/>{rating?rating.toFixed(1):'New'}</span></div></div></div>
    <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4"><Stat label="Rating" value={rating?rating.toFixed(1):'New'} star={!!rating}/><Stat label="Reviews" value={String(reviews.length)}/><Stat label="Properties" value={String(properties.length)}/><Stat label="Verification" value={verified?'Verified host':'Not verified'} teal={verified}/></div></div></div></section>

    <section className="mx-auto max-w-[1440px] px-5 py-9 sm:px-7 lg:px-9"><div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#21867b]">Host listings</p><h2 className="mt-1 text-2xl font-black tracking-[-.03em] sm:text-3xl">{name}'s properties</h2></div><span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d5e1db] bg-white px-3 py-2 text-xs font-bold text-[#62736d]"><MapPin size={14} className="text-[#21867b]"/> Guwahati, Assam</span></div><div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{properties.map(p=><PropertyCard key={getId(p)} property={p}/>)}</div></section>

    <section className="mx-auto max-w-[1440px] px-5 pb-12 sm:px-7 lg:px-9"><div className="overflow-hidden rounded-[30px] border border-[#d7e0db] bg-white shadow-sm"><div className="flex flex-col justify-between gap-5 border-b border-[#e6ebe8] p-6 sm:flex-row sm:items-center sm:p-8"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#21867b]">Guest feedback</p><h2 className="mt-1 text-2xl font-black tracking-[-.03em]">Reviews for this host</h2></div>{reviews.length>0&&<div className="rounded-2xl bg-[#fff8df] px-5 py-3 text-right"><p className="text-xl font-black">{rating.toFixed(1)} <span className="text-amber-400">★</span></p><p className="text-[10px] font-bold text-[#8b8363]">{reviews.length} guest review{reviews.length===1?'':'s'}</p></div>}</div><div className="p-6 sm:p-8">{reviewsLoading?<div className="py-12 text-center text-sm font-bold text-[#8a9893]">Loading guest reviews…</div>:!reviews.length?<div className="py-12 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eef4f0] text-[#28655c]"><Star size={22}/></div><h3 className="mt-4 text-sm font-black">No reviews yet</h3><p className="mt-1 text-xs text-[#8a9893]">Reviews will appear here after completed stays.</p></div>:<div className="grid gap-4 md:grid-cols-2">{reviews.slice(0,10).map((r,i)=><article key={r._id||`${r.guestName}-${i}`} className="rounded-2xl border border-[#e1e7e3] bg-[#f8faf8] p-5"><div className="flex justify-between gap-3"><p className="text-sm font-black">{r.guestName||'Verified Guest'}</p><span className="text-xs font-black text-amber-500">{'★'.repeat(Math.max(0,Math.min(5,Number(r.rating||0))))}</span></div>{r.comment&&<p className="mt-3 text-sm leading-6 text-[#667771]">{r.comment}</p>}{r.createdAt&&<p className="mt-3 text-[10px] font-semibold text-[#9aa7a2]">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>}</article>)}</div>}</div></div></section>

    <section className="border-t border-[#dce4df] bg-[#173f3a]"><div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-7 sm:px-7 lg:flex-row lg:items-center lg:justify-between lg:px-9"><div><p className="text-sm font-black text-white">Stay local with StayGuwahati</p><p className="mt-1 text-xs text-[#b8ccc5]">Discover stays from local hosts around Guwahati.</p></div><Link href="/explore" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#e9bf52] px-5 py-3 text-xs font-black text-[#173f3a]">Explore stays <ArrowRight size={14}/></Link></div></section>
  </main>;
}

function Stat({label,value,star,teal}:{label:string;value:string;star?:boolean;teal?:boolean}){return <div className="rounded-2xl bg-white p-4"><p className="text-[9px] font-black uppercase tracking-[.15em] text-[#94a39e]">{label}</p><p className={`mt-1 text-xl font-black ${teal?'text-[#21867b]':''}`}>{value}{star&&<span className="ml-1 text-amber-400">★</span>}</p></div>}

function PropertyCard({property:p}:{property:Property}){const id=getId(p);const r=Number(p.rating||0);return <article className="group overflow-hidden rounded-[26px] border border-[#dce4df] bg-white shadow-[0_5px_22px_rgba(23,63,60,.045)] transition duration-300 hover:-translate-y-1 hover:border-[#b7d4ce] hover:shadow-[0_20px_50px_rgba(23,63,60,.12)]"><Link href={`/property-details?id=${encodeURIComponent(id)}`} className="block"><div className="relative h-[245px] overflow-hidden bg-[#e8eeeb]"><img src={imageUrl(p.images?.[0])} alt={p.title||'Property'} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.045]"/><div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent"/><span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.12em] text-[#28655c] shadow-sm"><MapPin size={11} className="mr-1 inline"/>{p.locality||'Guwahati'}</span><span className="absolute bottom-4 left-4 rounded-full bg-[#173f3a]/90 px-3 py-1.5 text-[10px] font-extrabold text-white">Local stay</span></div></Link><div className="p-5"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><h3 className="truncate text-[17px] font-black tracking-[-.02em] text-[#173f3a]">{p.title||'Homestay'}</h3><p className="mt-1.5 text-xs font-semibold text-[#73837e]">{p.locality||'Guwahati'}</p></div>{r>0&&<span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#fff8df] px-2.5 py-1.5 text-xs font-black"><Star size={12} fill="currentColor" className="text-amber-400"/>{r.toFixed(1)}</span>}</div><div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold text-[#71827d]"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f7f4] px-3 py-1.5"><BedDouble size={12}/>{p.bedrooms||'Comfortable'}</span><span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f7f4] px-3 py-1.5"><Users size={12}/>{p.maxGuests||p.guests||2} guests</span><span className="hidden items-center gap-1.5 rounded-full bg-[#f3f7f4] px-3 py-1.5 sm:inline-flex"><Wifi size={12}/>Wi-Fi</span></div><div className="mt-5 flex items-end justify-between border-t border-[#edf1ee] pt-4"><div><span className="text-xl font-black text-[#173f3a]">{price(p.pricePerNight??p.price)}</span><span className="ml-1 text-[11px] font-semibold text-[#94a19d]">/ night</span></div><span className="inline-flex items-center gap-1 text-xs font-black text-[#21867b]">View stay <ArrowRight size={14} className="transition-transform group-hover:translate-x-1"/></span></div></div></article>}

export default function HostProfilePage(){return <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#f5f1e9] text-sm font-bold text-[#71827d]">Loading host profile…</div>}><HostProfileContent/></Suspense>}

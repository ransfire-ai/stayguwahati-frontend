'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Heart, MapPin, Share2, ShieldCheck, Star, Users,
  BedDouble, Bath, Wifi, Car, CookingPot, Snowflake, Check
} from 'lucide-react';

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL || 'https://stayguwahati-backend.onrender.com').replace(/\/$/, '');

function resolveImage(src: unknown) {
  if (typeof src !== 'string' || !src.trim()) return '';
  if (/^https?:\/\//i.test(src) || src.startsWith('data:')) return src;
  return `${API_BASE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
}

export default function PropertyPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchProperty() {
      if (!id) {
        setError('Property ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // IMPORTANT: homepage data comes from /api/homestays.
        // Use the same resource for the details page.
        const response = await fetch(
          `${API_BASE_URL}/api/homestays/${encodeURIComponent(id)}`,
          { cache: 'no-store' }
        );

        let payload: any = null;
        try {
          payload = await response.json();
        } catch {
          throw new Error('The server returned an invalid response.');
        }

        if (!response.ok) {
          throw new Error(payload?.message || `Unable to load this stay (${response.status}).`);
        }

        // Supports { success, data }, { data }, or a direct property object.
        const item =
          payload?.data && !Array.isArray(payload.data) ? payload.data :
          payload?.homestay && !Array.isArray(payload.homestay) ? payload.homestay :
          payload;

        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          throw new Error('Property details could not be found.');
        }

        if (!cancelled) setProperty(item);
      } catch (err: any) {
        if (!cancelled) {
          setProperty(null);
          setError(err?.message || 'Failed to load property data. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProperty();
    return () => { cancelled = true; };
  }, [id]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);
    const diff = end.getTime() - start.getTime();
    return diff > 0 ? Math.ceil(diff / 86400000) : 0;
  }, [checkIn, checkOut]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f3ec] flex items-center justify-center text-[#173f36]">
        <div className="text-center">
          <div className="h-10 w-10 mx-auto mb-4 rounded-full border-4 border-[#d7e3dc] border-t-[#176b5b] animate-spin" />
          <p className="font-medium">Finding your stay...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-[#f6f3ec] flex items-center justify-center px-5">
        <div className="max-w-md w-full rounded-[28px] bg-white p-8 text-center shadow-sm border border-[#e5e0d7]">
          <MapPin className="mx-auto mb-4 text-[#176b5b]" size={34} />
          <h1 className="text-2xl font-bold text-[#173f36]">Stay not found</h1>
          <p className="mt-2 text-[#68736e]">{error || 'Property not found.'}</p>
          <button
            onClick={() => router.push('/explore')}
            className="mt-6 rounded-full bg-[#176b5b] px-6 py-3 font-semibold text-white"
          >
            Explore stays
          </button>
        </div>
      </div>
    );
  }

  const title = property.title || property.name || property.propertyName || 'Property Details';
  const locality = property.locality || property.address || property.location || 'Guwahati, Assam';

  const rawImages =
    Array.isArray(property.images) ? property.images :
    Array.isArray(property.photos) ? property.photos :
    property.imageUrl || property.image ? [property.imageUrl || property.image] :
    [];

  const images = rawImages.map(resolveImage).filter(Boolean).slice(0, 4);
  if (!images.length && property._id) {
    images.push(`${API_BASE_URL}/api/homestays/${property._id}/image`);
  }

  const bathrooms =
    typeof property.bathrooms === 'object' && property.bathrooms
      ? (property.bathrooms.total || property.bathrooms.privateAttached || property.bathrooms.dedicated || property.bathrooms.shared || 1)
      : (property.bathrooms || 1);

  const amenities = Array.isArray(property.features) && property.features.length
    ? property.features
    : Array.isArray(property.amenities) && property.amenities.length
      ? property.amenities
      : ['Fast Wi-Fi', 'Air conditioning', 'Kitchen access', 'Free parking', 'Power backup'];

  const pricePerNight = Number(property.pricePerNight ?? property.price ?? 0);
  const totalPrice = nights * pricePerNight;
  const today = new Date().toISOString().split('T')[0];

  const amenityIcon = (name: string) => {
    const item = String(name).toLowerCase();
    if (item.includes('wifi')) return <Wifi size={19} />;
    if (item.includes('parking')) return <Car size={19} />;
    if (item.includes('kitchen')) return <CookingPot size={19} />;
    if (item.includes('air')) return <Snowflake size={19} />;
    return <Check size={19} />;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nights <= 0) {
      setBookingError('Check-out date must be after check-in date.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          homestayId: property._id || property.id || id,
          propertyName: title,
          checkIn,
          checkOut,
          dates: `${checkIn} to ${checkOut}`,
          nights,
          totalPrice
        })
      });

      const result = await response.json();
      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || 'Booking failed. Please try again.');
      }
      setBookingSuccess(true);
    } catch (err: any) {
      setBookingError(err?.message || 'Network error while processing booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f3ec] text-[#173f36]">
      <header className="border-b border-[#e6e1d8] bg-[#f6f3ec]/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 font-semibold text-sm">
            <ArrowLeft size={18} /><span className="hidden sm:inline">Back to explore</span><span className="sm:hidden">Back</span>
          </button>
          <div className="flex gap-2">
            <button className="h-10 w-10 rounded-full border border-[#ded8cd] bg-white flex items-center justify-center"><Share2 size={17}/></button>
            <button className="h-10 w-10 rounded-full border border-[#ded8cd] bg-white flex items-center justify-center"><Heart size={17}/></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
        <section className="mb-7 sm:mb-9">
          <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] font-bold uppercase text-[#a26a32]">
            <ShieldCheck size={15}/> Local stay · Guwahati
          </div>
          <div className="mt-3 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">{title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[#627069]">
                <span className="inline-flex items-center gap-1"><MapPin size={17} className="text-[#176b5b]"/>{locality}</span>
                <span className="inline-flex items-center gap-1 text-[#173f36]"><Star size={16} className="fill-[#d49a4c] text-[#d49a4c]"/>{property.rating || 5} · {property.reviewsCount || 0} reviews</span>
              </div>
            </div>
            <div className="rounded-2xl bg-[#e6efe9] px-4 py-3 text-sm font-medium inline-flex gap-2 items-center w-fit">
              <ShieldCheck size={17} className="text-[#176b5b]"/> Verified local listing
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-10">
          {images.map((src: string, index: number) => (
            <div key={`${src}-${index}`} className={`${index === 0 ? 'col-span-2 row-span-2 aspect-[4/3]' : 'aspect-square'} relative overflow-hidden rounded-[22px] bg-[#e4e8e3]`}>
              <img src={src} alt={`${title} ${index + 1}`} loading={index === 0 ? 'eager' : 'lazy'} className="w-full h-full object-cover" onError={(e: any) => { e.currentTarget.style.display = 'none'; }} />
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 lg:gap-12">
          <div className="space-y-9">
            <div className="rounded-[28px] bg-white border border-[#e7e1d8] p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.16em] font-bold text-[#a26a32]">Hosted locally</p>
              <h2 className="mt-2 text-2xl font-bold">A comfortable base for your Guwahati visit</h2>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#617069]">
                <span className="inline-flex items-center gap-1.5"><BedDouble size={18}/>{property.bedrooms || 1} bedrooms</span>
                <span className="inline-flex items-center gap-1.5"><Bath size={18}/>{bathrooms} bathroom{Number(bathrooms) !== 1 ? 's' : ''}</span>
                <span className="inline-flex items-center gap-1.5"><Users size={18}/>Up to {property.maxGuests || property.guests || 2} guests</span>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.16em] font-bold text-[#a26a32]">About this stay</p>
              <p className="mt-3 text-[16px] leading-8 text-[#53615b]">{property.description || 'Enjoy a peaceful and comfortable stay at this property in Guwahati.'}</p>
            </div>

            <div className="border-t border-[#ded9cf] pt-8">
              <p className="text-xs uppercase tracking-[0.16em] font-bold text-[#a26a32]">What’s included</p>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {amenities.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 rounded-2xl bg-[#edf2ee] px-4 py-4 text-sm font-medium">
                    <span className="text-[#176b5b]">{amenityIcon(item)}</span>{item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-6 h-fit rounded-[28px] bg-[#173f36] p-5 sm:p-6 text-white shadow-xl">
            <div className="flex items-baseline justify-between mb-6">
              <div><span className="text-3xl font-bold">₹{pricePerNight}</span><span className="text-[#c9d5cf] text-sm"> / night</span></div>
              <span className="rounded-full bg-[#315d53] px-3 py-1 text-xs">Book direct</span>
            </div>

            {bookingSuccess ? (
              <div className="rounded-2xl bg-[#244f45] p-5 text-center">
                <ShieldCheck className="mx-auto mb-3 text-[#d7b06e]" size={32}/>
                <h3 className="font-bold text-lg">Reservation received</h3>
                <p className="mt-2 text-sm text-[#d4dfd9]">Your booking request has been sent successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                {bookingError && <div className="rounded-xl bg-[#5d2c2c] px-3 py-3 text-sm">{bookingError}</div>}
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs text-[#c9d5cf]">Check-in<input type="date" min={today} required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="mt-1.5 w-full rounded-xl border-0 bg-white px-3 py-3 text-sm text-[#173f36]"/></label>
                  <label className="text-xs text-[#c9d5cf]">Check-out<input type="date" min={checkIn || today} required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="mt-1.5 w-full rounded-xl border-0 bg-white px-3 py-3 text-sm text-[#173f36]"/></label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="First name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="rounded-xl bg-white px-3 py-3 text-sm text-[#173f36]"/>
                  <input type="text" placeholder="Last name" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="rounded-xl bg-white px-3 py-3 text-sm text-[#173f36]"/>
                </div>
                <input type="email" placeholder="Email address" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl bg-white px-3 py-3 text-sm text-[#173f36]"/>
                <input type="tel" placeholder="Phone number" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl bg-white px-3 py-3 text-sm text-[#173f36]"/>
                {nights > 0 && <div className="border-y border-[#3d685f] py-4 text-sm text-[#d9e3de]"><div className="flex justify-between"><span>₹{pricePerNight} × {nights} nights</span><span>₹{totalPrice}</span></div><div className="flex justify-between mt-3 text-base font-bold text-white"><span>Total</span><span>₹{totalPrice}</span></div></div>}
                <button type="submit" disabled={bookingLoading} className="w-full rounded-full bg-[#d7a154] hover:bg-[#e0b165] text-[#173f36] font-bold py-3.5 transition disabled:opacity-60">{bookingLoading ? 'Processing...' : 'Reserve this stay'}</button>
              </form>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}

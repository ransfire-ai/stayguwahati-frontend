'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://stayguwahati-backend.onrender.com';

interface Host {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  photo?: string;
  image?: string;
  profileImage?: string;
  profilePicture?: string;
  isVerified?: boolean;
}

interface Property {
  _id?: string;
  id?: string;
  title: string;
  locality?: string;
  pricePerNight?: number | string;
  price?: number | string;
  images?: string[];
  rating?: number;
  reviewsCount?: number;
  status?: string;
  isAvailable?: boolean;
  host?: Host | string;
  createdAt?: string;
}

interface Review {
  _id?: string;
  guestName?: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
  propertyId?: string;
}

const getId = (property: Property) =>
  String(property._id || property.id || '');

const getHost = (property: Property): Host => {
  if (typeof property.host === 'string') {
    return { name: property.host };
  }
  return property.host || {};
};

const getAvatar = (host: Host) => {
  const raw =
    host.avatar ||
    host.photo ||
    host.image ||
    host.profileImage ||
    host.profilePicture ||
    '';

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  if (raw) {
    return `${BACKEND_URL}${raw.startsWith('/') ? '' : '/'}${raw}`;
  }

  const name = encodeURIComponent(host.name || 'Host');
  return `https://ui-avatars.com/api/?name=${name}&background=0d9488&color=fff&size=256`;
};

function HostProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<Property[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState('');

  const hostEmail = (searchParams.get('email') || '').trim().toLowerCase();
  const hostNameParam = searchParams.get('name') || '';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${BACKEND_URL}/api/homestays`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Unable to load host listings (${response.status})`);
        }

        const data = await response.json();

        const raw: Property[] =
          data?.success && Array.isArray(data.data)
            ? data.data
            : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data?.homestays)
                ? data.homestays
                : Array.isArray(data)
                  ? data
                  : [];

        const approved = raw.filter((property) => {
          const status = String(property.status || 'approved').toLowerCase();
          if (status !== 'approved') return false;

          const host = getHost(property);
          const email = String(host.email || '').trim().toLowerCase();
          const name = String(host.name || '').trim().toLowerCase();

          if (hostEmail) return email === hostEmail;
          if (hostNameParam) return name === hostNameParam.trim().toLowerCase();

          return false;
        });

        setProperties(approved);
      } catch (err) {
        console.error('Host profile load failed:', err);
        setError('Unable to load this host profile right now.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [hostEmail, hostNameParam]);

  useEffect(() => {
    if (!properties.length) {
      setReviews([]);
      setReviewsLoading(false);
      return;
    }

    const loadReviews = async () => {
      try {
        setReviewsLoading(true);

        const results = await Promise.all(
          properties.map(async (property) => {
            const id = getId(property);
            if (!id) return [];

            try {
              const response = await fetch(
                `${BACKEND_URL}/api/reviews?propertyId=${encodeURIComponent(id)}`
              );
              const data = await response.json();

              return data?.success && Array.isArray(data.data)
                ? data.data.map((review: Review) => ({
                    ...review,
                    propertyId: id,
                  }))
                : [];
            } catch {
              return [];
            }
          })
        );

        setReviews(results.flat());
      } finally {
        setReviewsLoading(false);
      }
    };

    loadReviews();
  }, [properties]);

  const host = useMemo(
    () => (properties.length ? getHost(properties[0]) : {
      name: hostNameParam || 'Host',
    }),
    [properties, hostNameParam]
  );

  const totalReviews = reviews.length;

  const averageRating = useMemo(() => {
    if (!totalReviews) {
      const ratings = properties
        .map((property) => Number(property.rating))
        .filter((rating) => Number.isFinite(rating) && rating > 0);

      if (!ratings.length) return 0;

      return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    }

    return reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    ) / totalReviews;
  }, [properties, reviews, totalReviews]);

  const memberSince = useMemo(() => {
    const dates = properties
      .map((property) => property.createdAt)
      .filter(Boolean)
      .map((date) => new Date(date as string).getTime())
      .filter((time) => Number.isFinite(time));

    if (!dates.length) return null;

    return new Date(Math.min(...dates)).getFullYear();
  }, [properties]);

  const hostVerified = properties.some(
    (property) => getHost(property).isVerified === true
  );

  const ratingText = averageRating
    ? averageRating.toFixed(1)
    : 'New';

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-slate-50">
        <p className="text-sm font-semibold text-slate-400">
          Loading host profile...
        </p>
      </div>
    );
  }

  if (error || !properties.length) {
    return (
      <main className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="text-xl font-black">
              Stay<span className="text-teal-600">Guwahati</span>
            </Link>
            <button
              onClick={() => router.back()}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700"
            >
              ← Back
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-2xl">
            👤
          </div>
          <h1 className="mt-5 text-2xl font-black">Host profile unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || 'We could not find an approved listing for this host.'}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-black text-white"
          >
            Explore StayGuwahati
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-xl font-black tracking-tight">
            Stay<span className="text-teal-600">Guwahati</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/map"
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-teal-400"
            >
              🗺️ Map
            </Link>
            <button
              onClick={() => router.back()}
              className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-teal-600"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <img
              src={getAvatar(host)}
              alt={host.name || 'Host'}
              className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg ring-1 ring-slate-200"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-black uppercase tracking-widest text-teal-600">
                  Hosted by
                </p>

                {hostVerified && (
                  <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-black text-teal-700">
                    ✓ StayGuwahati Verified
                  </span>
                )}
              </div>

              <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                {host.name || 'StayGuwahati Host'}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                {memberSince && <span>Member since {memberSince}</span>}
                <span>{properties.length} {properties.length === 1 ? 'property' : 'properties'}</span>
                {totalReviews > 0 && (
                  <span>
                    ★ {ratingText} · {totalReviews}{' '}
                    {totalReviews === 1 ? 'review' : 'reviews'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Rating
              </p>
              <p className="mt-1 text-xl font-black">
                {ratingText}
                {averageRating > 0 && <span className="ml-1 text-amber-400">★</span>}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Reviews
              </p>
              <p className="mt-1 text-xl font-black">{totalReviews}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Properties
              </p>
              <p className="mt-1 text-xl font-black">{properties.length}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Verification
              </p>
              <p className={`mt-1 text-sm font-black ${hostVerified ? 'text-teal-700' : 'text-slate-500'}`}>
                {hostVerified ? 'Verified Host' : 'Not verified'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-widest text-teal-600">
            Host listings
          </p>
          <h2 className="mt-1 text-2xl font-black">
            {host.name || 'Host'}'s properties
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => {
            const id = getId(property);
            const image =
              property.images?.[0]?.startsWith('/uploads')
                ? `${BACKEND_URL}${property.images[0]}`
                : property.images?.[0] ||
                  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

            const price = Number(
              property.pricePerNight ?? property.price ?? 0
            );

            return (
              <article
                key={id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Link href={`/property-details?id=${encodeURIComponent(id)}`}>
                  <div className="h-52 overflow-hidden bg-slate-100">
                    <img
                      src={image}
                      alt={property.title}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                  </div>
                </Link>

                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-600">
                      📍 {property.locality || 'Guwahati'}
                    </span>

                    {Number(property.rating) > 0 && (
                      <span className="text-xs font-bold">
                        ★ {Number(property.rating).toFixed(1)}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 line-clamp-1 font-black">
                    {property.title}
                  </h3>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div>
                      <span className="text-lg font-black">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400"> / night</span>
                    </div>

                    <Link
                      href={`/property-details?id=${encodeURIComponent(id)}`}
                      className="text-xs font-black text-teal-600"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-teal-600">
                Guest feedback
              </p>
              <h2 className="mt-1 text-2xl font-black">
                Reviews for this host
              </h2>
            </div>

            {totalReviews > 0 && (
              <div className="text-right">
                <p className="text-2xl font-black">
                  {ratingText} <span className="text-amber-400">★</span>
                </p>
                <p className="text-xs text-slate-400">
                  {totalReviews} verified review{totalReviews === 1 ? '' : 's'}
                </p>
              </div>
            )}
          </div>

          {reviewsLoading ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Loading reviews...
            </p>
          ) : reviews.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100">
                ⭐
              </div>
              <p className="mt-3 text-sm font-bold text-slate-700">
                No reviews yet
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Reviews will appear here after completed stays.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {reviews.slice(0, 10).map((review) => (
                <article
                  key={review._id || `${review.guestName}-${review.createdAt}`}
                  className="rounded-2xl bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black">
                      {review.guestName || 'Verified Guest'}
                    </p>
                    <span className="text-sm font-black text-amber-500">
                      {'★'.repeat(Math.max(0, Math.min(5, Number(review.rating || 0))))}
                    </span>
                  </div>

                  {review.comment && (
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {review.comment}
                    </p>
                  )}

                  {review.createdAt && (
                    <p className="mt-2 text-[11px] text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function HostProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-slate-500">
          Loading host profile...
        </div>
      }
    >
      <HostProfileContent />
    </Suspense>
  );
}
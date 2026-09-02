'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Homestay {
  id?: string;
  _id?: string;
  title: string;
  locality?: string;
  pricePerNight?: number;
  price?: number;
  images?: string[];
  rating?: number;
  reviewsCount?: number;
  status?: string;
  isAvailable?: boolean;
  verified?: boolean;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://stayguwahati-backend.onrender.com';

function getId(property: Homestay) {
  return String(property.id || property._id || '');
}

function getImage(property: Homestay) {
  const image = property.images?.[0];

  if (!image) {
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  }

  if (image.startsWith('/uploads')) {
    return `${BACKEND_URL}${image}`;
  }

  return image;
}

function getPrice(property: Homestay) {
  return Number(property.pricePerNight ?? property.price ?? 0);
}

export default function WishlistPage() {
  const router = useRouter();

  const [properties, setProperties] = useState<Homestay[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadWishlist = async () => {
      const token =
        sessionStorage.getItem('token') ||
        sessionStorage.getItem('authToken') ||
        sessionStorage.getItem('accessToken') ||
        '';

      if (!token) {
        setError('Please log in to view your wishlist.');
        setWishlistIds([]);
        setProperties([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${BACKEND_URL}/api/wishlist`, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
          setError('Your session has expired. Please log in again.');
          setWishlistIds([]);
          setProperties([]);
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Unable to load wishlist.');
        }

        const items = Array.isArray(data.data) ? data.data : [];

        const savedIds = items
          .map((item: any) => String(item.propertyId || ''))
          .filter(Boolean);

        const savedProperties = items
          .map((item: any) => item.property)
          .filter(Boolean) as Homestay[];

        setWishlistIds(savedIds);
        setProperties(savedProperties);
      } catch (err) {
        console.error('Wishlist load failed:', err);
        setError('Unable to load your saved properties right now.');
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  const savedProperties = useMemo(
    () =>
      wishlistIds
        .map((id) =>
          properties.find((property) => getId(property) === id)
        )
        .filter(Boolean) as Homestay[],
    [wishlistIds, properties]
  );

  const removeFromWishlist = async (id: string) => {
    const token =
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('authToken') ||
      sessionStorage.getItem('accessToken') ||
      '';

    if (!token) {
      setError('Please log in to manage your wishlist.');
      return;
    }

    const previousIds = wishlistIds;
    const previousProperties = properties;

    setWishlistIds((current) => current.filter((item) => item !== id));
    setProperties((current) =>
      current.filter((property) => getId(property) !== id)
    );

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/wishlist/${encodeURIComponent(id)}`,
        {
          method: 'DELETE',
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to remove property.');
      }
    } catch (err) {
      console.error('Wishlist removal failed:', err);
      setWishlistIds(previousIds);
      setProperties(previousProperties);
      setError('Unable to remove this property right now.');
    }
  };

  const clearWishlist = async () => {
    const ids = [...wishlistIds];
    for (const id of ids) {
      await removeFromWishlist(id);
    }
  };

  return (
    <main className="sg-shell min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-teal-600 text-white shadow-sm">
              🏠
            </div>
            <span className="text-xl font-black tracking-tight">
              Stay<span className="text-teal-600">Guwahati</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/map"
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-teal-400 hover:text-teal-700"
            >
              🗺️ Map
            </Link>

            <Link
              href="/"
              className="rounded-xl bg-teal-600 px-3 py-2 text-xs font-bold text-white hover:bg-teal-700"
            >
              Explore Stays
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-6 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-rose-600">
              Your saved stays
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
              ❤️ Wishlist
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {savedProperties.length} saved{' '}
              {savedProperties.length === 1 ? 'property' : 'properties'}
            </p>
          </div>
            {error && !loading && wishlistIds.length === 0 && error.includes('log in') && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => router.push('/login?redirect=%2Fwishlist')}
                  className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-black text-white hover:bg-teal-700"
                >
                  Log In
                </button>
              </div>
            )}


          {savedProperties.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="self-start rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-black text-rose-600 hover:bg-rose-50 sm:self-auto"
            >
              Clear Wishlist
            </button>
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid place-items-center py-24 text-sm font-semibold text-slate-400">
            Loading your wishlist...
          </div>
        ) : savedProperties.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-3xl">
              ♡
            </div>
            <h2 className="mt-5 text-xl font-black">
              Your wishlist is empty
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Save homes you love while exploring StayGuwahati. Your
              saved properties will appear here.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <Link
                href="/map"
                className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-black text-white hover:bg-teal-700"
              >
                Explore Map
              </Link>
              <Link
                href="/"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                Browse Stays
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {savedProperties.map((property) => {
              const id = getId(property);
              const price = getPrice(property);

              return (
                <article
                  key={id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img
                      src={getImage(property)}
                      alt={property.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <button
                      type="button"
                      aria-label="Remove from wishlist"
                      onClick={() => removeFromWishlist(id)}
                      className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-xl text-rose-600 shadow-md hover:bg-white"
                    >
                      ♥
                    </button>

                    {property.verified === true && (
                      <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-[10px] font-black text-slate-800 shadow-sm">
                        🛡️ VERIFIED
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-teal-600">
                        📍 {property.locality || 'Guwahati'}
                      </span>

                      {typeof property.rating === 'number' && (
                        <span className="text-xs font-bold text-slate-700">
                          ⭐ {property.rating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-2 line-clamp-1 text-base font-black text-slate-900">
                      {property.title}
                    </h2>

                    <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3">
                      <div>
                        <span className="text-lg font-black">
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-400">
                          / night
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/property-details?id=${encodeURIComponent(id)}`
                          )
                        }
                        className="text-xs font-black text-teal-600 hover:text-teal-700"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

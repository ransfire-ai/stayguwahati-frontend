 'use client';

import React, {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Loader2,
  Save,
  Home,
  IndianRupee,
  MapPin,
  FileText,
  Wifi,
  Car,
  Utensils,
  Wind,
  User,
  Image as ImageIcon,
} from 'lucide-react';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://stayguwahati-backend.onrender.com';

const LOCALITIES = [
  'Amingaon',
  'Azara',
  'Bamunimaidam',
  'Basistha',
  'Beltola',
  'Bhangagarh',
  'Borjhar',
  'Chandmari',
  'Christian Basti',
  'Dispur',
  'Ganeshguri',
  'Geetanagar',
  'GS Road',
  'Jalukbari',
  'Kahilipara',
  'Kamakhya',
  'Khanapara',
  'Kharghuli',
  'Lal Ganesh',
  'Lokhra',
  'Maligaon',
  'Narengi',
  'Paltan Bazar',
  'Pan Bazar',
  'Rehabari',
  'Rukminigaon',
  'Silpukhuri',
  'Six Mile',
  'Supermarket',
  'Ulubari',
  'Uzan Bazar',
  'Zoo Road',
];

const FEATURES = [
  { key: 'Fast WiFi', label: 'Fast Wi-Fi', icon: Wifi },
  { key: 'Free parking', label: 'Free parking', icon: Car },
  { key: 'Kitchen access', label: 'Kitchen access', icon: Utensils },
  { key: 'Air conditioning', label: 'Air conditioning', icon: Wind },
];

function EditPropertyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [locality, setLocality] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);

  useEffect(() => {
    if (!propertyId) {
      setError('No property ID was provided.');
      setLoading(false);
      return;
    }

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(
          `${BACKEND_URL}/api/homestays/${propertyId}`,
          { cache: 'no-store' }
        );

        const data = await res.json();

        if (!res.ok || !data.success || !data.data) {
          throw new Error(
            data.message || 'Unable to load the property.'
          );
        }

        const property = data.data;

        setTitle(property.title || '');
        setLocality(property.locality || '');
        setDescription(property.description || '');
        setPricePerNight(
          String(property.pricePerNight ?? property.price ?? '')
        );
        setPhone(property.host?.phone || '');
        setAvatar(property.host?.avatar || '');
        setImages(
          Array.isArray(property.images)
            ? property.images.filter(Boolean)
            : []
        );
        setFeatures(
          Array.isArray(property.features)
            ? property.features
            : []
        );
      } catch (err) {
        console.error('Failed to load property:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load property.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  const toggleFeature = (feature: string) => {
    setFeatures((current) =>
      current.includes(feature)
        ? current.filter((item) => item !== feature)
        : [...current, feature]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!propertyId) {
      setError('Property ID is missing.');
      return;
    }

    const price = Number(pricePerNight);

    if (!title.trim()) {
      setError('Property title is required.');
      return;
    }

    if (!locality) {
      setError('Please select a locality.');
      return;
    }

    if (!description.trim()) {
      setError('Property description is required.');
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError('Please enter a valid price per night.');
      return;
    }

    try {
      setSaving(true);
      setSaved(false);
      setError('');

      const token =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('token') || ''
          : '';

      const updatedData = {
        title: title.trim(),
        locality,
        description: description.trim(),
        pricePerNight: price,
        features,
        images,
        host: {
          phone: phone.trim(),
          avatar: avatar.trim(),
        },
      };

      const res = await fetch(
        `${BACKEND_URL}/api/homestays/${propertyId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || 'Failed to save listing.'
        );
      }

      setSaved(true);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Failed to update property:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save changes.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!propertyId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">
          Property not found
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Please open the edit page from your dashboard.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
          Loading your listing...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-7">
          <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Edit your listing
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Update your property information and save the changes.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {saved && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <Check className="h-4 w-4" />
            Listing updated successfully. Returning to dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic information */}
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-teal-50 p-2.5 text-teal-700">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-950">
                  Property details
                </h2>
                <p className="text-xs text-slate-500">
                  Keep your listing information accurate.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Property title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Example: Cozy 2BHK near GS Road"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Locality
                  </label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    <select
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                      required
                    >
                      <option value="">Select locality</option>
                      {LOCALITIES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Price per night
                  </label>
                  <div className="relative">
                    <IndianRupee className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      value={pricePerNight}
                      onChange={(e) => setPricePerNight(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <FileText className="h-4 w-4 text-slate-400" />
                  Description
                </label>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your property, nearby attractions, facilities, rules, etc."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  required
                />
                <p className="mt-1 text-right text-xs text-slate-400">
                  {description.length} characters
                </p>
              </div>
            </div>
          </section>

          {/* Amenities */}
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
            <h2 className="font-bold text-slate-950">
              Amenities & highlights
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Select everything your guests can use.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {FEATURES.map(({ key, label, icon: Icon }) => {
                const active = features.includes(key);

                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => toggleFeature(key)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-teal-500 bg-teal-50 text-teal-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        active
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>

                    <span className="flex-1 text-sm font-semibold">
                      {label}
                    </span>

                    {active && (
                      <Check className="h-4 w-4 text-teal-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Host information */}
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-teal-50 p-2.5 text-teal-700">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-950">
                  Host information
                </h2>
                <p className="text-xs text-slate-500">
                  Update contact details shown to guests.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Host phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Host phone number"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Keep your existing Cloudinary URL if you don't want to change the photo.
                </p>
              </div>
            </div>
          </section>

          {/* Existing photos */}
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-teal-50 p-2.5 text-teal-700">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-950">
                  Property photos
                </h2>
                <p className="text-xs text-slate-500">
                  Your existing property photos will remain unchanged.
                </p>
              </div>
            </div>

            {images.length > 0 ? (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {images.slice(0, 8).map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200"
                  >
                    <img
                      src={image}
                      alt={`Property photo ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
                No property photos found.
              </div>
            )}
          </section>

          {/* Save actions */}
          <div className="sticky bottom-0 z-20 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function EditPropertyPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-bold text-slate-700 transition hover:text-teal-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            href="/"
            className="text-lg font-black tracking-tight text-slate-950"
          >
            Stay<span className="text-teal-600">Guwahati</span>
          </Link>

          <div className="w-20" />
        </div>
      </header>

      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
          </div>
        }
      >
        <EditPropertyContent />
      </Suspense>
    </div>
  );
}

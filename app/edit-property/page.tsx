 'use client';

import React, {
  ChangeEvent,
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
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [locationMessage, setLocationMessage] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  type GalleryItem = {
    id: string;
    kind: 'existing' | 'new';
    url: string;
    file?: File;
  };

  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);

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
        setLat(
          property.lat !== undefined && property.lat !== null
            ? String(property.lat)
            : ''
        );
        setLng(
          property.lng !== undefined && property.lng !== null
            ? String(property.lng)
            : ''
        );

        const existingImages = Array.isArray(property.images)
          ? property.images.filter(Boolean)
          : [];

        setGallery(
          existingImages.map((url: string, index: number) => ({
            id: `existing-${index}-${url}`,
            kind: 'existing',
            url,
          }))
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

  const moveImage = (fromIndex: number, toIndex: number) => {
    setGallery((current) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= current.length ||
        toIndex >= current.length
      ) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleImageDrop = (targetIndex: number) => {
    if (draggedImageIndex === null) return;
    moveImage(draggedImageIndex, targetIndex);
    setDraggedImageIndex(null);
  };

  const handlePhotoFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter((file) =>
      file.type.startsWith('image/')
    );

    if (!files.length) return;

    const availableSlots = Math.max(0, 8 - gallery.length);
    const acceptedFiles = files.slice(0, availableSlots);

    if (acceptedFiles.length < files.length) {
      setError('You can keep a maximum of 8 property photos.');
    } else {
      setError('');
    }

    setGallery((current) => [
      ...current,
      ...acceptedFiles.map((file, index) => ({
        id: `new-${Date.now()}-${index}-${file.name}`,
        kind: 'new' as const,
        url: URL.createObjectURL(file),
        file,
      })),
    ]);

    // Allows the same camera/photo to be selected again later.
    event.target.value = '';
  };

  const removePhoto = (index: number) => {
    setGallery((current) => {
      const item = current[index];
      if (item?.kind === 'new') {
        URL.revokeObjectURL(item.url);
      }
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Your browser does not support location access. Enter the coordinates manually.');
      return;
    }

    setLocationLoading(true);
    setLocationMessage('Getting your exact GPS location…');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLat = position.coords.latitude.toFixed(6);
        const nextLng = position.coords.longitude.toFixed(6);

        setLat(nextLat);
        setLng(nextLng);
        setLocationMessage(
          position.coords.accuracy
            ? `Location selected. GPS accuracy is approximately ${Math.round(position.coords.accuracy)} m.`
            : 'Location selected from your device GPS.'
        );
        setLocationLoading(false);
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied. Please allow location access or enter the coordinates manually.'
            : 'Could not get your current location. Please enter the coordinates manually.';

        setLocationMessage(message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const openCoordinatesInMaps = () => {
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);

    if (
      !Number.isFinite(parsedLat) ||
      !Number.isFinite(parsedLng) ||
      parsedLat < -90 ||
      parsedLat > 90 ||
      parsedLng < -180 ||
      parsedLng > 180
    ) {
      setError('Enter valid latitude and longitude first.');
      return;
    }

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${parsedLat},${parsedLng}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

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

    const parsedLat = Number(lat);
    const parsedLng = Number(lng);

    if (
      !Number.isFinite(parsedLat) ||
      parsedLat < -90 ||
      parsedLat > 90 ||
      !Number.isFinite(parsedLng) ||
      parsedLng < -180 ||
      parsedLng > 180
    ) {
      setError('Please enter valid latitude and longitude coordinates.');
      return;
    }

    if (gallery.length === 0) {
      setError('Please add at least one property photo.');
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

      // Upload only newly selected/captured photos. Existing URLs are kept.
      const newPhotoItems = gallery.filter(
        (item) => item.kind === 'new' && item.file
      );

      let uploadedNewImageUrls: string[] = [];

      if (newPhotoItems.length > 0) {
        const formData = new FormData();

        newPhotoItems.forEach((item) => {
          if (item.file) {
            formData.append('photos', item.file);
          }
        });

        const uploadRes = await fetch(`${BACKEND_URL}/api/upload-images`, {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json().catch(() => ({}));

        if (!uploadRes.ok) {
          throw new Error(
            uploadData.message ||
              `Photo upload failed with status ${uploadRes.status}.`
          );
        }

        uploadedNewImageUrls =
          Array.isArray(uploadData.images)
            ? uploadData.images
            : Array.isArray(uploadData.urls)
              ? uploadData.urls
              : [];

        if (uploadedNewImageUrls.length !== newPhotoItems.length) {
          throw new Error('Some new property photos could not be uploaded.');
        }

        uploadedNewImageUrls = uploadedNewImageUrls.map((url: string) =>
          url.startsWith('/') ? `${BACKEND_URL}${url}` : url
        );
      }

      let newUrlIndex = 0;
      const finalImages = gallery.map((item) => {
        if (item.kind === 'existing') return item.url;
        return uploadedNewImageUrls[newUrlIndex++];
      });

      const updatedData = {
        title: title.trim(),
        locality,
        description: description.trim(),
        pricePerNight: price,
        lat: parsedLat,
        lng: parsedLng,
        features,
        images: finalImages,
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
    <main className="min-h-screen bg-[#f6f3ed] pb-24">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#35544e] transition hover:text-[#173f3a]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to host workspace
        </Link>

        <section className="overflow-hidden rounded-[30px] border border-[#27564f] bg-gradient-to-br from-[#103b36] via-[#173f3a] to-[#32675f] px-6 py-8 text-white shadow-xl sm:px-10 sm:py-10">
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9eee6]">
                StayGuwahati host studio
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Shape your stay.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d5e3de] sm:text-base">
                Refresh the details guests see, improve your gallery and keep your location accurate.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-black/10 px-5 py-4 text-sm">
              <p className="text-[#b9d2c8]">Editing</p>
              <p className="mt-1 max-w-xs truncate text-lg font-bold">{title || 'Your property'}</p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-3xl border border-[#d6ded9] bg-white p-3 shadow-sm">
              {[
                ['01', 'The stay'],
                ['02', 'Guest comforts'],
                ['03', 'Location'],
                ['04', 'Photo studio'],
                ['05', 'Host contact'],
              ].map(([num, label]) => (
                <div key={num} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-[#46635d]">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e6f0ea] text-[10px] font-black text-[#28655c]">{num}</span>
                  <span className="font-semibold">{label}</span>
                </div>
              ))}
              <div className="mx-2 my-2 border-t border-[#e2e8e4]" />
              <p className="px-3 py-2 text-xs leading-5 text-[#71827d]">Changes are saved together when you finish.</p>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="min-w-0 space-y-6">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
            )}
            {saved && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <Check className="h-4 w-4" /> Listing updated successfully. Returning to dashboard...
              </div>
            )}

            <section className="rounded-[28px] border border-[#d6ded9] bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-7 flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e6f0ea] text-[#28655c]"><Home className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#28655c]">01 · The stay</p>
                  <h2 className="mt-1 text-xl font-bold text-[#173f3a]">What should guests know?</h2>
                  <p className="mt-1 text-sm text-[#71827d]">Keep the core information clear, useful and inviting.</p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-[#35544e]">Property title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Example: Cozy 2BHK near GS Road" className="w-full rounded-2xl border border-[#cbd7d1] bg-[#fbfcfa] px-4 py-3.5 text-sm outline-none transition focus:border-[#28655c] focus:ring-4 focus:ring-[#28655c]/10" required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#35544e]">Neighbourhood</label>
                  <select value={locality} onChange={(e) => setLocality(e.target.value)} className="w-full rounded-2xl border border-[#cbd7d1] bg-[#fbfcfa] px-4 py-3.5 text-sm outline-none focus:border-[#28655c] focus:ring-4 focus:ring-[#28655c]/10" required>
                    <option value="">Choose locality</option>
                    {LOCALITIES.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#35544e]">Nightly price</label>
                  <div className="relative">
                    <IndianRupee className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-[#71827d]" />
                    <input type="number" min="1" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} className="w-full rounded-2xl border border-[#cbd7d1] bg-[#fbfcfa] py-3.5 pl-10 pr-4 text-sm outline-none focus:border-[#28655c] focus:ring-4 focus:ring-[#28655c]/10" required />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-[#35544e]"><FileText className="h-4 w-4" /> Your property's story</label>
                  <textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your property, nearby attractions, facilities and what makes the stay special..." className="w-full resize-y rounded-2xl border border-[#cbd7d1] bg-[#fbfcfa] px-4 py-3.5 text-sm leading-6 outline-none focus:border-[#28655c] focus:ring-4 focus:ring-[#28655c]/10" required />
                  <p className="mt-2 text-right text-xs text-[#71827d]">{description.length} characters</p>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#d6ded9] bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#28655c]">02 · Guest comforts</p>
                <h2 className="mt-1 text-xl font-bold text-[#173f3a]">What can guests use?</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {FEATURES.map(({ key, label, icon: Icon }) => {
                  const active = features.includes(key);
                  return <button type="button" key={key} onClick={() => toggleFeature(key)} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${active ? 'border-[#7aa99b] bg-[#e6f0ea] text-[#173f3a]' : 'border-[#d6ded9] bg-[#fbfcfa] text-[#46635d] hover:border-[#a8beb6]'}`}>
                    <span className={`grid h-10 w-10 place-items-center rounded-xl ${active ? 'bg-[#28655c] text-white' : 'bg-white text-[#71827d]'}`}><Icon className="h-5 w-5" /></span>
                    <span className="flex-1 text-sm font-bold">{label}</span>
                    {active && <Check className="h-5 w-5 text-[#28655c]" />}
                  </button>;
                })}
              </div>
            </section>

            <section className="rounded-[28px] border border-[#d6ded9] bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-7 flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e6f0ea] text-[#28655c]"><MapPin className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#28655c]">03 · Pin the place</p>
                  <h2 className="mt-1 text-xl font-bold text-[#173f3a]">Keep the location precise</h2>
                  <p className="mt-1 text-sm text-[#71827d]">Use GPS at the property or refine the coordinates manually.</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input type="number" inputMode="decimal" step="0.000001" min="-90" max="90" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude e.g. 26.144500" className="rounded-2xl border border-[#cbd7d1] bg-[#fbfcfa] px-4 py-3.5 text-sm outline-none focus:border-[#28655c]" required />
                <input type="number" inputMode="decimal" step="0.000001" min="-180" max="180" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Longitude e.g. 91.736200" className="rounded-2xl border border-[#cbd7d1] bg-[#fbfcfa] px-4 py-3.5 text-sm outline-none focus:border-[#28655c]" required />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={useCurrentLocation} disabled={locationLoading} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#28655c] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#173f3a] disabled:opacity-60">
                  {locationLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Finding your location…</> : <><MapPin className="h-4 w-4" />Use my current location</>}
                </button>
                <button type="button" onClick={openCoordinatesInMaps} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#a8beb6] bg-white px-4 py-3.5 text-sm font-bold text-[#28655c] transition hover:bg-[#e6f0ea]"><MapPin className="h-4 w-4" />Check on Google Maps</button>
              </div>
              {locationMessage && <p className="mt-3 rounded-2xl bg-[#e6f0ea] px-4 py-3 text-xs font-semibold leading-5 text-[#35544e]">{locationMessage}</p>}
            </section>

            <section className="rounded-[28px] border border-[#d6ded9] bg-white p-5 shadow-sm sm:p-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#28655c]">04 · Photo studio</p>
                  <h2 className="mt-1 text-xl font-bold text-[#173f3a]">Curate your visual story</h2>
                  <p className="mt-1 text-sm text-[#71827d]">Your first photo becomes the cover. Drag or use arrows to reorder.</p>
                </div>
                <span className="w-fit rounded-full bg-[#e6f0ea] px-3 py-2 text-xs font-bold text-[#28655c]">{gallery.length}/8 photos</span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#28655c] px-4 py-4 text-sm font-bold text-white transition hover:bg-[#173f3a]"><ImageIcon className="h-4 w-4" />Choose photos<input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={handlePhotoFiles} className="hidden" /></label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#a8beb6] bg-[#e6f0ea] px-4 py-4 text-sm font-bold text-[#28655c] transition hover:bg-[#dceae4]">📷 Take photo with camera<input type="file" accept="image/*" capture="environment" onChange={handlePhotoFiles} className="hidden" /></label>
              </div>
              {gallery.length > 0 ? (
                <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {gallery.map((item, index) => <div key={item.id} draggable onDragStart={() => setDraggedImageIndex(index)} onDragOver={(e) => e.preventDefault()} onDrop={() => handleImageDrop(index)} onDragEnd={() => setDraggedImageIndex(null)} className={`group relative overflow-hidden rounded-2xl border bg-[#edf1ee] transition ${draggedImageIndex === index ? 'scale-[0.98] border-[#28655c] opacity-70' : 'border-[#d6ded9]'}`}>
                    <div className="aspect-[4/3]"><img src={item.url} alt={`Property photo ${index + 1}`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} /></div>
                    <div className="absolute left-2 top-2 rounded-full bg-[#173f3a]/85 px-2 py-1 text-[9px] font-bold text-white">{index === 0 ? '★ COVER' : `PHOTO ${index + 1}`}</div>
                    {item.kind === 'new' && <div className="absolute right-2 top-2 rounded-full bg-[#f3bd2f] px-2 py-1 text-[9px] font-bold text-[#173f3a]">NEW</div>}
                    <div className="absolute inset-x-2 bottom-2 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                      <button type="button" onClick={() => moveImage(index, index - 1)} disabled={index === 0} className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-[#173f3a] disabled:opacity-40">←</button>
                      <button type="button" onClick={() => moveImage(index, index + 1)} disabled={index === gallery.length - 1} className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-[#173f3a] disabled:opacity-40">→</button>
                      <button type="button" onClick={() => removePhoto(index)} className="ml-auto rounded-lg bg-red-600 px-2 py-1 text-xs font-bold text-white">Remove</button>
                    </div>
                  </div>)}
                </div>
              ) : <div className="mt-5 rounded-3xl border border-dashed border-[#a8beb6] bg-[#f6f9f7] p-10 text-center"><ImageIcon className="mx-auto h-8 w-8 text-[#28655c]" /><p className="mt-3 font-bold text-[#173f3a]">Your gallery is ready</p><p className="mt-1 text-sm text-[#71827d]">Add your first property photo above.</p></div>}
            </section>

            <section className="rounded-[28px] border border-[#d6ded9] bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e6f0ea] text-[#28655c]"><User className="h-5 w-5" /></div>
                <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#28655c]">05 · Host contact</p><h2 className="mt-1 text-xl font-bold text-[#173f3a]">The person behind the stay</h2></div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Host phone number" className="rounded-2xl border border-[#cbd7d1] bg-[#fbfcfa] px-4 py-3.5 text-sm outline-none focus:border-[#28655c]" />
                <input type="url" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="Host avatar URL" className="rounded-2xl border border-[#cbd7d1] bg-[#fbfcfa] px-4 py-3.5 text-sm outline-none focus:border-[#28655c]" />
              </div>
            </section>

            <div className="sticky bottom-3 z-20 rounded-3xl border border-[#cbd7d1] bg-white/95 p-3 shadow-xl backdrop-blur">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link href="/dashboard" className="inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-bold text-[#46635d] hover:bg-[#f0f4f1]">Discard changes</Link>
                <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#f3bd2f] px-7 py-3.5 text-sm font-bold text-[#173f3a] shadow-md transition hover:bg-[#ffd35a] disabled:opacity-60">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving changes…</> : <><Save className="h-4 w-4" />Save changes</>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function EditPropertyPage() {
  return (
    <div className="min-h-screen bg-[#f6f3ed] font-sans text-[#173f3a]">
      <header className="sticky top-0 z-50 border-b border-[#d7dfda] bg-[#f6f3ed]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-bold text-[#35544e] transition hover:text-[#28655c]"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            href="/"
            className="text-lg font-black tracking-tight text-[#173f3a]"
          >
            Stay<span className="text-[#28655c]">Guwahati</span>
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

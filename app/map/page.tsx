'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  Home,
  List,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Wifi,
  X,
  Car,
  Snowflake,
  Users,
} from 'lucide-react';

interface Homestay {
  id?: string;
  _id?: string;
  title: string;
  locality?: string;
  pricePerNight?: number;
  price?: number;
  lat?: number;
  lng?: number;
  images?: string[];
  verified?: boolean;
  isVerified?: boolean;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://stayguwahati-backend.onrender.com';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=85';

export default function LiveMapPage() {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);

  const [loadedProperties, setLoadedProperties] = useState<Homestay[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  const [activeMarkersMap, setActiveMarkersMap] = useState<Record<string, any>>(
    {}
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

      await import('leaflet');

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (mounted) setIsLeafletLoaded(true);
    };

    loadLeaflet();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      let properties: Homestay[] = [];

      try {
        const res = await fetch(`${BACKEND_URL}/api/homestays`);
        if (res.ok) {
          const data = await res.json();
          properties = data.data || data || [];
        } else {
          properties = JSON.parse(
            localStorage.getItem('userProperties') || '[]'
          );
        }
      } catch (error) {
        console.error('Fetch error, using localStorage fallback:', error);
        properties = JSON.parse(
          localStorage.getItem('userProperties') || '[]'
        );
      }

      if (!Array.isArray(properties) || properties.length === 0) {
        properties = [
          {
            id: 'sample-1',
            title: 'Green Villa',
            pricePerNight: 1600,
            locality: 'Bhangagarh',
            lat: 26.155,
            lng: 91.76,
            images: [FALLBACK_IMAGE],
            verified: true,
          },
        ];
      }

      setLoadedProperties(properties);
    };

    fetchData();
  }, []);

  const filteredProperties = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = loadedProperties.filter((stay) => {
      const matchesQuery =
        !query ||
        (stay.title || '').toLowerCase().includes(query) ||
        (stay.locality || '').toLowerCase().includes(query);

      if (!verifiedOnly) return matchesQuery;

      return matchesQuery && (stay.verified === true || stay.isVerified === true);
    });

    if (sortBy === 'low-high') {
      result.sort(
        (a, b) =>
          (a.pricePerNight || a.price || 0) -
          (b.pricePerNight || b.price || 0)
      );
    }

    if (sortBy === 'high-low') {
      result.sort(
        (a, b) =>
          (b.pricePerNight || b.price || 0) -
          (a.pricePerNight || a.price || 0)
      );
    }

    return result;
  }, [loadedProperties, searchQuery, sortBy, verifiedOnly]);

  useEffect(() => {
    if (
      !isLeafletLoaded ||
      !mapContainerRef.current ||
      mapInstanceRef.current
    ) {
      return;
    }

    const L = (window as any).L || require('leaflet');

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
    }).setView([26.1445, 91.7362], 13);

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    setMapReady(true);

    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerGroupRef.current = null;
      setMapReady(false);
    };
  }, [isLeafletLoaded]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerGroupRef.current || !isLeafletLoaded) {
      return;
    }

    const L = (window as any).L || require('leaflet');

    markerGroupRef.current.clearLayers();
    const newMarkersMap: Record<string, any> = {};

    filteredProperties.forEach((stay) => {
      if (stay.lat == null || stay.lng == null) return;

      const propId = stay.id || stay._id || '';
      const price = Number(stay.pricePerNight || stay.price || 1500);
      const priceFormatted = `₹${price.toLocaleString('en-IN')}`;

      const customIcon = L.divIcon({
        className: 'stay-marker-wrapper',
        html: `<button type="button" class="stay-price-marker" id="marker-${propId}">${priceFormatted}</button>`,
        iconSize: [92, 38],
        iconAnchor: [46, 19],
      });

      const marker = L.marker([stay.lat, stay.lng], {
        icon: customIcon,
        keyboard: true,
        title: stay.title,
      });

      marker.on('click', () => {
        setSelectedId(propId);
        viewPropertyDetails(propId);
      });

      marker.addTo(markerGroupRef.current);
      newMarkersMap[propId] = marker;
    });

    setActiveMarkersMap(newMarkersMap);
  }, [filteredProperties, isLeafletLoaded]);

  useEffect(() => {
    if (mobileView === 'map' && mapInstanceRef.current) {
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 180);
    }
  }, [mobileView]);

  const highlightMarker = (propId: string, highlight: boolean) => {
    const marker = activeMarkersMap[propId];

    if (!marker?._icon) return;

    const badge = marker._icon.querySelector('.stay-price-marker');

    if (badge) {
      badge.classList.toggle('active-pin', highlight);
    }
  };

  const focusOnProperty = (lat?: number, lng?: number, id?: string) => {
    if (lat == null || lng == null || !mapInstanceRef.current) return;

    setSelectedId(id || null);

    if (window.innerWidth < 1024) setMobileView('map');

    mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.1 });

    if (id) {
      highlightMarker(id, true);
      window.setTimeout(() => highlightMarker(id, false), 1800);
    }
  };

  const viewPropertyDetails = (propId: string) => {
    const property = loadedProperties.find(
      (p) => (p.id || p._id || '') === propId
    );

    if (property) {
      sessionStorage.setItem('selectedProperty', JSON.stringify(property));
    }

    router.push(`/property-details?id=${encodeURIComponent(propId)}`);
  };

  const locateGuwahati = () => {
    mapInstanceRef.current?.flyTo([26.1445, 91.7362], 13, {
      duration: 0.8,
    });
  };

  return (
    <>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5d1;
          border-radius: 999px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .stay-marker-wrapper {
          background: transparent !important;
          border: 0 !important;
        }

        .stay-price-marker {
          appearance: none;
          border: 1px solid rgba(255, 255, 255, 0.9);
          background: #ffffff;
          color: #173f3c;
          border-radius: 999px;
          padding: 7px 12px;
          min-width: 76px;
          font-size: 12px;
          font-weight: 900;
          line-height: 1;
          box-shadow: 0 6px 20px rgba(20, 53, 48, 0.18);
          cursor: pointer;
          transition: transform 180ms ease, background 180ms ease,
            color 180ms ease, box-shadow 180ms ease;
        }

        .stay-price-marker:hover,
        .stay-price-marker.active-pin {
          background: #173f3c;
          color: #ffffff;
          transform: scale(1.1);
          box-shadow: 0 10px 28px rgba(23, 63, 60, 0.3);
        }

        .leaflet-control-zoom {
          border: 0 !important;
          box-shadow: 0 8px 24px rgba(23, 63, 60, 0.15) !important;
          border-radius: 14px !important;
          overflow: hidden;
        }

        .leaflet-control-zoom a {
          width: 38px !important;
          height: 38px !important;
          line-height: 38px !important;
          color: #173f3c !important;
          border: 0 !important;
          font-weight: 800;
        }

        .leaflet-control-attribution {
          font-size: 9px !important;
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(8px);
        }
      `}</style>

      <div className="flex h-screen flex-col overflow-hidden bg-[#f7f8f6] font-sans text-slate-900 antialiased">
        {/* Header */}
        <header className="z-50 shrink-0 border-b border-[#dfe6e2] bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex h-[72px] w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="group flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#173f3c] text-white shadow-lg shadow-[#173f3c]/15 transition group-hover:scale-105">
                <Home size={19} strokeWidth={2.5} />
              </div>

              <div className="leading-none">
                <div className="text-[20px] font-black tracking-tight text-[#173f3c]">
                  Stay<span className="text-[#21867b]">Guwahati</span>
                </div>
                <div className="mt-1 hidden text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:block">
                  Local stays. Meaningful stays.
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-8 text-sm font-bold md:flex">
              <Link href="/" className="text-slate-500 transition hover:text-[#21867b]">
                Home
              </Link>
              <Link href="/dashboard" className="text-slate-500 transition hover:text-[#21867b]">
                Dashboard
              </Link>
              <Link
                href="/map"
                className="flex h-[72px] items-center border-b-2 border-[#21867b] text-[#173f3c]"
              >
                Live Map
              </Link>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 sm:inline-flex"
                aria-label="Menu"
              >
                <Menu size={17} />
              </button>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-[#173f3c] px-3.5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-[#173f3c]/15 transition hover:-translate-y-0.5 hover:bg-[#0f312e] sm:px-4"
              >
                <span className="text-base leading-none">+</span>
                <span className="hidden sm:inline">List Your Stay</span>
                <span className="sm:hidden">List</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Search / filters */}
        <section className="z-40 shrink-0 border-b border-[#e1e7e3] bg-white px-3 py-3 shadow-sm sm:px-5 lg:px-7">
          <div className="mx-auto flex max-w-[1600px] items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stays or localities in Guwahati"
                className="h-12 w-full rounded-2xl border border-[#d9e2dd] bg-[#f8faf8] pl-11 pr-10 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-[#2c756c] focus:bg-white focus:ring-4 focus:ring-[#2c756c]/10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="hidden h-12 rounded-2xl border border-[#d9e2dd] bg-white px-3 text-xs font-extrabold text-slate-700 outline-none hover:bg-slate-50 md:block"
              aria-label="Sort stays"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>

            <button
              type="button"
              onClick={() => setVerifiedOnly((value) => !value)}
              className={`hidden h-12 items-center gap-2 rounded-2xl border px-4 text-xs font-extrabold transition lg:inline-flex ${
                verifiedOnly
                  ? 'border-[#173f3c] bg-[#173f3c] text-white'
                  : 'border-[#d9e2dd] bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck size={16} />
              Verified
              {verifiedOnly && <Check size={15} />}
            </button>

            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              className={`inline-flex h-12 items-center gap-2 rounded-2xl border px-3.5 text-xs font-extrabold transition ${
                showFilters
                  ? 'border-[#173f3c] bg-[#173f3c] text-white'
                  : 'border-[#d9e2dd] bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="mx-auto mt-3 flex max-w-[1600px] flex-wrap gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setVerifiedOnly((value) => !value)}
                className={`rounded-full px-4 py-2 text-xs font-bold ${
                  verifiedOnly
                    ? 'bg-[#173f3c] text-white'
                    : 'bg-[#f1f5f2] text-slate-600'
                }`}
              >
                <ShieldCheck size={14} className="mr-1.5 inline" />
                Verified only
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 md:hidden"
              >
                <option value="recommended">Recommended</option>
                <option value="low-high">Lowest price</option>
                <option value="high-low">Highest price</option>
              </select>
            </div>
          )}
        </section>

        {/* Mobile switcher */}
        <div className="z-40 flex shrink-0 justify-center border-b border-slate-200 bg-white p-2 lg:hidden">
          <div className="flex w-full max-w-sm rounded-2xl bg-[#edf2ef] p-1">
            <button
              type="button"
              onClick={() => setMobileView('list')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition ${
                mobileView === 'list'
                  ? 'bg-[#173f3c] text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <List size={15} />
              Stays
            </button>
            <button
              type="button"
              onClick={() => setMobileView('map')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition ${
                mobileView === 'map'
                  ? 'bg-[#173f3c] text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <MapIcon size={15} />
              Map
            </button>
          </div>
        </div>

        <main className="relative flex min-h-0 flex-1 overflow-hidden">
          {/* Listings */}
          <aside
            className={`flex w-full shrink-0 flex-col border-r border-[#dfe6e2] bg-white lg:w-[430px] xl:w-[500px] ${
              mobileView === 'list' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h1 className="text-lg font-black tracking-tight text-[#173f3c]">
                  Explore stays
                </h1>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {filteredProperties.length} stay
                  {filteredProperties.length === 1 ? '' : 's'} available in Guwahati
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef7f4] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#24645d]">
                <MapPin size={12} />
                Guwahati
              </span>
            </div>

            <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              {filteredProperties.length === 0 ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[#eef3f0] text-[#4d716b]">
                    <Search size={25} />
                  </div>
                  <h2 className="mt-5 text-base font-black text-slate-800">
                    No stays found
                  </h2>
                  <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
                    Try a different locality, property name, or remove the verified filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setVerifiedOnly(false);
                    }}
                    className="mt-5 rounded-xl bg-[#173f3c] px-4 py-2.5 text-xs font-extrabold text-white"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filteredProperties.map((stay) => {
                  const propId = stay.id || stay._id || '';
                  const price = Number(
                    stay.pricePerNight || stay.price || 1500
                  ).toLocaleString('en-IN');

                  const img =
                    stay.images?.[0]
                      ? stay.images[0].startsWith('/uploads')
                        ? `${BACKEND_URL}${stay.images[0]}`
                        : stay.images[0]
                      : FALLBACK_IMAGE;

                  const verified =
                    stay.verified === true || stay.isVerified === true;

                  const selected = selectedId === propId;

                  return (
                    <article
                      key={propId}
                      onMouseEnter={() => highlightMarker(propId, true)}
                      onMouseLeave={() => highlightMarker(propId, false)}
                      className={`group overflow-hidden rounded-[24px] border bg-white transition-all duration-300 ${
                        selected
                          ? 'border-[#2c756c] shadow-[0_14px_40px_rgba(23,63,60,0.12)]'
                          : 'border-[#e1e7e3] hover:border-[#b7d4ce] hover:shadow-[0_14px_40px_rgba(23,63,60,0.09)]'
                      }`}
                    >
                      <div
                        className="relative h-[190px] cursor-pointer overflow-hidden bg-slate-100"
                        onClick={() =>
                          focusOnProperty(stay.lat, stay.lng, propId)
                        }
                      >
                        <img
                          src={img}
                          alt={stay.title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.045]"
                          loading="lazy"
                        />

                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />

                        {verified && (
                          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1.5 text-[9px] font-black tracking-wider text-[#173f3c] shadow-sm backdrop-blur">
                            <ShieldCheck size={12} className="text-[#21867b]" />
                            VERIFIED
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(event) => event.stopPropagation()}
                          aria-label="Save stay"
                          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-slate-600 shadow-sm backdrop-blur transition hover:scale-105 hover:text-rose-500"
                        >
                          <Heart size={17} />
                        </button>

                        <span className="absolute bottom-3 left-3 rounded-full bg-[#173f3c]/90 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur">
                          {stay.locality || 'Guwahati'}
                        </span>
                      </div>

                      <div
                        className="cursor-pointer p-4"
                        onClick={() => viewPropertyDetails(propId)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-[16px] font-black tracking-tight text-slate-900 transition group-hover:text-[#21867b]">
                              {stay.title}
                            </h3>
                            <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-slate-500">
                              <MapPin size={13} className="text-[#21867b]" />
                              {stay.locality || 'Guwahati'}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1 text-xs font-extrabold text-slate-800">
                            <Star size={13} fill="currentColor" className="text-amber-400" />
                            4.9
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold text-slate-500">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1.5">
                            <Wifi size={12} />
                            Wi-Fi
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1.5">
                            <Snowflake size={12} />
                            AC
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1.5">
                            <Car size={12} />
                            Parking
                          </span>
                        </div>

                        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                          <div>
                            <span className="text-lg font-black text-[#173f3c]">
                              ₹{price}
                            </span>
                            <span className="ml-1 text-[11px] font-medium text-slate-400">
                              / night
                            </span>
                          </div>

                          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#21867b]">
                            View details
                            <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </aside>

          {/* Map */}
          <section
            className={`relative min-w-0 flex-1 bg-[#e8eee9] ${
              mobileView === 'map' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div ref={mapContainerRef} className="absolute inset-0 z-10" />

            {!mapReady && (
              <div className="absolute inset-0 z-20 grid place-items-center bg-[#edf2ef]/80 backdrop-blur-sm">
                <div className="rounded-2xl border border-white/80 bg-white/95 px-5 py-4 text-center shadow-xl">
                  <div className="mx-auto mb-2 h-7 w-7 animate-spin rounded-full border-2 border-[#d5e2de] border-t-[#173f3c]" />
                  <p className="text-xs font-bold text-[#173f3c]">
                    Loading Guwahati map…
                  </p>
                </div>
              </div>
            )}

            {/* Map overlay controls */}
            <div className="absolute left-4 top-4 z-30 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={locateGuwahati}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/80 bg-white/95 px-4 text-xs font-extrabold text-[#173f3c] shadow-[0_8px_28px_rgba(23,63,60,0.14)] backdrop-blur transition hover:-translate-y-0.5"
              >
                <LocateFixed size={16} />
                Recenter
              </button>

              <div className="hidden items-center gap-2 rounded-2xl border border-white/80 bg-white/95 px-4 text-xs font-bold text-slate-600 shadow-[0_8px_28px_rgba(23,63,60,0.14)] backdrop-blur sm:flex">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#eaf5f2] text-[#21867b]">
                  <MapPin size={13} />
                </span>
                {filteredProperties.length} stays on map
              </div>
            </div>

            {/* Map legend / promo */}
            <div className="absolute bottom-5 left-4 z-30 hidden max-w-[330px] overflow-hidden rounded-[22px] border border-white/80 bg-white/95 shadow-[0_14px_40px_rgba(23,63,60,0.16)] backdrop-blur sm:block">
              <div className="flex items-center gap-3 p-3.5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eef7f4] text-[#173f3c]">
                  <Home size={21} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-[#173f3c]">
                    Find your Guwahati stay
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                    Select a price marker to explore a property.
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile map count */}
            <div className="absolute bottom-5 right-4 z-30 rounded-full border border-white/80 bg-white/95 px-3.5 py-2 text-[11px] font-extrabold text-[#173f3c] shadow-lg backdrop-blur sm:hidden">
              {filteredProperties.length} stays
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

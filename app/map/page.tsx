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
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Users,
  Wifi,
  X,
  Car,
  Snowflake,
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
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&q=85';

export default function LiveMapPage() {
  const router = useRouter();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [loadedProperties, setLoadedProperties] = useState<Homestay[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeMarkersMap, setActiveMarkersMap] =
    useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* Load Leaflet only in the browser. */
  useEffect(() => {
    let mounted = true;

    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

      try {
        const leaflet = await import('leaflet');

        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href =
            'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        if (mounted) {
          leafletRef.current = leaflet;
          setIsLeafletLoaded(true);
        }
      } catch (error) {
        console.error('Leaflet failed to load:', error);
      }
    };

    loadLeaflet();

    return () => {
      mounted = false;
    };
  }, []);

  /* Fetch homestays from the existing backend. */
  useEffect(() => {
    const fetchData = async () => {
      let properties: Homestay[] = [];

      try {
        const response = await fetch(`${BACKEND_URL}/api/homestays`, {
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          properties = data?.data || data || [];
        } else {
          properties = JSON.parse(
            localStorage.getItem('userProperties') || '[]'
          );
        }
      } catch (error) {
        console.error(
          'Fetch error, using localStorage fallback:',
          error
        );

        try {
          properties = JSON.parse(
            localStorage.getItem('userProperties') || '[]'
          );
        } catch {
          properties = [];
        }
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

  /* Search + sort. */
  const filteredProperties = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = loadedProperties.filter((stay) => {
      const title = (stay.title || '').toLowerCase();
      const locality = (stay.locality || '').toLowerCase();

      const matchesQuery =
        !query || title.includes(query) || locality.includes(query);

      if (!matchesQuery) return false;

      if (verifiedOnly) {
        return stay.verified === true || stay.isVerified === true;
      }

      return true;
    });

    if (sortBy === 'low-high') {
      result.sort(
        (a, b) =>
          Number(a.pricePerNight || a.price || 0) -
          Number(b.pricePerNight || b.price || 0)
      );
    }

    if (sortBy === 'high-low') {
      result.sort(
        (a, b) =>
          Number(b.pricePerNight || b.price || 0) -
          Number(a.pricePerNight || a.price || 0)
      );
    }

    return result;
  }, [loadedProperties, searchQuery, sortBy, verifiedOnly]);

  /* Create the map once. */
  useEffect(() => {
    if (
      !isLeafletLoaded ||
      !leafletRef.current ||
      !mapContainerRef.current ||
      mapInstanceRef.current
    ) {
      return;
    }

    const L = leafletRef.current;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
    }).setView([26.1445, 91.7362], 13);

    /*
     * CARTO Voyager is used here because it does not require a
     * Google Maps API key. Keep this tile source unless you
     * intentionally switch map providers.
     */
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    L.control.zoom({
      position: 'bottomright',
    }).addTo(map);

    markerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    setMapReady(true);

    window.setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerGroupRef.current = null;
      setMapReady(false);
    };
  }, [isLeafletLoaded]);

  /* Render price markers from the filtered results. */
  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !markerGroupRef.current ||
      !leafletRef.current
    ) {
      return;
    }

    const L = leafletRef.current;

    markerGroupRef.current.clearLayers();

    const markerMap: Record<string, any> = {};

    filteredProperties.forEach((stay) => {
      if (stay.lat == null || stay.lng == null) return;

      const propId = stay.id || stay._id || '';
      if (!propId) return;

      const price = Number(stay.pricePerNight || stay.price || 1500);
      const priceFormatted = `₹${price.toLocaleString('en-IN')}`;

      const icon = L.divIcon({
        className: 'stay-marker-wrapper',
        html: `
          <button
            type="button"
            class="stay-price-marker"
            data-marker-id="${propId}"
            aria-label="${stay.title || 'Stay'} ${priceFormatted} per night"
          >
            ${priceFormatted}
          </button>
        `,
        iconSize: [100, 40],
        iconAnchor: [50, 20],
      });

      const marker = L.marker([stay.lat, stay.lng], {
        icon,
        title: stay.title,
        keyboard: true,
      });

      marker.on('click', () => {
        setSelectedId(propId);
        viewPropertyDetails(propId);
      });

      marker.addTo(markerGroupRef.current);
      markerMap[propId] = marker;
    });

    setActiveMarkersMap(markerMap);
  }, [filteredProperties]);

  /* Keep Leaflet happy when switching between mobile list/map views. */
  useEffect(() => {
    if (mobileView === 'map' && mapInstanceRef.current) {
      window.setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 180);
    }
  }, [mobileView]);

  const highlightMarker = (propId: string, active: boolean) => {
    const marker = activeMarkersMap[propId];

    if (!marker?._icon) return;

    const element = marker._icon.querySelector('.stay-price-marker');

    if (element) {
      element.classList.toggle('active-pin', active);
    }
  };

  const focusOnProperty = (
    lat?: number,
    lng?: number,
    propId?: string
  ) => {
    if (lat == null || lng == null || !mapInstanceRef.current) return;

    setSelectedId(propId || null);

    if (window.innerWidth < 1024) {
      setMobileView('map');
    }

    mapInstanceRef.current.flyTo([lat, lng], 15, {
      duration: 1.1,
    });

    if (propId) {
      highlightMarker(propId, true);

      window.setTimeout(() => {
        highlightMarker(propId, false);
      }, 1800);
    }
  };

  const viewPropertyDetails = (propId: string) => {
    const property = loadedProperties.find(
      (stay) => (stay.id || stay._id || '') === propId
    );

    if (property) {
      sessionStorage.setItem(
        'selectedProperty',
        JSON.stringify(property)
      );
    }

    router.push(
      `/property-details?id=${encodeURIComponent(propId)}`
    );
  };

  const recenterMap = () => {
    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.flyTo(
      [26.1445, 91.7362],
      13,
      { duration: 0.8 }
    );
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedId(null);
  };

  return (
    <>
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c9d7d2;
          border-radius: 999px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9fbab2;
        }

        .stay-marker-wrapper {
          background: transparent !important;
          border: 0 !important;
        }

        .stay-price-marker {
          appearance: none;
          border: 1px solid rgba(255, 255, 255, 0.95);
          background: #ffffff;
          color: #173f3c;
          border-radius: 999px;
          min-width: 78px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 900;
          line-height: 1;
          white-space: nowrap;
          cursor: pointer;
          box-shadow:
            0 5px 12px rgba(23, 63, 60, 0.14),
            0 1px 3px rgba(23, 63, 60, 0.12);
          transition:
            transform 180ms ease,
            background 180ms ease,
            color 180ms ease,
            box-shadow 180ms ease;
        }

        .stay-price-marker:hover,
        .stay-price-marker.active-pin {
          background: #173f3c;
          color: #ffffff;
          transform: scale(1.12);
          box-shadow:
            0 10px 24px rgba(23, 63, 60, 0.28),
            0 2px 5px rgba(23, 63, 60, 0.18);
        }

        .leaflet-control-zoom {
          border: 0 !important;
          overflow: hidden;
          border-radius: 16px !important;
          box-shadow:
            0 10px 30px rgba(23, 63, 60, 0.16) !important;
        }

        .leaflet-control-zoom a {
          width: 42px !important;
          height: 42px !important;
          line-height: 42px !important;
          border: 0 !important;
          color: #173f3c !important;
          font-weight: 900 !important;
          background: rgba(255, 255, 255, 0.96) !important;
        }

        .leaflet-control-zoom a:hover {
          background: #f1f7f4 !important;
        }

        .leaflet-control-attribution {
          font-size: 9px !important;
          border-radius: 8px 0 0 0;
          background: rgba(255, 255, 255, 0.82) !important;
          backdrop-filter: blur(8px);
        }
      `}</style>

      <div className="flex h-screen flex-col overflow-hidden bg-[#f7f9f7] font-sans text-slate-900 antialiased">
        {/* ================= HEADER ================= */}
        <header className="z-50 shrink-0 border-b border-[#dfe7e3] bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex h-[78px] w-full max-w-[1680px] items-center justify-between px-5 sm:px-7 lg:px-9">
            <Link
              href="/"
              className="group flex items-center gap-3.5"
            >
              <div className="grid h-11 w-11 place-items-center rounded-[15px] bg-[#173f3c] text-white shadow-[0_7px_20px_rgba(23,63,60,0.18)] transition group-hover:scale-105">
                <Home size={20} strokeWidth={2.5} />
              </div>

              <div className="leading-none">
                <div className="text-[21px] font-black tracking-[-0.04em] text-[#173f3c]">
                  Stay<span className="text-[#21867b]">Guwahati</span>
                </div>

                <div className="mt-1.5 hidden text-[9px] font-bold uppercase tracking-[0.19em] text-slate-400 sm:block">
                  Local stays. Meaningful stays.
                </div>
              </div>
            </Link>

            <nav className="hidden h-full items-center gap-9 text-[13px] font-extrabold md:flex">
              <Link
                href="/"
                className="flex h-full items-center border-b-2 border-transparent text-slate-500 transition hover:text-[#21867b]"
              >
                Home
              </Link>

              <Link
                href="/dashboard"
                className="flex h-full items-center border-b-2 border-transparent text-slate-500 transition hover:text-[#21867b]"
              >
                Dashboard
              </Link>

              <Link
                href="/map"
                className="flex h-full items-center border-b-2 border-[#21867b] text-[#173f3c]"
              >
                Live Map
              </Link>
            </nav>

            <div className="relative flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-[#dce5e1] bg-white text-slate-500 transition hover:bg-[#f4f8f6] hover:text-[#173f3c] md:hidden"
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>

              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#173f3c] px-4 text-xs font-extrabold text-white shadow-[0_7px_20px_rgba(23,63,60,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0f312e] sm:px-5"
              >
                <span className="text-lg leading-none">+</span>
                <span className="hidden sm:inline">
                  List Your Stay
                </span>
                <span className="sm:hidden">List</span>
              </Link>

              {menuOpen && (
                <div className="absolute right-0 top-12 z-[100] w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl md:hidden">
                  <Link
                    href="/"
                    className="block rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Home
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/map"
                    className="block rounded-xl bg-[#eef7f4] px-3 py-2.5 text-sm font-extrabold text-[#173f3c]"
                  >
                    Live Map
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ================= SEARCH BAR ================= */}
        <section className="z-40 shrink-0 border-b border-[#e1e8e4] bg-white px-4 py-3.5 shadow-[0_2px_12px_rgba(23,63,60,0.04)] sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1680px] items-center gap-2.5">
            <div className="relative min-w-0 flex-1">
              <Search
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search stays or localities in Guwahati"
                className="h-[52px] w-full rounded-2xl border border-[#d7e2dd] bg-[#f9fbfa] pl-11 pr-11 text-[13px] font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2b746b] focus:bg-white focus:ring-4 focus:ring-[#2b746b]/10"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="relative hidden md:block">
              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
                className="h-[52px] min-w-[156px] appearance-none rounded-2xl border border-[#d7e2dd] bg-white pl-4 pr-10 text-xs font-extrabold text-slate-700 outline-none transition hover:bg-[#f8faf9] focus:border-[#2b746b]"
                aria-label="Sort stays"
              >
                <option value="recommended">
                  Sort: Recommended
                </option>
                <option value="low-high">
                  Price: Low to High
                </option>
                <option value="high-low">
                  Price: High to Low
                </option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setVerifiedOnly((value) => !value)
              }
              className={`hidden h-[52px] items-center gap-2 rounded-2xl border px-4 text-xs font-extrabold transition lg:inline-flex ${
                verifiedOnly
                  ? 'border-[#173f3c] bg-[#173f3c] text-white'
                  : 'border-[#d7e2dd] bg-white text-slate-700 hover:bg-[#f8faf9]'
              }`}
            >
              <ShieldCheck size={16} />
              Verified
              {verifiedOnly && <Check size={14} />}
            </button>

            <button
              type="button"
              onClick={() =>
                setShowFilters((value) => !value)
              }
              className={`inline-flex h-[52px] items-center gap-2 rounded-2xl border px-3.5 text-xs font-extrabold transition sm:px-4 ${
                showFilters
                  ? 'border-[#173f3c] bg-[#173f3c] text-white'
                  : 'border-[#d7e2dd] bg-white text-slate-700 hover:bg-[#f8faf9]'
              }`}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">
                Filters
              </span>
            </button>
          </div>

          {showFilters && (
            <div className="mx-auto mt-3 flex max-w-[1680px] flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() =>
                  setVerifiedOnly((value) => !value)
                }
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold ${
                  verifiedOnly
                    ? 'bg-[#173f3c] text-white'
                    : 'bg-[#eef4f1] text-slate-600'
                }`}
              >
                <ShieldCheck size={14} />
                Verified only
              </button>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#eef4f1] px-4 py-2 text-xs font-bold text-slate-600">
                <Users size={14} />
                Family friendly
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#eef4f1] px-4 py-2 text-xs font-bold text-slate-600">
                <Wifi size={14} />
                Wi-Fi
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#eef4f1] px-4 py-2 text-xs font-bold text-slate-600">
                <Car size={14} />
                Parking
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#eef4f1] px-4 py-2 text-xs font-bold text-slate-600">
                <Snowflake size={14} />
                AC
              </div>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 outline-none md:hidden"
              >
                <option value="recommended">
                  Recommended
                </option>
                <option value="low-high">
                  Lowest price
                </option>
                <option value="high-low">
                  Highest price
                </option>
              </select>
            </div>
          )}
        </section>

        {/* ================= MOBILE SWITCHER ================= */}
        <div className="z-40 flex shrink-0 justify-center border-b border-[#e1e7e3] bg-white p-2.5 lg:hidden">
          <div className="flex w-full max-w-sm rounded-2xl bg-[#edf3f0] p-1">
            <button
              type="button"
              onClick={() => setMobileView('list')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition ${
                mobileView === 'list'
                  ? 'bg-[#173f3c] text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <Home size={15} />
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

        {/* ================= MAIN ================= */}
        <main className="relative flex min-h-0 flex-1 overflow-hidden">
          {/* ================= LEFT LIST ================= */}
          <aside
            className={`flex w-full shrink-0 flex-col border-r border-[#dfe7e3] bg-white lg:w-[480px] xl:w-[530px] 2xl:w-[560px] ${
              mobileView === 'list'
                ? 'flex'
                : 'hidden lg:flex'
            }`}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[#e7ece9] bg-white px-5 py-5 sm:px-6">
              <div>
                <h1 className="text-[20px] font-black tracking-[-0.03em] text-[#173f3c]">
                  Explore stays
                </h1>

                <p className="mt-1.5 text-[11px] font-semibold text-slate-500">
                  Showing{' '}
                  <span className="font-black text-slate-700">
                    {filteredProperties.length}
                  </span>{' '}
                  stay
                  {filteredProperties.length === 1
                    ? ''
                    : 's'}{' '}
                  in Guwahati
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d9ebe5] bg-[#eef7f4] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#24645d]">
                <MapPin size={12} />
                Guwahati
              </span>
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-5 sm:px-5">
              {filteredProperties.length === 0 ? (
                <div className="flex min-h-[480px] flex-col items-center justify-center px-7 text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[#edf4f1] text-[#47716a]">
                    <Search size={25} />
                  </div>

                  <h2 className="mt-5 text-base font-black text-slate-800">
                    No stays found
                  </h2>

                  <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
                    Try another locality or property name, or
                    clear the filters.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setVerifiedOnly(false);
                      setSortBy('recommended');
                    }}
                    className="mt-5 rounded-xl bg-[#173f3c] px-5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-[#173f3c]/10"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredProperties.map((stay) => {
                    const propId =
                      stay.id || stay._id || '';

                    const price = Number(
                      stay.pricePerNight ||
                        stay.price ||
                        1500
                    ).toLocaleString('en-IN');

                    const image =
                      stay.images?.[0]
                        ? stay.images[0].startsWith(
                            '/uploads'
                          )
                          ? `${BACKEND_URL}${stay.images[0]}`
                          : stay.images[0]
                        : FALLBACK_IMAGE;

                    const verified =
                      stay.verified === true ||
                      stay.isVerified === true;

                    const selected =
                      selectedId === propId;

                    return (
                      <article
                        key={propId}
                        onMouseEnter={() =>
                          highlightMarker(propId, true)
                        }
                        onMouseLeave={() =>
                          highlightMarker(propId, false)
                        }
                        className={`group overflow-hidden rounded-[26px] border bg-white transition-all duration-300 ${
                          selected
                            ? 'border-[#2d776e] shadow-[0_18px_48px_rgba(23,63,60,0.13)]'
                            : 'border-[#e0e7e3] shadow-[0_4px_18px_rgba(23,63,60,0.035)] hover:border-[#b7d4ce] hover:shadow-[0_18px_48px_rgba(23,63,60,0.10)]'
                        }`}
                      >
                        <div
                          className="relative h-[220px] cursor-pointer overflow-hidden bg-slate-100 sm:h-[230px]"
                          onClick={() =>
                            focusOnProperty(
                              stay.lat,
                              stay.lng,
                              propId
                            )
                          }
                        >
                          <img
                            src={image}
                            alt={stay.title}
                            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.045]"
                            loading="lazy"
                          />

                          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

                          {verified && (
                            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-black tracking-[0.12em] text-[#173f3c] shadow-sm backdrop-blur">
                              <ShieldCheck
                                size={13}
                                className="text-[#21867b]"
                              />
                              VERIFIED
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(event) =>
                              event.stopPropagation()
                            }
                            aria-label="Save stay"
                            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-slate-600 shadow-sm backdrop-blur transition hover:scale-105 hover:text-rose-500"
                          >
                            <Heart size={18} />
                          </button>

                          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-[#173f3c]/90 px-3 py-1.5 text-[10px] font-extrabold text-white backdrop-blur">
                            <MapPin size={12} />
                            {stay.locality ||
                              'Guwahati'}
                          </span>
                        </div>

                        <div
                          className="cursor-pointer p-5"
                          onClick={() =>
                            viewPropertyDetails(propId)
                          }
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h3 className="truncate text-[17px] font-black tracking-[-0.02em] text-slate-900 transition group-hover:text-[#21867b]">
                                {stay.title}
                              </h3>

                              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                <MapPin
                                  size={14}
                                  className="text-[#21867b]"
                                />
                                {stay.locality ||
                                  'Guwahati'}
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#fff9e8] px-2.5 py-1.5 text-xs font-black text-slate-800">
                              <Star
                                size={13}
                                fill="currentColor"
                                className="text-amber-400"
                              />
                              4.9
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f8f6] px-3 py-1.5 text-[10px] font-bold text-slate-500">
                              <Wifi size={12} />
                              Wi-Fi
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f8f6] px-3 py-1.5 text-[10px] font-bold text-slate-500">
                              <Snowflake size={12} />
                              AC
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f8f6] px-3 py-1.5 text-[10px] font-bold text-slate-500">
                              <Car size={12} />
                              Parking
                            </span>
                          </div>

                          <div className="mt-5 flex items-end justify-between border-t border-[#edf1ef] pt-4">
                            <div>
                              <span className="text-[20px] font-black tracking-tight text-[#173f3c]">
                                ₹{price}
                              </span>

                              <span className="ml-1 text-[11px] font-semibold text-slate-400">
                                / night
                              </span>
                            </div>

                            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#21867b]">
                              View details
                              <ArrowRight
                                size={15}
                                className="transition-transform group-hover:translate-x-1"
                              />
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* ================= RIGHT MAP ================= */}
          <section
            className={`relative min-w-0 flex-1 bg-[#e8efeb] ${
              mobileView === 'map'
                ? 'block'
                : 'hidden lg:block'
            }`}
          >
            <div
              ref={mapContainerRef}
              className="absolute inset-0 z-10"
            />

            {!mapReady && (
              <div className="absolute inset-0 z-20 grid place-items-center bg-[#edf3f0]/80 backdrop-blur-sm">
                <div className="rounded-3xl border border-white/80 bg-white/95 px-7 py-6 text-center shadow-2xl">
                  <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-[3px] border-[#d7e4df] border-t-[#173f3c]" />

                  <p className="text-sm font-black text-[#173f3c]">
                    Loading Guwahati map
                  </p>

                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                    Finding stays around the city
                  </p>
                </div>
              </div>
            )}

            {/* Floating map toolbar */}
            <div className="absolute left-5 top-5 z-30 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={recenterMap}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/90 bg-white/95 px-4 text-xs font-extrabold text-[#173f3c] shadow-[0_10px_30px_rgba(23,63,60,0.14)] backdrop-blur transition hover:-translate-y-0.5"
              >
                <LocateFixed size={16} />
                Recenter
              </button>

              <div className="hidden h-11 items-center gap-2 rounded-2xl border border-white/90 bg-white/95 px-4 text-xs font-extrabold text-slate-600 shadow-[0_10px_30px_rgba(23,63,60,0.14)] backdrop-blur sm:flex">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#eaf5f2] text-[#21867b]">
                  <MapPin size={13} />
                </span>

                {filteredProperties.length} stays on map
              </div>
            </div>

            {/* Floating map title */}
            <div className="absolute right-5 top-5 z-30 hidden rounded-2xl border border-white/90 bg-white/95 px-4 py-3 shadow-[0_10px_30px_rgba(23,63,60,0.14)] backdrop-blur sm:block">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#21867b]">
                Explore
              </p>
              <p className="mt-0.5 text-sm font-black text-[#173f3c]">
                Guwahati stays
              </p>
            </div>

            {/* Bottom promo */}
            <div className="absolute bottom-6 left-5 z-30 hidden max-w-[355px] overflow-hidden rounded-[24px] border border-white/90 bg-white/95 shadow-[0_18px_45px_rgba(23,63,60,0.17)] backdrop-blur sm:block">
              <div className="flex items-center gap-4 p-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#eef7f4] text-[#173f3c]">
                  <Home size={22} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-black text-[#173f3c]">
                    Find your perfect stay
                  </p>

                  <p className="mt-1 text-[11px] font-medium leading-4 text-slate-500">
                    Select a price marker to explore
                    properties around Guwahati.
                  </p>
                </div>

                <ArrowRight
                  size={18}
                  className="ml-auto shrink-0 text-[#21867b]"
                />
              </div>
            </div>

            {/* Mobile map count */}
            <div className="absolute bottom-5 right-4 z-30 rounded-full border border-white/90 bg-white/95 px-4 py-2 text-[11px] font-black text-[#173f3c] shadow-lg backdrop-blur sm:hidden">
              {filteredProperties.length} stays
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

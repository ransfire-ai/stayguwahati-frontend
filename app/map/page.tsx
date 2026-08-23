'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  status?: string;
  isAvailable?: boolean;
  rating?: number;
  reviewsCount?: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stayguwahati-backend.onrender.com';

export default function LiveMapPage() {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);

  const [loadedProperties, setLoadedProperties] = useState<Homestay[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Homestay[]>([]);
  const [activeMarkersMap, setActiveMarkersMap] = useState<Record<string, any>>({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [mapError, setMapError] = useState('');

  // Load Leaflet dynamically to support SSR in Next.js
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined') {
        const L = await import('leaflet');
        // Inject Leaflet CSS dynamically if not present
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
        setIsLeafletLoaded(true);
      }
    };
    loadLeaflet();
  }, []);

  // Fetch approved and available homestays
  useEffect(() => {
    const fetchData = async () => {
      try {
        setMapError('');
        const res = await fetch(`${BACKEND_URL}/api/homestays`);

        if (!res.ok) {
          throw new Error(`Unable to load properties (${res.status})`);
        }

        const data = await res.json();
        const raw: Homestay[] =
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
          return (
            status === 'approved' &&
            property.isAvailable !== false &&
            Number.isFinite(Number(property.lat)) &&
            Number.isFinite(Number(property.lng))
          );
        });

        setLoadedProperties(approved);
        setFilteredProperties(approved);
      } catch (err) {
        console.error('Map property fetch error:', err);
        setLoadedProperties([]);
        setFilteredProperties([]);
        setMapError('Unable to load approved stays right now. Please try again.');
      }
    };

    fetchData();

    try {
      const saved = JSON.parse(localStorage.getItem('stayguwahatiWishlist') || '[]');
      if (Array.isArray(saved)) setWishlistIds(saved.map(String));
    } catch {
      setWishlistIds([]);
    }
  }, []);

  // Initialize Leaflet Map once loaded
  useEffect(() => {
    if (!isLeafletLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = (window as any).L || require('leaflet');

    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([26.1445, 91.7362], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
  }, [isLeafletLoaded]);

  // Handle Search & Filtering
  useEffect(() => {
    let result = loadedProperties.filter((stay) => {
      const titleMatch = (stay.title || '').toLowerCase().includes(searchQuery.toLowerCase().trim());
      const localityMatch = (stay.locality || '').toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesQuery = titleMatch || localityMatch;

      if (verifiedOnly) {
        return matchesQuery && stay.verified === true;
      }
      return matchesQuery;
    });

    if (sortBy === 'low-high') {
      result.sort((a, b) => (a.pricePerNight || a.price || 0) - (b.pricePerNight || b.price || 0));
    } else if (sortBy === 'high-low') {
      result.sort((a, b) => (b.pricePerNight || b.price || 0) - (a.pricePerNight || a.price || 0));
    }

    setFilteredProperties(result);
  }, [searchQuery, sortBy, verifiedOnly, loadedProperties]);

  // Update Map Markers when Filtered Properties or Map Instance changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markerGroupRef.current || !isLeafletLoaded) return;

    const L = (window as any).L || require('leaflet');

    markerGroupRef.current.clearLayers();
    const newMarkersMap: Record<string, any> = {};

    filteredProperties.forEach((stay) => {
      if (!stay.lat || !stay.lng) return;

      const propId = stay.id || stay._id || '';
      const priceFormatted = `₹${parseInt(String(stay.pricePerNight || stay.price || 1500)).toLocaleString('en-IN')}`;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div class="price-badge-marker" id="marker-${propId}">${priceFormatted}</div>`,
        iconSize: [60, 30],
        iconAnchor: [30, 15]
      });

      const marker = L.marker([stay.lat, stay.lng], { icon: customIcon });

      marker.on('click', () => {
        viewPropertyDetails(propId);
      });

      marker.addTo(markerGroupRef.current);
      newMarkersMap[propId] = marker;
    });

    setActiveMarkersMap(newMarkersMap);
  }, [filteredProperties, isLeafletLoaded]);

  // Mobile View Resize Adjustment
  useEffect(() => {
    if (mobileView === 'map' && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 150);
    }
  }, [mobileView]);

  const highlightMarker = (propId: string, highlight: boolean) => {
    const markerEl = activeMarkersMap[propId];
    if (markerEl && markerEl._icon) {
      const badge = markerEl._icon.querySelector('.price-badge-marker');
      if (badge) {
        if (highlight) badge.classList.add('active-pin');
        else badge.classList.remove('active-pin');
      }
    }
  };

  const toggleWishlist = (propId: string) => {
    setWishlistIds((current) => {
      const next = current.includes(propId)
        ? current.filter((id) => id !== propId)
        : [...current, propId];

      try {
        localStorage.setItem('stayguwahatiWishlist', JSON.stringify(next));
      } catch {}

      return next;
    });
  };

  const focusOnProperty = (lat?: number, lng?: number, id?: string) => {
    if (window.innerWidth < 1024) {
      setMobileView('map');
    }
    if (mapInstanceRef.current && lat && lng) {
      mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
      if (id) highlightMarker(id, true);
    }
  };

  const viewPropertyDetails = (propId: string) => {
    const property = loadedProperties.find((p) => (p.id || p._id || '') === propId);
    if (property) {
      sessionStorage.setItem('selectedProperty', JSON.stringify(property));
    }
    router.push(`/property-details?id=${encodeURIComponent(propId)}`);
  };

  return (
    <>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }

        /* Custom Airbnb-style Map Price Badge Markers */
        .price-badge-marker {
          background: #ffffff;
          color: #0f172a;
          font-weight: 800;
          font-size: 12px;
          padding: 5px 10px;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
          border: 1px solid #e2e8f0;
          white-space: nowrap;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .price-badge-marker:hover,
        .price-badge-marker.active-pin {
          background: #0d9488;
          color: #ffffff;
          border-color: #0d9488;
          transform: scale(1.15);
          z-index: 9999 !important;
          box-shadow: 0 8px 20px rgba(13, 148, 136, 0.35);
        }
      `}</style>

      <div className="bg-slate-50 text-slate-900 font-sans h-screen flex flex-col overflow-hidden antialiased">
        {/* Header Navigation */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shrink-0">
          <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* 1. Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:bg-teal-700 transition">
                <span className="text-base">🏠</span>
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Stay<span className="text-teal-600">Guwahati</span>
              </span>
            </Link>

            {/* 2. Nav Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold h-full">
              <Link
                href="/"
                className="text-slate-500 hover:text-teal-600 transition flex items-center h-full border-b-2 border-transparent"
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="text-slate-500 hover:text-teal-600 transition flex items-center h-full border-b-2 border-transparent"
              >
                Dashboard
              </Link>
              <Link
                href="/map"
                className="text-teal-600 border-b-2 border-teal-600 transition flex items-center h-full font-bold"
              >
                Live Map
              </Link>
            </nav>

            {/* 3. Action CTA */}
            <div className="flex items-center gap-3">
              <Link
                href="/list-property"
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm"
              >
                <span>+</span> List Your Stay
              </Link>
            </div>
          </div>
        </header>

        {/* Interactive Filter Toolbar */}
        <section className="bg-white border-b border-slate-200 px-4 py-2.5 z-40 shrink-0 shadow-sm">
          <div className="w-full px-0 sm:px-2 flex flex-wrap items-center justify-between gap-3">
            {/* Search */}
            <div className="flex items-center gap-2.5 flex-1 min-w-[260px] max-w-md">
              <div className="relative w-full">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  🔍
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search locality or homestay name..."
                  className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-slate-100/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                />
              </div>
            </div>

            {/* Sort & Quick Chips */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-0.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer hover:bg-slate-200/70 transition"
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
              </select>

              <button
                type="button"
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap border ${
                  verifiedOnly
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
              >
                <span>🛡️</span> Verified Only
              </button>
            </div>
          </div>
          {mapError && (
            <div className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
              {mapError}
            </div>
          )}
        </section>

        {/* Mobile View Switcher */}
        <div className="lg:hidden flex bg-white border-b border-slate-200 p-2 z-40 shrink-0 justify-center">
          <div className="bg-slate-100 p-1 rounded-xl flex w-full max-w-xs shadow-inner">
            <button
              type="button"
              onClick={() => setMobileView('list')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition shadow-sm flex items-center justify-center gap-1.5 ${
                mobileView === 'list'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📋 List View
            </button>
            <button
              type="button"
              onClick={() => setMobileView('map')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                mobileView === 'map'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🗺️ Map View
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex overflow-hidden relative">
          {/* Left Sidebar Listing Grid */}
          <div
            className={`w-full lg:w-[480px] xl:w-[520px] flex-col border-r border-slate-200/80 bg-white h-full overflow-hidden shrink-0 ${
              mobileView === 'list' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div>
                <h1 className="text-lg font-black text-slate-900 tracking-tight">Explore Stays</h1>
                <p className="text-slate-500 text-xs mt-0.5 font-medium">
                  Showing {filteredProperties.length} approved stay
                  {filteredProperties.length === 1 ? '' : 's'} in Guwahati
                </p>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg">
                Guwahati, AS
              </span>
            </div>

            {/* Stays Cards Stack */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
              {filteredProperties.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                    🏚️
                  </div>
                  <p className="text-slate-800 font-bold text-sm">No stays match your criteria</p>
                  <p className="text-slate-400 text-xs mt-1">Try clearing filters or adjusting your search term.</p>
                  {(searchQuery || verifiedOnly) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setVerifiedOnly(false);
                      }}
                      className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-xs font-black text-white hover:bg-teal-700"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                filteredProperties.map((stay) => {
                  const propId = stay.id || stay._id || '';
                  const price = parseInt(String(stay.pricePerNight || stay.price || 1500)).toLocaleString('en-IN');
                  let img = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500';
                  if (stay.images && stay.images.length > 0) {
                    const firstImage = stay.images[0];
                    img =
                      firstImage.startsWith('/uploads')
                        ? `${BACKEND_URL}${firstImage}`
                        : firstImage;
                  }

                  return (
                    <div
                      key={propId}
                      onMouseEnter={() => highlightMarker(propId, true)}
                      onMouseLeave={() => highlightMarker(propId, false)}
                      className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-teal-300 flex flex-col"
                    >
                      <div
                        className="relative h-48 overflow-hidden bg-slate-100"
                        onClick={() => focusOnProperty(stay.lat, stay.lng, propId)}
                      >
                        <img
                          src={img}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          alt={stay.title}
                        />

                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-800 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm border border-white/50 flex items-center gap-1">
                          <span className="text-teal-600">🛡️</span> VERIFIED
                        </div>

                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur hover:bg-white text-slate-600 hover:text-rose-600 flex items-center justify-center transition shadow-sm"
                        >
                          🤍
                        </button>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between" onClick={() => viewPropertyDetails(propId)}>
                        <div>
                          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold mb-1">
                            <span className="text-teal-600 font-bold uppercase tracking-wider text-[10px]">
                              📍 {stay.locality || 'Guwahati'}
                            </span>
                            <span className="flex items-center gap-1 text-slate-700 font-bold">
                              ⭐ {Number(stay.rating ?? 0).toFixed(1)}
                              {typeof stay.reviewsCount === 'number' && (
                                <span className="text-slate-400 font-normal">({stay.reviewsCount})</span>
                              )}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-600 transition line-clamp-1">
                            {stay.title}
                          </h3>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-lg font-black text-slate-900">₹{price}</span>
                            <span className="text-xs text-slate-400 font-medium">/ night</span>
                          </div>
                          <span className="text-xs font-bold text-teal-600 group-hover:translate-x-1 transition-transform duration-200 inline-flex items-center gap-1">
                            View Details ➔
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Interactive Map */}
          <div
            className={`w-full flex-1 relative bg-slate-200 h-full ${
              mobileView === 'map' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div ref={mapContainerRef} className="h-full w-full z-10" />
          </div>
        </main>
      </div>
    </>
  );
}
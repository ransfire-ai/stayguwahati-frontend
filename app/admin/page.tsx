'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const BACKEND_URL = 'https://stayguwahati-backend.onrender.com';

// Helper functions to handle session and local storage interoperability
const getAuthData = (key: string) => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(key) || localStorage.getItem(key);
};

const clearAuthData = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.clear();
  localStorage.clear();
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('pending');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [activeModalImages, setActiveModalImages] = useState<string[] | null>(null);
  const [activeListing, setActiveListing] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [rejectTarget, setRejectTarget] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // In this moderation workflow, an approved listing is the verified public listing.
  const isListingVerified = (stay: any) =>
    stay?.isVerified === true ||
    stay?.verified === true ||
    String(stay?.status || '').toLowerCase() === 'approved';

  // Auth & Role Validation Guard
  const checkAdminAccess = useCallback(() => {
    if (typeof window === 'undefined') return false;

    const token = getAuthData('token') || getAuthData('authToken');
    const userProfileStr = getAuthData('userProfile');

    if (!token || !userProfileStr) {
      router.push('/login');
      return false;
    }

    try {
      const user = JSON.parse(userProfileStr);
      const isAdmin =
        user.role === 'admin' ||
        user.role === 'ADMIN' ||
        user.isAdmin === true ||
        user.type === 'admin';

      if (!isAdmin) {
        router.push('/dashboard');
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error parsing user profile:', e);
      clearAuthData();
      router.push('/login');
      return false;
    }
  }, [router]);

  const logoutAdmin = () => {
    clearAuthData();
    router.push('/login');
  };

  const fetchAdminHomestays = useCallback(async () => {
    if (!checkAdminAccess()) return;

    setLoading(true);
    setFetchError(false);
    const token = getAuthData('token') || getAuthData('authToken');

    try {
      let dataList = [];
      const headers = { Authorization: `Bearer ${token}` };

      if (filter === 'all') {
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/homestays?status=pending`, { headers }).then((r) => r.json()),
          fetch(`${BACKEND_URL}/api/homestays?status=approved`, { headers }).then((r) => r.json()),
          fetch(`${BACKEND_URL}/api/homestays?status=rejected`, { headers }).then((r) => r.json()),
        ]);

        dataList = [
          ...(pendingRes.data || []),
          ...(approvedRes.data || []),
          ...(rejectedRes.data || []),
        ];
      } else {
        const response = await fetch(`${BACKEND_URL}/api/homestays?status=${filter}`, { headers });
        const result = await response.json();
        dataList = result.data || result;
      }

      setListings(Array.isArray(dataList) ? dataList : []);
    } catch (err) {
      console.error('Failed to load admin property pipeline:', err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [filter, checkAdminAccess]);

  useEffect(() => {
    if (checkAdminAccess()) {
      setIsAuthorized(true);
      fetchAdminHomestays();
    }
  }, [fetchAdminHomestays, checkAdminAccess]);

  const updateStatus = async (id: string, newStatus: string, reason = '') => {
    if (!checkAdminAccess()) return;

    const token = getAuthData('token') || getAuthData('authToken');
    if (!token) return;

    setActionBusyId(id);

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/homestays/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          // Keep the public verification flag synchronized with moderation.
          // The backend can persist this when the field exists; status remains
          // the source of truth for older records.
          verified: newStatus === 'approved',
          isVerified: newStatus === 'approved',
          ...(reason.trim() ? { reason: reason.trim() } : {}),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setRejectTarget(null);
        setRejectReason('');
        setActiveListing(null);
        await fetchAdminHomestays();
      } else {
        alert(
          data.message ||
          `Unable to update listing status (HTTP ${response.status}).`
        );
      }
    } catch (err) {
      console.error('Admin status update failed:', err);
      alert('Server communication error while updating the listing.');
    } finally {
      setActionBusyId(null);
    }
  };

  const refreshListings = async () => {
    setRefreshing(true);
    try {
      await fetchAdminHomestays();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredListings = listings.filter((stay) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    const haystack = [
      stay.title,
      stay.locality,
      stay.description,
      stay.host?.name,
      stay.host?.email,
      stay.host?.phone,
      stay._id,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });

  const formatImageUrl = (img: string) => {
    if (!img) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300';
    return img.startsWith('/') ? `${BACKEND_URL}${img}` : img;
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="bg-slate-100 text-slate-800 font-sans min-h-screen">
      {/* Admin Navigation */}
      <nav className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <i className="fa-solid fa-shield-halved text-xl sm:text-2xl text-teal-400"></i>
            <span className="text-base sm:text-xl font-black tracking-tight">
              Stay<span className="text-teal-400">Guwahati</span>{' '}
              <span className="text-[10px] sm:text-xs bg-teal-500/20 text-teal-300 px-1.5 sm:px-2 py-0.5 rounded ml-1 font-bold">
                Admin
              </span>
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={logoutAdmin}
              className="text-xs sm:text-sm font-semibold text-rose-400 hover:text-rose-300 transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-right-from-bracket"></i> Logout
            </button>
            <Link
              href="/"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition"
            >
              Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Admin Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Property Verification Pipeline
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Review, approve, or reject incoming host property listings securely.
            </p>
          </div>
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Tracking Active
          </span>
        </div>

        {/* ADMIN SUMMARY */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            ['Pending', listings.filter((x) => String(x.status || '').toLowerCase() === 'pending').length, 'text-amber-700', 'bg-amber-50'],
            ['Approved', listings.filter((x) => String(x.status || '').toLowerCase() === 'approved').length, 'text-emerald-700', 'bg-emerald-50'],
            ['Rejected', listings.filter((x) => String(x.status || '').toLowerCase() === 'rejected').length, 'text-rose-700', 'bg-rose-50'],
            ['Showing', filteredListings.length, 'text-teal-700', 'bg-teal-50'],
          ].map(([label, value, color, bg]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {label}
              </p>
              <p className={`mt-1 text-2xl font-black ${color} ${bg} inline-block rounded-lg px-2`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* SEARCH + REFRESH */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search property, locality, host, email or ID..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none shadow-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
            />
          </div>
          <button
            type="button"
            onClick={refreshListings}
            disabled={refreshing}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:border-teal-400 disabled:opacity-50"
          >
            <i className={`fa-solid fa-rotate-right mr-2 ${refreshing ? 'animate-spin' : ''}`}></i>
            Refresh
          </button>
        </div>

        {/* STATUS FILTER TABS */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('pending')}
            className={`filter-tab px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
              filter === 'pending'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <i className="fa-solid fa-clock-rotate-left"></i> Pending Review
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`filter-tab px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
              filter === 'approved'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <i className="fa-solid fa-circle-check text-emerald-600"></i> Approved Listings
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`filter-tab px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
              filter === 'rejected'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <i className="fa-solid fa-circle-xmark text-rose-600"></i> Rejected
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`filter-tab px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
              filter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <i className="fa-solid fa-layer-group text-teal-600"></i> All Properties
          </button>
        </div>

        {/* Desktop moderation table */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-4 px-6">Property Details</th>
                  <th className="py-4 px-6">Locality</th>
                  <th className="py-4 px-6">Pricing</th>
                  <th className="py-4 px-6">Host Contact</th>
                  <th className="py-4 px-6">Current Status</th>
                  <th className="py-4 px-6">Verification</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading property moderation queue...</td></tr>
                ) : fetchError ? (
                  <tr><td colSpan={7} className="text-center py-12 text-rose-500 font-medium">Failed to load moderation pipeline. Check server connection.</td></tr>
                ) : filteredListings.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400 font-medium">No matching {filter} property submissions found.</td></tr>
                ) : (
                  filteredListings.map((stay) => {
                    const mainImg = formatImageUrl(stay.images?.[0]);
                    const hostName = stay.host?.name || stay.owner || 'Host';
                    const hostEmail = stay.host?.email || stay.email || 'No Email Provided';
                    const hostPhone = stay.host?.phone || stay.phone || 'No Phone Provided';
                    const statusVal = String(stay.status || 'pending').toLowerCase();

                    return (
                      <tr key={stay._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setActiveListing(stay)}
                              className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200"
                            >
                              <img src={mainImg} alt={stay.title} className="w-full h-full object-cover" />
                            </button>
                            <div>
                              <button onClick={() => setActiveListing(stay)} className="text-left font-bold text-slate-900 hover:text-teal-600">
                                {stay.title}
                              </button>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {stay._id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-700">{stay.locality || 'Guwahati'}</td>
                        <td className="py-4 px-6 font-bold text-slate-900">
                          ₹{Number(stay.pricePerNight || 0).toLocaleString('en-IN')}
                          <span className="text-xs font-normal text-slate-400">/night</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-xs font-semibold text-slate-900">{hostName}</div>
                          <div className="text-xs text-slate-500 mt-1">{hostEmail}</div>
                          <div className="text-xs text-teal-600 font-semibold mt-1">{hostPhone}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                            statusVal === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : statusVal === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {statusVal === 'approved' ? 'Approved' : statusVal === 'rejected' ? 'Rejected' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {isListingVerified(stay) ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-black text-teal-700">
                              ✓ Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500">
                              Not verified
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setActiveListing(stay)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-teal-400">Review</button>
                            {statusVal === 'pending' && (
                              <>
                                <button disabled={actionBusyId === stay._id} onClick={() => updateStatus(stay._id, 'approved')} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">Approve</button>
                                <button disabled={actionBusyId === stay._id} onClick={() => setRejectTarget(stay)} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">Reject</button>
                              </>
                            )}
                            {statusVal === 'approved' && <button disabled={actionBusyId === stay._id} onClick={() => setRejectTarget(stay)} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">Revoke</button>}
                            {statusVal === 'rejected' && <button disabled={actionBusyId === stay._id} onClick={() => updateStatus(stay._id, 'approved')} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">Re-Approve</button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile moderation cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-400 shadow-sm">Loading property moderation queue...</div>
          ) : fetchError ? (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-rose-500 shadow-sm">Failed to load moderation pipeline.</div>
          ) : filteredListings.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-400 shadow-sm">No matching {filter} property submissions found.</div>
          ) : (
            filteredListings.map((stay) => {
              const mainImg = formatImageUrl(stay.images?.[0]);
              const statusVal = String(stay.status || 'pending').toLowerCase();

              return (
                <article key={stay._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setActiveListing(stay)} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      <img src={mainImg} alt={stay.title} className="h-full w-full object-cover" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-black text-slate-900">{stay.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{stay.locality || 'Guwahati'}</p>
                      <p className="mt-1 font-black text-slate-900">₹{Number(stay.pricePerNight || 0).toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-400">/night</span></p>
                      <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${
                        statusVal === 'approved' ? 'bg-emerald-50 text-emerald-700' : statusVal === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {statusVal === 'approved' ? 'Approved' : statusVal === 'rejected' ? 'Rejected' : 'Pending'}
                      </span>
                      <span className={`mt-2 ml-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${
                        isListingVerified(stay)
                          ? 'bg-teal-50 text-teal-700'
                          : 'bg-slate-50 text-slate-500'
                      }`}>
                        {isListingVerified(stay) ? '✓ Verified' : 'Not verified'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs">
                    <p className="font-bold text-slate-800">{stay.host?.name || 'Host'}</p>
                    <p className="mt-1 break-all text-slate-500">{stay.host?.email || 'No email'}</p>
                    <p className="mt-1 text-teal-700">{stay.host?.phone || 'No phone'}</p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button onClick={() => setActiveListing(stay)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-black text-slate-700">Review</button>
                    {statusVal === 'pending' && (
                      <>
                        <button disabled={actionBusyId === stay._id} onClick={() => updateStatus(stay._id, 'approved')} className="rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-black text-white disabled:opacity-50">Approve</button>
                        <button disabled={actionBusyId === stay._id} onClick={() => setRejectTarget(stay)} className="rounded-xl bg-rose-600 px-3 py-2.5 text-xs font-black text-white disabled:opacity-50">Reject</button>
                      </>
                    )}
                    {statusVal === 'approved' && <button disabled={actionBusyId === stay._id} onClick={() => setRejectTarget(stay)} className="rounded-xl bg-rose-600 px-3 py-2.5 text-xs font-black text-white disabled:opacity-50">Revoke</button>}
                    {statusVal === 'rejected' && <button disabled={actionBusyId === stay._id} onClick={() => updateStatus(stay._id, 'approved')} className="rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-black text-white disabled:opacity-50">Re-Approve</button>}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </main>

      {/* Full Listing Review Modal */}
      {activeListing && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4 sm:px-7">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                  Listing Review
                </p>
                <h2 className="truncate text-xl font-black text-slate-950">
                  {activeListing.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveListing(null)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                aria-label="Close review"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <div className="grid grid-cols-2 gap-3">
                  {(activeListing.images || []).slice(0, 6).map((img: string, idx: number) => (
                    <a
                      key={idx}
                      href={formatImageUrl(img)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${idx === 0 ? 'col-span-2 h-64 sm:h-80' : 'h-36 sm:h-44'} overflow-hidden rounded-2xl bg-slate-100`}
                    >
                      <img
                        src={formatImageUrl(img)}
                        alt={`${activeListing.title} photo ${idx + 1}`}
                        className="h-full w-full object-cover hover:scale-105 transition"
                      />
                    </a>
                  ))}
                </div>

                {(!activeListing.images || activeListing.images.length === 0) && (
                  <div className="grid h-56 place-items-center rounded-2xl bg-slate-100 text-sm text-slate-400">
                    No property photos uploaded.
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Property</p>
                  <p className="mt-1 font-black text-slate-900">{activeListing.title || 'Untitled'}</p>
                  <p className="mt-1 text-sm text-slate-500">{activeListing.locality || 'Guwahati'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Price</p>
                    <p className="mt-1 text-lg font-black text-slate-900">₹{Number(activeListing.pricePerNight || 0).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-400">per night</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Status</p>
                    <p className="mt-1 text-sm font-black capitalize text-slate-900">{activeListing.status || 'pending'}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Host</p>
                  <p className="mt-1 font-black text-slate-900">{activeListing.host?.name || 'Host'}</p>
                  <p className="mt-1 break-all text-sm text-slate-500">{activeListing.host?.email || 'No email'}</p>
                  <p className="mt-1 text-sm text-teal-700">{activeListing.host?.phone || 'No phone'}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Description</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {activeListing.description || 'No description provided.'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Amenities / Features</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(activeListing.features || []).length ? (
                      activeListing.features.map((feature: string, idx: number) => (
                        <span key={idx} className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700">
                          {feature}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">None listed</span>
                    )}
                  </div>
                </div>

                {String(activeListing.status || '').toLowerCase() === 'pending' && (
                  <div className="flex gap-3 pt-2">
                    <button
                      disabled={actionBusyId === activeListing._id}
                      onClick={() => updateStatus(activeListing._id, 'approved')}
                      className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      ✓ Approve Listing
                    </button>
                    <button
                      disabled={actionBusyId === activeListing._id}
                      onClick={() => {
                        setRejectTarget(activeListing);
                        setRejectReason('');
                      }}
                      className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-black text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                      Reject Listing
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-600">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  {String(rejectTarget.status || '').toLowerCase() === 'approved' ? 'Revoke this listing?' : 'Reject this listing?'}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {rejectTarget.title}. You can optionally provide a reason for the host.
                </p>
              </div>
            </div>

            <label className="mt-6 block text-sm font-bold text-slate-700">
              Reason
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="Example: Please upload clearer property photos..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10"
              />
            </label>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason('');
                }}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={actionBusyId === rejectTarget._id}
                onClick={() => updateStatus(rejectTarget._id, 'rejected', rejectReason)}
                className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-black text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {actionBusyId === rejectTarget._id ? 'Updating...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal Preview */}
      {activeModalImages !== null && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setActiveModalImages(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl font-bold p-1"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-images text-teal-600"></i> Uploaded Property Photos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50 min-h-[200px]">
              {activeModalImages.length === 0 ? (
                <div className="col-span-full text-center py-8 text-slate-400">
                  No images uploaded for this listing.
                </div>
              ) : (
                activeModalImages.map((img, idx) => {
                  const fullUrl = formatImageUrl(img);
                  return (
                    <div
                      key={idx}
                      className="h-48 rounded-xl overflow-hidden bg-slate-200 border border-slate-200"
                    >
                      <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={fullUrl}
                          alt={`Property upload ${idx + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition duration-300"
                        />
                      </a>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
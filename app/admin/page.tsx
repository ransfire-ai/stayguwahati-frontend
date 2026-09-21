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
  const [settlements, setSettlements] = useState<any[]>([]);
  const [settlementSummary, setSettlementSummary] = useState({ bookingValue: 0, commission: 0, tax: 0, totalDue: 0, paid: 0, outstanding: 0 });
  const [settlementConfig, setSettlementConfig] = useState<any>({});
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [settlementError, setSettlementError] = useState('');
  const [settlementHost, setSettlementHost] = useState('all');
  const [settlementStatus, setSettlementStatus] = useState('all');
  const [settlementFrom, setSettlementFrom] = useState('');
  const [settlementTo, setSettlementTo] = useState('');
  const [paymentTarget, setPaymentTarget] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [hostAgreements, setHostAgreements] = useState<any[]>([]);
  const [hostAgreementConfig, setHostAgreementConfig] = useState<any>({});
  const [hostAgreementsLoading, setHostAgreementsLoading] = useState(false);
  const [hostAgreementsError, setHostAgreementsError] = useState('');
  const [hostAgreementStatus, setHostAgreementStatus] = useState('all');

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

  const fetchSettlements = useCallback(async () => {
    if (!checkAdminAccess()) return;
    setSettlementLoading(true);
    setSettlementError('');
    try {
      const token = getAuthData('token') || getAuthData('authToken');
      const params = new URLSearchParams();
      if (settlementHost !== 'all') params.set('host', settlementHost);
      if (settlementStatus !== 'all') params.set('status', settlementStatus);
      if (settlementFrom) params.set('from', settlementFrom);
      if (settlementTo) params.set('to', settlementTo);
      const response = await fetch(`${BACKEND_URL}/api/admin/settlements?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load settlement statements.');
      setSettlements(Array.isArray(result.data) ? result.data : []);
      setSettlementSummary(result.summary || { bookingValue: 0, commission: 0, tax: 0, totalDue: 0, paid: 0, outstanding: 0 });
      setSettlementConfig(result.config || {});
    } catch (error: any) {
      console.error('Failed to load host settlements:', error);
      setSettlementError(error?.message || 'Unable to load host settlement statements.');
      setSettlements([]);
    } finally {
      setSettlementLoading(false);
    }
  }, [checkAdminAccess, settlementHost, settlementStatus, settlementFrom, settlementTo]);

  const fetchHostAgreements = useCallback(async () => {
    if (!checkAdminAccess()) return;
    setHostAgreementsLoading(true);
    setHostAgreementsError('');
    try {
      const token = getAuthData('token') || getAuthData('authToken');
      const params = new URLSearchParams();
      if (hostAgreementStatus !== 'all') params.set('status', hostAgreementStatus);
      const response = await fetch(`${BACKEND_URL}/api/admin/host-agreements?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load host agreements.');
      setHostAgreements(Array.isArray(result.data) ? result.data : []);
      setHostAgreementConfig(result.config || {});
    } catch (error: any) {
      console.error('Failed to load host partnership agreements:', error);
      setHostAgreementsError(error?.message || 'Unable to load host partnership agreements.');
      setHostAgreements([]);
    } finally {
      setHostAgreementsLoading(false);
    }
  }, [checkAdminAccess, hostAgreementStatus]);

  useEffect(() => {
    if (checkAdminAccess()) {
      setIsAuthorized(true);
      fetchAdminHomestays();
      fetchSettlements();
      fetchHostAgreements();
    }
  }, [fetchAdminHomestays, fetchSettlements, fetchHostAgreements, checkAdminAccess]);

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
      await Promise.all([fetchAdminHomestays(), fetchSettlements(), fetchHostAgreements()]);
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
      {/* HOST PARTNERSHIP AGREEMENTS */}
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
                  <i className="fa-solid fa-file-signature"></i>
                </span>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">Host Partnership Agreements</h2>
                  <p className="mt-0.5 text-xs sm:text-sm text-slate-500">Track electronic “I Agree &amp; Accept” acceptance records and each host’s recorded commission rate.</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black">
                <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-teal-700">Version: {hostAgreementConfig.version || 'SG-2026-01'}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">Accepted: {hostAgreementConfig.acceptedCount ?? 0}</span>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-700">Founding slots used: {hostAgreementConfig.foundingAcceptedCount ?? 0}/{hostAgreementConfig.foundingHostLimit ?? 30}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select value={hostAgreementStatus} onChange={(e) => setHostAgreementStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-teal-500">
                <option value="all">All agreements</option>
                <option value="accepted">Accepted</option>
                <option value="pending">Pending</option>
              </select>
              <button type="button" onClick={fetchHostAgreements} className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white hover:bg-slate-800">Refresh</button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {hostAgreementsError && <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{hostAgreementsError}</div>}
          {hostAgreementsLoading ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-xs text-slate-400">Loading host agreements...</div>
          ) : hostAgreements.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-xs text-slate-400">No host agreement records found.</div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full min-w-[820px] text-left text-xs">
                <thead className="bg-slate-50 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-black">Host</th>
                    <th className="px-4 py-3 font-black">Status</th>
                    <th className="px-4 py-3 font-black">Commission</th>
                    <th className="px-4 py-3 font-black">Version</th>
                    <th className="px-4 py-3 font-black">Accepted / Updated</th>
                    <th className="px-4 py-3 font-black">Acceptance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hostAgreements.map((agreement) => {
                    const accepted = agreement.status === 'accepted';
                    return (
                      <tr key={agreement._id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-4">
                          <p className="font-black text-slate-900">{agreement.hostName || 'Host'}</p>
                          <p className="mt-1 break-all text-[11px] text-slate-500">{agreement.hostEmail || 'No email'}</p>
                        </td>
                        <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${accepted ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{accepted ? '✓ Accepted' : 'Pending'}</span></td>
                        <td className="px-4 py-4 font-black text-slate-900">{agreement.commissionRate != null ? `${agreement.commissionRate}%` : 'Not assigned'}</td>
                        <td className="px-4 py-4 font-bold text-slate-600">{agreement.version || '—'}</td>
                        <td className="px-4 py-4 text-slate-500">{agreement.acceptedAt ? new Date(agreement.acceptedAt).toLocaleString('en-IN') : agreement.updatedAt ? new Date(agreement.updatedAt).toLocaleString('en-IN') : '—'}</td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-slate-700">{agreement.acceptanceMethod === 'i_agree_accept' ? 'I Agree & Accept' : agreement.acceptanceMethod || '—'}</p>
                          {accepted && agreement.ipAddress && <p className="mt-1 text-[10px] text-slate-400">IP: {agreement.ipAddress}</p>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* HOST COMMISSION & SETTLEMENTS */}
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
                  <i className="fa-solid fa-file-invoice-dollar"></i>
                </span>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">Host Commission &amp; Settlements</h2>
                  <p className="mt-0.5 text-xs sm:text-sm text-slate-500">Guest accommodation payments are made directly to hosts. This section tracks StayGuwahati commission due from hosts.</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black">
                <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-teal-700">Founding Hosts: {settlementConfig.foundingHostCommissionRate ?? 8}%</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">Standard: {settlementConfig.standardCommissionRate ?? 10}%</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">Commission tax: {settlementConfig.commissionTaxRate ?? 18}%</span>
              </div>
            </div>
            <button type="button" onClick={fetchSettlements} disabled={settlementLoading} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 hover:border-teal-400 disabled:opacity-50">
              <i className={`fa-solid fa-rotate-right mr-2 ${settlementLoading ? 'animate-spin' : ''}`}></i>Refresh Statements
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ['Booking Value', settlementSummary.bookingValue, 'text-slate-900'],
            ['Commission', settlementSummary.commission, 'text-teal-700'],
            ['Tax', settlementSummary.tax, 'text-slate-700'],
            ['Total Due', settlementSummary.totalDue, 'text-amber-700'],
            ['Paid', settlementSummary.paid, 'text-emerald-700'],
            ['Outstanding', settlementSummary.outstanding, 'text-rose-700'],
          ].map(([label, value, color]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
              <p className={`mt-1 text-base sm:text-lg font-black ${color}`}>₹{Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <select value={settlementHost} onChange={(e) => setSettlementHost(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold outline-none focus:border-teal-500 lg:col-span-1">
            <option value="all">All Hosts</option>
            {Array.from(new Set(settlements.map((r) => String(r.hostEmail || '').trim().toLowerCase()).filter(Boolean))).map((email) => <option key={email} value={email}>{email}</option>)}
          </select>
          <select value={settlementStatus} onChange={(e) => setSettlementStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold outline-none focus:border-teal-500">
            <option value="all">All Settlement Status</option>
            <option value="pending">Pending</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
            <option value="not_due">Not Due</option>
            <option value="disputed">Disputed</option>
          </select>
          <input type="date" value={settlementFrom} onChange={(e) => setSettlementFrom(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold outline-none focus:border-teal-500" aria-label="From date" />
          <input type="date" value={settlementTo} onChange={(e) => setSettlementTo(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold outline-none focus:border-teal-500" aria-label="To date" />
          <button type="button" onClick={() => {
            const rows = settlements.map((r) => {
              const s = r.settlement || {};
              return [r.propertyName || '', r.hostEmail || '', r.email || '', r.dates || '', Number(s.bookingValue || 0), Number(s.commissionRate || 0), Number(s.commissionAmount || 0), Number(s.commissionTaxAmount || 0), Number(s.commissionTotal || 0), Number(s.paidAmount || 0), Number(s.outstandingAmount || 0), s.status || ''].map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',');
            });
            const csv = ['Property,Host,Guest,Dates,Booking Value,Commission Rate,Commission,Tax,Total Due,Paid,Outstanding,Settlement Status', ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `stayguwahati-host-settlements-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
          }} className="rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-black text-white hover:bg-slate-800"><i className="fa-solid fa-download mr-2"></i>Export CSV</button>
        </div>

        {settlementError && <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">{settlementError}</div>}

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left border-collapse">
            <thead><tr className="bg-white text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <th className="px-5 py-4">Booking / Host</th><th className="px-5 py-4">Guest / Dates</th><th className="px-5 py-4">Booking Value</th><th className="px-5 py-4">Commission</th><th className="px-5 py-4">Tax</th><th className="px-5 py-4">Total Due</th><th className="px-5 py-4">Outstanding</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {settlementLoading ? <tr><td colSpan={9} className="py-12 text-center text-slate-400">Loading host settlement statements...</td></tr> : settlements.length === 0 ? <tr><td colSpan={9} className="py-12 text-center text-slate-400">No settlement records found.</td></tr> : settlements.map((r) => {
                const s = r.settlement || {}; const status = String(s.status || 'pending').toLowerCase(); const hostName = r.homestayId?.host?.name || r.hostName || r.hostEmail || 'Host';
                return <tr key={r._id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4"><div className="font-black text-slate-900">{r.propertyName || 'Property'}</div><div className="mt-1 text-[10px] text-slate-500">{hostName}</div><div className="mt-0.5 break-all text-[10px] text-slate-400">{r.hostEmail || 'No host email'}</div><div className="mt-0.5 font-mono text-[9px] text-slate-400">{r._id}</div></td>
                  <td className="px-5 py-4"><div className="font-bold text-slate-800">{r.firstName || ''} {r.lastName || ''}</div><div className="mt-1 text-slate-500">{r.dates || 'N/A'}</div></td>
                  <td className="px-5 py-4 font-black text-slate-900">₹{Number(s.bookingValue || 0).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-4"><div className="font-black text-teal-700">₹{Number(s.commissionAmount || 0).toLocaleString('en-IN', {maximumFractionDigits:2})}</div><div className="text-[10px] text-slate-400">{Number(s.commissionRate || 0)}%</div></td>
                  <td className="px-5 py-4 text-slate-700">₹{Number(s.commissionTaxAmount || 0).toLocaleString('en-IN', {maximumFractionDigits:2})}</td>
                  <td className="px-5 py-4 font-black text-amber-700">₹{Number(s.commissionTotal || 0).toLocaleString('en-IN', {maximumFractionDigits:2})}</td>
                  <td className="px-5 py-4 font-black text-rose-700">₹{Number(s.outstandingAmount || 0).toLocaleString('en-IN', {maximumFractionDigits:2})}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${status === 'paid' ? 'bg-emerald-50 text-emerald-700' : status === 'partially_paid' ? 'bg-sky-50 text-sky-700' : status === 'not_due' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-700'}`}>{status.replaceAll('_',' ')}</span></td>
                  <td className="px-5 py-4 text-right">{Number(s.outstandingAmount || 0) > 0 && <button type="button" onClick={() => { setPaymentTarget(r); setPaymentAmount(String(Number(s.outstandingAmount || 0))); setPaymentReference(''); setPaymentNotes(''); }} className="rounded-lg bg-teal-700 px-3 py-2 text-[10px] font-black text-white hover:bg-teal-800">Record Payment</button>}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3 p-4">
          {settlementLoading ? <div className="rounded-2xl bg-slate-50 p-8 text-center text-xs text-slate-400">Loading host settlement statements...</div> : settlements.length === 0 ? <div className="rounded-2xl bg-slate-50 p-8 text-center text-xs text-slate-400">No settlement records found.</div> : settlements.map((r) => { const s=r.settlement||{}; const status=String(s.status||'pending').toLowerCase(); return <article key={r._id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-black text-slate-900">{r.propertyName || 'Property'}</h3><p className="mt-1 text-[10px] text-slate-500">{r.hostEmail || 'Host'}</p><p className="mt-1 text-xs font-bold text-slate-700">{r.firstName || ''} {r.lastName || ''} · {r.dates || 'N/A'}</p></div><span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black capitalize text-slate-600">{status.replaceAll('_',' ')}</span></div><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-slate-50 p-3"><p className="text-[9px] text-slate-400">Booking</p><p className="mt-1 font-black">₹{Number(s.bookingValue||0).toLocaleString('en-IN')}</p></div><div className="rounded-xl bg-teal-50 p-3"><p className="text-[9px] text-teal-600">Commission</p><p className="mt-1 font-black text-teal-700">₹{Number(s.commissionAmount||0).toLocaleString('en-IN',{maximumFractionDigits:2})} ({Number(s.commissionRate||0)}%)</p></div><div className="rounded-xl bg-amber-50 p-3"><p className="text-[9px] text-amber-600">Total Due</p><p className="mt-1 font-black text-amber-700">₹{Number(s.commissionTotal||0).toLocaleString('en-IN',{maximumFractionDigits:2})}</p></div><div className="rounded-xl bg-rose-50 p-3"><p className="text-[9px] text-rose-600">Outstanding</p><p className="mt-1 font-black text-rose-700">₹{Number(s.outstandingAmount||0).toLocaleString('en-IN',{maximumFractionDigits:2})}</p></div></div>{Number(s.outstandingAmount||0)>0 && <button type="button" onClick={()=>{setPaymentTarget(r);setPaymentAmount(String(Number(s.outstandingAmount||0)));setPaymentReference('');setPaymentNotes('');}} className="mt-3 w-full rounded-xl bg-teal-700 px-3 py-2.5 text-xs font-black text-white">Record Payment</button>}</article>; })}
        </div>
      </section>
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

      {/* Settlement Payment Modal */}
      {paymentTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-[10px] font-black uppercase tracking-widest text-teal-600">Host settlement</p><h2 className="mt-1 text-xl font-black text-slate-900">Record Commission Payment</h2><p className="mt-1 text-xs text-slate-500">{paymentTarget.propertyName || 'Property'} · {paymentTarget.hostEmail || 'Host'}</p></div>
              <button type="button" onClick={()=>setPaymentTarget(null)} className="text-slate-400 hover:text-slate-700"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs"><div className="flex justify-between"><span className="text-slate-500">Outstanding</span><strong>₹{Number(paymentTarget.settlement?.outstandingAmount||0).toLocaleString('en-IN',{maximumFractionDigits:2})}</strong></div><div className="mt-2 flex justify-between"><span className="text-slate-500">Payment to record</span><strong className="text-teal-700">₹{Number(paymentAmount||0).toLocaleString('en-IN',{maximumFractionDigits:2})}</strong></div></div>
            <label className="mt-4 block text-xs font-bold text-slate-700">Amount<input value={paymentAmount} onChange={e=>setPaymentAmount(e.target.value)} type="number" min="0.01" step="0.01" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-teal-500" /></label>
            <label className="mt-3 block text-xs font-bold text-slate-700">Payment method<select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-teal-500"><option value="bank_transfer">Bank Transfer</option><option value="upi">UPI</option><option value="cash">Cash</option><option value="other">Other</option></select></label>
            <label className="mt-3 block text-xs font-bold text-slate-700">UTR / Transaction reference<input value={paymentReference} onChange={e=>setPaymentReference(e.target.value)} placeholder="Optional" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500" /></label>
            <label className="mt-3 block text-xs font-bold text-slate-700">Notes<textarea value={paymentNotes} onChange={e=>setPaymentNotes(e.target.value)} rows={3} placeholder="Optional settlement note" className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500" /></label>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={()=>setPaymentTarget(null)} className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-700">Cancel</button><button type="button" disabled={paymentBusy} onClick={async()=>{ const token=getAuthData('token')||getAuthData('authToken'); const amount=Number(paymentAmount); if(!Number.isFinite(amount)||amount<=0){alert('Enter a valid payment amount.');return;} setPaymentBusy(true); try{const res=await fetch(`${BACKEND_URL}/api/admin/settlements/${paymentTarget._id}/payment`,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({amount,paymentMethod,transactionReference:paymentReference,notes:paymentNotes})}); const data=await res.json().catch(()=>({})); if(!res.ok||!data.success){alert(data.message||'Unable to record payment.');return;} setPaymentTarget(null); await fetchSettlements(); }catch(e){console.error(e);alert('Server communication error while recording payment.');}finally{setPaymentBusy(false);} }} className="rounded-xl bg-teal-700 px-5 py-3 text-xs font-black text-white hover:bg-teal-800 disabled:opacity-50">{paymentBusy?'Saving...':'Save Payment'}</button></div>
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
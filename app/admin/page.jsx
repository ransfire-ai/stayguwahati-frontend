'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const BACKEND_URL = 'https://stayguwahati-backend.onrender.com';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('pending');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [activeModalImages, setActiveModalImages] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Robust Auth & Role Validation Guard
  const checkAdminAccess = useCallback(() => {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const userProfileStr = localStorage.getItem('userProfile');

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
      localStorage.clear();
      router.push('/login');
      return false;
    }
  }, [router]);

  const logoutAdmin = () => {
    localStorage.clear();
    router.push('/login');
  };

  const fetchAdminHomestays = useCallback(async () => {
    if (!checkAdminAccess()) return;

    setLoading(true);
    setFetchError(false);
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');

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

  const updateStatus = async (id, newStatus) => {
    if (!checkAdminAccess()) return;
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/homestays/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        fetchAdminHomestays();
      } else {
        alert('Status update failed: ' + (data.message || 'Unauthorized action'));
      }
    } catch (err) {
      alert('Server communication error.');
    }
  };

  const formatImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300';
    return img.startsWith('/') ? `${BACKEND_URL}${img}` : img;
  };

  if (!isAuthorized) {
    return null; // Prevents flashing content while checking authorization
  }

  return (
    <div class="bg-slate-100 text-slate-800 font-sans min-h-screen">
      {/* Admin Navigation */}
      <nav class="bg-slate-900 text-white shadow-md sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex justify-between items-center">
          <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <i class="fa-solid fa-shield-halved text-xl sm:text-2xl text-teal-400"></i>
            <span class="text-base sm:text-xl font-black tracking-tight">
              Stay<span class="text-teal-400">Guwahati</span>{' '}
              <span class="text-[10px] sm:text-xs bg-teal-500/20 text-teal-300 px-1.5 sm:px-2 py-0.5 rounded ml-1 font-bold">
                Admin
              </span>
            </span>
          </div>
          <div class="flex items-center gap-4 shrink-0">
            <button
              onClick={logoutAdmin}
              class="text-xs sm:text-sm font-semibold text-rose-400 hover:text-rose-300 transition flex items-center gap-1.5"
            >
              <i class="fa-solid fa-right-from-bracket"></i> Logout
            </button>
            <Link
              href="/"
              class="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition"
            >
              Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Admin Container */}
      <main class="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900">
              Property Verification Pipeline
            </h1>
            <p class="text-slate-500 text-xs sm:text-sm mt-0.5">
              Review, approve, or reject incoming host property listings securely.
            </p>
          </div>
          <span class="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-2 shrink-0">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Tracking Active
          </span>
        </div>

        {/* STATUS FILTER TABS */}
        <div class="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('pending')}
            class={`filter-tab px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
              filter === 'pending'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <i class="fa-solid fa-clock-rotate-left"></i> Pending Review
          </button>
          <button
            onClick={() => setFilter('approved')}
            class={`filter-tab px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
              filter === 'approved'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <i class="fa-solid fa-circle-check text-emerald-600"></i> Approved Listings
          </button>
          <button
            onClick={() => setFilter('rejected')}
            class={`filter-tab px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
              filter === 'rejected'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <i class="fa-solid fa-circle-xmark text-rose-600"></i> Rejected
          </button>
          <button
            onClick={() => setFilter('all')}
            class={`filter-tab px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
              filter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <i class="fa-solid fa-layer-group text-teal-600"></i> All Properties
          </button>
        </div>

        {/* Table Container */}
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <th class="py-4 px-6">Property Details</th>
                  <th class="py-4 px-6">Locality</th>
                  <th class="py-4 px-6">Pricing</th>
                  <th class="py-4 px-6">Host Contact</th>
                  <th class="py-4 px-6">Current Status</th>
                  <th class="py-4 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="6" class="text-center py-12 text-slate-400">
                      <i class="fa-solid fa-circle-notch fa-spin text-2xl text-teal-500 mb-2"></i>
                      <p>Loading property moderation queue...</p>
                    </td>
                  </tr>
                ) : fetchError ? (
                  <tr>
                    <td colSpan="6" class="text-center py-12 text-rose-500 font-medium">
                      <i class="fa-solid fa-triangle-exclamation text-2xl mb-2 block"></i>
                      Failed to load moderation pipeline. Check server connection.
                    </td>
                  </tr>
                ) : listings.length === 0 ? (
                  <tr>
                    <td colSpan="6" class="text-center py-12 text-slate-400 font-medium">
                      <i class="fa-solid fa-folder-open text-slate-300 text-3xl mb-2 block"></i>
                      No {filter} property submissions found.
                    </td>
                  </tr>
                ) : (
                  listings.map((stay) => {
                    const mainImg = formatImageUrl(stay.images?.[0]);
                    const hostName = stay.host?.name || stay.owner || 'Host';
                    const hostEmail = stay.host?.email || stay.email || 'No Email Provided';
                    const hostPhone = stay.host?.phone || stay.phone || 'No Phone Provided';
                    const statusVal = (stay.status || 'pending').toLowerCase();

                    return (
                      <tr key={stay._id} class="hover:bg-slate-50/80 transition">
                        <td class="py-4 px-6">
                          <div class="flex items-center gap-3">
                            <div
                              onClick={() => setActiveModalImages(stay.images || [])}
                              class="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0 cursor-pointer border border-slate-200 relative group"
                              title="Click to view host photos"
                            >
                              <img
                                src={mainImg}
                                alt={stay.title}
                                class="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                              />
                              <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs">
                                <i class="fa-solid fa-eye"></i>
                              </div>
                            </div>
                            <div>
                              <h4
                                class="font-bold text-slate-900 hover:text-teal-600 transition cursor-pointer"
                                onClick={() => setActiveModalImages(stay.images || [])}
                              >
                                {stay.title}
                              </h4>
                              <p class="text-xs text-slate-400 font-mono mt-0.5">
                                ID: {stay._id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td class="py-4 px-6 font-medium text-slate-700">
                          {stay.locality || 'Guwahati'}
                        </td>
                        <td class="py-4 px-6 font-bold text-slate-900">
                          ₹{stay.pricePerNight}
                          <span class="text-xs font-normal text-slate-400">/night</span>
                        </td>
                        <td class="py-4 px-6">
                          <div class="text-xs font-semibold text-slate-900">{hostName}</div>
                          <div class="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                            <i class="fa-solid fa-envelope text-slate-400"></i> {hostEmail}
                          </div>
                          <div class="text-xs text-teal-600 font-semibold mt-1 flex items-center gap-1.5">
                            <i class="fa-solid fa-phone"></i> {hostPhone}
                          </div>
                        </td>
                        <td class="py-4 px-6">
                          {statusVal === 'approved' ? (
                            <span class="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                              <i class="fa-solid fa-circle-check text-xs mr-1"></i> Approved
                            </span>
                          ) : statusVal === 'rejected' ? (
                            <span class="bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-200">
                              <i class="fa-solid fa-circle-xmark text-xs mr-1"></i> Rejected
                            </span>
                          ) : (
                            <span class="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
                              <i class="fa-solid fa-clock text-xs mr-1"></i> Pending Verification
                            </span>
                          )}
                        </td>
                        <td class="py-4 px-6 text-right">
                          <div class="flex items-center justify-end gap-2">
                            {statusVal === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateStatus(stay._id, 'approved')}
                                  class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateStatus(stay._id, 'rejected')}
                                  class="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {statusVal === 'approved' && (
                              <button
                                onClick={() => updateStatus(stay._id, 'rejected')}
                                class="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                              >
                                Revoke / Reject
                              </button>
                            )}
                            {statusVal === 'rejected' && (
                              <button
                                onClick={() => updateStatus(stay._id, 'approved')}
                                class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                              >
                                Re-Approve
                              </button>
                            )}
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
      </main>

      {/* Photo Modal Preview */}
      {activeModalImages !== null && (
        <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setActiveModalImages(null)}
              class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl font-bold p-1"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
            <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-images text-teal-600"></i> Uploaded Property Photos
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50 min-h-[200px]">
              {activeModalImages.length === 0 ? (
                <div class="col-span-full text-center py-8 text-slate-400">
                  No images uploaded for this listing.
                </div>
              ) : (
                activeModalImages.map((img, idx) => {
                  const fullUrl = formatImageUrl(img);
                  return (
                    <div
                      key={idx}
                      class="h-48 rounded-xl overflow-hidden bg-slate-200 border border-slate-200"
                    >
                      <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={fullUrl}
                          alt={`Property upload ${idx + 1}`}
                          class="w-full h-full object-cover hover:scale-105 transition duration-300"
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
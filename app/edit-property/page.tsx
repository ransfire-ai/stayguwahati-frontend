'use client';

import React, { useState, useEffect, Suspense, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://stayguwahati-backend.onrender.com';

function EditPropertyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('id');

  const [title, setTitle] = useState('');
  const [locality, setLocality] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!propertyId) {
      alert('No valid property sequence ID detected targeting this execution pipeline.');
      router.push('/dashboard');
      return;
    }

    const fetchPropertyData = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/homestays/${propertyId}`);
        const data = await res.json();

        if (data.success && data.data) {
          setTitle(data.data.title || '');
          setLocality(data.data.locality || data.data.location || '');
          setPricePerNight(data.data.pricePerNight || data.data.price || '');
        } else {
          alert('Failed to load property sequence data.');
        }
      } catch (err) {
        console.error('Failed synchronization pipeline mapping error context:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [propertyId, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const updatedData = {
      title,
      locality,
      pricePerNight: Number(pricePerNight),
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/homestays/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();

      if (data.success) {
        alert('Homestay changes written cleanly to database registers!');
        router.push('/dashboard');
      } else {
        alert('Write failed: ' + (data.message || 'Execution error'));
      }
    } catch (err) {
      console.error(err);
      alert('Server pipeline synchronization failure.');
    } finally {
      setSaving(false);
    }
  };

  if (!propertyId) return null;

  return (
    <main className="flex-1 max-w-2xl w-full mx-auto p-3 sm:p-6">
      <div className="bg-white border border-gray-100 p-4 sm:p-6 rounded-2xl shadow-sm space-y-4">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
            Modify Property Details
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Update your listing information instantly across the directory.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400 text-xs gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
            <span>Synchronizing property sequence...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-500 font-bold mb-1 uppercase tracking-wider">
                Property Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 sm:p-2.5 font-medium focus:outline-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-500 font-bold mb-1 uppercase tracking-wider">
                Locality Area
              </label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 sm:p-2.5 font-medium focus:outline-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-500 font-bold mb-1 uppercase tracking-wider">
                Price Per Night (₹)
              </label>
              <input
                type="number"
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 sm:p-2.5 font-medium focus:outline-teal-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-slate-950 hover:bg-teal-600 disabled:bg-gray-400 text-white font-bold py-3 sm:py-2.5 rounded-xl transition shadow-sm mt-2 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <span>Save Structural Updates</span>
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function EditPropertyPage() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col justify-between">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-16 py-2 sm:py-0 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer group">
            <span className="text-xs sm:text-sm font-bold text-teal-600 mr-1">A.</span>
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs sm:text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
              Back to Dashboard
            </span>
          </Link>
        </div>
      </header>

      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          </div>
        }
      >
        <EditPropertyContent />
      </Suspense>

      <footer className="text-center py-4 px-3 text-xs text-gray-400 border-t border-gray-100 bg-white mt-12">
        &copy; 2026 StayGuwahati Platform Unified Core Engine. All rights reserved.
      </footer>
    </div>
  );
}
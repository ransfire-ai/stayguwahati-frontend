'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://stayguwahati-backend.onrender.com';

interface ReviewEligibility {
  propertyName: string;
  propertyId?: string;
  guestName?: string;
  rating?: number;
  comment?: string;
  checkInDate?: string;
  checkOutDate?: string;
  reviewSubmitted?: boolean;
}

function ReviewContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [booking, setBooking] = useState<ReviewEligibility | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError('This review link is missing its secure review token.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/reviews/verify?token=${encodeURIComponent(token)}`,
          { cache: 'no-store' }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || 'This review link is invalid or no longer available.'
          );
        }

        setBooking(data.data);
        setRating(Number(data.data.rating || 0));
        setComment(data.data.comment || '');
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to verify this review link.'
        );
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token || !booking) return;

    if (rating < 1 || rating > 5) {
      setError('Please select a rating from 1 to 5 stars.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          rating,
          comment: comment.trim(),
          guestName: booking.guestName || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to submit your review.');
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit your review.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-xl font-black tracking-tight">
            Stay<span className="text-teal-600">Guwahati</span>
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-teal-400 hover:text-teal-700"
          >
            Back to StayGuwahati
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
            <p className="mt-4 text-sm font-semibold text-slate-500">
              Verifying your stay...
            </p>
          </div>
        ) : success ? (
          <div className="rounded-3xl border border-emerald-200 bg-white p-7 text-center shadow-sm sm:p-10">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-3xl">
              ✓
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-widest text-emerald-600">
              Review submitted
            </p>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Thank you for sharing your experience!
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Your verified review has been added to StayGuwahati.
            </p>

            <Link
              href={booking?.propertyId ? `/property-details?id=${encodeURIComponent(booking.propertyId)}` : '/'}
              className="mt-7 inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-black text-white hover:bg-teal-700"
            >
              View Property
            </Link>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-white p-7 text-center shadow-sm sm:p-10">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-2xl">
              !
            </div>
            <h1 className="mt-5 text-2xl font-black">
              Review unavailable
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              {error}
            </p>
            <Link
              href="/"
              className="mt-7 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-teal-600"
            >
              Go to StayGuwahati
            </Link>
          </div>
        ) : booking ? (
          <form
            onSubmit={submitReview}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="bg-gradient-to-br from-teal-700 to-teal-600 px-6 py-8 text-white sm:px-10">
              <p className="text-xs font-black uppercase tracking-widest text-teal-100">
                Verified Stay
              </p>
              <h1 className="mt-2 text-3xl font-black">
                How was your stay?
              </h1>
              <p className="mt-2 text-sm text-teal-50">
                Your review helps other travelers choose confidently.
              </p>
            </div>

            <div className="p-6 sm:p-10">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Your stay
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900">
                  {booking.propertyName}
                </h2>
                {booking.checkInDate && booking.checkOutDate && (
                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(booking.checkInDate).toLocaleDateString('en-IN')} –{' '}
                    {new Date(booking.checkOutDate).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>

              <div className="mt-7 text-center">
                <p className="text-sm font-black text-slate-700">
                  Your rating
                </p>

                <div
                  className="mt-3 flex justify-center gap-1"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;

                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onClick={() => {
                          setRating(star);
                          setError('');
                        }}
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                        className={`p-1 text-4xl transition-transform hover:scale-110 ${
                          active ? 'text-amber-400' : 'text-slate-300'
                        }`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>

                <p className="mt-1 text-xs font-semibold text-slate-400">
                  {rating ? `${rating} out of 5` : 'Tap a star to rate'}
                </p>
              </div>

              <label className="mt-8 block">
                <span className="text-sm font-black text-slate-700">
                  Tell other travelers about your experience
                </span>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={6}
                  maxLength={1000}
                  placeholder="What did you like about the stay? What should future guests know?"
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                />
                <span className="mt-1 block text-right text-[11px] text-slate-400">
                  {comment.length}/1000
                </span>
              </label>

              {error && (
                <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || rating < 1}
                className="mt-6 w-full rounded-2xl bg-teal-600 px-5 py-4 text-sm font-black text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Submitting Review...' : 'Submit Review'}
              </button>

              <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
                This review link is tied to your StayGuwahati booking and your logged-in account, and can
                only be used once.
              </p>
            </div>
          </form>
        ) : null}
      </section>
    </main>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-slate-500">
          Loading review...
        </div>
      }
    >
      <ReviewContent />
    </Suspense>
  );
}
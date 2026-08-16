'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ReviewContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setMessage('Invalid or missing review token.');
            return;
        }

        setSubmitting(true);
        setMessage('');

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, rating, comment })
            });
            const data = await res.json();

            if (data.success) {
                setIsSuccess(true);
                setMessage(data.message || 'Thank you! Your verified review has been submitted successfully.');
            } else {
                setMessage(data.message || 'Failed to submit review.');
            }
        } catch (err) {
            setMessage('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
            <h2 style={{ color: '#0f172a', textAlign: 'center', marginBottom: '10px' }}>Leave Your Review</h2>
            <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '24px' }}>Share your experience with StayGuwahati</p>

            {!token ? (
                <div style={{ color: '#ef4444', textAlign: 'center', fontWeight: 600 }}>
                    Invalid or missing review link token.
                </div>
            ) : isSuccess ? (
                <div style={{ backgroundColor: '#ccfbf1', color: '#0f766e', padding: '16px', borderRadius: '8px', fontWeight: 600, textAlign: 'center' }}>
                    {message}
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>Rating</label>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    onClick={() => setRating(star)}
                                    style={{ fontSize: '32px', color: star <= rating ? '#f59e0b' : '#cbd5e1' }}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>Comments (Optional)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="4"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box' }}
                            placeholder="Tell us about your stay..."
                        />
                    </div>

                    {message && (
                        <div style={{ marginBottom: '20px', color: '#ef4444', fontSize: '14px', textAlign: 'center', fontWeight: 500 }}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        style={{ width: '100%', backgroundColor: '#0d9488', color: '#fff', padding: '14px', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '16px', cursor: 'pointer' }}
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            )}
        </div>
    );
}

export default function ReviewPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>Loading review page...</div>}>
            <ReviewContent />
        </Suspense>
    );
}
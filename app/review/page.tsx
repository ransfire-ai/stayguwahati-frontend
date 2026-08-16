'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

function ReviewContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    
    const [rating, setRating] = useState(5);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('https://stayguwahati-backend.onrender.com/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, rating })
            });

            const data = await response.json();
            if (data.success) {
                setSubmitted(true);
            } else {
                setError(data.message || 'Failed to submit review.');
            }
        } catch (err) {
            setError('Server connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '40px auto', padding: '30px', fontFamily: 'sans-serif', background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#0f172a', marginBottom: '10px' }}>Leave Your Review</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>We value your feedback. Let us know how your stay went!</p>

            {submitted ? (
                <div style={{ padding: '20px', background: '#ccfbf1', color: '#0f766e', borderRadius: '8px', textAlign: 'center', fontWeight: '600' }}>
                    ✓ Thank you! Your review has been submitted successfully.
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#334155' }}>Rating</label>
                        <select 
                            value={rating} 
                            onChange={(e) => setRating(Number(e.target.value))}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        >
                            <option value={5}>⭐⭐⭐⭐⭐ (5/5) - Excellent</option>
                            <option value={4}>⭐⭐⭐⭐ (4/5) - Good</option>
                            <option value={3}>⭐⭐⭐ (3/5) - Average</option>
                            <option value={2}>⭐⭐ (2/5) - Poor</option>
                            <option value={1}>⭐ (1/5) - Terrible</option>
                        </select>
                    </div>

                    {error && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '15px' }}>{error}</p>}

                    <button 
                        type="submit" 
                        disabled={loading || !token}
                        style={{ width: '100%', background: '#0d9488', color: '#ffffff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            )}
        </div>
    );
}

export default function ReviewPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>}>
            <ReviewContent />
        </Suspense>
    );
}
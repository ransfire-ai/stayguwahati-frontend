'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PropertyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Form State
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/properties/${id}`);
        const data = await res.json();

        if (data.success && data.data) {
          setProperty(data.data);
        } else {
          setError('Property details could not be found.');
        }
      } catch (err) {
        setError('Failed to load property data. Check backend connection.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProperty();
  }, [id, API_BASE_URL]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const nights = calculateNights();
  const totalPrice = property ? nights * (property.pricePerNight || 0) : 0;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError('');

    if (nights <= 0) {
      setBookingError('Check-out date must be after check-in date.');
      setBookingLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          homestayId: property._id,
          propertyName: property.title || property.name || 'Property',
          checkIn,
          checkOut,
          dates: `${checkIn} to ${checkOut}`,
          nights,
          totalPrice
        })
      });

      const resData = await response.json();

      if (resData.success) {
        setBookingSuccess(true);
      } else {
        setBookingError(resData.message || 'Booking failed. Please try again.');
      }
    } catch (err) {
      setBookingError('Network error while processing booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-600 font-medium">Loading property details...</div>;
  }

  if (error || !property) {
    return (
      <div className="text-center py-20 text-red-600">
        <p>{error || 'Property not found.'}</p>
        <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded">
          Back to Listings
        </button>
      </div>
    );
  }

  const mainImage = property.images?.[0] || property.imageUrl || property.image || `${API_BASE_URL}/api/homestays/${property._id}/image`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="mb-6 text-teal-600 font-semibold hover:underline">
        ← Back to Search
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{property.title || property.name || 'Property Details'}</h1>
        <p className="text-gray-600 mt-1 flex items-center gap-1">
          📍 {property.address || property.locality || 'Guwahati, Assam'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 rounded-xl overflow-hidden shadow-sm">
        <div className="md:col-span-2 h-96 bg-gray-100">
          <img
            src={mainImage}
            alt={property.title || 'Property Image'}
            className="w-full h-full object-cover"
            onError={(e: any) => {
              e.target.src = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80';
            }}
          />
        </div>
        <div className="hidden md:flex flex-col gap-4 h-96">
          <img
            src={property.images?.[1] || mainImage}
            alt="Property interior"
            className="w-full h-1/2 object-cover bg-gray-100"
          />
          <img
            src={property.images?.[2] || mainImage}
            alt="Property room"
            className="w-full h-1/2 object-cover bg-gray-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-2">Hosted by {property.host?.name || property.owner || 'Host'}</h2>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>🛏️ {property.bedrooms || 1} Bedrooms</span>
              <span>🚿 {property.bathrooms || 1} Bathrooms</span>
              <span>👥 Up to {property.maxGuests || 2} Guests</span>
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-2">About this space</h3>
            <p className="text-gray-700 leading-relaxed">
              {property.description || 'Enjoy a peaceful stay at this property located in Guwahati.'}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(property.features || ['Wi-Fi', 'Air Conditioning', 'Kitchen', 'Free Parking', 'Power Backup']).map((item: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded border">
                  <span>✓</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-lg h-fit sticky top-6">
          <div className="flex justify-between items-baseline mb-4">
            <span className="text-2xl font-bold text-teal-700">₹{property.pricePerNight}</span>
            <span className="text-gray-500">/ night</span>
          </div>

          {bookingSuccess ? (
            <div className="bg-teal-50 border border-teal-200 text-teal-800 p-4 rounded-lg text-center">
              <h4 className="font-bold text-lg mb-1">🎉 Reservation Received!</h4>
              <p className="text-sm">A confirmation email has been dispatched with property details and location map.</p>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-4">
              {bookingError && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded border border-red-200">
                  {bookingError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Check-In</label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full border rounded p-2 text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Check-Out</label>
                  <input
                    type="date"
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full border rounded p-2 text-sm text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="First Name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border rounded p-2 text-sm text-gray-900"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border rounded p-2 text-sm text-gray-900"
                />
              </div>

              <input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded p-2 text-sm text-gray-900"
              />

              <input
                type="tel"
                placeholder="Phone Number"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded p-2 text-sm text-gray-900"
              />

              {nights > 0 && (
                <div className="border-t pt-3 text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>₹{property.pricePerNight} x {nights} nights</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t">
                    <span>Total</span>
                    <span>₹{totalPrice}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
              >
                {bookingLoading ? 'Processing...' : 'Reserve Now'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
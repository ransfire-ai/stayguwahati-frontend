'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PageShell from '../components/layout/PageShell';

const API = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://stayguwahati-backend.onrender.com'
).replace(/\/$/, '');

const image = (x: any) =>
  !x
    ? ''
    : /^https?:\/\//.test(x)
      ? x
      : `${API}${String(x).startsWith('/') ? '' : '/'}${x}`;

function ExploreContent() {
  const searchParams = useSearchParams();

  const [data, setData] = useState<any[]>([]);
  const [q, setQ] = useState('');

  // Read the neighbourhood selected from the homepage.
  // Example: /explore?locality=Uzan%20Bazar
  const locality = useMemo(() => {
    return (
      searchParams.get('locality')?.trim() ||
      searchParams.get('location')?.trim() ||
      ''
    );
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const response = await fetch(`${API}/api/homestays`);

        if (!response.ok) {
          throw new Error(`Failed to load homestays: ${response.status}`);
        }

        const result = await response.json();

        const properties = Array.isArray(result)
          ? result
          : result?.data || result?.homestays || [];

        if (!cancelled) {
          setData(Array.isArray(properties) ? properties : []);
        }
      } catch (error) {
        console.error('Explore homestays fetch error:', error);

        if (!cancelled) {
          setData([]);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const list = useMemo(() => {
    const search = q.trim().toLowerCase();
    const selectedLocality = locality.trim().toLowerCase();

    return data.filter((x) => {
      const propertyLocality = String(
        x.locality || x.location || x.area || ''
      )
        .trim()
        .toLowerCase();

      const propertyName = String(
        x.title || x.name || ''
      )
        .trim()
        .toLowerCase();

      // Neighbourhood filter from homepage.
      const matchesLocality =
        !selectedLocality ||
        propertyLocality === selectedLocality ||
        propertyLocality.includes(selectedLocality) ||
        selectedLocality.includes(propertyLocality);

      // Existing free-text search.
      const matchesSearch =
        !search ||
        `${propertyName} ${propertyLocality}`.includes(search);

      return matchesLocality && matchesSearch;
    });
  }, [data, q, locality]);

  return (
    <PageShell>
      <div className="sg-container sg-page">
        <span className="sg-kicker">Explore Guwahati</span>

        <h1 className="sg-title-sm" style={{ marginTop: 14 }}>
          {locality
            ? `Stays in ${locality}`
            : 'Find a stay that feels like the city.'}
        </h1>

        {locality && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
              marginTop: 14,
            }}
          >
            <span
              className="sg-kicker"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              📍 {locality}
            </span>

            <Link
              href="/explore"
              style={{
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'underline',
              }}
            >
              Clear neighbourhood
            </Link>
          </div>
        )}

        <div
          className="sg-card"
          style={{
            padding: 14,
            margin: '22px 0',
          }}
        >
          <input
            className="sg-field"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              locality
                ? `Search stays in ${locality}`
                : 'Search by stay or locality'
            }
            aria-label="Search stays"
          />
        </div>

        <div className="sg-grid sg-3">
          {list.map((p) => {
            const id = p._id || p.id;
            const propertyImage =
              Array.isArray(p.images) ? p.images[0] : p.images || p.image;

            return (
              <Link
                href={`/properties/${id}`}
                key={id}
                className="sg-card sg-property"
              >
                <div className="sg-property-img">
                  {propertyImage && (
                    <img
                      src={image(propertyImage)}
                      alt={p.title || p.name || 'Stay'}
                    />
                  )}
                </div>

                <div className="sg-property-body">
                  <span className="sg-kicker">
                    Verified local stay
                  </span>

                  <h2
                    className="sg-property-title"
                    style={{ marginTop: 12 }}
                  >
                    {p.title || p.name || 'Homestay'}
                  </h2>

                  <p className="sg-muted">
                    {p.locality || p.location || p.area || 'Guwahati'}
                  </p>

                  <b>
                    ₹
                    {Number(
                      p.pricePerNight || p.price || 0
                    ).toLocaleString('en-IN')}{' '}
                    / night
                  </b>
                </div>
              </Link>
            );
          })}
        </div>

        {!list.length && (
          <div className="sg-card sg-empty">
            {locality
              ? `No stays found in ${locality} yet.`
              : 'No stays found yet.'}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function ExploreFallback() {
  return (
    <PageShell>
      <div className="sg-container sg-page">
        <span className="sg-kicker">Explore Guwahati</span>

        <h1 className="sg-title-sm" style={{ marginTop: 14 }}>
          Find a stay that feels like the city.
        </h1>

        <div
          className="sg-card"
          style={{
            minHeight: 180,
            marginTop: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="sg-muted">Loading stays…</span>
        </div>
      </div>
    </PageShell>
  );
}

export default function Explore() {
  return (
    <Suspense fallback={<ExploreFallback />}>
      <ExploreContent />
    </Suspense>
  );
}

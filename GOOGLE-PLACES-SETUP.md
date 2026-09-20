# Live Google Places for the 7 Guwahati neighbourhood pages

The seven neighbourhood pages fetch nearby cafés and restaurants from **Google Places API (New)** at request time.

## Architecture

The frontend is hosted on Vercel and does **not** call Google directly:

`Vercel Next.js page -> stayguwahati-backend.onrender.com -> Google Places API (New)`

The Google API key stays on Render.

## 1. Google Cloud

1. Use the StayGuwahati Google Cloud project.
2. Keep billing enabled.
3. Enable **Places API (New)**.
4. Create the server-side API key.

## 2. Render backend

Add the endpoint in `backend/nearbyFoodRoute.js` to the existing `stayguwahati-backend` Express application. Full integration instructions are in `backend/INTEGRATION.md`.

Add these Render environment variables:

```text
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_SERVER_KEY
STAYGUWAHATI_PLACES_PROXY_SECRET=YOUR_LONG_RANDOM_SECRET
```

The Google key must remain server-side.

## 3. Vercel frontend

Add:

```text
STAYGUWAHATI_BACKEND_URL=https://stayguwahati-backend.onrender.com
STAYGUWAHATI_PLACES_PROXY_SECRET=THE_SAME_LONG_RANDOM_SECRET
```

Do **not** add `GOOGLE_MAPS_API_KEY` to Vercel.

## 4. What the pages fetch

Each neighbourhood has a centre coordinate and radius in `app/guwahati/data.ts`. The Render endpoint calls:

`https://places.googleapis.com/v1/places:searchNearby`

with:
- types: `restaurant`, `cafe`
- maximum results: 10
- ranking: `POPULARITY`
- language: English
- region: India

The page can show the Google name, address, rating, rating count and Google Maps link.

## 5. API key restrictions

After the Render backend is deployed and tested, restrict the server key to:

- **Application restriction:** IP addresses
- **API restriction:** Places API (New)

Get the actual Render Singapore outbound CIDR ranges from:

`stayguwahati-backend` -> **Connect** -> **Outbound**

Render documents that a service can use any IP within its assigned ranges, so allowlist the complete ranges shown there rather than guessing a single IP.

## 6. Google data / policy

The page requests the business data live rather than copying it into static SEO files. Review Google's current Places API policies and attribution requirements before production launch.

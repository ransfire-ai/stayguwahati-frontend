StayGuwahati frontend replacement
This package contains the current app routes rebuilt around a single green/cream/gold design system.
Copy these files into your Next.js app directory, preserving package.json, tsconfig.json and other project root configuration from your existing repository.
Primary API-driven pages retained: homepage, explore, property details, book stay and checkout.

LIVE LOCAL PLACES
-----------------
The seven /guwahati/[locality] pages use Google Places API (New) through the existing Render backend. The Google key stays on Render; Vercel sends the backend a private proxy secret. See ../GOOGLE-PLACES-SETUP.md and ../backend/INTEGRATION.md.

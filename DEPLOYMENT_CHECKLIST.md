# StayGuwahati — Complete Host Partnership Agreement System

This package integrates the Host Partnership Agreement and electronic
“I Agree & Accept” workflow with the current StayGuwahati backend,
Host Dashboard, and Admin Dashboard.

Included:
- backend/server.js
  * GET /api/host-agreement
  * POST /api/host-agreement/accept
  * GET /api/admin/host-agreements
  * Founding/standard commission configuration
  * Direct-to-host payment wording
  * Booking commission snapshots
  * Legacy-booking-safe settlement updates
- backend/models/HostAgreement.js
- backend/models/Booking.js
- frontend/app/dashboard/page.tsx
  * Agreement status card
  * Full agreement modal
  * Mandatory confirmation checkbox
  * “I Agree & Accept”
  * Acceptance date/time
  * Print / Save PDF browser action
- frontend/app/admin/page.tsx
  * Host Partnership Agreements section
  * Accepted/Pending filter
  * Commission and agreement version
  * Acceptance method and timestamp
  * Founding-slot usage
  * Existing property verification and settlement sections retained
- HOST_PARTNERSHIP_AGREEMENT.md
- SETUP_HOST_SETTLEMENTS.md

Default commercial configuration:
- First 30 accepted founding hosts: 8%
- Standard host commission: 10%
- Commission tax setting: 18%
- Guest accommodation payment: directly to host
- StayGuwahati does not collect accommodation payments

Deployment:
1. Replace the backend server.js with backend/server.js.
2. Add backend/models/HostAgreement.js.
3. Replace backend/models/Booking.js with the included version.
4. Replace the existing Host Dashboard page with frontend/app/dashboard/page.tsx.
5. Replace the existing Admin Dashboard page with frontend/app/admin/page.tsx.
6. Redeploy Render backend and Vercel frontend.
7. Log in as a host, open the agreement, tick the confirmation box, and
   click “I Agree & Accept”.
8. Log in as admin and verify the host appears in Host Partnership Agreements.

Optional Render environment variables:
FOUNDING_HOST_LIMIT=30
STAYGUWAHATI_FOUNDING_COMMISSION_RATE=8
STAYGUWAHATI_STANDARD_COMMISSION_RATE=10
STAYGUWAHATI_COMMISSION_TAX_RATE=18
STAYGUWAHATI_HOST_AGREEMENT_VERSION=SG-2026-01

Important:
This is electronic click-acceptance with an audit record, not a CCA
eSign/digital-signature integration. If a formal licensed eSign workflow
is required, it should be added separately.

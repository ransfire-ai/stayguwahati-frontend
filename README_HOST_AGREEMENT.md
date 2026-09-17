# StayGuwahati Host Agreement MVP

This update adds a simple electronic acceptance workflow without eSign complexity.

## Files
- `server.js` — backend agreement endpoints, agreement model integration, and booking commission snapshot support.
- `models/HostAgreement.js` — stores one agreement record per host account.
- `models/Booking.js` — existing direct-to-host settlement fields.
- `app/dashboard/page.tsx` — Host Dashboard agreement card, agreement modal, checkbox, and acceptance action.
- `app/admin/page.tsx` — Admin agreement tracking section.
- `HOST_PARTNERSHIP_AGREEMENT.md` — human-readable copy of the agreement shown in the UI.
- `SETUP_HOST_SETTLEMENTS.md` — existing host settlement configuration notes.

## Backend endpoints
- `GET /api/host-agreement` — authenticated host agreement and terms.
- `POST /api/host-agreement/accept` — records acceptance after checkbox confirmation.
- `GET /api/admin/host-agreements` — admin-only agreement status list.

## Stored acceptance data
The database records the host user ID, host name/email, agreement version, status, commission rate, acceptance method, acceptance timestamp, IP address, and user-agent.

## Commission behavior
- Founding rate defaults to 8%.
- Founding allocation defaults to the first 30 accepted host agreements.
- Standard rate defaults to 10%.
- Existing explicit property commission rates remain supported.
- Accepted agreement rates are used for new bookings and are preserved in booking commission snapshots.

## Render environment variables
No new environment variable is required. Optional existing variables remain supported:
- `FOUNDING_HOST_LIMIT` (default `30`)
- `STAYGUWAHATI_FOUNDING_COMMISSION_RATE` (default `8`)
- `STAYGUWAHATI_STANDARD_COMMISSION_RATE` (default `10`)
- `STAYGUWAHATI_COMMISSION_TAX_RATE` (default `18`)
- `STAYGUWAHATI_HOST_AGREEMENT_VERSION` (default `SG-2026-01`)

## Deploy
Copy the files into the corresponding locations in the current project and redeploy the backend and frontend.

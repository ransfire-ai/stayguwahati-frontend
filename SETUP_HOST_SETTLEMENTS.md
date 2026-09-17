# StayGuwahati Host Commission & Settlement Update

This update adds admin-side host commission/settlement tracking for the direct-to-host payment model.

## Included

- Guest accommodation payment remains `direct_to_host`.
- Commission is calculated only for confirmed/completed bookings.
- Founding-host rate defaults to 8% for the first 30 distinct hosts.
- Standard rate defaults to 10% thereafter.
- Commission tax rate is configurable and defaults to 18% in this implementation. Confirm the applicable tax treatment/rate with your CA before production use.
- Commission rate and tax rate are snapshotted on confirmed bookings so later rate changes do not rewrite historical bookings.
- Admin settlement statement with booking reference, host, guest, dates, booking value, commission rate, commission, tax, total due, paid and outstanding.
- Admin can filter by host, settlement status and date range.
- Admin can export the current statement view to CSV.
- Admin can record full or partial host commission payments with method, UTR/transaction reference and notes.

## Environment variables

Optional backend environment variables:

FOUNDING_HOST_LIMIT=30
STAYGUWAHATI_FOUNDING_COMMISSION_RATE=8
STAYGUWAHATI_STANDARD_COMMISSION_RATE=10
STAYGUWAHATI_COMMISSION_TAX_RATE=18

## Deployment

Backend:
- Replace the deployed `server.js` with `package/server.js`.
- Replace `models/Booking.js` with `package/models/Booking.js`.
- Add the environment variables above in Render if you want to override defaults.

Frontend:
- Replace the current `/app/admin/page.tsx` with `package/app/admin/page.tsx`.

No MongoDB migration is required. Mongoose will start returning the new optional fields for existing bookings; the admin statement endpoint backfills commission snapshots for confirmed/completed bookings when they are viewed.

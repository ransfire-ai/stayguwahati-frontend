StayGuwahati booking-flow correction

1. Property Details remains the full discovery/details page.
2. "Proceed to Reservation" now navigates to:
   /book-stay?id=PROPERTY_ID
   instead of using sessionStorage/pendingBooking.
3. Book Stay is now a separate reservation-selection page:
   - dates
   - guests
   - nights
   - price/total
   - cancellation policy
   - Continue to Checkout
4. Checkout remains the existing /checkout route.
5. Checkout receives id, checkIn, checkOut and guests in the URL.

Replace:
app/property-details/page.tsx
app/book-stay/page.tsx

Do not replace app/checkout/page.tsx with this package.

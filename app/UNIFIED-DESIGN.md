# StayGuwahati unified design migration

This package adds the shared design layer without changing backend endpoints.

## Reusable page wrappers
- `PageShell`: global header/footer and page shell
- `SiteHeader`: desktop/mobile brand navigation
- `SiteFooter`: shared footer
- `PropertyImage`: centralized optimized Cloudinary rendering
- `AdaptiveGallery`: 1–5 images with no reserved empty photo slot
- `MobileActionBar`: mobile-only sticky conversion action

## Page mapping
- `/` Discovery
- `/explore` Locality-first stay discovery
- `/property-details` Property story + AdaptiveGallery
- `/book-stay` Plan your stay
- `/list-property` Guided host publishing flow
- `/dashboard` Host workspace
- `/wishlist` Saved collection
- `/profile` Account hub
- `/support` Local support centre

Use the `sg-*` classes from `globals.css` for new sections. Existing API calls and routes are intentionally preserved.

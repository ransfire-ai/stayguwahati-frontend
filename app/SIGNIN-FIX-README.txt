StayGuwahati Sign-in Fix

Replace these files in your frontend project:
- components/layout/PageShell.tsx
- profile/page.tsx
- login/page.tsx
- globals.css

What changed:
1. Logged-out header now shows Sign in instead of My account.
2. Mobile navigation shows Sign in.
3. Mobile hamburger menu includes Sign in.
4. Profile page now has Sign in and Create account buttons.
5. Logged-in users with a token in localStorage automatically see My account.
6. Styling matches the existing deep-green StayGuwahati design.

Important:
If your original login page already contains a working API form, keep that original
form and use the PageShell.tsx + profile/page.tsx + globals.css changes. The supplied
login/page.tsx is a visual replacement only because this replacement package did not
contain the original authentication implementation.

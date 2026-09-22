# Paused passwordless sign-in

`signin-page.tsx.txt` preserves the former email-code page from main (`8ad1d1e`) outside Next.js routing and TypeScript compilation. Backend provider and verification code are archived in the backend repository. Restore only after delivery, proxy callbacks, expiry, single-use redemption, and rate limits have been verified.

The active `/signin` page uses email + admin-issued password. Members, board, and exec board all use this page. Guests retain their existing sign-in page.

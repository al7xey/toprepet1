# GitHub Pages preview

The public preview is built by `.github/workflows/pages.yml` at `/toprepet1/`. It is a static, read-only showcase: the catalog, tutor cards, tutor profiles, and sample availability are local preview data. The portraits are fictional pilot assets from `public/images/pilot/`.

Authentication, messages, bookings, requests, uploads, account areas, and admin actions need the Django API and are intentionally not simulated by the static preview. The `VITE_STATIC_PREVIEW=1` adapter only handles public catalog/profile reads and returns a clear read-only error for other API calls. The Pages build uses `noindex`; canonical links continue to point at `toprepet.ru`, and the repository has no custom-domain binding.

# Al Ihsan Digital Information System

Digital signage web app for Masjid Al Ihsan Kapuih, optimized for Google/Android TV through Yodeck.

## Production
`GitHub repository -> GitHub Pages -> Yodeck -> Android/Google TV`

Production URL:
`https://papabetuah.github.io/al-ihsan-digital-information-system/`

## Canonical dashboard underlay
Only this file is used by the production dashboard:

`assets/dashboard-underlay-active.jpg`

This points to the verified valid JPEG binary from the latest approved underlay source. The corrupted `dashboard-underlay-active.webp` is retired and removed from the active tree.

Dynamic overlays remain limited to:
- date and WIB clock
- prayer times
- next prayer name
- countdown

The next-prayer overlay displays only the prayer name (for example `Zuhur`), without the word `Menuju`.

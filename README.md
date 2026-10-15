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


## Owner-independent operation

The production chain is designed to run without daily manual scheduling:

`Google Drive master audio -> GitHub Actions self-heal -> Yodeck native media/schedule -> TV`

- daily self-heal and schedule sync;
- 30-day rolling prayer schedule safety buffer;
- automatic Yodeck media/dashboard recovery;
- GitHub issue alert only when automation fails;
- no recorded azan: all azan remains live by the mosque muazin.

Operational handover guide:
`docs/OPERASIONAL-MANDIRI.md`

# Al Ihsan Digital Information System

Digital signage web app for Masjid Al Ihsan Kapuih, optimized for 16:9 Google/Android TV through Yodeck.

## Production delivery

GitHub Pages is the canonical production path:

`GitHub repository -> GitHub Pages -> Yodeck -> Android/Google TV`

Production URL:

`https://papabetuah.github.io/al-ihsan-digital-information-system/`

## Dashboard underlay — single source of truth

There is exactly **one** dashboard underlay asset in the active production tree:

`assets/dashboard-underlay-active.jpg`

It is the latest owner-approved image supplied on **22 September 2026**. No dashboard master image, overlay image, thumbnail, generated layer, or alternative underlay may be used as a source.

The following legacy dashboard assets have been removed from the active tree:

- dashboard-master-original.png
- dashboard-master-overlay.png
- dashboard-master-thumb.jpg
- dashboard-master-underlay.png
- dashboard-master.png
- master-dashboard-approved-final.png
- sholat-master.jpg
- sholat-master-thumb.jpg

Legacy workflows that generated or modified master/underlay layers have also been removed.

The static artwork comes only from the canonical underlay. These values are rendered live by HTML/JavaScript:

- date and WIB clock
- Shubuh
- Terbit
- Dzuhur
- Ashar
- Maghrib
- Isya
- next-prayer label
- prayer countdown

The dashboard uses a fixed 1672×941 internal coordinate system and scales proportionally to the TV viewport.

## Prayer-time standard

The TV dashboard uses the standardized **Majelis Tarjih Muhammadiyah — Padang** calculation profile. Prayer calculation logic is not changed by underlay replacement.

Run regression test:

```bash
node tests/prayer-regression.mjs
```

Acceptance: **100% exact-to-minute matches. Any one-minute deviation fails CI.**

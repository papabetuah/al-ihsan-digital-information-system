# Al Ihsan Digital Information System

Digital signage web app for Masjid Al Ihsan Kapuih, optimized for 16:9 Google/Android TV through Yodeck.

## Production delivery

GitHub Pages is the current production delivery path for the mosque TV dashboard:

`GitHub repository -> GitHub Pages -> Yodeck -> Android/Google TV`

Production URL:

`https://papabetuah.github.io/al-ihsan-digital-information-system/`

Netlify is not required for the current static TV architecture and is not the canonical production target. Reconsider a server-side host only if the dashboard later needs protected secrets, authenticated administration, server-side APIs, or other backend workloads.

## Main URL

`/` — fullscreen TV display.

## TV visual architecture

The canonical visual baseline is **Lampiran 2**, stored as `assets/dashboard-master-underlay.png`.

The master image contains the static design only. These values are always rendered live by HTML/JavaScript:

- date and WIB clock
- Shubuh
- Terbit
- Dzuhur
- Ashar
- Maghrib
- Isya
- next-prayer label (`Menuju ...`)
- prayer countdown

`assets/dashboard-master-overlay.png` is a transparent detail mask derived from the same approved visual. The live-value slots are cut out of that mask so fixed numbers cannot overlap the dynamic values.

The dashboard uses a fixed 1672×941 internal coordinate system matching the approved master and scales proportionally to the TV viewport, including 1920×1080 output.

## Prayer-time standard

The TV dashboard uses the standardized **Majelis Tarjih Muhammadiyah — Padang** calculation profile.

Core criteria:

- Padang reference markaz: 00°56'57" LS, 100°21'15" BT
- timezone: Asia/Jakarta / WIB
- Shubuh: solar altitude -18°
- Isya: solar altitude -18°
- Dhuha: solar altitude +4°30'
- Ashar: shadow factor 1
- Dzuhur: solar transit plus calendar normalization
- Terbit/Maghrib: calibrated sunrise/sunset profile

The implementation is separated into `prayer-times.js` and uses a Tarjih-style ephemeris/transit/hour-angle engine, guarded by a strict regression test against the Majelis Tarjih Padang 2026 printed-calendar samples.

Run:

```bash
node tests/prayer-regression.mjs
```

Acceptance: **100% exact-to-minute matches. Any one-minute deviation fails CI.**

See [PRAYER_METHOD.md](PRAYER_METHOD.md) for the full standardized method and change-control rules.

## Google Sheets

The app expects this spreadsheet ID by default:

`1R3mRlgPxlEFvarBZma_laJHoEiVDvLznXAqfAQyUHpE`

Tabs:

- KONTROL_TV
- PENGUMUMAN
- AGENDA_KAJIAN
- KEUANGAN
- PEMBANGUNAN
- DOKUMENTASI
- PESAN_DAKWAH
- JUMAT
- DONASI

For direct browser fetching, Google Sheets must be published/shared so the CSV `gviz` endpoint can be read without authentication. Until then, the app uses local cache and safe fallback demo data.

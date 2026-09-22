# Al Ihsan Digital Information System

Digital signage web app for Masjid Al Ihsan Kapuih, optimized for 16:9 Google/Android TV through Yodeck.

## Production delivery

GitHub Pages is the current production delivery path for the mosque TV dashboard:

`GitHub repository -> GitHub Pages -> Yodeck -> Android/Google TV`

Production URL:

`https://papabetuah.github.io/al-ihsan-digital-information-system/`

## Main URL

`/` — fullscreen TV display.

## TV visual architecture

The **only active canonical underlay** is:

`assets/dashboard-master-underlay.jpg`

This file is the latest owner-approved image supplied on **22 September 2026**. It supersedes every previous dashboard underlay/master image.

The following older assets are **LEGACY / NOT ACTIVE / MUST NOT BE USED AS UNDERLAY**:

- `assets/dashboard-master-underlay.png` — obsolete and removed from the active tree
- `assets/dashboard-master-original.png`
- `assets/dashboard-master.png`
- `assets/master-dashboard-approved-final.png`
- `assets/dashboard-master-overlay.png` — legacy mask; no longer loaded by the live dashboard

The current approved underlay already contains the complete static artwork. These values remain live HTML/JavaScript overlays:

- date and WIB clock
- Shubuh
- Terbit
- Dzuhur
- Ashar
- Maghrib
- Isya
- next-prayer label
- prayer countdown

The dashboard uses a fixed 1672×941 internal coordinate system and scales proportionally to the TV viewport, including 1920×1080 output.

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

Run:

```bash
node tests/prayer-regression.mjs
```

Acceptance: **100% exact-to-minute matches. Any one-minute deviation fails CI.**

See [PRAYER_METHOD.md](PRAYER_METHOD.md) for the standardized method and change-control rules.

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

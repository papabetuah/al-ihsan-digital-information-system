# Al Ihsan Digital Information System

Digital signage web app for Masjid Al Ihsan Kapuih, optimized for 16:9 Google/Android TV through Yodeck.

## Main URL

`/` — fullscreen TV display.

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

The implementation is separated into `prayer-times.js` and guarded by a regression test against Majelis Tarjih Padang 2026 printed-calendar samples.

Run:

```bash
node tests/prayer-regression.mjs
```

Acceptance: at least 95% exact-to-minute matches and no reference deviation greater than one minute.

See [docs/prayer-method.md](docs/prayer-method.md) for the full standardized method and change-control rules.

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

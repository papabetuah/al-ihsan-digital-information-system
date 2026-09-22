# Al Ihsan Digital Information System

Digital signage web app for Masjid Al Ihsan Kapuih, optimized for 16:9 Google/Android TV through Yodeck.

## Main URL
`/` — fullscreen TV display.

## Prayer-time standard

The production calculation uses the **Majelis Tarjih Muhammadiyah Padang** profile:

- timezone: Asia/Jakarta (WIB)
- mosque coordinates: configured in `config.js`
- Subuh: sun altitude **-18°**
- Isya: sun altitude **-18°**
- Asar: shadow factor **1x**
- Syuruq/terbit: solar sunrise calculation
- local minute corrections are applied after the astronomical calculation to reproduce the 2026 Majelis Tarjih Muhammadiyah Padang calendar supplied by the mosque

The correction layer is deliberately explicit in `config.js`. It compensates for differences between this compact browser solar model and the locally published calendar (including local ihtiyat/horizon assumptions). It must not be presented as a universal Muhammadiyah rule.

Reference and validation notes are in `PRAYER_METHOD.md`.

## Debug
`/debug` or `/?debug=1` — reserved for diagnostic/status work.

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

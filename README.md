# Al Ihsan Digital Information System

Digital signage web app for Masjid Al Ihsan Kapuih, optimized for 16:9 Google/Android TV through Yodeck.

## Main URL
`/` — fullscreen TV display.

## Debug
`/debug` or `/?debug=1` — status page for prayer calculation, active mode, playlist duration, data source and cache state.

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

## Prayer modes
The app calculates prayer times locally from the mosque coordinates, uses Asia/Jakarta timezone, and automatically switches between normal, pre-adhan, prayer, and Friday modes.

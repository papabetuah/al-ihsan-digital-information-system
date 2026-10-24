# Masjid Al Ihsan Kapuih OS (Sholat & Operasional)

Native Android TV wrapper for the Al Ihsan digital information system.

## Identity

- App name: **Masjid Al Ihsan Kapuih OS (Sholat & Operasional)**
- Package ID: `org.alihsan.kapuih.player`
- Version: **2.0.0** (versionCode 3)
- Launcher: official Masjid Al Ihsan logo
- Android TV banner: official Masjid Al Ihsan logo on the Al Ihsan dark background

Only the main OS application is exposed in the Android/Android TV launcher. The internal Audio Test activity is retained for maintenance but is not shown as a second launcher app.

## Runtime URL

`https://papabetuah.github.io/al-ihsan-digital-information-system/?nativePlayer=1`

The native player always loads the live GitHub Pages runtime, including the latest prayer scheduler, rolling pre-azan packages, Ramadan Maghrib siren behavior, finance/construction data, and Smart Auto Update.

## Installation

Because GitHub Actions debug builds do not use a permanent production signing key, uninstall the previous **Al Ihsan TV** build before installing this APK.

After installation:

1. Open **Masjid Al Ihsan Kapuih OS (Sholat & Operasional)**.
2. If Android asks for the Home/launcher application, select this app and choose **Always**.
3. Keep sleep, screensaver, and automatic power-off disabled as already configured on the mosque TV.

The application is registered for `BOOT_COMPLETED` as a fallback and keeps the TV screen awake while running.

window.AL_IHSAN_CONFIG = Object.freeze({
  name: "Masjid Al Ihsan Kapuih",
  timezone: "Asia/Jakarta",
  timezoneOffset: 7,
  release: "underlay-final-20260923-v14",
  stage: Object.freeze({ width: 1672, height: 941 }),
  prayerMethod: Object.freeze({
    id: "majelis-tarjih-muhammadiyah-padang",
    engine: "tarjih-ephemeris-v2",
    label: "Majelis Tarjih Muhammadiyah — Padang",
    timezoneOffset: 7,

    // Markaz Padang pada jadwal Muhammadiyah 1447 H / 2026 M:
    // phi = 00°56'57" LS, lambda = 100°21'15" BT.
    latitude: -0.9491666666666667,
    longitude: 100.35416666666666,

    // Kriteria Tarjih.
    fajrAltitudeDeg: -18,
    ishaAltitudeDeg: -18,
    dhuhaAltitudeDeg: 4.5,
    asrShadowFactor: 1,
    sunriseSunsetAltitudeDeg: -1,

    // Mesin v2 mengikuti pola Pedoman Hisab Muhammadiyah:
    // ephemeris -> transit -> sudut waktu -> ihtiyat/normalisasi.
    ephemerisReferenceLocalHour: 6,

    // Normalisasi detik terhadap grid menit kalender Tarjih Padang 2026.
    // Nilai ini bukan kriteria fikih baru.
    calendarCalibrationSeconds: Object.freeze({
      shubuh: 11,
      terbit: -188,
      dhuha: 111,
      dzuhur: 61,
      ashar: 59,
      maghrib: 38,
      isya: 58
    }),

    // Satu koreksi kompatibilitas terhadap angka yang tercetak pada kalender
    // referensi. Kriteria Asar tetap faktor bayangan 1.
    publishedCalendarMinuteAdjustments: Object.freeze({
      "2026-03-13": Object.freeze({ ashar: -1 })
    })
  })
});

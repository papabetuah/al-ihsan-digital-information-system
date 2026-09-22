window.AL_IHSAN_CONFIG = Object.freeze({
  name: "Masjid Al Ihsan Kapuih",
  timezone: "Asia/Jakarta",
  timezoneOffset: 7,
  latitude: -0.9182762793204684,
  longitude: 100.46781691534656,

  // Majelis Tarjih Muhammadiyah: Subuh -18°, Isya -18°, Asar bayangan 1x.
  // Minute corrections below calibrate the existing compact solar model
  // against the 2026 Majelis Tarjih Muhammadiyah Padang calendar supplied
  // by the mosque. They are local/model corrections, not universal Tarjih rules.
  prayerMethod: "TARJIH_MUHAMMADIYAH_PADANG_2026",
  prayerMethodLabel: "Majelis Tarjih Muhammadiyah Padang",
  fajrAngle: 18,
  ishaAngle: 18,
  asrFactor: 1,
  sunriseSunsetAngle: 0.833,
  prayerCorrectionsMinutes: Object.freeze({
    shubuh: 1,
    terbit: -3,
    dzuhur: 2,
    ashar: 2,
    maghrib: 2,
    isya: 2
  }),

  release: "tarjih-padang-1"
});
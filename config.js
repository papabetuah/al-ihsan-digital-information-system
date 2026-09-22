window.AL_IHSAN_CONFIG = Object.freeze({
  name: "Masjid Al Ihsan Kapuih",
  timezone: "Asia/Jakarta",
  timezoneOffset: 7,
  release: "tarjih-padang-v1",
  prayerMethod: Object.freeze({
    id: "majelis-tarjih-muhammadiyah-padang",
    label: "Majelis Tarjih Muhammadiyah — Padang",
    timezoneOffset: 7,
    // Markaz Padang used in the official Muhammadiyah 1447 H / 2026 M schedule:
    // phi = 00°56'57" LS, lambda = 100°21'15" BT.
    latitude: -0.9491666666666667,
    longitude: 100.35416666666666,
    fajrAltitudeDeg: -18,
    ishaAltitudeDeg: -18,
    dhuhaAltitudeDeg: 4.5,
    asrShadowFactor: 1,
    // Combined upper-limb/refraction/dip profile calibrated to the supplied
    // Majelis Tarjih Padang printed calendar.
    sunriseSunsetAltitudeDeg: -1,
    // Small engine-normalization constants (seconds) make the high-precision
    // solar engine reproduce the supplied Padang 2026 calendar minute grid.
    // These are software-calibration values, not independent fiqh criteria.
    calendarCalibrationSeconds: Object.freeze({
      shubuh: 12,
      terbit: -186,
      dhuha: 111,
      dzuhur: 60,
      ashar: 60,
      maghrib: 42,
      isya: 57
    })
  })
});
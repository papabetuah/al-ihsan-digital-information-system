window.AL_IHSAN_CONFIG = Object.freeze({
  name: "Masjid Al Ihsan Kapuih",
  timezone: "Asia/Jakarta",
  timezoneOffset: 7,
  release: "prayer-v57-20260925",
  stage: Object.freeze({ width: 1672, height: 941 }),
  rotation: Object.freeze({
    dashboardMs: 45000,
    donationMs: 30000,
    announcementMs: 60000,
    sequence: Object.freeze(["dashboard","announcement","donation"]),
    startScene: "dashboard"
  }),
  cms: Object.freeze({
    spreadsheetId: "13CufIfmNBdbYR02NfJSMXXAIX1Q-Eg1Ia2272J_s-6M",
    refreshMs: 60000,
    sheets: Object.freeze({
      announcements: "Pengumuman Utama",
      agenda: "Agenda Kegiatan",
      wisdom: "Pesan Hikmah",
      prayerMode: "Mode Sholat",
      ramadanMode: "Mode Ramadan"
    })
  }),
  prayerMode: Object.freeze({
    enabled: true,
    postAzanDuaMinutes: 3,
    defaults: Object.freeze({
      Subuh: Object.freeze({ active: true, azanMinutes: 5, iqamahMinutes: 15, khutbahMinutes: 0, prayerMinutes: 10, returnScene: "dashboard" }),
      Dzuhur: Object.freeze({ active: true, azanMinutes: 5, iqamahMinutes: 10, khutbahMinutes: 0, prayerMinutes: 10, returnScene: "dashboard" }),
      Ashar: Object.freeze({ active: true, azanMinutes: 5, iqamahMinutes: 10, khutbahMinutes: 0, prayerMinutes: 10, returnScene: "dashboard" }),
      Maghrib: Object.freeze({ active: true, azanMinutes: 5, iqamahMinutes: 5, khutbahMinutes: 0, prayerMinutes: 10, returnScene: "dashboard" }),
      Isya: Object.freeze({ active: true, azanMinutes: 5, iqamahMinutes: 10, khutbahMinutes: 0, prayerMinutes: 10, returnScene: "dashboard" }),
      Jumat: Object.freeze({ active: true, azanMinutes: 5, iqamahMinutes: 0, khutbahMinutes: 30, prayerMinutes: 10, returnScene: "dashboard" })
    }),
    ramadanDefaults: Object.freeze({
      active: false,
      startDate: "",
      endDate: "",
      sermonAfterIshaMinutes: 45,
      tarawihWitirMinutes: 60,
      returnScene: "dashboard"
    })
  }),
  hijriCalendar: Object.freeze({
    id: "muhammadiyah-khgt-official-1447-1449",
    authority: "Majelis Tarjih dan Tajdid PP Muhammadiyah",
    method: "Kalender Hijriah Global Tunggal (KHGT)",
    displayOrder: "masehi-hijri",
    timezone: "Asia/Jakarta"
  }),
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

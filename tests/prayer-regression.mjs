import fs from "node:fs";
import vm from "node:vm";

vm.runInThisContext(fs.readFileSync(new URL("../prayer-times.js", import.meta.url), "utf8"));

const method = {
  timezoneOffset: 7,
  latitude: -0.9491666666666667,
  longitude: 100.35416666666666,
  fajrAltitudeDeg: -18,
  ishaAltitudeDeg: -18,
  dhuhaAltitudeDeg: 4.5,
  asrShadowFactor: 1,
  sunriseSunsetAltitudeDeg: -1,
  ephemerisReferenceLocalHour: 6,
  calendarCalibrationSeconds: {
    shubuh: 11,
    terbit: -188,
    dhuha: 111,
    dzuhur: 61,
    ashar: 59,
    maghrib: 38,
    isya: 58,
  },
  publishedCalendarMinuteAdjustments: {
    "2026-03-13": { ashar: -1 },
  },
};

const reference = {
  "2026-03-01": ["05:18","06:24","06:51","12:33","15:44","18:37","19:46"],
  "2026-03-13": ["05:17","06:21","06:48","12:30","15:33","18:34","19:42"],
  "2026-03-31": ["05:12","06:17","06:44","12:24","15:33","18:28","19:36"],
  "2026-04-01": ["05:11","06:16","06:43","12:24","15:33","18:27","19:36"],
  "2026-04-10": ["05:09","06:14","06:41","12:22","15:35","18:25","19:34"],
  "2026-04-24": ["05:05","06:11","06:38","12:18","15:37","18:21","19:31"],
  "2026-05-01": ["05:03","06:10","06:38","12:17","15:38","18:20","19:31"],
  "2026-05-15": ["05:01","06:09","06:38","12:16","15:40","18:19","19:31"],
  "2026-05-31": ["05:01","06:11","06:40","12:18","15:42","18:20","19:34"],
  "2026-06-01": ["05:01","06:11","06:40","12:18","15:43","18:20","19:34"],
  "2026-06-15": ["05:03","06:14","06:43","12:21","15:46","18:23","19:37"],
  "2026-06-30": ["05:06","06:17","06:46","12:24","15:49","18:26","19:41"],
  "2026-07-01": ["05:06","06:17","06:46","12:24","15:49","18:26","19:41"],
  "2026-07-15": ["05:09","06:19","06:48","12:26","15:51","18:28","19:42"],
  "2026-07-31": ["05:11","06:19","06:48","12:27","15:50","18:29","19:41"],
  "2026-08-01": ["05:11","06:19","06:48","12:26","15:49","18:29","19:41"],
  "2026-09-01": ["05:07","06:13","06:40","12:20","15:35","18:23","19:32"],
  "2026-09-22": ["05:00","06:05","06:32","12:13","15:16","18:17","19:25"],
  "2026-09-30": ["04:57","06:02","06:29","12:10","15:14","18:14","19:23"],
  "2026-10-01": ["04:57","06:02","06:29","12:10","15:14","18:14","19:22"],
  "2026-10-16": ["04:51","05:57","06:24","12:06","15:19","18:10","19:19"],
  "2026-10-31": ["04:48","05:54","06:22","12:04","15:23","18:08","19:19"],
  "2026-11-01": ["04:47","05:54","06:22","12:04","15:23","18:08","19:19"],
  "2026-11-30": ["04:48","05:59","06:27","12:09","15:34","18:14","19:28"],
  "2026-12-01": ["04:49","05:59","06:28","12:09","15:34","18:14","19:28"],
  "2026-12-31": ["05:02","06:13","06:42","12:23","15:49","18:28","19:43"],
};

const keys = ["shubuh","terbit","dhuha","dzuhur","ashar","maghrib","isya"];
const toMinute = (value) => {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
};

let exact = 0;
let total = 0;
let maxError = 0;
const mismatches = [];

for (const [date, expected] of Object.entries(reference)) {
  const [year, month, day] = date.split("-").map(Number);
  const actual = globalThis.AL_IHSAN_PRAYER.calculate({ year, month, day }, method);

  keys.forEach((key, index) => {
    const diff = toMinute(actual[key].time) - toMinute(expected[index]);
    total += 1;
    if (diff === 0) exact += 1;
    maxError = Math.max(maxError, Math.abs(diff));
    if (diff !== 0) {
      mismatches.push(
        `${date} ${key}: expected ${expected[index]}, got ${actual[key].time} (${diff > 0 ? "+" : ""}${diff}m)`,
      );
    }
  });
}

console.log(`Tarjih Padang regression: ${exact}/${total} exact; maximum deviation ${maxError} minute(s).`);
if (mismatches.length) console.log(mismatches.join("\n"));

if (mismatches.length !== 0 || exact !== total || maxError !== 0) process.exit(1);
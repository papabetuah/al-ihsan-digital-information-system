(()=>{"use strict";
/*
  Mesin Kalender Lokal Masjid Al Ihsan
  ------------------------------------
  Masehi:
  - Kalender Gregorian standar internasional.
  - Dihitung lokal tanpa API eksternal.
  - Zona tampilan WIB / Asia-Jakarta (UTC+7, tanpa DST).

  Hijriah:
  - Source of truth adalah awal bulan Kalender Hijriah Global Tunggal (KHGT)
    Muhammadiyah yang sudah diverifikasi terhadap kalender cetak Muhammadiyah
    referensi Padang yang digunakan Masjid Al Ihsan.
  - BUKAN Intl/browser Hijri, BUKAN kalender Hijriah tabular 30/29 bergantian.
  - Untuk menjaga kesesuaian dengan kalender cetak, pasangan tanggal Hijriah
    mengikuti tanggal sipil (00:00-23:59 WIB).

  Jangkar sensitif:
    1 Ramadan 1447 H  = 18 Februari 2026
    1 Syawal 1447 H   = 20 Maret 2026
    1 Zulhijah 1447 H = 18 Mei 2026
    10 Zulhijah 1447 H= 27 Mei 2026
*/
const DAY=86400000;
const TZ_OFFSET_MINUTES=420;
const TZ_OFFSET_MS=TZ_OFFSET_MINUTES*60000;
const TIMEZONE="Asia/Jakarta";
const OFFICIAL_FROM="2026-02-18";
const OFFICIAL_THROUGH="2028-05-24";

const GREGORIAN_MONTHS=Object.freeze([
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember"
]);
const WEEKDAYS=Object.freeze(["Ahad","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"]);

const MONTH_STARTS=Object.freeze([
  Object.freeze({date:"2026-02-18",month:"Ramadan",year:1447}),
  Object.freeze({date:"2026-03-20",month:"Syawal",year:1447}),
  Object.freeze({date:"2026-04-18",month:"Zulkaidah",year:1447}),
  Object.freeze({date:"2026-05-18",month:"Zulhijah",year:1447}),
  Object.freeze({date:"2026-06-16",month:"Muharam",year:1448}),
  Object.freeze({date:"2026-07-15",month:"Safar",year:1448}),
  Object.freeze({date:"2026-08-14",month:"Rabiulawal",year:1448}),
  Object.freeze({date:"2026-09-12",month:"Rabiulakhir",year:1448}),
  Object.freeze({date:"2026-10-12",month:"Jumadilawal",year:1448}),
  Object.freeze({date:"2026-11-10",month:"Jumadilakhir",year:1448}),
  Object.freeze({date:"2026-12-10",month:"Rajab",year:1448}),
  Object.freeze({date:"2027-01-09",month:"Syakban",year:1448}),
  Object.freeze({date:"2027-02-08",month:"Ramadan",year:1448}),
  Object.freeze({date:"2027-03-09",month:"Syawal",year:1448}),
  Object.freeze({date:"2027-04-08",month:"Zulkaidah",year:1448}),
  Object.freeze({date:"2027-05-07",month:"Zulhijah",year:1448}),
  Object.freeze({date:"2027-06-06",month:"Muharam",year:1449}),
  Object.freeze({date:"2027-07-05",month:"Safar",year:1449}),
  Object.freeze({date:"2027-08-03",month:"Rabiulawal",year:1449}),
  Object.freeze({date:"2027-09-02",month:"Rabiulakhir",year:1449}),
  Object.freeze({date:"2027-10-01",month:"Jumadilawal",year:1449}),
  Object.freeze({date:"2027-10-31",month:"Jumadilakhir",year:1449}),
  Object.freeze({date:"2027-11-29",month:"Rajab",year:1449}),
  Object.freeze({date:"2027-12-29",month:"Syakban",year:1449}),
  Object.freeze({date:"2028-01-28",month:"Ramadan",year:1449}),
  Object.freeze({date:"2028-02-26",month:"Syawal",year:1449}),
  Object.freeze({date:"2028-03-27",month:"Zulkaidah",year:1449}),
  Object.freeze({date:"2028-04-26",month:"Zulhijah",year:1449})
]);

// Titik yang terbaca jelas pada kalender cetak Maret-Desember 2026.
// Mesin melakukan self-check terhadap titik ini saat file dimuat.
const PRINTED_2026_CHECKS=Object.freeze([
  Object.freeze({date:"2026-03-01",day:12,month:"Ramadan",year:1447}),
  Object.freeze({date:"2026-03-20",day:1,month:"Syawal",year:1447}),
  Object.freeze({date:"2026-04-18",day:1,month:"Zulkaidah",year:1447}),
  Object.freeze({date:"2026-05-18",day:1,month:"Zulhijah",year:1447}),
  Object.freeze({date:"2026-05-27",day:10,month:"Zulhijah",year:1447}),
  Object.freeze({date:"2026-06-16",day:1,month:"Muharam",year:1448}),
  Object.freeze({date:"2026-07-15",day:1,month:"Safar",year:1448}),
  Object.freeze({date:"2026-08-14",day:1,month:"Rabiulawal",year:1448}),
  Object.freeze({date:"2026-09-12",day:1,month:"Rabiulakhir",year:1448}),
  Object.freeze({date:"2026-10-12",day:1,month:"Jumadilawal",year:1448}),
  Object.freeze({date:"2026-11-10",day:1,month:"Jumadilakhir",year:1448}),
  Object.freeze({date:"2026-12-10",day:1,month:"Rajab",year:1448})
]);

const pad=n=>String(n).padStart(2,"0");
function parseKey(key){
  const m=String(key||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m?{year:Number(m[1]),month:Number(m[2]),day:Number(m[3])}:null;
}
function serial(ymd){return Math.floor(Date.UTC(ymd.year,ymd.month-1,ymd.day)/DAY)}
function keyFromYMD(ymd){return `${ymd.year}-${pad(ymd.month)}-${pad(ymd.day)}`}
function isLeapYear(year){return year%4===0&&(year%100!==0||year%400===0)}
function daysInMonth(year,month){
  return [31,isLeapYear(year)?29:28,31,30,31,30,31,31,30,31,30,31][month-1]||0;
}
function validYMD(ymd){
  return Number.isInteger(ymd?.year)&&Number.isInteger(ymd?.month)&&Number.isInteger(ymd?.day)
    &&ymd.month>=1&&ymd.month<=12&&ymd.day>=1&&ymd.day<=daysInMonth(ymd.year,ymd.month);
}
function localYMD(now=new Date()){
  const d=new Date(now.getTime()+TZ_OFFSET_MS);
  return{year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate()};
}
function weekdayIndex(ymd){
  if(!validYMD(ymd))return -1;
  return new Date(Date.UTC(ymd.year,ymd.month-1,ymd.day)).getUTCDay();
}
function addDays(ymd,days){
  const d=new Date(Date.UTC(ymd.year,ymd.month-1,ymd.day+Number(days||0)));
  return{year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate()};
}
function gregorianFromYMD(ymd){
  if(!validYMD(ymd))return null;
  const wi=weekdayIndex(ymd);
  return Object.freeze({
    calendar:"gregorian",
    year:ymd.year,month:ymd.month,day:ymd.day,
    monthName:GREGORIAN_MONTHS[ymd.month-1],
    weekday:WEEKDAYS[wi],weekdayIndex:wi,
    iso:keyFromYMD(ymd)
  });
}
function gregorianFromDate(now=new Date()){return gregorianFromYMD(localYMD(now))}
function formatGregorian(now=new Date()){
  const g=gregorianFromDate(now);
  return g?`${g.weekday}, ${pad(g.day)} ${g.monthName} ${g.year}`:"";
}

const anchors=MONTH_STARTS.map(item=>{
  const ymd=parseKey(item.date);
  return Object.freeze({...item,serial:serial(ymd)});
});
const officialStartSerial=serial(parseKey(OFFICIAL_FROM));
const officialEndSerial=serial(parseKey(OFFICIAL_THROUGH));

function hijriFromYMD(ymd){
  if(!validYMD(ymd))return null;
  const target=serial(ymd);
  if(target<officialStartSerial||target>officialEndSerial)return null;
  let anchor=null,next=null;
  for(let i=0;i<anchors.length;i++){
    const item=anchors[i];
    if(item.serial<=target){anchor=item;next=anchors[i+1]||null}
    else break;
  }
  if(!anchor)return null;
  const day=1+(target-anchor.serial);
  const monthLength=next?next.serial-anchor.serial:null;
  if(day<1||(monthLength&&day>monthLength)||day>30)return null;
  return Object.freeze({
    calendar:"hijri-khgt",
    day,month:anchor.month,year:anchor.year,
    monthStart:anchor.date,monthLength,
    civilDate:keyFromYMD(ymd)
  });
}
function hijriFromDate(now=new Date()){return hijriFromYMD(localYMD(now))}
function formatHijri(now=new Date()){
  const h=hijriFromDate(now);
  return h?`${h.day} ${h.month} ${h.year} H`:"";
}
function today(now=new Date()){
  const ymd=localYMD(now);
  return Object.freeze({
    timezone:TIMEZONE,
    gregorian:gregorianFromYMD(ymd),
    hijri:hijriFromYMD(ymd)
  });
}
function verifyPrinted2026(){
  const failures=[];
  for(const check of PRINTED_2026_CHECKS){
    const actual=hijriFromYMD(parseKey(check.date));
    if(!actual||actual.day!==check.day||actual.month!==check.month||actual.year!==check.year){
      failures.push({check,actual});
    }
  }
  return Object.freeze({ok:failures.length===0,total:PRINTED_2026_CHECKS.length,failures:Object.freeze(failures)});
}

const verification=verifyPrinted2026();
if(!verification.ok)console.error("Al Ihsan calendar self-check failed",verification);

const API=Object.freeze({
  id:"al-ihsan-gregorian-khgt-local-v106",
  timezone:TIMEZONE,
  timezoneOffsetMinutes:TZ_OFFSET_MINUTES,
  gregorianStandard:"Proleptic Gregorian / ISO civil rules",
  hijriAuthority:"Majelis Tarjih dan Tajdid PP Muhammadiyah",
  hijriMethod:"Kalender Hijriah Global Tunggal (KHGT)",
  referenceRegion:"Padang, Sumatera Barat",
  officialFrom:OFFICIAL_FROM,
  officialThrough:OFFICIAL_THROUGH,
  monthStarts:MONTH_STARTS,
  printed2026Checks:PRINTED_2026_CHECKS,
  verification,
  isLeapYear,daysInMonth,localYMD,addDays,
  gregorianFromYMD,gregorianFromDate,formatGregorian,
  hijriFromYMD,hijriFromDate,formatHijri,today
});
globalThis.AL_IHSAN_CALENDAR=API;

// Compatibility facade untuk kode lama yang masih memanggil AL_IHSAN_KHGT.
globalThis.AL_IHSAN_KHGT=Object.freeze({
  id:API.id,authority:API.hijriAuthority,method:API.hijriMethod,
  timezone:API.timezone,officialFrom:API.officialFrom,officialThrough:API.officialThrough,
  monthStarts:API.monthStarts,fromYMD:API.hijriFromYMD,fromDate:API.hijriFromDate,format:API.formatHijri,
  verification:API.verification
});
})();
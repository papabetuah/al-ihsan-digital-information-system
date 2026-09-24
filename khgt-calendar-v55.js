(()=>{"use strict";

/*
  Kalender Hijriah Global Tunggal (KHGT)
  Majelis Tarjih dan Tajdid Pimpinan Pusat Muhammadiyah.

  SOURCE OF TRUTH
  - Published Muhammadiyah KHGT calendar month-start dates.
  - Not Intl/browser Hijri conversion and not an arithmetic/tabular Hijri calendar.
  - Local display day is resolved in Asia/Jakarta (WIB).
  - Prayer-time calculation remains the separate approved Tarjih Padang profile.

  Sensitive official anchors:
    1 Ramadan 1447 H   = 18 Feb 2026
    1 Syawal 1447 H    = 20 Mar 2026
    1 Zulhijah 1447 H  = 18 May 2026
    10 Zulhijah 1447 H = 27 May 2026

    1 Ramadan 1448 H   = 08 Feb 2027
    1 Syawal 1448 H    = 09 Mar 2027
    1 Zulhijah 1448 H  = 07 May 2027
    10 Zulhijah 1448 H = 16 May 2027

    1 Ramadan 1449 H   = 28 Jan 2028
    1 Syawal 1449 H    = 26 Feb 2028
    1 Zulhijah 1449 H  = 26 Apr 2028
    10 Zulhijah 1449 H = 05 May 2028

  Official coverage in this embedded release:
    18 Feb 2026 through 24 May 2028.
  Dates outside that published coverage deliberately return null rather than
  silently falling back to a different Hijri method.
*/

const DAY=86400000;
const OFFICIAL_FROM="2026-02-18";
const OFFICIAL_THROUGH="2028-05-24";
const MONTH_STARTS=Object.freeze([
  Object.freeze({date:"2026-02-18",day:1,month:"Ramadan",year:1447}),
  Object.freeze({date:"2026-03-20",day:1,month:"Syawal",year:1447}),
  Object.freeze({date:"2026-04-18",day:1,month:"Zulkaidah",year:1447}),
  Object.freeze({date:"2026-05-18",day:1,month:"Zulhijah",year:1447}),

  Object.freeze({date:"2026-06-16",day:1,month:"Muharam",year:1448}),
  Object.freeze({date:"2026-07-15",day:1,month:"Safar",year:1448}),
  Object.freeze({date:"2026-08-14",day:1,month:"Rabiulawal",year:1448}),
  Object.freeze({date:"2026-09-12",day:1,month:"Rabiulakhir",year:1448}),
  Object.freeze({date:"2026-10-12",day:1,month:"Jumadilawal",year:1448}),
  Object.freeze({date:"2026-11-10",day:1,month:"Jumadilakhir",year:1448}),
  Object.freeze({date:"2026-12-10",day:1,month:"Rajab",year:1448}),
  Object.freeze({date:"2027-01-09",day:1,month:"Syakban",year:1448}),
  Object.freeze({date:"2027-02-08",day:1,month:"Ramadan",year:1448}),
  Object.freeze({date:"2027-03-09",day:1,month:"Syawal",year:1448}),
  Object.freeze({date:"2027-04-08",day:1,month:"Zulkaidah",year:1448}),
  Object.freeze({date:"2027-05-07",day:1,month:"Zulhijah",year:1448}),

  Object.freeze({date:"2027-06-06",day:1,month:"Muharam",year:1449}),
  Object.freeze({date:"2027-07-05",day:1,month:"Safar",year:1449}),
  Object.freeze({date:"2027-08-03",day:1,month:"Rabiulawal",year:1449}),
  Object.freeze({date:"2027-09-02",day:1,month:"Rabiulakhir",year:1449}),
  Object.freeze({date:"2027-10-01",day:1,month:"Jumadilawal",year:1449}),
  Object.freeze({date:"2027-10-31",day:1,month:"Jumadilakhir",year:1449}),
  Object.freeze({date:"2027-11-29",day:1,month:"Rajab",year:1449}),
  Object.freeze({date:"2027-12-29",day:1,month:"Syakban",year:1449}),
  Object.freeze({date:"2028-01-28",day:1,month:"Ramadan",year:1449}),
  Object.freeze({date:"2028-02-26",day:1,month:"Syawal",year:1449}),
  Object.freeze({date:"2028-03-27",day:1,month:"Zulkaidah",year:1449}),
  Object.freeze({date:"2028-04-26",day:1,month:"Zulhijah",year:1449})
]);

function ymdFromDate(now,timezone){
  const parts=new Intl.DateTimeFormat("en-CA",{
    timeZone:timezone,year:"numeric",month:"2-digit",day:"2-digit"
  }).formatToParts(now);
  const p=Object.fromEntries(parts.filter(x=>x.type!=="literal").map(x=>[x.type,Number(x.value)]));
  return{year:p.year,month:p.month,day:p.day};
}
function serial(ymd){return Date.UTC(ymd.year,ymd.month-1,ymd.day)/DAY}
function parseKey(s){
  const [year,month,day]=s.split("-").map(Number);
  return{year,month,day};
}
const anchors=MONTH_STARTS.map(x=>Object.freeze({...x,serial:serial(parseKey(x.date))}));
const officialStartSerial=serial(parseKey(OFFICIAL_FROM));
const officialEndSerial=serial(parseKey(OFFICIAL_THROUGH));

function fromYMD(ymd){
  const target=serial(ymd);
  if(target<officialStartSerial||target>officialEndSerial)return null;

  let anchor=null;
  for(const item of anchors){
    if(item.serial<=target)anchor=item;
    else break;
  }
  if(!anchor)return null;

  const day=anchor.day+(target-anchor.serial);
  if(day<1||day>30)return null;
  return{day,month:anchor.month,year:anchor.year};
}
function fromDate(now,timezone="Asia/Jakarta"){return fromYMD(ymdFromDate(now,timezone))}
function format(now,timezone="Asia/Jakarta"){
  const h=fromDate(now,timezone);
  return h?`${h.day} ${h.month} ${h.year} H`:"";
}

globalThis.AL_IHSAN_KHGT=Object.freeze({
  id:"muhammadiyah-khgt-official-1447-1449",
  authority:"Majelis Tarjih dan Tajdid PP Muhammadiyah",
  method:"Kalender Hijriah Global Tunggal (KHGT)",
  timezone:"Asia/Jakarta",
  officialFrom:OFFICIAL_FROM,
  officialThrough:OFFICIAL_THROUGH,
  monthStarts:MONTH_STARTS,
  fromYMD,fromDate,format
});
})();
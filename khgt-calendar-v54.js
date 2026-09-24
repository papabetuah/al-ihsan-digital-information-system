(()=>{"use strict";

/*
  Kalender Hijriah Global Tunggal (KHGT)
  Majelis Tarjih dan Tajdid Pimpinan Pusat Muhammadiyah.

  IMPORTANT:
  - This is NOT a browser/Intl Hijri approximation.
  - Dates are mapped from official KHGT month-start anchors.
  - Prayer-time calculation remains the approved Padang prayer profile.
  - Update this table when Muhammadiyah publishes the next official KHGT year.

  Official anchors verified for sensitive 1447 H dates:
    1 Ramadan 1447 H  = 18 Feb 2026
    1 Syawal 1447 H   = 20 Mar 2026
    1 Zulhijah 1447 H = 18 May 2026
    10 Zulhijah 1447 H = 27 May 2026

  Full 1448 H month starts follow the official KHGT 1448 H calendar.
*/
const DAY=86400000;
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

  // Boundary inferred directly from the official 1448 H calendar:
  // 30 Zulhijah 1448 = 5 Jun 2027, therefore next day is 1 Muharam 1449.
  Object.freeze({date:"2027-06-06",day:1,month:"Muharam",year:1449})
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

function fromYMD(ymd){
  const target=serial(ymd);
  let anchor=null,next=null;
  for(let i=0;i<anchors.length;i++){
    if(anchors[i].serial<=target)anchor=anchors[i];
    if(anchors[i].serial>target){next=anchors[i];break}
  }
  if(!anchor)return null;
  // Do not extrapolate beyond the final official boundary.
  if(!next&&anchor.year===1449)return null;
  if(next&&target>=next.serial)return null;
  const day=anchor.day+(target-anchor.serial);
  return{day,month:anchor.month,year:anchor.year};
}
function fromDate(now,timezone="Asia/Jakarta"){return fromYMD(ymdFromDate(now,timezone))}
function format(now,timezone="Asia/Jakarta"){
  const h=fromDate(now,timezone);
  return h?`${h.day} ${h.month} ${h.year} H`:"";
}

globalThis.AL_IHSAN_KHGT=Object.freeze({
  id:"muhammadiyah-khgt-official-1447-1448",
  authority:"Majelis Tarjih dan Tajdid PP Muhammadiyah",
  method:"Kalender Hijriah Global Tunggal (KHGT)",
  monthStarts:MONTH_STARTS,
  fromYMD,fromDate,format
});
})();
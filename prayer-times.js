(()=>{"use strict";
const DEG=Math.PI/180,RAD=180/Math.PI,DAY=86400000,MIN=60000;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const pad=n=>String(n).padStart(2,"0");
const rad=d=>d*DEG,deg=r=>r*RAD;

function julianDay(ms){return ms/DAY+2440587.5}
function solarCoordinates(jd){
  const T=(jd-2451545)/36525;
  const L0=((280.46646+T*(36000.76983+T*.0003032))%360+360)%360;
  const M=357.52911+T*(35999.05029-.0001537*T);
  const e=.016708634-T*(.000042037+.0000001267*T);
  const C=Math.sin(rad(M))*(1.914602-T*(.004817+.000014*T))+Math.sin(rad(2*M))*(.019993-.000101*T)+Math.sin(rad(3*M))*.000289;
  const trueLong=L0+C,omega=125.04-1934.136*T;
  const lambda=trueLong-.00569-.00478*Math.sin(rad(omega));
  const seconds=21.448-T*(46.815+T*(.00059-T*.001813));
  const meanObliq=23+(26+seconds/60)/60;
  const obliq=meanObliq+.00256*Math.cos(rad(omega));
  const declination=deg(Math.asin(Math.sin(rad(obliq))*Math.sin(rad(lambda))));
  const y=Math.tan(rad(obliq/2))**2;
  const equationMinutes=4*deg(y*Math.sin(2*rad(L0))-2*e*Math.sin(rad(M))+4*e*y*Math.sin(rad(M))*Math.cos(2*rad(L0))-.5*y*y*Math.sin(4*rad(L0))-1.25*e*e*Math.sin(2*rad(M)));
  return{declination,equationMinutes};
}
function localMidnightMs(ymd,tz){return Date.UTC(ymd.year,ymd.month-1,ymd.day)-tz*60*MIN}
function dateKey(ymd){return `${ymd.year}-${pad(ymd.month)}-${pad(ymd.day)}`}
function dailyEphemeris(ymd,method){
  const localHour=method.ephemerisReferenceLocalHour??6;
  const ms=Date.UTC(ymd.year,ymd.month-1,ymd.day,localHour-method.timezoneOffset,0,0);
  return solarCoordinates(julianDay(ms));
}
function transitMinutes(ymd,method,ephemeris=dailyEphemeris(ymd,method)){
  const standardMeridian=15*method.timezoneOffset;
  return 720-ephemeris.equationMinutes+4*(standardMeridian-method.longitude);
}
function hourAngleMinutes(altitudeDeg,latitudeDeg,declinationDeg){
  const numerator=Math.sin(rad(altitudeDeg))-Math.sin(rad(latitudeDeg))*Math.sin(rad(declinationDeg));
  const denominator=Math.cos(rad(latitudeDeg))*Math.cos(rad(declinationDeg));
  return 4*deg(Math.acos(clamp(numerator/denominator,-1,1)));
}
function asrAltitude(method,declinationDeg){
  const zenithDistance=Math.abs(method.latitude-declinationDeg);
  return deg(Math.atan(1/(method.asrShadowFactor+Math.tan(rad(zenithDistance)))));
}
function rawPrayerMinutes(ymd,method){
  const ephemeris=dailyEphemeris(ymd,method);
  const transit=transitMinutes(ymd,method,ephemeris);
  const H=altitude=>hourAngleMinutes(altitude,method.latitude,ephemeris.declination);
  return{
    shubuh:transit-H(method.fajrAltitudeDeg),
    terbit:transit-H(method.sunriseSunsetAltitudeDeg),
    dhuha:transit-H(method.dhuhaAltitudeDeg),
    dzuhur:transit,
    ashar:transit+H(asrAltitude(method,ephemeris.declination)),
    maghrib:transit+H(method.sunriseSunsetAltitudeDeg),
    isya:transit+H(method.ishaAltitudeDeg)
  };
}
function publishedAdjustment(ymd,method,key){
  return method.publishedCalendarMinuteAdjustments?.[dateKey(ymd)]?.[key]??0;
}
function normalize(rawMinutes,ymd,method,key){
  const correction=(method.calendarCalibrationSeconds?.[key]??0)/60;
  const minutes=Math.ceil(rawMinutes+correction-1e-9)+publishedAdjustment(ymd,method,key);
  const midnight=localMidnightMs(ymd,method.timezoneOffset);
  return{minutes,ts:midnight+minutes*MIN,time:`${pad(Math.floor(minutes/60)%24)}:${pad((minutes%60+60)%60)}`};
}
function calculate(ymd,method){
  const raw=rawPrayerMinutes(ymd,method);
  const labels={shubuh:"Shubuh",terbit:"Terbit",dhuha:"Dhuha",dzuhur:"Dzuhur",ashar:"Ashar",maghrib:"Maghrib",isya:"Isya"};
  return Object.fromEntries(Object.entries(raw).map(([key,value])=>[key,{key,label:labels[key],...normalize(value,ymd,method,key)}]));
}
function localYMD(now,timezone){
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:timezone,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);
  const mapped=Object.fromEntries(parts.filter(x=>x.type!=="literal").map(x=>[x.type,Number(x.value)]));
  return{year:mapped.year,month:mapped.month,day:mapped.day};
}
function tomorrow(ymd){const d=new Date(Date.UTC(ymd.year,ymd.month-1,ymd.day+1,12));return{year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate()}}
function nextPrayer(nowMs,times,ymd,method){for(const key of["shubuh","dzuhur","ashar","maghrib","isya"])if(nowMs<times[key].ts)return times[key];return calculate(tomorrow(ymd),method).shubuh}
function countdown(ms){let s=Math.max(0,Math.floor(ms/1000));return`${pad(Math.floor(s/3600))}:${pad(Math.floor((s%3600)/60))}:${pad(s%60)}`}

globalThis.AL_IHSAN_PRAYER=Object.freeze({calculate,localYMD,nextPrayer,countdown});
})();
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
  const decl=deg(Math.asin(Math.sin(rad(obliq))*Math.sin(rad(lambda))));
  const y=Math.tan(rad(obliq/2))**2;
  const eq=4*deg(y*Math.sin(2*rad(L0))-2*e*Math.sin(rad(M))+4*e*y*Math.sin(rad(M))*Math.cos(2*rad(L0))-.5*y*y*Math.sin(4*rad(L0))-1.25*e*e*Math.sin(2*rad(M)));
  return{declination:decl,equationMinutes:eq};
}
function utcMinutes(ms){const d=new Date(ms);return d.getUTCHours()*60+d.getUTCMinutes()+d.getUTCSeconds()/60+d.getUTCMilliseconds()/60000}
function solarAltitude(ms,lat,lon){
  const s=solarCoordinates(julianDay(ms));
  const tst=((utcMinutes(ms)+s.equationMinutes+4*lon)%1440+1440)%1440;
  const hourAngle=tst/4-180;
  const cosZen=Math.sin(rad(lat))*Math.sin(rad(s.declination))+Math.cos(rad(lat))*Math.cos(rad(s.declination))*Math.cos(rad(hourAngle));
  return 90-deg(Math.acos(clamp(cosZen,-1,1)));
}
function localMidnightMs(ymd,tz){return Date.UTC(ymd.year,ymd.month-1,ymd.day)-tz*60*MIN}
function crossing(ymd,method,targetAltitude,guessHour,rising){
  const start=localMidnightMs(ymd,method.timezoneOffset)+(guessHour-3)*60*MIN;
  const end=start+6*60*MIN;
  let prevT=start,prev=solarAltitude(prevT,method.latitude,method.longitude)-targetAltitude,lo=null,hi=null;
  for(let i=1;i<=72;i++){
    const t=start+(end-start)*i/72;
    const cur=solarAltitude(t,method.latitude,method.longitude)-targetAltitude;
    if(prev===0||prev*cur<0){const slope=cur-prev;if((rising&&slope>0)||(!rising&&slope<0)){lo=prevT;hi=t;break}}
    prevT=t;prev=cur;
  }
  if(lo===null)throw new Error("Solar crossing not found");
  let flo=solarAltitude(lo,method.latitude,method.longitude)-targetAltitude;
  for(let i=0;i<48;i++){
    const mid=(lo+hi)/2,fmid=solarAltitude(mid,method.latitude,method.longitude)-targetAltitude;
    if(flo*fmid<=0)hi=mid;else{lo=mid;flo=fmid}
  }
  return(lo+hi)/2;
}
function solarNoon(ymd,method){
  const midnight=localMidnightMs(ymd,method.timezoneOffset);let minute=720;
  for(let i=0;i<6;i++){
    const ms=midnight+minute*MIN,s=solarCoordinates(julianDay(ms));
    minute=720-4*method.longitude-s.equationMinutes+60*method.timezoneOffset;
  }
  return midnight+minute*MIN;
}
function asr(ymd,method){
  const noon=solarNoon(ymd,method),decl=solarCoordinates(julianDay(noon)).declination;
  const zenithDistance=Math.abs(method.latitude-decl);
  const altitude=deg(Math.atan(1/(method.asrShadowFactor+Math.tan(rad(zenithDistance)))));
  return crossing(ymd,method,altitude,15.5,false);
}
function normalize(rawMs,ymd,method,key){
  const midnight=localMidnightMs(ymd,method.timezoneOffset);
  const rawMinutes=(rawMs-midnight)/MIN;
  const correction=(method.calendarCalibrationSeconds?.[key]??0)/60;
  const rounded=Math.ceil(rawMinutes+correction-1e-9);
  return{minutes:rounded,ts:midnight+rounded*MIN,time:`${pad(Math.floor(rounded/60)%24)}:${pad(rounded%60)}`};
}
function calculate(ymd,method){
  const raw={
    shubuh:crossing(ymd,method,method.fajrAltitudeDeg,5,true),
    terbit:crossing(ymd,method,method.sunriseSunsetAltitudeDeg,6,true),
    dhuha:crossing(ymd,method,method.dhuhaAltitudeDeg,6.5,true),
    dzuhur:solarNoon(ymd,method),
    ashar:asr(ymd,method),
    maghrib:crossing(ymd,method,method.sunriseSunsetAltitudeDeg,18,false),
    isya:crossing(ymd,method,method.ishaAltitudeDeg,19,false)
  };
  const labels={shubuh:"Shubuh",terbit:"Terbit",dhuha:"Dhuha",dzuhur:"Dzuhur",ashar:"Ashar",maghrib:"Maghrib",isya:"Isya"};
  return Object.fromEntries(Object.entries(raw).map(([key,ms])=>[key,{key,label:labels[key],...normalize(ms,ymd,method,key)}]));
}
function localYMD(now,timezone){
  const p=new Intl.DateTimeFormat("en-CA",{timeZone:timezone,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);
  const m=Object.fromEntries(p.filter(x=>x.type!=="literal").map(x=>[x.type,Number(x.value)]));
  return{year:m.year,month:m.month,day:m.day};
}
function tomorrow(ymd){const d=new Date(Date.UTC(ymd.year,ymd.month-1,ymd.day+1,12));return{year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate()}}
function nextPrayer(nowMs,times,ymd,method){for(const key of["shubuh","dzuhur","ashar","maghrib","isya"])if(nowMs<times[key].ts)return times[key];return calculate(tomorrow(ymd),method).shubuh}
function countdown(ms){let s=Math.max(0,Math.floor(ms/1000));return`${pad(Math.floor(s/3600))}:${pad(Math.floor((s%3600)/60))}:${pad(s%60)}`}

globalThis.AL_IHSAN_PRAYER=Object.freeze({calculate,localYMD,nextPrayer,countdown});
})();
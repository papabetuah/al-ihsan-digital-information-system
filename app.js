(()=>{"use strict";
const C=window.AL_IHSAN_CONFIG;
const $=id=>document.getElementById(id);
const E={stage:$("stage"),date:$("liveDate"),clock:$("liveClock"),countdown:$("countdown"),next:$("nextPrayer"),
 shubuh:$("timeShubuh"),terbit:$("timeTerbit"),dzuhur:$("timeDzuhur"),ashar:$("timeAshar"),maghrib:$("timeMaghrib"),isya:$("timeIsya"),status:$("statusDot")};
const D2R=Math.PI/180,R2D=180/Math.PI;
const sin=d=>Math.sin(d*D2R),cos=d=>Math.cos(d*D2R),tan=d=>Math.tan(d*D2R),asin=x=>Math.asin(x)*R2D,acos=x=>Math.acos(x)*R2D,atan2=(y,x)=>Math.atan2(y,x)*R2D;
const fixAngle=a=>((a%360)+360)%360,fixHour=h=>((h%24)+24)%24,pad=n=>String(n).padStart(2,"0");
const acot=x=>Math.atan2(1,x)*R2D;
function julian(y,m,d){if(m<=2){y--;m+=12}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5}
function sunPosition(j){const D=j-2451545,g=fixAngle(357.529+.98560028*D),q=fixAngle(280.459+.98564736*D),L=fixAngle(q+1.915*sin(g)+.020*sin(2*g)),e=23.439-.00000036*D,RA=atan2(cos(e)*sin(L),cos(L))/15;return{declination:asin(sin(e)*sin(L)),equation:q/15-fixHour(RA)}}
function midday(t,j){return fixHour(12-sunPosition(j+t).equation)}
function angleTime(angle,t,j,lat,beforeNoon){const dec=sunPosition(j+t).declination,noon=midday(t,j);let x=(-sin(angle)-sin(dec)*sin(lat))/(cos(dec)*cos(lat));x=Math.max(-1,Math.min(1,x));const delta=acos(x)/15;return noon+(beforeNoon?-delta:delta)}
function asrTime(factor,t,j,lat){const dec=sunPosition(j+t).declination,angle=-acot(factor+tan(Math.abs(lat-dec)));return angleTime(angle,t,j,lat,false)}
function localYMD(now=new Date()){const p=new Intl.DateTimeFormat("en-CA",{timeZone:C.timezone,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);const m=Object.fromEntries(p.filter(x=>x.type!=="literal").map(x=>[x.type,Number(x.value)]));return{year:m.year,month:m.month,day:m.day}}
function calcPrayerTimes(ymd){
 const j=julian(ymd.year,ymd.month,ymd.day)-C.longitude/(15*24),t={shubuh:5,terbit:6,dzuhur:12,ashar:13,maghrib:18,isya:19};
 for(let i=0;i<5;i++){Object.keys(t).forEach(k=>t[k]/=24);t.shubuh=angleTime(C.fajrAngle,t.shubuh,j,C.latitude,true);t.terbit=angleTime(C.sunriseSunsetAngle,t.terbit,j,C.latitude,true);t.dzuhur=midday(t.dzuhur,j);t.ashar=asrTime(C.asrFactor,t.ashar,j,C.latitude);t.maghrib=angleTime(C.sunriseSunsetAngle,t.maghrib,j,C.latitude,false);t.isya=angleTime(C.ishaAngle,t.isya,j,C.latitude,false)}
 const labels={shubuh:"Shubuh",terbit:"Terbit",dzuhur:"Dzuhur",ashar:"Ashar",maghrib:"Maghrib",isya:"Isya"},out={};
 for(const[k,v]of Object.entries(t)){let h=fixHour(v+C.timezoneOffset-C.longitude/15),hh=Math.floor(h),mm=Math.round((h-hh)*60);if(mm===60){hh=(hh+1)%24;mm=0}const ts=Date.UTC(ymd.year,ymd.month-1,ymd.day,hh-C.timezoneOffset,mm,0,0);out[k]={key:k,label:labels[k],time:`${pad(hh)}:${pad(mm)}`,ts}}
 return out
}
function tomorrow(ymd){const d=new Date(Date.UTC(ymd.year,ymd.month-1,ymd.day+1,12));return{year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate()}}
function nextPrayer(nowMs,times,ymd){for(const k of["shubuh","dzuhur","ashar","maghrib","isya"])if(nowMs<times[k].ts)return times[k];return calcPrayerTimes(tomorrow(ymd)).shubuh}
function countdown(ms){let s=Math.max(0,Math.floor(ms/1000));return`${pad(Math.floor(s/3600))}:${pad(Math.floor((s%3600)/60))}:${pad(s%60)}`}
function fit(){const s=Math.min(innerWidth/1672,innerHeight/941);document.documentElement.style.setProperty("--scale",String(s))}
function render(){
 const now=new Date(),ymd=localYMD(now),times=calcPrayerTimes(ymd),next=nextPrayer(now.getTime(),times,ymd);
 E.date.textContent=new Intl.DateTimeFormat("id-ID",{timeZone:C.timezone,weekday:"long",day:"2-digit",month:"long",year:"numeric"}).format(now);
 E.clock.textContent=new Intl.DateTimeFormat("id-ID",{timeZone:C.timezone,hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(now).replace(/\./g,":");
 for(const k of["shubuh","terbit","dzuhur","ashar","maghrib","isya"])E[k].textContent=times[k].time;
 E.next.textContent=`Menuju ${next.label}`;E.countdown.textContent=countdown(next.ts-now.getTime());E.status.style.background="#58f1cf";
}
function init(){fit();render();setInterval(render,1000);addEventListener("resize",fit,{passive:true});if("serviceWorker"in navigator)navigator.serviceWorker.register(`./service-worker.js?v=${encodeURIComponent(C.release)}`).catch(()=>{})}
addEventListener("error",()=>{E.status.style.background="#ffb158"});
init();
})();
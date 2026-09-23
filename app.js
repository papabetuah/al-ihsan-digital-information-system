(()=>{"use strict";
const C=window.AL_IHSAN_CONFIG,P=window.AL_IHSAN_PRAYER,M=C.prayerMethod;
const $=id=>document.getElementById(id);
const E={date:$("liveDate"),clockHM:$("clockHourMinute"),clockSec:$("clockSecond"),countdown:$("countdown"),next:$("nextPrayer"),shubuh:$("timeShubuh"),terbit:$("timeTerbit"),dzuhur:$("timeDzuhur"),ashar:$("timeAshar"),maghrib:$("timeMaghrib"),isya:$("timeIsya"),status:$("statusDot")};
const prayerKeys=["shubuh","terbit","dzuhur","ashar","maghrib","isya"];
const dateFormatter=new Intl.DateTimeFormat("id-ID",{timeZone:C.timezone,weekday:"long",day:"2-digit",month:"long",year:"numeric"});
const clockFormatter=new Intl.DateTimeFormat("id-ID",{timeZone:C.timezone,hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"});
let cachedDateKey="",cachedYmd=null,cachedTimes=null,timerId=0;

function fit(){
  const width=C.stage?.width||1672,height=C.stage?.height||941;
  const scale=Math.min(innerWidth/width,innerHeight/height);
  document.documentElement.style.setProperty("--scale",String(scale));
}

function getDailyTimes(now){
  const ymd=P.localYMD(now,C.timezone);
  const key=`${ymd.year}-${String(ymd.month).padStart(2,"0")}-${String(ymd.day).padStart(2,"0")}`;
  if(key!==cachedDateKey){
    cachedDateKey=key;
    cachedYmd=ymd;
    cachedTimes=P.calculate(ymd,M);
  }
  return{ymd:cachedYmd,times:cachedTimes};
}

function render(){
  try{
    const now=new Date();
    const{ymd,times}=getDailyTimes(now);
    const next=P.nextPrayer(now.getTime(),times,ymd,M);

    E.date.textContent=dateFormatter.format(now);
    const clockParts=Object.fromEntries(clockFormatter.formatToParts(now).filter(part=>part.type!=="literal").map(part=>[part.type,part.value]));
    E.clockHM.textContent=`${clockParts.hour}:${clockParts.minute}`;
    E.clockSec.textContent=clockParts.second;

    for(const key of prayerKeys)E[key].textContent=times[key].time;

    E.next.textContent=String(next.label||"").replace(/^Menuju\\s+/i,"");
    E.countdown.textContent=P.countdown(next.ts-now.getTime());
    E.status.style.background="#58f1cf";
    document.documentElement.dataset.ready="true";
  }catch(error){
    console.error("Dashboard render failed",error);
    E.status.style.background="#ffb158";
  }
}

function scheduleNextTick(){
  clearTimeout(timerId);
  const delay=1000-(Date.now()%1000)+20;
  timerId=setTimeout(()=>{render();scheduleNextTick()},delay);
}

function init(){
  fit();
  render();
  scheduleNextTick();

  addEventListener("resize",fit,{passive:true});
  addEventListener("orientationchange",fit,{passive:true});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden){fit();render()}});

  if("serviceWorker"in navigator){
    navigator.serviceWorker.register(`./service-worker.js?v=${encodeURIComponent(C.release)}`).catch(error=>{
      console.warn("Service worker registration failed",error);
    });
  }
}

addEventListener("error",()=>{E.status.style.background="#ffb158"});
addEventListener("unhandledrejection",()=>{E.status.style.background="#ffb158"});
init();
})();

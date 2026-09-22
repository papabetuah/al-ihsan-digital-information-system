(()=>{"use strict";
const C=window.AL_IHSAN_CONFIG,P=window.AL_IHSAN_PRAYER,M=C.prayerMethod;
const $=id=>document.getElementById(id);
const E={stage:$("stage"),date:$("liveDate"),clock:$("liveClock"),countdown:$("countdown"),next:$("nextPrayer"),shubuh:$("timeShubuh"),terbit:$("timeTerbit"),dzuhur:$("timeDzuhur"),ashar:$("timeAshar"),maghrib:$("timeMaghrib"),isya:$("timeIsya"),status:$("statusDot")};
function fit(){const s=Math.min(innerWidth/1672,innerHeight/941);document.documentElement.style.setProperty("--scale",String(s))}
function render(){
  const now=new Date(),ymd=P.localYMD(now,C.timezone),times=P.calculate(ymd,M),next=P.nextPrayer(now.getTime(),times,ymd,M);
  E.date.textContent=new Intl.DateTimeFormat("id-ID",{timeZone:C.timezone,weekday:"long",day:"2-digit",month:"long",year:"numeric"}).format(now);
  E.clock.textContent=new Intl.DateTimeFormat("id-ID",{timeZone:C.timezone,hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(now).replace(/\./g,":");
  for(const key of["shubuh","terbit","dzuhur","ashar","maghrib","isya"])E[key].textContent=times[key].time;
  E.next.textContent=`Menuju ${next.label}`;
  E.countdown.textContent=P.countdown(next.ts-now.getTime());
  E.status.style.background="#58f1cf";
}
function init(){fit();render();setInterval(render,1000);addEventListener("resize",fit,{passive:true});if("serviceWorker"in navigator)navigator.serviceWorker.register(`./service-worker.js?v=${encodeURIComponent(C.release)}`).catch(()=>{})}
addEventListener("error",()=>{E.status.style.background="#ffb158"});
init();
})();
(()=>{
"use strict";

const $=id=>document.getElementById(id);
const E={
  clock:$("financeClock"),
  weekday:$("financeDateWeekday"),
  gregorian:$("financeDateGregorian"),
  hijri:$("financeDateHijri"),
  next:$("financeNextPrayer"),
  countdown:$("financeCountdown")
};

const timezone=window.AL_IHSAN_CONFIG?.timezone||"Asia/Jakarta";
const clockFormatter=new Intl.DateTimeFormat("id-ID",{
  timeZone:timezone,
  hour:"2-digit",
  minute:"2-digit",
  second:"2-digit",
  hourCycle:"h23"
});

function formatClock(now){
  const parts=Object.fromEntries(
    clockFormatter.formatToParts(now)
      .filter(part=>part.type!=="literal")
      .map(part=>[part.type,part.value])
  );
  return `${parts.hour}:${parts.minute}:${parts.second}`;
}

function normalizePrayer(label){
  return String(label||"")
    .replace(/^Menuju\s+/i,"")
    .replace(/^Shubuh$/i,"Subuh")
    .trim()
    .toUpperCase();
}

function splitGregorian(text){
  const value=String(text||"").trim();
  const comma=value.indexOf(",");
  if(comma<0)return{weekday:"",date:value};
  return{
    weekday:value.slice(0,comma).trim(),
    date:value.slice(comma+1).trim()
  };
}

window.AL_IHSAN_FINANCE_TICK=({now,gregorianText,hijriText,nextLabel,countdownText})=>{
  const gregorian=splitGregorian(gregorianText);
  if(E.clock)E.clock.textContent=formatClock(now);
  if(E.weekday)E.weekday.textContent=gregorian.weekday;
  if(E.gregorian)E.gregorian.textContent=gregorian.date;
  if(E.hijri)E.hijri.textContent=hijriText||"";
  if(E.next)E.next.textContent=normalizePrayer(nextLabel);
  if(E.countdown)E.countdown.textContent=countdownText||"";
};
})();

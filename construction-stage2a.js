(()=>{
"use strict";

const $=id=>document.getElementById(id);
const E={
  clock:$("constructionClock"),
  gregorian:$("constructionDateGregorian"),
  hijri:$("constructionDateHijri"),
  next:$("constructionNextPrayer"),
  countdown:$("constructionCountdown")
};

const timezone=window.AL_IHSAN_CONFIG?.timezone||"Asia/Jakarta";
const clockFormatter=new Intl.DateTimeFormat("id-ID",{
  timeZone:timezone,
  hour:"2-digit",
  minute:"2-digit",
  hourCycle:"h23"
});

function formatClock(now){
  const parts=Object.fromEntries(
    clockFormatter.formatToParts(now)
      .filter(part=>part.type!=="literal")
      .map(part=>[part.type,part.value])
  );
  return `${parts.hour}:${parts.minute}`;
}

function normalizePrayer(label){
  return String(label||"")
    .replace(/^Menuju\s+/i,"")
    .replace(/^Shubuh$/i,"Subuh")
    .trim()
    .toUpperCase();
}

window.AL_IHSAN_CONSTRUCTION_TICK=({now,gregorianText,hijriText,nextLabel,countdownText})=>{
  if(E.clock)E.clock.textContent=formatClock(now);
  if(E.gregorian)E.gregorian.textContent=String(gregorianText||"").trim();
  if(E.hijri)E.hijri.textContent=String(hijriText||"").trim();
  if(E.next)E.next.textContent=normalizePrayer(nextLabel);
  if(E.countdown)E.countdown.textContent=countdownText||"";
};
})();

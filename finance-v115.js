(()=>{
"use strict";
const $=id=>document.getElementById(id);

async function loadSharpUnderlay(){
  const img=$("financeUnderlay");
  if(!img)return;
  try{
    const base="./assets/finance-background-approved-v115.b64.";
    const parts=await Promise.all([1,2,3,4].map(async n=>{
      const r=await fetch(base+n+"?v=115",{cache:"force-cache"});
      if(!r.ok)throw new Error("finance background part "+n);
      return (await r.text()).trim();
    }));
    const dataUrl="data:image/webp;base64,"+parts.join("");
    img.src=dataUrl;
    document.documentElement.style.setProperty("--finance-underlay-url",`url("${dataUrl}")`);
    img.dataset.quality="approved-v115";
  }catch(e){
    console.warn("Finance sharp underlay unavailable; fallback retained",e);
  }
}

function removeDummyRows(){
  for(const id of ["financeTopIncome","financeTopExpense"]){
    const el=$(id);
    if(!el)continue;
    for(const row of [...el.querySelectorAll(".finance-rank-row")]){
      const name=(row.querySelector(".finance-rank-name")?.textContent||"").trim();
      const amount=(row.querySelector(".finance-rank-amount")?.textContent||"").trim();
      if(!name || /^[-–—]+$/.test(name) || !amount || /^[-–—]+$/.test(amount)) row.remove();
    }
  }
}

function cleanInitialPlaceholders(){
  for(const id of ["financePeriod","financeClock","financeDateGregorian","financeDateHijri","financeNextPrayer","financeCountdown","financePosition","financeIncome","financeExpense","financeSurplus","financeTarget","financeCollected","financeRemaining","financeProgressText"]){
    const el=$(id);
    if(!el)continue;
    const s=(el.textContent||"").trim();
    if(/^[-–—:]+$/.test(s) || /^(?:--:--(?::--)?)$/.test(s)) el.textContent="";
  }
}

function watchRanks(){
  for(const id of ["financeTopIncome","financeTopExpense"]){
    const el=$(id);
    if(!el)continue;
    new MutationObserver(removeDummyRows).observe(el,{childList:true,subtree:true,characterData:true});
  }
}

cleanInitialPlaceholders();
watchRanks();
removeDummyRows();
loadSharpUnderlay();
})();
import fs from "node:fs";
import {spawnSync} from "node:child_process";

function assert(ok,msg){if(!ok)throw new Error(msg)}
const index=fs.readFileSync("index.html","utf8");
const config=fs.readFileSync("config-v64.js","utf8");
const app=fs.readFileSync("app-v107.js","utf8");
const css=fs.readFileSync("finance-background-only-v117.css","utf8");
const stage2aCss=fs.readFileSync("finance-stage2a.css","utf8");
const stage2aJs=fs.readFileSync("finance-stage2a.js","utf8");

assert(index.includes('id="financeScene"'),"financeScene missing");
assert(index.includes("finance-background-approved-master.png"),"approved master PNG missing from financeScene");
assert(!index.includes("finance-background-approved-v117.webp"),"old compressed finance WebP must not be used");
assert(!index.includes("./finance-v111.js"),"legacy finance data renderer must stay disabled");
assert(!index.includes("./finance-v115.js"),"legacy finance cleanup loader must stay disabled");
assert(!index.includes("finance-brand-fix"),"finance logo patch must be absent");
assert(!index.includes("finance-qr-fix"),"finance QR patch must be absent");
assert(!index.includes("finance-static-cleanup"),"finance masks must be absent");
assert(!index.includes("finance-card-value"),"Stage 2B KPI overlay must be absent");
assert(!index.includes("finance-v112.css"),"legacy finance layout stylesheet must not be loaded");

const financeBlock=index.match(/<section id="financeScene"[\s\S]*?<\/section>/)?.[0]||"";
assert((financeBlock.match(/<img\b/g)||[]).length===1,"financeScene must retain exactly one backlayer img");
for(const id of ["financeClock","financeDateWeekday","financeDateGregorian","financeDateHijri","financeNextPrayer","financeCountdown"]){
  assert(financeBlock.includes(`id="${id}"`),id+" Stage 2A element missing");
}
assert(financeBlock.includes("finance-stage2a"),"Stage 2A upper layer missing");
assert(!/finance(?:Position|Income|Expense|Surplus|TopIncome|TopExpense|Target|Collected|Remaining|Progress)/.test(financeBlock),
  "Stage 2B+ finance data must remain absent");
assert(index.includes("./finance-stage2a.css"),"Stage 2A stylesheet missing");
assert(index.includes("./finance-stage2a.js"),"Stage 2A renderer missing");
assert(css.includes("object-fit:fill"),"finance master must fill the 1672x941 stage");
assert(!css.includes("::before")&&!css.includes("::after"),"finance backlayer CSS must not use pseudo overlays");
assert(stage2aJs.includes("AL_IHSAN_FINANCE_TICK"),"Stage 2A must consume existing finance tick hook");
assert(stage2aJs.includes("gregorianText")&&stage2aJs.includes("hijriText"),"Stage 2A dates not wired");
assert(stage2aJs.includes("splitGregorian"),"Gregorian weekday/date split missing");
assert(stage2aCss.includes(".finance-date-separator"),"Gregorian/Hijri separator missing");
assert(stage2aCss.includes("font-size:52px")&&stage2aCss.includes("font-size:58px")&&stage2aCss.includes("font-size:56px"),"Stage 2A reference typography not applied");
assert(stage2aCss.includes(".finance-next-box")&&stage2aCss.includes(".finance-time-box"),"Stage 2A placement missing");

assert(config.includes('sequence: Object.freeze(["dashboard","announcement","donation"])'),
  "finance must remain preview-only until final visual approval");
assert(app.includes('["dashboard","donation","announcement","finance","prayer","zikir"]'),
  "direct finance preview must remain available");
assert(app.includes("AL_IHSAN_FINANCE_TICK"),"app finance tick hook missing");

for(const file of ["app-v107.js","config-v64.js","finance-stage2a.js"]){
  const p=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});
  assert(p.status===0,file+" syntax error:\n"+p.stderr);
}
console.log("Finance Stage 2A regression: OK");

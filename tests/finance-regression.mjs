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
assert(!index.includes("finance-card-value"),"legacy KPI overlay class must be absent");
assert(!index.includes("finance-v112.css"),"legacy finance layout stylesheet must not be loaded");

const financeBlock=index.match(/<section id="financeScene"[\s\S]*?<\/section>/)?.[0]||"";
assert((financeBlock.match(/<img\b/g)||[]).length===1,"financeScene must retain exactly one backlayer img");
for(const id of ["financeClock","financeDateWeekday","financeDateGregorian","financeDateHijri","financeNextPrayer","financeCountdown"]){
  assert(financeBlock.includes(`id="${id}"`),id+" Stage 2A element missing");
}
assert(financeBlock.includes("finance-stage2a"),"Stage 2A upper layer missing");
const upperBlock=financeBlock.match(/<div class="finance-upperlayer[\s\S]*?<\/div>\s*<\/section>/)?.[0]||"";
for(const id of ["financePosition","financeIncome","financeExpense","financeSurplus"]){
  assert(financeBlock.includes(`id="${id}"`),id+" Stage 2B KPI missing");
  assert(upperBlock.includes(`id="${id}"`),id+" must be inside finance-upperlayer");
}
for(const id of ["financeChart","financeTopIncome","financeTopExpense"]){
  assert(financeBlock.includes(`id="${id}"`),id+" Stage 2C/2D element missing");
  assert(upperBlock.includes(`id="${id}"`),id+" must be inside finance-upperlayer");
}
assert(!/finance(?:Target|Collected|Remaining|Progress)/.test(financeBlock),
  "Stage 2E finance data must remain absent");
assert(index.includes("./finance-stage2a.css"),"Stage 2A stylesheet missing");
assert(index.includes("./finance-stage2a.js"),"Stage 2A renderer missing");
assert(!index.includes("./finance-stage2b.css"),"Stage 2B must not depend on a separate stylesheet");
assert(!index.includes("./finance-stage2b.js"),"Stage 2B must not depend on a separate renderer");
assert(css.includes("object-fit:fill"),"finance master must fill the 1672x941 stage");
assert(!css.includes("::before")&&!css.includes("::after"),"finance backlayer CSS must not use pseudo overlays");
assert(stage2aJs.includes("AL_IHSAN_FINANCE_TICK"),"Stage 2A must consume existing finance tick hook");
assert(stage2aJs.includes("gregorianText")&&stage2aJs.includes("hijriText"),"Stage 2A dates not wired");
assert(stage2aJs.includes("splitGregorian"),"Gregorian weekday/date split missing");
assert(stage2aCss.includes(".finance-date-separator"),"Gregorian/Hijri separator missing");
assert(stage2aCss.includes("font-size:52px")&&stage2aCss.includes("font-size:58px")&&stage2aCss.includes("font-size:56px"),"Stage 2A reference typography not applied");
assert(stage2aCss.includes(".finance-next-box")&&stage2aCss.includes(".finance-time-box"),"Stage 2A placement missing");
assert(stage2aCss.includes(".finance-upperlayer .finance-kpi-position")&&stage2aCss.includes(".finance-upperlayer .finance-kpi-surplus"),"Stage 2B KPI must be styled inside upper layer");
assert(stage2aCss.includes("z-index:10!important"),"Stage 2B KPI must render above backlayer");
assert(financeBlock.includes("-Rp 16.864.347")&&financeBlock.includes("Rp 1.299.000"),"Stage 2B initial visible values missing");
assert(index.includes("finance-upperlayer-2abcd-v8-20261016"),"Upper-layer cache-busting version missing");
assert(stage2aCss.includes("top:346px!important"),"KPI values must be lowered another 12px");
assert(stage2aCss.includes("font-size:48px!important"),"KPI font must be 48px");
assert(stage2aCss.includes(".finance-upperlayer .finance-kpi-position{left:86px!important}")&&stage2aCss.includes(".finance-upperlayer .finance-kpi-surplus{left:1262px!important}"),"KPI values must be shifted another 12px right");
for(const key of ["posisi_dana","pemasukan_operasional","pengeluaran_operasional","surplus_defisit"]){
  assert(stage2aJs.includes(key),"Stage 2B missing source key "+key);
}
assert(stage2aJs.includes("finance-summary.json"),"Finance fallback missing");
assert(stage2aJs.includes("renderChart")&&stage2aJs.includes("topCategories"),"Stage 2C/2D dynamic renderers missing");
assert(stage2aCss.includes(".finance-chart-live")&&stage2aCss.includes(".finance-ranking-live"),"Stage 2C/2D upper-layer styling missing");
assert(financeBlock.includes("MEI")&&financeBlock.includes("OKT"),"Stage 2C initial six-month chart missing");
assert(financeBlock.includes("Kotak Amal")&&financeBlock.includes("Honor Imam/Petugas"),"Stage 2D initial ranking missing");

assert(config.includes('sequence: Object.freeze(["dashboard","announcement","donation"])'),
  "finance must remain preview-only until final visual approval");
assert(app.includes('["dashboard","donation","announcement","finance","prayer","zikir"]'),
  "direct finance preview must remain available");
assert(app.includes("AL_IHSAN_FINANCE_TICK"),"app finance tick hook missing");

for(const file of ["app-v107.js","config-v64.js","finance-stage2a.js"]){
  const p=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});
  assert(p.status===0,file+" syntax error:\n"+p.stderr);
}
console.log("Finance Stage 2C/2D regression: OK");

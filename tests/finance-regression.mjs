import fs from "node:fs";
import {spawnSync} from "node:child_process";

function assert(ok,msg){if(!ok)throw new Error(msg)}
const index=fs.readFileSync("index.html","utf8");
const config=fs.readFileSync("config-v64.js","utf8");
const app=fs.readFileSync("app-v107.js","utf8");
const css=fs.readFileSync("finance-background-only-v117.css","utf8");
const stage2aCss=fs.readFileSync("finance-stage2a.css","utf8");
const stage2aJs=fs.readFileSync("finance-stage2a.js","utf8");
const publicReport=fs.readFileSync("laporan-keuangan/index.html","utf8");
const publicRedirect=fs.readFileSync("r/index.html","utf8");
const publicTransactions=JSON.parse(fs.readFileSync("data/finance-public-transactions.json","utf8"));
const financeSummary=JSON.parse(fs.readFileSync("data/finance-summary.json","utf8"));


assert(index.includes('id="financeScene"'),"financeScene missing");
assert(index.includes("finance-background-approved-master.png"),"approved master PNG missing from financeScene");
assert(publicReport.includes("Laporan Keuangan Masjid Al Ihsan"),"public finance report page missing");
assert(publicRedirect.includes("../laporan-keuangan/"),"short QR redirect must target public finance report");
assert(financeSummary.report_url==="https://papabetuah.github.io/al-ihsan-digital-information-system/laporan-keuangan/","public finance report URL missing from summary");
assert(publicTransactions.period===financeSummary.period&&publicTransactions.transactions.length>0,"public transaction snapshot missing");
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
for(const id of ["financePeriod","financeTarget","financeCollected","financeRemaining","financeProgress","financeProgressText"]){
  assert(financeBlock.includes(`id="${id}"`),id+" Stage 2E/period element missing");
  assert(upperBlock.includes(`id="${id}"`),id+" must be inside finance-upperlayer");
}
assert(index.includes("./finance-stage2a.css"),"Stage 2A stylesheet missing");
assert(index.includes("./finance-stage2a.js"),"Stage 2A renderer missing");
assert(!index.includes("./finance-stage2b.css"),"Stage 2B must not depend on a separate stylesheet");
assert(!index.includes("./finance-stage2b.js"),"Stage 2B must not depend on a separate renderer");
assert(css.includes("object-fit:fill"),"finance master must fill the 1672x941 stage");
assert(!css.includes("::before")&&!css.includes("::after"),"finance backlayer CSS must not use pseudo overlays");
assert(stage2aJs.includes("AL_IHSAN_FINANCE_TICK"),"Stage 2A must consume existing finance tick hook");
assert(stage2aJs.includes("gregorianText")&&stage2aJs.includes("hijriText"),"Stage 2A dates not wired");
assert(stage2aJs.includes("splitGregorian"),"Gregorian weekday/date split missing");
assert(!stage2aJs.includes('second:"2-digit"')&&stage2aJs.includes('return `${parts.hour}:${parts.minute}`;'),"Finance live clock must show HH:MM only");
assert(stage2aCss.includes("left:8px;\n  top:62px;"),"Countdown must move 2px right");
assert(stage2aCss.includes(".finance-next-prayer{\n  position:absolute;\n  left:10px;\n  top:0;"),"Prayer name must move another 5px right");
assert(stage2aCss.includes("font-size:43px;"),"Prayer name font must be 43px");
assert(stage2aCss.includes("font-size:83px;"),"Finance live clock font must be 83px");
assert(stage2aCss.includes(".finance-clock-live{\n  position:absolute;\n  left:-3px;\n  top:-32px;"),"Finance live clock must move down another 3px");
assert(stage2aCss.includes("font-size:29px"),"Stage 2E financial values must use 29px font");
assert(stage2aCss.includes(".finance-need-remaining{\n  left:575px;\n  top:762px;"),"Masih Dibutuhkan must move 4px up");
assert(stage2aCss.includes(".finance-need-collected{\n  left:1013px;\n  top:762px;"),"Terkumpul must move 10px right and 4px up");
assert(stage2aCss.includes(".finance-date-separator"),"Gregorian/Hijri separator missing");
assert(stage2aCss.includes("font-size:43px")&&stage2aCss.includes("font-size:46px")&&stage2aCss.includes("font-size:83px"),"Stage 2A prayer/countdown/clock typography not applied");
assert(stage2aCss.includes(".finance-next-box")&&stage2aCss.includes(".finance-time-box"),"Stage 2A placement missing");
assert(stage2aCss.includes(".finance-upperlayer .finance-kpi-position")&&stage2aCss.includes(".finance-upperlayer .finance-kpi-surplus"),"Stage 2B KPI must be styled inside upper layer");
assert(stage2aCss.includes("z-index:10!important"),"Stage 2B KPI must render above backlayer");
assert(financeBlock.includes("-Rp 16.864.347")&&financeBlock.includes("Rp 1.299.000"),"Stage 2B initial visible values missing");
assert(index.includes("finance-upperlayer-2abcde-v22-clock83-down3-20261016"),"Upper-layer cache-busting version missing");
assert(stage2aCss.includes("top:346px!important"),"KPI values must be lowered another 12px");
assert(stage2aCss.includes("font-size:48px!important"),"KPI font must be 48px");
assert(stage2aCss.includes(".finance-upperlayer .finance-kpi-position{left:86px!important}")&&stage2aCss.includes(".finance-upperlayer .finance-kpi-surplus{left:1262px!important}"),"KPI values must be shifted another 12px right");
for(const key of ["posisi_dana","pemasukan_operasional","pengeluaran_operasional","surplus_defisit"]){
  assert(stage2aJs.includes(key),"Stage 2B missing source key "+key);
}
assert(stage2aJs.includes("finance-summary.json"),"Finance fallback missing");
assert(stage2aJs.includes("renderChart")&&stage2aJs.includes("topCategories"),"Stage 2C/2D dynamic renderers missing");
for(const key of ["target_operasional","terkumpul_operasional","masih_dibutuhkan","persentase"]){assert(stage2aJs.includes(key),"Stage 2E missing source key "+key)}
assert(stage2aJs.includes("formatPeriod")&&stage2aJs.includes("setProgress"),"Stage 2E/period dynamic renderers missing");
assert(stage2aCss.includes(".finance-chart-live")&&stage2aCss.includes(".finance-ranking-live"),"Stage 2C/2D upper-layer styling missing");
assert(stage2aCss.includes(".finance-period-live"),"Finance period styling missing");
assert(stage2aCss.includes(".finance-stage2e")&&stage2aCss.includes(".finance-progress-fill"),"Stage 2E styling missing");
assert(stage2aCss.includes(".finance-need-target{\n  left:796px;\n  top:762px;"),"Target kebutuhan must move 4px up");
assert(stage2aCss.includes(".finance-need-collected{\n  left:1013px;\n  top:762px;"),"Terkumpul must move another 10px right and 4px up");
assert(stage2aCss.includes("left:1180px;\n  top:792px;"),"Progress text must move another 8px right and 2px up");
assert(stage2aCss.includes(".finance-need-remaining{\n  left:575px;\n  top:762px;"),"Masih dibutuhkan must move 4px up");
assert(stage2aCss.includes(".finance-progress-track{\n  position:absolute;\n  left:581px;\n  top:804.6px;"),"Progress indicator must move down another 0.2px");
assert(stage2aCss.includes("left:528px;\n  top:505px;"),"Stage 2C chart must move another 4px right and 2px down");
assert(stage2aCss.includes(".finance-ranking-expense{left:1298px;top:523px}"),"Stage 2D expense ranking must move another 8px right and 1px down");
assert(stage2aCss.includes(".finance-ranking-income{left:126px;top:522px}"),"Stage 2D income ranking must move 4px left and 6px down");
assert(financeBlock.includes("MEI")&&financeBlock.includes("OKT"),"Stage 2C initial six-month chart missing");
assert(financeBlock.includes("Kotak Amal")&&financeBlock.includes("Honor Imam/Petugas"),"Stage 2D initial ranking missing");
assert(financeBlock.includes("OKTOBER 2026"),"Initial finance period missing");
assert(financeBlock.includes("Rp 8.701.000")&&financeBlock.includes("Rp 10.000.000")&&financeBlock.includes("13%"),"Stage 2E initial values missing");

assert(config.includes('sequence: Object.freeze(["dashboard","announcement","finance","donation"])'),
  "finance must be enabled in the approved general TV rotation after announcement and before donation");
assert(config.includes("financeMs: 45000"),"Finance rotation duration must remain 45 seconds");
assert(app.includes('["dashboard","donation","announcement","finance","prayer","zikir"]'),
  "direct finance preview must remain available");
assert(app.includes("AL_IHSAN_FINANCE_TICK"),"app finance tick hook missing");

for(const file of ["app-v107.js","config-v64.js","finance-stage2a.js"]){
  const p=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});
  assert(p.status===0,file+" syntax error:\n"+p.stderr);
}
console.log("Finance Stage 2E + period regression: OK");

import fs from "node:fs";
import {spawnSync} from "node:child_process";

function assert(ok,msg){if(!ok)throw new Error(msg)}
const index=fs.readFileSync("index.html","utf8");
const config=fs.readFileSync("config-v64.js","utf8");
const app=fs.readFileSync("app-v107.js","utf8");
const finance=fs.readFileSync("finance-v111.js","utf8");
const finance115=fs.readFileSync("finance-v115.js","utf8");
const fallback=JSON.parse(fs.readFileSync("data/finance-summary.json","utf8"));

assert(index.includes('id="financeScene"'),"financeScene missing from index.html");
assert(index.includes("./finance-v112.css"),"finance approved-master CSS missing");
assert(index.includes("finance-background-approved-v114.webp"),"finance fallback underlay missing");
assert(index.includes("./finance-v115.js"),"finance v115 cleanup loader missing");
assert(index.includes("./finance-v111.js"),"finance JS missing");
assert(!index.includes("pre-azan-audio-v110.js"),"browser pre-azan audio must remain disabled");

assert(config.includes('sequence: Object.freeze(["dashboard","announcement","donation"])'),
  "finance must remain preview-only until visual approval");
assert(app.includes('["dashboard","donation","announcement","finance","prayer","zikir"]'),
  "direct finance preview must remain available");

assert(config.includes('financeDashboard: "Keuangan Dashboard"'),"finance dashboard sheet missing from config");
assert(config.includes('financeTransactions: "Keuangan Transaksi"'),"finance transactions sheet missing from config");
assert(app.includes("scene-finance"),"finance scene integration missing");
assert(app.includes("AL_IHSAN_FINANCE_TICK"),"finance clock/prayer tick missing");
assert(finance.includes("finance-summary.json"),"finance fallback missing");
assert(finance115.includes("finance-background-approved-v115.b64."),"sharp finance underlay loader missing");

assert(fallback.period==="2026-10","fallback period mismatch");
assert(fallback.position===-16864347,"fallback position mismatch");
assert(fallback.income===1299000,"fallback income mismatch");
assert(fallback.expense===3981000,"fallback expense mismatch");
assert(fallback.surplus===-2682000,"fallback surplus mismatch");

for(const file of ["app-v107.js","finance-v111.js","config-v64.js"]){
  const p=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});
  assert(p.status===0,file+" syntax error:
"+p.stderr);
}
console.log("Finance regression: OK");

import fs from "node:fs";
import {spawnSync} from "node:child_process";

function assert(ok,msg){if(!ok)throw new Error(msg)}
const index=fs.readFileSync("index.html","utf8");
const config=fs.readFileSync("config-v64.js","utf8");
const app=fs.readFileSync("app-v107.js","utf8");

assert(index.includes('id="financeScene"'),"financeScene missing");
assert(index.includes("finance-background-only-v117.css"),"background-only finance CSS missing");
assert(index.includes("finance-background-approved-v117.webp"),"approved single-file finance background missing");
assert(!index.includes("./finance-v111.js"),"finance data renderer must be disabled in background-only stage");
assert(!index.includes("./finance-v115.js"),"finance cleanup loader must be disabled in background-only stage");
assert(!index.includes("finance-static-cleanup"),"finance masks must be removed in background-only stage");
assert(!index.includes("finance-card-value"),"finance live KPI overlay must be absent in background-only stage");
assert(!index.includes("pre-azan-audio-v110.js"),"browser pre-azan audio must remain disabled");

assert(config.includes('sequence: Object.freeze(["dashboard","announcement","donation"])'),
  "finance must remain preview-only until visual approval");
assert(config.includes('release: "finance-background-only-v117-20261015"'),
  "finance release marker mismatch");
assert(app.includes('["dashboard","donation","announcement","finance","prayer","zikir"]'),
  "direct finance preview must remain available");

for(const file of ["app-v107.js","config-v64.js"]){
  const p=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});
  assert(p.status===0,file+" syntax error:\n"+p.stderr);
}
console.log("Finance background-only regression: OK");

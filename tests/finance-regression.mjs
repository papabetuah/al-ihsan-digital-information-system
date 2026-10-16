import fs from "node:fs";
import {spawnSync} from "node:child_process";

function assert(ok,msg){if(!ok)throw new Error(msg)}
const index=fs.readFileSync("index.html","utf8");
const config=fs.readFileSync("config-v64.js","utf8");
const app=fs.readFileSync("app-v107.js","utf8");
const css=fs.readFileSync("finance-background-only-v117.css","utf8");

assert(index.includes('id="financeScene"'),"financeScene missing");
assert(index.includes("finance-background-approved-master.png"),"approved master PNG missing from financeScene");
assert(!index.includes("finance-background-approved-v117.webp"),"old compressed finance WebP must not be used");
assert(!index.includes("./finance-v111.js"),"finance data renderer must stay disabled");
assert(!index.includes("./finance-v115.js"),"finance cleanup loader must stay disabled");
assert(!index.includes("finance-brand-fix"),"finance logo patch must be absent");
assert(!index.includes("finance-qr-fix"),"finance QR patch must be absent");
assert(!index.includes("finance-static-cleanup"),"finance masks must be absent");
assert(!index.includes("finance-card-value"),"finance live KPI overlay must be absent");
assert(!index.includes("finance-v112.css"),"legacy finance layout stylesheet must not be loaded");

const financeBlock=index.match(/<section id="financeScene"[\s\S]*?<\/section>/)?.[0]||"";
assert((financeBlock.match(/<img\b/g)||[]).length===1,"financeScene must contain exactly one img");
assert(!/<(?:div|a|canvas|svg)\b/i.test(financeBlock),"financeScene must contain no overlay elements");
assert(css.includes("object-fit:fill"),"finance master must fill the 1672x941 stage");
assert(!css.includes("::before")&&!css.includes("::after"),"finance CSS must not use pseudo overlays");

assert(config.includes('sequence: Object.freeze(["dashboard","announcement","donation"])'),
  "finance must remain preview-only until visual approval");
assert(app.includes('["dashboard","donation","announcement","finance","prayer","zikir"]'),
  "direct finance preview must remain available");

for(const file of ["app-v107.js","config-v64.js"]){
  const p=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});
  assert(p.status===0,file+" syntax error:\n"+p.stderr);
}
console.log("Finance approved-master regression: OK");

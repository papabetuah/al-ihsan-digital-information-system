import fs from "node:fs";
function assert(ok,msg){if(!ok)throw new Error(msg)}

const index=fs.readFileSync("index.html","utf8");
const app=fs.readFileSync("app-v107.js","utf8");
const config=fs.readFileSync("config-v64.js","utf8");
const baseCss=fs.readFileSync("construction-background-only-v1.css","utf8");
const stage2aCss=fs.readFileSync("construction-stage2a.css","utf8");
const stage2aJs=fs.readFileSync("construction-stage2a.js","utf8");
const image=fs.readFileSync("assets/construction-background-approved-master.png");

const block=index.match(/<section id="constructionScene"[\s\S]*?<\/section>/)?.[0]||"";

assert(index.includes('id="constructionScene"'),"constructionScene missing");
assert(block.includes('class="construction-underlay"'),"approved construction image element missing");
assert(block.includes("assets/construction-background-approved-master.png?v=approved-master-20261017"),"approved construction PNG master must be used");
assert(block.includes('class="construction-upperlayer"'),"construction Stage 2A upper layer missing");

for(const id of ["constructionClock","constructionDateGregorian","constructionDateHijri","constructionNextPrayer","constructionCountdown"]){
  assert(block.includes('id="'+id+'"'),id+" missing");
}

assert(index.includes("./construction-stage2a.css?v=construction-stage2a-v3-fontplus8-next30-offset-20261017"),"construction Stage 2A stylesheet missing");
assert(index.includes("./construction-stage2a.js?v=construction-stage2a-v3-fontplus8-next30-offset-20261017"),"construction Stage 2A runtime missing");
assert(baseCss.includes(".construction-underlay"),"construction underlay CSS missing");
assert(stage2aCss.includes("left:1062px")&&stage2aCss.includes("top:32px"),"construction clock first-pass geometry missing");
assert(stage2aCss.includes("left:1210px")&&stage2aCss.includes("width:200px"),"construction date first-pass geometry missing");
assert(stage2aCss.includes("left:1481px")&&stage2aCss.includes("width:132px"),"construction next-prayer first-pass geometry missing");
assert(stage2aCss.includes('"Arial Narrow","Roboto Condensed","Liberation Sans Narrow"'),"construction time/date condensed font stack missing");
assert(stage2aCss.includes("transform:scaleX(.84)"),"construction time/date must remain tall and narrow");
assert(/\.construction-next-prayer\{[\s\S]*?font-size:30px;/.test(stage2aCss),"construction next-prayer font must be 30px");
assert(/\.construction-countdown-live\{[\s\S]*?font-size:30px;/.test(stage2aCss),"construction countdown font must be 30px");

assert(image.length===1770530,"approved construction image size changed");
assert(image[0]===0x89&&image[1]===0x50&&image[2]===0x4e&&image[3]===0x47,"approved construction asset must remain PNG");

assert(stage2aJs.includes("AL_IHSAN_CONSTRUCTION_TICK"),"construction live tick runtime missing");
assert(stage2aJs.includes('hour:"2-digit"')&&stage2aJs.includes('minute:"2-digit"'),"construction clock must be HH:MM");
assert(!stage2aJs.includes('second:"2-digit"'),"construction clock must not show seconds");
assert(app.includes("AL_IHSAN_CONSTRUCTION_TICK"),"main render loop must feed construction Stage 2A");
assert(app.includes('construction:$("constructionScene")'),"construction scene reference missing");
assert(app.includes('"construction","prayer"'),"construction direct preview must remain available");

assert(config.includes('sequence: Object.freeze(["dashboard","announcement","finance","donation"])'),"construction must remain preview-only");
assert(config.includes('release: "construction-stage2a-v3-20261017"'),"construction Stage 2A release marker missing");

console.log("Construction Stage 2A regression: OK");

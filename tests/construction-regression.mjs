import fs from "node:fs";
function assert(ok,msg){if(!ok)throw new Error(msg)}

const index=fs.readFileSync("index.html","utf8");
const app=fs.readFileSync("app-v107.js","utf8");
const config=fs.readFileSync("config-v64.js","utf8");
const baseCss=fs.readFileSync("construction-background-only-v1.css","utf8");
const stage2aCss=fs.readFileSync("construction-stage2a.css","utf8");
const stage2aJs=fs.readFileSync("construction-stage2a.js","utf8");
const stage2bCss=fs.readFileSync("construction-stage2b.css","utf8");
const stage2bJs=fs.readFileSync("construction-stage2b.js","utf8");
const image=fs.readFileSync("assets/construction-background-approved-master.png");

const block=index.match(/<section id="constructionScene"[\s\S]*?<\/section>/)?.[0]||"";

assert(index.includes('id="constructionScene"'),"constructionScene missing");
assert(block.includes('class="construction-underlay"'),"approved construction image element missing");
assert(block.includes("assets/construction-background-approved-master.png?v=approved-master-20261017"),"approved construction PNG master must be used");
assert(block.includes('class="construction-upperlayer"'),"construction Stage 2A upper layer missing");

for(const id of ["constructionClock","constructionDateGregorian","constructionDateHijri","constructionNextPrayer","constructionCountdown"]){
  assert(block.includes('id="'+id+'"'),id+" missing");
}

for(const id of ["constructionFocusTitle","constructionFocusNote","constructionTarget","constructionCollected","constructionRemaining","constructionProgressFill","constructionProgressText"]){
  assert(block.includes('id="'+id+'"'),id+" missing");
}

assert(index.includes("./construction-stage2b.css?v=construction-stage2b-v4-title32-kpi24-format-20261017"),"construction Stage 2B stylesheet missing");
assert(index.includes("./construction-stage2b.js?v=construction-stage2b-v4-title32-kpi24-format-20261017"),"construction Stage 2B runtime missing");
assert(stage2bJs.includes("Pembangunan Agenda"),"construction Stage 2B must read Pembangunan Agenda");
assert(stage2bJs.includes("PRIORITAS AKTIF"),"construction Stage 2B must resolve active priority");
assert(stage2bJs.includes("Dana Terkumpul")&&stage2bJs.includes("Kekurangan")&&stage2bJs.includes("Progress"),"construction funding fields missing");
assert(stage2bJs.includes('return "—"'),"blank funding values must not be invented");
assert(stage2bCss.includes(".construction-focus-title-live"),"construction focus typography missing");
assert(stage2bCss.includes("left:975px"),"construction focus content must shift another 15px right");
assert(stage2bCss.includes("font-size:32px"),"construction focus title must be 32px");
assert(stage2bCss.includes(".construction-target-live{left:870px"),"construction target must shift another 4px right");
assert(stage2bCss.includes(".construction-collected-live{left:1146px"),"construction collected must shift another 10px right");
assert(stage2bCss.includes(".construction-remaining-live{left:1410px"),"construction remaining must shift another 10px right");
assert(stage2bCss.includes("left:991px")&&stage2bCss.includes("top:514px")&&stage2bCss.includes("left:1529px")&&stage2bCss.includes("top:518px"),"construction progress bar/text must move right 5px and down 8px");
assert(stage2bJs.includes("return 0;"),"blank construction progress must resolve to 0");
assert(stage2bJs.includes("(pct===0?1:pct)"),"zero progress must keep a 1% visible bar");
assert(stage2bJs.includes('numberFormat.format(pct)+"%"'),"zero progress must render as 0%");
assert(stage2bJs.includes('return "Rp.0"'),"blank collected funding must display Rp.0");
assert(stage2bJs.includes('return "Rp. "+numberFormat.format(value)'),"remaining funding must use Rp. spaced format");
assert(stage2bJs.includes("campaignTarget-collectedValue"),"remaining must equal target minus collected");
assert(stage2bCss.includes(".construction-progress-fill-live"),"construction progress live layer missing");
assert(stage2bCss.includes("font-size:24px"),"construction KPI funding values must be 24px");
assert(stage2bJs.includes("E.target.textContent=moneyFunding(campaignTarget)"),"construction target must use Rp. spaced funding format");

assert(index.includes("./construction-stage2a.css?v=construction-stage2a-v8-countdown-right10-20261017"),"construction Stage 2A stylesheet missing");
assert(index.includes("./construction-stage2a.js?v=construction-stage2a-v8-countdown-right10-20261017"),"construction Stage 2A runtime missing");
assert(baseCss.includes(".construction-underlay"),"construction underlay CSS missing");
assert(stage2aCss.includes("left:1052px")&&stage2aCss.includes("top:28px"),"construction clock must move up 4px");
assert(stage2aCss.includes("left:1210px")&&stage2aCss.includes("width:200px"),"construction date first-pass geometry missing");
assert(stage2aCss.includes("left:1481px")&&stage2aCss.includes("width:132px"),"construction next-prayer first-pass geometry missing");
assert(stage2aCss.includes('"Arial Narrow","Roboto Condensed","Liberation Sans Narrow"'),"construction time/date condensed font stack missing");
assert(stage2aCss.includes("transform:scaleX(.84)"),"construction time/date must remain tall and narrow");
assert(/\.construction-date-gregorian\{[\s\S]*?left:-12px;[\s\S]*?top:0;[\s\S]*?font-size:28px;/.test(stage2aCss),"Gregorian date must move up 5px");
assert(/\.construction-date-hijri\{[\s\S]*?left:-2px;[\s\S]*?top:46px;[\s\S]*?font-size:28px;/.test(stage2aCss),"Hijri date must move right/down 10px");
assert(stage2aCss.includes("font-size:82px"),"construction clock font must be 82px");
assert(stage2aCss.match(/font-size:28px/g)?.length>=2,"construction Gregorian/Hijri fonts must be 28px");
assert(stage2aCss.includes(".construction-date-live:after")&&stage2aCss.includes("top:38px"),"date separator must move down another 2px");
assert(/\.construction-next-prayer\{[\s\S]*?left:10px;[\s\S]*?font-size:30px;/.test(stage2aCss),"construction next-prayer must stay 30px and use 10px right offset");
assert(/\.construction-countdown-live\{[\s\S]*?left:20px;[\s\S]*?top:58px;[\s\S]*?font-size:30px;/.test(stage2aCss),"construction countdown must move another 10px right");

assert(image.length===1770530,"approved construction image size changed");
assert(image[0]===0x89&&image[1]===0x50&&image[2]===0x4e&&image[3]===0x47,"approved construction asset must remain PNG");

assert(stage2aJs.includes("AL_IHSAN_CONSTRUCTION_TICK"),"construction live tick runtime missing");
assert(stage2aJs.includes('hour:"2-digit"')&&stage2aJs.includes('minute:"2-digit"'),"construction clock must be HH:MM");
assert(!stage2aJs.includes('second:"2-digit"'),"construction clock must not show seconds");
assert(app.includes("AL_IHSAN_CONSTRUCTION_TICK"),"main render loop must feed construction Stage 2A");
assert(app.includes('construction:$("constructionScene")'),"construction scene reference missing");
assert(app.includes('"construction","prayer"'),"construction direct preview must remain available");

assert(config.includes('constructionCampaignTarget: 145000000'),"approved construction campaign target missing");
assert(config.includes('constructionAgenda: "Pembangunan Agenda"'),"construction agenda sheet config missing");
assert(config.includes('sequence: Object.freeze(["dashboard","announcement","finance","donation"])'),"construction must remain preview-only");
assert(config.includes('release: "construction-stage2b-v4-20261017"'),"construction Stage 2B release marker missing");

console.log("Construction Stage 2A regression: OK");

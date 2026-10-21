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
const stage2cCss=fs.readFileSync("construction-stage2c.css","utf8");
const stage2cJs=fs.readFileSync("construction-stage2c.js","utf8");
const stage2dCss=fs.readFileSync("construction-stage2d.css","utf8");
const stage2dJs=fs.readFileSync("construction-stage2d.js","utf8");
const stage2eCss=fs.readFileSync("construction-stage2e.css","utf8");
const stage2eJs=fs.readFileSync("construction-stage2e.js","utf8");
const qris=fs.readFileSync("assets/construction-qris-rumah-tahfiz-v2.png");
const image=fs.readFileSync("assets/construction-background-approved-master.png");

const block=index.match(/<section id="constructionScene"[\s\S]*?<\/section>/)?.[0]||"";

assert(index.includes('id="constructionScene"'),"constructionScene missing");
assert(block.includes('class="construction-underlay"'),"approved construction image element missing");
assert(block.includes("assets/construction-background-approved-master.png?v=approved-master-20261021-final-backlayer"),"approved construction PNG master must be used");
assert(block.includes('class="construction-upperlayer"'),"construction Stage 2A upper layer missing");

for(const id of ["constructionClock","constructionDateGregorian","constructionDateHijri","constructionNextPrayer","constructionCountdown"]){
  assert(block.includes('id="'+id+'"'),id+" missing");
}

for(const id of ["constructionFocusTitle","constructionFocusNote","constructionTarget","constructionCollected","constructionRemaining","constructionProgressFill","constructionProgressText"]){
  assert(block.includes('id="'+id+'"'),id+" missing");
}

assert(block.includes('id="constructionAgendaRows"'),"construction Stage 2C agenda container missing");
assert(index.includes("./construction-stage2c.css?v=construction-stage2c-v9-row4up1-row5up1-20261021"),"construction Stage 2C stylesheet missing");
assert(index.includes("./construction-stage2c.js?v=construction-stage2c-v3-sheet-master-20261017"),"construction Stage 2C runtime missing");
assert(stage2cJs.includes("Pembangunan Agenda"),"construction Stage 2C must read Pembangunan Agenda");
assert(stage2cJs.includes(".slice(0,6)"),"construction Stage 2C must show six agenda rows");
assert(stage2cJs.includes("Estimasi Anggaran")&&stage2cJs.includes("Dana Terkumpul")&&stage2cJs.includes("Kekurangan"),"construction Stage 2C funding columns missing");
assert(stage2cJs.includes("estimate!==null?estimate:(active?campaignTarget:null)"),"agenda must prefer Sheet estimate with campaign fallback");
assert(stage2cCss.includes(".construction-agenda-program-live"),"construction Stage 2C agenda program styling missing");
assert(stage2cCss.includes(".construction-agenda-no-live"),"construction Stage 2C agenda number overlay missing");
assert(stage2cCss.includes("nth-child(n+4){\n  transform:translateY(3px)")&&stage2cCss.includes("nth-child(n+5){\n  transform:translateY(4px)")&&stage2cCss.includes("nth-child(n+6){\n  transform:translateY(4px)"),"construction agenda rows 4/5/6 must use final vertical offsets 3/4/4px");

assert(index.includes('id="constructionVisualFocus"'),"construction Stage 2D visual focus container missing");
assert(index.includes("./construction-stage2d.css?v=construction-stage2d-v9-hq-render-20261018"),"construction Stage 2D stylesheet missing");
assert(index.includes("./construction-stage2d.js?v=construction-stage2d-v3-hq-mihrab-20261018"),"construction Stage 2D runtime missing");
assert(index.includes("assets/construction-stage2d-mihrab-right.webp?v=construction-stage2d-v3-hq-mihrab-20261018"),"construction Stage 2D right-view visual missing");
assert(index.includes("assets/construction-stage2d-mihrab-left.webp?v=construction-stage2d-v3-hq-mihrab-20261018"),"construction Stage 2D left-view visual missing");
assert(index.includes("assets/construction-stage2d-mihrab-far-center.webp?v=construction-stage2d-v3-hq-mihrab-20261018"),"construction Stage 2D far-center visual missing");
assert(index.includes("assets/construction-stage2d-mihrab-top.webp?v=construction-stage2d-v3-hq-mihrab-20261018"),"construction Stage 2D top-view visual missing");
assert(stage2dCss.includes(".construction-visual-focus-live")&&stage2dCss.includes("left:22px")&&stage2dCss.includes("top:135px")&&stage2dCss.includes("width:810px")&&stage2dCss.includes("height:470px"),"construction Stage 2D panel geometry must be left 22px, top 135px, 810x470");
assert(stage2dCss.includes("@keyframes constructionVisualKenBurns"),"construction Stage 2D visual motion missing");
assert(stage2dCss.includes("inset:0")&&stage2dCss.includes("width:100%")&&stage2dCss.includes("height:100%"),"construction Stage 2D images must render at panel size without pre-upscale");
assert(stage2dCss.includes("to{transform:scale(1.04)}"),"construction Stage 2D zoom must remain gentle for image sharpness");
assert(stage2dJs.includes("intervalMs=7000")&&stage2dJs.includes("visibilitychange"),"construction Stage 2D slideshow runtime missing");

assert(index.includes('id="constructionDonationPrompt"'),"construction Stage 2E donation prompt missing");
assert(index.includes("./construction-stage2e.css?v=construction-stage2e-v15-pos1449-637-size225x450-20261021"),"construction Stage 2E stylesheet missing");
assert(index.includes("./construction-stage2e.js?v=construction-stage2e-v1-donation-qr-20261018"),"construction Stage 2E runtime missing");
assert(index.includes("assets/construction-qris-rumah-tahfiz-v2.png?v=construction-stage2e-v2-qris-renderfix-20261018"),"construction Stage 2E QRIS asset missing");
assert(index.includes("0851 7311 6899"),"construction Stage 2E donation confirmation number missing");
assert(stage2eCss.includes("left:1449px")&&stage2eCss.includes("top:637px"),"construction Stage 2E QR panel must use left 1449px and top 637px geometry");
assert(stage2eCss.includes("width:124px")&&stage2eCss.includes("height:124px")&&stage2eCss.includes("image-rendering:auto"),"construction Stage 2E QR must render at reduced 124px size");
assert(stage2eCss.includes("width:225px")&&stage2eCss.includes("height:450px"),"construction Stage 2E panel must use 225x450 geometry");
assert(stage2eCss.includes("font-size:14px")&&stage2eCss.includes("white-space:nowrap"),"construction Stage 2E confirmation number must remain on one line");
assert(stage2eCss.includes("@keyframes constructionDonationPulse"),"construction Stage 2E QR pulse missing");
assert(stage2eJs.includes('messages=["SCAN QRIS","TRANSFER BANK NAGARI","KONFIRMASI VIA WA"]'),"construction Stage 2E prompt sequence missing");
assert(stage2eJs.includes("intervalMs=5000")&&stage2eJs.includes("visibilitychange"),"construction Stage 2E runtime cadence missing");
assert(qris.length===1619,"construction Stage 2E QR asset size changed");
assert(qris[0]===0x89&&qris[1]===0x50&&qris[2]===0x4e&&qris[3]===0x47,"construction Stage 2E QR asset must remain PNG");

assert(index.includes("./construction-stage2b.css?v=construction-stage2b-v12-progress-left2-20261021"),"construction Stage 2B stylesheet missing");
assert(index.includes("./construction-stage2b.js?v=construction-stage2b-v11-focus-two-lines-20261017"),"construction Stage 2B runtime missing");
assert(stage2bJs.includes("Pembangunan Agenda"),"construction Stage 2B must read Pembangunan Agenda");
assert(stage2bJs.includes("PRIORITAS AKTIF"),"construction Stage 2B must resolve active priority");
assert(stage2bJs.includes("Dana Terkumpul")&&stage2bJs.includes("Kekurangan")&&stage2bJs.includes("Progress"),"construction funding fields missing");
assert(stage2bJs.includes('return "—"'),"blank funding values must not be invented");
assert(stage2bCss.includes(".construction-focus-title-live"),"construction focus typography missing");
assert(stage2bCss.includes("left:975px"),"construction focus content must shift another 15px right");
assert(/\.construction-focus-title-live\{[\s\S]*?font-size:30px;[\s\S]*?white-space:pre-line;/.test(stage2bCss),"construction focus title must be a compact two-line 30px block");
assert(/\.construction-focus-note-live\{[\s\S]*?left:2px;[\s\S]*?font-size:21px;[\s\S]*?white-space:pre-line;/.test(stage2bCss),"construction focus note must be a compact two-line 21px block");
assert(stage2bJs.includes("focusTitleTwoLines")&&stage2bJs.includes("focusNoteTwoLines"),"construction focus two-line runtime formatting missing");
assert(stage2bCss.includes(".construction-target-live{left:864px;font-size:25px;color:#f2cf75}"),"construction target must be 25px and remain yellow");
assert(stage2bCss.includes(".construction-collected-live{left:1066px"),"construction collected must shift another 10px right");
assert(stage2bCss.includes(".construction-remaining-live{left:1398px"),"construction remaining must shift another 6px left");
assert(stage2bCss.includes("left:988px")&&stage2bCss.includes("top:514px")&&stage2bCss.includes("left:1526px")&&stage2bCss.includes("top:518px"),"construction progress bar/text must shift another 2px left");
assert(stage2bJs.includes("return 0;"),"blank construction progress must resolve to 0");
assert(stage2bJs.includes("(pct===0?1:pct)"),"zero progress must keep a 1% visible bar");
assert(stage2bJs.includes('numberFormat.format(pct)+"%"'),"zero progress must render as 0%");
assert(stage2bJs.includes('return "Rp. 0"'),"blank collected funding must display Rp. 0");
assert(stage2bJs.includes('return "Rp. "+numberFormat.format(value)'),"remaining funding must use Rp. spaced format");
assert(stage2bJs.includes("targetValue-collectedValue"),"remaining must equal target minus collected");
assert(stage2bJs.includes('pct>=50?"funding-high":"funding-low"'),"construction funding colors must switch at 50 percent");
assert(stage2bJs.includes('el.classList.add(fundingClass)'),"construction funding status class application missing");
assert(stage2bCss.includes(".construction-progress-fill-live"),"construction progress live layer missing");
assert(stage2bCss.includes("font-size:24px"),"construction KPI funding values must be 24px");
assert(stage2bCss.includes("top:443px"),"construction funding KPI values must move down another 6px");
assert(stage2bCss.includes(".funding-low{color:#ff4f5a}")&&stage2bCss.includes(".funding-high{color:#51e89a}"),"construction funding threshold colors missing");
assert(stage2bJs.includes("E.target.textContent=moneyFunding(targetValue)"),"construction target must use Sheet-driven Rp. spaced funding format");

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

assert(image.length===2687497,"approved construction image size changed");
assert(image[0]===0x89&&image[1]===0x50&&image[2]===0x4e&&image[3]===0x47,"approved construction asset must remain PNG");

assert(stage2aJs.includes("AL_IHSAN_CONSTRUCTION_TICK"),"construction live tick runtime missing");
assert(stage2aJs.includes('hour:"2-digit"')&&stage2aJs.includes('minute:"2-digit"'),"construction clock must be HH:MM");
assert(!stage2aJs.includes('second:"2-digit"'),"construction clock must not show seconds");
assert(app.includes("AL_IHSAN_CONSTRUCTION_TICK"),"main render loop must feed construction Stage 2A");
assert(app.includes('construction:$("constructionScene")'),"construction scene reference missing");
assert(app.includes('"construction","prayer"'),"construction direct preview must remain available");

assert(config.includes('constructionCampaignTarget: 55550000'),"approved construction campaign target missing");
assert(config.includes('constructionAgenda: "Pembangunan Agenda"'),"construction agenda sheet config missing");
assert(config.includes('sequence: Object.freeze(["dashboard","announcement","finance","donation"])'),"construction must remain preview-only");
assert(config.includes('release: "construction-live-data-v1-20261017"'),"construction live-data release marker missing");

console.log("Construction Stage 2A regression: OK");

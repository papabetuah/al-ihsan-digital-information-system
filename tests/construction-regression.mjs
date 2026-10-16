import fs from "node:fs";
function assert(ok,msg){if(!ok)throw new Error(msg)}
const index=fs.readFileSync("index.html","utf8");
const app=fs.readFileSync("app-v107.js","utf8");
const config=fs.readFileSync("config-v64.js","utf8");
const css=fs.readFileSync("construction-background-only-v1.css","utf8");

const block=index.match(/<section id="constructionScene"[\s\S]*?<\/section>\s*<section id="prayerScene"/)?.[0]||"";
assert(index.includes('id="constructionScene"'),"constructionScene missing");
assert(index.includes("./construction-background-only-v1.css?v=construction-stage1-v1-20261016"),"construction Stage 1 CSS missing");
assert(block.includes("AGENDA PEMBANGUNAN MASJID"),"construction agenda shell missing");
assert(block.includes("MARI BERPARTISIPASI"),"construction donation shell missing");
assert(block.includes("Bank Nagari Syariah")&&block.includes("7100.0201.05008-5")&&block.includes("a.n. Masjid Al Ihsan Kapuih"),"official Bank Nagari donation account missing");
assert(block.includes('class="construction-mihrab-visual construction-mihrab-empty"'),"illustration must be removed and replaced by an empty visual slot");
assert(!block.includes("construction-mihrab-room")&&!block.includes("ILUSTRASI KONSEP MIHRAB"),"mihrab illustration content must be removed");
assert(!block.includes("PEMBANGUNAN MIHRAB MASJID")&&!block.includes("PLAFOND AREA MIHRAB"),"marked focus detail text must be removed");
assert(!block.includes("construction-qr-corners")&&!block.includes("<b>QRIS</b>"),"mock QRIS artwork/text must be removed");
assert(!block.includes("<i></i></div>"),"mock metric value marks must be removed");
assert(!block.includes("Rp145")&&!block.includes("144.760")&&!block.includes("69.344"),"Stage 1 must not bake live funding values");
assert(!block.includes("<script"),"Stage 1 construction scene must not contain live renderer");
assert(css.includes(".stage.scene-construction .construction-scene{display:block}"),"construction scene visibility rule missing");
assert(app.includes('construction:$("constructionScene")'),"construction scene reference missing");
assert(app.includes('"construction","prayer"'),"construction direct preview not allowed");
assert(config.includes('sequence: Object.freeze(["dashboard","announcement","finance","donation"])'),"construction must remain preview-only and must not enter general rotation");
console.log("Construction Stage 1 backlayer regression: OK");

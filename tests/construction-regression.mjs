import fs from "node:fs";
function assert(ok,msg){if(!ok)throw new Error(msg)}

const index=fs.readFileSync("index.html","utf8");
const app=fs.readFileSync("app-v107.js","utf8");
const config=fs.readFileSync("config-v64.js","utf8");
const css=fs.readFileSync("construction-background-only-v1.css","utf8");
const image=fs.readFileSync("assets/construction-background-approved-master.png");

const block=index.match(/<section id="constructionScene"[\s\S]*?<\/section>/)?.[0]||"";

assert(index.includes('id="constructionScene"'),"constructionScene missing");
assert(index.includes("construction-background-only-v1.css?v=approved-master-20261016"),"approved construction CSS cache marker missing");
assert(block.includes('class="construction-underlay"'),"approved construction image element missing");
assert(block.includes("assets/construction-background-approved-master.png?v=approved-master-20261016"),"approved construction image path missing");
assert(!block.includes("construction-metric")&&!block.includes("construction-focus-card"),"synthetic construction UI must not remain in Stage 1");
assert(css.includes(".construction-underlay"),"construction underlay CSS missing");
assert(!css.includes(".construction-metric-grid")&&!css.includes(".construction-focus-card"),"synthetic construction CSS must be removed");
assert(image.length>1000000,"approved construction image appears incomplete");
assert(image[0]===0x89&&image[1]===0x50&&image[2]===0x4e&&image[3]===0x47,"approved construction asset must be PNG");
assert(app.includes('construction:$("constructionScene")'),"construction scene reference missing");
assert(app.includes('"construction","prayer"'),"construction direct preview must remain available");
assert(config.includes('sequence: Object.freeze(["dashboard","announcement","finance","donation"])'),"construction must remain preview-only");
console.log("Construction approved image backlayer regression: OK");

import fs from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";

globalThis.window=globalThis;
vm.runInThisContext(fs.readFileSync(new URL("../pre-azan-playlist-v110.js",import.meta.url),"utf8"));

const PRE=globalThis.AL_IHSAN_PRE_AZAN;
assert.ok(PRE);
assert.equal(PRE.version,"pre-azan-v110");
assert.equal(PRE.interAudioGapSeconds,2);
assert.equal(PRE.silenceBeforeAzanSeconds,30);

const indexHtml=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const audioJs=fs.readFileSync(new URL("../pre-azan-audio-v121.js",import.meta.url),"utf8");
assert.ok(indexHtml.includes("pre-azan-playlist-v110.js?v=jumat-h45-dynamic-v110-20261023"));
assert.ok(indexHtml.includes("pre-azan-audio-v121.js?v=jumat-h45-dynamic-v121-20261023"));
assert.ok(indexHtml.indexOf("pre-azan-playlist-v110.js")<indexHtml.indexOf("pre-azan-audio-v121.js"));
assert.ok(indexHtml.indexOf("pre-azan-audio-v121.js")<indexHtml.indexOf("app-v107.js"));

assert.ok(audioJs.includes('version:"pre-azan-audio-v121"'));
assert.ok(audioJs.includes("async function playFridayPackage(state)"),"Friday package engine must exist");
assert.ok(audioJs.includes("audio.addEventListener(\"ended\""),"Friday package must advance on actual audio ended");
assert.ok(audioJs.includes("FRIDAY_DURATION_UNAVAILABLE"),"Friday package must inspect actual media duration");
assert.ok(audioJs.includes("loaded.durationMs+250>remaining"),"Friday package must not start a file that cannot finish");
assert.ok(audioJs.includes('setAudioStatus("gap","Jumat • 2 detik")'),"Friday package must keep 2-second gaps");
assert.ok(!audioJs.includes("drive.google.com"),"runtime audio must remain same-origin");

const monday=new Date("2026-10-12T12:00:00+07:00");
let sel=PRE.selectionFor(monday,"Subuh");
assert.equal(sel.tilawah.id,"SUBUH-01");
assert.equal(sel.messages[0].id,"09");
assert.equal(sel.intro.id,"17");

const azan=new Date("2026-10-12T04:50:00+07:00").getTime();
const normal=PRE.scheduleFor(new Date(azan),"Subuh",azan);
assert.equal(normal.startMs,azan-8*60000-6000);
assert.deepEqual(normal.segments.map(s=>s.kind),["gap","tilawah","gap","message","gap","intro","silence"]);
assert.equal(normal.segments.at(-1).startMs,azan-30000);

const jumatAzan=new Date("2026-10-23T12:04:00+07:00").getTime();
const jumat=PRE.scheduleFor(new Date(jumatAzan),"Jumat",jumatAzan);
assert.equal(jumat.packageName,"Jumat H-45 Dynamic");
assert.equal(jumat.startBeforeAzanSeconds,45*60);
assert.equal(jumat.startMs,jumatAzan-45*60000);
assert.deepEqual(jumat.segments.map(s=>s.kind),["friday-package","silence"]);
assert.equal(jumat.segments[0].endMs,jumatAzan-30000);
assert.equal(jumat.segments[1].startMs,jumatAzan-30000);
assert.equal(jumat.segments[1].endMs,jumatAzan);

const primary=PRE.fridayPackageFor();
assert.equal(primary.length,26);
assert.equal(primary.filter(x=>x.kind==="tilawah").length,18);
assert.equal(primary.filter(x=>x.kind==="message"||x.kind==="intro").length,8);
assert.deepEqual(primary.filter(x=>x.kind==="message"||x.kind==="intro").map(x=>x.item.id),["22","09","10","14","13","23","25","24"]);
assert.equal(PRE.fridayRepeatTilawahFor().length,18);
assert.equal(PRE.fridayFinisherFor().length,8);

const audioElementStub={
  id:"",preload:"",autoplay:false,loop:false,controls:false,playsInline:false,
  volume:1,muted:false,defaultMuted:false,paused:true,readyState:0,currentSrc:"",src:"",
  style:{},dataset:{},
  setAttribute(){},removeAttribute(){},addEventListener(){},removeEventListener(){},
  pause(){this.paused=true},load(){},
  play(){this.paused=false;return Promise.resolve()}
};
const runtimeContext={
  console,URL,URLSearchParams,setTimeout,clearTimeout,
  location:{search:""},
  CustomEvent:class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}},
  dispatchEvent(){return true},
  addEventListener(){},
  document:{
    readyState:"loading",hidden:false,baseURI:"https://example.test/",
    body:{appendChild(){}},documentElement:{appendChild(){},dataset:{}},
    createElement(tag){return tag==="audio"?audioElementStub:{style:{},appendChild(){},remove(){},setAttribute(){},addEventListener(){},querySelector(){return null}}},
    getElementById(){return null},
    addEventListener(){}
  }
};
runtimeContext.window=runtimeContext;
runtimeContext.globalThis=runtimeContext;
vm.runInNewContext(audioJs,runtimeContext,{filename:"pre-azan-audio-v121.js"});
assert.equal(runtimeContext.AL_IHSAN_PRE_AZAN_AUDIO.version,"pre-azan-audio-v121");
assert.equal(runtimeContext.AL_IHSAN_PRE_AZAN_AUDIO.autoplayPriming,true);
assert.equal(runtimeContext.AL_IHSAN_PRE_AZAN_AUDIO.gapSeconds,2);

const pagesYml=fs.readFileSync(new URL("../.github/workflows/pages.yml",import.meta.url),"utf8");
assert.ok(pagesYml.includes("Validate committed pre-azan audio bundle"));
assert.ok(fs.existsSync(new URL("../assets/pre-azan-audio/JUMAT-03.mp3",import.meta.url)));

console.log("Pre-azan rotation regression: OK");

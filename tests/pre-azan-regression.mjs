import fs from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";

globalThis.window=globalThis;
vm.runInThisContext(fs.readFileSync(new URL("../pre-azan-playlist-v108.js",import.meta.url),"utf8"));

const PRE=globalThis.AL_IHSAN_PRE_AZAN;
assert.ok(PRE);

const indexHtml=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const audioJs=fs.readFileSync(new URL("../pre-azan-audio-v119.js",import.meta.url),"utf8");
assert.ok(indexHtml.includes("pre-azan-audio-v119.js?v=autoprime-gap-v119-20261022"));
assert.ok(indexHtml.indexOf("pre-azan-playlist-v108.js")<indexHtml.indexOf("pre-azan-audio-v119.js"));
assert.ok(indexHtml.indexOf("pre-azan-audio-v119.js")<indexHtml.indexOf("app-v107.js"));
assert.ok(audioJs.includes('version:"pre-azan-audio-v119"'));
assert.ok(audioJs.includes("playViaWebAudio"),"Android TV fallback must include Web Audio engine");
assert.ok(audioJs.includes("function setAudioStatus(status,detail"),"audio status dispatcher must exist");
assert.ok(audioJs.includes('setAudioStatus("retry-fallback","web-audio")'),"HTML Audio failure must retry with Web Audio");
assert.ok(audioJs.includes('audio.autoplay=true'),"audio element must enable autoplay");
assert.ok(audioJs.includes("async function primeMedia"),"audio must prime the next local file during each gap");
assert.ok(audioJs.includes("async function primeIdleAutoplay"),"audio media session must be primed automatically at boot");
assert.ok(audioJs.includes("armAutoRetry"),"blocked autoplay must retry automatically without click");
assert.ok(!audioJs.includes("AKTIFKAN SUARA"),"production autoplay must not depend on a click-to-enable button");
assert.ok(!audioJs.includes("drive.google.com"),"runtime pre-azan audio must not depend on Google Drive");
assert.ok(audioJs.includes("waitForPlayable"),"pre-azan player must wait for Android media readiness");

assert.ok(!audioJs.includes("ttsDriveIds:TTS"),"runtime player must not reference removed Drive TTS map");
assert.ok(!audioJs.includes("tilawahDriveIds:TILAWAH"),"runtime player must not reference removed Drive tilawah map");

// Execute initialization in a minimal DOM stub so unresolved runtime globals cannot slip through string-only checks.
const audioElementStub={
  id:"",preload:"",autoplay:false,loop:false,controls:false,playsInline:false,
  volume:1,muted:false,defaultMuted:false,paused:true,readyState:0,currentSrc:"",src:"",
  style:{},dataset:{},
  setAttribute(){},removeAttribute(){},addEventListener(){},
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
    createElement(tag){return tag==="audio"?audioElementStub:{style:{},appendChild(){},remove(){},setAttribute(){},addEventListener(){}}},
    getElementById(){return null},
    addEventListener(){}
  }
};
runtimeContext.window=runtimeContext;
runtimeContext.globalThis=runtimeContext;
vm.runInNewContext(audioJs,runtimeContext,{filename:"pre-azan-audio-v119.js"});
assert.equal(runtimeContext.AL_IHSAN_PRE_AZAN_AUDIO.version,"pre-azan-audio-v119");
assert.equal(runtimeContext.AL_IHSAN_PRE_AZAN_AUDIO.autoplayPriming,true);
assert.equal(runtimeContext.AL_IHSAN_PRE_AZAN_AUDIO.gapSeconds,2);

assert.ok(!audioJs.includes("URL.createObjectURL"),"pre-azan player must not use Blob URLs on Android TV");
assert.ok(audioJs.includes('"./assets/pre-azan-audio/"')&&audioJs.includes("preazan-autoprime-v119-20261022"),"pre-azan must use same-origin local MP3 with v119 cache-buster");
assert.ok(audioJs.includes('htmlName==="NotAllowedError"')&&audioJs.includes('webName==="NotAllowedError"')&&audioJs.includes('setAudioStatus("autoplay-retry"'),"autoplay failure must self-retry without click");
assert.ok(audioJs.includes('"dzuhur":"Dzuhur"')&&audioJs.includes('"ashar":"Ashar"')&&audioJs.includes('"maghrib":"Maghrib"')&&audioJs.includes('"isya":"Isya"'));
assert.ok(audioJs.includes('addEventListener("al-ihsan:pre-azan-change"'));
assert.ok(audioJs.includes('state.kind==="silence"'));
assert.ok(audioJs.includes('state.kind==="gap"'));
const pagesYml=fs.readFileSync(new URL("../.github/workflows/pages.yml",import.meta.url),"utf8");
assert.ok(pagesYml.includes("Validate committed pre-azan audio bundle"),"Pages deploy must validate committed local pre-azan MP3 assets");
assert.ok(fs.existsSync(new URL("../assets/pre-azan-audio/ISYA-03.mp3",import.meta.url))&&fs.statSync(new URL("../assets/pre-azan-audio/ISYA-03.mp3",import.meta.url)).size>2048,"Committed audio bundle must include a valid ISYA-03 MP3");


const monday=new Date("2026-10-12T12:00:00+07:00");
const fri1=new Date("2026-10-02T12:00:00+07:00");
const fri3=new Date("2026-10-16T12:00:00+07:00");

let sel=PRE.selectionFor(monday,"Subuh");
assert.equal(sel.tilawah.id,"SUBUH-01");
assert.equal(sel.messages[0].id,"09");
assert.equal(sel.intro.id,"17");

sel=PRE.selectionFor(fri1,"Jumat");
assert.equal(sel.cycle,1);
assert.equal(sel.tilawah.id,"JUMAT-01");
assert.deepEqual(sel.messages.map(x=>x.id),["22","23"]);
assert.equal(sel.intro.id,"24");

sel=PRE.selectionFor(fri3,"Jumat");
assert.equal(sel.cycle,3);
assert.equal(sel.tilawah.id,"JUMAT-03");
assert.deepEqual(sel.messages.map(x=>x.id),["23","25"]);

const azan=new Date("2026-10-12T04:50:00+07:00").getTime();
const schedule=PRE.scheduleFor(new Date(azan),"Subuh",azan);
assert.equal(PRE.interAudioGapSeconds,2);
assert.equal(schedule.leadAdvanceSeconds,6);
assert.equal(schedule.startMs,azan-8*60000-6000);
assert.deepEqual(schedule.segments.map(s=>s.kind),["gap","tilawah","gap","message","gap","intro","silence"]);
assert.equal(schedule.segments[0].endMs-schedule.segments[0].startMs,2000);
assert.equal(schedule.segments[0].item.id,"SUBUH-01");
assert.equal(schedule.segments[2].item.id,"09");
assert.equal(schedule.segments[4].item.id,"17");
assert.equal(schedule.segments.at(-1).kind,"silence");
assert.equal(schedule.segments.at(-1).startMs,azan-30000);
assert.equal(schedule.segments.at(-1).endMs,azan);

const firstGap=PRE.stateAt(new Date(azan-8*60000-5000),"Subuh",azan);
assert.equal(firstGap.kind,"gap");
assert.equal(firstGap.item.id,"SUBUH-01");

const state=PRE.stateAt(new Date(azan-90000),"Subuh",azan);
assert.equal(state.kind,"intro");
assert.equal(state.item.id,"17");

const silent=PRE.stateAt(new Date(azan-15000),"Subuh",azan);
assert.equal(silent.kind,"silence");
assert.equal(silent.item,null);

const jumatAzan=new Date("2026-10-16T12:15:00+07:00").getTime();
const jumatSchedule=PRE.scheduleFor(new Date(jumatAzan),"Jumat",jumatAzan);
assert.equal(jumatSchedule.leadAdvanceSeconds,8);
assert.equal(jumatSchedule.startMs,jumatAzan-15*60000-8000);
assert.deepEqual(jumatSchedule.segments.map(s=>s.kind),["gap","tilawah","gap","message","gap","message","gap","intro","silence"]);

console.log("Pre-azan rotation regression: OK");

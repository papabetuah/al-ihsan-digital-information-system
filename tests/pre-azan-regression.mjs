import fs from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";

globalThis.window=globalThis;
vm.runInThisContext(fs.readFileSync(new URL("../pre-azan-playlist-v111.js",import.meta.url),"utf8"));

const PRE=globalThis.AL_IHSAN_PRE_AZAN;
assert.ok(PRE);
assert.equal(PRE.version,"pre-azan-v111");
assert.equal(PRE.interAudioGapSeconds,2);
assert.equal(PRE.silenceBeforeAzanSeconds,30);

const indexHtml=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const audioJs=fs.readFileSync(new URL("../pre-azan-audio-v123.js",import.meta.url),"utf8");
assert.ok(indexHtml.includes("pre-azan-playlist-v111.js?v=h45-subuh-maghrib-v111-20261023"));
assert.ok(indexHtml.includes("pre-azan-audio-v123.js?v=h45-subuh-maghrib-v123-20261023"));
assert.ok(indexHtml.indexOf("pre-azan-playlist-v111.js")<indexHtml.indexOf("pre-azan-audio-v123.js"));
assert.ok(indexHtml.indexOf("pre-azan-audio-v123.js")<indexHtml.indexOf("app-v107.js"));

assert.ok(audioJs.includes('version:"pre-azan-audio-v123"'));
assert.ok(audioJs.includes("async function playFridayPackage(state)"));
assert.ok(audioJs.includes("async function playExtendedPackage(state)"));
assert.ok(audioJs.includes("audio.addEventListener(\"ended\""),"dynamic packages must advance on actual audio end");
assert.ok(audioJs.includes("EXTENDED_DURATION_UNAVAILABLE"),"Subuh/Maghrib must inspect actual MP3 duration");
assert.ok(audioJs.includes('setAudioStatus("gap",prayerName+" • 2 detik")'),"Subuh/Maghrib gaps must be 2 seconds");
assert.ok(audioJs.includes('kind:TEST_PRAYER==="Jumat"?"friday-package":"extended-package"'),"full test mode must cover Subuh and Maghrib");
assert.ok(!audioJs.includes("drive.google.com"));

function assertH45(prayer,iso){
  const azan=new Date(iso).getTime();
  const s=PRE.scheduleFor(new Date(azan),prayer,azan);
  assert.equal(s.packageName,prayer+" H-45 Dynamic");
  assert.equal(s.startBeforeAzanSeconds,45*60);
  assert.equal(s.startMs,azan-45*60000);
  assert.deepEqual(s.segments.map(x=>x.kind),["extended-package","silence"]);
  assert.equal(s.segments[0].endMs,azan-30000);
  assert.equal(s.segments[1].startMs,azan-30000);
  assert.equal(s.segments[1].endMs,azan);
  return s;
}

const subuh=assertH45("Subuh","2026-10-24T04:43:00+07:00");
const maghrib=assertH45("Maghrib","2026-10-23T18:08:00+07:00");
assert.ok(subuh.packageMediaCount>=15);
assert.ok(maghrib.packageMediaCount>=15);

const subuhPrimary=PRE.extendedPackageFor("Subuh");
assert.equal(subuhPrimary.filter(x=>x.kind==="tilawah").length,8);
assert.equal(subuhPrimary.filter(x=>x.kind==="message").length,7);
assert.deepEqual(subuhPrimary.filter(x=>x.kind==="message").map(x=>x.item.id),["09","10","11","12","06","07","16"]);
assert.equal(PRE.extendedFinisherFor("Subuh")[0].id,"17");
assert.equal(PRE.extendedRepeatTilawahFor("Subuh").length,10);

const maghribPrimary=PRE.extendedPackageFor("Maghrib");
assert.equal(maghribPrimary.filter(x=>x.kind==="tilawah").length,8);
assert.equal(maghribPrimary.filter(x=>x.kind==="message").length,7);
assert.deepEqual(maghribPrimary.filter(x=>x.kind==="message").map(x=>x.item.id),["12","14","06","16","11","07","05"]);
assert.equal(PRE.extendedFinisherFor("Maghrib")[0].id,"20");
assert.equal(PRE.extendedRepeatTilawahFor("Maghrib").length,10);

// Dzuhur/Ashar/Isya retain the established ordinary schedule.
const normalAzan=new Date("2026-10-24T12:04:00+07:00").getTime();
const normal=PRE.scheduleFor(new Date(normalAzan),"Dzuhur",normalAzan);
assert.equal(normal.startMs,normalAzan-8*60000-6000);
assert.deepEqual(normal.segments.map(s=>s.kind),["gap","tilawah","gap","message","gap","intro","silence"]);

// Friday H-45 remains unchanged.
const jAzan=new Date("2026-10-23T12:04:00+07:00").getTime();
const friday=PRE.scheduleFor(new Date(jAzan),"Jumat",jAzan);
assert.equal(friday.packageName,"Jumat H-45 Dynamic");
assert.equal(friday.startMs,jAzan-45*60000);
assert.deepEqual(friday.segments.map(s=>s.kind),["friday-package","silence"]);

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
vm.runInNewContext(audioJs,runtimeContext,{filename:"pre-azan-audio-v123.js"});
assert.equal(runtimeContext.AL_IHSAN_PRE_AZAN_AUDIO.version,"pre-azan-audio-v123");
assert.equal(runtimeContext.AL_IHSAN_PRE_AZAN_AUDIO.autoplayPriming,true);
assert.equal(runtimeContext.AL_IHSAN_PRE_AZAN_AUDIO.gapSeconds,2);

const pagesYml=fs.readFileSync(new URL("../.github/workflows/pages.yml",import.meta.url),"utf8");
assert.ok(pagesYml.includes("Validate committed pre-azan audio bundle"));
for(const f of ["SUBUH-01.mp3","SUBUH-02.mp3","SUBUH-03.mp3","MAGRIB-01.mp3","MAGRIB-02.mp3","MAGRIB-03.mp3"]){
  assert.ok(fs.existsSync(new URL("../assets/pre-azan-audio/"+f,import.meta.url)),f+" must exist");
}

console.log("Pre-azan rotation regression: OK");

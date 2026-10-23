import fs from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";

globalThis.window=globalThis;
vm.runInThisContext(fs.readFileSync(new URL("../pre-azan-playlist-v113.js",import.meta.url),"utf8"));
const PRE=globalThis.AL_IHSAN_PRE_AZAN;

assert.ok(PRE);
assert.equal(PRE.version,"pre-azan-v113");
assert.equal(PRE.interAudioGapSeconds,2);
assert.equal(PRE.silenceBeforeAzanSeconds,30);

const indexHtml=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const audioJs=fs.readFileSync(new URL("../pre-azan-audio-v127.js",import.meta.url),"utf8");
const appJs=fs.readFileSync(new URL("../app-v107.js",import.meta.url),"utf8");
assert.ok(indexHtml.includes("pre-azan-playlist-v113.js?v=dzuhur-ashar-h15-v113-20261023"));
assert.ok(indexHtml.includes("pre-azan-audio-v127.js?v=dzuhur-ashar-h15-v127-20261023"));
assert.ok(indexHtml.indexOf("pre-azan-playlist-v113.js")<indexHtml.indexOf("pre-azan-audio-v127.js"));
assert.ok(indexHtml.indexOf("pre-azan-audio-v127.js")<indexHtml.indexOf("app-v107.js"));

assert.ok(audioJs.includes('version:"pre-azan-audio-v127"'));
assert.ok(audioJs.includes("async function playFridayPackage(state)"));
assert.ok(audioJs.includes("async function playExtendedPackage(state)"));
assert.ok(audioJs.includes("async function playExtendedTail"));
assert.ok(audioJs.includes('["Jumat","Subuh","Maghrib","Dzuhur","Ashar"].includes(TEST_PRAYER)'));
assert.ok(audioJs.includes('button.textContent="MULAI AUDIO"'));
assert.ok(audioJs.includes('setAudioStatus("gap",prayerName+" • 2 detik")'));
assert.ok(!audioJs.includes("drive.google.com"));
assert.ok(appJs.includes('[isFriday?"Jumat":"Dzuhur",times.dzuhur.ts]'),"Friday must still route Dzuhur time to Jumat");

const fridayFn=audioJs.slice(audioJs.indexOf("async function playFridayPackage(state)"),audioJs.indexOf("async function loadExtendedItem"));
assert.ok(!fridayFn.includes("tailReserveMs"));
assert.ok(!fridayFn.includes('prayerName+" • penutup"'));
const extFn=audioJs.slice(audioJs.indexOf("async function playExtendedPackage(state)"),audioJs.indexOf("function playState(state)"));
assert.ok(extFn.includes("tailReserveMs"));
assert.ok(extFn.includes("playExtendedTail"));

function assertDynamic(prayer,iso,leadMinutes){
  const azan=new Date(iso).getTime();
  const s=PRE.scheduleFor(new Date(azan),prayer,azan);
  assert.equal(s.packageName,prayer+" H-"+leadMinutes+" Dynamic");
  assert.equal(s.startBeforeAzanSeconds,leadMinutes*60);
  assert.equal(s.startMs,azan-leadMinutes*60000);
  assert.deepEqual(s.segments.map(x=>x.kind),["extended-package","silence"]);
  assert.equal(s.segments[0].endMs,azan-30000);
  assert.equal(s.segments[1].startMs,azan-30000);
  assert.equal(s.segments[1].endMs,azan);
  return s;
}

assertDynamic("Subuh","2026-10-24T04:43:00+07:00",45);
assertDynamic("Maghrib","2026-10-24T18:08:00+07:00",45);
assertDynamic("Dzuhur","2026-10-24T12:04:00+07:00",15);
assertDynamic("Ashar","2026-10-24T15:21:00+07:00",15);

assert.deepEqual(PRE.extendedTailFor("Subuh").map(x=>[x.kind,x.item.id]),[["tarhim","SUBUH-TARHIM"],["intro","17"]]);
assert.equal(PRE.extendedTailReserveMs("Subuh"),435000);
assert.deepEqual(PRE.extendedTailFor("Dzuhur").map(x=>x.item.id),["18"]);
assert.deepEqual(PRE.extendedTailFor("Ashar").map(x=>x.item.id),["19"]);
assert.equal(PRE.extendedTailReserveMs("Dzuhur"),60000);
assert.equal(PRE.extendedTailReserveMs("Ashar"),60000);

assert.deepEqual(PRE.extendedPackageFor("Dzuhur").filter(x=>x.kind==="message").map(x=>x.item.id),["09","13","15","08"]);
assert.deepEqual(PRE.extendedPackageFor("Ashar").filter(x=>x.kind==="message").map(x=>x.item.id),["10","14","16","07"]);

const jAzan=new Date("2026-10-23T12:04:00+07:00").getTime();
const friday=PRE.scheduleFor(new Date(jAzan),"Jumat",jAzan);
assert.equal(friday.packageName,"Jumat H-45 Dynamic");
assert.equal(friday.startMs,jAzan-45*60000);

const isyaAzan=new Date("2026-10-24T19:19:00+07:00").getTime();
const isya=PRE.scheduleFor(new Date(isyaAzan),"Isya",isyaAzan);
assert.equal(isya.startMs,isyaAzan-8*60000-6000);
assert.deepEqual(isya.segments.map(s=>s.kind),["gap","tilawah","gap","message","gap","intro","silence"]);

const audioElementStub={
  id:"",preload:"",autoplay:false,loop:false,controls:false,playsInline:false,
  volume:1,muted:false,defaultMuted:false,paused:true,readyState:0,currentSrc:"",src:"",
  style:{},dataset:{},setAttribute(){},removeAttribute(){},addEventListener(){},removeEventListener(){},
  pause(){this.paused=true},load(){},play(){this.paused=false;return Promise.resolve()}
};
const runtimeContext={
  console,URL,URLSearchParams,setTimeout,clearTimeout,location:{search:""},
  CustomEvent:class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}},
  dispatchEvent(){return true},addEventListener(){},
  document:{readyState:"loading",hidden:false,baseURI:"https://example.test/",
    body:{appendChild(){}},documentElement:{appendChild(){},dataset:{}},
    createElement(tag){return tag==="audio"?audioElementStub:{style:{},appendChild(){},remove(){},setAttribute(){},addEventListener(){},querySelector(){return null}}},
    getElementById(){return null},addEventListener(){}}
};
runtimeContext.window=runtimeContext;
runtimeContext.globalThis=runtimeContext;
vm.runInNewContext(audioJs,runtimeContext,{filename:"pre-azan-audio-v127.js"});
assert.equal(runtimeContext.AL_IHSAN_PRE_AZAN_AUDIO.version,"pre-azan-audio-v127");
assert.equal(runtimeContext.AL_IHSAN_PRE_AZAN_AUDIO.gapSeconds,2);

const pagesYml=fs.readFileSync(new URL("../.github/workflows/pages.yml",import.meta.url),"utf8");
assert.ok(pagesYml.includes("Fetch Subuh Tarhim runtime asset"));
for(const prayer of ["Subuh","Maghrib","Dzuhur","Ashar"]){
  const ids=[
    ...PRE.extendedPackageFor(prayer).map(x=>x.item.id),
    ...PRE.extendedRepeatTilawahFor(prayer).map(x=>x.id),
    ...PRE.extendedFinisherFor(prayer).map(x=>x.id),
    ...PRE.extendedTailFor(prayer).map(x=>x.item.id)
  ];
  for(const id of new Set(ids)){
    if(id==="SUBUH-TARHIM"){assert.ok(pagesYml.includes("SUBUH-TARHIM.mp3"));continue}
    const path=new URL("../assets/pre-azan-audio/"+id+".mp3",import.meta.url);
    assert.ok(fs.existsSync(path),prayer+" missing "+id+".mp3");
    assert.ok(fs.statSync(path).size>2048,prayer+" invalid "+id+".mp3");
  }
}
console.log("Pre-azan rotation regression: OK");

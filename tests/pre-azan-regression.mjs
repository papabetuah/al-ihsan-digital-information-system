import fs from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";

globalThis.window=globalThis;
vm.runInThisContext(fs.readFileSync(new URL("../calendar-engine-v106.js",import.meta.url),"utf8"));
vm.runInThisContext(fs.readFileSync(new URL("../pre-azan-playlist-v117.js",import.meta.url),"utf8"));
const PRE=globalThis.AL_IHSAN_PRE_AZAN;

assert.ok(PRE);
assert.equal(PRE.version,"pre-azan-v117");
assert.equal(PRE.rollingVariantCount,4);
assert.equal(PRE.interAudioGapSeconds,2);
assert.equal(PRE.silenceBeforeAzanSeconds,30);
assert.equal(PRE.ramadanMaghribSirenSeconds,17);
assert.deepEqual(Object.fromEntries(Object.entries(PRE.policy).map(([k,v])=>[k,v.leadMinutes])),{Subuh:45,Dzuhur:15,Ashar:15,Maghrib:45,Isya:10,Jumat:45});

const indexHtml=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const audioJs=fs.readFileSync(new URL("../pre-azan-audio-v130.js",import.meta.url),"utf8");
const appJs=fs.readFileSync(new URL("../app-v107.js",import.meta.url),"utf8");
assert.ok(indexHtml.includes("pre-azan-playlist-v117.js?v=rolling-policy-v117-prod-20261024"));
assert.ok(indexHtml.includes("pre-azan-audio-v130.js?v=rolling-policy-v130-prod-20261024"));
assert.ok(indexHtml.indexOf("pre-azan-playlist-v117.js")<indexHtml.indexOf("pre-azan-audio-v130.js"));
assert.ok(indexHtml.indexOf("pre-azan-audio-v130.js")<indexHtml.indexOf("app-v107.js"));
assert.ok(audioJs.includes('version:"pre-azan-audio-v130"'));
assert.ok(audioJs.includes("playlistDateForState"));
assert.ok(audioJs.includes('params.get("ramadanTest")==="1"'));
assert.ok(audioJs.includes('primeMedia(state.item.id,"silence-primed")'));
assert.ok(audioJs.includes('state.kind==="ramadan-siren"'));
assert.ok(audioJs.includes('button.textContent="MULAI AUDIO"'));
assert.ok(!audioJs.includes("drive.google.com"));
assert.ok(appJs.includes('[isFriday?"Jumat":"Dzuhur",times.dzuhur.ts]'));

const dates=["2026-10-24T12:00:00+07:00","2026-10-25T12:00:00+07:00","2026-10-26T12:00:00+07:00","2026-10-27T12:00:00+07:00"].map(x=>new Date(x));
for(const prayer of ["Subuh","Dzuhur","Ashar","Maghrib","Isya"]){
  assert.equal(new Set(dates.map(d=>PRE.variantFor(d,prayer))).size,4,prayer+" must rotate through 4 variants");
  for(const d of dates){
    const plan=PRE.planFor(d,prayer);
    assert.ok(plan&&plan.primary.length>0,prayer+" plan missing");
    assert.equal(plan.variant,PRE.variantFor(d,prayer));
  }
}

const fridayDates=["2026-10-02","2026-10-09","2026-10-16","2026-10-23"].map(x=>new Date(x+"T12:00:00+07:00"));
assert.equal(new Set(fridayDates.map(d=>PRE.variantFor(d,"Jumat"))).size,4);
for(const d of fridayDates)assert.ok(PRE.planFor(d,"Jumat").primary.length>=10);

for(const d of dates){
  const plan=PRE.planFor(d,"Isya");
  assert.equal(plan.primary.every(x=>x.kind==="message"),true,"Isya must remain spoken-only");
  assert.equal(plan.repeatTilawah.length,0);
}

function assertDynamic(prayer,iso,leadMinutes){
  const azan=new Date(iso).getTime();
  const s=PRE.scheduleFor(new Date(azan),prayer,azan);
  assert.equal(s.startBeforeAzanSeconds,leadMinutes*60);
  assert.equal(s.startMs,azan-leadMinutes*60000);
  assert.deepEqual(s.segments.map(x=>x.kind),["extended-package","silence"]);
  assert.equal(s.segments[0].endMs,azan-30000);
  assert.equal(s.segments[1].startMs,azan-30000);
  assert.equal(s.segments[1].endMs,azan);
}
assertDynamic("Subuh","2026-10-24T04:43:00+07:00",45);
assertDynamic("Maghrib","2026-10-24T18:08:00+07:00",45);
assertDynamic("Dzuhur","2026-10-24T12:04:00+07:00",15);
assertDynamic("Ashar","2026-10-24T15:21:00+07:00",15);
assertDynamic("Isya","2026-10-24T19:19:00+07:00",10);

assert.deepEqual(PRE.extendedTailFor("Subuh").map(x=>x.item.id),["SUBUH-TARHIM","17"]);
assert.deepEqual(PRE.extendedTailFor("Dzuhur").map(x=>x.item.id),["18"]);
assert.deepEqual(PRE.extendedTailFor("Ashar").map(x=>x.item.id),["19"]);
assert.deepEqual(PRE.extendedTailFor("Maghrib").map(x=>x.item.id),["20"]);
assert.deepEqual(PRE.extendedTailFor("Isya").map(x=>x.item.id),["21"]);

const ramadanDate=new Date("2027-02-08T18:20:00+07:00");
assert.equal(PRE.isRamadan(ramadanDate),true);
const ramadanPlan=PRE.planFor(ramadanDate,"Maghrib");
assert.equal(ramadanPlan.ramadan,true);
assert.ok(ramadanPlan.id.includes("RAMADAN"));
assert.ok(ramadanPlan.primary.some(x=>String(x.item.id).includes("RAMADAN")));
const ramadanAzan=ramadanDate.getTime();
const rs=PRE.scheduleFor(ramadanDate,"Maghrib",ramadanAzan);
assert.equal(rs.ramadanMaghrib,true);
assert.deepEqual(rs.segments.map(x=>x.kind),["extended-package","silence","ramadan-siren"]);
assert.equal(rs.segments[1].item.id,"RAMADAN-MAGRIB-SIREN");
assert.equal(rs.endMs,ramadanAzan+17000);
assert.equal(PRE.stateAt(ramadanAzan+1000,"Maghrib",ramadanAzan).kind,"ramadan-siren");

const ramadanSubuh=PRE.planFor(new Date("2027-02-09T04:40:00+07:00"),"Subuh");
assert.equal(ramadanSubuh.ramadan,true);
assert.ok(ramadanSubuh.primary.some(x=>String(x.item.id).includes("RAMADAN")));

const nonRamadanAzan=new Date("2026-10-24T18:08:00+07:00").getTime();
const nr=PRE.scheduleFor(new Date(nonRamadanAzan),"Maghrib",nonRamadanAzan);
assert.equal(nr.ramadanMaghrib,false);
assert.deepEqual(nr.segments.map(x=>x.kind),["extended-package","silence"]);

const referenced=new Set();
for(const prayer of ["Subuh","Dzuhur","Ashar","Maghrib","Isya"]){
  for(const d of dates)PRE.requiredAssetIdsFor(d,prayer).forEach(x=>referenced.add(x));
}
PRE.requiredAssetIdsFor(ramadanDate,"Maghrib").forEach(x=>referenced.add(x));
PRE.requiredAssetIdsFor(new Date("2027-02-09T04:40:00+07:00"),"Subuh").forEach(x=>referenced.add(x));
for(const d of fridayDates)PRE.requiredAssetIdsFor(d,"Jumat").forEach(x=>referenced.add(x));
for(const id of referenced){
  if(/^\d+$/.test(id))assert.ok(Number(id)<=25,"Unrendered spoken asset referenced: "+id);
}

const pagesYml=fs.readFileSync(new URL("../.github/workflows/pages.yml",import.meta.url),"utf8");
for(const id of referenced){
  if(id==="SUBUH-TARHIM")continue;
  const file=new URL("../assets/pre-azan-audio/"+id+".mp3",import.meta.url);
  assert.ok(fs.existsSync(file),"Missing referenced asset "+id);
  assert.ok(fs.statSync(file).size>2048,"Invalid referenced asset "+id);
}

const audioElementStub={id:"",preload:"",autoplay:false,loop:false,controls:false,playsInline:false,volume:1,muted:false,defaultMuted:false,paused:true,readyState:0,currentSrc:"",src:"",style:{},dataset:{},setAttribute(){},removeAttribute(){},addEventListener(){},removeEventListener(){},pause(){this.paused=true},load(){},play(){this.paused=false;return Promise.resolve()}};
const runtimeContext={console,URL,URLSearchParams,setTimeout,clearTimeout,location:{search:""},CustomEvent:class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}},dispatchEvent(){return true},addEventListener(){},document:{readyState:"loading",hidden:false,baseURI:"https://example.test/",body:{appendChild(){}},documentElement:{appendChild(){},dataset:{}},createElement(tag){return tag==="audio"?audioElementStub:{style:{},appendChild(){},remove(){},setAttribute(){},addEventListener(){},querySelector(){return null}}},getElementById(){return null},addEventListener(){}}};
runtimeContext.window=runtimeContext;runtimeContext.globalThis=runtimeContext;
vm.runInNewContext(audioJs,runtimeContext,{filename:"pre-azan-audio-v130.js"});
assert.equal(runtimeContext.AL_IHSAN_PRE_AZAN_AUDIO.version,"pre-azan-audio-v130");
assert.equal(runtimeContext.AL_IHSAN_PRE_AZAN_AUDIO.gapSeconds,2);

console.log("Candidate rolling pre-azan policy regression: OK");

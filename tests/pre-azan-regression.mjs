import fs from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";

globalThis.window=globalThis;
vm.runInThisContext(fs.readFileSync(new URL("../pre-azan-playlist-v107.js",import.meta.url),"utf8"));

const PRE=globalThis.AL_IHSAN_PRE_AZAN;
assert.ok(PRE);

const indexHtml=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const audioJs=fs.readFileSync(new URL("../pre-azan-audio-v112.js",import.meta.url),"utf8");
assert.ok(indexHtml.includes("pre-azan-audio-v112.js?v=drive-fallback-fix-v112-20261021"));
assert.ok(indexHtml.indexOf("pre-azan-playlist-v107.js")<indexHtml.indexOf("pre-azan-audio-v112.js"));
assert.ok(indexHtml.indexOf("pre-azan-audio-v112.js")<indexHtml.indexOf("app-v107.js"));
assert.ok(audioJs.includes('version:"pre-azan-audio-v112"'));
assert.ok(audioJs.includes("DRIVE_BASE_PRIMARY")&&audioJs.includes("DRIVE_BASE_FALLBACK"));
assert.ok(audioJs.includes("sourcesForState")&&audioJs.includes("retry-fallback"));
assert.ok(audioJs.includes('name==="NotAllowedError"')&&audioJs.includes('setAudioStatus("media-error"'));
assert.ok(audioJs.includes('"dzuhur":"Dzuhur"')&&audioJs.includes('"ashar":"Ashar"')&&audioJs.includes('"maghrib":"Maghrib"')&&audioJs.includes('"isya":"Isya"'));
assert.ok(audioJs.includes('addEventListener("al-ihsan:pre-azan-change"'));
assert.ok(audioJs.includes('state.kind==="silence"'));
assert.ok(audioJs.includes("ensureAudioBlockedNotice"));


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
assert.equal(schedule.startMs,azan-8*60000);
assert.equal(schedule.segments.at(-1).kind,"silence");
assert.equal(schedule.segments.at(-1).startMs,azan-30000);
assert.equal(schedule.segments.at(-1).endMs,azan);

const state=PRE.stateAt(new Date(azan-90000),"Subuh",azan);
assert.equal(state.kind,"intro");
assert.equal(state.item.id,"17");

const silent=PRE.stateAt(new Date(azan-15000),"Subuh",azan);
assert.equal(silent.kind,"silence");
assert.equal(silent.item,null);

console.log("Pre-azan rotation regression: OK");

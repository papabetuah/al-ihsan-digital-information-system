#!/usr/bin/env node
const fs=require("fs");
const vm=require("vm");

global.window=globalThis;
for(const file of ["config-v64.js","prayer-times.js","pre-azan-playlist-v107.js"]){
  vm.runInThisContext(fs.readFileSync(file,"utf8"),{filename:file});
}

const TOKEN=(process.env.YODECK_API_TOKEN||"").trim();
if(!TOKEN) throw new Error("YODECK_API_TOKEN is missing");

const BASE="https://app.yodeck.com/api/v2";
const WORKSPACE_ID=257599;
const WORKSPACE_NAME="Surau Kapuih";
const SCREEN_ID=811845;
const SCHEDULE_NAME="JADWAL PRA-AZAN OTOMATIS";
const DASHBOARD_NAME="Dashboard Masjid Al Ihsan Kapuih";
const HORIZON_DAYS=14;

const DURATIONS=Object.freeze({
  "05":17.554,"06":17.267,"07":18.390,"08":20.088,"09":21.969,"10":19.540,
  "11":26.593,"12":23.066,"13":26.776,"14":25.104,"15":19.122,"16":20.663,
  "17":20.924,"18":20.976,"19":18.887,"20":21.812,"21":25.626,
  "22":24.320,"23":19.775,"24":20.793,"25":22.335,
  "SUBUH-01":48.6,"SUBUH-02":70.0,"SUBUH-03":31.8,
  "ZUHUR-01":38.0,"ZUHUR-02":24.2,"ZUHUR-03":108.7,
  "ASAR-01":27.5,"ASAR-02":44.6,"ASAR-03":109.0,
  "MAGRIB-01":57.6,"MAGRIB-02":57.5,"MAGRIB-03":99.2,
  "ISYA-01":62.9,"ISYA-02":54.5,"ISYA-03":76.3,
  "JUMAT-01":96.8,"JUMAT-02":64.7,"JUMAT-03":152.5
});

const TILAWAH_FILES=AL_IHSAN_PRE_AZAN.tilawahFiles;
const MATERIAL_FILES=Object.freeze({
  "05":"05 - Menjaga Ketenangan Masjid.mp3",
  "06":"06 - Ajak Keluarga ke Masjid.mp3",
  "07":"07 - Memakmurkan Masjid.mp3",
  "08":"08 - Sedekah untuk Masjid.mp3",
  "09":"09 - Hadis Keutamaan Salat Berjamaah.mp3",
  "10":"10 - Hadis Keutamaan Pergi ke Masjid.mp3",
  "11":"11 - Hadis Malaikat Mendoakan Jamaah.mp3",
  "12":"12 - Hadis Keutamaan Membaca Al Quran.mp3",
  "13":"13 - Hadis Sedekah Jariah.mp3",
  "14":"14 - Hadis Persaudaraan Muslim.mp3",
  "15":"15 - Hadis Berbuat Baik kepada Tetangga.mp3",
  "16":"16 - Hadis Menjaga Lisan.mp3",
  "17":"17 - Pengantar Pra Azan Subuh.mp3",
  "18":"18 - Pengantar Pra Azan Zuhur.mp3",
  "19":"19 - Pengantar Pra Azan Asar.mp3",
  "20":"20 - Pengantar Pra Azan Magrib.mp3",
  "21":"21 - Pengantar Pra Azan Isya.mp3",
  "22":"22 - Pengantar Hari Jumat.mp3",
  "23":"23 - Datang Lebih Awal untuk Salat Jumat.mp3",
  "24":"24 - Adab Mendengarkan Khutbah Jumat.mp3",
  "25":"25 - Infak Jumat Masjid Al Ihsan.mp3"
});

function headers(){return{
  "Authorization":`Token alihsan:${TOKEN}`,
  "Accept":"application/json",
  "Content-Type":"application/json"
}}

async function api(method,path,body){
  const res=await fetch(BASE+path,{method,headers:headers(),body:body===undefined?undefined:JSON.stringify(body)});
  const text=await res.text();
  let data={};
  try{data=text?JSON.parse(text):{}}catch{data={raw:text}}
  if(!res.ok) throw new Error(`${method} ${path} -> HTTP ${res.status}: ${text.slice(0,1200)}`);
  return data;
}

function addDays(ymd,days){
  const d=new Date(Date.UTC(ymd.year,ymd.month-1,ymd.day+days,12));
  return{year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate()};
}
function localIso(ts){
  return new Date(ts+7*3600000).toISOString().slice(0,19);
}
function eventFor(media,startMs,endMs,priority=1){
  return{
    start:localIso(startMs),
    end:localIso(endMs),
    duration:Math.max(1,Math.ceil((endMs-startMs)/1000)),
    priority,
    recurrence:null,
    source:{source_id:media.id,source_type:"media"}
  };
}
function itemId(item){
  return String(item?.id||"");
}
function fileNameFor(item,kind){
  const id=itemId(item);
  return kind==="tilawah"?TILAWAH_FILES[id]:MATERIAL_FILES[id];
}
function durationFor(item){return DURATIONS[itemId(item)]}

function buildPrayerEvents(date,prayerName,azanMs,mediaByName){
  const sel=AL_IHSAN_PRE_AZAN.selectionFor(date,prayerName);
  if(!sel) return [];
  const friday=sel.prayerName==="Jumat";
  const specs=friday?[
    ["tilawah",sel.tilawah,azanMs-10*60000],
    ["message",sel.messages[0],azanMs-6*60000],
    ["message",sel.messages[1],azanMs-3*60000],
    ["intro",sel.intro,azanMs-30000]
  ]:[
    ["tilawah",sel.tilawah,azanMs-5*60000],
    ["message",sel.messages[0],azanMs-2*60000],
    ["intro",sel.intro,azanMs-30000]
  ];
  const out=[];
  for(const [kind,item,endMs] of specs){
    const name=fileNameFor(item,kind);
    const media=mediaByName.get(name);
    if(!media) throw new Error(`Missing Yodeck media: ${name}`);
    const dur=durationFor(item);
    if(!Number.isFinite(dur)) throw new Error(`Missing duration for ${itemId(item)}`);
    const startMs=endMs-Math.ceil(dur*1000);
    out.push(eventFor(media,startMs,endMs));
  }
  return out;
}

(async()=>{
  const mediaList=(await api("GET",`/media?limit=100&workspace=${WORKSPACE_ID}&ordering=name`)).results||[];
  const schedules=(await api("GET",`/schedules?limit=100&workspace=${WORKSPACE_ID}&ordering=name`)).results||[];
  const mediaByName=new Map(mediaList.map(x=>[x.name,x]));

  const dashboard=mediaByName.get(DASHBOARD_NAME);
  if(!dashboard) throw new Error(`Dashboard media missing: ${DASHBOARD_NAME}`);

  const now=new Date();
  const base=AL_IHSAN_PRAYER.localYMD(now,AL_IHSAN_CONFIG.timezone);
  const method=AL_IHSAN_CONFIG.prayerMethod;
  const events=[];

  for(let offset=0;offset<HORIZON_DAYS;offset++){
    const ymd=addDays(base,offset);
    const times=AL_IHSAN_PRAYER.calculate(ymd,method);
    const dateForSelection=new Date(times.shubuh.ts);
    const isFriday=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Jakarta",weekday:"short"}).format(dateForSelection)==="Fri";

    const prayers=[
      ["Subuh",times.shubuh.ts],
      [isFriday?"Jumat":"Dzuhur",times.dzuhur.ts],
      ["Ashar",times.ashar.ts],
      ["Maghrib",times.maghrib.ts],
      ["Isya",times.isya.ts]
    ];

    for(const [name,azanMs] of prayers){
      const built=buildPrayerEvents(new Date(azanMs),name,azanMs,mediaByName);
      for(const ev of built){
        if(new Date(ev.end+"+07:00").getTime()>Date.now()-60000) events.push(ev);
      }
    }
  }

  events.sort((a,b)=>a.start.localeCompare(b.start));

  const payload={
    name:SCHEDULE_NAME,
    workspace:{id:WORKSPACE_ID,name:WORKSPACE_NAME},
    events,
    filler_content:{source_id:dashboard.id,source_type:"media"}
  };

  let schedule=schedules.find(x=>x.name===SCHEDULE_NAME);
  if(schedule){
    schedule=await api("PATCH",`/schedules/${schedule.id}`,payload);
  }else{
    schedule=await api("POST","/schedules",payload);
  }

  await api("PATCH",`/screens/${SCREEN_ID}`,{
    screen_content:{
      source_id:schedule.id,
      source_name:SCHEDULE_NAME,
      source_type:"schedule"
    }
  });
  const push=await api("POST",`/screens/${SCREEN_ID}/push`,{use_download_timeslots:false});

  const verify=await api("GET",`/schedules/${schedule.id}`);
  const report={
    schedule_id:schedule.id,
    schedule_name:SCHEDULE_NAME,
    event_count:(verify.events||[]).length,
    first_event:(verify.events||[])[0]||null,
    last_event:(verify.events||[]).at(-1)||null,
    filler_content:verify.filler_content,
    screen_id:SCREEN_ID,
    push,
    generated_at:new Date().toISOString(),
    horizon_days:HORIZON_DAYS
  };
  fs.writeFileSync("yodeck-schedule-sync-report.json",JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
})().catch(err=>{
  console.error(err.stack||String(err));
  process.exit(1);
});

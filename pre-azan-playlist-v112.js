(()=>{"use strict";
const TZ="Asia/Jakarta";
const TILAWAH=Object.freeze({
  "SUBUH-01":"SUBUH-01 - Al-Afasy - Al-Fajr 1-10.mp3",
  "SUBUH-02":"SUBUH-02 - Minshawi - Ad-Duha 1-11.mp3",
  "SUBUH-03":"SUBUH-03 - Al-Afasy - At-Takwir 15-21.mp3",
  "ZUHUR-01":"ZUHUR-01 - Al-Afasy - Taha 14-16.mp3",
  "ZUHUR-02":"ZUHUR-02 - Al-Afasy - Al-Baqarah 238-239.mp3",
  "ZUHUR-03":"ZUHUR-03 - Al-Afasy - Al-Maarij 22-35.mp3",
  "ASAR-01":"ASAR-01 - Minshawi - Al-Asr 1-3.mp3",
  "ASAR-02":"ASAR-02 - Minshawi - Ash-Sharh 1-8.mp3",
  "ASAR-03":"ASAR-03 - Al-Afasy - Ali Imran 133-136.mp3",
  "MAGRIB-01":"MAGRIB-01 - Al-Afasy - Al-Inshiqaq 16-25.mp3",
  "MAGRIB-02":"MAGRIB-02 - Al-Afasy - At-Tariq 1-10.mp3",
  "MAGRIB-03":"MAGRIB-03 - Minshawi - Ash-Shams 1-15.mp3",
  "ISYA-01":"ISYA-01 - Al-Afasy - Al-Muzzammil 1-10.mp3",
  "ISYA-02":"ISYA-02 - Al-Afasy - As-Sajdah 15-17.mp3",
  "ISYA-03":"ISYA-03 - Al-Afasy - Al-Mulk 1-5.mp3",
  "JUMAT-01":"JUMAT-01 - Al-Afasy - Ali Imran 102-104.mp3",
  "JUMAT-02":"JUMAT-02 - Al-Afasy - Al-Baqarah 261-263.mp3",
  "JUMAT-03":"JUMAT-03 - Al-Afasy - Al-Baqarah 267-272.mp3"
});
const MATERIAL=Object.freeze({
  "05":"Menjaga Ketenangan Masjid",
  "06":"Ajak Keluarga ke Masjid",
  "07":"Memakmurkan Masjid",
  "08":"Sedekah untuk Masjid",
  "09":"Hadis Keutamaan Salat Berjamaah",
  "10":"Hadis Keutamaan Pergi ke Masjid",
  "11":"Hadis Malaikat Mendoakan Jamaah",
  "12":"Hadis Keutamaan Membaca Al Quran",
  "13":"Hadis Sedekah Jariah",
  "14":"Hadis Persaudaraan Muslim",
  "15":"Hadis Berbuat Baik kepada Tetangga",
  "16":"Hadis Menjaga Lisan",
  "17":"Pengantar Pra Azan Subuh",
  "18":"Pengantar Pra Azan Zuhur",
  "19":"Pengantar Pra Azan Asar",
  "20":"Pengantar Pra Azan Magrib",
  "21":"Pengantar Pra Azan Isya",
  "22":"Pengantar Hari Jumat",
  "23":"Datang Lebih Awal untuk Salat Jumat",
  "24":"Adab Mendengarkan Khutbah Jumat",
  "25":"Infak Jumat Masjid Al Ihsan",
  "SUBUH-TARHIM":"Sholawat Tarhim Subuh"
});
const WEEKLY=Object.freeze({
  1:Object.freeze({Subuh:["SUBUH-01","09","17"],Dzuhur:["ZUHUR-01","09","18"],Ashar:["ASAR-01","10","19"],Maghrib:["MAGRIB-01","06","20"],Isya:["ISYA-01","11","21"]}),
  2:Object.freeze({Subuh:["SUBUH-02","10","17"],Dzuhur:["ZUHUR-02","13","18"],Ashar:["ASAR-02","14","19"],Maghrib:["MAGRIB-02","12","20"],Isya:["ISYA-02","12","21"]}),
  3:Object.freeze({Subuh:["SUBUH-03","12","17"],Dzuhur:["ZUHUR-03","15","18"],Ashar:["ASAR-03","15","19"],Maghrib:["MAGRIB-03","14","20"],Isya:["ISYA-03","13","21"]}),
  4:Object.freeze({Subuh:["SUBUH-01","06","17"],Dzuhur:["ZUHUR-01","08","18"],Ashar:["ASAR-01","16","19"],Maghrib:["MAGRIB-01","16","20"],Isya:["ISYA-01","16","21"]}),
  5:Object.freeze({Subuh:["SUBUH-02","07","17"],Dzuhur:["ZUHUR-02","16","18"],Ashar:["ASAR-02","07","19"],Maghrib:["MAGRIB-02","05","20"],Isya:["ISYA-02","07","21"]}),
  6:Object.freeze({Subuh:["SUBUH-03","09","17"],Dzuhur:["ZUHUR-02","16","18"],Ashar:["ASAR-03","10","19"],Maghrib:["MAGRIB-03","06","20"],Isya:["ISYA-03","11","21"]}),
  0:Object.freeze({Subuh:["SUBUH-01","12","17"],Dzuhur:["ZUHUR-03","13","18"],Ashar:["ASAR-01","14","19"],Maghrib:["MAGRIB-01","12","20"],Isya:["ISYA-01","13","21"]})
});
const FRIDAY=Object.freeze([
  Object.freeze(["JUMAT-01","22","23","24"]),
  Object.freeze(["JUMAT-02","22","25","24"]),
  Object.freeze(["JUMAT-03","23","25","24"]),
  Object.freeze(["JUMAT-01","22","25","24"])
]);
const FRIDAY_PACKAGE_PRIMARY=Object.freeze([
  Object.freeze(["tilawah","JUMAT-01"]),
  Object.freeze(["tilawah","ZUHUR-03"]),
  Object.freeze(["intro","22"]),
  Object.freeze(["tilawah","JUMAT-02"]),
  Object.freeze(["tilawah","ASAR-03"]),
  Object.freeze(["message","09"]),
  Object.freeze(["tilawah","JUMAT-03"]),
  Object.freeze(["tilawah","ISYA-03"]),
  Object.freeze(["message","10"]),
  Object.freeze(["tilawah","MAGRIB-03"]),
  Object.freeze(["tilawah","SUBUH-02"]),
  Object.freeze(["message","14"]),
  Object.freeze(["tilawah","ISYA-01"]),
  Object.freeze(["tilawah","MAGRIB-01"]),
  Object.freeze(["message","13"]),
  Object.freeze(["tilawah","ZUHUR-01"]),
  Object.freeze(["tilawah","SUBUH-01"]),
  Object.freeze(["message","23"]),
  Object.freeze(["tilawah","ASAR-02"]),
  Object.freeze(["tilawah","ISYA-02"]),
  Object.freeze(["message","25"]),
  Object.freeze(["tilawah","MAGRIB-02"]),
  Object.freeze(["tilawah","SUBUH-03"]),
  Object.freeze(["intro","24"]),
  Object.freeze(["tilawah","ZUHUR-02"]),
  Object.freeze(["tilawah","ASAR-01"])
]);
const FRIDAY_REPEAT_TILAWAH=Object.freeze([
  "JUMAT-01","JUMAT-02","JUMAT-03",
  "ZUHUR-03","ASAR-03","ISYA-03","MAGRIB-03","SUBUH-02",
  "ISYA-01","MAGRIB-01","ZUHUR-01","SUBUH-01",
  "ASAR-02","ISYA-02","MAGRIB-02","SUBUH-03","ZUHUR-02","ASAR-01"
]);
const FRIDAY_FINISHER_MESSAGES=Object.freeze(["15","16","12","11","07","08","05","06"]);
const EXTENDED_PACKAGE_PRIMARY=Object.freeze({
  Subuh:Object.freeze([
    Object.freeze(["tilawah","SUBUH-01"]),
    Object.freeze(["message","09"]),
    Object.freeze(["tilawah","SUBUH-02"]),
    Object.freeze(["message","10"]),
    Object.freeze(["tilawah","SUBUH-03"]),
    Object.freeze(["message","11"]),
    Object.freeze(["tilawah","ZUHUR-03"]),
    Object.freeze(["message","12"]),
    Object.freeze(["tilawah","ASAR-02"]),
    Object.freeze(["message","06"]),
    Object.freeze(["tilawah","ISYA-01"]),
    Object.freeze(["message","07"]),
    Object.freeze(["tilawah","JUMAT-01"]),
    Object.freeze(["message","16"]),
    Object.freeze(["tilawah","MAGRIB-03"])
  ]),
  Maghrib:Object.freeze([
    Object.freeze(["tilawah","MAGRIB-01"]),
    Object.freeze(["message","12"]),
    Object.freeze(["tilawah","MAGRIB-02"]),
    Object.freeze(["message","14"]),
    Object.freeze(["tilawah","MAGRIB-03"]),
    Object.freeze(["message","06"]),
    Object.freeze(["tilawah","ASAR-03"]),
    Object.freeze(["message","16"]),
    Object.freeze(["tilawah","ISYA-03"]),
    Object.freeze(["message","11"]),
    Object.freeze(["tilawah","JUMAT-02"]),
    Object.freeze(["message","07"]),
    Object.freeze(["tilawah","ZUHUR-01"]),
    Object.freeze(["message","05"]),
    Object.freeze(["tilawah","SUBUH-03"])
  ])
});
const EXTENDED_REPEAT_TILAWAH=Object.freeze({
  Subuh:Object.freeze([
    "SUBUH-01","SUBUH-02","SUBUH-03","ZUHUR-03","ASAR-02",
    "ISYA-01","JUMAT-01","MAGRIB-03","ISYA-02","ZUHUR-01"
  ]),
  Maghrib:Object.freeze([
    "MAGRIB-01","MAGRIB-02","MAGRIB-03","ASAR-03","ISYA-03",
    "JUMAT-02","ZUHUR-01","SUBUH-03","ISYA-01","ASAR-02"
  ])
});
const EXTENDED_FINISHERS=Object.freeze({
  Subuh:Object.freeze(["09","10","11","12","16","05"]),
  Maghrib:Object.freeze(["20","12","14","16","11","05","06"])
});
const EXTENDED_TAIL=Object.freeze({
  Subuh:Object.freeze([
    Object.freeze(["tarhim","SUBUH-TARHIM"]),
    Object.freeze(["intro","17"])
  ]),
  Maghrib:Object.freeze([])
});
const EXTENDED_TAIL_RESERVE_MS=Object.freeze({
  Subuh:435000,
  Maghrib:0
});
const dowFmt=new Intl.DateTimeFormat("en-US",{timeZone:TZ,weekday:"short"});
const dayFmt=new Intl.DateTimeFormat("en-US",{timeZone:TZ,day:"2-digit"});
const DOW=Object.freeze({Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6});
function normalizePrayer(value){
  const s=String(value||"").trim().toLowerCase();
  if(s==="subuh"||s==="shubuh")return"Subuh";
  if(s==="zuhur"||s==="dzuhur")return"Dzuhur";
  if(s==="asar"||s==="ashar")return"Ashar";
  if(s==="magrib"||s==="maghrib")return"Maghrib";
  if(s==="isya"||s==="isya'")return"Isya";
  if(s==="jumat"||s==="jum'at"||s==="jum’at")return"Jumat";
  return"";
}
function localWeekday(date){return DOW[dowFmt.format(date)]??0}
function fridayCycle(date){
  const day=Number(dayFmt.format(date));
  const occurrence=Math.floor((day-1)/7)+1;
  return((occurrence-1)%4)+1;
}
function material(id){return Object.freeze({id,name:MATERIAL[id]||id,key:`material:${id}`})}
function tilawah(id){return Object.freeze({id,file:TILAWAH[id]||id,key:`tilawah:${id}`})}
function fridayPackageFor(){
  return Object.freeze(FRIDAY_PACKAGE_PRIMARY.map(([kind,id])=>Object.freeze({
    kind,
    item:kind==="tilawah"?tilawah(id):material(id)
  })));
}
function fridayRepeatTilawahFor(){
  return Object.freeze(FRIDAY_REPEAT_TILAWAH.map(id=>tilawah(id)));
}
function fridayFinisherFor(){
  return Object.freeze(FRIDAY_FINISHER_MESSAGES.map(id=>material(id)));
}
function extendedPackageFor(prayerName){
  const name=normalizePrayer(prayerName);
  const rows=EXTENDED_PACKAGE_PRIMARY[name]||[];
  return Object.freeze(rows.map(([kind,id])=>Object.freeze({
    kind,
    item:kind==="tilawah"?tilawah(id):material(id)
  })));
}
function extendedRepeatTilawahFor(prayerName){
  const name=normalizePrayer(prayerName);
  return Object.freeze((EXTENDED_REPEAT_TILAWAH[name]||[]).map(id=>tilawah(id)));
}
function extendedFinisherFor(prayerName){
  const name=normalizePrayer(prayerName);
  return Object.freeze((EXTENDED_FINISHERS[name]||[]).map(id=>material(id)));
}
function extendedTailFor(prayerName){
  const name=normalizePrayer(prayerName);
  const rows=EXTENDED_TAIL[name]||[];
  return Object.freeze(rows.map(([kind,id])=>Object.freeze({
    kind,
    item:kind==="tilawah"?tilawah(id):material(id)
  })));
}
function extendedTailReserveMs(prayerName){
  const name=normalizePrayer(prayerName);
  return Number(EXTENDED_TAIL_RESERVE_MS[name]||0);
}
function selectionFor(date,prayerName){
  const name=normalizePrayer(prayerName);
  if(!name)return null;
  if(name==="Jumat"){
    const cycle=fridayCycle(date);
    const [t,a,b,intro]=FRIDAY[cycle-1];
    return Object.freeze({prayerName:name,cycle,tilawah:tilawah(t),messages:Object.freeze([material(a),material(b)]),intro:material(intro)});
  }
  const weekday=localWeekday(date);
  const row=WEEKLY[weekday]?.[name];
  if(!row)return null;
  return Object.freeze({prayerName:name,weekday,tilawah:tilawah(row[0]),messages:Object.freeze([material(row[1])]),intro:material(row[2])});
}
const GAP_MS=2000;
const SILENCE_MS=30000;
const FRIDAY_START_BEFORE_MS=45*60000;
const EXTENDED_START_BEFORE_MS=45*60000;
function segment(kind,item,startMs,endMs){return Object.freeze({kind,item:item||null,itemKey:item?.key||"",startMs,endMs})}
function scheduleFor(date,prayerName,azanTs){
  const selection=selectionFor(date,prayerName);
  const azanMs=Number(azanTs);
  if(!selection||!Number.isFinite(azanMs))return null;

  if(selection.prayerName==="Jumat"){
    const packageStart=azanMs-FRIDAY_START_BEFORE_MS;
    const packageEnd=azanMs-SILENCE_MS;
    const segments=[
      segment("friday-package",null,packageStart,packageEnd),
      segment("silence",null,packageEnd,azanMs)
    ];
    return Object.freeze({
      prayerName:selection.prayerName,
      azanMs,
      startMs:packageStart,
      endMs:azanMs,
      startBeforeAzanSeconds:45*60,
      packageName:"Jumat H-45 Dynamic",
      packageMediaCount:fridayPackageFor().length,
      packageRepeatTilawahCount:fridayRepeatTilawahFor().length,
      selection,
      segments:Object.freeze(segments)
    });
  }

  if(selection.prayerName==="Subuh"||selection.prayerName==="Maghrib"){
    const packageStart=azanMs-EXTENDED_START_BEFORE_MS;
    const packageEnd=azanMs-SILENCE_MS;
    const segments=[
      segment("extended-package",null,packageStart,packageEnd),
      segment("silence",null,packageEnd,azanMs)
    ];
    return Object.freeze({
      prayerName:selection.prayerName,
      azanMs,
      startMs:packageStart,
      endMs:azanMs,
      startBeforeAzanSeconds:45*60,
      packageName:selection.prayerName+" H-45 Dynamic",
      packageMediaCount:extendedPackageFor(selection.prayerName).length,
      packageRepeatTilawahCount:extendedRepeatTilawahFor(selection.prayerName).length,
      packageTailCount:extendedTailFor(selection.prayerName).length,
      selection,
      segments:Object.freeze(segments)
    });
  }

  const mediaPlan=[
    ["tilawah",selection.tilawah,3*60000],
    ["message",selection.messages[0],3*60000],
    ["intro",selection.intro,90000]
  ];
  const mediaMs=mediaPlan.reduce((sum,row)=>sum+row[2],0);
  const leadAdvanceMs=mediaPlan.length*GAP_MS;
  let cursor=azanMs-SILENCE_MS-mediaMs-leadAdvanceMs;
  const segments=[];
  for(const [kind,item,durationMs] of mediaPlan){
    segments.push(segment("gap",item,cursor,cursor+GAP_MS));
    cursor+=GAP_MS;
    segments.push(segment(kind,item,cursor,cursor+durationMs));
    cursor+=durationMs;
  }
  segments.push(segment("silence",null,cursor,azanMs));
  return Object.freeze({
    prayerName:selection.prayerName,
    azanMs,
    startMs:segments[0].startMs,
    endMs:azanMs,
    leadAdvanceSeconds:leadAdvanceMs/1000,
    selection,
    segments:Object.freeze(segments)
  });
}
function stateAt(now,prayerName,azanTs){
  const nowMs=now instanceof Date?now.getTime():Number(now);
  const schedule=scheduleFor(new Date(Number(azanTs)),prayerName,azanTs);
  if(!schedule||!Number.isFinite(nowMs)||nowMs<schedule.startMs||nowMs>=schedule.endMs)return null;
  const active=schedule.segments.find(s=>nowMs>=s.startMs&&nowMs<s.endMs)||null;
  return active?Object.freeze({...active,prayerName:schedule.prayerName,azanMs:schedule.azanMs,selection:schedule.selection}):null;
}
window.AL_IHSAN_PRE_AZAN=Object.freeze({
  version:"pre-azan-v112",
  timezone:TZ,
  silenceBeforeAzanSeconds:30,
  interAudioGapSeconds:2,
  tilawahFiles:TILAWAH,
  materialNames:MATERIAL,
  selectionFor,
  fridayPackageFor,
  fridayRepeatTilawahFor,
  fridayFinisherFor,
  extendedPackageFor,
  extendedRepeatTilawahFor,
  extendedFinisherFor,
  extendedTailFor,
  extendedTailReserveMs,
  scheduleFor,
  stateAt
});
})();
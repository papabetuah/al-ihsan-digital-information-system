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
  "JUMAT-03":"JUMAT-03 - Al-Afasy - Al-Baqarah 267-272.mp3",
  "MUR-26-ALBAQARAH-43":"MUR-26 - Al-Afasy - Al-Baqarah 43.mp3",
  "MUR-27-ALBAQARAH-153":"MUR-27 - Al-Afasy - Al-Baqarah 153.mp3",
  "MUR-28-RAMADAN-BAQARAH-183-185":"MUR-28 - Al-Afasy - Al-Baqarah 183-185.mp3",
  "MUR-29-RAMADAN-BAQARAH-186-187":"MUR-29 - Al-Afasy - Al-Baqarah 186-187.mp3",
  "MUR-30-SHALAT-BAQARAH-238-239":"MUR-30 - Al-Afasy - Al-Baqarah 238-239.mp3",
  "MUR-31-JUMAT-ALIIMRAN-102-104":"MUR-31 - Al-Afasy - Ali Imran 102-104.mp3",
  "MUR-32-TAUBAT-ALIIMRAN-133-136":"MUR-32 - Al-Afasy - Ali Imran 133-136.mp3",
  "MUR-33-AKHIRAT-ANNABA-31-40":"MUR-33 - Al-Afasy - An-Naba 31-40.mp3",
  "MUR-34-RAMADAN-ALQADR-1-5":"MUR-34 - Al-Afasy - Al-Qadr 1-5.mp3",
  "MUR-35-ADAB-ALMAUN-1-7":"MUR-35 - Al-Afasy - Al-Maun 1-7.mp3"
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
  "SUBUH-TARHIM":"Sholawat Tarhim Subuh",
  "RAMADAN-MAGRIB-SIREN":"Sirine Tanda Berbuka Puasa"
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
const FRIDAY_PACKAGE_VARIANTS=Object.freeze([
  Object.freeze([["tilawah","JUMAT-01"],["intro","22"],["tilawah","MUR-31-JUMAT-ALIIMRAN-102-104"],["message","09"],["tilawah","JUMAT-02"],["message","23"],["tilawah","MUR-35-ADAB-ALMAUN-1-7"],["message","13"],["tilawah","JUMAT-03"],["message","25"],["intro","24"]]),
  Object.freeze([["tilawah","JUMAT-02"],["intro","22"],["tilawah","MUR-32-TAUBAT-ALIIMRAN-133-136"],["message","10"],["tilawah","JUMAT-01"],["message","14"],["tilawah","MUR-30-SHALAT-BAQARAH-238-239"],["message","23"],["tilawah","JUMAT-03"],["message","25"],["intro","24"]]),
  Object.freeze([["tilawah","MUR-31-JUMAT-ALIIMRAN-102-104"],["intro","22"],["tilawah","JUMAT-03"],["message","09"],["tilawah","MUR-35-ADAB-ALMAUN-1-7"],["message","15"],["tilawah","JUMAT-02"],["message","23"],["tilawah","MUR-32-TAUBAT-ALIIMRAN-133-136"],["message","25"],["intro","24"]]),
  Object.freeze([["tilawah","JUMAT-01"],["intro","22"],["tilawah","MUR-30-SHALAT-BAQARAH-238-239"],["message","14"],["tilawah","JUMAT-02"],["message","08"],["tilawah","MUR-31-JUMAT-ALIIMRAN-102-104"],["message","23"],["tilawah","JUMAT-03"],["message","25"],["intro","24"]])
]);
const FRIDAY_REPEAT_TILAWAH=const FRIDAY_REPEAT_TILAWAH=Object.freeze([
  "JUMAT-01","JUMAT-02","JUMAT-03",
  "ZUHUR-03","ASAR-03","ISYA-03","MAGRIB-03","SUBUH-02",
  "ISYA-01","MAGRIB-01","ZUHUR-01","SUBUH-01",
  "ASAR-02","ISYA-02","MAGRIB-02","SUBUH-03","ZUHUR-02","ASAR-01",
  "MUR-31-JUMAT-ALIIMRAN-102-104","MUR-32-TAUBAT-ALIIMRAN-133-136","MUR-30-SHALAT-BAQARAH-238-239","MUR-35-ADAB-ALMAUN-1-7"
]);
const FRIDAY_FINISHER_MESSAGES=Object.freeze(["15","16","12","11","07","08","05","06"]);
const EXTENDED_PACKAGE_VARIANTS=Object.freeze({
  Subuh:Object.freeze([
    Object.freeze([["tilawah","SUBUH-01"],["message","09"],["tilawah","SUBUH-02"],["message","10"],["tilawah","MUR-27-ALBAQARAH-153"],["message","11"],["tilawah","SUBUH-03"],["message","12"],["tilawah","MUR-26-ALBAQARAH-43"],["message","07"]]),
    Object.freeze([["tilawah","SUBUH-02"],["message","06"],["tilawah","MUR-26-ALBAQARAH-43"],["message","09"],["tilawah","SUBUH-01"],["message","07"],["tilawah","MUR-27-ALBAQARAH-153"],["message","16"],["tilawah","SUBUH-03"],["message","11"]]),
    Object.freeze([["tilawah","SUBUH-03"],["message","12"],["tilawah","MUR-33-AKHIRAT-ANNABA-31-40"],["message","11"],["tilawah","SUBUH-02"],["message","06"],["tilawah","MUR-27-ALBAQARAH-153"],["message","09"],["tilawah","SUBUH-01"],["message","14"]]),
    Object.freeze([["tilawah","MUR-27-ALBAQARAH-153"],["message","09"],["tilawah","SUBUH-01"],["message","10"],["tilawah","MUR-35-ADAB-ALMAUN-1-7"],["message","14"],["tilawah","SUBUH-03"],["message","07"],["tilawah","SUBUH-02"],["message","16"]])
  ]),
  Dzuhur:Object.freeze([
    Object.freeze([["tilawah","ZUHUR-01"],["message","09"],["tilawah","MUR-30-SHALAT-BAQARAH-238-239"],["message","13"],["tilawah","ZUHUR-02"],["message","15"]]),
    Object.freeze([["tilawah","ZUHUR-02"],["message","15"],["tilawah","MUR-26-ALBAQARAH-43"],["message","08"],["tilawah","ZUHUR-03"],["message","09"]]),
    Object.freeze([["tilawah","ZUHUR-03"],["message","13"],["tilawah","MUR-32-TAUBAT-ALIIMRAN-133-136"],["message","09"],["tilawah","ZUHUR-01"],["message","15"]]),
    Object.freeze([["tilawah","MUR-30-SHALAT-BAQARAH-238-239"],["message","14"],["tilawah","ZUHUR-01"],["message","15"],["tilawah","MUR-35-ADAB-ALMAUN-1-7"],["message","08"]])
  ]),
  Ashar:Object.freeze([
    Object.freeze([["tilawah","ASAR-01"],["message","10"],["tilawah","ASAR-02"],["message","14"],["tilawah","ASAR-03"],["message","16"]]),
    Object.freeze([["tilawah","MUR-27-ALBAQARAH-153"],["message","16"],["tilawah","ASAR-03"],["message","07"],["tilawah","ASAR-02"],["message","10"]]),
    Object.freeze([["tilawah","MUR-32-TAUBAT-ALIIMRAN-133-136"],["message","10"],["tilawah","ASAR-02"],["message","15"],["tilawah","ASAR-01"],["message","14"]]),
    Object.freeze([["tilawah","ASAR-03"],["message","14"],["tilawah","MUR-35-ADAB-ALMAUN-1-7"],["message","16"],["tilawah","ASAR-01"],["message","07"]])
  ]),
  Maghrib:Object.freeze([
    Object.freeze([["tilawah","MAGRIB-01"],["message","12"],["tilawah","MAGRIB-02"],["message","14"],["tilawah","MUR-33-AKHIRAT-ANNABA-31-40"],["message","06"],["tilawah","MAGRIB-03"],["message","16"]]),
    Object.freeze([["tilawah","MAGRIB-02"],["message","06"],["tilawah","MUR-35-ADAB-ALMAUN-1-7"],["message","12"],["tilawah","MAGRIB-03"],["message","11"],["tilawah","MUR-32-TAUBAT-ALIIMRAN-133-136"],["message","07"]]),
    Object.freeze([["tilawah","MAGRIB-03"],["message","14"],["tilawah","MUR-33-AKHIRAT-ANNABA-31-40"],["message","11"],["tilawah","MAGRIB-01"],["message","07"],["tilawah","MUR-27-ALBAQARAH-153"],["message","16"]]),
    Object.freeze([["tilawah","MUR-35-ADAB-ALMAUN-1-7"],["message","12"],["tilawah","MAGRIB-01"],["message","06"],["tilawah","MAGRIB-02"],["message","16"],["tilawah","MUR-33-AKHIRAT-ANNABA-31-40"],["message","11"]])
  ]),
  Isya:Object.freeze([
    Object.freeze([["message","11"],["message","09"],["message","10"],["message","12"],["message","13"],["message","14"],["message","15"],["message","16"],["message","06"],["message","07"]]),
    Object.freeze([["message","09"],["message","11"],["message","14"],["message","10"],["message","16"],["message","13"],["message","07"],["message","05"],["message","15"],["message","08"]]),
    Object.freeze([["message","10"],["message","09"],["message","12"],["message","15"],["message","11"],["message","06"],["message","14"],["message","16"],["message","08"],["message","07"]]),
    Object.freeze([["message","14"],["message","16"],["message","09"],["message","13"],["message","10"],["message","11"],["message","15"],["message","07"],["message","06"],["message","05"]])
  ])
});
const RAMADAN_PACKAGE_VARIANTS=Object.freeze({
  Subuh:Object.freeze([
    Object.freeze([["tilawah","MUR-28-RAMADAN-BAQARAH-183-185"],["message","09"],["tilawah","SUBUH-01"],["message","10"],["tilawah","MUR-29-RAMADAN-BAQARAH-186-187"],["message","11"],["tilawah","SUBUH-02"],["message","12"]]),
    Object.freeze([["tilawah","MUR-29-RAMADAN-BAQARAH-186-187"],["message","06"],["tilawah","SUBUH-02"],["message","09"],["tilawah","MUR-34-RAMADAN-ALQADR-1-5"],["message","07"],["tilawah","SUBUH-03"],["message","16"]]),
    Object.freeze([["tilawah","MUR-28-RAMADAN-BAQARAH-183-185"],["message","12"],["tilawah","SUBUH-03"],["message","11"],["tilawah","MUR-27-ALBAQARAH-153"],["message","06"],["tilawah","SUBUH-01"],["message","09"]]),
    Object.freeze([["tilawah","MUR-34-RAMADAN-ALQADR-1-5"],["message","09"],["tilawah","SUBUH-02"],["message","10"],["tilawah","MUR-35-ADAB-ALMAUN-1-7"],["message","07"],["tilawah","SUBUH-01"],["message","16"]])
  ]),
  Maghrib:Object.freeze([
    Object.freeze([["tilawah","MUR-28-RAMADAN-BAQARAH-183-185"],["message","12"],["tilawah","MAGRIB-01"],["message","13"],["tilawah","MUR-29-RAMADAN-BAQARAH-186-187"],["message","14"],["tilawah","MUR-34-RAMADAN-ALQADR-1-5"],["message","16"]]),
    Object.freeze([["tilawah","MUR-29-RAMADAN-BAQARAH-186-187"],["message","12"],["tilawah","MAGRIB-02"],["message","06"],["tilawah","MUR-34-RAMADAN-ALQADR-1-5"],["message","13"],["tilawah","MUR-28-RAMADAN-BAQARAH-183-185"],["message","07"]]),
    Object.freeze([["tilawah","MUR-34-RAMADAN-ALQADR-1-5"],["message","12"],["tilawah","MAGRIB-03"],["message","14"],["tilawah","MUR-28-RAMADAN-BAQARAH-183-185"],["message","13"],["tilawah","MUR-29-RAMADAN-BAQARAH-186-187"],["message","16"]]),
    Object.freeze([["tilawah","MUR-28-RAMADAN-BAQARAH-183-185"],["message","12"],["tilawah","MUR-34-RAMADAN-ALQADR-1-5"],["message","14"],["tilawah","MAGRIB-02"],["message","13"],["tilawah","MUR-29-RAMADAN-BAQARAH-186-187"],["message","07"]])
  ])
});
const EXTENDED_REPEAT_TILAWAH=const EXTENDED_REPEAT_TILAWAH=Object.freeze({
  Subuh:Object.freeze(["SUBUH-01","SUBUH-02","SUBUH-03","MUR-27-ALBAQARAH-153","MUR-26-ALBAQARAH-43","MUR-33-AKHIRAT-ANNABA-31-40"]),
  Maghrib:Object.freeze(["MAGRIB-01","MAGRIB-02","MAGRIB-03","MUR-33-AKHIRAT-ANNABA-31-40","MUR-35-ADAB-ALMAUN-1-7","MUR-32-TAUBAT-ALIIMRAN-133-136"]),
  Dzuhur:Object.freeze(["ZUHUR-01","ZUHUR-02","ZUHUR-03","MUR-30-SHALAT-BAQARAH-238-239","MUR-26-ALBAQARAH-43"]),
  Ashar:Object.freeze(["ASAR-01","ASAR-02","ASAR-03","MUR-27-ALBAQARAH-153","MUR-32-TAUBAT-ALIIMRAN-133-136"])
});
const RAMADAN_REPEAT_TILAWAH=Object.freeze({
  Subuh:Object.freeze(["MUR-28-RAMADAN-BAQARAH-183-185","MUR-29-RAMADAN-BAQARAH-186-187","MUR-34-RAMADAN-ALQADR-1-5","SUBUH-01","SUBUH-02","SUBUH-03"]),
  Maghrib:Object.freeze(["MUR-28-RAMADAN-BAQARAH-183-185","MUR-29-RAMADAN-BAQARAH-186-187","MUR-34-RAMADAN-ALQADR-1-5","MAGRIB-01","MAGRIB-02","MAGRIB-03"])
});
const EXTENDED_REPEAT_MESSAGES=const EXTENDED_REPEAT_MESSAGES=Object.freeze({
  Isya:Object.freeze(["09","10","11","12","13","14","15","16","06","07","05","08"])
});
const EXTENDED_FINISHERS=Object.freeze({
  Subuh:Object.freeze(["09","10","11","12","16","05"]),
  Maghrib:Object.freeze(["20","12","14","16","11","05","06"]),
  Dzuhur:Object.freeze(["09","13","15","08","05"]),
  Ashar:Object.freeze(["10","14","16","07","05"]),
  Isya:Object.freeze(["11","09","10","12","14","16","07","05"])
});
const EXTENDED_TAIL=Object.freeze({
  Subuh:Object.freeze([
    Object.freeze(["tarhim","SUBUH-TARHIM"]),
    Object.freeze(["intro","17"])
  ]),
  Maghrib:Object.freeze([Object.freeze(["intro","20"])]),
  Dzuhur:Object.freeze([Object.freeze(["intro","18"])]),
  Ashar:Object.freeze([Object.freeze(["intro","19"])]),
  Isya:Object.freeze([Object.freeze(["intro","21"])])
});
const EXTENDED_TAIL_RESERVE_MS=Object.freeze({
  Subuh:435000,
  Maghrib:60000,
  Dzuhur:60000,
  Ashar:60000,
  Isya:60000
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
const PRAYER_POLICY=Object.freeze({
  Subuh:Object.freeze({leadMinutes:45,variantCount:4,mode:"mixed",tail:"tarhim+intro"}),
  Dzuhur:Object.freeze({leadMinutes:15,variantCount:4,mode:"mixed",tail:"intro"}),
  Ashar:Object.freeze({leadMinutes:15,variantCount:4,mode:"mixed",tail:"intro"}),
  Maghrib:Object.freeze({leadMinutes:45,variantCount:4,mode:"mixed",tail:"intro",ramadanSiren:true}),
  Isya:Object.freeze({leadMinutes:10,variantCount:4,mode:"spoken-only",tail:"intro"}),
  Jumat:Object.freeze({leadMinutes:45,variantCount:4,mode:"mixed",tail:"dynamic"})
});
const PRAYER_VARIANT_OFFSET=Object.freeze({Subuh:0,Dzuhur:1,Ashar:2,Maghrib:3,Isya:0});
const ymdFmt=new Intl.DateTimeFormat("en-US",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit"});
function localSerial(date){
  const parts=Object.fromEntries(ymdFmt.formatToParts(date).filter(x=>x.type!=="literal").map(x=>[x.type,Number(x.value)]));
  return Math.floor(Date.UTC(parts.year,parts.month-1,parts.day)/86400000);
}
function variantFor(date,prayerName){
  const name=normalizePrayer(prayerName);
  if(name==="Jumat")return fridayCycle(date);
  return ((localSerial(date)+(PRAYER_VARIANT_OFFSET[name]||0))%4+4)%4+1;
}
function localWeekday(date){return DOW[dowFmt.format(date)]??0}
function fridayCycle(date){
  const day=Number(dayFmt.format(date));
  const occurrence=Math.floor((day-1)/7)+1;
  return((occurrence-1)%4)+1;
}
function material(id){return Object.freeze({id,name:MATERIAL[id]||id,key:`material:${id}`})}
function tilawah(id){return Object.freeze({id,file:TILAWAH[id]||id,key:`tilawah:${id}`})}
function fridayPackageFor(date=new Date()){
  const rows=FRIDAY_PACKAGE_VARIANTS[variantFor(date,"Jumat")-1]||[];
  return Object.freeze(rows.map(([kind,id])=>Object.freeze({kind,item:kind==="tilawah"?tilawah(id):material(id)})));
}
function fridayRepeatTilawahFor(){
  return Object.freeze(FRIDAY_REPEAT_TILAWAH.map(id=>tilawah(id)));
}
function fridayFinisherFor(){
  return Object.freeze(FRIDAY_FINISHER_MESSAGES.map(id=>material(id)));
}
function extendedPackageFor(prayerName,date=new Date()){
  const name=normalizePrayer(prayerName),variant=variantFor(date,name);
  const source=isRamadan(date)&&RAMADAN_PACKAGE_VARIANTS[name]?RAMADAN_PACKAGE_VARIANTS[name]:EXTENDED_PACKAGE_VARIANTS[name];
  const rows=source?.[variant-1]||[];
  return Object.freeze(rows.map(([kind,id])=>Object.freeze({kind,item:kind==="tilawah"?tilawah(id):material(id)})));
}
function extendedRepeatTilawahFor(prayerName,date=new Date()){
  const name=normalizePrayer(prayerName);
  const source=isRamadan(date)&&RAMADAN_REPEAT_TILAWAH[name]?RAMADAN_REPEAT_TILAWAH[name]:EXTENDED_REPEAT_TILAWAH[name];
  return Object.freeze((source||[]).map(id=>tilawah(id)));
}
function extendedRepeatMessagesFor(prayerName){
  const name=normalizePrayer(prayerName);
  return Object.freeze((EXTENDED_REPEAT_MESSAGES[name]||[]).map(id=>material(id)));
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
function planFor(date,prayerName){
  const d=date instanceof Date?date:new Date(date),name=normalizePrayer(prayerName);
  if(!name)return null;
  const variant=variantFor(d,name),ramadan=isRamadan(d);
  if(name==="Jumat")return Object.freeze({id:"Jumat-"+variant,prayerName:name,variant,ramadan,policy:PRAYER_POLICY.Jumat,primary:fridayPackageFor(d),repeatTilawah:fridayRepeatTilawahFor(),repeatMessages:Object.freeze([]),finishers:fridayFinisherFor(),tail:Object.freeze([])});
  return Object.freeze({id:name+"-"+((ramadan&&RAMADAN_PACKAGE_VARIANTS[name])?"RAMADAN-":"")+variant,prayerName:name,variant,ramadan,policy:PRAYER_POLICY[name],primary:extendedPackageFor(name,d),repeatTilawah:extendedRepeatTilawahFor(name,d),repeatMessages:extendedRepeatMessagesFor(name),finishers:extendedFinisherFor(name),tail:extendedTailFor(name)});
}
function requiredAssetIdsFor(date,prayerName){
  const plan=planFor(date,prayerName);if(!plan)return Object.freeze([]);
  const ids=[],push=x=>{const id=String(x?.item?.id||x?.id||"");if(id&&!ids.includes(id))ids.push(id)};
  plan.primary.forEach(push);plan.repeatTilawah.forEach(push);plan.repeatMessages.forEach(push);plan.finishers.forEach(push);plan.tail.forEach(push);
  if(plan.prayerName==="Maghrib"&&plan.ramadan&&!ids.includes(RAMADAN_MAGHRIB_SIREN_ID))ids.push(RAMADAN_MAGHRIB_SIREN_ID);
  return Object.freeze(ids);
}
function selectionFor(date,prayerName){
  const name=normalizePrayer(prayerName);
  if(!name)return null;
  if(name==="Jumat"){
    const cycle=fridayCycle(date);
    const [t,a,b,intro]=FRIDAY[cycle-1];
    return Object.freeze({prayerName:name,cycle,variant:variantFor(date,name),ramadan:isRamadan(date),tilawah:tilawah(t),messages:Object.freeze([material(a),material(b)]),intro:material(intro)});
  }
  const weekday=localWeekday(date);
  const row=WEEKLY[weekday]?.[name];
  if(!row)return null;
  return Object.freeze({prayerName:name,weekday,variant:variantFor(date,name),ramadan:isRamadan(date),tilawah:tilawah(row[0]),messages:Object.freeze([material(row[1])]),intro:material(row[2])});
}
const GAP_MS=2000;
const SILENCE_MS=30000;
const RAMADAN_MAGHRIB_SIREN_ID="RAMADAN-MAGRIB-SIREN";
const RAMADAN_MAGHRIB_SIREN_MS=17000;
function isRamadan(date){
  const d=date instanceof Date?date:new Date(date);
  const h=globalThis.AL_IHSAN_CALENDAR?.hijriFromDate?.(d);
  return Boolean(h&&String(h.month||"").toLowerCase()==="ramadan");
}
const FRIDAY_START_BEFORE_MS=45*60000;
const EXTENDED_START_BEFORE_MS=Object.freeze({
  Subuh:45*60000,
  Maghrib:45*60000,
  Dzuhur:15*60000,
  Ashar:15*60000,
  Isya:10*60000
});
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
      packageMediaCount:fridayPackageFor(new Date(azanMs)).length,
      packageVariant:variantFor(new Date(azanMs),"Jumat"),
      packageRepeatTilawahCount:fridayRepeatTilawahFor().length,
      selection,
      segments:Object.freeze(segments)
    });
  }

  if(Object.prototype.hasOwnProperty.call(EXTENDED_START_BEFORE_MS,selection.prayerName)){
    const startBeforeMs=Number(EXTENDED_START_BEFORE_MS[selection.prayerName]);
    const packageStart=azanMs-startBeforeMs;
    const packageEnd=azanMs-SILENCE_MS;
    const ramadanMaghrib=selection.prayerName==="Maghrib"&&isRamadan(new Date(azanMs));
    const ramadanSiren=ramadanMaghrib?material(RAMADAN_MAGHRIB_SIREN_ID):null;
    const scheduleEndMs=ramadanMaghrib?azanMs+RAMADAN_MAGHRIB_SIREN_MS:azanMs;
    const segments=[
      segment("extended-package",null,packageStart,packageEnd),
      segment("silence",ramadanSiren,packageEnd,azanMs)
    ];
    if(ramadanMaghrib)segments.push(segment("ramadan-siren",ramadanSiren,azanMs,scheduleEndMs));
    const leadMinutes=Math.round(startBeforeMs/60000);
    return Object.freeze({
      prayerName:selection.prayerName,
      azanMs,
      startMs:packageStart,
      endMs:scheduleEndMs,
      startBeforeAzanSeconds:startBeforeMs/1000,
      packageName:selection.prayerName+" H-"+leadMinutes+" Dynamic"+(ramadanMaghrib?" + Ramadan Siren":""),
      ramadanMaghrib,
      ramadanSirenDurationMs:ramadanMaghrib?RAMADAN_MAGHRIB_SIREN_MS:0,
      packageMediaCount:extendedPackageFor(selection.prayerName,new Date(azanMs)).length,
      packageVariant:variantFor(new Date(azanMs),selection.prayerName),
      packageRepeatTilawahCount:extendedRepeatTilawahFor(selection.prayerName,new Date(azanMs)).length,
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
  version:"pre-azan-v116",
  timezone:TZ,
  silenceBeforeAzanSeconds:30,
  interAudioGapSeconds:2,
  tilawahFiles:TILAWAH,
  materialNames:MATERIAL,
  policy:PRAYER_POLICY,
  rollingVariantCount:4,
  variantFor,
  planFor,
  requiredAssetIdsFor,
  selectionFor,
  fridayPackageFor,
  fridayRepeatTilawahFor,
  fridayFinisherFor,
  extendedPackageFor,
  extendedRepeatTilawahFor,
  extendedRepeatMessagesFor,
  extendedFinisherFor,
  extendedTailFor,
  extendedTailReserveMs,
  isRamadan,
  ramadanMaghribSirenSeconds:RAMADAN_MAGHRIB_SIREN_MS/1000,
  scheduleFor,
  stateAt
});
})();
(()=>{"use strict";
const C=window.AL_IHSAN_CONFIG,P=window.AL_IHSAN_PRAYER,M=C.prayerMethod,CAL=window.AL_IHSAN_CALENDAR;
const $=id=>document.getElementById(id);
const E={
  stage:$("stage"),donation:$("donationScene"),donationUnderlay:$("donationUnderlay"),
  announcement:$("announcementScene"),announcementUnderlay:$("announcementUnderlay"),announcementMain:$("announcementMainCard"),
  annPriority:$("announcementPriority"),annTitle:$("announcementTitle"),annBody:$("announcementBody"),
  annTime:$("announcementTime"),annLocation:$("announcementLocation"),annImage:$("announcementImage"),
  annPager:$("announcementPager"),annAgenda:$("announcementAgendaList"),annWisdom:$("announcementWisdom"),
  annWisdomSource:$("announcementWisdomSource"),cmsState:$("announcementCmsState"),
  prayerScene:$("prayerScene"),prayerEyebrow:$("prayerModeEyebrow"),prayerTitle:$("prayerModeTitle"),
  prayerName:$("prayerModePrayer"),prayerCountdown:$("prayerModeCountdown"),prayerMessage:$("prayerModeMessage"),prayerDuaCard:$("prayerDuaCard"),prayerRamadanSpeaker:$("prayerRamadanSpeaker"),prayerRamadanSpeakerName:$("prayerRamadanSpeakerName"),
  zikirScene:$("zikirScene"),zikirClock:$("zikirClock"),zikirDateGregorian:$("zikirDateGregorian"),zikirDateHijri:$("zikirDateHijri"),zikirStepCountdown:$("zikirStepCountdown"),prayerAdviceItem1:$("prayerAdviceItem1"),prayerAdviceItem2:$("prayerAdviceItem2"),prayerAdviceItem3:$("prayerAdviceItem3"),prayerAdvice1:$("prayerAdvice1"),prayerAdvice2:$("prayerAdvice2"),prayerAdvice3:$("prayerAdvice3"),
  date:$("liveDate"),dateGregorian:$("liveDateGregorian"),dateHijri:$("liveDateHijri"),clockHM:$("clockHourMinute"),clockSec:$("clockSecond"),countdown:$("countdown"),next:$("nextPrayer"),
  shubuh:$("timeShubuh"),terbit:$("timeTerbit"),dzuhur:$("timeDzuhur"),ashar:$("timeAshar"),maghrib:$("timeMaghrib"),isya:$("timeIsya"),
  status:$("statusDot")
};
const prayerKeys=["shubuh","terbit","dzuhur","ashar","maghrib","isya"];
const dateFormatter=new Intl.DateTimeFormat("id-ID",{timeZone:C.timezone,weekday:"long",day:"2-digit",month:"long",year:"numeric"});
const clockFormatter=new Intl.DateTimeFormat("id-ID",{timeZone:C.timezone,hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"});
let cachedDateKey="",cachedYmd=null,cachedTimes=null,timerId=0,sceneTimerId=0,currentScene="dashboard";
let cmsTimerId=0,announcementTimerId=0,announcementIndex=0;
let announcements=[],agendaItems=[],wisdomItems=[];
const clonePrayerDefaults=()=>Object.fromEntries(Object.entries(C.prayerMode?.defaults||{}).map(([k,v])=>[k,{...v}]));
let prayerSettings=clonePrayerDefaults();
let ramadanSettings={...(C.prayerMode?.ramadanDefaults||{})};
let ramadanSchedule=[];
const postPrayerZikirDefaults=C.prayerMode?.postPrayerZikir||C.zikirMode||{};
const cloneZikirDefaults=()=>({
  enabled:postPrayerZikirDefaults.enabled!==false,
  step1Seconds:Number(postPrayerZikirDefaults.step1Seconds||45),
  step2Seconds:Number(postPrayerZikirDefaults.step2Seconds||75),
  step3Seconds:Number(postPrayerZikirDefaults.step3Seconds||90),
  closingSeconds:Number(postPrayerZikirDefaults.closingSeconds||10),
  prayers:{...(postPrayerZikirDefaults.prayers||{})}
});
let zikirSettings=cloneZikirDefaults();
let prayerModeActive=false,prayerModeSignature="",prayerScheduleTimerId=0,activePrayerState=null;
let lastPrayerReturnScene=C.rotation?.startScene||"dashboard";
const MAX_SCHEDULE_DELAY_MS=2147483000;
const previewQuery=new URLSearchParams(location.search);
const prayerPreviewEnabled=previewQuery.get("scene")==="prayer";
const zikirPreviewEnabled=previewQuery.get("scene")==="zikir";
let prayerPreviewEndMs=0,zikirPreviewEndMs=0;
const PRAYER_MODE_ZIKIR_PHASES=Object.freeze(["zikir1","zikir2","zikir3","zikirEnd"]);
function isPrayerModeZikirPhase(phase){
  return PRAYER_MODE_ZIKIR_PHASES.includes(String(phase||""));
}

function fit(){
  const width=C.stage?.width||1672,height=C.stage?.height||941;
  const scale=Math.min(innerWidth/width,innerHeight/height);
  document.documentElement.style.setProperty("--scale",String(scale));
}

function getDailyTimes(now){
  const ymd=P.localYMD(now,C.timezone);
  const key=`${ymd.year}-${String(ymd.month).padStart(2,"0")}-${String(ymd.day).padStart(2,"0")}`;
  if(key!==cachedDateKey){
    cachedDateKey=key;cachedYmd=ymd;cachedTimes=P.calculate(ymd,M);
  }
  return{ymd:cachedYmd,times:cachedTimes};
}

function render(){
  try{
    const now=new Date();
    const{ymd,times}=getDailyTimes(now);

    // Aktivasi/fase Mode Sholat ditentukan oleh scheduler timestamp.
    // Render 1-detik hanya memperbarui jam dan countdown yang terlihat.
    refreshActivePrayerDisplay(now);

    const next=P.nextPrayer(now.getTime(),times,ymd,M);
    const gregorianText=CAL?.formatGregorian(now)||dateFormatter.format(now);
    const hijriText=CAL?.formatHijri(now)||globalThis.AL_IHSAN_KHGT?.format(now,C.timezone)||"";
    if(E.dateGregorian)E.dateGregorian.textContent=gregorianText;
    if(E.dateHijri)E.dateHijri.textContent=hijriText;
    if(E.date)E.date.setAttribute("aria-label",hijriText?`${gregorianText}; ${hijriText}`:gregorianText);
    if(E.zikirDateGregorian)E.zikirDateGregorian.textContent=gregorianText;
    if(E.zikirDateHijri)E.zikirDateHijri.textContent=hijriText;
    const clockParts=Object.fromEntries(clockFormatter.formatToParts(now).filter(part=>part.type!=="literal").map(part=>[part.type,part.value]));
    if(E.clockHM)E.clockHM.textContent=`${clockParts.hour}:${clockParts.minute}`;
    if(E.clockSec)E.clockSec.textContent=clockParts.second;
    if(E.zikirClock)E.zikirClock.textContent=`${clockParts.hour}:${clockParts.minute}`;
    for(const key of prayerKeys)if(E[key])E[key].textContent=times[key].time;
    if(E.next)E.next.textContent=String(next.label||"").replace(/^Menuju\s+/i,"").replace(/^Shubuh$/i,"Subuh");
    if(E.countdown)E.countdown.textContent=P.countdown(next.ts-now.getTime());
    if(E.status)E.status.style.background="#58f1cf";
    document.documentElement.dataset.ready="true";
  }catch(error){
    console.error("Dashboard render failed",error);
    if(E.status)E.status.style.background="#ffb158";
  }
}

async function loadDonationUnderlay(){
  if(!E.donationUnderlay||E.donationUnderlay.dataset.loaded==="true")return;
  try{
    const count=27;
    const urls=Array.from({length:count},(_,i)=>`./assets/donation-underlay-v30/part-${String(i+1).padStart(2,"0")}.b64?v=underlay-final-20260924-v30-donation-underlay`);
    const parts=await Promise.all(urls.map(async url=>{
      const response=await fetch(url,{cache:"force-cache"});
      if(!response.ok)throw new Error(`Donation asset chunk failed: ${response.status}`);
      return response.text();
    }));
    E.donationUnderlay.addEventListener("load",()=>{
      E.donationUnderlay.classList.add("ready");
      E.donationUnderlay.dataset.loaded="true";
    },{once:true});
    E.donationUnderlay.src="data:image/webp;base64,"+parts.join("");
  }catch(error){
    console.error("Donation underlay load failed",error);
    E.status.style.background="#ffb158";
  }
}

async function loadAnnouncementUnderlay(){
  if(!E.announcementUnderlay||E.announcementUnderlay.dataset.loaded==="true")return;
  try{
    const count=23;
    const urls=Array.from({length:count},(_,i)=>
      `./assets/announcement-underlay-v52/part-${String(i+1).padStart(2,"0")}.b64?v=announcement-v52-static-underlay-rotation-20260924`
    );
    const parts=await Promise.all(urls.map(async url=>{
      const response=await fetch(url,{cache:"force-cache"});
      if(!response.ok)throw new Error(`Announcement asset chunk failed: ${response.status}`);
      return response.text();
    }));
    E.announcementUnderlay.addEventListener("load",()=>{
      E.announcementUnderlay.classList.add("ready");
      E.announcementUnderlay.dataset.loaded="true";
    },{once:true});
    E.announcementUnderlay.src="data:image/webp;base64,"+parts.join("");
  }catch(error){
    console.error("Announcement underlay load failed",error);
    E.status.style.background="#ffb158";
  }
}

function sheetRows(table){
  if(!table||!Array.isArray(table.cols)||!Array.isArray(table.rows))return[];
  const headers=table.cols.map((c,i)=>String(c?.label||c?.id||`col${i}`).trim());
  return table.rows.map(row=>{
    const out={};
    headers.forEach((h,i)=>{
      const cell=row?.c?.[i];
      out[h]=cell?(cell.f??cell.v??""):"";
    });
    return out;
  });
}

function querySheet(sheetName){
  const cms=C.cms||{};
  if(!cms.spreadsheetId)return Promise.reject(new Error("CMS spreadsheet is not configured"));
  return new Promise((resolve,reject)=>{
    const callback=`__alIhsanCms_${Date.now()}_${Math.floor(Math.random()*100000)}`;
    const script=document.createElement("script");
    let finished=false;
    const cleanup=()=>{
      if(finished)return;finished=true;
      clearTimeout(timeout);delete window[callback];script.remove();
    };
    window[callback]=response=>{
      cleanup();
      if(response?.status==="error")reject(new Error("Google Sheet query returned an error"));
      else resolve(sheetRows(response?.table));
    };
    const timeout=setTimeout(()=>{cleanup();reject(new Error("Google Sheet query timeout"))},10000);
    const tqx=encodeURIComponent(`responseHandler:${callback};out:json`);
    script.src=`https://docs.google.com/spreadsheets/d/${encodeURIComponent(cms.spreadsheetId)}/gviz/tq?tqx=${tqx}&headers=1&sheet=${encodeURIComponent(sheetName)}&_=${Date.now()}`;
    script.async=true;
    script.onerror=()=>{cleanup();reject(new Error("Google Sheet is not publicly readable"))};
    document.head.appendChild(script);
  });
}

function parseMaybeDate(value,endOfDay=false){
  if(!value)return null;
  if(value instanceof Date){
    const d=new Date(value);if(endOfDay)d.setHours(23,59,59,999);return d;
  }
  const s=String(value).trim();
  let m=s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if(m){
    const d=new Date(Number(m[3]),Number(m[2])-1,Number(m[1]),Number(m[4]||0),Number(m[5]||0),0,0);
    if(endOfDay&&!m[4])d.setHours(23,59,59,999);return d;
  }
  const d=new Date(s);
  if(Number.isNaN(d.getTime()))return null;
  if(endOfDay&&s.length<=10)d.setHours(23,59,59,999);
  return d;
}

function rowActive(row,startKey="Mulai Tayang",endKey="Selesai Tayang"){
  if(String(row?.Aktif||"").trim().toUpperCase()!=="YA")return false;
  const now=Date.now(),start=parseMaybeDate(row[startKey]),end=parseMaybeDate(row[endKey],true);
  if(start&&now<start.getTime())return false;
  if(end&&now>end.getTime())return false;
  return true;
}


function minutesValue(value,fallback=0){
  const n=Number(value);
  return Number.isFinite(n)?Math.max(0,n):fallback;
}

function normalizeSheetPrayerName(value){
  const s=String(value||"").trim().toLowerCase();
  if(s==="subuh"||s==="shubuh")return"Subuh";
  if(s==="dzuhur"||s==="zuhur")return"Dzuhur";
  if(s==="ashar"||s==="asar")return"Ashar";
  if(s==="maghrib"||s==="magrib")return"Maghrib";
  if(s==="isya"||s==="isya'")return"Isya";
  if(s==="jumat"||s==="jum'at"||s==="jum’at")return"Jumat";
  return"";
}

function applyPrayerRows(rows){
  if(!Array.isArray(rows)||!rows.length)return false;
  const next=clonePrayerDefaults();
  let valid=0;
  for(const row of rows){
    const name=normalizeSheetPrayerName(row?.Sholat);
    if(!name||!next[name])continue;
    valid++;
    next[name]={
      active:String(row.Aktif||"YA").trim().toUpperCase()==="YA",
      azanMinutes:minutesValue(row["Azan (menit)"],next[name].azanMinutes),
      iqamahMinutes:minutesValue(row["Menuju Iqamah (menit)"],next[name].iqamahMinutes),
      khutbahMinutes:minutesValue(row["Khutbah Jumat (menit)"],next[name].khutbahMinutes),
      prayerMinutes:minutesValue(row["Sholat Berlangsung (menit)"],next[name].prayerMinutes),
      returnScene:String(row["Kembali Ke"]||next[name].returnScene||"dashboard").trim().toLowerCase()
    };
  }
  if(!valid)return false;
  prayerSettings=next;
  return true;
}

function secondsValue(value,fallback=0){
  const n=Number(value);
  return Number.isFinite(n)?Math.max(0,n):fallback;
}

function yesNoValue(value,fallback=true){
  const s=String(value??"").trim().toUpperCase();
  if(s==="YA")return true;
  if(s==="TIDAK")return false;
  return Boolean(fallback);
}

function applyZikirRows(rows){
  const row=Array.isArray(rows)&&rows.length?rows[0]:null;
  if(!row||!("Aktif" in row))return false;
  const base=cloneZikirDefaults();
  zikirSettings={
    enabled:yesNoValue(row.Aktif,base.enabled),
    step1Seconds:secondsValue(row["Step 1 (detik)"],base.step1Seconds),
    step2Seconds:secondsValue(row["Step 2 (detik)"],base.step2Seconds),
    step3Seconds:secondsValue(row["Step 3 (detik)"],base.step3Seconds),
    closingSeconds:secondsValue(row["Penutup (detik)"],base.closingSeconds),
    prayers:{
      Subuh:yesNoValue(row.Subuh,base.prayers.Subuh!==false),
      Dzuhur:yesNoValue(row.Dzuhur,base.prayers.Dzuhur!==false),
      Ashar:yesNoValue(row.Ashar,base.prayers.Ashar!==false),
      Maghrib:yesNoValue(row.Maghrib,base.prayers.Maghrib!==false),
      Isya:yesNoValue(row.Isya,base.prayers.Isya!==false),
      Jumat:yesNoValue(row.Jumat,base.prayers.Jumat!==false)
    }
  };
  return true;
}

function zikirEnabledFor(prayerName){
  return Boolean(zikirSettings?.enabled&&zikirSettings?.prayers?.[prayerName]!==false);
}

function normalizedRamadanLength(value,fallback=30){
  const n=Number(value);
  return n===29?29:n===30?30:(Number(fallback)===29?29:30);
}

function applyRamadanRows(rows){
  if(!Array.isArray(rows)||!rows.length)return false;
  const configRow=rows.find(r=>String(r?.Mode||"").trim().toUpperCase()==="RAMADAN")||rows[0];
  if(!configRow||!("Aktif" in configRow))return false;

  const firstRamadanDate=String(configRow["Tanggal 1 Ramadan"]||configRow["Mulai Tanggal"]||"").trim();
  const monthLength=normalizedRamadanLength(configRow["Jumlah Hari Ramadan"],C.prayerMode?.ramadanDefaults?.monthLength||30);

  ramadanSettings={
    ...C.prayerMode?.ramadanDefaults,
    active:String(configRow.Aktif||"TIDAK").trim().toUpperCase()==="YA",
    firstRamadanDate,
    monthLength,
    startDate:String(configRow["Mulai Tanggal"]||"").trim(),
    endDate:String(configRow["Selesai Tanggal"]||"").trim(),
    sermonAfterIshaMinutes:minutesValue(configRow["Ceramah Setelah Isya (menit)"],45),
    tarawihWitirMinutes:minutesValue(configRow["Tarawih & Witir (menit)"],60),
    speakerName:String(C.prayerMode?.ramadanDefaults?.speakerName||"Penceramah akan diumumkan").trim(),
    returnScene:String(configRow["Kembali Ke"]||"dashboard").trim().toLowerCase()
  };

  const firstKey=dateSettingToKey(firstRamadanDate);
  ramadanSchedule=rows.map(row=>{
    const night=Number(row["Malam Ramadan"]||row["Hari Ramadan"]||0);
    if(!Number.isInteger(night)||night<1||night>30)return null;
    const sheetDateKey=dateSettingToKey(row["Tanggal Ceramah"]);
    const derivedDateKey=firstKey?addDaysToDateKey(firstKey,night-2):"";
    return{
      night,
      dateKey:sheetDateKey||derivedDateKey,
      speakerName:String(row["Nama Penceramah"]||"").trim(),
      theme:String(row["Tema Ceramah"]||"").trim()
    };
  }).filter(Boolean).sort((a,b)=>a.night-b.night);

  return true;
}

async function loadPrayerConfig(){
  const sheets=C.cms?.sheets||{};
  const results=await Promise.allSettled([
    querySheet(sheets.prayerMode||"Mode Sholat"),
    querySheet(sheets.ramadanMode||"Mode Ramadan"),
    querySheet(sheets.postPrayerZikir||sheets.zikirMode||"Mode Zikir")
  ]);
  if(results[0].status==="fulfilled")applyPrayerRows(results[0].value);
  if(results[1].status==="fulfilled")applyRamadanRows(results[1].value);
  if(results[2].status==="fulfilled")applyZikirRows(results[2].value);
}

function localDateKey(now){
  const y=P.localYMD(now,C.timezone);
  return `${y.year}-${String(y.month).padStart(2,"0")}-${String(y.day).padStart(2,"0")}`;
}

function dateSettingToKey(value){
  const s=String(value||"").trim();
  if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;
  const d=parseMaybeDate(s);
  if(!d)return"";
  const y=P.localYMD(d,C.timezone);
  return `${y.year}-${String(y.month).padStart(2,"0")}-${String(y.day).padStart(2,"0")}`;
}

function addDaysToDateKey(key,days){
  const m=String(key||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m)return"";
  const d=new Date(Date.UTC(Number(m[1]),Number(m[2])-1,Number(m[3])+Number(days||0)));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`;
}

function dateKeyDiffDays(fromKey,toKey){
  const parse=key=>{
    const m=String(key||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m?Date.UTC(Number(m[1]),Number(m[2])-1,Number(m[3])):NaN;
  };
  const a=parse(fromKey),b=parse(toKey);
  return Number.isFinite(a)&&Number.isFinite(b)?Math.round((b-a)/86400000):NaN;
}

function ramadanNightNumber(now){
  if(!ramadanSettings?.active)return 0;
  const firstRamadanKey=dateSettingToKey(ramadanSettings.firstRamadanDate||ramadanSettings.startDate);
  if(!firstRamadanKey)return 0;

  // Malam 1 Ramadan dimulai setelah Maghrib pada tanggal Masehi sehari
  // sebelum tanggal siang 1 Ramadan. Karena mode ini berjalan setelah Isya,
  // kunci tanggal lokal sudah tepat untuk memilih jadwal malamnya.
  const firstNightKey=addDaysToDateKey(firstRamadanKey,-1);
  const currentKey=localDateKey(now);
  const offset=dateKeyDiffDays(firstNightKey,currentKey);
  if(!Number.isFinite(offset))return 0;

  const night=offset+1;
  const length=normalizedRamadanLength(ramadanSettings.monthLength,30);
  return night>=1&&night<=length?night:0;
}

function ramadanEntryFor(now,{allowPreviewFallback=false}={}){
  const length=normalizedRamadanLength(ramadanSettings?.monthLength,30);
  const currentKey=localDateKey(now);
  const exactDate=ramadanSchedule.find(item=>item.night<=length&&item.dateKey&&item.dateKey===currentKey);
  if(exactDate)return exactDate;

  const night=ramadanNightNumber(now);
  if(night){
    const exactNight=ramadanSchedule.find(item=>item.night===night);
    if(exactNight)return exactNight;
    return{night,dateKey:currentKey,speakerName:"",theme:""};
  }
  if(allowPreviewFallback){
    return ramadanSchedule.find(item=>item.night<=length&&item.speakerName)||ramadanSchedule.find(item=>item.night<=length)||null;
  }
  return null;
}

function ramadanSpeakerFor(now,{allowPreviewFallback=false}={}){
  const entry=ramadanEntryFor(now,{allowPreviewFallback});
  return String(entry?.speakerName||ramadanSettings?.speakerName||"Penceramah akan diumumkan").trim()||"Penceramah akan diumumkan";
}

function ramadanActive(now){
  return ramadanNightNumber(now)>0;
}

function phaseState(phase,prayerName,startMs,endMs){
  if(Date.now()<startMs||Date.now()>=endMs)return null;
  const labels={
    azan: prayerName==="Jumat"?"Azan Jumat sedang dikumandangkan":"Azan sedang dikumandangkan",
    iqamah:"Menuju Iqamah",
    khutbah:"Khutbah Jumat sedang berlangsung",
    dua:"Doa Setelah Azan",
    prayer:prayerName==="Jumat"?"Sholat Jumat sedang berlangsung":`Sholat ${prayerName} sedang berlangsung`,
    zikir1:"Zikir Setelah Sholat • Step 1",
    zikir2:"Zikir Setelah Sholat • Step 2",
    zikir3:"Zikir Setelah Sholat • Step 3",
    zikirEnd:"Zikir Setelah Sholat • Doa",
    ramadanSermon:"Ceramah Ramadan sedang berlangsung",
    tarawih:"Sholat Tarawih & Witir sedang berlangsung"
  };
  const messages={
    azan:"Mohon menjaga ketenangan dan bersiap untuk sholat berjamaah.",
    iqamah:"Mari bersiap menuju sholat berjamaah. Rapikan dan luruskan saf serta senyapkan ponsel.",
    khutbah:"Mohon tenang, dengarkan khutbah Jumat, dan senyapkan ponsel.",
    dua:"Mari membaca doa setelah azan bersama-sama.",
    prayer:"Sholat sedang berlangsung. Mohon menjaga ketenangan dan tidak melintas di area jamaah.",
    zikir1:"Lanjutkan dengan zikir setelah sholat.",
    zikir2:"Lanjutkan dengan zikir setelah sholat.",
    zikir3:"Lanjutkan dengan zikir setelah sholat.",
    zikirEnd:"Akhiri rangkaian zikir dengan doa.",
    ramadanSermon:"Ceramah Ramadan sedang berlangsung. Mohon menyimak dan menjaga ketenangan.",
    tarawih:"Sholat Tarawih dan Witir sedang berlangsung. Mohon menjaga ketenangan."
  };
  return{phase,prayerName,startMs,endMs,title:labels[phase],message:messages[phase]};
}

function getPrayerModeState(now,times){
  if(!C.prayerMode?.enabled)return null;
  const isFriday=new Intl.DateTimeFormat("en-US",{timeZone:C.timezone,weekday:"short"}).format(now)==="Fri";
  const events=[
    ["Subuh",times.shubuh.ts],
    [isFriday?"Jumat":"Dzuhur",times.dzuhur.ts],
    ["Ashar",times.ashar.ts],
    ["Maghrib",times.maghrib.ts],
    ["Isya",times.isya.ts]
  ];
  const nowMs=now.getTime();

  for(const [name,start] of events){
    const cfg=prayerSettings[name];
    if(!cfg?.active)continue;
    let t=start, state=null;

    let end=t+cfg.azanMinutes*60000;
    if(nowMs>=t&&nowMs<end)return phaseState("azan",name,t,end);
    t=end;

    // Doa setelah azan adalah fase penuh 3 menit dan tidak mengurangi jeda iqamah/khutbah.
    const duaMinutes=minutesValue(C.prayerMode?.postAzanDuaMinutes,3);
    end=t+duaMinutes*60000;
    if(nowMs>=t&&nowMs<end)return phaseState("dua",name,t,end);
    t=end;

    if(name==="Jumat"){
      end=t+cfg.khutbahMinutes*60000;
      if(nowMs>=t&&nowMs<end)return phaseState("khutbah",name,t,end);
      t=end;
    }else{
      end=t+cfg.iqamahMinutes*60000;
      if(nowMs>=t&&nowMs<end)return phaseState("iqamah",name,t,end);
      t=end;
    }

    end=t+cfg.prayerMinutes*60000;
    if(nowMs>=t&&nowMs<end)return phaseState("prayer",name,t,end);
    t=end;

    if(zikirEnabledFor(name)){
      end=t+secondsValue(zikirSettings.step1Seconds,45)*1000;
      if(nowMs>=t&&nowMs<end)return phaseState("zikir1",name,t,end);
      t=end;

      end=t+secondsValue(zikirSettings.step2Seconds,75)*1000;
      if(nowMs>=t&&nowMs<end)return phaseState("zikir2",name,t,end);
      t=end;

      end=t+secondsValue(zikirSettings.step3Seconds,90)*1000;
      if(nowMs>=t&&nowMs<end)return phaseState("zikir3",name,t,end);
      t=end;

      end=t+secondsValue(zikirSettings.closingSeconds,10)*1000;
      if(nowMs>=t&&nowMs<end)return phaseState("zikirEnd",name,t,end);
      t=end;
    }

    if(name==="Isya"&&ramadanActive(now)){
      end=t+minutesValue(ramadanSettings.sermonAfterIshaMinutes,45)*60000;
      if(nowMs>=t&&nowMs<end)return phaseState("ramadanSermon","Ramadan",t,end);
      t=end;

      end=t+minutesValue(ramadanSettings.tarawihWitirMinutes,60)*60000;
      if(nowMs>=t&&nowMs<end)return phaseState("tarawih","Ramadan",t,end);
    }
  }
  return null;
}

function prayerAdvice(state){
  if(state.phase==="azan")return["Jaga ketenangan masjid","Orang tua dampingi anak-anak","Senyapkan ponsel"];
  if(state.phase==="dua")return["Baca doa bersama","Bimbing anak-anak untuk menghafal doa","Tetap tenang menunggu "+(state.prayerName==="Jumat"?"khutbah":"iqamah")];
  if(state.phase==="khutbah")return["Silakan isi saf depan yang kosong terlebih dahulu","Dengarkan khutbah dengan tenang","Senyapkan ponsel"];
  if(state.phase==="iqamah")return["Isi saf depan terlebih dahulu","Rapatkan dan luruskan saf","Senyapkan ponsel"];
  if(state.phase==="prayer")return["Mohon menjaga ketenangan","Tidak melintas di depan jamaah","Jaga anak-anak agar tidak mengganggu"];
  if(state.phase==="ramadanSermon")return["Simak ceramah dengan tenang","Orang tua dampingi anak-anak","Senyapkan ponsel"];
  if(state.phase==="tarawih")return["Mohon menjaga ketenangan","Rapatkan dan luruskan saf","Jaga anak-anak agar tidak mengganggu"];
  return["Jaga ketenangan masjid","Dampingi anak-anak","Senyapkan ponsel"];
}

function adviceIconType(text=""){
  const t=String(text||"").toLowerCase();
  if(/baca doa|doa bersama/.test(t))return "dua";
  if(/isi saf depan|saf depan/.test(t))return "frontsaf";
  if(/rapatkan|luruskan saf/.test(t))return "saf";
  if(/tetap tenang|menunggu iqamah|menunggu khutbah/.test(t))return "waiting";
  if(/khutbah|ceramah|simak|dengarkan/.test(t))return "listen";
  if(/tidak melintas|melintas di depan/.test(t))return "nocross";
  if(/anak/.test(t))return "parent";
  if(/ponsel|telepon|hp/.test(t))return "phone";
  return "quiet";
}

function applyPrayerAdviceIcons(advice){
  const refs=[
    [E.prayerAdviceItem1,advice?.[0]],
    [E.prayerAdviceItem2,advice?.[1]],
    [E.prayerAdviceItem3,advice?.[2]]
  ];
  refs.forEach(([el,txt])=>{
    if(el)el.dataset.icon=adviceIconType(txt);
  });
}

function renderPrayerMode(state,now){
  if(!state)return;
  const remaining=Math.max(0,state.endMs-now.getTime());
  if(E.prayerScene)E.prayerScene.dataset.phase=state.phase;
  const titles={
    azan:"SAATNYA AZAN\nDIKUMANDANGKAN",
    dua:"DOA SETELAH AZAN",
    iqamah:"MENUJU IQAMAH",
    khutbah:"KHUTBAH JUMAT",
    prayer:"SAATNYA SHOLAT\nBERLANGSUNG",
    ramadanSermon:"CERAMAH RAMADAN",
    tarawih:"TARAWIH & WITIR"
  };
  if(E.prayerTitle)E.prayerTitle.textContent=titles[state.phase]||state.title||"";
  if(E.prayerName)E.prayerName.textContent=state.phase==="ramadanSermon"?"MENJELANG TARAWIH & WITIR":state.phase==="tarawih"?"RAMADAN":String(state.prayerName||"").toUpperCase();
  const showRamadanSpeaker=state.phase==="ramadanSermon";
  if(E.prayerRamadanSpeaker)E.prayerRamadanSpeaker.hidden=!showRamadanSpeaker;
  if(E.prayerRamadanSpeakerName&&showRamadanSpeaker)E.prayerRamadanSpeakerName.textContent=ramadanSpeakerFor(now,{allowPreviewFallback:prayerPreviewEnabled});
  if(E.prayerCountdown)E.prayerCountdown.textContent=P.countdown(remaining);
  if(E.prayerMessage)E.prayerMessage.textContent=state.message;
  if(E.prayerDuaCard)E.prayerDuaCard.hidden=state.phase!=="dua";
  const advice=prayerAdvice(state);
  if(E.prayerAdvice1)E.prayerAdvice1.textContent=advice[0];
  if(E.prayerAdvice2)E.prayerAdvice2.textContent=advice[1];
  if(E.prayerAdvice3)E.prayerAdvice3.textContent=advice[2];
  applyPrayerAdviceIcons(advice);
}

function shortCountdown(ms){
  const total=Math.max(0,Math.ceil(ms/1000));
  const m=Math.floor(total/60),s=total%60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function renderZikir(state,now){
  if(!state||!E.zikirScene)return;
  const phase=state.phase;
  const step=phase==="zikir1"?"1":phase==="zikir2"?"2":"3";
  const closing=phase==="zikirEnd";
  E.zikirScene.dataset.step=step;
  E.zikirScene.classList.toggle("is-closing",closing);
  const remaining=Math.max(0,state.endMs-now.getTime());
  if(E.zikirStepCountdown){
    E.zikirStepCountdown.textContent=closing?`DOA • ${shortCountdown(remaining)}`:`SISA • ${shortCountdown(remaining)}`;
  }
}

function getZikirPreviewState(now){
  if(!zikirPreviewEnabled)return null;
  let step=String(previewQuery.get("step")||"1").trim().toLowerCase();
  const phase=step==="2"?"zikir2":step==="3"?"zikir3":step==="end"?"zikirEnd":"zikir1";
  const duration=phase==="zikir1"?secondsValue(zikirSettings.step1Seconds,45):
    phase==="zikir2"?secondsValue(zikirSettings.step2Seconds,75):
    phase==="zikir3"?secondsValue(zikirSettings.step3Seconds,90):
    secondsValue(zikirSettings.closingSeconds,10);
  if(!zikirPreviewEndMs||now.getTime()>=zikirPreviewEndMs){
    zikirPreviewEndMs=now.getTime()+Math.max(1,duration)*1000;
  }
  return phaseState(phase,"Subuh",now.getTime()-1000,zikirPreviewEndMs);
}

function getPrayerPreviewState(now){
  if(!prayerPreviewEnabled)return null;
  const prayerName=normalizeSheetPrayerName(previewQuery.get("sholat"))||"Maghrib";
  let phase=String(previewQuery.get("phase")||"iqamah").trim().toLowerCase();
  const normalizedPhase={
    ramadansermon:"ramadanSermon",
    zikir1:"zikir1",
    zikir2:"zikir2",
    zikir3:"zikir3",
    zikirend:"zikirEnd"
  }[phase]||phase;
  phase=normalizedPhase;
  if(prayerName==="Jumat"&&phase==="iqamah")phase="khutbah";
  const allowed=["azan","dua","iqamah","khutbah","prayer","ramadanSermon","tarawih",...PRAYER_MODE_ZIKIR_PHASES];
  if(!allowed.includes(phase))phase=prayerName==="Jumat"?"khutbah":"iqamah";
  if(prayerName!=="Jumat"&&phase==="khutbah")phase="iqamah";

  const cfg=prayerSettings[prayerName]||{};
  let durationMs;
  if(isPrayerModeZikirPhase(phase)){
    const seconds=
      phase==="zikir1"?secondsValue(zikirSettings.step1Seconds,45):
      phase==="zikir2"?secondsValue(zikirSettings.step2Seconds,75):
      phase==="zikir3"?secondsValue(zikirSettings.step3Seconds,90):
      secondsValue(zikirSettings.closingSeconds,10);
    durationMs=Math.max(1,seconds)*1000;
  }else{
    const minutes=
      phase==="azan"?minutesValue(cfg.azanMinutes,3):
      phase==="dua"?minutesValue(C.prayerMode?.postAzanDuaMinutes,3):
      phase==="khutbah"?minutesValue(cfg.khutbahMinutes,30):
      phase==="prayer"?minutesValue(cfg.prayerMinutes,10):
      phase==="ramadanSermon"?minutesValue(ramadanSettings.sermonAfterIshaMinutes,45):
      phase==="tarawih"?minutesValue(ramadanSettings.tarawihWitirMinutes,60):
      minutesValue(cfg.iqamahMinutes,10);
    durationMs=Math.max(1,minutes)*60000;
  }

  if(!prayerPreviewEndMs||now.getTime()>=prayerPreviewEndMs){
    prayerPreviewEndMs=now.getTime()+durationMs;
  }
  return phaseState(phase,prayerName,now.getTime()-1000,prayerPreviewEndMs);
}

function updatePrayerMode(now,times){
  const zikirPreviewState=getZikirPreviewState(now);
  if(zikirPreviewState){
    prayerModeActive=true;activePrayerState=zikirPreviewState;
    prayerModeSignature=`preview:${zikirPreviewState.phase}`;
    clearTimeout(sceneTimerId);
    if(currentScene!=="zikir")setScene("zikir");
    renderZikir(zikirPreviewState,now);
    return zikirPreviewState;
  }

  const previewState=getPrayerPreviewState(now);
  if(previewState){
    prayerModeActive=true;activePrayerState=previewState;
    prayerModeSignature=`preview:${previewState.phase}:${previewState.prayerName}`;
    clearTimeout(sceneTimerId);
    if(isPrayerModeZikirPhase(previewState.phase)){
      if(currentScene!=="zikir")setScene("zikir");
      renderZikir(previewState,now);
    }else{
      if(currentScene!=="prayer")setScene("prayer");
      renderPrayerMode(previewState,now);
    }
    return previewState;
  }

  const state=getPrayerModeState(now,times);
  if(state){
    prayerModeActive=true;activePrayerState=state;
    const configuredReturn=state.prayerName==="Ramadan"?ramadanSettings?.returnScene:prayerSettings?.[state.prayerName]?.returnScene;
    if(["dashboard","announcement","donation"].includes(configuredReturn))lastPrayerReturnScene=configuredReturn;
    const sig=`${state.phase}:${state.prayerName}:${state.startMs}`;
    prayerModeSignature=sig;
    clearTimeout(sceneTimerId);
    if(isPrayerModeZikirPhase(state.phase)){
      if(currentScene!=="zikir")setScene("zikir");
      renderZikir(state,now);
    }else{
      if(currentScene!=="prayer")setScene("prayer");
      renderPrayerMode(state,now);
    }
    return state;
  }

  if(prayerModeActive||currentScene==="prayer"||currentScene==="zikir"){
    prayerModeActive=false;prayerModeSignature="";activePrayerState=null;
    setScene(lastPrayerReturnScene||C.rotation?.startScene||"dashboard");
    scheduleSceneRotation();
  }
  return null;
}

function refreshActivePrayerDisplay(now){
  if(!activePrayerState)return;
  if(isPrayerModeZikirPhase(activePrayerState.phase))renderZikir(activePrayerState,now);
  else renderPrayerMode(activePrayerState,now);
}

function priorityRank(value){
  const k=String(value||"NORMAL").toUpperCase();
  return k==="DARURAT"?0:k==="UTAMA"?1:2;
}

function renderAnnouncement(index=announcementIndex){
  const fallback={Prioritas:"",Kategori:"",Judul:"","Isi Pengumuman":"","Waktu Kegiatan":"",Lokasi:""};
  const list=announcements.length?announcements:[fallback];
  announcementIndex=((index%list.length)+list.length)%list.length;
  const item=list[announcementIndex];
  const priority=String(item.Prioritas||"NORMAL").toUpperCase();
  E.annPriority.textContent=priority==="DARURAT"?"PENGUMUMAN DARURAT":priority==="UTAMA"?"PENGUMUMAN UTAMA":String(item.Kategori||"").toUpperCase();
  E.annPriority.className="announcement-priority";
  if(priority==="DARURAT")E.annPriority.classList.add("priority-darurat");
  if(priority==="UTAMA")E.annPriority.classList.add("priority-utama");
  E.annTitle.textContent=String(item.Judul||"");
  E.annBody.textContent=String(item["Isi Pengumuman"]||"");
  E.annTime.textContent=String(item["Waktu Kegiatan"]||item.Kategori||"");
  E.annLocation.textContent=String(item.Lokasi||"");
  E.annPager.textContent=announcements.length?`${announcementIndex+1} / ${list.length}`:"";
  E.announcementMain.classList.toggle("has-content",Boolean(E.annTitle.textContent||E.annBody.textContent));
  const imageUrl=String(item["Gambar URL"]||"").trim();
  if(imageUrl){
    E.annImage.src=imageUrl;E.annImage.hidden=false;E.announcementMain.classList.add("has-image");
  }else{
    E.annImage.removeAttribute("src");E.annImage.hidden=true;E.announcementMain.classList.remove("has-image");
  }
  const titleLen=E.annTitle.textContent.length,bodyLen=E.annBody.textContent.length;
  E.annTitle.style.fontSize=titleLen>62?"48px":titleLen>44?"56px":titleLen>30?"61px":"67px";
  E.annBody.style.fontSize=bodyLen>520?"27px":bodyLen>380?"30px":bodyLen>250?"33px":bodyLen>150?"36px":"38px";
}

function renderAgenda(){
  E.annAgenda.replaceChildren();
  const list=agendaItems.slice(0,4);
  if(!list.length){
    return;
  }
  for(const item of list){
    const row=document.createElement("div");row.className="announcement-agenda-item";
    const time=document.createElement("div");time.className="announcement-agenda-time";time.textContent=String(item["Waktu Mulai"]||item["Hari/Tanggal"]||"—");
    const detail=document.createElement("div");
    const name=document.createElement("div");name.className="announcement-agenda-name";name.textContent=String(item["Nama Kegiatan"]||"Kegiatan Masjid");
    if(String(item.Status||"").toUpperCase()==="SEDANG BERLANGSUNG"){
      const badge=document.createElement("span");badge.className="announcement-agenda-badge";badge.textContent="SEDANG";name.appendChild(badge);
    }
    const sub=document.createElement("div");sub.className="announcement-agenda-sub";
    sub.textContent=[item["Hari/Tanggal"],item.Lokasi].filter(Boolean).join(" • ");
    detail.append(name,sub);row.append(time,detail);E.annAgenda.appendChild(row);
  }
}

function renderWisdom(){
  const item=wisdomItems[0];
  if(!item){
    E.annWisdom.textContent="Memakmurkan masjid merupakan bagian dari amal orang beriman.";
    E.annWisdomSource.textContent="QS. At-Taubah: 18";return;
  }
  E.annWisdom.textContent=String(item["Terjemahan / Ringkasan"]||item.Teks||"");
  E.annWisdomSource.textContent=String(item.Sumber||"");
}

function scheduleAnnouncementRotation(){
  clearTimeout(announcementTimerId);
  if(currentScene!=="announcement"||announcements.length<=1)return;
  const item=announcements[announcementIndex];
  const seconds=Math.max(8,Math.min(60,Number(item?.["Durasi (detik)"])||20));
  announcementTimerId=setTimeout(()=>{
    announcementIndex=(announcementIndex+1)%announcements.length;
    renderAnnouncement(announcementIndex);scheduleAnnouncementRotation();
  },seconds*1000);
}

async function loadCms(){
  const cms=C.cms||{},sheets=cms.sheets||{};
  try{
    const [ann,agenda,wisdom]=await Promise.all([
      querySheet(sheets.announcements||"Pengumuman Utama"),
      querySheet(sheets.agenda||"Agenda Kegiatan"),
      querySheet(sheets.wisdom||"Pesan Hikmah")
    ]);
    announcements=ann.filter(row=>rowActive(row)).sort((a,b)=>priorityRank(a.Prioritas)-priorityRank(b.Prioritas));
    agendaItems=agenda.filter(row=>rowActive(row)).sort((a,b)=>{
      const sa=String(a.Status||"").toUpperCase()==="SEDANG BERLANGSUNG"?0:1;
      const sb=String(b.Status||"").toUpperCase()==="SEDANG BERLANGSUNG"?0:1;
      return sa-sb+(Number(a.Urutan||999)-Number(b.Urutan||999));
    });
    wisdomItems=wisdom.filter(row=>rowActive(row)).sort((a,b)=>Number(a.Urutan||999)-Number(b.Urutan||999));
    announcementIndex=Math.min(announcementIndex,Math.max(0,announcements.length-1));
    renderAnnouncement();renderAgenda();renderWisdom();
    if(E.cmsState){E.cmsState.textContent="CMS ONLINE";E.cmsState.classList.add("online");E.cmsState.classList.remove("offline")}
    scheduleAnnouncementRotation();
  }catch(error){
    console.warn("Announcement CMS sync unavailable",error);
    if(E.cmsState){E.cmsState.textContent="CMS LOKAL";E.cmsState.classList.add("offline");E.cmsState.classList.remove("online")}
    renderAnnouncement();renderAgenda();renderWisdom();
  }
}

function scheduleCmsRefresh(){
  clearTimeout(cmsTimerId);
  cmsTimerId=setTimeout(async()=>{
    await Promise.allSettled([loadCms(),loadPrayerConfig()]);
    recoverPrayerSchedule("config-refresh");
    scheduleCmsRefresh();
  },C.cms?.refreshMs||60000);
}

function setScene(scene){
  const allowed=["dashboard","donation","announcement","prayer","zikir"];
  currentScene=allowed.includes(scene)?scene:"dashboard";
  E.stage.classList.toggle("scene-dashboard",currentScene==="dashboard");
  E.stage.classList.toggle("scene-donation",currentScene==="donation");
  E.stage.classList.toggle("scene-announcement",currentScene==="announcement");
  E.stage.classList.toggle("scene-prayer",currentScene==="prayer");
  E.stage.classList.toggle("scene-zikir",currentScene==="zikir");
  if(E.donation)E.donation.setAttribute("aria-hidden",currentScene==="donation"?"false":"true");
  if(E.announcement)E.announcement.setAttribute("aria-hidden",currentScene==="announcement"?"false":"true");
  if(E.prayerScene)E.prayerScene.setAttribute("aria-hidden",currentScene==="prayer"?"false":"true");
  if(E.zikirScene)E.zikirScene.setAttribute("aria-hidden",currentScene==="zikir"?"false":"true");
  if(currentScene==="announcement"){renderAnnouncement();renderAgenda();renderWisdom();scheduleAnnouncementRotation()}
  else clearTimeout(announcementTimerId);
}

function sceneDuration(scene){
  const R=C.rotation||{};
  if(scene==="donation")return R.donationMs||30000;
  if(scene==="announcement")return R.announcementMs||60000;
  return R.dashboardMs||45000;
}

function scheduleSceneRotation(){
  clearTimeout(sceneTimerId);
  if(prayerModeActive||currentScene==="prayer"||currentScene==="zikir")return;
  const params=new URLSearchParams(location.search);
  const forced=params.get("scene");
  if(["dashboard","donation","announcement","zikir"].includes(forced)){setScene(forced);return}
  const seq=Array.isArray(C.rotation?.sequence)&&C.rotation.sequence.length?C.rotation.sequence:["dashboard","donation"];
  sceneTimerId=setTimeout(()=>{
    const idx=Math.max(0,seq.indexOf(currentScene));
    setScene(seq[(idx+1)%seq.length]);scheduleSceneRotation();
  },sceneDuration(currentScene));
}

function prayerEventsFor(ymd,times){
  const reference=new Date(times.dzuhur.ts);
  const isFriday=new Intl.DateTimeFormat("en-US",{timeZone:C.timezone,weekday:"short"}).format(reference)==="Fri";
  return[
    ["Subuh",times.shubuh.ts],
    [isFriday?"Jumat":"Dzuhur",times.dzuhur.ts],
    ["Ashar",times.ashar.ts],
    ["Maghrib",times.maghrib.ts],
    ["Isya",times.isya.ts]
  ];
}

function dailyTimesForYMD(ymd){
  if(cachedYmd&&cachedTimes&&cachedYmd.year===ymd.year&&cachedYmd.month===ymd.month&&cachedYmd.day===ymd.day)return cachedTimes;
  return P.calculate(ymd,M);
}

function nextPrayerActivationAfter(now){
  const nowMs=now.getTime();
  const base=P.localYMD(now,C.timezone);
  for(let offset=0;offset<=2;offset++){
    const ymd=CAL?.addDays?CAL.addDays(base,offset):(()=>{
      const d=new Date(Date.UTC(base.year,base.month-1,base.day+offset,12));
      return{year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate()};
    })();
    const times=dailyTimesForYMD(ymd);
    for(const [name,startMs] of prayerEventsFor(ymd,times)){
      if(startMs>nowMs&&prayerSettings[name]?.active)return{name,startMs,ymd};
    }
  }
  return null;
}

function armPrayerSchedule(targetMs,reason="scheduled"){
  clearTimeout(prayerScheduleTimerId);
  if(!Number.isFinite(targetMs))return;
  const remaining=targetMs-Date.now();
  const delay=Math.max(20,Math.min(MAX_SCHEDULE_DELAY_MS,remaining+25));
  prayerScheduleTimerId=setTimeout(()=>recoverPrayerSchedule(reason),delay);
}

function recoverPrayerSchedule(reason="recovery"){
  try{
    clearTimeout(prayerScheduleTimerId);
    const now=new Date();
    const{times}=getDailyTimes(now);

    // Satu evaluasi pada event penting: startup, timer, resume, focus, online,
    // atau setelah konfigurasi berubah. Tidak ada polling waktu sholat.
    const state=updatePrayerMode(now,times);
    if(state){
      armPrayerSchedule(state.endMs,"phase-transition");
      return state;
    }

    const next=nextPrayerActivationAfter(now);
    if(next)armPrayerSchedule(next.startMs,"prayer-start");
    return null;
  }catch(error){
    console.error("Prayer scheduler recovery failed",reason,error);
    if(E.status)E.status.style.background="#ffb158";
    // Retry jarang hanya jika recovery benar-benar gagal.
    prayerScheduleTimerId=setTimeout(()=>recoverPrayerSchedule("error-retry"),60000);
    return null;
  }
}

function scheduleNextTick(){
  clearTimeout(timerId);
  const delay=1000-(Date.now()%1000)+20;
  timerId=setTimeout(()=>{render();scheduleNextTick()},delay);
}

function init(){
  fit();loadDonationUnderlay();loadAnnouncementUnderlay();
  const params=new URLSearchParams(location.search),forced=params.get("scene");
  setScene(["dashboard","donation","announcement","prayer","zikir"].includes(forced)?forced:(C.rotation?.startScene||"dashboard"));
  render();renderAnnouncement();renderAgenda();renderWisdom();
  scheduleNextTick();recoverPrayerSchedule("startup");scheduleSceneRotation();
  Promise.allSettled([loadCms(),loadPrayerConfig()]).finally(()=>{
    recoverPrayerSchedule("config-loaded");
    scheduleCmsRefresh();
  });

  addEventListener("resize",fit,{passive:true});
  addEventListener("orientationchange",fit,{passive:true});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden){fit();recoverPrayerSchedule("visibility");render();loadCms();loadPrayerConfig()}});
  addEventListener("pageshow",()=>{recoverPrayerSchedule("pageshow");render()},{passive:true});
  addEventListener("focus",()=>{recoverPrayerSchedule("focus")},{passive:true});
  addEventListener("online",()=>{recoverPrayerSchedule("online");loadPrayerConfig()},{passive:true});

  if("serviceWorker"in navigator){
    navigator.serviceWorker.getRegistrations().then(registrations=>Promise.all(registrations.map(registration=>registration.unregister()))).catch(error=>console.warn("Service worker cleanup failed",error));
  }
}

addEventListener("error",()=>{E.status.style.background="#ffb158"});
addEventListener("unhandledrejection",()=>{E.status.style.background="#ffb158"});
init();
})();
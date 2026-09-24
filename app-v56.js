(()=>{"use strict";
const C=window.AL_IHSAN_CONFIG,P=window.AL_IHSAN_PRAYER,M=C.prayerMethod;
const $=id=>document.getElementById(id);
const E={
  stage:$("stage"),donation:$("donationScene"),donationUnderlay:$("donationUnderlay"),
  announcement:$("announcementScene"),announcementUnderlay:$("announcementUnderlay"),announcementMain:$("announcementMainCard"),
  annPriority:$("announcementPriority"),annTitle:$("announcementTitle"),annBody:$("announcementBody"),
  annTime:$("announcementTime"),annLocation:$("announcementLocation"),annImage:$("announcementImage"),
  annPager:$("announcementPager"),annAgenda:$("announcementAgendaList"),annWisdom:$("announcementWisdom"),
  annWisdomSource:$("announcementWisdomSource"),cmsState:$("announcementCmsState"),
  prayerScene:$("prayerScene"),prayerEyebrow:$("prayerModeEyebrow"),prayerTitle:$("prayerModeTitle"),
  prayerName:$("prayerModePrayer"),prayerCountdown:$("prayerModeCountdown"),prayerMessage:$("prayerModeMessage"),
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
let prayerModeActive=false,prayerModeSignature="";

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
    const next=P.nextPrayer(now.getTime(),times,ymd,M);
    const gregorianText=dateFormatter.format(now);
    const hijriText=globalThis.AL_IHSAN_KHGT?.format(now,C.timezone)||"";
    if(E.dateGregorian)E.dateGregorian.textContent=gregorianText;
    if(E.dateHijri)E.dateHijri.textContent=hijriText;
    if(E.date)E.date.setAttribute("aria-label",hijriText?`${gregorianText}; ${hijriText}`:gregorianText);
    const clockParts=Object.fromEntries(clockFormatter.formatToParts(now).filter(part=>part.type!=="literal").map(part=>[part.type,part.value]));
    E.clockHM.textContent=`${clockParts.hour}:${clockParts.minute}`;
    E.clockSec.textContent=clockParts.second;
    for(const key of prayerKeys)E[key].textContent=times[key].time;
    E.next.textContent=String(next.label||"").replace(/^Menuju\s+/i,"").replace(/^Shubuh$/i,"Subuh");
    E.countdown.textContent=P.countdown(next.ts-now.getTime());
    updatePrayerMode(now,times);
    E.status.style.background="#58f1cf";
    document.documentElement.dataset.ready="true";
  }catch(error){
    console.error("Dashboard render failed",error);
    E.status.style.background="#ffb158";
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

function applyRamadanRows(rows){
  const row=Array.isArray(rows)?rows.find(r=>String(r?.Mode||"RAMADAN").toUpperCase()==="RAMADAN")||rows[0]:null;
  if(!row||!("Aktif" in row))return false;
  ramadanSettings={
    ...C.prayerMode?.ramadanDefaults,
    active:String(row.Aktif||"TIDAK").trim().toUpperCase()==="YA",
    startDate:String(row["Mulai Tanggal"]||"").trim(),
    endDate:String(row["Selesai Tanggal"]||"").trim(),
    sermonAfterIshaMinutes:minutesValue(row["Ceramah Setelah Isya (menit)"],45),
    tarawihWitirMinutes:minutesValue(row["Tarawih & Witir (menit)"],60),
    returnScene:String(row["Kembali Ke"]||"dashboard").trim().toLowerCase()
  };
  return true;
}

async function loadPrayerConfig(){
  const sheets=C.cms?.sheets||{};
  const results=await Promise.allSettled([
    querySheet(sheets.prayerMode||"Mode Sholat"),
    querySheet(sheets.ramadanMode||"Mode Ramadan")
  ]);
  if(results[0].status==="fulfilled")applyPrayerRows(results[0].value);
  if(results[1].status==="fulfilled")applyRamadanRows(results[1].value);
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

function ramadanActive(now){
  if(!ramadanSettings?.active)return false;
  const key=localDateKey(now);
  const start=dateSettingToKey(ramadanSettings.startDate);
  const end=dateSettingToKey(ramadanSettings.endDate);
  if(start&&key<start)return false;
  if(end&&key>end)return false;
  return true;
}

function phaseState(phase,prayerName,startMs,endMs){
  if(Date.now()<startMs||Date.now()>=endMs)return null;
  const labels={
    azan: prayerName==="Jumat"?"Azan Jumat sedang dikumandangkan":"Azan sedang dikumandangkan",
    iqamah:"Menuju Iqamah",
    khutbah:"Khutbah Jumat sedang berlangsung",
    prayer:prayerName==="Jumat"?"Sholat Jumat sedang berlangsung":`Sholat ${prayerName} sedang berlangsung`,
    ramadanSermon:"Ceramah Ramadan sedang berlangsung",
    tarawih:"Sholat Tarawih & Witir sedang berlangsung"
  };
  const messages={
    azan:"Mohon menjaga ketenangan dan bersiap untuk sholat berjamaah.",
    iqamah:"Mari bersiap menuju sholat berjamaah. Rapikan dan luruskan saf serta senyapkan ponsel.",
    khutbah:"Mohon tenang, dengarkan khutbah Jumat, dan senyapkan ponsel.",
    prayer:"Sholat sedang berlangsung. Mohon menjaga ketenangan dan tidak melintas di area jamaah.",
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

function renderPrayerMode(state,now){
  if(!state)return;
  const remaining=Math.max(0,state.endMs-now.getTime());
  E.prayerEyebrow.textContent=state.phase==="khutbah"?"JUMAT":state.phase==="ramadanSermon"||state.phase==="tarawih"?"RAMADAN":"MODE SHOLAT";
  E.prayerTitle.textContent=state.title;
  E.prayerName.textContent=state.phase==="ramadanSermon"?"Menjelang Tarawih & Witir":state.phase==="tarawih"?"Ramadan":state.prayerName;
  E.prayerCountdown.textContent=P.countdown(remaining);
  E.prayerMessage.textContent=state.message;
}

function updatePrayerMode(now,times){
  const state=getPrayerModeState(now,times);
  if(state){
    prayerModeActive=true;
    const sig=`${state.phase}:${state.prayerName}:${state.startMs}`;
    prayerModeSignature=sig;
    clearTimeout(sceneTimerId);
    if(currentScene!=="prayer")setScene("prayer");
    renderPrayerMode(state,now);
    return;
  }
  if(prayerModeActive||currentScene==="prayer"){
    prayerModeActive=false;prayerModeSignature="";
    setScene("dashboard");
    scheduleSceneRotation();
  }
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
    scheduleCmsRefresh();
  },C.cms?.refreshMs||60000);
}

function setScene(scene){
  const allowed=["dashboard","donation","announcement","prayer"];
  currentScene=allowed.includes(scene)?scene:"dashboard";
  E.stage.classList.toggle("scene-dashboard",currentScene==="dashboard");
  E.stage.classList.toggle("scene-donation",currentScene==="donation");
  E.stage.classList.toggle("scene-announcement",currentScene==="announcement");
  E.stage.classList.toggle("scene-prayer",currentScene==="prayer");
  if(E.donation)E.donation.setAttribute("aria-hidden",currentScene==="donation"?"false":"true");
  if(E.announcement)E.announcement.setAttribute("aria-hidden",currentScene==="announcement"?"false":"true");
  if(E.prayerScene)E.prayerScene.setAttribute("aria-hidden",currentScene==="prayer"?"false":"true");
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
  if(prayerModeActive||currentScene==="prayer")return;
  const params=new URLSearchParams(location.search);
  const forced=params.get("scene");
  if(["dashboard","donation","announcement"].includes(forced)){setScene(forced);return}
  const seq=Array.isArray(C.rotation?.sequence)&&C.rotation.sequence.length?C.rotation.sequence:["dashboard","donation"];
  sceneTimerId=setTimeout(()=>{
    const idx=Math.max(0,seq.indexOf(currentScene));
    setScene(seq[(idx+1)%seq.length]);scheduleSceneRotation();
  },sceneDuration(currentScene));
}

function scheduleNextTick(){
  clearTimeout(timerId);
  const delay=1000-(Date.now()%1000)+20;
  timerId=setTimeout(()=>{render();scheduleNextTick()},delay);
}

function init(){
  fit();loadDonationUnderlay();loadAnnouncementUnderlay();
  const params=new URLSearchParams(location.search),forced=params.get("scene");
  setScene(["dashboard","donation","announcement"].includes(forced)?forced:(C.rotation?.startScene||"dashboard"));
  render();renderAnnouncement();renderAgenda();renderWisdom();
  scheduleNextTick();scheduleSceneRotation();
  Promise.allSettled([loadCms(),loadPrayerConfig()]).finally(scheduleCmsRefresh);

  addEventListener("resize",fit,{passive:true});
  addEventListener("orientationchange",fit,{passive:true});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden){fit();render();loadCms();loadPrayerConfig()}});

  if("serviceWorker"in navigator){
    navigator.serviceWorker.getRegistrations().then(registrations=>Promise.all(registrations.map(registration=>registration.unregister()))).catch(error=>console.warn("Service worker cleanup failed",error));
  }
}

addEventListener("error",()=>{E.status.style.background="#ffb158"});
addEventListener("unhandledrejection",()=>{E.status.style.background="#ffb158"});
init();
})();
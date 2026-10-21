(()=>{"use strict";
const DRIVE_BASE_PRIMARY="https://drive.google.com/uc?export=download&id=";
const DRIVE_BASE_FALLBACK="https://drive.usercontent.google.com/download?id=";
const TTS=Object.freeze({
  "05":"17YGcjHQTyguYvqbcqjbLhoYtVLh8r13h",
  "06":"11VkwxLhqn1p_NLqlp9isCUdVOsIEopZI",
  "07":"14Egsk_ZmBzSC0lRoITG5FF-0HUS4YUsu",
  "08":"1ZMabyJeRvLpZsdo3hHLyw4jfjHqwshDB",
  "09":"1M50Sly0Jw9Gtcpg5-al0A5oXcbs6ql7V",
  "10":"181X6AHZjRFFfleviGu1fwBJvGOrPgYVm",
  "11":"1LoNWqK0lv9OxXsGPhJVTZa7d5qN-feQR",
  "12":"13EKVrXJB7caA6L0crGm-Oiac72yVG-m0",
  "13":"1c0Eu1s7XcWNbZwNbZ1QGftZmzC3hq0Xf",
  "14":"1IccqToOOInp4i6drbLNN-PDWXbx8Onix",
  "15":"11JEhXNGt66LSp8CjDDhIIyqllgAPl1wN",
  "16":"1tri4AndYnMMNY7qkNb1xkfVjZNFXkKA_",
  "17":"1WFd2FOb6CKJ57RCR-jU-ZerZ3ytpth-b",
  "18":"1nou0VvtA0MsbijcbFTaE8acNfe7IOh24",
  "19":"189nVN0M26_CovtDo-8H8u_dgHlYPhX4C",
  "20":"10RGdZDuLQ2-pFw83-gzI2w227JGqlNmB",
  "21":"1e6zTOCDPHOtS4hvtAV4AKyT5CsnSY-yA",
  "22":"1OV5ckszmt8A1E53wVZIwMtre0FX0Aq1h",
  "23":"1z36Nohv9NrgfsryXg29W4F1z8m1tNbDz",
  "24":"1X5iCCE3f9YI5UTToittXiuh-wjVJD3V3",
  "25":"1XAy2pGty9vXoBBaQPnb3bJ9qt0hHDPR2"
});
const TILAWAH=Object.freeze({
  "SUBUH-01":"1eyF4ZphZc-wbFDBbPrAT5VNUixlIS1pj",
  "SUBUH-02":"1d05_JuLsic2SmN-ck6bmpfuYqBiL5h0y",
  "SUBUH-03":"1CHnRfnN0GRPaJP2CWeaGmn3_w5cEuDuT",
  "ZUHUR-01":"1E9ecJpS8vd1ISKSZyPy0rRwrfgD--1CC",
  "ZUHUR-02":"1yugZtpa0MfoJBLZ9Uz3Y3bEY0T3fjqHZ",
  "ZUHUR-03":"1WsBcrkutHVo4yNS9UZSLtGgLQgsLvPsW",
  "ASAR-01":"1zKHi8mPURuj71VOmdLGa_aW67wqvWwX7",
  "ASAR-02":"1vMnP5VSPYQX6xxd0zD2ZPVQ1uL5g9j86",
  "ASAR-03":"1aV5d_5QT218CiAR6yOuFz6NJFsSmUhsi",
  "MAGRIB-01":"1OuijgMA_aZKDXzU76b2dgt-SXKBc1G9a",
  "MAGRIB-02":"1rPYfp16QM5DSkZEOY52Gb_DUmkZIfhWO",
  "MAGRIB-03":"1n1xgDvnfgt70I_YBXsXDJQWsEDHUrmpO",
  "ISYA-01":"1AvOkTylz1nqTyRwRZlzcnpkodSnvBoRO",
  "ISYA-02":"149VHNVJlgbsCJtcrqyizW1vuYqXO0QVY",
  "ISYA-03":"1ELa8rzRYz3qudMGx-pHrCf8nj6UYm-0W",
  "JUMAT-01":"1fcggSnH8nhXdv-h-0hcS7qfosd0Egopz",
  "JUMAT-02":"1UjOwMJkKox0Zjn84UTo-0KlefxatL82q",
  "JUMAT-03":"1JS2bfHaGasR4S_RcXxZ71u6EfROu2atD"
});
const params=new URLSearchParams(location.search);
const TEST_PRAYER_RAW=String(params.get("preazanTest")||"").trim();
const TEST_PRAYER_MAP=Object.freeze({
  "subuh":"Subuh","shubuh":"Subuh",
  "dzuhur":"Dzuhur","zuhur":"Dzuhur",
  "ashar":"Ashar","asar":"Ashar",
  "maghrib":"Maghrib","magrib":"Maghrib",
  "isya":"Isya",
  "jumat":"Jumat","jum'at":"Jumat","jum’at":"Jumat"
});
const TEST_PRAYER=TEST_PRAYER_MAP[TEST_PRAYER_RAW.toLowerCase()]||"";
const TEST_MODE=Boolean(TEST_PRAYER);

const audio=new Audio();
audio.preload="auto";
audio.autoplay=false;
audio.loop=false;
audio.playsInline=true;
audio.volume=1;
let activeKey="",stopTimer=0,token=0,lastState=null,sourceAttempt=0,activeBlobUrl="";

function driveIdForState(state){
  if(!state||!state.item)return"";
  const id=String(state.item.id||"");
  return state.kind==="tilawah"?TILAWAH[id]:TTS[id];
}
function sourcesForState(state){
  if(!state||!state.item)return[];
  const id=String(state.item.id||"");
  const driveId=driveIdForState(state);
  const local="./assets/pre-azan-audio/"+encodeURIComponent(id)+".mp3?v=preazan-local-v114-20261021";
  if(!driveId)return[local];
  const enc=encodeURIComponent(driveId);
  return[
    local,
    DRIVE_BASE_PRIMARY+enc,
    DRIVE_BASE_FALLBACK+enc+"&export=download&confirm=t"
  ];
}
function srcForState(state){
  return sourcesForState(state)[0]||"";
}
function stop(reason="stop"){
  token++;
  clearTimeout(stopTimer);stopTimer=0;
  activeKey="";
  try{audio.pause();audio.removeAttribute("src");audio.load()}catch(_){}\n  if(activeBlobUrl){try{URL.revokeObjectURL(activeBlobUrl)}catch(_){} activeBlobUrl="";}
  setAudioStatus(reason==="silence"?"silence":"idle");
}
function scheduleHardStop(endMs,currentToken){
  clearTimeout(stopTimer);
  const ms=Math.max(0,Number(endMs)-Date.now());
  stopTimer=setTimeout(()=>{if(currentToken===token)stop("segment-end")},ms+50);
}
function seekFromSchedule(state,currentToken){
  const offset=Math.max(0,(Date.now()-Number(state.startMs||Date.now()))/1000);
  if(offset<0.25)return;
  const apply=()=>{
    if(currentToken!==token)return;
    if(Number.isFinite(audio.duration)&&audio.duration>0){
      audio.currentTime=Math.min(offset,Math.max(0,audio.duration-0.15));
    }else{
      try{audio.currentTime=offset}catch(_){}
    }
  };
  if(audio.readyState>=1)apply();
  else audio.addEventListener("loadedmetadata",apply,{once:true});
}
function fallbackSrcForState(state){
  if(!state||!state.item)return"";
  const id=String(state.item.id||"");
  const driveId=state.kind==="tilawah"?TILAWAH[id]:TTS[id];
  return driveId?DRIVE_BASE_FALLBACK+encodeURIComponent(driveId):"";
}
async function prepareSource(src){
  if(!String(src||"").startsWith("./assets/pre-azan-audio/"))return src;
  const response=await fetch(src,{cache:"no-store"});
  if(!response.ok)throw new Error("LOCAL_HTTP_"+response.status);
  const buffer=await response.arrayBuffer();
  if(buffer.byteLength<2048)throw new Error("LOCAL_AUDIO_TOO_SMALL");
  const blob=new Blob([buffer],{type:"audio/mpeg"});
  if(activeBlobUrl){try{URL.revokeObjectURL(activeBlobUrl)}catch(_){}}
  activeBlobUrl=URL.createObjectURL(blob);
  return activeBlobUrl;
}

async function playState(state){
  if(!state||state.kind==="silence"||!state.item){
    stop("silence");return;
  }
  lastState=state;
  const sources=sourcesForState(state);
  const key=`${state.prayerName}:${state.kind}:${state.itemKey||state.item.id}:${state.startMs}`;
  if(!sources.length){console.error("Pre-azan audio source missing",state);stop("missing");return}
  if(key===activeKey&&!audio.paused)return;

  stop("replace");
  activeKey=key;
  const currentToken=token;
  audio.dataset.itemKey=state.itemKey||"";
  audio.dataset.prayer=state.prayerName||"";
  audio.dataset.kind=state.kind||"";
  scheduleHardStop(state.endMs,currentToken);

  for(let i=0;i<sources.length;i++){
    if(currentToken!==token)return;
    sourceAttempt=i;
    const src=sources[i];
    try{
      setAudioStatus(i===0?"loading":"retry-fallback",i===0?"":`source-${i+1}`);
      audio.pause();
      const playableSrc=await prepareSource(src);
      if(currentToken!==token)return;
      audio.src=playableSrc;
      audio.load();
      seekFromSchedule(state,currentToken);
      await audio.play();
      if(currentToken!==token)return;
      setAudioStatus("playing");
      return;
    }catch(error){
      if(currentToken!==token)return;
      const name=String(error?.name||"");
      if(name==="NotAllowedError"){
        setAudioStatus("blocked",name);
        console.error("Pre-azan autoplay blocked by browser.",error);
        return;
      }
      console.warn(`Pre-azan audio source ${i+1} failed`,name||error);
      if(i===sources.length-1){
        setAudioStatus("media-error",name||error?.message||"unsupported-source");
        console.error("All pre-azan audio sources failed.",error);
      }
    }
  }
}

addEventListener("al-ihsan:pre-azan-audio-status",event=>{
  const status=String(event.detail?.status||"");
  if(!TEST_MODE){
    if(status==="blocked")ensureAudioBlockedNotice();
    else if(status==="playing"||status==="silence"||status==="idle")clearAudioBlockedNotice();
  }
  const hud=document.getElementById("preAzanTestHud");
  if(!hud)return;
  let line=hud.querySelector("#preAzanAudioStatus");
  if(!line){
    line=document.createElement("div");
    line.id="preAzanAudioStatus";
    line.style.cssText="font-size:15px;margin-top:8px;font-weight:700;letter-spacing:.03em";
    hud.appendChild(line);
  }
  const d=event.detail||{};
  line.textContent="AUDIO: "+String(d.status||"").toUpperCase()+(d.error?" • "+d.error:"");
  let btn=hud.querySelector("#preAzanEnableAudio");
  if(d.status==="blocked"){
    if(!btn){
      btn=document.createElement("button");
      btn.id="preAzanEnableAudio";
      btn.textContent="AKTIFKAN SUARA";
      btn.style.cssText="margin-top:10px;padding:10px 16px;border:0;border-radius:8px;font-weight:800;font-size:16px";
      btn.onclick=()=>{
        if(lastState)playState(lastState);
        btn.remove();
      };
      hud.appendChild(btn);
    }
  }else if(btn){
    btn.remove();
  }
});

function sync(state){
  if(TEST_MODE)return;
  playState(state||window.AL_IHSAN_PRE_AZAN_STATE||null);
}

function createTestHud(){
  const box=document.createElement("div");
  box.id="preAzanTestHud";
  Object.assign(box.style,{
    position:"fixed",left:"22px",bottom:"22px",zIndex:"99999",
    minWidth:"420px",maxWidth:"760px",padding:"18px 22px",
    borderRadius:"14px",background:"rgba(0,25,28,.94)",color:"#fff",
    font:"600 22px/1.35 system-ui,sans-serif",boxShadow:"0 8px 30px rgba(0,0,0,.35)"
  });
  box.innerHTML='<div style="font-size:14px;letter-spacing:.12em;opacity:.75">MODE UJI PRA-AZAN</div><div id="preAzanTestTitle" style="font-size:28px;margin-top:4px"></div><div id="preAzanTestInfo" style="font-size:18px;margin-top:6px;font-weight:500;opacity:.9"></div>';
  document.body.appendChild(box);
  return{
    box,
    title:box.querySelector("#preAzanTestTitle"),
    info:box.querySelector("#preAzanTestInfo")
  };
}
function testLabel(state){
  if(!state)return"SELESAI";
  if(state.kind==="tilawah")return"TILAWAH";
  if(state.kind==="message")return"HADIS / PESAN";
  if(state.kind==="intro")return"PENGANTAR PRA-AZAN";
  if(state.kind==="silence")return"HENING — MENUNGGU AZAN LIVE";
  return String(state.kind||"").toUpperCase();
}
function runPreAzanTest(){
  if(!TEST_MODE||!window.AL_IHSAN_PRE_AZAN)return;
  const PRE=window.AL_IHSAN_PRE_AZAN;
  const now=Date.now();
  const sel=PRE.selectionFor(new Date(),TEST_PRAYER);
  if(!sel)return;
  const hud=createTestHud();
  document.documentElement.dataset.preAzanTest=TEST_PRAYER.toLowerCase();

  const spec=TEST_PRAYER==="Jumat"?[
    ["tilawah",sel.tilawah,60],
    ["message",sel.messages[0],45],
    ["message",sel.messages[1],45],
    ["intro",sel.intro,45],
    ["silence",null,30]
  ]:[
    ["tilawah",sel.tilawah,60],
    ["message",sel.messages[0],60],
    ["intro",sel.intro,45],
    ["silence",null,30]
  ];

  let cursor=now+2000;
  const states=spec.map(([kind,item,seconds])=>{
    const startMs=cursor,endMs=startMs+seconds*1000;
    cursor=endMs;
    return{kind,item,itemKey:item?.key||"",startMs,endMs,prayerName:TEST_PRAYER,azanMs:cursor};
  });
  const testEnd=cursor;
  const timers=[];
  const apply=state=>{
    window.AL_IHSAN_PRE_AZAN_TEST_STATE=state;
    hud.title.textContent=`${TEST_PRAYER} • ${testLabel(state)}`;
    hud.info.textContent=state?.item?(state.item.name||state.item.file||state.item.id):"Audio dihentikan. Azan tetap live oleh muazin.";
    playState(state);
  };
  states.forEach(state=>{
    timers.push(setTimeout(()=>apply(state),Math.max(0,state.startMs-Date.now())));
  });
  const ticker=setInterval(()=>{
    const state=window.AL_IHSAN_PRE_AZAN_TEST_STATE;
    if(!state)return;
    const left=Math.max(0,Math.ceil((state.endMs-Date.now())/1000));
    hud.title.textContent=`${TEST_PRAYER} • ${testLabel(state)} • ${Math.floor(left/60)}:${String(left%60).padStart(2,"0")}`;
  },250);
  timers.push(setTimeout(()=>{
    clearInterval(ticker);
    stop("test-end");
    window.AL_IHSAN_PRE_AZAN_TEST_STATE=null;
    hud.title.textContent=`${TEST_PRAYER} • UJI SELESAI`;
    hud.info.textContent="Seluruh audio berhenti. Tidak ada rekaman azan.";
    document.documentElement.dataset.preAzanTest="done";
  },Math.max(0,testEnd-Date.now()+150)));
}

addEventListener("al-ihsan:pre-azan-change",event=>sync(event.detail));
document.addEventListener("visibilitychange",()=>{if(!document.hidden)sync(window.AL_IHSAN_PRE_AZAN_STATE)});
addEventListener("pageshow",()=>sync(window.AL_IHSAN_PRE_AZAN_STATE),{passive:true});
addEventListener("focus",()=>sync(window.AL_IHSAN_PRE_AZAN_STATE),{passive:true});
const unlockFromGesture=()=>{
  const state=lastState||window.AL_IHSAN_PRE_AZAN_STATE||null;
  if(state)playState(state);
};
addEventListener("pointerdown",unlockFromGesture,{passive:true});
addEventListener("keydown",unlockFromGesture,{passive:true});
addEventListener("beforeunload",()=>stop("unload"));
if(TEST_MODE){
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",runPreAzanTest,{once:true});
  else runPreAzanTest();
}
window.AL_IHSAN_PRE_AZAN_AUDIO=Object.freeze({
  version:"pre-azan-audio-v114",
  ttsDriveIds:TTS,
  tilawahDriveIds:TILAWAH,
  srcForState,
  stop:()=>stop("manual"),
  element:audio
});
})();
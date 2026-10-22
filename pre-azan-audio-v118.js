(()=>{"use strict";
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

const audio=document.createElement("audio");
audio.id="preAzanAudio";
audio.preload="auto";
audio.autoplay=false;
audio.loop=false;
audio.controls=false;
audio.playsInline=true;
audio.setAttribute("playsinline","");
audio.setAttribute("webkit-playsinline","");
audio.volume=1;
audio.style.cssText="position:fixed;width:1px;height:1px;opacity:.001;pointer-events:none;left:-10px;bottom:-10px";
(document.body||document.documentElement).appendChild(audio);
let activeKey="",stopTimer=0,token=0,lastState=null,sourceAttempt=0,webAudioContext=null,webAudioSource=null;

function setAudioStatus(status,detail=""){
  const payload={
    status:String(status||""),
    error:String(detail||""),
    muted:Boolean(audio.muted),
    volume:Number(audio.volume),
    paused:Boolean(audio.paused),
    readyState:Number(audio.readyState||0),
    currentSrc:String(audio.currentSrc||audio.src||"")
  };
  try{dispatchEvent(new CustomEvent("al-ihsan:pre-azan-audio-status",{detail:payload}))}
  catch(error){console.warn("Pre-azan audio status dispatch failed",error)}
}
function clearAudioBlockedNotice(){
  document.getElementById("preAzanBlockedNotice")?.remove();
}
function ensureAudioBlockedNotice(){
  let box=document.getElementById("preAzanBlockedNotice");
  if(box)return box;
  box=document.createElement("button");
  box.id="preAzanBlockedNotice";
  box.type="button";
  box.textContent="AKTIFKAN SUARA PRA-AZAN";
  box.style.cssText="position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:100000;padding:14px 20px;border:2px solid #f2cf75;border-radius:12px;background:rgba(95,18,18,.96);color:#fff;font:800 17px/1.2 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.4)";
  box.onclick=async()=>{
    audio.muted=false;
    audio.defaultMuted=false;
    audio.volume=1;
    if(webAudioContext?.state==="suspended"){
      try{await webAudioContext.resume()}catch(_){}
    }
    const state=lastState||window.AL_IHSAN_PRE_AZAN_STATE||window.AL_IHSAN_PRE_AZAN_TEST_STATE||null;
    if(state)playState(state);
  };
  document.body.appendChild(box);
  return box;
}
function forceAudibleElement(){
  audio.muted=false;
  audio.defaultMuted=false;
  audio.volume=1;
  audio.removeAttribute("muted");
}
forceAudibleElement();
audio.addEventListener("volumechange",()=>{
  if(audio.muted||audio.volume<0.99)forceAudibleElement();
});

function localSrcForState(state){
  if(!state||!state.item)return"";
  const id=String(state.item.id||"").trim();
  if(!id)return"";
  return new URL("./assets/pre-azan-audio/"+encodeURIComponent(id)+".mp3?v=preazan-direct-v118-20261022",document.baseURI).href;
}
function sourcesForState(state){
  const local=localSrcForState(state);
  return local?[local]:[];
}
function srcForState(state){
  return localSrcForState(state);
}
function stop(reason="stop"){
  token++;
  clearTimeout(stopTimer);stopTimer=0;
  activeKey="";
  try{audio.pause();audio.removeAttribute("src");audio.load()}catch(_){}
  if(webAudioSource){try{webAudioSource.stop()}catch(_){} webAudioSource=null;}
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
      try{audio.currentTime=Math.min(offset,Math.max(0,audio.duration-0.15))}catch(_){}
    }
  };
  if(audio.readyState>=1)apply();
  else audio.addEventListener("loadedmetadata",apply,{once:true});
}
function waitForPlayable(currentToken,timeoutMs=8000){
  return new Promise((resolve,reject)=>{
    if(currentToken!==token)return reject(new Error("STALE_TOKEN"));
    if(audio.readyState>=2)return resolve();
    let done=false;
    const cleanup=()=>{
      audio.removeEventListener("canplay",onReady);
      audio.removeEventListener("loadeddata",onReady);
      audio.removeEventListener("error",onError);
      clearTimeout(timer);
    };
    const onReady=()=>{if(done)return;done=true;cleanup();resolve()};
    const onError=()=>{if(done)return;done=true;const code=audio.error?.code||0;cleanup();reject(new Error("MEDIA_ERROR_"+code))};
    const timer=setTimeout(()=>{if(done)return;done=true;cleanup();reject(new Error("MEDIA_LOAD_TIMEOUT"))},timeoutMs);
    audio.addEventListener("canplay",onReady,{once:true});
    audio.addEventListener("loadeddata",onReady,{once:true});
    audio.addEventListener("error",onError,{once:true});
  });
}
async function playViaWebAudio(src,state,currentToken){
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx)throw new Error("WEB_AUDIO_UNAVAILABLE");
  if(!webAudioContext)webAudioContext=new AudioCtx();
  if(webAudioContext.state==="suspended"){
    try{await webAudioContext.resume()}catch(_){}
  }
  if(webAudioContext.state==="suspended")throw Object.assign(new Error("WEB_AUDIO_BLOCKED"),{name:"NotAllowedError"});
  const response=await fetch(src,{cache:"no-store"});
  if(!response.ok)throw new Error("LOCAL_HTTP_"+response.status);
  const buffer=await response.arrayBuffer();
  if(buffer.byteLength<2048)throw new Error("LOCAL_AUDIO_TOO_SMALL");
  let decoded;
  try{decoded=await webAudioContext.decodeAudioData(buffer.slice(0))}
  catch(error){throw new Error("WEB_AUDIO_DECODE_FAILED:"+String(error?.message||error||"unknown"))}
  if(currentToken!==token)return;
  if(webAudioSource){try{webAudioSource.stop()}catch(_){} webAudioSource=null;}
  const source=webAudioContext.createBufferSource();
  source.buffer=decoded;
  source.connect(webAudioContext.destination);
  webAudioSource=source;
  const offset=Math.max(0,(Date.now()-Number(state.startMs||Date.now()))/1000);
  const safeOffset=Math.min(offset,Math.max(0,decoded.duration-0.15));
  source.onended=()=>{if(webAudioSource===source)webAudioSource=null};
  source.start(0,safeOffset);
  setAudioStatus("playing","web-audio");
}
async function playState(state){
  if(!state||state.kind==="silence"||!state.item){stop("silence");return;}
  lastState=state;
  const src=localSrcForState(state);
  const key=`${state.prayerName}:${state.kind}:${state.itemKey||state.item.id}:${state.startMs}`;
  if(!src){console.error("Pre-azan local source missing",state);stop("missing");return}
  if(key===activeKey&&!audio.paused)return;

  stop("replace");
  activeKey=key;
  const currentToken=token;
  sourceAttempt=0;
  audio.dataset.itemKey=state.itemKey||"";
  audio.dataset.prayer=state.prayerName||"";
  audio.dataset.kind=state.kind||"";
  scheduleHardStop(state.endMs,currentToken);

  try{
    forceAudibleElement();
    setAudioStatus("loading","html-audio");
    audio.src=src;
    audio.load();
    await waitForPlayable(currentToken);
    if(currentToken!==token)return;
    seekFromSchedule(state,currentToken);
    await audio.play();
    if(currentToken!==token)return;
    forceAudibleElement();
    setAudioStatus("playing","html-audio");
    return;
  }catch(error){
    if(currentToken!==token)return;
    const name=String(error?.name||"");
    const detail=name||String(error?.message||error||"unknown");
    console.warn("HTML Audio pra-azan gagal; mencoba Web Audio.",detail);
    try{audio.pause();audio.removeAttribute("src");audio.load()}catch(_){}
    try{
      sourceAttempt=1;
      setAudioStatus("retry-fallback","web-audio");
      await playViaWebAudio(src,state,currentToken);
      if(currentToken!==token)return;
      return;
    }catch(webError){
      if(currentToken!==token)return;
      const webName=String(webError?.name||"");
      const webDetail=webName||String(webError?.message||webError||"unknown");
      if(name==="NotAllowedError"||webName==="NotAllowedError"){
        setAudioStatus("blocked",webDetail||detail);
        console.error("Pre-azan autoplay blocked.",webError);
      }else{
        setAudioStatus("media-error",`${detail} / ${webDetail}`);
        console.error("Kedua mesin audio pra-azan gagal.",{src,html:detail,web:webDetail});
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
  version:"pre-azan-audio-v118",
  srcForState,
  stop:()=>stop("manual"),
  element:audio
});
})();
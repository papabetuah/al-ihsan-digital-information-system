(function audioModule(){
  "use strict";
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
  const IDLE_PRIME_ID="05";
  const AUTO_RETRY_MS=1200;

  const audio=document.createElement("audio");
  audio.id="preAzanAudio";
  audio.preload="auto";
  audio.autoplay=true;
  audio.loop=true;
  audio.controls=false;
  audio.playsInline=true;
  audio.muted=true;
  audio.defaultMuted=true;
  audio.volume=1;
  audio.setAttribute("autoplay","");
  audio.setAttribute("muted","");
  audio.setAttribute("playsinline","");
  audio.setAttribute("webkit-playsinline","");
  audio.style.cssText="position:fixed;width:1px;height:1px;opacity:.001;pointer-events:none;left:-10px;bottom:-10px";
  (document.body||document.documentElement).appendChild(audio);

  let activeKey="",stopTimer=0,retryTimer=0,token=0,lastState=null,primedId="";
  let webAudioContext=null,webAudioSource=null;

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

  function srcForId(id){
    const key=String(id||"").trim();
    if(!key)return"";
    return new URL("./assets/pre-azan-audio/"+encodeURIComponent(key)+".mp3?v=preazan-autoprime-v119-20261022",document.baseURI).href;
  }
  function localSrcForState(state){return state?.item?srcForId(state.item.id):""}
  function srcForState(state){return localSrcForState(state)}

  function clearTimers(){
    clearTimeout(stopTimer);stopTimer=0;
    clearTimeout(retryTimer);retryTimer=0;
  }
  function stopWebAudio(){
    if(webAudioSource){try{webAudioSource.stop()}catch(_){} webAudioSource=null;}
  }
  function primeMode(){
    audio.loop=true;
    audio.muted=true;
    audio.defaultMuted=true;
    audio.volume=1;
    audio.setAttribute("muted","");
  }
  function audibleMode(){
    audio.loop=false;
    audio.muted=false;
    audio.defaultMuted=false;
    audio.volume=1;
    audio.removeAttribute("muted");
  }
  function fullyStop(reason="idle"){
    token++;
    clearTimers();
    activeKey="";
    primedId="";
    stopWebAudio();
    try{audio.pause();audio.removeAttribute("src");audio.load()}catch(_){}
    setAudioStatus(reason==="silence"?"silence":"idle");
  }
  function scheduleHardStop(endMs,currentToken){
    clearTimeout(stopTimer);
    const ms=Math.max(0,Number(endMs)-Date.now());
    stopTimer=setTimeout(()=>{if(currentToken===token)fullyStop("segment-end")},ms+60);
  }
  function desiredOffset(state){
    return Math.max(0,(Date.now()-Number(state.startMs||Date.now()))/1000);
  }
  function setScheduledOffset(state,currentToken){
    const offset=desiredOffset(state);
    const apply=()=>{
      if(currentToken!==token)return;
      if(Number.isFinite(audio.duration)&&audio.duration>0){
        try{audio.currentTime=Math.min(offset,Math.max(0,audio.duration-0.15))}catch(_){}
      }else{
        try{audio.currentTime=offset}catch(_){}
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

  async function primeMedia(id,status="gap"){
    const src=srcForId(id);
    if(!src)return;
    const currentToken=++token;
    clearTimers();
    stopWebAudio();
    activeKey="prime:"+String(id);
    primedId=String(id);
    primeMode();
    try{
      const current=String(audio.currentSrc||audio.src||"");
      if(current!==src){
        audio.src=src;
        audio.load();
      }
      try{audio.currentTime=0}catch(_){}
      await audio.play();
      if(currentToken!==token)return;
      setAudioStatus(status,status==="gap"?"next-file-primed":"media-session-primed");
    }catch(error){
      if(currentToken!==token)return;
      setAudioStatus(status+"-prime-error",String(error?.name||error?.message||error||"unknown"));
    }
  }

  async function primeIdleAutoplay(){
    if(TEST_MODE&&window.AL_IHSAN_PRE_AZAN_TEST_STATE)return;
    const live=window.AL_IHSAN_PRE_AZAN_STATE;
    if(live)return;
    await primeMedia(IDLE_PRIME_ID,"primed-idle");
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
    stopWebAudio();
    const source=webAudioContext.createBufferSource();
    source.buffer=decoded;
    source.connect(webAudioContext.destination);
    webAudioSource=source;
    const offset=Math.min(desiredOffset(state),Math.max(0,decoded.duration-0.15));
    source.onended=()=>{if(webAudioSource===source)webAudioSource=null};
    source.start(0,offset);
    setAudioStatus("playing","web-audio");
  }

  function armAutoRetry(state,currentToken){
    clearTimeout(retryTimer);
    const remaining=Number(state.endMs)-Date.now();
    if(currentToken!==token||remaining<=500)return;
    retryTimer=setTimeout(()=>{
      if(currentToken!==token)return;
      if(Date.now()>=Number(state.endMs))return;
      activeKey="";
      playState(state);
    },Math.min(AUTO_RETRY_MS,Math.max(250,remaining-200)));
  }

  async function warmForAutomaticRetry(state,currentToken){
    if(currentToken!==token)return;
    const id=String(state.item?.id||"");
    const src=srcForId(id);
    if(!src)return;
    try{
      primeMode();
      const current=String(audio.currentSrc||audio.src||"");
      if(current!==src){
        audio.src=src;
        audio.load();
      }
      try{audio.currentTime=0}catch(_){}
      await audio.play();
      if(currentToken===token)primedId=id;
    }catch(_){}
  }

  async function playMediaState(state){
    lastState=state;
    const id=String(state.item?.id||"").trim();
    const src=srcForId(id);
    const key=state.prayerName+":"+state.kind+":"+(state.itemKey||id)+":"+state.startMs;
    if(!src){fullyStop("missing");return}
    if(key===activeKey&&!audio.paused&&!audio.muted)return;

    const wasPrimed=primedId===id&&!audio.paused;
    const currentToken=++token;
    clearTimers();
    stopWebAudio();
    activeKey=key;
    audio.dataset.itemKey=state.itemKey||"";
    audio.dataset.prayer=state.prayerName||"";
    audio.dataset.kind=state.kind||"";
    scheduleHardStop(state.endMs,currentToken);

    try{
      const current=String(audio.currentSrc||audio.src||"");
      if(!wasPrimed||current!==src){
        primeMode();
        audio.src=src;
        audio.load();
        await waitForPlayable(currentToken);
        if(currentToken!==token)return;
      }
      setScheduledOffset(state,currentToken);
      audibleMode();
      await audio.play();
      if(currentToken!==token)return;
      setAudioStatus("playing",wasPrimed?"primed-html-audio":"html-audio");
      return;
    }catch(error){
      if(currentToken!==token)return;
      const htmlName=String(error?.name||"");
      const htmlDetail=htmlName||String(error?.message||error||"unknown");
      try{
        setAudioStatus("retry-fallback","web-audio");
        await playViaWebAudio(src,state,currentToken);
        if(currentToken!==token)return;
        return;
      }catch(webError){
        if(currentToken!==token)return;
        const webName=String(webError?.name||"");
        const webDetail=webName||String(webError?.message||webError||"unknown");
        const blocked=htmlName==="NotAllowedError"||webName==="NotAllowedError";
        if(blocked){
          setAudioStatus("autoplay-retry",htmlDetail+" / "+webDetail);
          await warmForAutomaticRetry(state,currentToken);
          armAutoRetry(state,currentToken);
        }else{
          setAudioStatus("media-error",htmlDetail+" / "+webDetail);
          console.error("Kedua mesin audio pra-azan gagal.",{src,html:htmlDetail,web:webDetail});
        }
      }
    }
  }

  function playState(state){
    if(!state){
      lastState=null;
      primeIdleAutoplay();
      return;
    }
    if(state.kind==="gap"){
      lastState=state;
      primeMedia(state.item?.id,"gap");
      return;
    }
    if(state.kind==="silence"||!state.item){
      lastState=state;
      fullyStop("silence");
      return;
    }
    playMediaState(state);
  }

  addEventListener("al-ihsan:pre-azan-audio-status",event=>{
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
    return{box,title:box.querySelector("#preAzanTestTitle"),info:box.querySelector("#preAzanTestInfo")};
  }
  function testLabel(state){
    if(!state)return"SELESAI";
    if(state.kind==="gap")return"JEDA 2 DETIK";
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

    const media=TEST_PRAYER==="Jumat"?[
      ["tilawah",sel.tilawah,60],
      ["message",sel.messages[0],45],
      ["message",sel.messages[1],45],
      ["intro",sel.intro,45]
    ]:[
      ["tilawah",sel.tilawah,60],
      ["message",sel.messages[0],60],
      ["intro",sel.intro,45]
    ];
    let cursor=now+250;
    const states=[];
    for(const [kind,item,seconds] of media){
      states.push({kind:"gap",item,itemKey:item?.key||"",startMs:cursor,endMs:cursor+2000,prayerName:TEST_PRAYER});
      cursor+=2000;
      states.push({kind,item,itemKey:item?.key||"",startMs:cursor,endMs:cursor+seconds*1000,prayerName:TEST_PRAYER});
      cursor+=seconds*1000;
    }
    states.push({kind:"silence",item:null,itemKey:"",startMs:cursor,endMs:cursor+30000,prayerName:TEST_PRAYER});
    cursor+=30000;
    const testEnd=cursor;
    states.forEach(s=>s.azanMs=testEnd);

    const timers=[];
    const apply=state=>{
      window.AL_IHSAN_PRE_AZAN_TEST_STATE=state;
      hud.title.textContent=TEST_PRAYER+" • "+testLabel(state);
      hud.info.textContent=state.kind==="gap"
        ?"Menyiapkan otomatis: "+(state.item?.name||state.item?.file||state.item?.id||"audio berikutnya")
        :state.item?(state.item.name||state.item.file||state.item.id):"Audio dihentikan. Azan tetap live oleh muazin.";
      playState(state);
    };
    states.forEach(state=>{
      timers.push(setTimeout(()=>apply(state),Math.max(0,state.startMs-Date.now())));
    });
    const ticker=setInterval(()=>{
      const state=window.AL_IHSAN_PRE_AZAN_TEST_STATE;
      if(!state)return;
      const left=Math.max(0,Math.ceil((state.endMs-Date.now())/1000));
      hud.title.textContent=TEST_PRAYER+" • "+testLabel(state)+" • "+Math.floor(left/60)+":"+String(left%60).padStart(2,"0");
    },250);
    timers.push(setTimeout(()=>{
      clearInterval(ticker);
      fullyStop("test-end");
      window.AL_IHSAN_PRE_AZAN_TEST_STATE=null;
      hud.title.textContent=TEST_PRAYER+" • UJI SELESAI";
      hud.info.textContent="Seluruh audio berhenti. Tidak ada rekaman azan.";
      document.documentElement.dataset.preAzanTest="done";
    },Math.max(0,testEnd-Date.now()+150)));
  }

  addEventListener("al-ihsan:pre-azan-change",event=>sync(event.detail));
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)sync(window.AL_IHSAN_PRE_AZAN_STATE)});
  addEventListener("pageshow",()=>sync(window.AL_IHSAN_PRE_AZAN_STATE),{passive:true});
  addEventListener("focus",()=>sync(window.AL_IHSAN_PRE_AZAN_STATE),{passive:true});
  addEventListener("beforeunload",()=>fullyStop("unload"));

  const boot=()=>{
    if(TEST_MODE)runPreAzanTest();
    else primeIdleAutoplay();
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();

  window.AL_IHSAN_PRE_AZAN_AUDIO=Object.freeze({
    version:"pre-azan-audio-v119",
    autoplayPriming:true,
    gapSeconds:2,
    srcForState,
    prime:primeIdleAutoplay,
    stop:()=>fullyStop("manual"),
    element:audio
  });
})();
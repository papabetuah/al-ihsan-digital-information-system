(()=>{"use strict";
const DRIVE_BASE="https://drive.google.com/uc?export=download&id=";
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
const audio=new Audio();
audio.preload="auto";
audio.autoplay=false;
audio.loop=false;
audio.playsInline=true;
audio.volume=1;
let activeKey="",stopTimer=0,token=0;

function srcForState(state){
  if(!state||!state.item)return"";
  const id=String(state.item.id||"");
  const driveId=state.kind==="tilawah"?TILAWAH[id]:TTS[id];
  return driveId?DRIVE_BASE+encodeURIComponent(driveId):"";
}
function stop(reason="stop"){
  token++;
  clearTimeout(stopTimer);stopTimer=0;
  activeKey="";
  try{audio.pause();audio.removeAttribute("src");audio.load()}catch(_){}
  document.documentElement.dataset.preAzanAudio=reason==="silence"?"silence":"idle";
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
async function playState(state){
  if(!state||state.kind==="silence"||!state.item){
    stop("silence");return;
  }
  const src=srcForState(state);
  const key=`${state.prayerName}:${state.kind}:${state.itemKey||state.item.id}:${state.startMs}`;
  if(!src){console.error("Pre-azan audio source missing",state);stop("missing");return}
  if(key===activeKey&&!audio.paused)return;
  stop("replace");
  activeKey=key;
  const currentToken=token;
  audio.src=src;
  audio.dataset.itemKey=state.itemKey||"";
  audio.dataset.prayer=state.prayerName||"";
  audio.dataset.kind=state.kind||"";
  seekFromSchedule(state,currentToken);
  scheduleHardStop(state.endMs,currentToken);
  try{
    await audio.play();
    if(currentToken!==token)return;
    document.documentElement.dataset.preAzanAudio="playing";
  }catch(error){
    if(currentToken!==token)return;
    document.documentElement.dataset.preAzanAudio="blocked";
    console.error("Pre-azan audio play failed. Ensure Drive audio is publicly readable and autoplay is allowed.",error);
  }
}
function sync(state){playState(state||window.AL_IHSAN_PRE_AZAN_STATE||null)}
addEventListener("al-ihsan:pre-azan-change",event=>sync(event.detail));
document.addEventListener("visibilitychange",()=>{if(!document.hidden)sync(window.AL_IHSAN_PRE_AZAN_STATE)});
addEventListener("pageshow",()=>sync(window.AL_IHSAN_PRE_AZAN_STATE),{passive:true});
addEventListener("focus",()=>sync(window.AL_IHSAN_PRE_AZAN_STATE),{passive:true});
addEventListener("beforeunload",()=>stop("unload"));
window.AL_IHSAN_PRE_AZAN_AUDIO=Object.freeze({
  version:"pre-azan-audio-v108",
  ttsDriveIds:TTS,
  tilawahDriveIds:TILAWAH,
  srcForState,
  stop:()=>stop("manual"),
  element:audio
});
})();
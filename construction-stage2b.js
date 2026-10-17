(()=>{
"use strict";

const $=id=>document.getElementById(id);
const E={
  focusTitle:$("constructionFocusTitle"),
  focusNote:$("constructionFocusNote"),
  target:$("constructionTarget"),
  collected:$("constructionCollected"),
  remaining:$("constructionRemaining"),
  progressFill:$("constructionProgressFill"),
  progressText:$("constructionProgressText")
};

const C=window.AL_IHSAN_CONFIG||{};
const cms=C.cms||{};
const sheets=cms.sheets||{};
const refreshMs=cms.constructionRefreshMs||300000;
const campaignTarget=Number(cms.constructionCampaignTarget)||145000000;
const numberFormat=new Intl.NumberFormat("id-ID",{maximumFractionDigits:0});
let timer=0;

function text(v){return String(v??"").trim()}
function numberOrNull(v){
  if(v===null||v===undefined||text(v)==="")return null;
  const normalized=text(v).replace(/[^0-9,.-]/g,"").replace(/\./g,"").replace(",",".");
  const n=Number(normalized);
  return Number.isFinite(n)?n:null;
}
function money(v){
  if(v===null||v===undefined||!Number.isFinite(v))return "—";
  return "Rp"+numberFormat.format(Math.max(0,v));
}
function percent(v){
  if(v===null||v===undefined||!Number.isFinite(v))return "—";
  return Math.max(0,Math.min(100,v));
}

function rowsFromTable(table){
  if(!table?.cols||!table?.rows)return[];
  const headers=table.cols.map((c,i)=>text(c?.label||c?.id||("c"+i)));
  return table.rows.map(row=>{
    const out={};
    headers.forEach((key,i)=>{
      const cell=row?.c?.[i];
      out[key]=cell?(cell.v??cell.f??""):"";
    });
    return out;
  });
}

function queryAgenda(){
  if(!cms.spreadsheetId)return Promise.reject(new Error("construction spreadsheet missing"));
  const sheetName=sheets.constructionAgenda||"Pembangunan Agenda";
  return new Promise((resolve,reject)=>{
    const cb="__construction_2b_"+Date.now()+"_"+Math.floor(Math.random()*1e5);
    const script=document.createElement("script");
    let done=false;
    const clean=()=>{
      if(done)return;
      done=true;
      clearTimeout(timeout);
      delete window[cb];
      script.remove();
    };
    window[cb]=response=>{
      clean();
      if(response?.status==="error")reject(new Error("construction sheet error"));
      else resolve(rowsFromTable(response?.table));
    };
    const timeout=setTimeout(()=>{clean();reject(new Error("construction sheet timeout"))},10000);
    const tqx=encodeURIComponent("responseHandler:"+cb+";out:json");
    script.src="https://docs.google.com/spreadsheets/d/"+encodeURIComponent(cms.spreadsheetId)+
      "/gviz/tq?tqx="+tqx+"&headers=1&sheet="+encodeURIComponent(sheetName)+"&_="+Date.now();
    script.async=true;
    script.onerror=()=>{clean();reject(new Error("construction sheet unavailable"))};
    document.head.appendChild(script);
  });
}

function render(row){
  if(!row)return;
  const title=text(row["Program Pembangunan"]);
  const note=text(row["Catatan"]).split(".")[0].trim();
  const collected=numberOrNull(row["Dana Terkumpul"]);
  const explicitRemaining=numberOrNull(row["Kekurangan"]);
  const explicitProgress=numberOrNull(row["Progress"]);

  const remaining=explicitRemaining!==null
    ? explicitRemaining
    : (collected!==null?Math.max(campaignTarget-collected,0):null);

  const progressValue=explicitProgress!==null
    ? explicitProgress
    : (collected!==null&&campaignTarget>0?(collected/campaignTarget)*100:null);

  if(E.focusTitle)E.focusTitle.textContent=title||"PEMBUATAN MIHRAB MASJID";
  if(E.focusNote)E.focusNote.textContent=note||"Paket termasuk plafond area mihrab ±15 m²";
  if(E.target)E.target.textContent=money(campaignTarget);
  if(E.collected)E.collected.textContent=money(collected);
  if(E.remaining)E.remaining.textContent=money(remaining);

  const pct=percent(progressValue);
  if(E.progressFill)E.progressFill.style.width=(pct==="—"?0:pct)+"%";
  if(E.progressText)E.progressText.textContent=pct==="—"?"—":numberFormat.format(pct)+"%";
}

async function refresh(){
  try{
    const rows=await queryAgenda();
    const active=rows.find(row=>text(row["Status"]).toUpperCase()==="PRIORITAS AKTIF")
      || rows.find(row=>text(row["Prioritas"])==="1")
      || rows[0];
    render(active);
  }catch(error){
    console.warn("Construction Stage 2B refresh failed",error);
    render({
      "Program Pembangunan":"Pembuatan mihrab masjid",
      "Catatan":"Paket termasuk plafond area mihrab ±15 m²"
    });
  }finally{
    clearTimeout(timer);
    timer=setTimeout(refresh,refreshMs);
  }
}

refresh();
})();

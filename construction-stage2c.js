(()=>{
"use strict";

const root=document.getElementById("constructionAgendaRows");
if(!root)return;

const C=window.AL_IHSAN_CONFIG||{};
const cms=C.cms||{};
const sheets=cms.sheets||{};
const refreshMs=cms.constructionAgendaRefreshMs||300000;
const campaignTarget=Number(cms.constructionCampaignTarget)||145000000;
const nf=new Intl.NumberFormat("id-ID",{maximumFractionDigits:0});
let timer=0;

const text=v=>String(v??"").trim();

function numberOrNull(v){
  if(v===null||v===undefined||text(v)==="")return null;
  const n=Number(text(v).replace(/[^0-9,.-]/g,"").replace(/\./g,"").replace(",","."));
  return Number.isFinite(n)?n:null;
}

function money(v){
  return Number.isFinite(v)?"Rp. "+nf.format(Math.max(0,v)):"—";
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
    const cb="__construction_2c_"+Date.now()+"_"+Math.floor(Math.random()*1e5);
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
      if(response?.status==="error")reject(new Error("construction agenda sheet error"));
      else resolve(rowsFromTable(response?.table));
    };
    const timeout=setTimeout(()=>{clean();reject(new Error("construction agenda timeout"))},10000);
    const tqx=encodeURIComponent("responseHandler:"+cb+";out:json");
    script.src="https://docs.google.com/spreadsheets/d/"+encodeURIComponent(cms.spreadsheetId)+
      "/gviz/tq?tqx="+tqx+"&headers=1&sheet="+encodeURIComponent(sheetName)+"&_="+Date.now();
    script.async=true;
    script.onerror=()=>{clean();reject(new Error("construction agenda unavailable"))};
    document.head.appendChild(script);
  });
}

function cell(cls,value){
  const el=document.createElement("div");
  el.className="construction-agenda-cell-live "+cls;
  el.textContent=value;
  return el;
}

function render(rows){
  root.replaceChildren();

  const sorted=rows
    .filter(row=>text(row["Program Pembangunan"]))
    .sort((a,b)=>(numberOrNull(a["Prioritas"])??999)-(numberOrNull(b["Prioritas"])??999))
    .slice(0,6);

  sorted.forEach((row,index)=>{
    const priority=numberOrNull(row["Prioritas"])??(index+1);
    const status=text(row["Status"]);
    const active=status.toUpperCase()==="PRIORITAS AKTIF";
    const estimate=numberOrNull(row["Estimasi Anggaran"]);
    const collectedRaw=numberOrNull(row["Dana Terkumpul"]);
    const remainingRaw=numberOrNull(row["Kekurangan"]);

    const target=active?campaignTarget:estimate;
    const collected=active?(collectedRaw??0):collectedRaw;
    const remaining=remainingRaw!==null
      ? remainingRaw
      : (Number.isFinite(target)&&Number.isFinite(collected)?Math.max(target-collected,0):null);

    const line=document.createElement("div");
    line.className="construction-agenda-row-live"+(active?" is-active":"");
    line.style.top=(index*27)+"px";

    line.append(
      cell("construction-agenda-no-live",String(priority)),
      cell("construction-agenda-program-live",text(row["Program Pembangunan"])),
      cell("construction-agenda-priority-live",String(priority)),
      cell("construction-agenda-status-live",status.toUpperCase()),
      cell("construction-agenda-target-live",money(target)),
      cell("construction-agenda-collected-live",money(collected)),
      cell("construction-agenda-remaining-live",money(remaining))
    );
    root.appendChild(line);
  });
}

async function refresh(){
  try{
    render(await queryAgenda());
  }catch(error){
    console.warn("Construction Stage 2C refresh failed",error);
  }finally{
    clearTimeout(timer);
    timer=setTimeout(refresh,refreshMs);
  }
}

refresh();
})();

(()=>{
"use strict";

const C=window.AL_IHSAN_CONFIG||{};
const cms=C.cms||{};
const sheets=cms.sheets||{};
const $=id=>document.getElementById(id);
const D={
  position:$("financePosition"),
  income:$("financeIncome"),
  expense:$("financeExpense"),
  surplus:$("financeSurplus")
};

let refreshTimer=0;
const numberFormat=new Intl.NumberFormat("id-ID",{maximumFractionDigits:0});

function n(v){
  if(typeof v==="number")return Number.isFinite(v)?v:0;
  const s=String(v??"").replace(/[^0-9,.-]/g,"").replace(/\./g,"").replace(",",".");
  const x=Number(s);
  return Number.isFinite(x)?x:0;
}

function money(v){
  const value=n(v);
  return (value<0?"-":"")+"Rp "+numberFormat.format(Math.abs(value));
}

function rawRows(table){
  if(!table?.cols||!table?.rows)return[];
  const headers=table.cols.map((c,i)=>String(c?.label||c?.id||("c"+i)).trim());
  return table.rows.map(r=>{
    const row={};
    headers.forEach((key,i)=>{
      const cell=r?.c?.[i];
      row[key]=cell?(cell.v??cell.f??""):"";
    });
    return row;
  });
}

function queryDashboard(){
  if(!cms.spreadsheetId)return Promise.reject(new Error("spreadsheet missing"));
  const sheetName=sheets.financeDashboard||"Keuangan Dashboard";
  return new Promise((resolve,reject)=>{
    const cb="__finance_kpi_"+Date.now()+"_"+Math.floor(Math.random()*1e5);
    const script=document.createElement("script");
    let done=false;
    const clean=()=>{
      if(done)return;
      done=true;
      clearTimeout(timer);
      delete window[cb];
      script.remove();
    };
    window[cb]=response=>{
      clean();
      if(response?.status==="error")reject(new Error("sheet error"));
      else resolve(rawRows(response?.table));
    };
    const timer=setTimeout(()=>{clean();reject(new Error("sheet timeout"))},10000);
    const tqx=encodeURIComponent("responseHandler:"+cb+";out:json");
    script.src="https://docs.google.com/spreadsheets/d/"+encodeURIComponent(cms.spreadsheetId)+
      "/gviz/tq?tqx="+tqx+"&headers=1&sheet="+encodeURIComponent(sheetName)+"&_="+Date.now();
    script.async=true;
    script.onerror=()=>{clean();reject(new Error("sheet unavailable"))};
    document.head.appendChild(script);
  });
}

function normalize(rows){
  const map=new Map();
  for(const row of rows){
    const key=String(row.Field||"").trim();
    if(key)map.set(key,row.Nilai);
  }
  return{
    position:n(map.get("posisi_dana")),
    income:n(map.get("pemasukan_operasional")),
    expense:n(map.get("pengeluaran_operasional")),
    surplus:n(map.get("surplus_defisit")),
    source:"google-sheet"
  };
}

async function fallback(){
  const response=await fetch("./data/finance-summary.json?_"+Date.now(),{cache:"no-store"});
  if(!response.ok)throw new Error("fallback missing");
  return response.json();
}

function setValue(el,value){
  if(!el)return;
  const amount=n(value);
  el.textContent=money(amount);
  el.classList.toggle("negative",amount<0);
  el.classList.toggle("positive",amount>0);
}

function render(data){
  setValue(D.position,data.position);
  setValue(D.income,data.income);
  setValue(D.expense,data.expense);
  setValue(D.surplus,data.surplus);
  const scene=document.getElementById("financeScene");
  if(scene)scene.dataset.financeSource=data.source||"unknown";
}

async function load(){
  try{
    render(normalize(await queryDashboard()));
  }catch(error){
    console.warn("Finance KPI Sheet unavailable, using fallback",error);
    try{
      const data=await fallback();
      data.source="fallback";
      render(data);
    }catch(fallbackError){
      console.error("Finance KPI fallback unavailable",fallbackError);
    }
  }
}

load();
clearInterval(refreshTimer);
refreshTimer=setInterval(load,Math.max(60000,Number(cms.financeRefreshMs||300000)));
})();

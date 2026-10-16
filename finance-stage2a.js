(()=>{
"use strict";

const $=id=>document.getElementById(id);
const E={
  clock:$("financeClock"),
  weekday:$("financeDateWeekday"),
  gregorian:$("financeDateGregorian"),
  hijri:$("financeDateHijri"),
  next:$("financeNextPrayer"),
  countdown:$("financeCountdown")
};

const timezone=window.AL_IHSAN_CONFIG?.timezone||"Asia/Jakarta";
const clockFormatter=new Intl.DateTimeFormat("id-ID",{
  timeZone:timezone,
  hour:"2-digit",
  minute:"2-digit",
  second:"2-digit",
  hourCycle:"h23"
});

function formatClock(now){
  const parts=Object.fromEntries(
    clockFormatter.formatToParts(now)
      .filter(part=>part.type!=="literal")
      .map(part=>[part.type,part.value])
  );
  return `${parts.hour}:${parts.minute}:${parts.second}`;
}

function normalizePrayer(label){
  return String(label||"")
    .replace(/^Menuju\s+/i,"")
    .replace(/^Shubuh$/i,"Subuh")
    .trim()
    .toUpperCase();
}

function splitGregorian(text){
  const value=String(text||"").trim();
  const comma=value.indexOf(",");
  if(comma<0)return{weekday:"",date:value};
  return{
    weekday:value.slice(0,comma).trim(),
    date:value.slice(comma+1).trim()
  };
}

window.AL_IHSAN_FINANCE_TICK=({now,gregorianText,hijriText,nextLabel,countdownText})=>{
  const gregorian=splitGregorian(gregorianText);
  if(E.clock)E.clock.textContent=formatClock(now);
  if(E.weekday)E.weekday.textContent=gregorian.weekday;
  if(E.gregorian)E.gregorian.textContent=gregorian.date;
  if(E.hijri)E.hijri.textContent=hijriText||"";
  if(E.next)E.next.textContent=normalizePrayer(nextLabel);
  if(E.countdown)E.countdown.textContent=countdownText||"";
};


/* Stage 2B is intentionally bundled into this same upper-layer runtime. */
const C2=window.AL_IHSAN_CONFIG||{};
const cms=C2.cms||{};
const sheets=cms.sheets||{};

const KPI={
  position:$("financePosition"),
  income:$("financeIncome"),
  expense:$("financeExpense"),
  surplus:$("financeSurplus"),
  chart:$("financeChart"),
  topIncome:$("financeTopIncome"),
  topExpense:$("financeTopExpense")
};

let kpiRefreshTimer=0;
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

function topCategories(rows,period,key){
  const sums=new Map();
  for(const row of rows){
    if(String(row.Periode)!==period)continue;
    if(String(row["Jenis Transaksi"])!=="Operasional")continue;
    if(String(row["Kas/Program"])!=="Kas Umum")continue;
    const amount=n(row[key]);
    if(amount<=0)continue;
    const label=String(row.Kategori||"Lain-lain").trim()||"Lain-lain";
    sums.set(label,(sums.get(label)||0)+amount);
  }
  return [...sums]
    .map(([label,amount])=>({label,amount}))
    .sort((a,b)=>b.amount-a.amount)
    .slice(0,3);
}

function normalize(rows,transactions=[]){
  const map=new Map();
  for(const row of rows){
    const key=String(row.Field||"").trim();
    if(key)map.set(key,row.Nilai);
  }
  const period=String(map.get("periode_aktif")||"");
  const history=rows
    .filter(row=>/^\d{4}-\d{2}$/.test(String(row.Field||"")))
    .map(row=>({period:String(row.Field),income:n(row.Nilai),expense:n(row.Catatan)}))
    .sort((a,b)=>a.period.localeCompare(b.period))
    .slice(-6);
  return{
    period,
    position:n(map.get("posisi_dana")),
    income:n(map.get("pemasukan_operasional")),
    expense:n(map.get("pengeluaran_operasional")),
    surplus:n(map.get("surplus_defisit")),
    history,
    top_income:topCategories(transactions,period,"Uang Masuk"),
    top_expense:topCategories(transactions,period,"Uang Keluar"),
    source:"google-sheet"
  };
}

function queryTransactions(){
  if(!cms.spreadsheetId)return Promise.reject(new Error("spreadsheet missing"));
  const sheetName=sheets.financeTransactions||"Keuangan Transaksi";
  return new Promise((resolve,reject)=>{
    const cb="__finance_tx_"+Date.now()+"_"+Math.floor(Math.random()*1e5);
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
      if(response?.status==="error")reject(new Error("transaction sheet error"));
      else resolve(rawRows(response?.table));
    };
    const timer=setTimeout(()=>{clean();reject(new Error("transaction sheet timeout"))},10000);
    const tqx=encodeURIComponent("responseHandler:"+cb+";out:json");
    script.src="https://docs.google.com/spreadsheets/d/"+encodeURIComponent(cms.spreadsheetId)+
      "/gviz/tq?tqx="+tqx+"&headers=1&sheet="+encodeURIComponent(sheetName)+"&_="+Date.now();
    script.async=true;
    script.onerror=()=>{clean();reject(new Error("transaction sheet unavailable"))};
    document.head.appendChild(script);
  });
}

function monthShort(period){
  const m=String(period||"").match(/^(\d{4})-(\d{2})$/);
  if(!m)return "";
  return new Intl.DateTimeFormat("id-ID",{month:"short",timeZone:"Asia/Jakarta"})
    .format(new Date(Date.UTC(Number(m[1]),Number(m[2])-1,2,12)))
    .replace(/\./g,"")
    .slice(0,3)
    .toUpperCase();
}

function renderChart(history){
  if(!KPI.chart)return;
  KPI.chart.replaceChildren();
  const items=(history||[]).slice(-6);
  const ceiling=Math.max(10000000,...items.flatMap(item=>[n(item.income),n(item.expense)]));
  for(const item of items){
    const group=document.createElement("div");
    group.className="finance-chart-group";
    group.dataset.period=item.period;

    const bars=document.createElement("div");
    bars.className="finance-chart-bars";

    const income=document.createElement("span");
    income.className="finance-chart-bar income";
    income.style.height=Math.max(3,Math.min(100,n(item.income)/ceiling*100))+"%";
    income.title=money(item.income);

    const expense=document.createElement("span");
    expense.className="finance-chart-bar expense";
    expense.style.height=Math.max(3,Math.min(100,n(item.expense)/ceiling*100))+"%";
    expense.title=money(item.expense);

    bars.append(income,expense);

    const month=document.createElement("div");
    month.className="finance-chart-month";
    month.textContent=monthShort(item.period);

    group.append(bars,month);
    KPI.chart.appendChild(group);
  }
}

function renderRanking(container,items){
  if(!container)return;
  container.replaceChildren();
  const list=(items||[]).slice(0,3);
  for(let i=0;i<3;i++){
    const item=list[i];
    const row=document.createElement("div");
    row.className="finance-ranking-row"+(item?"":" is-empty");
    const label=document.createElement("span");
    const amount=document.createElement("strong");
    if(item){
      label.textContent=item.label;
      amount.textContent=money(item.amount);
    }
    row.append(label,amount);
    container.appendChild(row);
  }
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
  setValue(KPI.position,data.position);
  setValue(KPI.income,data.income);
  setValue(KPI.expense,data.expense);
  setValue(KPI.surplus,data.surplus);
  renderChart(data.history);
  renderRanking(KPI.topIncome,data.top_income);
  renderRanking(KPI.topExpense,data.top_expense);
  const scene=document.getElementById("financeScene");
  if(scene)scene.dataset.financeSource=data.source||"unknown";
}

async function load(){
  try{
    const [dashboard,transactions]=await Promise.all([queryDashboard(),queryTransactions()]);
    render(normalize(dashboard,transactions));
  }catch(error){
    console.warn("Finance Sheet unavailable, using fallback",error);
    try{
      const data=await fallback();
      data.source="fallback";
      render(data);
    }catch(fallbackError){
      console.error("Finance fallback unavailable",fallbackError);
    }
  }
}

load();
clearInterval(kpiRefreshTimer);
kpiRefreshTimer=setInterval(load,Math.max(60000,Number(cms.financeRefreshMs||300000)));

})();
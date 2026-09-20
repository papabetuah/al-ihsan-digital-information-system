(()=>{"use strict";
const C=window.AL_IHSAN_CONFIG;
const $=q=>document.querySelector(q),APP=$("#app"),S=$("#screen"),D=$("#date"),T=$("#time"),M=$("#mode");
const qs=new URLSearchParams(location.search);
const forcedSlide=qs.get("slide");
const forcedMode=qs.get("mode");
const livePreview=qs.get("live")==="1";
const st={now:new Date(),pr:null,next:null,mode:"NORMAL",phase:null,idx:0,started:Date.now(),data:{},status:{},lastRefresh:null,lastTick:Date.now(),lastRender:Date.now()};

const fb={
 PENGUMUMAN:[
  {AKTIF:"TRUE",JUDUL:"Selamat Datang di Masjid Al Ihsan Kapuih",ISI:"Mari makmurkan masjid dengan sholat berjamaah, majelis ilmu, dan kepedulian kepada umat.",PRIORITAS:"Informasi Jamaah"},
  {AKTIF:"TRUE",JUDUL:"Jaga Kebersihan & Kenyamanan",ISI:"Mari bersama menjaga kebersihan, ketertiban, dan fasilitas masjid sebagai amanah bersama.",PRIORITAS:"Adab Masjid"}
 ],
 AGENDA_KAJIAN:[
  {AKTIF:"TRUE","NAMA KEGIATAN":"Kajian Rutin Masjid",JAM:"Ba’da Maghrib",PEMATERI:"Akan diumumkan",LOKASI:"Masjid Al Ihsan Kapuih",CATATAN:"Terbuka untuk jamaah dan masyarakat."},
  {AKTIF:"TRUE","NAMA KEGIATAN":"Tahsin & Pembinaan Al-Qur'an",JAM:"Sesuai jadwal",PEMATERI:"Tim Pembina",LOKASI:"Masjid Al Ihsan Kapuih",CATATAN:"Program pembinaan bacaan Al-Qur'an."}
 ],
 KEUANGAN:[
  {JENIS:"Pemasukan",KETERANGAN:"Infak Jumat",JUMLAH:"5250000",TAMPILKAN:"TRUE"},
  {JENIS:"Pengeluaran",KETERANGAN:"Operasional Masjid",JUMLAH:"10850000",TAMPILKAN:"TRUE"}
 ],
 PEMBANGUNAN:[
  {AKTIF:"TRUE",PROGRAM:"Penyelesaian Fisik & Fasilitas Masjid","TARGET DANA":"32000000",TERKUMPUL:"0",STATUS:"Penggalangan Dana","UPDATE TERAKHIR":"September 2026"}
 ],
 DOKUMENTASI:[
  {AKTIF:"TRUE",KEGIATAN:"Kegiatan Masjid Al Ihsan",TANGGAL:"September 2026",RINGKASAN:"Dokumentasi kegiatan jamaah, kajian, sosial, dan pembangunan ditampilkan secara berkala."}
 ],
 PESAN_DAKWAH:[
  {AKTIF:"TRUE",JUDUL:"Memakmurkan Masjid","ISI SINGKAT":"Masjid yang hidup menjadi pusat ibadah, ilmu, kepedulian, dan persaudaraan umat.",SUMBER:"Masjid Al Ihsan Kapuih"},
  {AKTIF:"TRUE",JUDUL:"Jaga Adab di Rumah Allah","ISI SINGKAT":"Tenangkan suara, silent-kan HP, jaga kebersihan, dan bantu anak-anak belajar mencintai masjid.",SUMBER:"Adab Masjid"}
 ],
 JUMAT:[{KEY:"aktif",VALUE:"TRUE"}],DONASI:[],KONTROL_TV:[]
};
const tabs=Object.keys(fb);
const esc=v=>String(v??"").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]));
const num=v=>Number(String(v??"").replace(/[^0-9.-]/g,""))||0;
const rup=v=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(num(v));
const pad=n=>String(n).padStart(2,"0");
const truth=v=>["true","1","ya","yes","aktif"].includes(String(v||"").toLowerCase());
function csv(x){let rows=[],r=[],c="",q=false;for(let i=0;i<x.length;i++){const a=x[i],b=x[i+1];if(a=='"'&&q&&b=='"'){c+='"';i++;continue}if(a=='"'){q=!q;continue}if(a==","&&!q){r.push(c);c="";continue}if((a=="\n"||a=="\r")&&!q){if(a=="\r"&&b=="\n")i++;r.push(c);if(r.some(z=>z!==""))rows.push(r);r=[];c="";continue}c+=a}if(c||r.length){r.push(c);rows.push(r)}if(!rows.length)return[];const h=rows[0].map(z=>z.trim());return rows.slice(1).map(rr=>Object.fromEntries(h.map((k,i)=>[k,(rr[i]??"").trim()])))}
async function load(tab){
 const u=`https://docs.google.com/spreadsheets/d/${C.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}&_=${Date.now()}`;
 const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),C.fetchTimeoutMs||8000);
 try{
  const r=await fetch(u,{cache:"no-store",signal:ctl.signal});if(!r.ok)throw Error("http");
  const t=await r.text();if(/<html|doctype/i.test(t))throw Error("auth");
  const a=csv(t);if(!a.length)throw Error("empty");
  localStorage.setItem("alihsan_"+tab,JSON.stringify(a));localStorage.setItem("alihsan_"+tab+"_ts",String(Date.now()));
  st.status[tab]="google-sheets";return a
 }catch(e){
  let a;try{a=JSON.parse(localStorage.getItem("alihsan_"+tab)||"null")}catch{}
  st.status[tab]=a?"cache":"fallback";return a||fb[tab]
 }finally{clearTimeout(timer)}
}
function applyControl(){
 const map=Object.fromEntries((st.data.KONTROL_TV||[]).filter(r=>r.KEY).map(r=>[String(r.KEY).trim(),r.VALUE]));
 const n=(k,d)=>map[k]!==undefined&&map[k]!==""?num(map[k]):d;
 const s=(k,d)=>map[k]!==undefined&&String(map[k]).trim()!==""?String(map[k]).trim():d;
 C.preAdhanMinutes=n("pre_adhan_minutes",C.preAdhanMinutes);
 for(const k of ["shubuh","dzuhur","ashar","maghrib","isya"]){
  C.iqamahMinutes[k]=n("iqamah_"+k+"_menit",C.iqamahMinutes[k]);
  C.prayerDurationMinutes[k]=n("durasi_sholat_"+k+"_menit",C.prayerDurationMinutes[k]);
 }
 const durations={pengumuman:"durasi_pengumuman_detik",agenda:"durasi_agenda_detik",keuangan:"durasi_keuangan_detik",pembangunan:"durasi_pembangunan_detik",dokumentasi:"durasi_dokumentasi_detik",dakwah:"durasi_dakwah_detik"};
 C.playlist=C.playlist.map(([k,d])=>[k,durations[k]?n(durations[k],d):d]);
 C.friday.prepMinutes=n("jumat_persiapan_menit",C.friday.prepMinutes);
 C.friday.khutbahStart=s("jumat_khutbah_mulai",C.friday.khutbahStart);
 C.friday.prayerStart=s("jumat_sholat_mulai",C.friday.prayerStart);
 C.friday.end=s("jumat_selesai",C.friday.end);
 C.manualMode=s("manual_mode",C.manualMode||"AUTO").toUpperCase();
}
async function refresh(){
 const values=await Promise.all(tabs.map(async t=>[t,await load(t)]));
 values.forEach(([t,v])=>st.data[t]=v);
 applyControl();st.lastRefresh=new Date();render()
}
const R=Math.PI/180,ds=d=>Math.sin(d*R),dc=d=>Math.cos(d*R),dt=d=>Math.tan(d*R),asin=x=>Math.asin(x)/R,acos=x=>Math.acos(x)/R,atan2=(y,x)=>Math.atan2(y,x)/R,acot=x=>Math.atan2(1,x)/R,fa=a=>a-360*Math.floor(a/360),fh=a=>a-24*Math.floor(a/24);
function jul(y,m,d){if(m<=2){y--;m+=12}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5}
function sun(j){const D=j-2451545,g=fa(357.529+.98560028*D),q=fa(280.459+.98564736*D),L=fa(q+1.915*ds(g)+.020*ds(2*g)),e=23.439-.00000036*D,RA=atan2(dc(e)*ds(L),dc(L))/15;return{dec:asin(ds(e)*ds(L)),eq:q/15-fh(RA)}}
function noon(t,j){return fh(12-sun(j+t).eq)}
function ang(a,t,j,lat,ccw){const dec=sun(j+t).dec,n=noon(t,j);let x=(-ds(a)-ds(dec)*ds(lat))/(dc(dec)*dc(lat));x=Math.max(-1,Math.min(1,x));const T=acos(x)/15;return n+(ccw?-T:T)}
function asr(f,t,j,lat){const dec=sun(j+t).dec,a=-acot(f+dt(Math.abs(lat-dec)));return ang(a,t,j,lat,false)}
function prayers(date){
 const y=date.getFullYear(),m=date.getMonth()+1,d=date.getDate(),j=jul(y,m,d)-C.longitude/(15*24);
 const t={shubuh:5,terbit:6,dzuhur:12,ashar:13,maghrib:18,isya:19};
 for(let z=0;z<5;z++){Object.keys(t).forEach(k=>t[k]/=24);t.shubuh=ang(C.angles.fajr,t.shubuh,j,C.latitude,true);t.terbit=ang(C.angles.sunriseSunset,t.terbit,j,C.latitude,true);t.dzuhur=noon(t.dzuhur,j);t.ashar=asr(C.angles.asrFactor,t.ashar,j,C.latitude);t.maghrib=ang(C.angles.sunriseSunset,t.maghrib,j,C.latitude,false);t.isya=ang(C.angles.isha,t.isya,j,C.latitude,false)}
 const o={};for(const[k,h0]of Object.entries(t)){let h=fh(h0+C.tz-C.longitude/15),hh=Math.floor(h),mm=Math.round((h-hh)*60);if(mm===60){hh=(hh+1)%24;mm=0}const d0=new Date(date);d0.setHours(hh,mm,0,0);o[k]={key:k,label:{shubuh:"Shubuh",terbit:"Terbit",dzuhur:"Dzuhur",ashar:"Ashar",maghrib:"Maghrib",isya:"Isya"}[k],time:`${pad(hh)}:${pad(mm)}`,date:d0}}return o
}
function nextPrayer(n,p){for(const k of["shubuh","dzuhur","ashar","maghrib","isya"])if(n<p[k].date)return p[k];const t=new Date(n);t.setDate(t.getDate()+1);return prayers(t).shubuh}
function cd(ms){let s=Math.max(0,Math.floor(ms/1000));return`${pad(Math.floor(s/3600))}:${pad(Math.floor(s%3600/60))}:${pad(s%60)}`}
function active(tab){return(st.data[tab]||fb[tab]||[]).filter(r=>r.AKTIF===undefined||truth(r.AKTIF))}
function timeToday(hm,base=st.now){const [h,m]=String(hm).split(":").map(Number),d=new Date(base);d.setHours(h||0,m||0,0,0);return d}
function prayerPhase(){
 const n=st.now,p=st.pr,day=n.getDay();
 if(day===5){
  const khutbah=timeToday(C.friday.khutbahStart),sholat=timeToday(C.friday.prayerStart),end=timeToday(C.friday.end),prep=new Date(khutbah.getTime()-C.friday.prepMinutes*60000);
  if(n>=prep&&n<khutbah)return{mode:"JUMAT_PERSIAPAN",name:"Jumat",start:prep,end:khutbah};
  if(n>=khutbah&&n<sholat)return{mode:"KHUTBAH_JUMAT",name:"Jumat",start:khutbah,end:sholat};
  if(n>=sholat&&n<end)return{mode:"SHOLAT_JUMAT",name:"Jumat",start:sholat,end};
 }
 for(const k of["shubuh","dzuhur","ashar","maghrib","isya"]){
  if(day===5&&k==="dzuhur")continue;
  const adhan=p[k].date,pre=new Date(adhan.getTime()-C.preAdhanMinutes*60000);
  const iqamah=new Date(adhan.getTime()+(C.iqamahMinutes[k]||0)*60000);
  const end=new Date(iqamah.getTime()+(C.prayerDurationMinutes[k]||12)*60000);
  if(n>=pre&&n<adhan)return{mode:"MENJELANG_ADZAN",key:k,name:p[k].label,start:pre,end:adhan,adhan,iqamah};
  if(n>=adhan&&n<iqamah)return{mode:"ADZAN_IQAMAH",key:k,name:p[k].label,start:adhan,end:iqamah,adhan,iqamah};
  if(n>=iqamah&&n<end)return{mode:"SHOLAT_BERLANGSUNG",key:k,name:p[k].label,start:iqamah,end,adhan,iqamah};
 }
 return{mode:"NORMAL",name:null}
}
function previewPhase(){
 if(!forcedMode)return prayerPhase();
 const m=String(forcedMode).toUpperCase(),n=st.now,next=st.next||nextPrayer(n,st.pr);
 const key=next.key||"isya",name=next.label||"Sholat";
 if(m==="MENJELANG_ADZAN")return{mode:m,key,name,start:n,end:next.date,adhan:next.date,iqamah:new Date(next.date.getTime()+(C.iqamahMinutes[key]||10)*60000)};
 if(m==="ADZAN_IQAMAH")return{mode:m,key,name,start:n,end:new Date(n.getTime()+(C.iqamahMinutes[key]||10)*60000),adhan:n,iqamah:new Date(n.getTime()+(C.iqamahMinutes[key]||10)*60000)};
 if(m==="SHOLAT_BERLANGSUNG")return{mode:m,key,name,start:n,end:new Date(n.getTime()+(C.prayerDurationMinutes[key]||12)*60000),adhan:n};
 if(m==="JUMAT_PERSIAPAN")return{mode:m,name:"Jumat",start:n,end:new Date(n.getTime()+(C.friday.prepMinutes||30)*60000)};
 if(m==="KHUTBAH_JUMAT")return{mode:m,name:"Jumat",start:n,end:new Date(n.getTime()+25*60000)};
 if(m==="SHOLAT_JUMAT")return{mode:m,name:"Jumat",start:n,end:new Date(n.getTime()+12*60000)};
 return{mode:"NORMAL",name:null}
}
function mode(){
 if(forcedMode)return String(forcedMode).toUpperCase();
 if(forcedSlide&&!livePreview)return"NORMAL";
 if(C.manualMode&&C.manualMode!=="AUTO")return C.manualMode;
 const ph=prayerPhase();st.phase=ph;return ph.mode
}
function tick(){
 st.lastTick=Date.now();st.now=new Date();
 D.textContent=new Intl.DateTimeFormat("id-ID",{weekday:"long",day:"2-digit",month:"long",year:"numeric",timeZone:C.timezone}).format(st.now);
 T.textContent=new Intl.DateTimeFormat("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false,timeZone:C.timezone}).format(st.now).replace(/\./g,":");
 st.pr=prayers(st.now);st.next=nextPrayer(st.now,st.pr);
 st.phase=previewPhase();
 const md=mode();if(md!==st.mode){st.mode=md;st.started=Date.now();render()}
 const quiet=["ADZAN_IQAMAH","SHOLAT_BERLANGSUNG","KHUTBAH_JUMAT","SHOLAT_JUMAT"].includes(st.mode);
 APP.classList.toggle("quiet-mode",quiet);
 M.textContent=st.mode==="ADZAN_IQAMAH"?"PERSIAPAN IQAMAH":st.mode.replaceAll("_"," ");
 if(st.mode==="NORMAL"&&!forcedSlide){const dur=C.playlist[st.idx][1]*1000;if(Date.now()-st.started>=dur){st.idx=(st.idx+1)%C.playlist.length;st.started=Date.now();render()}}
 document.querySelectorAll("[data-cd-next]").forEach(x=>x.textContent=cd(st.next.date-st.now));
 document.querySelectorAll("[data-cd-phase]").forEach(x=>x.textContent=st.phase&&st.phase.end?cd(st.phase.end-st.now):"00:00:00");
 document.querySelectorAll("[data-live-clock]").forEach(x=>x.textContent=masterClock());
 document.querySelectorAll("[data-live-date]").forEach(x=>x.textContent=masterDate());
 document.querySelectorAll("[data-master-cd]").forEach(x=>x.textContent=cd(st.next.date-st.now));
 const prayerNodes={shubuh:st.pr.shubuh,terbit:st.pr.terbit,dzuhur:st.pr.dzuhur,ashar:st.pr.ashar,maghrib:st.pr.maghrib,isya:st.pr.isya};
 Object.entries(prayerNodes).forEach(([k,p])=>document.querySelectorAll(".master-prayer-"+k).forEach(x=>x.textContent=p.time))
}
function head(title,sub){return`<div class="titlebar"><div><h2>${esc(title)}</h2><p>${esc(sub||"")}</p></div><div class="next">Menuju ${esc(st.next.label)}<br><b>${esc(st.next.time)} • <span data-cd-next>${cd(st.next.date-st.now)}</span></b></div></div>`}
const picons={shubuh:"☾",terbit:"☼",dzuhur:"☀",ashar:"◒",maghrib:"◓",isya:"☾"};
function masterDate(){return new Intl.DateTimeFormat("id-ID",{weekday:"long",day:"2-digit",month:"long",year:"numeric",timeZone:C.timezone}).format(st.now)}
function masterClock(){return new Intl.DateTimeFormat("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false,timeZone:C.timezone}).format(st.now).replace(/\./g,":")}
function dashboard(){
 const ps=["shubuh","terbit","dzuhur","ashar","maghrib","isya"];
 return`<div class="master-canvas master-dashboard">
   <img class="master-bg" src="./assets/dashboard-master.png?v=master14" alt="">
   <div class="master-clock-mask"><span data-live-date>${masterDate()}</span><b data-live-clock>${masterClock()}</b><em>WIB</em></div>
   ${ps.map(k=>`<div class="master-prayer-time master-prayer-${k}">${st.pr[k].time}</div>`).join("")}
   <div class="master-count-mask"><span>Menuju ${st.next.label}</span><b data-master-cd>${cd(st.next.date-st.now)}</b><small>JAM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; MENIT&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; DETIK</small></div>
   <div class="master-qris"><img src="./assets/qris-rumah-tahfiz-final.jpg?v=master14" alt="QRIS Rumah Tahfiz Al Ihsan"></div>
  </div>`
}
function masterPrayerScreen(){
 return`<div class="master-canvas master-sholat">
   <img class="master-bg" src="./assets/sholat-master.jpg?v=master14" alt="">
   <div class="master-clock-mask sholat-clock-mask"><span data-live-date>${masterDate()}</span><b data-live-clock>${masterClock()}</b><em>WIB</em></div>
  </div>`
}
function cards(tab,title,sub,fn){const rows=active(tab).slice(0,3);return`<div class="slide content">${head(title,sub)}<div class="cards">${rows.map(fn).join("")||'<div class="panel card news-card">Belum ada data aktif.</div>'}</div></div>`}
function finance(){
 const r=(st.data.KEUANGAN||[]).filter(x=>x.TAMPILKAN===undefined||truth(x.TAMPILKAN));
 const inc=r.filter(x=>String(x.JENIS).toLowerCase()=="pemasukan").reduce((a,b)=>a+num(b.JUMLAH),0);
 const exp=r.filter(x=>String(x.JENIS).toLowerCase()=="pengeluaran").reduce((a,b)=>a+num(b.JUMLAH),0);
 const net=inc-exp,needs=active("PEMBANGUNAN").reduce((a,b)=>a+Math.max(0,num(b["TARGET DANA"])-num(b.TERKUMPUL)),0);
 const max=Math.max(inc,exp,1),ip=Math.round(inc/max*100),ep=Math.round(exp/max*100);
 return`<div class="slide finance">${head("Laporan Keuangan Masjid","Transparan • Amanah • Akuntabel")}
 <div class="metrics">
  <div class="panel metric"><span>Pemasukan</span><b>${rup(inc)}</b><div class="mini">Dana masuk periode berjalan</div></div>
  <div class="panel metric"><span>Pengeluaran</span><b>${rup(exp)}</b><div class="mini">Operasional & kegiatan</div></div>
  <div class="panel metric"><span>${net>=0?"Surplus":"Defisit"}</span><b>${rup(Math.abs(net))}</b><div class="mini">Selisih pemasukan & pengeluaran</div></div>
  <div class="panel metric"><span>Kebutuhan Pembangunan</span><b>${rup(needs)}</b><div class="mini">Target yang masih dibutuhkan</div></div>
 </div>
 <div class="finance-body">
  <section class="panel table"><h3>Ringkasan Transaksi</h3><table><thead><tr><th>Keterangan</th><th>Jenis</th><th>Jumlah</th></tr></thead><tbody>${r.slice(0,8).map(x=>`<tr><td>${esc(x.KETERANGAN||"-")}</td><td>${esc(x.JENIS||"-")}</td><td>${rup(x.JUMLAH)}</td></tr>`).join("")||'<tr><td colspan="3">Belum ada transaksi yang ditampilkan.</td></tr>'}</tbody></table></section>
  <aside class="finance-side">
   <div class="panel sidepanel"><h3>Arus Dana</h3><div class="barrow"><span>Pemasukan</span><b>${rup(inc)}</b><div class="bar"><i style="width:${ip}%"></i></div></div><div class="barrow"><span>Pengeluaran</span><b>${rup(exp)}</b><div class="bar"><i style="width:${ep}%"></i></div></div></div>
   <div class="panel sidepanel cta"><strong>Amanah jamaah kami laporkan secara terbuka.</strong><p>Dukung operasional rutin dan penyelesaian pembangunan Masjid Al Ihsan Kapuih.</p><div class="accounts">BSI 710 6640178 • Bank Nagari Syariah 7100.0201.05008-5</div></div>
  </aside>
 </div></div>`
}
function build(){
 const r=active("PEMBANGUNAN");
 return`<div class="slide content">${head("Program Pembangunan","Update progres pembangunan dan fasilitas Masjid Al Ihsan Kapuih")}<div class="buildgrid">${r.slice(0,4).map(x=>{const t=num(x["TARGET DANA"]),v=num(x.TERKUMPUL),p=t?Math.min(100,v/t*100):0;return`<div class="panel buildcard"><div class="meta">${esc(x.STATUS||"PROGRAM PEMBANGUNAN")}</div><h3>${esc(x.PROGRAM||"Program Pembangunan")}</h3><p>Terhimpun <b>${rup(v)}</b> dari target <b>${rup(t)}</b></p><div class="progress"><i style="width:${p}%"></i></div><p><b>${p.toFixed(0)}%</b> tercapai • Update ${esc(x["UPDATE TERAKHIR"]||"terbaru")}</p></div>`}).join("")||'<div class="panel buildcard">Belum ada program pembangunan aktif.</div>'}</div></div>`
}
function donate(){
 return`<div class="slide donate">
  <section class="donateleft">
   <div class="panel donatehero"><h2>Donasi Operasional<br>& Pembangunan</h2><p>Scan QRIS atau transfer ke rekening resmi. Satu amal membantu ibadah, dakwah, pendidikan, dan pembangunan masjid.</p><div class="donation-points"><span>Operasional Harian</span><span>Dakwah & Pendidikan</span><span>Pembangunan</span></div></div>
   <div class="banks">
    <div class="panel bank"><b>Bank Syari'ah Indonesia (BSI)</b><strong>710 6640178</strong><span>A/n Dodi F QQ Rumah Tahfiz Al Ihsan</span></div>
    <div class="panel bank"><b>Bank Nagari Syariah</b><strong>7100.0201.05008-5</strong><span>A/n Masjid Al Ihsan Kapuih</span></div>
   </div>
  </section>
  <section class="panel qris"><div class="box"><img src="./assets/qris-rumah-tahfiz-final.jpg?v=master14" alt="QRIS Rumah Tahfiz Al Ihsan"><div class="qcaption"><b>QRIS Rumah Tahfiz Al Ihsan</b><small>NMID ID1022210128701 • Scan dengan aplikasi pembayaran</small></div></div></section>
 </div>`
}
function normal(){
 const k=forcedSlide||C.playlist[st.idx][0];
 if(k==="dashboard")return dashboard();
 if(k==="pengumuman")return cards("PENGUMUMAN","Pengumuman Masjid","Informasi penting untuk jamaah",r=>`<div class="panel card news-card"><span class="badge">${esc(r.PRIORITAS||"PENGUMUMAN")}</span><h3>${esc(r.JUDUL||"Pengumuman")}</h3><p>${esc(r.ISI||"")}</p></div>`);
 if(k==="agenda")return cards("AGENDA_KAJIAN","Agenda / Kajian Rutin","Majelis ilmu dan kegiatan jamaah",r=>`<div class="panel card news-card"><div class="meta">${esc(r.TANGGAL||"")} ${r.JAM?"• "+esc(r.JAM):""}</div><h3>${esc(r["NAMA KEGIATAN"]||"Kegiatan")}</h3><p><b>${esc(r.PEMATERI||"")}</b></p><p>${esc(r.LOKASI||"Masjid Al Ihsan Kapuih")}</p><p>${esc(r.CATATAN||"")}</p></div>`);
 if(k==="keuangan")return finance();
 if(k==="pembangunan")return build();
 if(k==="donasi")return donate();
 if(k==="dokumentasi")return cards("DOKUMENTASI","Dokumentasi Kegiatan","Laporan aktivitas dan manfaat kegiatan masjid",r=>`<div class="panel card news-card"><div class="meta">${esc(r.TANGGAL||"")}</div><h3>${esc(r.KEGIATAN||"Kegiatan Masjid")}</h3><p>${esc(r.RINGKASAN||"")}</p></div>`);
 return cards("PESAN_DAKWAH","Pesan Dakwah / Adab Masjid","Nasihat singkat untuk jamaah",r=>`<div class="panel card news-card"><span class="badge">PESAN DAKWAH</span><h3>${esc(r.JUDUL||"Pesan Dakwah")}</h3><p>“${esc(r["ISI SINGKAT"]||"")}”</p><div class="meta">${esc(r.SUMBER||"")}</div></div>`)
}
function modeScreen(){
 if(st.mode==="SHOLAT_BERLANGSUNG"||st.mode==="SHOLAT_JUMAT")return masterPrayerScreen();
 const ph=st.phase||prayerPhase();
 let kicker="",title="",sub="",showPhaseCountdown=false,countLabel="",items=[];
 if(st.mode==="MENJELANG_ADZAN"){
  kicker="BERSIAP UNTUK SHOLAT BERJAMAAH";title="Menuju "+(ph.name||st.next.label);sub="Tinggalkan aktivitas sejenak dan persiapkan diri menuju shaf.";showPhaseCountdown=true;countLabel="Menuju adzan";
  items=[["HP","Silent-kan HP"],["TENANG","Bimbing anak-anak untuk tenang"],["SHAF","Datang lebih awal & rapatkan shaf"]];
 }else if(st.mode==="ADZAN_IQAMAH"){
  kicker="WAKTU SHOLAT TELAH MASUK";title=(ph.name||"Sholat")+" • Persiapan Iqamah";sub="Selesaikan sholat sunnah dan bersiap berdiri ketika iqamah dikumandangkan.";showPhaseCountdown=true;countLabel="Perkiraan menuju iqamah";
  items=[["HP","Silent-kan HP"],["TENANG","Jaga ketenangan masjid"],["SHAF","Isi shaf terdepan terlebih dahulu"]];
 }else if(st.mode==="SHOLAT_BERLANGSUNG"){
  kicker="MOHON MENJAGA KEKHUSYUKAN";title="Sholat "+(ph.name||"")+" Sedang Berlangsung";sub="Layar informasi dihentikan sementara selama sholat berjamaah.";
  items=[["HP","Pastikan HP dalam mode silent"],["ANAK","Anak-anak mohon tenang, tidak ribut / bersuara"],["SHAF","Rapatkan dan luruskan shaf"]];
 }else if(st.mode==="JUMAT_PERSIAPAN"){
  kicker="HARI JUMAT";title="Persiapan Sholat Jumat";sub="Silakan duduk dengan tertib dan persiapkan diri untuk menyimak khutbah.";showPhaseCountdown=true;countLabel="Menuju khutbah";
  items=[["HP","Silent-kan HP"],["TENANG","Jaga ketenangan"],["ANAK","Anak-anak dalam pengawasan"]];
 }else if(st.mode==="KHUTBAH_JUMAT"){
  kicker="KHUTBAH JUMAT";title="Mohon Diam & Simak Khutbah";sub="Jangan berbicara saat khutbah berlangsung.";
  items=[["DIAM","Tidak berbicara saat khutbah"],["HP","Pastikan HP silent"],["TENANG","Jaga anak-anak tetap tenang"]];
 }else if(st.mode==="SHOLAT_JUMAT"){
  kicker="SHOLAT JUMAT";title="Sholat Jumat Sedang Berlangsung";sub="Mohon menjaga ketenangan dan kekhusyukan.";
  items=[["HP","Pastikan HP silent"],["TENANG","Anak-anak mohon tenang"],["SHAF","Rapatkan dan luruskan shaf"]];
 }else{return dashboard()}
 const info=ph&&ph.name?(ph.name==="Jumat"?"Masjid Al Ihsan Kapuih":"Waktu "+ph.name+(ph.adhan?" • "+new Intl.DateTimeFormat("id-ID",{hour:"2-digit",minute:"2-digit",hour12:false}).format(ph.adhan).replace(".",":"):"")):"Masjid Al Ihsan Kapuih";
 return `<div class="slide mode prayer-mode">
  <div class="panel modebox">
   <div class="mode-watermark"></div>
   <div class="mode-brand"><img src="./assets/logo-masjid-final.png?v=master14"><span>${kicker}</span></div>
   <h2>${title}</h2>
   <p class="mode-sub">${sub}</p>
   ${showPhaseCountdown?`<div class="phase-count"><span>${countLabel}</span><b data-cd-phase>${ph.end?cd(ph.end-st.now):"00:00:00"}</b></div>`:""}
   <div class="reminders">${items.map(([tag,txt])=>`<div><b>${tag}</b><span>${txt}</span></div>`).join("")}</div>
   <div class="mode-foot">${info}</div>
  </div>
 </div>`
}
function debug(){
 return`<div class="slide debug"><h2>Al Ihsan Digital Information System — Debug</h2><div class="debuggrid"><div class="panel"><b>Waktu</b>${esc(st.now.toString())}</div><div class="panel"><b>Mode</b>${st.mode}</div><div class="panel"><b>Slide</b>${forcedSlide||C.playlist[st.idx][0]}</div><div class="panel"><b>Sholat berikutnya</b>${st.next.label} ${st.next.time}<br><span data-cd-next>${cd(st.next.date-st.now)}</span></div><div class="panel"><b>Jadwal</b>${Object.values(st.pr).map(x=>x.label+" "+x.time).join("<br>")}</div><div class="panel"><b>Sumber data</b>${Object.entries(st.status).map(([k,v])=>k+": "+v).join("<br>")}</div></div></div>`
}
function currentSlideKey(){return forcedSlide||C.playlist[st.idx][0]}
function render(){
 if(!st.pr)return;
 try{
  const isDashboard=st.mode==="NORMAL"&&currentSlideKey()==="dashboard";
  const isPrayerMaster=st.mode==="SHOLAT_BERLANGSUNG"||st.mode==="SHOLAT_JUMAT";
  APP.classList.toggle("master-template",isDashboard||isPrayerMaster);
  APP.classList.toggle("master-dashboard-active",isDashboard);
  APP.classList.toggle("master-sholat-active",isPrayerMaster);
  S.innerHTML=qs.get("debug")==="1"?debug():st.mode==="NORMAL"?normal():modeScreen();
  st.lastRender=Date.now()
 }catch(e){
  APP.classList.remove("master-template","master-dashboard-active","master-sholat-active");
  S.innerHTML='<div class="slide mode"><div class="panel modebox"><h2>Masjid Al Ihsan Kapuih</h2><p class="mode-sub">Sistem informasi sedang memulihkan tampilan.</p></div></div>'
 }
}
window.addEventListener("error",()=>{if(Date.now()-st.lastRender>30000)location.reload()});
window.addEventListener("unhandledrejection",()=>{if(Date.now()-st.lastRender>30000)location.reload()});
document.addEventListener("visibilitychange",()=>{if(!document.hidden){tick();render();refresh()}});
tick();render();refresh();
setInterval(tick,1000);
setInterval(refresh,C.refreshMinutes*60000);
setInterval(()=>{if(Date.now()-st.lastTick>90000)location.reload()},30000);
})();
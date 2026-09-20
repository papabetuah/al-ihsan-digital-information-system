(()=>{"use strict";
const C=window.AL_IHSAN_CONFIG;
const $=q=>document.querySelector(q),S=$("#screen"),D=$("#date"),T=$("#time"),M=$("#mode");
const qs=new URLSearchParams(location.search);
const forcedSlide=qs.get("slide");
const forcedMode=qs.get("mode");
const st={now:new Date(),pr:null,next:null,mode:"NORMAL",idx:0,started:Date.now(),data:{},status:{},lastRefresh:null};

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
 try{const r=await fetch(u,{cache:"no-store"});if(!r.ok)throw Error();const t=await r.text();if(/<html|doctype/i.test(t))throw Error();const a=csv(t);if(!a.length)throw Error();localStorage.setItem("alihsan_"+tab,JSON.stringify(a));st.status[tab]="google-sheets";return a}
 catch(e){let a;try{a=JSON.parse(localStorage.getItem("alihsan_"+tab)||"null")}catch{}st.status[tab]=a?"cache":"fallback";return a||fb[tab]}
}
function applyControl(){
 const map=Object.fromEntries((st.data.KONTROL_TV||[]).filter(r=>r.KEY).map(r=>[String(r.KEY).trim(),r.VALUE]));
 const n=(k,d)=>map[k]!==undefined&&map[k]!==""?num(map[k]):d;
 C.preAdhanMinutes=n("pre_adhan_minutes",C.preAdhanMinutes);
 C.prayerModeMinutes.shubuh=n("durasi_sholat_subuh_menit",C.prayerModeMinutes.shubuh);
 C.prayerModeMinutes.dzuhur=n("durasi_sholat_dzuhur_menit",C.prayerModeMinutes.dzuhur);
 C.prayerModeMinutes.ashar=n("durasi_sholat_ashar_menit",C.prayerModeMinutes.ashar);
 C.prayerModeMinutes.maghrib=n("durasi_sholat_maghrib_menit",C.prayerModeMinutes.maghrib);
 C.prayerModeMinutes.isya=n("durasi_sholat_isya_menit",C.prayerModeMinutes.isya);
 const durations={pengumuman:"durasi_pengumuman_detik",agenda:"durasi_agenda_detik",keuangan:"durasi_keuangan_detik",pembangunan:"durasi_pembangunan_detik",dokumentasi:"durasi_dokumentasi_detik",dakwah:"durasi_dakwah_detik"};
 C.playlist=C.playlist.map(([k,d])=>[k,durations[k]?n(durations[k],d):d]);
 C.friday.prepMinutes=n("jumat_persiapan_menit",C.friday.prepMinutes);
 if(map.jumat_khutbah_mulai)C.friday.khutbahStart=map.jumat_khutbah_mulai;
 if(map.jumat_selesai)C.friday.end=map.jumat_selesai;
}
async function refresh(){for(const t of tabs)st.data[t]=await load(t);applyControl();st.lastRefresh=new Date();render()}
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
function mode(){
 if(forcedMode)return forcedMode;
 const n=st.now,p=st.pr,day=n.getDay();
 if(day===5){const [kh,km]=C.friday.khutbahStart.split(":").map(Number),[eh,em]=C.friday.end.split(":").map(Number),k=new Date(n),e=new Date(n);k.setHours(kh,km,0,0);e.setHours(eh,em,0,0);const prep=new Date(k.getTime()-C.friday.prepMinutes*60000);if(n>=prep&&n<k)return"JUMAT_PERSIAPAN";if(n>=k&&n<e)return"KHUTBAH_JUMAT"}
 for(const k of["shubuh","dzuhur","ashar","maghrib","isya"]){const t=p[k].date,mins=C.prayerModeMinutes[k]||20;if(n>=new Date(t.getTime()-C.preAdhanMinutes*60000)&&n<t)return"MENJELANG_ADZAN";if(n>=t&&n<new Date(t.getTime()+mins*60000))return"SHOLAT_BERLANGSUNG"}
 return"NORMAL"
}
function tick(){
 st.now=new Date();
 D.textContent=new Intl.DateTimeFormat("id-ID",{weekday:"long",day:"2-digit",month:"long",year:"numeric",timeZone:C.timezone}).format(st.now);
 T.textContent=new Intl.DateTimeFormat("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false,timeZone:C.timezone}).format(st.now).replace(/\./g,":");
 st.pr=prayers(st.now);st.next=nextPrayer(st.now,st.pr);
 const md=mode();if(md!==st.mode){st.mode=md;st.started=Date.now();render()}M.textContent=st.mode.replaceAll("_"," ");
 if(st.mode==="NORMAL"&&!forcedSlide){const dur=C.playlist[st.idx][1]*1000;if(Date.now()-st.started>=dur){st.idx=(st.idx+1)%C.playlist.length;st.started=Date.now();render()}}
 document.querySelectorAll("[data-cd]").forEach(x=>x.textContent=cd(st.next.date-st.now))
}
function head(title,sub){return`<div class="titlebar"><div><h2>${esc(title)}</h2><p>${esc(sub||"")}</p></div><div class="next">Menuju ${esc(st.next.label)}<br><b>${esc(st.next.time)} • <span data-cd>${cd(st.next.date-st.now)}</span></b></div></div>`}
const picons={shubuh:"☾",terbit:"☼",dzuhur:"☀",ashar:"◒",maghrib:"◓",isya:"☾"};
function dashboard(){
 return`<div class="slide dashboard">
 <section class="panel prayer">
   <div class="prayer-head"><div class="mosque-icon">♜</div><h2>Jadwal Sholat</h2></div>
   ${Object.values(st.pr).map(p=>`<div class="prayrow ${p.key===st.next.key?"active":""}"><span class="picon">${picons[p.key]}</span><span>${p.label}</span><b>${p.time}</b></div>`).join("")}
   <div class="count"><div class="count-title"><span class="gold">♜</span> Menuju ${st.next.label}</div><b data-cd>${cd(st.next.date-st.now)}</b><div class="count-labels"><span>JAM</span><span>MENIT</span><span>DETIK</span></div></div>
 </section>
 <section class="hero">
   <div class="heroimg"><div class="herotext"><div class="eyebrow">TEMPAT KEMBALI<br>MERAIH KETENANGAN</div><h2>Masjid<br>Al Ihsan Kapuih</h2><p>Rumah Ibadah, Pusat Ilmu,<br>Sarana Umat Berdaya</p></div></div>
   <div class="menu">
    ${[
      ["📣","Pengumuman Masjid","Info terbaru seputar masjid"],
      ["▤","Kajian Rutin","Majelis ilmu untuk semua"],
      ["▧","Laporan Keuangan","Transparan & amanah"],
      ["♜","Program Pembangunan","Bersama membangun rumah Allah"],
      ["QR","Donasi QRIS & Transfer","Salurkan infak terbaik Anda"]
    ].map(x=>`<div class="panel menucard"><span class="mi">${x[0]}</span><b>${x[1]}</b><span class="arr">›</span><small>${x[2]}</small></div>`).join("")}
   </div>
 </section></div>`
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
  <section class="panel qris"><div class="box"><img src="./assets/qris-rumah-tahfiz-final.jpg?v=final7" alt="QRIS Rumah Tahfiz Al Ihsan"><div class="qcaption"><b>QRIS Rumah Tahfiz Al Ihsan</b><small>NMID ID1022210128701 • Scan dengan aplikasi pembayaran</small></div></div></section>
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
 let title="Sholat Sedang Berlangsung",sub="Mohon menjaga ketenangan dan kekhusyukan",items=["📱 Mohon silent-kan HP","🧒 Anak-anak mohon tenang, tidak ribut / bersuara","👥 Rapatkan dan luruskan shaf"];
 if(st.mode==="MENJELANG_ADZAN"){title="Menuju "+st.next.label;sub="Persiapkan diri untuk sholat berjamaah";items=["📱 Mohon silent-kan HP","🧒 Anak-anak mohon tenang","🕌 Segera rapatkan dan luruskan shaf"]}
 if(st.mode==="JUMAT_PERSIAPAN"){title="Persiapan Sholat Jumat";sub="Mohon bersiap menyimak khutbah dengan tenang.";items=["📱 Silent-kan HP","🤫 Jaga ketenangan","🧒 Anak-anak dalam pengawasan"]}
 if(st.mode==="KHUTBAH_JUMAT"){title="Khutbah Jumat Sedang Berlangsung";sub="Mohon diam dan simak khutbah.";items=["🤫 Jangan berbicara saat khutbah","📱 Silent-kan HP","🧒 Anak-anak mohon tenang"]}
 return`<div class="slide mode"><div class="panel modebox"><img src="./assets/logo-masjid-final.png?v=final7"><h2>${title}</h2><p>${sub}</p>${st.mode==="MENJELANG_ADZAN"?`<div class="count"><div class="count-title">Menuju ${st.next.label}</div><b data-cd>${cd(st.next.date-st.now)}</b></div>`:""}<div class="reminders">${items.map(x=>`<div>${x}</div>`).join("")}</div></div></div>`
}
function debug(){
 return`<div class="slide debug"><h2>Al Ihsan Digital Information System — Debug</h2><div class="debuggrid"><div class="panel"><b>Waktu</b>${esc(st.now.toString())}</div><div class="panel"><b>Mode</b>${st.mode}</div><div class="panel"><b>Slide</b>${forcedSlide||C.playlist[st.idx][0]}</div><div class="panel"><b>Sholat berikutnya</b>${st.next.label} ${st.next.time}<br><span data-cd>${cd(st.next.date-st.now)}</span></div><div class="panel"><b>Jadwal</b>${Object.values(st.pr).map(x=>x.label+" "+x.time).join("<br>")}</div><div class="panel"><b>Sumber data</b>${Object.entries(st.status).map(([k,v])=>k+": "+v).join("<br>")}</div></div></div>`
}
function render(){if(!st.pr)return;S.innerHTML=qs.get("debug")==="1"?debug():st.mode==="NORMAL"?normal():modeScreen()}
tick();render();refresh();setInterval(tick,1000);setInterval(refresh,C.refreshMinutes*60000);
})();
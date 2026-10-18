(()=>{"use strict";
const prompt=document.getElementById("constructionDonationPrompt");
if(!prompt)return;
const messages=["SCAN QRIS","TRANSFER BANK NAGARI","KONFIRMASI VIA WA"];
let index=0;
let timer=null;
const intervalMs=5000;
function show(next){
  index=(next+messages.length)%messages.length;
  prompt.textContent=messages[index];
}
function start(){
  if(timer)return;
  timer=setInterval(()=>show(index+1),intervalMs);
}
function stop(){
  if(!timer)return;
  clearInterval(timer);
  timer=null;
}
show(0);
start();
document.addEventListener("visibilitychange",()=>{if(document.hidden)stop();else start();});
})();
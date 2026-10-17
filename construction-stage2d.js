(()=>{"use strict";

const root=document.getElementById("constructionVisualFocus");
if(!root)return;

const slides=Array.from(root.querySelectorAll(".construction-visual-image-live"));
const dots=Array.from(root.querySelectorAll(".construction-visual-dot-live"));
if(slides.length<2)return;

let index=0;
let timer=null;
const intervalMs=7000;

function show(next){
  index=(next+slides.length)%slides.length;
  slides.forEach((slide,i)=>{
    slide.classList.toggle("is-active",i===index);
  });
  dots.forEach((dot,i)=>{
    dot.classList.toggle("is-active",i===index);
  });
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

document.addEventListener("visibilitychange",()=>{
  if(document.hidden)stop();
  else start();
});
})();

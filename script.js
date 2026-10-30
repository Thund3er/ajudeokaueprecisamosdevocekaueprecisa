const cfg=window.CAMPAIGN_CONFIG||{};
const money=v=>Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});
document.getElementById("year").textContent=new Date().getFullYear();
document.getElementById("goalLabel").textContent=money(cfg.goal||115000);
document.getElementById("raisedLabel").textContent=money(cfg.raised||0);
const pct=Math.min(100,Math.max(0,(Number(cfg.raised||0)/Number(cfg.goal||115000))*100));
document.getElementById("progressFill").style.width=pct+"%";
document.getElementById("percentLabel").textContent=Math.round(pct)+"% alcançado";
const pix=String(cfg.pixKey||"").trim();
const pixDisplay=document.getElementById("pixDisplay"),copy=document.getElementById("copyPix");
if(pix){pixDisplay.textContent=pix;copy.disabled=false}else{pixDisplay.textContent="Aguardando nova chave PIX";copy.disabled=true}
copy.addEventListener("click",async()=>{if(!pix)return;try{await navigator.clipboard.writeText(pix);copy.textContent="Chave copiada!";setTimeout(()=>copy.textContent="Copiar chave",1800)}catch(e){copy.textContent="Não foi possível copiar"}});
const modal=document.getElementById("pixModal");
function openModal(){modal.classList.add("open");modal.setAttribute("aria-hidden","false")}
function closeModal(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true")}
document.getElementById("donateButton").addEventListener("click",()=>{if(pix){copy.click();openModal()}else openModal()});
document.getElementById("closeModal").onclick=closeModal;document.getElementById("modalOk").onclick=closeModal;modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
let selected=0;document.querySelectorAll("[data-amount]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-amount]").forEach(x=>x.classList.remove("active"));b.classList.add("active");selected=Number(b.dataset.amount);document.getElementById("customAmount").value=selected}));
document.getElementById("customAmount").addEventListener("input",()=>{selected=Number(document.getElementById("customAmount").value)||0;document.querySelectorAll("[data-amount]").forEach(x=>x.classList.toggle("active",Number(x.dataset.amount)===selected))});
function setImage(el,src){if(!src)return;const im=new Image();im.onload=()=>{el.style.backgroundImage=`url("${src}")`;el.style.backgroundSize="cover";el.style.backgroundPosition="center";el.classList.remove("photo-placeholder");const note=el.querySelector(".photo-note");if(note)note.remove();el.querySelectorAll("span").forEach(s=>s.remove())};im.src=src}
setImage(document.getElementById("heroPhoto"),cfg.heroImage);setImage(document.getElementById("storyPhoto"),cfg.storyImage);
const vf=document.getElementById("videoFrame");if(cfg.video){const v=document.createElement("video");v.controls=true;v.preload="metadata";v.src=cfg.video;v.onerror=()=>{};vf.innerHTML="";vf.appendChild(v)}
const lb=document.getElementById("lightbox"),lbImg=document.getElementById("lightboxImage");
document.querySelectorAll(".gallery-item").forEach((b,i)=>{const src=b.dataset.image;setImage(b,src);b.addEventListener("click",()=>{const im=new Image();im.onload=()=>{lbImg.src=src;lb.classList.add("open")};im.src=src})});
document.getElementById("lightboxClose").onclick=()=>lb.classList.remove("open");lb.addEventListener("click",e=>{if(e.target===lb)lb.classList.remove("open")});
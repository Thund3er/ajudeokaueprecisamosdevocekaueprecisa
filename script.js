const cfg=window.CAMPAIGN_CONFIG||{};
const money=v=>Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});
document.getElementById("year").textContent=new Date().getFullYear();
document.getElementById("goalLabel").textContent=money(cfg.goal||115000);
document.getElementById("raisedLabel").textContent=money(cfg.raised||0);
const pct=Math.min(100,Math.max(0,(Number(cfg.raised||0)/Number(cfg.goal||115000))*100));
document.getElementById("progressFill").style.width=pct+"%";
document.getElementById("percentLabel").textContent=Math.round(pct)+"% alcançado";
let selected=0;document.querySelectorAll("[data-amount]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-amount]").forEach(x=>x.classList.remove("active"));b.classList.add("active");selected=Number(b.dataset.amount);document.getElementById("customAmount").value=selected}));
document.getElementById("customAmount").addEventListener("input",()=>{selected=Number(document.getElementById("customAmount").value)||0;document.querySelectorAll("[data-amount]").forEach(x=>x.classList.toggle("active",Number(x.dataset.amount)===selected))});
const modal=document.getElementById("pixModal"),copy=document.getElementById("copyPix"),form=document.getElementById("donorForm"),formError=document.getElementById("formError"),cpfInput=document.getElementById("donorCpf");
let pixCode="",pixTimer=null,pixDeadline=0;
function showState(s){modal.querySelectorAll(".pix-state").forEach(el=>el.hidden=el.dataset.state!==s)}
function openModal(s){showState(s);modal.classList.add("open");modal.setAttribute("aria-hidden","false")}
function closeModal(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");clearTimeout(pixTimer)}
document.getElementById("closeModal").onclick=closeModal;modal.querySelectorAll(".modal-ok").forEach(b=>b.onclick=closeModal);modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
copy.addEventListener("click",async()=>{if(!pixCode)return;try{await navigator.clipboard.writeText(pixCode);copy.textContent="Código copiado!"}catch(e){copy.textContent="Selecione e copie o código acima"}setTimeout(()=>copy.textContent="Copiar código PIX",2200)});
cpfInput.addEventListener("input",()=>{const d=cpfInput.value.replace(/\D/g,"").slice(0,11);cpfInput.value=d.replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})\.(\d{3})(\d)/,"$1.$2.$3").replace(/(\d{3})-?(\d{1,2})$/,"$1-$2")});
// A MasterFy avisa o pagamento por webhook; aqui só consultamos o status gravado no nosso servidor.
function checkStatus(id){if(Date.now()>pixDeadline||!modal.classList.contains("open"))return;fetch("/api/pix/"+encodeURIComponent(id)).then(r=>r.ok?r.json():null).then(d=>{if(d&&d.status==="PAID")showState("paid");else pixTimer=setTimeout(()=>checkStatus(id),5000)}).catch(()=>{pixTimer=setTimeout(()=>checkStatus(id),5000)})}
form.addEventListener("submit",async e=>{e.preventDefault();formError.textContent="";
  const valor=Number(document.getElementById("customAmount").value)||selected,cpf=cpfInput.value;
  if(!(valor>0))return formError.textContent="Escolha ou digite o valor da doação.";
  if(valor<3)return formError.textContent="O valor mínimo para doar é R$ 3.";
  if(cpf.replace(/\D/g,"").length!==11)return formError.textContent="Informe um CPF válido.";
  const btn=document.getElementById("donateButton");btn.disabled=true;openModal("loading");
  try{const r=await fetch("/api/pix",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({valor,cpf})});const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.erro||"Não foi possível gerar o PIX agora. Tente novamente em alguns minutos.");
    pixCode=d.copiaECola;document.getElementById("pixCode").textContent=pixCode;document.getElementById("pixQr").src=d.qrCode;document.getElementById("pixAmount").textContent=d.valor.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
    showState("pending");pixDeadline=Date.now()+30*60*1000;clearTimeout(pixTimer);pixTimer=setTimeout(()=>checkStatus(d.id),5000)}
  catch(err){document.getElementById("pixErrorMsg").textContent=err.message;showState("error")}
  finally{btn.disabled=false}});
function setImage(el,src){if(!src)return;const im=new Image();im.onload=()=>{el.style.backgroundImage=`url("${src}")`;el.style.backgroundSize="cover";el.style.backgroundPosition="center";el.classList.remove("photo-placeholder");const note=el.querySelector(".photo-note");if(note)note.remove();el.querySelectorAll("span").forEach(s=>s.remove())};im.src=src}
setImage(document.getElementById("heroPhoto"),cfg.heroImage);setImage(document.getElementById("storyPhoto"),cfg.storyImage);
const vf=document.getElementById("videoFrame");if(cfg.video){const v=document.createElement("video");v.controls=true;v.preload="metadata";v.src=cfg.video;v.onerror=()=>{};vf.innerHTML="";vf.appendChild(v)}
const lb=document.getElementById("lightbox"),lbImg=document.getElementById("lightboxImage");
document.querySelectorAll(".gallery-item").forEach((b,i)=>{const src=b.dataset.image;setImage(b,src);b.addEventListener("click",()=>{const im=new Image();im.onload=()=>{lbImg.src=src;lb.classList.add("open")};im.src=src})});
document.getElementById("lightboxClose").onclick=()=>lb.classList.remove("open");lb.addEventListener("click",e=>{if(e.target===lb)lb.classList.remove("open")});
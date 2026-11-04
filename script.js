const cfg=window.CAMPAIGN_CONFIG||{};
const money=v=>{const n=Math.round(Number(v||0)*100)/100,d=Number.isInteger(n)?0:2;return n.toLocaleString("pt-BR",{style:"currency",currency:"BRL",minimumFractionDigits:d,maximumFractionDigits:d})};
document.getElementById("year").textContent=new Date().getFullYear();
document.getElementById("goalLabel").textContent=money(cfg.goal||115000);
function renderProgress(raised){const goal=Number(cfg.goal||115000),pct=Math.min(100,Math.max(0,raised/goal*100));document.querySelectorAll("[data-raised]").forEach(el=>el.textContent=money(raised));document.querySelectorAll("[data-fill]").forEach(el=>el.style.width=pct+"%");document.querySelectorAll("[data-percent]").forEach(el=>el.textContent=pct.toLocaleString("pt-BR",{maximumFractionDigits:1})+"% alcançado")}
// Total = valor recebido fora do site (config.js) + PIX confirmados pelo site.
function updateRaised(){fetch("/api/arrecadado").then(r=>r.ok?r.json():null).then(d=>{if(d)renderProgress(Number(cfg.raised||0)+Number(d.total||0))}).catch(()=>{})}
renderProgress(Number(cfg.raised||0));updateRaised();
let selected=50;const amountInput=document.getElementById("customAmount");
function selectAmount(v,fromInput){selected=Number(v)||0;if(!fromInput)amountInput.value=selected||"";document.querySelectorAll("[data-amount]").forEach(x=>x.classList.toggle("active",Number(x.dataset.amount)===selected));document.getElementById("donateLabel").textContent=selected>=3?"Gerar PIX de "+money(selected):"Gerar PIX"}
document.querySelectorAll("[data-amount]").forEach(b=>b.addEventListener("click",()=>selectAmount(b.dataset.amount)));
amountInput.addEventListener("input",()=>selectAmount(amountInput.value,true));
document.querySelectorAll("[data-preset]").forEach(a=>a.addEventListener("click",()=>selectAmount(a.dataset.preset)));
selectAmount(selected);
const modal=document.getElementById("pixModal"),copy=document.getElementById("copyPix"),form=document.getElementById("donorForm"),formError=document.getElementById("formError"),cpfInput=document.getElementById("donorCpf");
let pixCode="",pixTimer=null,pixDeadline=0,pixValor=0;
// Meta Pixel: avisa a doação confirmada (Purchase) com o valor, para os anúncios otimizarem por quem doa.
function trackPurchase(valor){if(typeof fbq==="function"&&valor>0)fbq("track","Purchase",{value:valor,currency:"BRL"})}
// Vídeo da janela do QR Code. Começa com som no clique em "Gerar PIX" (o clique libera o som no navegador);
// se o navegador bloquear, toca sem som e mostra o botão "Ativar som".
const pixVideo=document.getElementById("pixVideo"),pixVideoWrap=document.getElementById("pixVideoWrap"),pixSoundBtn=document.getElementById("pixSoundBtn");let heroWasPlaying=false;
function startPixVideo(){if(!cfg.pixVideo)return;if(!pixVideo.getAttribute("src"))pixVideo.src=cfg.pixVideo;pixVideo.currentTime=0;pixVideo.muted=false;pixSoundBtn.hidden=true;pixVideo.play().catch(()=>{pixVideo.muted=true;pixSoundBtn.hidden=false;pixVideo.play().catch(()=>{})})}
// Se o vídeo não carregar, esconde a área em vez de mostrar um quadro preto.
let pixVideoFailed=false;pixVideo.addEventListener("error",()=>{pixVideoFailed=true;pixVideoWrap.hidden=true});
pixSoundBtn.addEventListener("click",()=>{pixVideo.muted=false;pixVideo.play().catch(()=>{});pixSoundBtn.hidden=true});
function showState(s){modal.querySelectorAll(".pix-state").forEach(el=>el.hidden=el.dataset.state!==s);pixVideoWrap.hidden=pixVideoFailed||!cfg.pixVideo||!(s==="loading"||s==="pending");if(pixVideoWrap.hidden)pixVideo.pause()}
function openModal(s){if(heroVideo){heroWasPlaying=!heroVideo.paused;heroVideo.pause()}showState(s);modal.classList.add("open");modal.setAttribute("aria-hidden","false")}
function closeModal(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");clearTimeout(pixTimer);pixVideo.pause();if(heroVideo&&heroWasPlaying)heroVideo.play().catch(()=>{})}
document.getElementById("closeModal").onclick=closeModal;modal.querySelectorAll(".modal-ok").forEach(b=>b.onclick=closeModal);modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
const copyHint=document.getElementById("copyHint");
copy.addEventListener("click",async()=>{if(!pixCode)return;try{await navigator.clipboard.writeText(pixCode);copy.textContent="Código copiado! ✓";copyHint.innerHTML="Agora abra o app do seu banco e cole em <strong>PIX copia e cola</strong>. O Kauê agradece! 💚";copyHint.classList.add("done")}catch(e){copy.textContent="Selecione e copie o código abaixo"}setTimeout(()=>copy.textContent="Copiar código PIX",3000)});
document.getElementById("shareWhats").href="https://wa.me/?text="+encodeURIComponent("Acabei de doar para ajudar o Kauê 💚 Ele precisa da nossa ajuda. Doe qualquer valor via PIX: "+location.origin+"/");
cpfInput.addEventListener("input",()=>{const d=cpfInput.value.replace(/\D/g,"").slice(0,11);cpfInput.value=d.replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})\.(\d{3})(\d)/,"$1.$2.$3").replace(/(\d{3})-?(\d{1,2})$/,"$1-$2")});
// A MasterFy avisa o pagamento por webhook; aqui só consultamos o status gravado no nosso servidor.
function checkStatus(id){if(Date.now()>pixDeadline||!modal.classList.contains("open"))return;fetch("/api/pix/"+encodeURIComponent(id)).then(r=>r.ok?r.json():null).then(d=>{if(d&&d.status==="PAID"){trackPurchase(pixValor);pixValor=0;showState("paid");updateRaised()}else pixTimer=setTimeout(()=>checkStatus(id),5000)}).catch(()=>{pixTimer=setTimeout(()=>checkStatus(id),5000)})}
form.addEventListener("submit",async e=>{e.preventDefault();formError.textContent="";
  const valor=Number(document.getElementById("customAmount").value)||selected,cpf=cpfInput.value;
  if(!(valor>0))return formError.textContent="Escolha ou digite o valor da doação.";
  if(valor<3)return formError.textContent="O valor mínimo para doar é R$ 3.";
  if(cpf.replace(/\D/g,"").length!==11)return formError.textContent="Informe um CPF válido.";
  const btn=document.getElementById("donateButton");btn.disabled=true;openModal("loading");startPixVideo();
  try{const r=await fetch("/api/pix",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({valor,cpf})});const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.erro||"Não foi possível gerar o PIX agora. Tente novamente em alguns minutos.");
    pixCode=d.copiaECola;pixValor=Number(d.valor)||0;copyHint.classList.remove("done");copyHint.innerHTML="Depois, abra o app do seu banco e cole em <strong>PIX copia e cola</strong>.";document.getElementById("pixCode").textContent=pixCode;document.getElementById("pixQr").src=d.qrCode;document.getElementById("pixAmount").textContent=d.valor.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
    showState("pending");pixDeadline=Date.now()+30*60*1000;clearTimeout(pixTimer);pixTimer=setTimeout(()=>checkStatus(d.id),5000)}
  catch(err){document.getElementById("pixErrorMsg").textContent=err.message;showState("error")}
  finally{btn.disabled=false}});
function setImage(el,src){if(!src)return;const im=new Image();im.onload=()=>{el.style.backgroundImage=`url("${src}")`;el.style.backgroundSize="cover";el.style.backgroundPosition="center";el.classList.remove("photo-placeholder");const note=el.querySelector(".photo-note");if(note)note.remove();el.querySelectorAll("span").forEach(s=>s.remove())};im.src=src}
setImage(document.getElementById("storyPhoto"),cfg.storyImage);
// Vídeo do topo: começa sozinho sem som (os navegadores só deixam tocar automático assim).
const vf=document.getElementById("videoFrame"),soundBtn=document.getElementById("soundBtn");let heroVideo=null;
if(cfg.video){heroVideo=document.createElement("video");heroVideo.muted=true;heroVideo.loop=true;heroVideo.autoplay=true;heroVideo.playsInline=true;heroVideo.setAttribute("muted","");heroVideo.setAttribute("playsinline","");heroVideo.preload="auto";heroVideo.poster=cfg.heroImage||"";heroVideo.src=cfg.video;vf.appendChild(heroVideo);heroVideo.play().catch(()=>{})}
function playWithSound(){if(!heroVideo)return;heroVideo.muted=false;heroVideo.loop=false;heroVideo.controls=true;heroVideo.currentTime=0;heroVideo.play().catch(()=>{});vf.classList.add("with-sound");soundBtn.hidden=true}
const lb=document.getElementById("lightbox"),lbImg=document.getElementById("lightboxImage");
document.querySelectorAll(".gallery-item").forEach((b,i)=>{const src=b.dataset.image;setImage(b,src);b.addEventListener("click",()=>{const im=new Image();im.onload=()=>{lbImg.src=src;lb.classList.add("open")};im.src=src})});
document.getElementById("lightboxClose").onclick=()=>lb.classList.remove("open");lb.addEventListener("click",e=>{if(e.target===lb)lb.classList.remove("open")});document.querySelectorAll("[data-play-video]").forEach(el=>el.addEventListener("click",e=>{e.preventDefault();document.getElementById("video").scrollIntoView({behavior:"smooth",block:"center"});playWithSound()}));
// Barra fixa "Doar via PIX": aparece depois do topo e some quando o formulário de doação está na tela.
const bar=document.getElementById("donateBar"),seen=new Map();
const barObs=new IntersectionObserver(es=>{es.forEach(e=>seen.set(e.target.id,e.isIntersecting));bar.classList.toggle("show",!seen.get("topo")&&!seen.get("doar"))});
barObs.observe(document.getElementById("topo"));barObs.observe(document.getElementById("doar"));
// Lista "Quem já ajudou", vinda do config.js.
const donorList=document.getElementById("donorList"),donors=cfg.donors||[];
donors.forEach(d=>{const li=document.createElement("li"),anon=/^an[oô]nimo$/i.test(d.name.trim());li.innerHTML='<span class="donor-avatar"></span><span class="donor-name"></span><span class="donor-amount"></span>';li.querySelector(".donor-avatar").textContent=anon?"♡":d.name.trim()[0].toUpperCase();li.querySelector(".donor-name").textContent=d.name;li.querySelector(".donor-amount").textContent="ajudou com "+money(d.amount);donorList.appendChild(li)});
if(!donors.length)document.getElementById("apoiadores").hidden=true;

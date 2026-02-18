// ── STATE ──
let ck={},sr="",ac="All",sc="All",sf="All",rf="All",shf=false,sco=false,ex=null,vw="list";
let tm="dark",currentPark=null,A=[];
try{const t=localStorage.getItem("addo-theme");if(t)tm=t}catch(e){}
function applyTheme(){document.body.classList.toggle('light',tm==='light');try{document.querySelector('meta[name="theme-color"]').content=tm==='light'?'#F5F0E8':'#141208'}catch(e){}}
applyTheme();
let imgCache={};

// ── STORAGE MIGRATION ──
function nameToId(name){return name.toLowerCase().replace(/[\/()'.]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')}

function migrateStorage(){
  try{
    const old=localStorage.getItem("addo-v5");
    if(!old)return;
    const oldCk=JSON.parse(old);
    // Old keys are animal names like "African Elephant"
    const addo={};
    Object.entries(oldCk).forEach(([name,ts])=>{
      const id=nameToId(name);
      if(id)addo[id]=ts;
    });
    const newCk={addo};
    localStorage.setItem("wildlife-ck-v1",JSON.stringify(newCk));
    localStorage.removeItem("addo-v5");
  }catch(e){console.log('Migration error:',e)}
}
migrateStorage();

// Load saved state & image cache
try{const d=localStorage.getItem("wildlife-ck-v1");if(d)ck=JSON.parse(d)}catch(e){}
try{const d=localStorage.getItem("addo-imgs-v2");if(d)imgCache=JSON.parse(d)}catch(e){}

function sv(){try{localStorage.setItem("wildlife-ck-v1",JSON.stringify(ck))}catch(e){}}
function svImgs(){try{localStorage.setItem("addo-imgs-v2",JSON.stringify(imgCache))}catch(e){}}
function rc(r){return r==="Common"?"#6B8F3C":r==="Uncommon"?"#C4A86A":"#BF6A3D"}
function e(s){return s.replace(/&/g,'&amp;').replace(/'/g,'&#39;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

// ── BUILD PARK SPECIES ──
function buildParkSpecies(park){
  return park.species.map(ps=>{
    const base=ANIMALS[ps.id];
    if(!base)return null;
    return {...base, r:ps.r, t:ps.t, _id:ps.id};
  }).filter(Boolean);
}

// ── CROSS-PARK SIGHTINGS ──
function getCrossParkSightings(animalId){
  const sightings=[];
  PARKS.forEach(p=>{
    if(ck[p.id]&&ck[p.id][animalId]){
      sightings.push({parkId:p.id, parkName:p.name, date:ck[p.id][animalId]});
    }
  });
  return sightings;
}

// ── ROUTING ──
function getRoute(){
  const hash=location.hash.replace('#','');
  if(!hash||hash==='home')return {page:'home'};
  const m=hash.match(/^park\/(.+)$/);
  if(m){
    const park=PARKS.find(p=>p.id===m[1]);
    if(park)return {page:'park',park};
  }
  return {page:'home'};
}

function navigate(hash){
  location.hash=hash;
}

// ── LOAD IMAGES FROM WIKIPEDIA API ──
let imgLoading=false, imgLoaded=false;
async function loadImages(){
  if(imgLoading||imgLoaded||!A.length)return;
  const missing=A.filter(a=>a.wp&&!imgCache[a.wp]);
  if(missing.length===0){imgLoaded=true;return}
  imgLoading=true;
  R();

  for(let i=0;i<missing.length;i+=50){
    const batch=missing.slice(i,i+50);
    const titles=batch.map(a=>a.wp).join('|');
    try{
      const resp=await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${titles}&prop=pageimages&format=json&pithumbsize=640&origin=*&redirects=1`);
      const data=await resp.json();
      if(data.query&&data.query.pages){
        Object.values(data.query.pages).forEach(p=>{
          if(p.thumbnail&&p.thumbnail.source){
            const key=p.title.replace(/ /g,'_');
            imgCache[key]=p.thumbnail.source;
            batch.forEach(a=>{
              if(!imgCache[a.wp]){
                const normTitle=a.wp.replace(/_/g,' ');
                if(p.title===normTitle||p.title.toLowerCase()===normTitle.toLowerCase()){
                  imgCache[a.wp]=p.thumbnail.source;
                }
              }
            });
          }
        });
        if(data.query.redirects){
          data.query.redirects.forEach(rd=>{
            const fromKey=rd.from.replace(/ /g,'_');
            const toKey=rd.to.replace(/ /g,'_');
            if(imgCache[toKey]&&!imgCache[fromKey])imgCache[fromKey]=imgCache[toKey];
          });
        }
        if(data.query.normalized){
          data.query.normalized.forEach(n=>{
            const fromKey=n.from.replace(/ /g,'_');
            const toKey=n.to.replace(/ /g,'_');
            if(imgCache[toKey]&&!imgCache[fromKey])imgCache[fromKey]=imgCache[toKey];
          });
        }
      }
    }catch(err){console.log('Image load error:',err)}
    svImgs();
    R();
  }
  imgLoading=false;
  imgLoaded=true;
  R();
}

// ── RENDER PARK SELECTOR ──
function renderHome(){
  let h=`<div class="hdr"><button class="tmb" id="tmb">${tm==='dark'?'\u2600\uFE0F':'\uD83C\uDF19'}</button><div class="hdr-ey">South Africa</div><h1>Wildlife Checklist</h1><div class="hdr-m">Choose a park to explore</div></div>`;
  h+=`<div class="park-list">`;
  PARKS.forEach(park=>{
    const parkCk=ck[park.id]||{};
    const spotted=Object.keys(parkCk).length;
    const total=park.species.length;
    const pct=total?spotted/total*100:0;
    h+=`<div class="park-card" data-park="${park.id}">`;
    h+=`<div class="park-icon">${park.icon}</div>`;
    h+=`<div class="park-info">`;
    h+=`<div class="park-name">${park.name}</div>`;
    h+=`<div class="park-sub">${park.subtitle}</div>`;
    h+=`<div class="park-prog">`;
    h+=`<div class="park-prog-text">${spotted} / ${total} spotted (${pct.toFixed(1)}%)</div>`;
    h+=`<div class="park-prog-bar"><div class="park-prog-fill" style="width:${pct}%;background:${pct>50?'linear-gradient(90deg,#6B8F3C,#A8CC5A)':'linear-gradient(90deg,#C4A86A,#D4B87A)'}"></div></div>`;
    h+=`</div></div></div>`;
  });
  h+=`</div>`;

  document.getElementById('app').innerHTML=h;

  // Events
  document.getElementById('tmb').onclick=()=>{tm=tm==='dark'?'light':'dark';applyTheme();try{localStorage.setItem("addo-theme",tm)}catch(e){}R()};
  document.querySelectorAll('[data-park]').forEach(el=>el.onclick=()=>{navigate('park/'+el.dataset.park)});
}

// ── RENDER CHECKLIST ──
function renderPark(park){
const CATS=[...new Set(A.map(x=>x.c))];
const fl=A.filter(a=>{
  if(ac!=="All"&&a.c!==ac)return false;
  if(sc!=="All"&&a.s!==sc)return false;
  if(sf!=="All"&&a.sz!==sf)return false;
  if(rf!=="All"&&a.r!==rf)return false;
  const parkCk=ck[park.id]||{};
  if(sco&&!parkCk[a._id])return false;
  if(sr){const q=sr.toLowerCase();return a.n.toLowerCase().includes(q)||a.s.toLowerCase().includes(q)||a.c.toLowerCase().includes(q)||a.cl.toLowerCase().includes(q)}
  return true;
});
const parkCk=ck[park.id]||{};
const tc=Object.keys(parkCk).length,pr=tc/A.length*100;
const hf=sf!=="All"||rf!=="All"||sc!=="All"||sco||sr;

let h=`<div class="hdr"><button class="back-btn" id="backBtn">\u2190</button><button class="tmb" id="tmb">${tm==='dark'?'\u2600\uFE0F':'\uD83C\uDF19'}</button><div class="hdr-ey">${e(park.name)}</div><h1>${e(park.subtitle)}</h1><div class="hdr-m">${A.length} species \u2022 Tap to spot</div></div>`;

if(imgLoading){h+=`<div class="ild">\uD83D\uDCF7 Loading photos\u2026</div>`}

h+=`<div class="pb"><div class="pr"><span class="ps">${tc} / ${A.length}</span><span class="pp">${pr.toFixed(1)}% spotted</span></div><div class="pt"><div class="pf" style="width:${pr}%;background:${pr>50?'linear-gradient(90deg,#6B8F3C,#A8CC5A)':'linear-gradient(90deg,#C4A86A,#D4B87A)'}"></div></div><div class="ccs">`;
CATS.forEach(cat=>{const ct=A.filter(a=>a.c===cat&&parkCk[a._id]).length,tot=A.filter(a=>a.c===cat).length,clr=CC[cat].bg;h+=`<div class="cci" style="${ct>0?`background:${clr}28;color:${clr};border-color:${clr}40`:''}">${CI[cat]} ${ct}/${tot}</div>`});
h+=`</div></div>`;

h+=`<div class="sb"><span class="si">\uD83D\uDD0D</span><input type="text" placeholder="Search by name, color, type..." value="${e(sr)}" id="sinp">${sr?'<button class="sx" id="scl">\u2715</button>':''}</div>`;

h+=`<div class="cts"><div class="ctb ${ac==='All'?'a':''}" data-cat="All">All (${A.length})</div>`;
CATS.forEach(cat=>{const clr=CC[cat].bg;h+=`<div class="ctb ${ac===cat?'a':''}" data-cat="${cat}" style="${ac===cat?`border-color:${clr}80;background:${clr}20;color:${clr}`:''}">${CI[cat]} ${cat} (${A.filter(a=>a.c===cat).length})</div>`});
h+=`</div>`;

const scSource=ac==='All'?A:A.filter(a=>a.c===ac);
const subs=[...new Set(scSource.map(x=>x.s))];
if(subs.length>1){
h+=`<div class="cts scts"><div class="ctb sc ${sc==='All'?'a':''}" data-sc="All">All</div>`;
subs.forEach(sub=>{const cnt=scSource.filter(a=>a.s===sub).length;const clr=ac!=='All'?CC[ac].bg:'var(--gold)';h+=`<div class="ctb sc ${sc===sub?'a':''}" data-sc="${sub}" style="${sc===sub?`border-color:${clr}80;background:${clr}20;color:${clr}`:''}">${sub} (${cnt})</div>`});
h+=`</div>`;
}

h+=`<div class="fb"><div class="fbn ${hf?'on':''}" id="ftg">\u2699 Filters${hf?' \u25CF':''}</div><div class="fbn ${sco?'sp':''}" id="spt">${sco?'\u2713 Spotted':'\u2610 Spotted'}</div>`;
if(hf)h+=`<div class="fbn cl" id="cla">Clear</div>`;
h+=`<span class="fcn">${fl.length} shown</span><div class="vt"><button class="vtb ${vw==='list'?'on':''}" id="vl" title="List view">☰</button><button class="vtb ${vw==='grid'?'on':''}" id="vg" title="Grid view">▦</button></div></div>`;

h+=`<div class="fp ${shf?'show':''}"><div class="fg"><div class="fgl">Size</div><div class="fos">`;
["All",...SIZES].forEach(s=>{h+=`<div class="fo ${sf===s?'on':''}" data-sz="${s}">${s}</div>`});
h+=`</div></div><div class="fg"><div class="fgl">Rarity</div><div class="fos">`;
["All","Common","Uncommon","Rare"].forEach(r=>{const clr=rc(r);h+=`<div class="fo ${rf===r?'on':''}" data-rf="${r}" style="${rf===r&&r!=='All'?`border-color:${clr}60;background:${clr}18;color:${clr}`:''}">${r}</div>`});
h+=`</div></div></div>`;

h+=`<div class="al${vw==='grid'?' grid':''}">`;
if(!fl.length)h+=`<div class="em"><div class="emi">\uD83D\uDD2D</div><div class="emt">No animals match your filters</div><div class="emb" id="eclr">Clear filters</div></div>`;

fl.forEach((a,i)=>{
const ic=!!parkCk[a._id],ie=ex===a._id,clr=CC[a.c].bg,rcl=rc(a.r);
const nm=e(a.n);
const imgUrl=a.wp&&imgCache[a.wp]?imgCache[a.wp]:null;
const rCls=a.r==="Common"?"rC":a.r==="Uncommon"?"rU":"rR";
// Cross-park sightings
const xpSightings=getCrossParkSightings(a._id);
const xpOther=xpSightings.filter(s=>s.parkId!==park.id);

h+=`<div class="ac ${ic?'ck':''}">`;
h+=`<div class="cv" data-exp="${a._id}">`;
if(imgUrl){h+=`<img class="ci" src="${imgUrl}" alt="${nm}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`}
h+=`<div class="cp" style="${imgUrl?'display:none':''}">${a.i}</div>`;
h+=`<div class="cg"></div>`;
h+=`<div class="ctb2"><span class="rb ${rCls}">${a.r}</span></div>`;
h+=`<div class="ckb ${ic?'ck':''}" data-chk="${a._id}">${ic?'\u2713':''}</div>`;
h+=`<div class="cio"><div class="cn">${a.n}</div><div class="cta"><span class="ctg ctg-s" style="background:${clr}30;color:${clr}">${a.s}</span><span class="ctg ctg-z">${a.sz} \u2022 ${a.cl}</span></div></div>`;
h+=`<span class="ceh ${ie?'o':''}">\u25BC</span>`;
h+=`</div>`;
h+=`<div class="cd ${ie?'open':''}"><div class="cd-wrap"><div class="cdi">`;
h+=`<div class="ds"><div class="dl">\uD83D\uDCA1 Safari Tip</div><div class="dt">${a.t}</div></div>`;
if(a.d){h+=`<div class="ds"><div class="dl">\uD83D\uDCD6 About</div><div class="dd">${a.d}</div></div>`}
if(a.w||a.l||a.life||a.act||a.diet){
h+=`<div class="ds"><div class="dl">\uD83D\uDCCA Quick Facts</div><div class="dg">`;
if(a.w)h+=`<div class="dst"><div class="dsl">\u2696\uFE0F Weight</div><div class="dsv">${a.w}</div></div>`;
if(a.l)h+=`<div class="dst"><div class="dsl">\uD83D\uDCCF Size</div><div class="dsv">${a.l}</div></div>`;
if(a.life)h+=`<div class="dst"><div class="dsl">\u23F3 Lifespan</div><div class="dsv">${a.life}</div></div>`;
if(a.act)h+=`<div class="dst"><div class="dsl">\uD83D\uDD52 Activity</div><div class="dsv">${a.act}</div></div>`;
h+=`</div>`;
if(a.diet)h+=`<div style="margin-top:8px"><div class="dst"><div class="dsl">\uD83C\uDF3F Diet</div><div class="dsv">${a.diet}</div></div></div>`;
h+=`</div>`}
if(ic&&parkCk[a._id])h+=`<div class="ds"><div class="spb">\u2713 Spotted on ${new Date(parkCk[a._id]).toLocaleDateString()}</div></div>`;
// Cross-park badge
if(xpOther.length>0){
  const totalParks=xpSightings.length;
  const badgeText=totalParks>1?`Seen in ${totalParks} parks`:`Also seen in ${xpOther[0].parkName}`;
  let tooltipHtml='';
  xpSightings.forEach(s=>{tooltipHtml+=`<div class="xp-row">${e(s.parkName)} — ${new Date(s.date).toLocaleDateString()}</div>`});
  h+=`<div class="ds"><div class="xp-badge" data-xp="${a._id}">🌍 ${badgeText}<div class="xp-tooltip">${tooltipHtml}</div></div></div>`;
}
h+=`</div></div></div></div>`;
});

h+=`</div>`;

const hadFocus=document.activeElement&&document.activeElement.id==='sinp';
const cursorPos=hadFocus?document.activeElement.selectionStart:null;
document.getElementById('app').innerHTML=h;

// Events
document.getElementById('sinp').addEventListener('input',function(){sr=this.value;R()});
if(hadFocus){const inp=document.getElementById('sinp');inp.focus();if(cursorPos!==null)inp.setSelectionRange(cursorPos,cursorPos)}
const scl=document.getElementById('scl');if(scl)scl.onclick=()=>{sr='';R()};
document.getElementById('ftg').onclick=()=>{shf=!shf;R()};
document.getElementById('spt').onclick=()=>{sco=!sco;R()};
document.getElementById('vl').onclick=()=>{vw='list';ex=null;R()};
document.getElementById('vg').onclick=()=>{vw='grid';ex=null;R()};
document.getElementById('tmb').onclick=()=>{tm=tm==='dark'?'light':'dark';applyTheme();try{localStorage.setItem("addo-theme",tm)}catch(e){}R()};
document.getElementById('backBtn').onclick=()=>{navigate('home')};
const cla=document.getElementById('cla');if(cla)cla.onclick=()=>{sr='';sc='All';sf='All';rf='All';sco=false;R()};
const eclr=document.getElementById('eclr');if(eclr)eclr.onclick=()=>{sr='';sc='All';sf='All';rf='All';sco=false;R()};
document.querySelectorAll('[data-cat]').forEach(el=>el.onclick=()=>{ac=el.dataset.cat;sc='All';R()});
document.querySelectorAll('[data-sc]').forEach(el=>el.onclick=()=>{sc=el.dataset.sc;R()});
document.querySelectorAll('[data-sz]').forEach(el=>el.onclick=()=>{sf=el.dataset.sz;R()});
document.querySelectorAll('[data-rf]').forEach(el=>el.onclick=()=>{rf=el.dataset.rf;R()});
document.querySelectorAll('[data-chk]').forEach(el=>el.onclick=function(ev){
  ev.stopPropagation();const id=this.dataset.chk;
  if(!ck[park.id])ck[park.id]={};
  if(ck[park.id][id])delete ck[park.id][id];else ck[park.id][id]=new Date().toISOString();
  sv();R();
});
document.querySelectorAll('[data-exp]').forEach(el=>el.onclick=function(ev){
  if(ev.target.closest('[data-chk]'))return;
  if(vw==='grid'){
    const id=this.dataset.exp;
    if(!ck[park.id])ck[park.id]={};
    if(ck[park.id][id])delete ck[park.id][id];else ck[park.id][id]=new Date().toISOString();
    sv();R();return;
  }
  const id=this.dataset.exp;
  ex=ex===id?null:id;R();
});
// Cross-park badge click to toggle tooltip
document.querySelectorAll('.xp-badge').forEach(el=>el.onclick=function(ev){
  ev.stopPropagation();
  this.classList.toggle('show');
});
}

// ── MAIN RENDER ──
function R(){
  const route=getRoute();
  if(route.page==='park'){
    currentPark=route.park;
    A=buildParkSpecies(currentPark);
    renderPark(currentPark);
    loadImages();
  } else {
    currentPark=null;
    A=[];
    // Reset filters when returning home
    sr="";ac="All";sc="All";sf="All";rf="All";shf=false;sco=false;ex=null;
    imgLoaded=false;
    renderHome();
  }
}

window.addEventListener('hashchange',R);
R();

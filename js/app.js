// ── STATE ──
let ck={},sr="",ac="All",sc="All",sf="All",rf="All",cf="All",shf=false,sco=false,ex=null,vw="list",srt="az",shs=false;
let tm="light",currentPark=null,A=[],pf="All";
let prevRoute=null,wikiCache={};
try{const t=localStorage.getItem("addo-theme");if(t)tm=t}catch(e){}
function applyTheme(){document.body.classList.toggle('light',tm==='light');try{document.querySelector('meta[name="theme-color"]').content=tm==='light'?'#F5F0E8':'#141208'}catch(e){}}
applyTheme();
let imgCache={};

// ── LIGHTBOX ──
function hiResUrl(url){
  if(!url)return url;
  return url.replace(/\/(\d+)px-/,function(m,w){return '/'+Math.min(parseInt(w)*2,1280)+'px-'});
}
function openLightbox(imgUrl,name,emoji,rarity){
  const overlay=document.getElementById('lbOverlay');
  const img=document.getElementById('lbImg');
  const hiSrc=hiResUrl(imgUrl);
  img.src=hiSrc;
  img.onerror=function(){if(this.src!==imgUrl){this.src=imgUrl}};
  img.alt=name;
  document.getElementById('lbEmoji').textContent=emoji;
  document.getElementById('lbName').textContent=name;
  const rb=document.getElementById('lbRarity');
  rb.textContent=rarity;
  const rCls=rarity==='Common'?'rC':rarity==='Uncommon'?'rU':'rR';
  rb.className='lb-rarity rb '+rCls;
  overlay.classList.add('open');
  document.body.style.overflow='hidden';
}
function closeLightbox(){
  const overlay=document.getElementById('lbOverlay');
  overlay.classList.remove('open');
  document.body.style.overflow='';
  setTimeout(function(){document.getElementById('lbImg').src=''},300);
}

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
function szc(s){return s==="Small"?"#5B9BD5":s==="Medium"?"#6B8F3C":s==="Large"?"#C4A86A":"#BF6A3D"}
function csc(c){return c==="Least Concern"?"#6B8F3C":c==="Near Threatened"?"#B4A03C":c==="Vulnerable"?"#C8A028":c==="Endangered"?"#C86428":"#C83232"}
function e(s){return s.replace(/&/g,'&amp;').replace(/'/g,'&#39;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
const SZ_ORD={"Very Large":0,"Large":1,"Medium":2,"Small":3};
const CS_ORD={"Critically Endangered":0,"Endangered":1,"Vulnerable":2,"Near Threatened":3,"Least Concern":4};
const RA_ORD={"Rare":0,"Uncommon":1,"Common":2};
function sortList(arr,parkCk,uniqueSpotted){
arr.sort((a,b)=>{
if(srt==='az')return a.n.localeCompare(b.n);
if(srt==='za')return b.n.localeCompare(a.n);
if(srt==='rarity')return(RA_ORD[a.r]||9)-(RA_ORD[b.r]||9)||a.n.localeCompare(b.n);
if(srt==='size')return(SZ_ORD[a.sz]||9)-(SZ_ORD[b.sz]||9)||a.n.localeCompare(b.n);
if(srt==='conservation'){const ca=ANIMALS[a._id]?CS_ORD[ANIMALS[a._id].cs]:9,cb=ANIMALS[b._id]?CS_ORD[ANIMALS[b._id].cs]:9;return(ca===undefined?9:ca)-(cb===undefined?9:cb)||a.n.localeCompare(b.n)}
if(srt==='recent'){
const da=parkCk?parkCk[a._id]:null,db=parkCk?parkCk[b._id]:null;
const ua=uniqueSpotted&&!da?getCrossParkSightings(a._id).reduce((l,s)=>!l||new Date(s.date)>new Date(l)?s.date:l,null):da;
const ub=uniqueSpotted&&!db?getCrossParkSightings(b._id).reduce((l,s)=>!l||new Date(s.date)>new Date(l)?s.date:l,null):db;
if(ua&&!ub)return -1;if(!ua&&ub)return 1;if(ua&&ub)return new Date(ub)-new Date(ua);return a.n.localeCompare(b.n)}
return 0;
});return arr}

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
  if(hash==='browse')return {page:'browse'};
  const m=hash.match(/^park\/(.+)$/);
  if(m){
    const park=PARKS.find(p=>p.id===m[1]);
    if(park)return {page:'park',park};
  }
  const am=hash.match(/^animal\/(.+)$/);
  if(am&&ANIMALS[am[1]])return {page:'animal',animalId:am[1]};
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

// ── DASHBOARD HELPERS ──
function getAllSightings(){
  const sightings=[];
  PARKS.forEach(p=>{
    if(!ck[p.id])return;
    Object.entries(ck[p.id]).forEach(([animalId,date])=>{
      if(ANIMALS[animalId]){
        sightings.push({animalId,date,parkId:p.id,parkName:p.name});
      }
    });
  });
  return sightings.sort((a,b)=>new Date(b.date)-new Date(a.date));
}

function timeAgo(isoDate){
  const diff=Date.now()-new Date(isoDate).getTime();
  const mins=Math.floor(diff/60000);
  if(mins<60)return mins<=1?'Just now':`${mins}m ago`;
  const hrs=Math.floor(mins/60);
  if(hrs<24)return `${hrs}h ago`;
  const days=Math.floor(hrs/24);
  if(days<30)return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString();
}

function getUniqueSpotted(){
  const seen=new Set();
  PARKS.forEach(p=>{
    if(ck[p.id])Object.keys(ck[p.id]).forEach(id=>seen.add(id));
  });
  return seen;
}

function getTotalSpecies(){
  const all=new Set();
  PARKS.forEach(p=>p.species.forEach(s=>all.add(s.id)));
  return all;
}

function svgRing(spotted,total,size,color){
  const r=(size-6)/2,circ=2*Math.PI*r;
  const pct=total?spotted/total:0;
  const offset=circ*(1-pct);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--w06)" stroke-width="3"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" transform="rotate(-90 ${size/2} ${size/2})" style="transition:stroke-dashoffset .6s ease"/></svg>`;
}

// ── RENDER HOME DASHBOARD ──
function renderHome(){
  const allSightings=getAllSightings();
  const uniqueSpotted=getUniqueSpotted();
  const totalSpecies=getTotalSpecies();
  const parksVisited=PARKS.filter(p=>ck[p.id]&&Object.keys(ck[p.id]).length>0).length;
  const hasSightings=uniqueSpotted.size>0;
  let catMap={};

  // ── Dynamic subtitle ──
  let subtitle='Choose a park to explore';
  if(hasSightings){
    const rareSeen=[...uniqueSpotted].filter(id=>{
      let rarest='Common';
      PARKS.forEach(p=>p.species.forEach(s=>{if(s.id===id&&(s.r==='Rare'||(s.r==='Uncommon'&&rarest==='Common')))rarest=s.r}));
      return rarest==='Rare';
    });
    if(rareSeen.length>0)subtitle=`${rareSeen.length} rare species found`;
    else subtitle=`${uniqueSpotted.size} species spotted across ${parksVisited} park${parksVisited!==1?'s':''}`;
  }

  let h=`<div class="hdr"><button class="tmb" id="tmb">${tm==='dark'?'\u2600\uFE0F':'\uD83C\uDF19'}</button><div class="hdr-ey">South Africa</div><h1>Wildlife Checklist</h1><div class="hdr-m">${subtitle}</div></div>`;

  if(hasSightings){
    // ── Stats Strip ──
    // Rarest find
    let rarestAnimal=null,rarestLevel=0,rarestDate='';
    const rarityRank={Common:1,Uncommon:2,Rare:3};
    allSightings.forEach(s=>{
      let maxR=0;
      PARKS.forEach(p=>p.species.forEach(sp=>{
        if(sp.id===s.animalId&&rarityRank[sp.r]>maxR)maxR=rarityRank[sp.r];
      }));
      if(maxR>rarestLevel||(maxR===rarestLevel&&(!rarestDate||new Date(s.date)>new Date(rarestDate)))){
        rarestLevel=maxR;rarestAnimal=s.animalId;rarestDate=s.date;
      }
    });
    const rarestInfo=rarestAnimal&&ANIMALS[rarestAnimal]?ANIMALS[rarestAnimal]:null;
    const latestSighting=allSightings[0]||null;
    const latestInfo=latestSighting?ANIMALS[latestSighting.animalId]:null;

    h+=`<div class="dash-stats">`;
    h+=`<div class="dash-stat"><div class="dash-stat-val">${uniqueSpotted.size}</div><div class="dash-stat-lbl">Total Spotted</div></div>`;
    h+=`<div class="dash-stat"><div class="dash-stat-val">${parksVisited}</div><div class="dash-stat-lbl">Parks Visited</div></div>`;
    h+=`</div>`;

    // ── Recent Activity (deduplicated by animal) ──
    const recentDedup=[];
    const seenIds=new Set();
    allSightings.forEach(s=>{
      if(seenIds.has(s.animalId))return;
      seenIds.add(s.animalId);
      const parks=allSightings.filter(x=>x.animalId===s.animalId);
      recentDedup.push({animalId:s.animalId, date:s.date, parks});
    });
    const recent=recentDedup.slice(0,8);
    if(recent.length>0){
      h+=`<div class="dash-section"><div class="dash-section-title">Recent Activity</div>`;
      h+=`<div class="dash-recent">`;
      recent.forEach(s=>{
        const info=ANIMALS[s.animalId];
        if(!info)return;
        const imgUrl=info.wp&&imgCache[info.wp]?imgCache[info.wp]:null;
        const parkNames=s.parks.map(p=>p.parkName.split(' ')[0]);
        const uniqueParks=[...new Set(parkNames)];
        h+=`<div class="dash-recent-item" data-animal="${s.animalId}">`;
        if(imgUrl)h+=`<div class="dash-recent-img"><img src="${imgUrl}" alt="${e(info.n)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="dash-recent-emoji" style="display:none">${info.i}</div></div>`;
        else h+=`<div class="dash-recent-img"><div class="dash-recent-emoji">${info.i}</div></div>`;
        h+=`<div class="dash-recent-name">${e(info.n)}</div>`;
        h+=`<div class="dash-recent-park">${uniqueParks.map(p=>e(p)).join(' & ')}</div>`;
        h+=`<div class="dash-recent-time">${timeAgo(s.date)}</div>`;
        h+=`</div>`;
      });
      h+=`</div></div>`;
    }

    // Build global category map for collection rings
    catMap={};
    PARKS.forEach(p=>p.species.forEach(s=>{
      const info=ANIMALS[s.id];
      if(!info)return;
      const cat=info.c;
      if(!catMap[cat])catMap[cat]={total:new Set(),spotted:new Set()};
      catMap[cat].total.add(s.id);
      if(uniqueSpotted.has(s.id))catMap[cat].spotted.add(s.id);
    }));
  } else {
    catMap={};
    // ── Empty State ──
    h+=`<div class="dash-empty"><div class="dash-empty-icon">🌍</div><div class="dash-empty-title">Your adventure begins here</div><div class="dash-empty-sub">Explore a park and start spotting wildlife</div></div>`;
  }

  // ── ALL SPECIES SECTION ──
  h+=`<div class="dash-section"><div class="dash-section-title">All Species</div>`;
  const cats=Object.keys(catMap).filter(c=>catMap[c].total.size>0);
  if(cats.length>0){
    h+=`<div class="dash-rings">`;
    cats.forEach(cat=>{
      const sp=catMap[cat].spotted.size,tot=catMap[cat].total.size;
      const clr=CC[cat]?CC[cat].bg:'var(--gold)';
      const icon=CI[cat]||'';
      const complete=sp===tot&&tot>0;
      h+=`<div class="dash-ring${complete?' complete':''}">`;
      h+=`<div class="dash-ring-svg">${svgRing(sp,tot,52,clr)}<div class="dash-ring-icon">${icon}</div></div>`;
      h+=`<div class="dash-ring-count">${sp}/${tot}</div>`;
      h+=`<div class="dash-ring-label">${cat}</div>`;
      h+=`</div>`;
    });
    h+=`</div>`;
  }
  h+=`<div class="browse-btn" id="browseBtn"><div class="browse-btn-icon">\uD83D\uDD0D</div><div class="browse-btn-text"><div class="browse-btn-title">Browse All Species</div><div class="browse-btn-sub">Search all ${totalSpecies.size} species across all parks</div></div></div>`;
  h+=`</div>`;

  // ── BY PARK SECTION ──
  h+=`<div class="dash-section"><div class="dash-section-title">By Park</div>`;
  h+=`<div class="park-list">`;
  PARKS.forEach(park=>{
    const parkCk=ck[park.id]||{};
    const spotted=Object.keys(parkCk).length;
    const total=park.species.length;
    const pct=total?spotted/total*100:0;

    // Last activity
    let lastAct=null;
    Object.entries(parkCk).forEach(([id,date])=>{
      if(!lastAct||new Date(date)>new Date(lastAct.date))lastAct={id,date};
    });
    const lastInfo=lastAct&&ANIMALS[lastAct.id]?ANIMALS[lastAct.id]:null;

    // Category breakdown
    const parkCats={};
    park.species.forEach(s=>{
      const info=ANIMALS[s.id];if(!info)return;
      const cat=info.c;
      if(!parkCats[cat])parkCats[cat]={total:0,spotted:0,color:CC[cat]?CC[cat].bg:'#888'};
      parkCats[cat].total++;
      if(parkCk[s.id])parkCats[cat].spotted++;
    });

    h+=`<div class="park-card" data-park="${park.id}">`;
    h+=`<div class="park-card-top">`;
    h+=`<div class="park-icon">${park.icon}</div>`;
    h+=`<div class="park-info">`;
    h+=`<div class="park-name">${park.name}</div>`;
    h+=`<div class="park-sub">${park.subtitle}</div>`;
    h+=`</div></div>`;
    // Collection rings row: total + per-category
    const totalClr=pct>50?'#6B8F3C':'var(--gold)';
    const totalComplete=spotted===total&&total>0;
    h+=`<div class="park-card-rings">`;
    h+=`<div class="park-card-ring${totalComplete?' complete':''}">`;
    h+=`<div class="dash-ring-svg">${svgRing(spotted,total,48,totalClr)}<div class="dash-ring-icon" style="font-size:13px">${spotted}/${total}</div></div>`;
    h+=`<div class="dash-ring-label">Total</div>`;
    h+=`</div>`;
    const catKeys=Object.keys(parkCats);
    catKeys.forEach(cat=>{
      const c=parkCats[cat];
      const clr=c.color;
      const icon=CI[cat]||'';
      const catComplete=c.spotted===c.total&&c.total>0;
      h+=`<div class="park-card-ring${catComplete?' complete':''}">`;
      h+=`<div class="dash-ring-svg">${svgRing(c.spotted,c.total,48,clr)}<div class="dash-ring-icon" style="font-size:14px">${icon}</div></div>`;
      h+=`<div class="dash-ring-label">${c.spotted}/${c.total}</div>`;
      h+=`</div>`;
    });
    h+=`</div>`;
    h+=`</div>`;
  });
  h+=`</div></div>`;

  document.getElementById('app').innerHTML=h;

  // Events
  document.getElementById('tmb').onclick=()=>{tm=tm==='dark'?'light':'dark';applyTheme();try{localStorage.setItem("addo-theme",tm)}catch(e){}R()};
  document.getElementById('browseBtn').onclick=()=>{navigate('browse')};
  document.querySelectorAll('[data-park]').forEach(el=>el.onclick=()=>{navigate('park/'+el.dataset.park)});
  document.querySelectorAll('[data-animal]').forEach(el=>el.onclick=()=>{navigate('animal/'+el.dataset.animal)});
  document.querySelectorAll('[data-dlb]').forEach(el=>el.onclick=function(ev){
    ev.stopPropagation();
    const id=this.dataset.dlb;
    const info=ANIMALS[id];if(!info)return;
    const imgUrl=info.wp&&imgCache[info.wp]?imgCache[info.wp]:null;
    if(!imgUrl)return;
    let rarity='Common';
    const rarityRank={Common:1,Uncommon:2,Rare:3};
    PARKS.forEach(p=>p.species.forEach(s=>{if(s.id===id&&rarityRank[s.r]>(rarityRank[rarity]||0))rarity=s.r}));
    openLightbox(imgUrl,info.n,info.i,rarity);
  });
}

// ── RENDER CHECKLIST ──
function renderPark(park){
const CATS=[...new Set(A.map(x=>x.c))];
const fl=A.filter(a=>{
  if(ac!=="All"&&a.c!==ac)return false;
  if(sc!=="All"&&a.s!==sc)return false;
  if(sf!=="All"&&a.sz!==sf)return false;
  if(rf!=="All"&&a.r!==rf)return false;
  if(cf!=="All"&&(!ANIMALS[a._id]||ANIMALS[a._id].cs!==cf))return false;
  const parkCk=ck[park.id]||{};
  if(sco==='spotted'&&!parkCk[a._id])return false;
  if(sco==='unspotted'&&parkCk[a._id])return false;
  if(sr){const q=sr.toLowerCase();return a.n.toLowerCase().includes(q)||a.s.toLowerCase().includes(q)||a.c.toLowerCase().includes(q)||a.cl.toLowerCase().includes(q)}
  return true;
});
const parkCk=ck[park.id]||{};
sortList(fl,parkCk,null);
const tc=Object.keys(parkCk).length,pr=tc/A.length*100;
const hf=sf!=="All"||rf!=="All"||cf!=="All"||sc!=="All"||sco||sr;

let h=`<div class="hdr"><button class="back-btn" id="backBtn">\u2190</button><button class="tmb" id="tmb">${tm==='dark'?'\u2600\uFE0F':'\uD83C\uDF19'}</button><div class="hdr-ey">${e(park.name)}</div><h1>${e(park.subtitle)}</h1><div class="hdr-m">${A.length} species \u2022 Tap to spot</div></div>`;

if(imgLoading){h+=`<div class="ild">\uD83D\uDCF7 Loading photos\u2026</div>`}

h+=`<div class="pb pb-exp" id="pbToggle">`;
h+=`<div class="pr"><span class="ps">${tc} / ${A.length}</span><span class="pp">${pr.toFixed(1)}% spotted <span class="pb-arrow" id="pbArrow">\u25BC</span></span></div>`;
h+=`<div class="pt"><div class="pf" style="width:${pr}%;background:${pr>50?'linear-gradient(90deg,#6B8F3C,#A8CC5A)':'linear-gradient(90deg,#C4A86A,#D4B87A)'}"></div></div>`;
h+=`<div class="pb-detail" id="pbDetail" style="display:none">`;
const totalClr2=pr>50?'#6B8F3C':'var(--gold)';
const totalComplete2=tc===A.length&&A.length>0;
h+=`<div class="pb-section-label">By Type</div>`;
h+=`<div class="pb-rings">`;
h+=`<div class="pb-ring${totalComplete2?' complete':''}"><div class="dash-ring-svg">${svgRing(tc,A.length,56,totalClr2)}<div class="dash-ring-icon" style="font-size:13px">${tc}/${A.length}</div></div><div class="dash-ring-label">Total</div></div>`;
CATS.forEach(cat=>{const ct=A.filter(a=>a.c===cat&&parkCk[a._id]).length,tot=A.filter(a=>a.c===cat).length;if(!tot)return;const clr=CC[cat].bg;const catComp=ct===tot&&tot>0;h+=`<div class="pb-ring${catComp?' complete':''}"><div class="dash-ring-svg">${svgRing(ct,tot,56,clr)}<div class="dash-ring-icon" style="font-size:14px">${CI[cat]}</div></div><div class="dash-ring-label">${ct}/${tot}</div></div>`});
h+=`</div>`;
h+=`<div class="pb-section-label">By Rarity</div>`;
h+=`<div class="pb-rings">`;
["Common","Uncommon","Rare"].forEach(r=>{const tot=A.filter(a=>a.r===r).length,sp=A.filter(a=>a.r===r&&parkCk[a._id]).length;if(!tot)return;const clr=rc(r);const rComp=sp===tot&&tot>0;h+=`<div class="pb-ring pb-ring-lg${rComp?' complete':''}"><div class="dash-ring-svg">${svgRing(sp,tot,80,clr)}<div class="dash-ring-icon" style="font-size:10px;font-weight:700;color:${clr}">${r}</div></div><div class="dash-ring-label">${sp}/${tot}</div></div>`});
h+=`</div></div></div>`;

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

h+=`<div class="fb"><div class="fbn ${hf?'on':''}" id="ftg">\u2699 Filters${hf?' \u25CF':''}</div>`;
h+=`<div class="fbn ${srt!=='az'?'on':''}" id="stg">\u2195 Sort${srt!=='az'?' \u25CF':''}</div>`;
if(hf||srt!=='az')h+=`<div class="fbn cl" id="cla">Clear</div>`;
h+=`<span class="fcn">${fl.length} shown</span><div class="vt"><button class="vtb ${vw==='list'?'on':''}" id="vl" title="List view">☰</button><button class="vtb ${vw==='grid'?'on':''}" id="vg" title="Grid view">⊞</button></div></div>`;

h+=`<div class="fp ${shf?'show':''}"><div class="fg"><div class="fgl">Spotted</div><div class="fos">`;
["All","Spotted","Not Spotted"].forEach(s=>{const v=s==='All'?false:s==='Spotted'?'spotted':'unspotted';const clr=s==='Spotted'?'#6B8F3C':s==='Not Spotted'?'#C86428':'';h+=`<div class="fo ${sco===v?'on':''}" data-sp="${v}" style="${sco===v&&v?`border-color:${clr}60;background:${clr}18;color:${clr}`:''}">${s}</div>`});
h+=`</div></div><div class="fg"><div class="fgl">Size</div><div class="fos">`;
["All",...SIZES].forEach(s=>{const clr=szc(s);h+=`<div class="fo ${sf===s?'on':''}" data-sz="${s}" style="${sf===s&&s!=='All'?`border-color:${clr}60;background:${clr}18;color:${clr}`:''}">${s}</div>`});
h+=`</div></div><div class="fg"><div class="fgl">Rarity</div><div class="fos">`;
["All","Common","Uncommon","Rare"].forEach(r=>{const clr=rc(r);h+=`<div class="fo ${rf===r?'on':''}" data-rf="${r}" style="${rf===r&&r!=='All'?`border-color:${clr}60;background:${clr}18;color:${clr}`:''}">${r}</div>`});
h+=`</div></div><div class="fg"><div class="fgl">Conservation</div><div class="fos">`;
["All","Least Concern","Near Threatened","Vulnerable","Endangered","Critically Endangered"].forEach(c=>{const clr=csc(c);h+=`<div class="fo ${cf===c?'on':''}" data-cf="${c}" style="${cf===c&&c!=='All'?`border-color:${clr}60;background:${clr}18;color:${clr}`:''}">${c==='Critically Endangered'?'Critical':c}</div>`});
h+=`</div></div></div>`;
h+=`<div class="fp ${shs?'show':''}"><div class="fg"><div class="fgl">Sort by</div><div class="fos">`;
[["az","Name A\u2013Z"],["za","Name Z\u2013A"],["rarity","Rarity"],["size","Size"],["conservation","Conservation"],["recent","Recently Spotted"]].forEach(([v,l])=>{h+=`<div class="fo ${srt===v?'on':''}" data-srt="${v}">${l}</div>`});
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
if(imgUrl){h+=`<button class="cv-expand" data-lb="${a._id}">\u26F6</button>`}
h+=`<div class="ckb ${ic?'ck':''}" data-chk="${a._id}">${ic?'\u2713':''}</div>`;
const csC=ANIMALS[a._id]?csClass(ANIMALS[a._id].cs):'dd';
h+=`<div class="cio"><div class="cn">${a.n}</div><div class="cta"><span class="ctg ctg-s" style="background:${clr}30;color:${clr}">${a.s}</span><span class="rb ${rCls}">${a.r}</span><span class="ctg ctg-z">${a.sz} \u2022 ${a.cl}</span>${ANIMALS[a._id]&&ANIMALS[a._id].cs?`<span class="ctg ap-cs-pill ap-cs-${csC}">${ANIMALS[a._id].cs}</span>`:''}</div></div>`;
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
h+=`<div class="ds"><a class="ap-link" data-profile="${a._id}">View Full Profile \u2192</a></div>`;
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
document.getElementById('ftg').onclick=()=>{shf=!shf;shs=false;R()};
document.getElementById('stg').onclick=()=>{shs=!shs;shf=false;R()};
document.getElementById('pbToggle').onclick=()=>{const d=document.getElementById('pbDetail'),a=document.getElementById('pbArrow');if(d.style.display==='none'){d.style.display='';a.textContent='\u25B2'}else{d.style.display='none';a.textContent='\u25BC'}};
document.querySelectorAll('[data-sp]').forEach(el=>el.onclick=()=>{const v=el.dataset.sp;sco=v==='false'?false:v;R()});
document.querySelectorAll('[data-srt]').forEach(el=>el.onclick=()=>{srt=el.dataset.srt;R()});
document.getElementById('vl').onclick=()=>{vw='list';ex=null;R()};
document.getElementById('vg').onclick=()=>{vw='grid';ex=null;R()};
document.getElementById('tmb').onclick=()=>{tm=tm==='dark'?'light':'dark';applyTheme();try{localStorage.setItem("addo-theme",tm)}catch(e){}R()};
document.getElementById('backBtn').onclick=()=>{navigate('home')};
const cla=document.getElementById('cla');if(cla)cla.onclick=()=>{sr='';sc='All';sf='All';rf='All';cf='All';sco=false;srt='az';R()};
const eclr=document.getElementById('eclr');if(eclr)eclr.onclick=()=>{sr='';sc='All';sf='All';rf='All';cf='All';sco=false;srt='az';R()};
document.querySelectorAll('[data-cat]').forEach(el=>el.onclick=()=>{ac=el.dataset.cat;sc='All';R()});
document.querySelectorAll('[data-sc]').forEach(el=>el.onclick=()=>{sc=el.dataset.sc;R()});
document.querySelectorAll('[data-sz]').forEach(el=>el.onclick=()=>{sf=el.dataset.sz;R()});
document.querySelectorAll('[data-rf]').forEach(el=>el.onclick=()=>{rf=el.dataset.rf;R()});
document.querySelectorAll('[data-cf]').forEach(el=>el.onclick=()=>{cf=el.dataset.cf;R()});
document.querySelectorAll('[data-chk]').forEach(el=>el.onclick=function(ev){
  ev.stopPropagation();const id=this.dataset.chk;
  if(!ck[park.id])ck[park.id]={};
  if(ck[park.id][id])delete ck[park.id][id];else ck[park.id][id]=new Date().toISOString();
  sv();R();
});
document.querySelectorAll('[data-lb]').forEach(el=>el.onclick=function(ev){
  ev.stopPropagation();
  const id=this.dataset.lb;
  const animal=A.find(a=>a._id===id);if(!animal)return;
  const imgUrl=animal.wp&&imgCache[animal.wp]?imgCache[animal.wp]:null;
  if(!imgUrl)return;
  openLightbox(imgUrl,animal.n,animal.i,animal.r);
});
document.querySelectorAll('[data-exp]').forEach(el=>el.onclick=function(ev){
  if(ev.target.closest('[data-chk]'))return;
  if(ev.target.closest('[data-lb]'))return;
  if(ev.target.closest('[data-profile]'))return;
  if(vw==='grid'){
    navigate('animal/'+this.dataset.exp);return;
  }
  const id=this.dataset.exp;
  ex=ex===id?null:id;R();
});
document.querySelectorAll('[data-profile]').forEach(el=>el.onclick=function(ev){
  ev.stopPropagation();navigate('animal/'+this.dataset.profile);
});
// Cross-park badge click to toggle tooltip
document.querySelectorAll('.xp-badge').forEach(el=>el.onclick=function(ev){
  ev.stopPropagation();
  this.classList.toggle('show');
});
}

// ── BUILD ALL SPECIES (BROWSE PAGE) ──
function buildAllSpecies(){
  const rarityRank={Common:1,Uncommon:2,Rare:3};
  const map={};
  PARKS.forEach(p=>{
    p.species.forEach(ps=>{
      const base=ANIMALS[ps.id];
      if(!base)return;
      if(!map[ps.id]){
        map[ps.id]={...base, r:ps.r, t:ps.t, _id:ps.id, _parks:[{parkId:p.id,parkName:p.name,rarity:ps.r,tip:ps.t}]};
      } else {
        map[ps.id]._parks.push({parkId:p.id,parkName:p.name,rarity:ps.r,tip:ps.t});
        // Use rarest rating across parks
        if((rarityRank[ps.r]||0)>(rarityRank[map[ps.id].r]||0)){
          map[ps.id].r=ps.r;
        }
      }
    });
  });
  return Object.values(map);
}

// ── RENDER ALL-ANIMALS BROWSE PAGE ──
function renderAll(){
const uniqueSpotted=getUniqueSpotted();
const CATS=[...new Set(A.map(x=>x.c))];
// Apply park filter
const parkFiltered=pf==='All'?A:A.filter(a=>a._parks.some(p=>p.parkId===pf));
// When park filter active, adjust rarity to that park's rarity
const adjusted=parkFiltered.map(a=>{
  if(pf!=='All'){
    const pp=a._parks.find(p=>p.parkId===pf);
    if(pp)return {...a, r:pp.rarity, t:pp.tip};
  }
  return a;
});
const fl=adjusted.filter(a=>{
  if(ac!=="All"&&a.c!==ac)return false;
  if(sc!=="All"&&a.s!==sc)return false;
  if(sf!=="All"&&a.sz!==sf)return false;
  if(rf!=="All"&&a.r!==rf)return false;
  if(cf!=="All"&&(!ANIMALS[a._id]||ANIMALS[a._id].cs!==cf))return false;
  if(sco==='spotted'){
    if(pf!=='All'){
      if(!ck[pf]||!ck[pf][a._id])return false;
    } else {
      if(!uniqueSpotted.has(a._id))return false;
    }
  }
  if(sco==='unspotted'){
    if(pf!=='All'){
      if(ck[pf]&&ck[pf][a._id])return false;
    } else {
      if(uniqueSpotted.has(a._id))return false;
    }
  }
  if(sr){const q=sr.toLowerCase();return a.n.toLowerCase().includes(q)||a.s.toLowerCase().includes(q)||a.c.toLowerCase().includes(q)||a.cl.toLowerCase().includes(q)}
  return true;
});
sortList(fl,pf!=='All'?ck[pf]||{}:null,uniqueSpotted);
const hf=sf!=="All"||rf!=="All"||cf!=="All"||sc!=="All"||sco||sr;
const spottedCount=pf!=='All'
  ?(ck[pf]?Object.keys(ck[pf]).filter(id=>adjusted.some(a=>a._id===id)).length:0)
  :uniqueSpotted.size;

let h=`<div class="hdr"><button class="back-btn" id="backBtn">\u2190</button><button class="tmb" id="tmb">${tm==='dark'?'\u2600\uFE0F':'\uD83C\uDF19'}</button><div class="hdr-ey">All Parks</div><h1>All Species</h1><div class="hdr-m">${A.length} species across ${PARKS.length} parks</div></div>`;

if(imgLoading){h+=`<div class="ild">\uD83D\uDCF7 Loading photos\u2026</div>`}

const browsepr=adjusted.length?spottedCount/adjusted.length*100:0;
h+=`<div class="pb pb-exp" id="pbToggle">`;
h+=`<div class="pr"><span class="ps">${spottedCount} / ${adjusted.length}</span><span class="pp">${browsepr.toFixed(1)}% spotted <span class="pb-arrow" id="pbArrow">\u25BC</span></span></div>`;
h+=`<div class="pt"><div class="pf" style="width:${browsepr}%;background:${browsepr>50?'linear-gradient(90deg,#6B8F3C,#A8CC5A)':'linear-gradient(90deg,#C4A86A,#D4B87A)'}"></div></div>`;
h+=`<div class="pb-detail" id="pbDetail" style="display:none">`;
const bTotalClr=browsepr>50?'#6B8F3C':'var(--gold)';
const bTotalComp=spottedCount===adjusted.length&&adjusted.length>0;
h+=`<div class="pb-section-label">By Type</div>`;
h+=`<div class="pb-rings">`;
h+=`<div class="pb-ring${bTotalComp?' complete':''}"><div class="dash-ring-svg">${svgRing(spottedCount,adjusted.length,56,bTotalClr)}<div class="dash-ring-icon" style="font-size:13px">${spottedCount}/${adjusted.length}</div></div><div class="dash-ring-label">Total</div></div>`;
CATS.forEach(cat=>{const tot=adjusted.filter(a=>a.c===cat).length;if(!tot)return;const ct=adjusted.filter(a=>a.c===cat&&uniqueSpotted.has(a._id)).length;const clr=CC[cat]?CC[cat].bg:'#888';const catComp=ct===tot&&tot>0;h+=`<div class="pb-ring${catComp?' complete':''}"><div class="dash-ring-svg">${svgRing(ct,tot,56,clr)}<div class="dash-ring-icon" style="font-size:14px">${CI[cat]||''}</div></div><div class="dash-ring-label">${ct}/${tot}</div></div>`});
h+=`</div>`;
h+=`<div class="pb-section-label">By Rarity</div>`;
h+=`<div class="pb-rings">`;
["Common","Uncommon","Rare"].forEach(r=>{const tot=adjusted.filter(a=>a.r===r).length,sp=adjusted.filter(a=>a.r===r&&uniqueSpotted.has(a._id)).length;if(!tot)return;const clr=rc(r);const rComp=sp===tot&&tot>0;h+=`<div class="pb-ring pb-ring-lg${rComp?' complete':''}"><div class="dash-ring-svg">${svgRing(sp,tot,80,clr)}<div class="dash-ring-icon" style="font-size:10px;font-weight:700;color:${clr}">${r}</div></div><div class="dash-ring-label">${sp}/${tot}</div></div>`});
h+=`</div></div></div>`;

h+=`<div class="sb"><span class="si">\uD83D\uDD0D</span><input type="text" placeholder="Search by name, color, type..." value="${e(sr)}" id="sinp">${sr?'<button class="sx" id="scl">\u2715</button>':''}</div>`;

h+=`<div class="cts"><div class="ctb ${ac==='All'?'a':''}" data-cat="All">All (${adjusted.length})</div>`;
CATS.forEach(cat=>{const clr=CC[cat]?CC[cat].bg:'#888';const cnt=adjusted.filter(a=>a.c===cat).length;if(!cnt)return;h+=`<div class="ctb ${ac===cat?'a':''}" data-cat="${cat}" style="${ac===cat?`border-color:${clr}80;background:${clr}20;color:${clr}`:''}">${CI[cat]||''} ${cat} (${cnt})</div>`});
h+=`</div>`;

const scSource=ac==='All'?adjusted:adjusted.filter(a=>a.c===ac);
const subs=[...new Set(scSource.map(x=>x.s))];
if(subs.length>1){
h+=`<div class="cts scts"><div class="ctb sc ${sc==='All'?'a':''}" data-sc="All">All</div>`;
subs.forEach(sub=>{const cnt=scSource.filter(a=>a.s===sub).length;const clr=ac!=='All'&&CC[ac]?CC[ac].bg:'var(--gold)';h+=`<div class="ctb sc ${sc===sub?'a':''}" data-sc="${sub}" style="${sc===sub?`border-color:${clr}80;background:${clr}20;color:${clr}`:''}">${sub} (${cnt})</div>`});
h+=`</div>`;
}

h+=`<div class="fb"><div class="fbn ${hf?'on':''}" id="ftg">\u2699 Filters${hf?' \u25CF':''}</div>`;
h+=`<div class="fbn ${srt!=='az'?'on':''}" id="stg">\u2195 Sort${srt!=='az'?' \u25CF':''}</div>`;
if(hf||srt!=='az')h+=`<div class="fbn cl" id="cla">Clear</div>`;
h+=`<span class="fcn">${fl.length} shown</span><div class="vt"><button class="vtb ${vw==='list'?'on':''}" id="vl" title="List view">\u2630</button><button class="vtb ${vw==='grid'?'on':''}" id="vg" title="Grid view">⊞</button></div></div>`;

h+=`<div class="fp ${shf?'show':''}"><div class="fg"><div class="fgl">Spotted</div><div class="fos">`;
["All","Spotted","Not Spotted"].forEach(s=>{const v=s==='All'?false:s==='Spotted'?'spotted':'unspotted';const clr=s==='Spotted'?'#6B8F3C':s==='Not Spotted'?'#C86428':'';h+=`<div class="fo ${sco===v?'on':''}" data-sp="${v}" style="${sco===v&&v?`border-color:${clr}60;background:${clr}18;color:${clr}`:''}">${s}</div>`});
h+=`</div></div><div class="fg"><div class="fgl">Size</div><div class="fos">`;
["All",...SIZES].forEach(s=>{const clr=szc(s);h+=`<div class="fo ${sf===s?'on':''}" data-sz="${s}" style="${sf===s&&s!=='All'?`border-color:${clr}60;background:${clr}18;color:${clr}`:''}">${s}</div>`});
h+=`</div></div><div class="fg"><div class="fgl">Rarity</div><div class="fos">`;
["All","Common","Uncommon","Rare"].forEach(r=>{const clr=rc(r);h+=`<div class="fo ${rf===r?'on':''}" data-rf="${r}" style="${rf===r&&r!=='All'?`border-color:${clr}60;background:${clr}18;color:${clr}`:''}">${r}</div>`});
h+=`</div></div><div class="fg"><div class="fgl">Conservation</div><div class="fos">`;
["All","Least Concern","Near Threatened","Vulnerable","Endangered","Critically Endangered"].forEach(c=>{const clr=csc(c);h+=`<div class="fo ${cf===c?'on':''}" data-cf="${c}" style="${cf===c&&c!=='All'?`border-color:${clr}60;background:${clr}18;color:${clr}`:''}">${c==='Critically Endangered'?'Critical':c}</div>`});
h+=`</div></div></div>`;
h+=`<div class="fp ${shs?'show':''}"><div class="fg"><div class="fgl">Sort by</div><div class="fos">`;
[["az","Name A\u2013Z"],["za","Name Z\u2013A"],["rarity","Rarity"],["size","Size"],["conservation","Conservation"],["recent","Recently Spotted"]].forEach(([v,l])=>{h+=`<div class="fo ${srt===v?'on':''}" data-srt="${v}">${l}</div>`});
h+=`</div></div></div>`;

h+=`<div class="al${vw==='grid'?' grid':''}">`;
if(!fl.length)h+=`<div class="em"><div class="emi">\uD83D\uDD2D</div><div class="emt">No animals match your filters</div><div class="emb" id="eclr">Clear filters</div></div>`;

fl.forEach((a,i)=>{
const isSpotted=pf!=='All'?(ck[pf]&&!!ck[pf][a._id]):uniqueSpotted.has(a._id);
const ie=ex===a._id,clr=CC[a.c]?CC[a.c].bg:'#888',rcl=rc(a.r);
const nm=e(a.n);
const imgUrl=a.wp&&imgCache[a.wp]?imgCache[a.wp]:null;
const rCls=a.r==="Common"?"rC":a.r==="Uncommon"?"rU":"rR";
const xpSightings=getCrossParkSightings(a._id);
// First park where spotted (for navigation)
const firstSpottedPark=xpSightings.length>0?xpSightings[0].parkId:(a._parks&&a._parks.length>0?a._parks[0].parkId:null);

h+=`<div class="ac ${isSpotted?'ck':''}">`;
h+=`<div class="cv" data-exp="${a._id}">`;
if(imgUrl){h+=`<img class="ci" src="${imgUrl}" alt="${nm}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`}
h+=`<div class="cp" style="${imgUrl?'display:none':''}">${a.i}</div>`;
h+=`<div class="cg"></div>`;
if(imgUrl){h+=`<button class="cv-expand" data-lb="${a._id}">\u26F6</button>`}
const csC2=ANIMALS[a._id]?csClass(ANIMALS[a._id].cs):'dd';
h+=`<div class="cio"><div class="cn">${a.n}</div><div class="cta"><span class="ctg ctg-s" style="background:${clr}30;color:${clr}">${a.s}</span><span class="rb ${rCls}">${a.r}</span><span class="ctg ctg-z">${a.sz} \u2022 ${a.cl}</span>${ANIMALS[a._id]&&ANIMALS[a._id].cs?`<span class="ctg ap-cs-pill ap-cs-${csC2}">${ANIMALS[a._id].cs}</span>`:''}</div></div>`;
h+=`<span class="ceh ${ie?'o':''}">\u25BC</span>`;
h+=`</div>`;
h+=`<div class="cd ${ie?'open':''}"><div class="cd-wrap"><div class="cdi">`;
// Show tips from first available park
const tipPark=pf!=='All'?a._parks.find(p=>p.parkId===pf):a._parks[0];
if(tipPark)h+=`<div class="ds"><div class="dl">\uD83D\uDCA1 Safari Tip</div><div class="dt">${tipPark.tip}</div></div>`;
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
// Spotted dates per park
if(xpSightings.length>0){
  xpSightings.forEach(s=>{
    h+=`<div class="ds"><div class="spb">\u2713 Spotted in ${e(s.parkName)} on ${new Date(s.date).toLocaleDateString()}</div></div>`;
  });
}
// Parks available
if(a._parks&&a._parks.length>0){
  h+=`<div class="ds"><div class="dl">\uD83C\uDFDE\uFE0F Available In</div>`;
  a._parks.forEach(p=>{
    const park=PARKS.find(pk=>pk.id===p.parkId);
    h+=`<div class="xp-row">${park?park.icon:''} ${e(p.parkName)} — ${p.rarity}</div>`;
  });
  h+=`</div>`;
}
h+=`<div class="ds"><a class="ap-link" data-profile="${a._id}">View Full Profile \u2192</a></div>`;
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
document.getElementById('ftg').onclick=()=>{shf=!shf;shs=false;R()};
document.getElementById('stg').onclick=()=>{shs=!shs;shf=false;R()};
document.getElementById('pbToggle').onclick=()=>{const d=document.getElementById('pbDetail'),a=document.getElementById('pbArrow');if(d.style.display==='none'){d.style.display='';a.textContent='\u25B2'}else{d.style.display='none';a.textContent='\u25BC'}};
document.querySelectorAll('[data-sp]').forEach(el=>el.onclick=()=>{const v=el.dataset.sp;sco=v==='false'?false:v;R()});
document.querySelectorAll('[data-srt]').forEach(el=>el.onclick=()=>{srt=el.dataset.srt;R()});
document.getElementById('vl').onclick=()=>{vw='list';ex=null;R()};
document.getElementById('vg').onclick=()=>{vw='grid';ex=null;R()};
document.getElementById('tmb').onclick=()=>{tm=tm==='dark'?'light':'dark';applyTheme();try{localStorage.setItem("addo-theme",tm)}catch(e){}R()};
document.getElementById('backBtn').onclick=()=>{navigate('home')};
const cla=document.getElementById('cla');if(cla)cla.onclick=()=>{sr='';sc='All';sf='All';rf='All';cf='All';sco=false;srt='az';R()};
const eclr=document.getElementById('eclr');if(eclr)eclr.onclick=()=>{sr='';sc='All';sf='All';rf='All';cf='All';sco=false;srt='az';R()};
document.querySelectorAll('[data-cat]').forEach(el=>el.onclick=()=>{ac=el.dataset.cat;sc='All';R()});
document.querySelectorAll('[data-sc]').forEach(el=>el.onclick=()=>{sc=el.dataset.sc;R()});
document.querySelectorAll('[data-sz]').forEach(el=>el.onclick=()=>{sf=el.dataset.sz;R()});
document.querySelectorAll('[data-rf]').forEach(el=>el.onclick=()=>{rf=el.dataset.rf;R()});
document.querySelectorAll('[data-cf]').forEach(el=>el.onclick=()=>{cf=el.dataset.cf;R()});
document.querySelectorAll('[data-nav]').forEach(el=>el.onclick=function(ev){
  ev.stopPropagation();
  const parkId=this.dataset.nav;
  if(parkId)navigate('park/'+parkId);
});
document.querySelectorAll('[data-lb]').forEach(el=>el.onclick=function(ev){
  ev.stopPropagation();
  const id=this.dataset.lb;
  const animal=A.find(a=>a._id===id);if(!animal)return;
  const imgUrl=animal.wp&&imgCache[animal.wp]?imgCache[animal.wp]:null;
  if(!imgUrl)return;
  openLightbox(imgUrl,animal.n,animal.i,animal.r);
});
document.querySelectorAll('[data-exp]').forEach(el=>el.onclick=function(ev){
  if(ev.target.closest('[data-nav]'))return;
  if(ev.target.closest('[data-lb]'))return;
  if(ev.target.closest('[data-profile]'))return;
  if(vw==='grid'){
    navigate('animal/'+this.dataset.exp);return;
  }
  const id=this.dataset.exp;
  ex=ex===id?null:id;R();
});
document.querySelectorAll('[data-profile]').forEach(el=>el.onclick=function(ev){
  ev.stopPropagation();navigate('animal/'+this.dataset.profile);
});
document.querySelectorAll('.xp-badge').forEach(el=>el.onclick=function(ev){
  ev.stopPropagation();
  this.classList.toggle('show');
});
}

// ── WIKIPEDIA EXTRACT ──
async function fetchWikiExtract(pageTitle){
  if(wikiCache[pageTitle])return wikiCache[pageTitle];
  try{
    const resp=await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle.replace(/_/g,' '))}&prop=extracts&exintro&explaintext&format=json&origin=*`);
    const data=await resp.json();
    if(data.query&&data.query.pages){
      const page=Object.values(data.query.pages)[0];
      if(page&&page.extract){
        wikiCache[pageTitle]=page.extract;
        return page.extract;
      }
    }
  }catch(err){console.log('Wiki fetch error:',err)}
  return null;
}

// ── CONSERVATION STATUS HELPERS ──
function csClass(cs){
  if(!cs)return 'dd';
  const m={'Least Concern':'lc','Near Threatened':'nt','Vulnerable':'vu','Endangered':'en','Critically Endangered':'cr','Data Deficient':'dd'};
  return m[cs]||'dd';
}

// ── RENDER ANIMAL PROFILE ──
function renderAnimal(animalId){
  const a=ANIMALS[animalId];
  if(!a)return;
  window.scrollTo(0,0);

  // Gather cross-park data
  const parks=[];
  PARKS.forEach(p=>{
    const sp=p.species.find(s=>s.id===animalId);
    if(sp)parks.push({parkId:p.id,parkName:p.name,parkIcon:p.icon,rarity:sp.r,tip:sp.t});
  });

  const imgUrl=a.wp&&imgCache[a.wp]?imgCache[a.wp]:null;
  const clr=CC[a.c]?CC[a.c].bg:'#888';
  const catIcon=CI[a.c]||'';

  let h=`<div class="hdr"><button class="back-btn" id="backBtn">\u2190</button><button class="tmb" id="tmb">${tm==='dark'?'\u2600\uFE0F':'\uD83C\uDF19'}</button><div class="hdr-ey">${e(a.c)}</div><h1>${e(a.n)}</h1><div class="hdr-m">${a.i} ${e(a.s)}</div></div>`;

  // Hero image
  h+=`<div class="ap-hero">`;
  if(imgUrl){
    const hiSrc=hiResUrl(imgUrl);
    h+=`<img class="ap-hero-img" src="${hiSrc}" alt="${e(a.n)}" onerror="if(this.src!=='${imgUrl}'){this.src='${imgUrl}'}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">`;
    h+=`<div class="ap-hero-emoji" style="display:none">${a.i}</div>`;
    h+=`<button class="cv-expand" data-hero-lb="1">\u26F6</button>`;
  } else {
    h+=`<div class="ap-hero-emoji">${a.i}</div>`;
  }
  h+=`<div class="ap-hero-overlay"></div>`;
  h+=`</div>`;

  // Tags row
  h+=`<div class="ap-tags" style="margin-top:14px">`;
  h+=`<span class="ctg ctg-s" style="background:${clr}30;color:${clr}">${catIcon} ${e(a.c)}</span>`;
  h+=`<span class="ctg ctg-s" style="background:${clr}20;color:${clr}">${e(a.s)}</span>`;
  h+=`<span class="ctg ctg-z">${e(a.sz)}</span>`;
  h+=`<span class="ctg ctg-z">${e(a.cl)}</span>`;
  h+=`</div>`;

  // Spotted status (prominent)
  const anySpotted=parks.some(p=>ck[p.parkId]&&ck[p.parkId][animalId]);
  h+=`<div class="ap-spotted ${anySpotted?'ap-spotted-yes':''}">`;
  h+=`<div class="ap-spotted-header">${anySpotted?'\u2713':'👁'} ${anySpotted?'Spotted':'Not Yet Spotted'}</div>`;
  h+=`<div class="ap-spotted-parks">`;
  parks.forEach(p=>{
    const date=ck[p.parkId]&&ck[p.parkId][animalId];
    if(date){
      h+=`<div class="ap-spotted-row spotted"><button class="ap-spotted-btn spotted" data-spot="${p.parkId}">\u2713</button><span class="ap-spotted-park">${p.parkIcon} ${e(p.parkName)}</span><span class="ap-spotted-date">${new Date(date).toLocaleDateString()}</span></div>`;
    } else {
      h+=`<div class="ap-spotted-row"><button class="ap-spotted-btn" data-spot="${p.parkId}"></button><span class="ap-spotted-park">${p.parkIcon} ${e(p.parkName)}</span><span class="ap-spotted-date">Tap to mark spotted</span></div>`;
    }
  });
  h+=`</div></div>`;

  // About
  if(a.d){
    h+=`<div class="ap-section"><div class="ap-section-title">\uD83D\uDCD6 About</div><div class="dd">${e(a.d)}</div></div>`;
  }

  // Quick Facts
  if(a.w||a.l||a.life||a.act||a.diet){
    h+=`<div class="ap-section"><div class="ap-section-title">\uD83D\uDCCA Quick Facts</div><div class="dg">`;
    if(a.w)h+=`<div class="dst"><div class="dsl">\u2696\uFE0F Weight</div><div class="dsv">${a.w}</div></div>`;
    if(a.l)h+=`<div class="dst"><div class="dsl">\uD83D\uDCCF Size</div><div class="dsv">${a.l}</div></div>`;
    if(a.life)h+=`<div class="dst"><div class="dsl">\u23F3 Lifespan</div><div class="dsv">${a.life}</div></div>`;
    if(a.act)h+=`<div class="dst"><div class="dsl">\uD83D\uDD52 Activity</div><div class="dsv">${a.act}</div></div>`;
    h+=`</div>`;
    if(a.diet)h+=`<div style="margin-top:8px"><div class="dst"><div class="dsl">\uD83C\uDF3F Diet</div><div class="dsv">${a.diet}</div></div></div>`;
    h+=`</div>`;
  }

  // Conservation status
  if(a.cs){
    const csCls=csClass(a.cs);
    h+=`<div class="ap-section"><div class="ap-section-title">\uD83D\uDEE1\uFE0F Conservation Status</div>`;
    h+=`<div class="ap-cs" id="csToggle" style="cursor:pointer"><span class="ap-cs-label">IUCN Red List <span class="ap-cs-arrow" id="csArrow">\u25B6</span></span><span class="ap-cs-val ap-cs-${csCls}">${e(a.cs)}</span></div>`;
    h+=`<div class="ap-cs-info" id="csInfo" style="display:none">`;
    h+=`<div class="ap-cs-scale">`;
    const csLevels=[{k:'lc',l:'LC',f:'Least Concern'},{k:'nt',l:'NT',f:'Near Threatened'},{k:'vu',l:'VU',f:'Vulnerable'},{k:'en',l:'EN',f:'Endangered'},{k:'cr',l:'CR',f:'Critically Endangered'}];
    csLevels.forEach(lv=>{h+=`<div class="ap-cs-step ap-cs-${lv.k} ${csCls===lv.k?'active':''}" title="${lv.f}">${lv.l}</div>`});
    h+=`</div>`;
    h+=`<div class="ap-cs-desc">The <strong>IUCN Red List</strong> assesses the global conservation status of species. Categories range from <strong>Least Concern</strong> (populations stable) to <strong>Critically Endangered</strong> (extremely high risk of extinction in the wild).</div>`;
    h+=`</div></div>`;
  }

  // Wikipedia excerpt
  h+=`<div class="ap-section"><div class="ap-section-title">\uD83C\uDF10 Wikipedia</div><div id="wikiContent"><div class="ap-wiki-loading">Loading excerpt\u2026</div></div></div>`;

  // Safari Tips (per park)
  if(parks.length>0){
    h+=`<div class="ap-section"><div class="ap-section-title">\uD83D\uDCA1 Safari Tips</div>`;
    parks.forEach(p=>{
      h+=`<div class="ap-tip"><div class="ap-tip-park">${p.parkIcon} ${e(p.parkName)}</div><div class="dt">${e(p.tip)}</div></div>`;
    });
    h+=`</div>`;
  }

  // Available In (park links)
  h+=`<div class="ap-section"><div class="ap-section-title">\uD83C\uDFDE\uFE0F Available In</div>`;
  parks.forEach(p=>{
    const rCls=p.rarity==='Common'?'rC':p.rarity==='Uncommon'?'rU':'rR';
    h+=`<div class="ap-park-link" data-goto="${p.parkId}"><span class="ap-park-link-icon">${p.parkIcon}</span><span class="ap-park-link-name">${e(p.parkName)}</span><span class="rb ${rCls}">${e(p.rarity)}</span></div>`;
  });
  h+=`</div>`;

  document.getElementById('app').innerHTML=h;

  // Events
  document.getElementById('backBtn').onclick=()=>{navigate(prevRoute||'home')};
  document.getElementById('tmb').onclick=()=>{tm=tm==='dark'?'light':'dark';applyTheme();try{localStorage.setItem("addo-theme",tm)}catch(e){}renderAnimal(animalId)};
  const heroLb=document.querySelector('[data-hero-lb]');
  if(heroLb){
    heroLb.onclick=()=>{
      if(!imgUrl)return;
      let rarity='Common';
      const rarityRank={Common:1,Uncommon:2,Rare:3};
      parks.forEach(p=>{if(rarityRank[p.rarity]>(rarityRank[rarity]||0))rarity=p.rarity});
      openLightbox(imgUrl,a.n,a.i,rarity);
    };
  }
  const cst=document.getElementById('csToggle');if(cst)cst.onclick=()=>{const info=document.getElementById('csInfo'),arr=document.getElementById('csArrow');if(info.style.display==='none'){info.style.display='';arr.textContent='\u25BC'}else{info.style.display='none';arr.textContent='\u25B6'}};
  document.querySelectorAll('[data-goto]').forEach(el=>el.onclick=()=>{navigate('park/'+el.dataset.goto)});
  document.querySelectorAll('[data-spot]').forEach(el=>el.onclick=function(){
    const parkId=this.dataset.spot;
    if(!ck[parkId])ck[parkId]={};
    if(ck[parkId][animalId])delete ck[parkId][animalId];else ck[parkId][animalId]=new Date().toISOString();
    sv();renderAnimal(animalId);
  });

  // Fetch wiki extract async
  if(a.wp){
    const wpTitle=a.wp.replace(/_/g,' ');
    fetchWikiExtract(a.wp).then(text=>{
      const wc=document.getElementById('wikiContent');
      if(!wc)return;
      if(text){
        const paragraphs=text.split('\n').filter(p=>p.trim()).slice(0,3);
        wc.innerHTML='<div class="ap-wiki">'+paragraphs.map(p=>'<p>'+e(p)+'</p>').join('')+'</div>';
      } else {
        wc.innerHTML='<div class="ap-not-spotted">No excerpt available</div>';
      }
    });
  }
}

// ── MAIN RENDER ──
function R(){
  const route=getRoute();
  if(route.page==='park'){
    currentPark=route.park;
    A=buildParkSpecies(currentPark);
    renderPark(currentPark);
    loadImages();
  } else if(route.page==='animal'){
    currentPark=null;
    if(!A.length)A=buildAllSpecies();
    renderAnimal(route.animalId);
    loadImages();
  } else if(route.page==='browse'){
    currentPark=null;
    A=buildAllSpecies();
    renderAll();
    loadImages();
  } else {
    currentPark=null;
    A=[];
    // Reset filters when returning home
    sr="";ac="All";sc="All";sf="All";rf="All";cf="All";shf=false;sco=false;ex=null;pf="All";
    imgLoaded=false;
    renderHome();
  }
}

window.addEventListener('hashchange',function(ev){
  // Track previous route for back button
  if(ev&&ev.oldURL){
    const oldHash=ev.oldURL.split('#')[1]||'home';
    prevRoute=oldHash;
  }
  // Reset filters when navigating to a new page
  const route=getRoute();
  if(route.page==='browse'){
    sr="";ac="All";sc="All";sf="All";rf="All";cf="All";shf=false;sco=false;ex=null;
    imgLoaded=false;
  }
  R();
});

// ── LIGHTBOX GLOBAL EVENTS ──
document.getElementById('lbClose').onclick=closeLightbox;
document.getElementById('lbOverlay').onclick=function(ev){
  if(ev.target===this||ev.target.classList.contains('lb-content'))closeLightbox();
};
document.addEventListener('keydown',function(ev){
  if(ev.key==='Escape'&&document.getElementById('lbOverlay').classList.contains('open'))closeLightbox();
});

R();

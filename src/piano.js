// ════════════════════════════════════════════════════
// FLOW — REALTIME FALLING PIANO + DEADEYE MODE
// ════════════════════════════════════════════════════

let fWords=[],fLanes=[],fWordIdx=0;
let fHearts=5,fStreak=0,fErrors=0,fCorrect=0,fCombo=1;
let fTapCoinsThisVerse=0; // A1: tap-coin cap counter (max 15 per verse)
let fRafId=null,fLastTime=0;
let fTiles=[];
let fColH=0,fTileH=0;
let fHitZoneTop=0,fBottomStopY=0;
let fLastCorrectLane=-1;

// Deadeye constants
const BT_SLOW_FACTOR=0.08;
const BT_MS_INIT=5000;
const BT_EXTEND_CORRECT=1200;
const BT_REDUCE_WRONG=800;

// Deadeye state
let fBulletTime=false;
let fBtEntering=false;
let fBtRemaining=BT_MS_INIT;
let fBtRafId=null;
let fBtLastTime=0;
let fBtDuplicateWord='';
let fBtStartIdx=-1;
let fBtEndIdx=-1;
let fBtPendingHits=[];
let fDeadeyeResolving=false;

// Galaga helpers
function clearGalagaShots(){const layer=document.getElementById('galaga-shot-layer');if(layer)layer.innerHTML='';}
function targetLaneForCurrentWord(){if(typeof fTiles==='undefined'||!Array.isArray(fTiles))return -1;for(let ci=0;ci<fTiles.length;ci++){const lane=(fTiles[ci]||[]).filter(t=>!t.hit);if(lane.length&&lane[0].globalIdx===fWordIdx)return ci;}return -1;}
function laneCenterInPiano(ci){const piano=document.getElementById('fg-piano');const col=document.getElementById('pcol-'+ci);if(!piano||!col)return null;const pr=piano.getBoundingClientRect();const cr=col.getBoundingClientRect();return cr.left-pr.left+cr.width/2;}
function moveGalagaShipToLane(ci,instant){const ship=document.getElementById('galaga-ship');if(!ship)return;const x=laneCenterInPiano(ci);if(x==null)return;if(instant){const prev=ship.style.transition||'';ship.style.transition='none';ship.style.left=x+'px';ship.style.transform='translateX(-50%)';ship.offsetHeight;ship.style.transition=prev||'left 0.14s ease,filter 0.14s ease';}else ship.style.left=x+'px';}
function syncGalagaShip(instant){if(!document.body.classList.contains('galaga-skin')){clearGalagaShots();return;}const lane=fLastCorrectLane>=0?fLastCorrectLane:Math.floor(CFG.ncols/2);moveGalagaShipToLane(lane,!!instant);}
function fireGalagaShot(ci,targetEl){if(!document.body.classList.contains('galaga-skin'))return;const layer=document.getElementById('galaga-shot-layer'),ship=document.getElementById('galaga-ship'),piano=document.getElementById('fg-piano');if(!layer||!ship||!piano||!targetEl)return;moveGalagaShipToLane(ci,false);const pr=piano.getBoundingClientRect(),sr=ship.getBoundingClientRect(),tr=targetEl.getBoundingClientRect();const shot=document.createElement('div');shot.className='galaga-shot';const left=sr.left-pr.left+sr.width/2-2;const shipCenterY=sr.top-pr.top+sr.height/2;const targetY=tr.top-pr.top+tr.height/2;shot.style.left=left+'px';shot.style.top=shipCenterY+'px';shot.style.setProperty('--shot-travel',(targetY-shipCenterY)+'px');layer.appendChild(shot);setTimeout(()=>shot.remove(),240);}

function checkDailyReviewBanner(){
  const banner=document.getElementById('daily-review-banner');if(!banner)return;
  const now=Date.now();const lastShown=parseInt(localStorage.getItem('verbum_drb_shown')||'0');
  const today=new Date().toDateString();const lastDay=new Date(lastShown).toDateString();
  if(lastDay===today){banner.classList.remove('show');return;}
  const due=G.srCards.filter(c=>c.due<=now);
  if(!due.length){banner.classList.remove('show');return;}
  const sub=document.getElementById('drb-sub');if(sub)sub.textContent=due.length+' verse'+(due.length!==1?'s':'')+' due for review';
  banner.classList.add('show');
  banner.onclick=()=>{localStorage.setItem('verbum_drb_shown',Date.now().toString());banner.classList.remove('show');const dueRefs=new Set(G.srCards.filter(c=>c.due<=now).map(c=>c.ref));const dueIdxs=VERSES.map((v,i)=>({v,i})).filter(({v})=>dueRefs.has(v.ref)&&!isBossVerse(v)).map(({i})=>i);if(!dueIdxs.length)return;G.flowOrder=shuffle(dueIdxs);G.flowOrderIdx=0;startFlow('smart');};
  setTimeout(()=>banner.classList.remove('show'),8000);
}

function renderFlowMenu(){
  document.getElementById('flow-menu').style.display='block';
  document.getElementById('flow-game').style.display='none';
  if(fRafId){cancelAnimationFrame(fRafId);fRafId=null;}
  renderVList('flow-vlist',(i)=>{G.flowOrder=[i];G.flowOrderIdx=0;startFlowGame();});
  const col=activeCollection();renderBossSection();if(typeof renderRushCard==='function')renderRushCard();
  const lbl=document.getElementById('flow-collection-label');if(lbl)lbl.textContent=col.icon+' '+col.name+' \u00b7 '+VERSES.length+' verses';
  const allTitle=document.getElementById('flow-all-title');if(allTitle)allTitle.textContent='All '+VERSES.length+' Verses';
  document.getElementById('kb-hint').textContent='';
}

function startFlow(mode){
  if(mode==='sequential'){G.flowOrder=VERSES.map((_,i)=>i).filter(i=>!isBossVerse(VERSES[i]));}
  else if(mode==='random'){G.flowOrder=shuffle(VERSES.map((_,i)=>i).filter(i=>!isBossVerse(VERSES[i])));}
  else if(mode==='smart'){G.flowOrder=buildSmartFlowOrder();}
  else if(mode==='boss'||mode==='miniboss'){}
  else{G.flowOrder=VERSES.map((_,i)=>i).filter(i=>!isBossVerse(VERSES[i]));}
  G.flowOrderIdx=0;startFlowGame();
}

function renderBossSection(){
  const wrap=document.getElementById('boss-section-wrap');if(!wrap)return;
  const col=activeCollection();
  const groups=getCollectionBossGroups(col);
  if(groups){_renderBossGroupSection(wrap,col,groups);return;}
  const bossVerses=col.verses.filter(v=>isBossVerse(v));
  if(!bossVerses.length){wrap.innerHTML='';return;}
  const finalBoss=bossVerses.reduce((best,v)=>{const n=bossVerseConstituents(v,col).length;const bestN=bossVerseConstituents(best,col).length;return n>bestN?v:best;},bossVerses[0]);
  const minibosses=bossVerses.filter(v=>v!==finalBoss).sort((a,b)=>a.ref.localeCompare(b.ref));
  const allMinibossesBeaten=minibosses.every(v=>bossVerseUnlocked(v));
  const finalBossUnlocked=allMinibossesBeaten&&bossVerseUnlocked(finalBoss);
  let html=`<div class="boss-section"><div class="boss-section-title">\u2694\ufe0f BOSS VERSES</div>`;
  minibosses.forEach(v=>{const unlocked=bossVerseUnlocked(v);const constituents=bossVerseConstituents(v,col);const mastCount=constituents.filter(r=>verseMastery(r)==='mastered').length;html+=`<div class="boss-card${unlocked?'':' locked'}" onclick="${unlocked?`startBossVerse('${v.ref}',false)`:''}"><div class="boss-type-badge miniboss">MINIBOSS</div><div class="boss-card-title">${v.ref}</div><div class="boss-card-sub">${v.text.slice(0,60)}\u2026</div><div class="boss-card-status">${unlocked?'<span style="color:#A8E063">\u2713 Unlocked \u2014 tap to run</span>':`<span style="color:#5A0060">${mastCount}/${constituents.length} verses mastered to unlock</span>`}</div></div>`;});
  html+=`<div class="boss-card final-boss${finalBossUnlocked?'':' locked'}" onclick="${finalBossUnlocked?`startBossVerse('${finalBoss.ref}',true)`:''}"><div class="boss-type-badge finalboss">\ud83d\udc51 BOSS</div><div class="boss-card-title" style="color:${finalBossUnlocked?'#FF9FFF':'#4A0060'}">${finalBoss.ref}</div><div class="boss-card-sub">${finalBoss.text.slice(0,50)}\u2026</div><div class="boss-card-status">${finalBossUnlocked?'<span style="color:#FF9FFF">\u2713 Unlocked \u2014 entire chapter</span>':'<span style="color:#4A0060">Defeat all minibosses to unlock</span>'}</div></div>`;
  html+='</div>';wrap.innerHTML=html;
}

function _renderBossGroupSection(wrap,col,groups){
  let html=`<div class="boss-section"><div class="boss-section-title">\u2694\ufe0f BOSS RUNS</div>`;
  groups.forEach((g,gi)=>{
    const unlocked=bossGroupUnlocked(col,gi);const beaten=bossGroupBeaten(col,gi);
    const cls=g.isFinalBoss?'boss-card final-boss':'boss-card';
    const badge=g.isFinalBoss?'<div class="boss-type-badge finalboss">\ud83d\udc51 BOSS</div>':'<div class="boss-type-badge miniboss">MINIBOSS</div>';
    const status=beaten?'<span style="color:#A8E063">\u2713 Beaten</span>':unlocked?'<span style="color:#C66FFF">Ready \u2014 tap to start</span>':'<span style="color:#5A0060">Beat previous bosses to unlock</span>';
    html+=`<div class="${cls}${unlocked?'':' locked'}" onclick="${unlocked?`startBossGroupRun('${col.id}',${gi})`:''}">
      ${badge}<div class="boss-card-title">${g.label}</div><div class="boss-card-sub">${g.refs.length} verses</div><div class="boss-card-status">${status}</div></div>`;
  });
  html+='</div>';wrap.innerHTML=html;
}

function startBossVerse(ref,isFinal){const col=activeCollection();const idx=col.verses.findIndex(v=>v.ref===ref);if(idx<0)return;G.flowOrder=[idx];G.flowOrderIdx=0;startFlow(isFinal?'boss':'miniboss');}

function startBossGroupRun(colId, groupIdx){
  const col=COLLECTIONS.find(c=>c.id===colId);if(!col)return;
  const groups=getCollectionBossGroups(col);if(!groups||!groups[groupIdx])return;
  const group=groups[groupIdx];
  _bossRunContext={col,groupIdx,isFinalBoss:group.isFinalBoss};
  G.flowOrder=group.refs.map(ref=>col.verses.findIndex(v=>v.ref===ref)).filter(i=>i>=0);
  G.flowOrderIdx=0;startFlow('boss');
}

function buildSmartFlowOrder(){
  const now=Date.now();const nonBoss=VERSES.map((v,i)=>({v,i})).filter(({v})=>!isBossVerse(v));
  const scored=nonBoss.map(({v,i})=>{const card=G.srCards.find(c=>c.ref===v.ref);const overdue=card&&card.due<now?Math.max(0,(now-card.due)/86400000):0;const errors=G.flowVerseErrors[v.ref]||0;const reps=card?card.reps:0;const score=overdue*10+errors*2+(reps===0?5:0)+(card&&card.interval<7?3:0);return {i,score};});
  scored.sort((a,b)=>b.score-a.score);return scored.map(x=>x.i);
}

function startFlowGame(){resumeAC();sfxNoteIdx=0;document.getElementById('flow-menu').style.display='none';document.getElementById('flow-game').style.display='flex';fHearts=5;fStreak=0;fCorrect=0;fCombo=1;G.streak=0;updateHeader();renderDevZone();loadVerse();}

function loadVerse(){
  if(G.flowOrderIdx>=G.flowOrder.length){showAllDone();return;}
  if(fRafId){cancelAnimationFrame(fRafId);fRafId=null;}
  const verse=VERSES[G.flowOrder[G.flowOrderIdx]];
  const _mastery=(_bossRunContext&&document.getElementById('flow-game').style.display!=='none')?'practicing':verseMastery(verse.ref);
  applyMasteryCFG(_mastery);
  const rawWords=verse.text.split(' ');
  fWords=_mastery==='mastered'?applyWordTruncation(rawWords,verse.ref):rawWords;
  fWordIdx=0;fErrors=0;fCombo=1;sfxKeyShift=0;fLastCorrectLane=-1;fBtStartIdx=-1;fBtEndIdx=-1;fBtEntering=false;fDeadeyeResolving=false;fTapCoinsThisVerse=0;
  updateComboMult(1);if(fBulletTime)exitBulletTime();
  fLanes=buildConstrainedLanes(fWords.length,CFG.ncols);
  document.getElementById('fg-ref').textContent='\u2014 '+verse.ref;
  document.getElementById('fg-pts').textContent='0 words';
  document.getElementById('fg-combo').textContent='\u00d71';
  document.getElementById('fg-built').innerHTML='';
  document.getElementById('fg-done').classList.remove('show');
  document.getElementById('fg-fail').style.display='none';
  document.getElementById('fh-val').textContent=fHearts;
  updateFProg();buildPianoCols();initTiles();
  const kh=document.getElementById('kb-hint');const isMobile=window.innerWidth<600;
  if(CFG.ncols===2)kh.textContent=isMobile?'[1] [2]':'[1/A] [2/S]';
  else if(CFG.ncols===3)kh.textContent=isMobile?'[1] [2] [3]':'[1/A] [2/S] [3/D]';
  else kh.textContent=isMobile?'[1] [2] [3] [4]':'[1/A] [2/S] [3/D] [4/F]';
  if(CFG.countdown){startCountdown(verse.ref,()=>{fLastTime=performance.now();fRafId=requestAnimationFrame(rafLoop);});}
  else{fLastTime=performance.now();fRafId=requestAnimationFrame(rafLoop);}
}

function buildConstrainedLanes(n,ncols){const maxRun=2;const lanes=[];const quota=Array(ncols).fill(0).map((_,i)=>Math.floor(n/ncols)+(i<n%ncols?1:0));let lastLane=-1,runLen=0;for(let i=0;i<n;i++){let candidates=[];for(let c=0;c<ncols;c++){if(quota[c]<=0)continue;if(c===lastLane&&runLen>=maxRun)continue;candidates.push(c);}if(!candidates.length){candidates=Array(ncols).fill(0).map((_,c)=>c).filter(c=>quota[c]>0);}const preferred=candidates.filter(c=>c!==lastLane);const pool=preferred.length?preferred:candidates;const chosen=pool[Math.floor(Math.random()*pool.length)];lanes.push(chosen);quota[chosen]--;if(chosen===lastLane){runLen++;}else{runLen=1;}lastLane=chosen;}return lanes;}

function startCountdown(refText,onDone){
  const overlay=document.getElementById('countdown-overlay'),numEl=document.getElementById('countdown-num'),refEl=document.getElementById('countdown-ref');refEl.textContent='';
  const bookMatch=refText.match(/^([A-Za-z0-9 ]+?)\s+(\d+.*)/);let stages;
  if(bookMatch){const book=bookMatch[1];const rest=bookMatch[2];const chap=rest.split(':')[0];stages=[book,'Ch. '+chap,rest];}else{stages=[refText,'',''];}
  const tones=[392,523,659];overlay.classList.add('show');let idx=0;
  function tick(){numEl.style.animation='none';numEl.offsetHeight;numEl.style.animation='cdPop 0.88s ease forwards';if(idx<stages.length){numEl.textContent=stages[idx];numEl.style.fontSize=idx===0?'44px':idx===1?'34px':'40px';tone(tones[idx],'sine',0.07,0.12);idx++;setTimeout(tick,950);}else{numEl.style.animation='none';numEl.offsetHeight;numEl.style.animation='cdPop 0.45s ease forwards';numEl.textContent='';numEl.style.fontSize='90px';tone(880,'sine',0.08,0.16);setTimeout(()=>{overlay.classList.remove('show');onDone();},500);}}
  tick();
}

function buildPianoCols(){
  const piano=document.getElementById('fg-piano');
  [...piano.querySelectorAll('.piano-col')].forEach(c=>c.remove());
  for(let ci=0;ci<CFG.ncols;ci++){const col=document.createElement('div');col.className='piano-col lane-'+(ci%4);col.id='pcol-'+ci;col.addEventListener('touchstart',(e)=>{e.preventDefault();colTap(ci);},{passive:false});col.addEventListener('mousedown',()=>colTap(ci));const streak=document.getElementById('fg-streak');if(streak)piano.insertBefore(col,streak);else piano.appendChild(col);}
  const col0=document.getElementById('pcol-0');fColH=col0?col0.offsetHeight:280;renderDevZone();
  fTileH=Math.max(26,Math.min(84,Math.floor(fColH/CFG.screenTileUnits)));fHitZoneTop=fColH*CFG.hitZoneFrac;fBottomStopY=Math.max(6,fColH-fTileH-6);
}

function tileClassForIndex(ti){return ti===0?'hot':ti===1?'upcoming':'future';}
function applyTileState(tile,ti){if(!tile.el)return;tile.el.className='ptile '+tileClassForIndex(ti);if(tile.wobbling)tile.el.classList.add('wobble');if(tile.breaking)tile.el.classList.add('breaking');}

function shatterTile(ci,tile,kind){
  if(fBulletTime&&tile.globalIdx>=fWordIdx&&tile.globalIdx<=fBtEndIdx)return;
  tile.hit=true;tile.wobbling=false;tile.breaking=kind==='break';tile.stuckSince=null;
  if(tile.el){tile.el.classList.remove('wobble');if(kind==='break'){tile.el.classList.add('breaking');setTimeout(()=>{if(tile.el)tile.el.style.display='none';},220);}else{tile.el.style.display='none';}}
  fErrors++;fStreak=0;fCombo=1;sfxKeyShift=0;
  fHearts=Math.max(0,fHearts-1);document.getElementById('fh-val').textContent=fHearts;
  document.getElementById('fg-combo').textContent='\u00d71';hapWrong();sfxWrong();glowCol(ci,'wrong');updateFStreak();fWordIdx++;syncGalagaShip();
  if(fWordIdx>=fWords.length){cancelAnimationFrame(fRafId);fRafId=null;setTimeout(()=>showVerseDone(),kind==='break'?260:200);return;}
  if(fHearts<=0){cancelAnimationFrame(fRafId);fRafId=null;setTimeout(()=>showFailOverlay(),kind==='break'?360:400);return;}
}

function initTiles(){
  const spacing=CFG.tileSpacing;const hitY=fHitZoneTop;const leadIn=fColH*CFG.startOffsetFrac;
  fTiles=Array.from({length:CFG.ncols},()=>[]);
  for(let wi=0;wi<fWords.length;wi++){const ci=fLanes[wi];const laneCount=fTiles[ci].length;const startY=hitY-leadIn-laneCount*(fTileH+spacing);fTiles[ci].push({word:fWords[wi],globalIdx:wi,y:startY,el:null,hit:false,stuckSince:null,wobbling:false,breaking:false});}
  for(let ci=0;ci<CFG.ncols;ci++){const col=document.getElementById('pcol-'+ci);if(!col)continue;col.innerHTML='';fTiles[ci].forEach((tile,ti)=>{const el=document.createElement('div');el.className='ptile '+tileClassForIndex(ti);el.textContent=tile.word;el.style.height=fTileH+'px';el.style.top=tile.y+'px';el.style.fontSize=tile.word.length>9?'10px':tile.word.length>6?'12px':'14px';tile.el=el;col.appendChild(el);});}
  clearGalagaShots();syncGalagaShip(true);
}

function rafLoop(now){
  const dt=Math.min((now-fLastTime)/1000,0.1);fLastTime=now;
  const BT_ENTRY_SPEED=200;
  const baseSpeed=fBtEntering?BT_ENTRY_SPEED:fBulletTime?CFG.fallSpeed*BT_SLOW_FACTOR:CFG.fallSpeed;
  const spacing=CFG.tileSpacing;
  if(!fBulletTime&&countHotDuplicates()>=2)enterBulletTime();
  for(let ci=0;ci<CFG.ncols;ci++){
    const laneTiles=fTiles[ci].filter(t=>!t.hit);if(!laneTiles.length)continue;
    let colSpeed=baseSpeed;
    if(fBulletTime&&!fBtEntering){const nextVisible=fTiles[ci].find(t=>!t.hit&&t.globalIdx>=fWordIdx&&t.globalIdx<=fBtEndIdx);if(nextVisible&&nextVisible.y<0){colSpeed=CFG.fallSpeed;}}
    const leadDocked=CFG.bottomWobble&&laneTiles[0].y>=fBottomStopY-0.5;
    laneTiles.forEach((tile,ti)=>{
      tile.y+=colSpeed*dt;
      if(CFG.bottomWobble){const stopY=fBottomStopY-ti*(fTileH+spacing);if((ti===0||leadDocked)&&tile.y>stopY)tile.y=stopY;}
      if(tile.el)tile.el.style.top=tile.y+'px';
      const isLead=ti===0&&tile.globalIdx===fWordIdx;
      if(CFG.bottomWobble&&isLead&&tile.y>=fBottomStopY-0.5){if(tile.stuckSince==null)tile.stuckSince=now;tile.wobbling=true;if(now-tile.stuckSince>=CFG.bottomWobbleMs&&!tile.breaking){shatterTile(ci,tile,'break');return;}}else{tile.stuckSince=null;tile.wobbling=false;}
      applyTileState(tile,ti);
      if(!CFG.bottomWobble&&tile.y>fColH+fTileH&&isLead){shatterTile(ci,tile,'fall');}
    });
  }
  fRafId=requestAnimationFrame(rafLoop);
}

// ── Deadeye Mode ──
function countHotDuplicates(){if(!fTiles||fWordIdx>=fWords.length)return 0;const target=fWords[fWordIdx];let count=0;for(let ci=0;ci<fTiles.length;ci++){const live=fTiles[ci].filter(t=>!t.hit);if(live.length&&live[0].word===target)count++;}return count;}
function computeDeadeyeEndIdx(){const dupWord=fWords[fWordIdx];let maxIdx=fWordIdx;for(let ci=0;ci<fTiles.length;ci++){const live=fTiles[ci].filter(t=>!t.hit);if(live.length&&live[0].word===dupWord&&live[0].globalIdx>maxIdx){maxIdx=live[0].globalIdx;}}return maxIdx;}
function refreshDeadeyeHighlights(){for(let ci=0;ci<fTiles.length;ci++){fTiles[ci].forEach(t=>{if(!t.el)return;if(t.hit){if(!t.el.classList.contains('bt-done'))t.el.classList.remove('bt-queued');return;}if(t.globalIdx>=fWordIdx&&t.globalIdx<=fBtEndIdx){t.el.classList.add('bt-queued');t.el.classList.remove('bt-done');}else{t.el.classList.remove('bt-queued','bt-done');}});}}
function attachBtHandlers(){for(let ci=0;ci<fTiles.length;ci++){fTiles[ci].filter(t=>!t.hit&&t.globalIdx>=fWordIdx&&t.globalIdx<=fBtEndIdx).forEach(tile=>{if(tile.el&&!tile.el._btHandler){tile.el._btHandler=(e)=>{e.stopPropagation();e.preventDefault();tileBulletTap(tile);};tile.el.addEventListener('touchstart',tile.el._btHandler,{passive:false});tile.el.addEventListener('mousedown',tile.el._btHandler);}});}}
function detachBtHandlers(){for(let ci=0;ci<fTiles.length;ci++){fTiles[ci].forEach(tile=>{if(tile.el&&tile.el._btHandler){tile.el.removeEventListener('touchstart',tile.el._btHandler);tile.el.removeEventListener('mousedown',tile.el._btHandler);delete tile.el._btHandler;}if(tile.el)tile.el.classList.remove('bt-queued');});}}

function enterBulletTime(){
  if(fBulletTime)return;fBulletTime=true;fBtRemaining=Math.round(BT_MS_INIT*fBtMultiplierOverride);fBtDuplicateWord=fWords[fWordIdx]||'';fBtStartIdx=fWordIdx;fBtEndIdx=computeDeadeyeEndIdx();fBtPendingHits=[];
  const piano=document.getElementById('fg-piano');fBtEntering=true;
  if(piano){piano.classList.add('bt-entering');setTimeout(()=>{piano.classList.remove('bt-entering');piano.classList.add('bt-active');fBtEntering=false;},550);}
  document.getElementById('bt-bar-wrap').style.display='block';
  const lbl=document.getElementById('bt-label');if(lbl){lbl.textContent='\u26a1 DEADEYE';lbl.style.display='block';}
  tone(880,'sine',0.08,0.16);tone(660,'sine',0.07,0.14,0.18);tone(440,'triangle',0.10,0.14,0.36);hapComplete();
  setTimeout(()=>{attachBtHandlers();refreshDeadeyeHighlights();},300);
  fBtLastTime=performance.now();fBtRafId=requestAnimationFrame(drainBulletTime);
}

function drainBulletTime(now){if(!fBulletTime)return;const dt=Math.min(now-fBtLastTime,100);fBtLastTime=now;fBtRemaining=Math.max(0,fBtRemaining-dt);const bar=document.getElementById('bt-bar');if(bar)bar.style.width=(fBtRemaining/BT_MS_INIT*100)+'%';if(fBtRemaining<=0)deadeyeEnd(false);else fBtRafId=requestAnimationFrame(drainBulletTime);}

function exitBulletTime(){if(!fBulletTime)return;fBulletTime=false;fBtEntering=false;if(fBtRafId){cancelAnimationFrame(fBtRafId);fBtRafId=null;}const piano=document.getElementById('fg-piano');if(piano)piano.classList.remove('bt-active','bt-entering');document.getElementById('bt-bar-wrap').style.display='none';document.getElementById('bt-label').style.display='none';detachBtHandlers();}

function deadeyeEnd(allCleared){
  const windowStart=fBtStartIdx;const windowEnd=fBtEndIdx;exitBulletTime();cancelAnimationFrame(fRafId);fRafId=null;
  fDeadeyeResolving=true;   // block taps until the staggered payoff finishes (else colTap desyncs fWordIdx)
  const windowTiles=[];for(let ci=0;ci<fTiles.length;ci++){fTiles[ci].filter(t=>t.globalIdx>=windowStart&&t.globalIdx<=windowEnd).forEach(t=>{windowTiles.push({ci,tile:t});});}
  windowTiles.sort((a,b)=>a.tile.globalIdx-b.tile.globalIdx);
  let delay=0;const hitSet=new Set(fBtPendingHits.map(t=>t.globalIdx));
  windowTiles.forEach(({ci,tile})=>{tile.hit=true;tile.wobbling=false;tile.stuckSince=null;});
  fWordIdx=fBtEndIdx+1;
  windowTiles.forEach(({ci,tile})=>{
    setTimeout(()=>{
      if(hitSet.has(tile.globalIdx)){
        if(tile.el){tile.el.style.transition='transform 0.18s ease,opacity 0.18s ease';tile.el.style.transform='scale(1.25)';tile.el.style.opacity='1';const popRect=tile.el.getBoundingClientRect();spawnWordArc(tile.word,{getBoundingClientRect:()=>popRect},fCombo);setTimeout(()=>{if(tile.el){tile.el.style.transform='scale(0.5)';tile.el.style.opacity='0';}},60);setTimeout(()=>{if(tile.el)tile.el.style.display='none';},220);}
        glowCol(ci,'correct');tone(440+tile.globalIdx*12,'sine',0.06,0.10);
        const bw=document.getElementById('fg-built');if(bw){const sp=document.createElement('span');sp.className='bw lit';sp.textContent=(bw.children.length>0?' ':'')+tile.word;bw.appendChild(sp);bw.scrollTop=bw.scrollHeight;setTimeout(()=>sp.classList.remove('lit'),160);}
        document.getElementById('fg-pts').textContent=fCorrect+' word'+(fCorrect!==1?'s':'');updateComboMult(fCombo);
      } else {
        tile.breaking=true;if(tile.el){tile.el.classList.remove('bt-queued','bt-done');tile.el.classList.add('breaking');setTimeout(()=>{if(tile.el)tile.el.style.display='none';},220);}
        glowCol(ci,'wrong');tone(180+Math.random()*60,'sawtooth',0.05,0.07);
        fErrors++;fStreak=0;fCombo=1;sfxKeyShift=0;fHearts=Math.max(0,fHearts-1);document.getElementById('fh-val').textContent=fHearts;document.getElementById('fg-combo').textContent='\u00d71';updateComboMult(1);
      }
    },delay);delay+=80;
  });
  setTimeout(()=>{fDeadeyeResolving=false;fWordIdx=fBtEndIdx+1;updateFStreak();if(fHearts<=0){showFailOverlay();return;}if(fWordIdx>=fWords.length){showVerseDone();return;}fLastTime=performance.now();fRafId=requestAnimationFrame(rafLoop);},delay+120);
}

function tileBulletTap(tile){
  if(!fBulletTime||tile.hit)return;const ci=fLanes[tile.globalIdx];
  const target=fWords[fWordIdx];
  if(tile.word!==target||tile.globalIdx!==fWordIdx){sfxWrong();hapWrong();glowCol(ci,'wrong');fBtRemaining=Math.max(200,fBtRemaining-BT_REDUCE_WRONG);return;}
  tile.hit=true;tile.wobbling=false;tile.breaking=false;tile.stuckSince=null;fBtPendingHits.push(tile);
  if(tile.el){tile.el.classList.remove('bt-queued','breaking','wobble');tile.el.classList.add('bt-done');tile.el.style.display='';}
  fireGalagaShot(ci,tile.el);sfxCorrect();hapCorrect();
  fStreak++;fCorrect++;fCombo=Math.min(fStreak,8);
  const btTapCoins=(fTapCoinsThisVerse<15)?1:0;if(btTapCoins>0)fTapCoinsThisVerse++;addCoins(btTapCoins,btTapCoins>0&&fCombo>=4?'\ud83d\udd25 \u00d7'+fCombo+' COMBO! +1/tap':null);
  document.getElementById('fg-combo').textContent='\u00d7'+fCombo;glowCol(ci,'correct');
  const bw=document.getElementById('fg-built');const sp=document.createElement('span');sp.className='bw lit';sp.textContent=(fWordIdx>0?' ':'')+tile.word;bw.appendChild(sp);bw.scrollTop=bw.scrollHeight;setTimeout(()=>sp.classList.remove('lit'),160);
  fLastCorrectLane=ci;fWordIdx++;
  document.getElementById('fg-pts').textContent=fCorrect+' word'+(fCorrect!==1?'s':'');updateFStreak();syncGalagaShip();
  fBtRemaining=Math.min(BT_MS_INIT,fBtRemaining+BT_EXTEND_CORRECT);
  refreshDeadeyeHighlights();attachBtHandlers();
  if(fWordIdx>fBtEndIdx){deadeyeEnd(true);}
}

function colTap(ci){
  resumeAC();if(fBulletTime||fDeadeyeResolving)return;moveGalagaShipToLane(ci,false);glowCol(ci,'active');
  const laneTiles=fTiles[ci].filter(t=>!t.hit);if(!laneTiles.length)return;
  const hotTile=laneTiles[0];const target=fWords[fWordIdx];
  if(hotTile.word===target){
    hotTile.hit=true;hotTile.wobbling=false;hotTile.breaking=false;hotTile.stuckSince=null;
    fireGalagaShot(ci,hotTile.el);const tileRect=hotTile.el?hotTile.el.getBoundingClientRect():null;
    if(hotTile.el){hotTile.el.className='ptile hit-flash';setTimeout(()=>{if(hotTile.el)hotTile.el.style.display='none';},100);}
    sfxCorrect();hapCorrect();fStreak++;fCorrect++;fCombo=fStreak;
    spawnWordArc(hotTile.word,{getBoundingClientRect:()=>tileRect},fCombo);updateComboMult(fCombo);
    const newShift=Math.floor(fStreak/CFG.keyChangeStreak);
    if(newShift>sfxKeyShift){const kf=document.getElementById('keychange-flash');if(kf){kf.textContent='\ud83c\udfb5 Key +'+newShift;kf.classList.add('show');clearTimeout(kf._t);kf._t=setTimeout(()=>kf.classList.remove('show'),900);}}
    const tapCoins=(fTapCoinsThisVerse<15)?1:0;if(tapCoins>0)fTapCoinsThisVerse++;const comboLabel=tapCoins>0&&fCombo>=4?`\ud83d\udd25 \u00d7${fCombo} COMBO! +1/tap`:null;
    addCoins(tapCoins,comboLabel);document.getElementById('fg-combo').textContent='\u00d7'+fCombo;glowCol(ci,'correct');
    const bw=document.getElementById('fg-built');const sp2=document.createElement('span');sp2.className='bw lit';sp2.textContent=(fWordIdx>0?' ':'')+hotTile.word;bw.appendChild(sp2);bw.scrollTop=bw.scrollHeight;setTimeout(()=>sp2.classList.remove('lit'),160);
    document.getElementById('fg-pts').textContent=fCorrect+' word'+(fCorrect!==1?'s':'');updateFStreak();fLastCorrectLane=ci;fWordIdx++;syncGalagaShip();
    if(fWordIdx>=fWords.length){cancelAnimationFrame(fRafId);fRafId=null;setTimeout(()=>showVerseDone(),160);return;}
  } else {
    sfxWrong();hapWrong();fErrors++;fStreak=0;fCombo=1;sfxKeyShift=0;
    document.getElementById('fg-combo').textContent='\u00d71';updateComboMult(1);
    fHearts=Math.max(0,fHearts-1);document.getElementById('fh-val').textContent=fHearts;glowCol(ci,'wrong');
    for(let c=0;c<CFG.ncols;c++){const lt=fTiles[c].filter(t=>!t.hit);if(lt.length&&lt[0].word===target)glowCol(c,'correct');}
    updateFStreak();if(fHearts<=0){cancelAnimationFrame(fRafId);fRafId=null;setTimeout(()=>showFailOverlay(),350);}
  }
}

function showFailOverlay(){const verse=VERSES[G.flowOrder[G.flowOrderIdx]];const el=document.getElementById('fg-fail');syncFailOverlayTheme();document.getElementById('fg-fail-verse').textContent='"'+verse.text.slice(0,80)+'\u2026"';const isLast=G.flowOrderIdx>=G.flowOrder.length-1;document.getElementById('fg-fail-next').textContent=isLast?'End Session':'Skip to Next Verse \u2192';el.style.display='flex';hapWrong();tone(180,'sawtooth',0.15,0.15);}
function retryVerse(){hapTap();document.getElementById('fg-fail').style.display='none';clearGalagaShots();fHearts=5;fErrors=0;fStreak=0;fCombo=1;sfxKeyShift=0;document.getElementById('fh-val').textContent=fHearts;document.getElementById('fg-combo').textContent='\u00d71';if(_bossRunContext){G.flowOrderIdx=0;}sfxNoteIdx=0;loadVerse();}
function failNext(){hapTap();document.getElementById('fg-fail').style.display='none';clearGalagaShots();const isLast=G.flowOrderIdx>=G.flowOrder.length-1;if(isLast){endFlow();}else{G.flowOrderIdx++;fHearts=5;updateFProg();sfxNoteIdx=0;loadVerse();}}

function glowCol(ci,type){const col=document.getElementById('pcol-'+ci);if(!col)return;const cls={active:'active-glow',correct:'correct-glow',wrong:'wrong-glow'}[type];col.classList.add(cls);setTimeout(()=>col.classList.remove(cls),type==='active'?90:190);}
function updateFStreak(){const el=document.getElementById('fg-streak');if(el){if(fStreak>=4){el.textContent='\ud83d\udd25\u00d7'+fStreak;el.classList.add('on');}else el.classList.remove('on');}}
function updateFProg(){document.getElementById('fg-progfill').style.width=(G.flowOrderIdx/Math.max(1,G.flowOrder.length)*100)+'%';}

function showVerseDone(){
  if(fRafId){cancelAnimationFrame(fRafId);fRafId=null;}sfxComplete();hapComplete();showBurst();updateComboMult(1);
  const tier=verseTier(fWords.length);
  const xpTable=[[8,5,2],[11,7,3],[14,9,4],[20,13,5]];const coinTable=[[8,5,2],[11,7,3],[15,9,4],[22,13,5]];
  const bracket=fErrors===0?0:fErrors<=2?1:2;
  const _mastMult=MASTERY_CFG[verseMastery(VERSES[G.flowOrder[G.flowOrderIdx]].ref)]||MASTERY_CFG.practicing;
  const xpGain=Math.round(xpTable[tier-1][bracket]*_mastMult.xpMult);const coinGain=Math.round(coinTable[tier-1][bracket]*_mastMult.coinMult);const lumenBonus=fErrors===0?1:0;
  const _vRef=VERSES[G.flowOrder[G.flowOrderIdx]].ref;
  G.flowVerseErrors[_vRef]=(G.flowVerseErrors[_vRef]||0)+fErrors;
  let _srResult=null;if(G.srCards.find(c=>c.ref===_vRef)){_srResult=applyFlowSRRating(_vRef,fErrors,fErrors===0);}
  incrementVerseCompletion(_vRef,fErrors);restoreMasteryCFG();
  const verse=VERSES[G.flowOrder[G.flowOrderIdx]];
  document.getElementById('fgd-icon').textContent=fErrors===0?'\ud83c\udf1f':fErrors<=2?'\u2b50':'\u271d\ufe0f';
  document.getElementById('fgd-title').textContent=fErrors===0?'Perfect!':fErrors<=2?'Great!':'Keep Going!';
  const tierLabel=['','Tier I','Tier II','Tier III','Tier IV'][tier];
  document.getElementById('fgd-sub').textContent=`${tierLabel} \u00b7 ${fErrors} error${fErrors!==1?'s':''}`;
  document.getElementById('fgd-coins').textContent='';
  const lumenEl=document.getElementById('fgd-lumen');if(lumenEl)lumenEl.textContent='';
  document.getElementById('fgd-verse').textContent=verse.text;
  const isLast=G.flowOrderIdx>=G.flowOrder.length-1;
  document.getElementById('fgd-next').textContent=isLast?'Finish \u2726':'Next Verse \u2192';document.getElementById('fgd-next').onclick=flowNextVerse;
  const rb=document.getElementById('fgd-redo');rb.style.display='';rb.style.borderColor=fErrors>=3?'#FFD700':'#6A4C1E';rb.style.color=fErrors>=3?'#FFD700':'#9A7A3F';
  fInFlowXPAnim=true;showXPResult(xpGain,coinGain,lumenBonus,fErrors);
  setTimeout(()=>showMasteryPopup(_vRef,_srResult,fErrors),800);save();
}

function showAllDone(){
  if(_bossRunContext){const{col,groupIdx}=_bossRunContext;_bossRunContext=null;markBossGroupBeaten(col,groupIdx);setTimeout(()=>{checkAndGrantBossRewards();renderBossSection();},600);}
  if(fRafId){cancelAnimationFrame(fRafId);fRafId=null;}sfxComplete();hapComplete();showBurst();
  document.getElementById('fgd-icon').textContent='\ud83c\udfc6';document.getElementById('fgd-title').textContent='All Verses Done!';document.getElementById('fgd-sub').textContent='Total: '+fCorrect+' words';document.getElementById('fgd-coins').textContent='';
  const _lEl=document.getElementById('fgd-lumen');if(_lEl)_lEl.textContent='';
  document.getElementById('fgd-verse').textContent='';document.getElementById('fgd-next').textContent='Back to Menu';document.getElementById('fgd-next').onclick=endFlow;document.getElementById('fgd-redo').style.display='none';document.getElementById('fg-done').classList.add('show');save();
}

function redoVerse(){hapTap();document.getElementById('fg-done').classList.remove('show');document.getElementById('fg-fail').style.display='none';fHearts=Math.min(5,fHearts+2);sfxNoteIdx=0;loadVerse();}
function flowNextVerse(){hapTap();G.flowOrderIdx++;document.getElementById('fg-done').classList.remove('show');sfxNoteIdx=0;updateFProg();loadVerse();}
function endFlow(){if(fBtRafId){cancelAnimationFrame(fBtRafId);fBtRafId=null;}fBulletTime=false;fDeadeyeResolving=false;if(fRafId){cancelAnimationFrame(fRafId);fRafId=null;}clearGalagaShots();document.getElementById('flow-game').style.display='none';document.getElementById('fg-fail').style.display='none';const dz=document.getElementById('fg-devzone');if(dz)dz.style.display='none';renderFlowMenu();}

// ── Keyboard input ──
document.addEventListener('keydown',(e)=>{
  if(document.getElementById('flow-game').style.display==='none')return;
  if(e.key==='Escape'){endFlow();return;}
  if(fBulletTime){const actionKey=e.key===' '||e.key==='ArrowDown'||e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='a'||e.key==='s'||e.key==='d'||e.key==='f'||(parseInt(e.key)>=1&&parseInt(e.key)<=CFG.ncols);if(actionKey){e.preventDefault();let found=null;for(let ci=0;ci<fTiles.length;ci++){const t=fTiles[ci].find(t=>!t.hit&&t.globalIdx===fWordIdx);if(t){found=t;break;}}if(found)tileBulletTap(found);}return;}
  const n=parseInt(e.key);if(n>=1&&n<=CFG.ncols){colTap(n-1);return;}
  if(e.key==='ArrowLeft'){e.preventDefault();colTap(0);}
  if(e.key==='ArrowDown'||e.key===' '){e.preventDefault();colTap(Math.floor(CFG.ncols/2));}
  if(e.key==='ArrowRight'){e.preventDefault();colTap(CFG.ncols-1);}
  if(CFG.ncols>=2&&e.key==='a')colTap(0);if(CFG.ncols>=2&&e.key==='s')colTap(1);
  if(CFG.ncols>=3&&e.key==='d')colTap(2);if(CFG.ncols>=4&&e.key==='f')colTap(3);
});

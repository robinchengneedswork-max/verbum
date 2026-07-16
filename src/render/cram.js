// ════════════════════════════════════════════════════
// CRAM & BROWSE (Cards tab sub-views)
// ════════════════════════════════════════════════════
// Cram never writes G.srCards and grants no XP/coins. Browse is read-only.

// ── CRAM ──
// cramSession: {deck:[refs], idx, missed:[refs], scopeLabel} | null (scope picker)
let cramSession=null;

function renderCram(){
  const wrap=document.getElementById('sr-cram-wrap');if(!wrap)return;
  if(!cramSession){renderCramScopePicker(wrap);return;}
  if(cramSession.done){renderCramEnd(wrap);return;}
  renderCramSession(wrap);
}

function renderCramScopePicker(wrap){
  const col=activeCollection();
  const groups=getCollectionBossGroups(col);
  let rows='';
  rows+=cramScopeRow('All verses','{"type":"all"}');
  const learningN=buildCramDeck(col,{type:'mastery',level:'learning'}).length;
  const practicingN=buildCramDeck(col,{type:'mastery',level:'practicing'}).length;
  const masteredN=buildCramDeck(col,{type:'mastery',level:'mastered'}).length;
  rows+=`<div class="cram-scope-lbl">BY MASTERY</div>`;
  rows+=cramScopeRow(`Learning (${learningN})`,'{"type":"mastery","level":"learning"}',learningN===0);
  rows+=cramScopeRow(`Practicing (${practicingN})`,'{"type":"mastery","level":"practicing"}',practicingN===0);
  rows+=cramScopeRow(`Mastered (${masteredN})`,'{"type":"mastery","level":"mastered"}',masteredN===0);
  if(groups&&groups.length){
    rows+=`<div class="cram-scope-lbl">BY SECTION</div>`;
    groups.forEach(g=>{rows+=cramScopeRow(g.label,`{"type":"section","groupIdx":${g.groupIdx}}`);});
  }
  wrap.innerHTML=`<div class="cram-hint">Practice only — doesn't affect your schedule.</div>
    <div class="secLabel">CHOOSE A DECK</div><div class="cram-scope-list">${rows}</div>`;
}
function cramScopeRow(label,scopeJson,disabled){
  return `<div class="cram-scope-row${disabled?' disabled':''}" ${disabled?'':`onclick='startCram(${scopeJson})'`}>${label}</div>`;
}

function startCram(scope){
  const col=activeCollection();
  const deck=buildCramDeck(col,scope);
  if(!deck.length){return;}
  cramSession={deck,idx:0,missed:[],scope};
  hapTap();
  renderCram();
}

function renderCramSession(wrap){
  wrap.innerHTML=`<div class="cram-hint">Practice only — doesn't affect your schedule.</div>
    <div style="display:flex;justify-content:space-between;margin-bottom:7px"><span style="font-size:9px;color:#7A5C2A" id="cram-queue-label"></span><span style="font-size:9px;color:#C9A84C">CRAM</span></div>
    <div class="fc-wrap" onclick="cramFlip()" id="cram-fc-wrap"><div class="fc" id="cram-fc"><div class="fc-front"><div class="fc-label" id="cram-front-label">REFERENCE</div><div class="fc-body" id="cram-front-body"></div><div class="fc-tap">tap to reveal ↓</div></div><div class="fc-back"><div class="fc-label">ANSWER</div><div class="fc-body" id="cram-back-body"></div></div></div></div>
    <p class="hint" id="cram-flip-hint">Tap card to reveal</p>
    <div class="cram-btns" id="cram-btns" style="display:none"><button class="sr-btn sr-again" onclick="cramRate(false)">Missed</button><button class="sr-btn sr-good" onclick="cramRate(true)">Got it</button></div>`;
  loadCramCard();
}
let cramFlipped=false;
function loadCramCard(){
  const s=cramSession;if(!s)return;
  const ref=s.deck[s.idx],verse=VERSES.find(v=>v.ref===ref);
  cramFlipped=false;
  const fc=document.getElementById('cram-fc');if(fc)fc.classList.remove('flipped');
  fillFlipCard(document.getElementById('cram-front-body'),document.getElementById('cram-back-body'),document.getElementById('cram-front-label'),ref,verse?verse.text:'—');
  document.getElementById('cram-flip-hint').style.display='block';
  document.getElementById('cram-btns').style.display='none';
  document.getElementById('cram-queue-label').textContent=`${s.idx+1} of ${s.deck.length}`;
}
function cramFlip(){if(cramFlipped)return;cramFlipped=true;sfxFlip();hapTap();document.getElementById('cram-fc').classList.add('flipped');document.getElementById('cram-flip-hint').style.display='none';document.getElementById('cram-btns').style.display='grid';}
function cramRate(gotIt){
  const s=cramSession;if(!s||!cramFlipped)return;
  hapTap();
  if(!gotIt)s.missed.push(s.deck[s.idx]);
  s.idx++;
  if(s.idx>=s.deck.length){s.done=true;renderCram();return;}
  const fw=document.getElementById('cram-fc-wrap');
  fw.style.cssText='transition:transform 0.15s,opacity 0.15s;transform:translateX(-38px);opacity:0';
  setTimeout(()=>{fw.style.cssText='transition:none;transform:translateX(38px);opacity:0';loadCramCard();setTimeout(()=>{fw.style.cssText='transition:transform 0.15s,opacity 0.15s;transform:none;opacity:1';},14);},160);
}

function renderCramEnd(wrap){
  const s=cramSession;
  const total=s.deck.length,got=total-s.missed.length;
  let missedHtml='';
  if(s.missed.length){missedHtml=`<div class="secLabel" style="margin-top:10px">MISSED</div><div class="cram-missed-list">${s.missed.map(r=>`<div class="cram-missed-row">${r}</div>`).join('')}</div>`;}
  const redoBtn=s.missed.length?`<button class="btn" onclick="cramRedoMissed()">Redo missed (${s.missed.length})</button>`:'';
  wrap.innerHTML=`<div style="text-align:center;padding:18px 12px"><div style="font-size:40px;margin-bottom:9px">✨</div><div style="font-size:22px;color:#C9A84C;font-weight:700;margin-bottom:4px">${got}/${total}</div><div style="font-size:10px;color:#9A7A3F">practice complete</div></div>
    ${missedHtml}
    <div style="margin-top:12px">${redoBtn}<button class="btn btn-ghost mt8" onclick="cramBack()" style="margin-top:6px">Back</button></div>`;
}
function cramRedoMissed(){
  const missed=cramSession.missed;
  cramSession={deck:buildCramDeck(activeCollection(),{type:'refs',refs:missed}),idx:0,missed:[]};
  hapTap();renderCram();
}
function cramBack(){cramSession=null;renderCram();}

// ── BROWSE ──
function renderBrowse(){
  const wrap=document.getElementById('sr-browse-wrap');if(!wrap)return;
  const col=activeCollection();
  const badgeColors={learning:'#A8E063',practicing:'#FFD700',mastered:'#56CCF2'};
  let rows='';
  col.verses.forEach((v,i)=>{
    if(isBossVerse(v))return;
    const level=verseMastery(v.ref);
    const card=G.srCards.find(c=>c.ref===v.ref);
    const due=browseDueLabel(card);
    rows+=`<div class="browse-row" onclick="browseToggle(${i})">
      <div class="browse-row-top"><span class="browse-ref">${v.ref}</span><span class="vitem-mastery ${level}" style="color:${badgeColors[level]}">${level.toUpperCase()}</span><span class="browse-due">${due}</span></div>
      <div class="browse-text" id="browse-text-${i}" style="display:none">${v.text}</div></div>`;
  });
  wrap.innerHTML=`<div class="secLabel">ALL CARDS</div><div class="browse-list">${rows}</div>`;
}
function browseToggle(i){
  const el=document.getElementById('browse-text-'+i);if(!el)return;
  el.style.display=el.style.display==='none'?'block':'none';
  hapTap();
}
function browseDueLabel(card){
  if(!card||card.reps===0)return 'new';
  const now=Date.now();
  if(card.due<=now)return 'due now';
  const days=Math.ceil((card.due-now)/86400000);
  return 'due in '+days+'d';
}

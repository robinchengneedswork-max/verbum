// ════════════════════════════════════════════════════
// VANISHING VERSE — "fade drill" lesson mode
// Single verse, escalating rounds. Each round blanks a GROWING SUPERSET of
// words (words truly vanish, they don't reshuffle); the final round hides the
// whole verse. Round fractions come from CFG.vvSchedule (default 25/50/75/100%).
// Two inputs (CFG.vvInput), sharing one code path — they branch only at the
// "produce word" step:
//   • 'fill'   — removed words become a shuffled bank; tap them into the gaps
//                in verse order. Self-checking.
//   • 'recite' — honor system: blanks shown, recite aloud, reveal + self-grade.
// Slots into MODES as 'vanish' (read → fill → tap → vanish → choice); reuses the
// lesson step nav + reward path (lResult) wholesale.
// ════════════════════════════════════════════════════

let VV=null; // per-drill session state, rebuilt each time we enter the vanish step

function vvClean(w){return w.replace(/[^a-zA-Z']/g,'');}

// Removal order: content words (>3 letters) vanish first, short function words
// last. Every index is included, so any prefix is a clean superset and the
// final (100%) round blanks the entire verse.
function vvBuildOrder(words){
  const idx=words.map((_,i)=>i);
  const long=shuffle(idx.filter(i=>vvClean(words[i]).length>3));
  const short=shuffle(idx.filter(i=>vvClean(words[i]).length<=3));
  return [...long,...short];
}

// Distinct, strictly increasing blank-counts. Fractions that round to the same
// count merge (this is the "clamp rounds for short verses" step); final = all.
function vvBuildRounds(n){
  const out=[];let prev=0;
  (CFG.vvSchedule||[.25,.5,.75,1]).slice(0,CFG.vvRounds||4).forEach(f=>{
    const c=Math.max(1,Math.min(n,Math.round(n*f)));
    if(c>prev){out.push(c);prev=c;}
  });
  if(!out.length||out[out.length-1]!==n)out.push(n);
  return out;
}

// onDone (optional): completion callback. Omitted → the lesson reward path
// (lResult) runs; the Cards-tab entry passes its own callback so the drill can
// run standalone outside a lesson. body is remembered for re-renders (input
// toggle, round advance) so it works in any container, not just #lbody.
function renderVanish(body,verse,onDone){
  resumeAC();
  const words=verse.text.split(' '); // tokenize like Flow: punctuation stays attached
  VV={verse,words,order:vvBuildOrder(words),rounds:vvBuildRounds(words.length),round:0,perfect:true,body,onDone};
  vvRenderRound(body);
}

// The set of word-indices blanked this round — a prefix of the removal order.
function vvBlanked(){return new Set(VV.order.slice(0,VV.rounds[VV.round]));}

function vvRenderRound(body){
  body=body||(VV&&VV.body)||document.getElementById('lbody');
  const blanks=vvBlanked();
  const pct=Math.round(VV.rounds[VV.round]/VV.words.length*100);
  let dots='';VV.rounds.forEach((_,i)=>{dots+=`<div class="vv-rdot${i<VV.round?' done':i===VV.round?' cur':''}"></div>`;});
  const toggle=`<div class="vv-seg-wrap">
    <div class="sr-seg${CFG.vvInput==='fill'?' on':''}" onclick="vvSetInput('fill')">✏️ FILL</div>
    <div class="sr-seg${CFG.vvInput==='recite'?' on':''}" onclick="vvSetInput('recite')">🗣️ RECITE</div>
  </div>`;
  let html=`<div class="vv-rounds">${dots}</div>
    <p class="hint">Round ${VV.round+1} of ${VV.rounds.length} · ${pct}% hidden</p>${toggle}`;
  html+=CFG.vvInput==='recite'?vvReciteHTML(blanks):vvFillHTML();
  body.innerHTML=html;
  if(CFG.vvInput!=='recite'){
    VV.gaps=[...blanks].sort((a,b)=>a-b);
    VV.blankSet=blanks;
    VV.slots=VV.gaps.map(()=>null);
    VV.bank=shuffle(VV.gaps.map(i=>({w:VV.words[i],id:i})));
    vvRenderFill();
  }
}

// ── FILL input ──────────────────────────────────────
function vvFillHTML(){
  return `<div class="card vv-line" id="vv-line"></div>
    <div class="wbank vv-bank" id="vv-bank"></div>
    <button class="btn" id="vv-btn" onclick="vvCheck()" disabled>Check</button>`;
}
function vvRenderFill(){
  const line=document.getElementById('vv-line'),bank=document.getElementById('vv-bank');
  if(!line||!bank)return;
  line.innerHTML='';let gp=0;
  VV.words.forEach((w,i)=>{
    if(VV.blankSet.has(i)){
      const pos=gp++,slot=VV.slots[pos],span=document.createElement('span');
      if(slot){
        span.className='vv-gap filled'+(slot.ok===false?' no':slot.ok?' ok':'');
        span.textContent=slot.w;
        if(slot.ok===undefined)span.onclick=()=>{hapTap();VV.bank.push({w:slot.w,id:slot.id});VV.slots[pos]=null;vvRenderFill();};
      }else{span.className='vv-gap';span.innerHTML='&nbsp;';}
      line.appendChild(span);line.appendChild(document.createTextNode(' '));
    }else{const s=document.createElement('span');s.className='fw';s.textContent=w+' ';line.appendChild(s);}
  });
  bank.innerHTML='';
  VV.bank.forEach(item=>{
    const b=document.createElement('button');b.className='chip vv-word';b.textContent=item.w;
    b.onclick=()=>{const pos=VV.slots.indexOf(null);if(pos<0)return;hapTap();VV.slots[pos]=item;VV.bank=VV.bank.filter(x=>x!==item);vvRenderFill();};
    bank.appendChild(b);
  });
  const btn=document.getElementById('vv-btn');if(btn)btn.disabled=VV.slots.includes(null);
}
function vvCheck(){
  let allOk=true;
  VV.slots.forEach((slot,pos)=>{slot.ok=slot.w===VV.words[VV.gaps[pos]];if(!slot.ok)allOk=false;});
  vvRenderFill();
  const btn=document.getElementById('vv-btn');if(btn)btn.style.display='none';
  if(allOk){sfxCorrect();hapCorrect();setTimeout(vvAdvance,700);return;}
  VV.perfect=false;sfxWrong();hapWrong();
  const line=document.getElementById('vv-line');if(line)line.classList.add('vv-shake');
  setTimeout(()=>{
    VV.slots.forEach((slot,pos)=>{if(slot&&slot.ok===false){VV.bank.push({w:slot.w,id:slot.id});VV.slots[pos]=null;}});
    VV.bank=shuffle(VV.bank);
    if(line)line.classList.remove('vv-shake');
    if(btn)btn.style.display='block';
    vvRenderFill();
  },850);
}

// ── RECITE input ────────────────────────────────────
function vvReciteHTML(blanks){
  let line='';
  VV.words.forEach((w,i)=>{
    if(blanks.has(i)){const len=Math.max(2,vvClean(w).length||w.length);line+=`<span class="vv-gap" id="vvr-${i}">${'–'.repeat(len)}</span> `;}
    else line+=`<span class="fw">${w} </span>`;
  });
  return `<div class="card vv-line">${line}</div>
    <div class="vv-ref">— ${VV.verse.ref}</div>
    <p class="hint" style="margin-top:2px">Recite the whole verse aloud, then reveal.</p>
    <button class="btn" id="vv-reveal" onclick="vvReciteReveal()">Reveal Answer</button>
    <div id="vv-grade" style="display:none"></div>`;
}
function vvReciteReveal(){
  vvBlanked().forEach(i=>{const el=document.getElementById('vvr-'+i);if(el){el.textContent=VV.words[i];el.className='vv-gap ok vv-reveal';}});
  hapTap();
  document.getElementById('vv-reveal').style.display='none';
  const g=document.getElementById('vv-grade');g.style.display='block';
  g.innerHTML=`<p class="hint" style="margin-top:10px">How did you do?</p>
    <div class="vv-grade-row">
      <button class="btn" onclick="vvReciteGrade(true)">✓ Nailed it</button>
      <button class="btn btn-ghost" onclick="vvReciteGrade(false)">👀 Needed a peek</button>
    </div>`;
}
function vvReciteGrade(ok){if(!ok)VV.perfect=false;hapTap();vvAdvance();}

// ── SHARED ──────────────────────────────────────────
function vvSetInput(m){if(CFG.vvInput===m)return;CFG.vvInput=m;save();vvRenderRound();}
function vvAdvance(){
  VV.round++;
  if(VV.round>=VV.rounds.length){
    sfxCorrect();hapComplete();
    const body=(VV&&VV.body)||document.getElementById('lbody');body.innerHTML='';
    const e=document.createElement('div');e.style.cssText='text-align:center;font-size:34px;margin:10px 0';e.textContent='🌟';
    body.appendChild(e);
    const done=(VV&&VV.onDone)||(()=>lResult(true));
    setTimeout(done,750); // drill complete — always a pass (self-checking / honor drill)
    return;
  }
  vvRenderRound();
}

// ── Cards-tab entry: the fade drill as a standalone practice surface ──
// (the lesson tab is gone, so Vanishing lives here now). Practice only — no
// XP/coins, consistent with Cram; switching subtabs resets to the picker.
function renderVanishCards(){
  const wrap=document.getElementById('sr-vanish-wrap');if(!wrap)return;
  const col=activeCollection();
  const badgeColors={learning:'#A8E063',practicing:'#FFD700',mastered:'#56CCF2'};
  let rows='';
  col.verses.forEach(v=>{
    if(isBossVerse(v))return;
    const level=verseMastery(v.ref);
    rows+=`<div class="browse-row" onclick="startVanishCard('${v.ref}')">
      <div class="browse-row-top"><span class="browse-ref">${v.ref}</span><span class="vitem-mastery ${level}" style="color:${badgeColors[level]}">${level.toUpperCase()}</span></div>
      <div class="browse-text" style="display:block;font-size:9px;color:#6A5030;margin-top:3px">${v.text.slice(0,58)}…</div></div>`;
  });
  wrap.innerHTML=`<div class="cram-hint">Fade drill — words vanish round by round until you rebuild the whole verse. Practice only.</div>
    <div class="secLabel">CHOOSE A VERSE</div><div class="browse-list">${rows}</div>`;
}
function startVanishCard(ref){
  const verse=VERSES.find(v=>v.ref===ref);if(!verse)return;
  hapTap();
  renderVanish(document.getElementById('sr-vanish-wrap'),verse,()=>vanishCardDone(ref));
}
function vanishCardDone(ref){
  const wrap=document.getElementById('sr-vanish-wrap');if(!wrap)return;
  const perfect=VV&&VV.perfect;
  wrap.innerHTML=`<div style="text-align:center;padding:18px 12px">
    <div style="font-size:40px;margin-bottom:9px">${perfect?'🌟':'🌫️'}</div>
    <div style="font-size:18px;color:#C9A84C;font-weight:700;margin-bottom:4px">${perfect?'Flawless recall!':'Drill complete'}</div>
    <div style="font-size:10px;color:#9A7A3F">practice — doesn't affect your schedule</div>
    <div style="margin-top:14px"><button class="btn" onclick="startVanishCard('${ref}')">↺ Again</button>
    <button class="btn btn-ghost mt8" onclick="renderVanishCards()" style="margin-top:6px">Back to list</button></div></div>`;
}

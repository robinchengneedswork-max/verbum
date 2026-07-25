// ════════════════════════════════════════════════════
// TIME RUSH — fast next-word multiple-choice combo mode
// The arcade counterpart to Flow/Echo: four word-chips appear, you tap the one
// that comes next, it POPS and is instantly replaced by the next set. Tension
// comes from a COMBO BAR that drains continuously — and the drain rate scales
// with your tier, so each higher tier demands a faster sustained pace
// (×1 ceiling ≈60 wpm, ×2 ≈70, … ×5 ≈100). Sustain the pace → bar fills → tier
// up (burst + louder color). Fall behind → bar drains; empty it and you drop a
// tier (never sudden-death). The run ends only when the passage is complete.
//
// Scoped to Psalm 1 for now: drills the full "Psalm 1:1-6" boss verse (all six
// verses as one continuous stream). Lives in a hidden #rush-game div inside
// flow-screen (mirrors flow-menu / echo-game); no new tab, no persisted schema.
// CRITICAL: the RAF id is cancelled on exit / tab switch so the loop never keeps
// ticking if the user bails.
// ════════════════════════════════════════════════════

let R=null; // per-session state, rebuilt each startRush()

// ── Tuning knobs (grouped so playtest tuning is one edit) ──
const RUSH={
  FILL_PER_WORD:0.34,   // bar gained per correct word
  START_FILL:0.6,       // bar level at the start of a run
  MAX_TIER:5,           // ×1 .. ×5
  WRONG_PENALTY:0.40,   // bar lost on a wrong pick
  DROP_REFILL:0.40,     // bar level after a tier-up carry-over / tier drop
  BASE_PTS:10,          // base points per correct word (× tier × tempo bonus)
};
// Required pace to hold a tier: ×1→60, ×2→70, ×3→80, ×4→90, ×5→100 wpm.
function rushReqWpm(tier){return 50+10*tier;}
// Per-second drain so that answering at reqWpm exactly holds the bar steady.
function rushDrainRate(tier){return rushReqWpm(tier)*RUSH.FILL_PER_WORD/60;}

// Combo palette (mirrors src/combo.js) — color keyed to tier.
const RUSH_PAL=['#FFD700','#FF9500','#FF6B35','#FF3B3B','#C66FFF'];
function rushTierColor(tier){return RUSH_PAL[Math.min(tier-1,RUSH_PAL.length-1)]||'#FFD700';}

// Normalize a token for distractor de-duplication (ignore case/punctuation).
function rushNorm(w){return w.toLowerCase().replace(/[^a-z0-9]/g,'');}

// ── Stable board ──
// Four slots that stay put across picks. The board always holds BOTH the current
// word (words[idx]) and the next one (words[idx+1]), plus distractors. When you
// tap the current word, the NEW current word is the one that was already sitting
// there (unchanged — no re-reading), and only the tapped slot is refilled, with a
// look-ahead word (never the immediate answer). So only one chip ever changes.
const RUSH_COLS=4;

// A word from the passage not already normalized-present in `avoid`.
function rushDistractor(avoid){
  const used=new Set(avoid.map(rushNorm));
  const pool=R.words.filter(w=>!used.has(rushNorm(w)));
  const src=pool.length?pool:R.words;
  return src[Math.floor(Math.random()*src.length)];
}

// Seed the initial board: current word + next word (if distinct) + distractors.
function rushSeedSlots(){
  const cur=R.words[0],nxt=R.words[1];
  const base=[cur];
  if(nxt!==undefined&&rushNorm(nxt)!==rushNorm(cur))base.push(nxt);
  while(base.length<RUSH_COLS)base.push(rushDistractor(base));
  R.slots=shuffle(base);
}

// After advancing idx, refill only the just-tapped slot with the new look-ahead
// (words[idx+1]); if that word is already on the board, drop in a distractor.
function rushReseedSlot(s){
  const look=R.idx+1<R.words.length?R.words[R.idx+1]:null;
  const others=R.slots.filter((_,i)=>i!==s);
  const present=new Set(others.map(rushNorm));
  const neu=(look!==null&&!present.has(rushNorm(look)))?look:rushDistractor(R.slots);
  R.slots[s]=neu;
}

// ── Session lifecycle ──
function startRush(){
  resumeAC();
  const col=activeCollection();
  const verse=col.verses.find(v=>isBossVerse(v))||col.verses.find(v=>/\d+:\d+-\d+$/.test(v.ref));
  if(!verse)return;
  const words=verse.text.split(' ');
  R={verse,words,idx:0,built:[],slots:[],slotEls:[],fill:RUSH.START_FILL,tier:1,score:0,
     peakTier:1,correct:0,errors:0,lastPickTime:0,lastGap:0,lastFrame:0,rafId:null};
  rushSeedSlots();
  document.getElementById('flow-menu').style.display='none';
  document.getElementById('flow-game').style.display='none';
  document.getElementById('rush-game').style.display='flex';
  document.getElementById('rush-done').style.display='none';
  document.getElementById('rush-options').style.display='';
  document.getElementById('rush-ref').textContent='— '+verse.ref;
  rushRenderBuilt();rushBuildChips();rushRenderBar();
  R.lastFrame=performance.now();R.lastPickTime=performance.now();
  R.rafId=requestAnimationFrame(rushLoop);
}

// The core loop: drain the bar; empty → drop a tier (or clamp at ×1). Runs every
// frame; the pick handlers add fill / bump tiers.
function rushLoop(now){
  if(!R)return;
  const dt=Math.min((now-R.lastFrame)/1000,0.1);R.lastFrame=now;
  R.fill-=rushDrainRate(R.tier)*dt;
  if(R.fill<=0){
    if(R.tier>1){R.tier--;R.fill=RUSH.DROP_REFILL;sfxFlip();}
    else{R.fill=0;}
  }
  rushRenderBar();
  R.rafId=requestAnimationFrame(rushLoop);
}

// Build the 4 chips ONCE; thereafter we only mutate the single tapped slot, so the
// other three never reflow or change text (the whole point — no re-reading).
function rushBuildChips(){
  const box=document.getElementById('rush-options');box.innerHTML='';R.slotEls=[];
  for(let i=0;i<RUSH_COLS;i++){
    const b=document.createElement('button');b.className='rush-chip';
    b.innerHTML=`<span class="rush-chip-num">${i+1}</span><span class="rush-chip-word">${R.slots[i]}</span>`;
    b.onclick=()=>rushPick(i);R.slotEls[i]=b;box.appendChild(b);
  }
}
function rushUpdateSlot(i){
  const b=R.slotEls[i];if(!b)return;
  b.querySelector('.rush-chip-word').textContent=R.slots[i];
}

function rushPick(i){
  if(!R||R.idx>=R.words.length)return;resumeAC();
  const el=R.slotEls[i];
  if(rushNorm(R.slots[i])===rushNorm(R.words[R.idx])){
    const now=performance.now();const gap=now-R.lastPickTime;R.lastPickTime=now;
    // Tempo bonus: reward a quick answer, plus a steady (even) beat vs the last gap.
    let tempo=1;
    if(gap<900)tempo+=0.3;
    if(R.lastGap>0&&Math.abs(gap-R.lastGap)<180)tempo+=0.3;
    R.lastGap=gap;
    R.score+=Math.round(RUSH.BASE_PTS*R.tier*tempo);
    R.correct++;R.built.push(R.words[R.idx]);R.idx++;
    R.fill=Math.min(1,R.fill+RUSH.FILL_PER_WORD);
    sfxCorrect();hapCorrect();
    if(R.fill>=1&&R.tier<RUSH.MAX_TIER)rushTierUp();
    rushRenderBuilt();rushRenderBar();
    if(R.idx>=R.words.length){rushDone();return;}
    // Only the tapped slot changes — pop it and swap in the look-ahead word.
    rushReseedSlot(i);rushUpdateSlot(i);
    if(el){el.classList.remove('rush-pop');void el.offsetWidth;el.classList.add('rush-pop');}
  }else{
    R.errors++;sfxWrong();hapWrong();R.lastGap=0;
    R.fill=Math.max(0,R.fill-RUSH.WRONG_PENALTY);
    const box=document.getElementById('rush-options');box.classList.add('rush-shake');
    setTimeout(()=>box.classList.remove('rush-shake'),400);
    if(el){el.classList.add('rush-wrong');setTimeout(()=>{if(el)el.classList.remove('rush-wrong');},300);}
    rushRenderBar();
  }
}

function rushTierUp(){
  R.tier++;R.fill=RUSH.DROP_REFILL;if(R.tier>R.peakTier)R.peakTier=R.tier;
  showBurst();sfxComplete();hapComplete();
  const badge=document.getElementById('rush-tier');
  if(badge){badge.classList.remove('rush-punch');void badge.offsetWidth;badge.classList.add('rush-punch');}
}

function rushRenderBuilt(){
  const el=document.getElementById('rush-built');if(!el)return;
  const shown=R.built.slice(-12); // keep the line readable on long passages
  el.textContent=(R.built.length>12?'… ':'')+shown.join(' ');
}

function rushRenderBar(){
  const fill=document.getElementById('rush-combo-fill');if(!fill)return;
  const col=rushTierColor(R.tier);
  fill.style.width=(Math.max(0,Math.min(1,R.fill))*100)+'%';
  fill.style.background=col;fill.style.boxShadow=`0 0 ${6+R.tier*3}px ${col}`;
  const tierEl=document.getElementById('rush-tier');tierEl.textContent='×'+R.tier;tierEl.style.color=col;
  document.getElementById('rush-score').textContent=R.score;
  const g=document.getElementById('rush-game');
  g.style.setProperty('--rush-col',col);g.classList.toggle('rush-hot',R.tier>=3);
}

function rushDone(){
  if(R.rafId){cancelAnimationFrame(R.rafId);R.rafId=null;}
  showBurst();sfxComplete();hapComplete();
  const xp=Math.max(6,Math.min(40,Math.round(R.score/150)));
  const coins=Math.max(4,Math.min(30,Math.round(R.score/200)))+(R.errors===0?3:0);
  addXP(xp);addCoins(coins);
  const {score,peakTier:peak,errors,verse}=R;
  document.getElementById('rush-options').style.display='none';
  const done=document.getElementById('rush-done');done.style.display='block';
  done.innerHTML=`<div class="rush-done-icon">${errors===0?'⚡':'🏁'}</div>
    <div class="rush-done-title">${errors===0?'Flawless Rush!':'Rush Complete!'}</div>
    <div class="rush-done-sub">Score ${score} · peak ×${peak} · ${errors} miss${errors!==1?'es':''}</div>
    <div class="rush-done-gain">+${xp} XP · +${coins} 💰</div>
    <div class="rush-done-verse">${verse.text}</div>
    <button class="btn" onclick="startRush()">↺ Again</button>
    <button class="btn btn-ghost" onclick="exitRush()" style="margin-top:6px">Back to Flow</button>`;
  save();
}

// ── Teardown (critical: cancel the RAF if the user bails) ──
function rushTeardown(){if(!R)return;if(R.rafId)cancelAnimationFrame(R.rafId);const g=document.getElementById('rush-game');if(g)g.style.display='none';R=null;}
function exitRush(){rushTeardown();renderFlowMenu();}

// Launch card in the Flow menu, under the boss section — Psalm 1 only for now.
function renderRushCard(){
  const wrap=document.getElementById('rush-card-wrap');if(!wrap)return;
  if(activeCollection().id!=='psalm1'){wrap.innerHTML='';return;}
  wrap.innerHTML=`<div class="secLabel" style="margin-top:10px">TIME RUSH</div>
    <div class="mode-card" onclick="startRush()">
      <div class="mode-card-icon">⚡</div>
      <div><div class="mode-card-title">Time Rush</div>
      <div class="mode-card-desc">Pick the next word before the combo bar drains. Faster tiers, bigger multipliers.</div></div>
    </div>`;
}

// Desktop convenience: number keys 1-4 pick chips; Escape exits.
document.addEventListener('keydown',(e)=>{
  if(!R)return;
  if(e.key==='Escape'){exitRush();return;}
  const n=parseInt(e.key);
  if(n>=1&&n<=RUSH_COLS){e.preventDefault();rushPick(n-1);}
});

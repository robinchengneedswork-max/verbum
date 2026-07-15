// ════════════════════════════════════════════════════
// XP, LEVELING & HEADER
// ════════════════════════════════════════════════════

let fInFlowXPAnim=false;

function updateHeader(){
  const{xp,streak,hearts,coins}=G;
  const col=activeCollection();
  const sub=document.getElementById('logo-sub');
  if(sub)sub.textContent=(col?col.name.toUpperCase():'VERBUM')+' \u00b7 ESV \u00b7 v0.92d';
  document.getElementById('hv-streak').textContent=streak;
  document.getElementById('hdr-coins-val').textContent=coins;
  const sbCoins=document.getElementById('sb-coins');if(sbCoins)sbCoins.textContent=coins;
  const lv=Math.floor(xp/100)+1,pct=xp%100;
  document.getElementById('xp-lv').textContent='Lv'+lv;
  document.getElementById('xpfill').style.width=pct+'%';
  document.getElementById('xp-num').textContent=xp+' XP';
}

function addXP(n){
  const lvBefore=Math.floor(G.xp/100)+1;
  G.xp+=n;
  updateHeader();
  const lvAfter=Math.floor(G.xp/100)+1;
  if(lvAfter>lvBefore&&!fInFlowXPAnim) onLevelUp(lvAfter);
}

function onLevelUp(newLevel){
  const shardReward=newLevel%5===0;
  if(shardReward){G.shards++;updateShardDisplay();}
  const coinBonus=50;G.coins+=coinBonus;updateHeader();
  showLevelUpOverlay(newLevel,coinBonus,shardReward);
  showBurst();hapComplete();sfxComplete();
  save();
}

function showLevelUpOverlay(level,coins,gotShard){
  const el=document.getElementById('levelup-overlay');if(!el)return;
  document.getElementById('lu-level').textContent='Level '+level;
  document.getElementById('lu-coins').textContent='+'+coins+' \ud83d\udcb0';
  document.getElementById('lu-shard').style.display=gotShard?'block':'none';
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),3400);
}

function addCoins(n,label){
  G.coins+=n;updateHeader();
  if(label){
    const el=document.getElementById('combo-badge');
    el.textContent=label;el.classList.add('show');
    clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),1200);
  }
}

function updateLumensDisplay(){
  document.querySelectorAll('#lumens-val').forEach(el=>el.textContent=G.lumens||0);
}

function updateShardDisplay(){
  document.querySelectorAll('#shard-val').forEach(el=>el.textContent=G.shards||0);
  const dustEl=document.getElementById('dust-val');
  if(dustEl)dustEl.textContent=G.dust;
}

function showMasteryLevelUp(ref,newLevel){
  const rewards=MASTERY_LEVEL_UP_REWARDS[newLevel];
  if(!rewards)return;
  G.lumens+=rewards.lumens; updateLumensDisplay();
  G.coins+=rewards.coins;   updateHeader();
  const toast=document.getElementById('mastery-toast');
  if(!toast)return;
  document.getElementById('mastery-toast-title').textContent=rewards.label;
  document.getElementById('mastery-toast-sub').textContent=ref;
  document.getElementById('mastery-toast-rewards').textContent='+'+rewards.lumens+' \ud83d\udd06  +'+rewards.coins+' \ud83d\udcb0';
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t=setTimeout(()=>toast.classList.remove('show'),2800);
}

function checkAndGrantBossRewards(){
  const newlyUnlocked=[];
  ITEMS.forEach(item=>{
    if(!item.unlock)return;
    if(G.inventory.includes(item.id))return;
    if(itemUnlocked(item)){G.inventory.push(item.id);newlyUnlocked.push(item);}
  });
  if(!newlyUnlocked.length)return;
  save();
  let i=0;
  function showNext(){if(i>=newlyUnlocked.length)return;const item=newlyUnlocked[i++];showGachaReveal(item,false,showNext);}
  showNext();
}

// ── XP result animation ──
function showXPResult(xpGain, coinGain, lumenBonus, errors){
  const screen=document.getElementById('xp-result');
  if(!screen){finishVerseDone(xpGain,coinGain,lumenBonus);return;}
  const xpBefore=G.xp;
  const lvBefore=Math.floor(xpBefore/100)+1;
  const pctBefore=(xpBefore%100);
  document.getElementById('xpr-grade').textContent=errors===0?'\ud83c\udf1f':errors<=2?'\u2b50':'\u271d\ufe0f';
  document.getElementById('xpr-title').textContent=errors===0?'Perfect!':errors<=2?'Great!':'Keep Going!';
  document.getElementById('xpr-sub').textContent='VERSE COMPLETE';
  document.getElementById('xpr-xp').textContent='+'+xpGain+' XP';
  document.getElementById('xpr-coins').textContent='+'+coinGain+' \ud83d\udcb0';
  const lxp=document.getElementById('xpr-lumen');
  const llbl=document.getElementById('xpr-lumen-lbl');
  if(lxp){lxp.style.display=lumenBonus?'block':'none';}
  if(llbl){llbl.style.display=lumenBonus?'block':'none';}
  document.getElementById('xpr-lv-before').textContent='Lv'+lvBefore;
  document.getElementById('xpr-bar-fill').style.width=pctBefore+'%';
  screen.classList.add('show');
  setTimeout(()=>{
    tone(440,'sine',0.05,0.08);
    animateXPSegment(xpBefore,xpGain,document.getElementById('xpr-bar-fill'),document.getElementById('xpr-lv-after'),()=>{
      finishVerseDone(xpGain,coinGain,lumenBonus);
      setTimeout(()=>document.getElementById('xpr-continue').classList.add('ready'),300);
    });
  },400);
}

function animateXPSegment(xpStart, xpToAdd, fill, lvAfterEl, onComplete){
  const lvStart=Math.floor(xpStart/100)+1;
  const pctStart=xpStart%100;
  const xpToNextLevel=100-pctStart;
  if(xpToAdd<=0){lvAfterEl.textContent='Lv'+lvStart;onComplete();return;}
  if(xpToAdd<xpToNextLevel){
    const pctEnd=pctStart+xpToAdd;
    fill.style.transition='width 1.2s cubic-bezier(.4,0,.2,1)';
    fill.style.width=pctEnd+'%';
    lvAfterEl.textContent='Lv'+lvStart;
    setTimeout(onComplete,1300);
  } else {
    fill.style.transition='width '+(xpToNextLevel/100*0.8+0.4)+'s cubic-bezier(.4,0,.2,1)';
    fill.style.width='100%';
    const newXP=xpStart+xpToNextLevel;
    const newLevel=Math.floor(newXP/100)+1;
    lvAfterEl.textContent='Lv'+newLevel;
    setTimeout(()=>{
      showFlowLevelUp(newLevel,()=>{
        fill.style.transition='none';fill.style.width='0%';
        void fill.offsetWidth;
        animateXPSegment(newXP, xpToAdd-xpToNextLevel, fill, lvAfterEl, onComplete);
      });
    },600);
  }
}

function showFlowLevelUp(level, onDone){
  const shardReward=level%5===0;
  const coinBonus=50;
  const screen=document.getElementById('levelup-screen');
  if(!screen){onDone();return;}
  document.getElementById('lv-num').textContent=level;
  const rewards=[];
  rewards.push(`+${coinBonus} \ud83d\udcb0`);
  if(shardReward)rewards.push('+1 \u2728 Shard');
  document.getElementById('lv-rewards').innerHTML=rewards.map(r=>`<div class="lv-reward">${r}</div>`).join('');
  screen.classList.add('show');
  sfxComplete();hapComplete();showBurst();
  const dismiss=()=>{screen.classList.remove('show');onDone();};
  screen.onclick=dismiss;
  screen._to=setTimeout(dismiss,2800);
}

function finishVerseDone(xpGain, coinGain, lumenBonus){
  fInFlowXPAnim=false;
  addXP(xpGain);
  addCoins(coinGain);
  if(lumenBonus>0){G.lumens+=lumenBonus;updateLumensDisplay();}
}

function xprDismiss(){
  const screen=document.getElementById('xp-result');
  if(screen){screen.classList.remove('show');}
  document.getElementById('xpr-continue').classList.remove('ready');
  document.getElementById('fg-done').classList.add('show');
}

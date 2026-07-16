// ════════════════════════════════════════════════════
// SPACED REPETITION ENGINE (SM-2 variant)
// ════════════════════════════════════════════════════
// Pure functions + state readers. No DOM manipulation.
// Ratings: again(0), hard(1), good(2), easy(3)

function srInt(card,r){
  if(r<=0)return 0;
  if(r===1)return Math.max(1,Math.round(card.interval*0.5));
  if(r===2)return card.reps===0?1:card.reps===1?6:Math.round(card.interval*card.ef);
  return card.reps===0?4:card.reps===1?10:Math.round(card.interval*card.ef*1.3);
}

function getSRQ(all){
  const now=Date.now();
  const bossRefs=new Set(VERSES.filter(v=>isBossVerse(v)).map(v=>v.ref));
  let d=(all?[...G.srCards]:G.srCards.filter(c=>c.due<=now)).filter(c=>!bossRefs.has(c.ref));
  return shuffle(d).sort((a,b)=>a.reps-b.reps||a.due-b.due);
}

// ── Mastery system ──────────────────────────────────
function cardMastery(card){
  if(!card)return 'learning';
  if(card.interval>=21)return 'mastered';
  if(card.reps>=2)return 'practicing';
  return 'learning';
}

function verseMastery(ref){
  const card=G.srCards.find(c=>c.ref===ref);
  return cardMastery(card);
}

function masteryProgress(card){
  if(!card)return 0;
  if(card.interval>=21)return 1.0;
  if(card.reps<2)return Math.min(0.99,(card.reps||0)/2);
  return Math.min(0.99,(card.interval||0)/21);
}

function masteryProgressLabel(card){
  if(!card)return {level:'learning',pct:0,next:'Practicing',label:'0 / 2 completions'};
  if(card.interval>=21)return {level:'mastered',pct:100,next:null,label:'Mastered!'};
  if(card.reps<2){
    const pct=Math.round((card.reps||0)/2*100);
    return {level:'learning',pct,next:'Practicing',label:`${Math.floor(card.reps||0)} / 2 completions`};
  }
  const pct=Math.round((card.interval||0)/21*100);
  const daysLeft=Math.max(0,21-Math.round(card.interval||0));
  return {level:'practicing',pct,next:'Mastered',label:`${Math.round(card.interval||0)} / 21 day interval \u00b7 ~${daysLeft}d remaining`};
}

// ── Boss verse helpers ──────────────────────────────
function isBossVerse(verse){
  return /\d+:\d+-\d+$/.test(verse.ref)&&
    bossVerseConstituents(verse,activeCollection()).length>1;
}

function bossVerseUnlocked(verse){
  const col=activeCollection();
  const constituentRefs=bossVerseConstituents(verse,col);
  if(!constituentRefs.length)return false;
  return constituentRefs.every(ref=>verseMastery(ref)==='mastered');
}

// Book portion of a ref, e.g. "Ephesians 3:16-21" -> "Ephesians", "1 Samuel 12:23" -> "1 Samuel"
function verseBook(ref){
  return ref.replace(/\s+\d+:\d+(?:-\d+)?[ab]?$/,'').trim();
}

function bossVerseConstituents(verse,col){
  const ref=verse.ref;
  const m=ref.match(/(\d+):(\d+)-(\d+)$/);
  if(!m)return [];
  const book=verseBook(ref);
  const ch=parseInt(m[1]),vStart=parseInt(m[2]),vEnd=parseInt(m[3]);
  const result=[];
  col.verses.forEach(v=>{
    if(v===verse)return;
    if(verseBook(v.ref)!==book)return;
    const vm=v.ref.match(/(\d+):(\d+)(?:-(\d+))?$/);
    if(!vm)return;
    const vch=parseInt(vm[1]);
    if(vch!==ch)return;
    const vs=parseInt(vm[2]),ve=vm[3]?parseInt(vm[3]):vs;
    if(vs>=vStart&&ve<=vEnd)result.push(v.ref);
  });
  return result;
}

// ── Boss group system ──────────────────────────────
function getCollectionBossGroups(col){
  const compositeVerses = col.verses.filter(v => {
    const m = v.ref.match(/\d+:\d+-(\d+)$/);
    if(!m) return false;
    const constituents = bossVerseConstituents(v, col);
    return constituents.length > 1;
  });
  if(compositeVerses.length > 0) return null;
  if(!col.bossGroups || !col.bossGroups.length) return null;
  const groups = col.bossGroups.map((idxArr, gi) => {
    const refs = idxArr.map(i => col.verses[i]?.ref).filter(Boolean);
    const isFinalBoss = gi === col.bossGroups.length - 1;
    const label = isFinalBoss
      ? 'Final Boss \u2014 All ' + refs.length + ' Verses'
      : 'Miniboss ' + (gi+1) + ' \u2014 ' + col.verses[idxArr[0]]?.ref + ' \u2192 ' + col.verses[idxArr[idxArr.length-1]]?.ref;
    return { refs, isFinalBoss, label, groupIdx: gi };
  });
  return groups;
}

function bossGroupUnlocked(col, groupIdx){
  const groups = getCollectionBossGroups(col);
  if(!groups || groupIdx >= groups.length) return false;
  const group = groups[groupIdx];
  if(groupIdx > 0 && !bossGroupUnlocked(col, groupIdx - 1)) return false;
  return group.refs.every(ref => {
    const card = G.srCards.find(c => c.ref === ref);
    return card && (card.reps >= 2 || card.interval >= 1);
  });
}

function bossGroupBeaten(col, groupIdx){
  const groups = getCollectionBossGroups(col);
  if(!groups || groupIdx >= groups.length) return false;
  const group = groups[groupIdx];
  if(!G.bossGroupsBeaten) G.bossGroupsBeaten = {};
  if(!G.bossGroupsBeaten[col.id]) G.bossGroupsBeaten[col.id] = {};
  return !!G.bossGroupsBeaten[col.id][groupIdx];
}

function markBossGroupBeaten(col, groupIdx){
  if(!G.bossGroupsBeaten) G.bossGroupsBeaten = {};
  if(!G.bossGroupsBeaten[col.id]) G.bossGroupsBeaten[col.id] = {};
  G.bossGroupsBeaten[col.id][groupIdx] = true;
  save();
}

// ── Exclusivity system ──────────────────────────────
function itemUnlocked(item){
  if(!item.unlock)return true;
  const {collectionId,tier}=item.unlock;
  if(collectionId==='prestige'){
    return COLLECTIONS.filter(c=>c.unlocked).some(col=>{
      const bossV=col.verses.filter(v=>isBossVerse(v));
      if(!bossV.length)return false;
      const fb=bossV.reduce((b,v)=>bossVerseConstituents(v,col).length>bossVerseConstituents(b,col).length?v:b,bossV[0]);
      const mbs=bossV.filter(v=>v!==fb);
      return mbs.some(v=>bossVerseUnlocked(v));
    });
  }
  const col=COLLECTIONS.find(c=>c.id===collectionId);
  if(!col)return false;
  const groups=getCollectionBossGroups(col);
  if(groups){
    if(tier==='boss'){const fg=groups.find(g=>g.isFinalBoss);return fg?bossGroupBeaten(col,fg.groupIdx):false;}
    const n=parseInt(tier.replace('miniboss',''))-1;
    return groups[n]?bossGroupBeaten(col,n):false;
  }
  const bossV=col.verses.filter(v=>isBossVerse(v));
  if(!bossV.length)return false;
  const fb=bossV.reduce((b,v)=>bossVerseConstituents(v,col).length>bossVerseConstituents(b,col).length?v:b,bossV[0]);
  const mbs=bossV.filter(v=>v!==fb).sort((a,b)=>a.ref.localeCompare(b.ref));
  if(tier==='boss')return bossVerseUnlocked(fb);
  const n=parseInt(tier.replace('miniboss',''))-1;
  return mbs[n]?bossVerseUnlocked(mbs[n]):false;
}

function itemUnlockHint(item){
  if(!item.unlock)return null;
  const {collectionId,tier}=item.unlock;
  if(collectionId==='prestige')return 'Beat any miniboss across all collections';
  const col=COLLECTIONS.find(c=>c.id===collectionId);
  if(!col)return 'Complete a collection';
  const name=col.icon+' '+col.name;
  if(tier==='boss')return 'Defeat '+name+' Final Boss';
  const n=parseInt(tier.replace('miniboss',''));
  return 'Defeat '+name+' Miniboss '+n;
}

// ── Apply SR rating from Flow ──────────────────────
function applyFlowSRRating(ref,errors,perfect){
  const card=G.srCards.find(c=>c.ref===ref);
  if(!card)return;
  const prevLevel=cardMastery(card);
  const prevProgress=masteryProgress(card);

  if(errors>4){
    card.reps=Math.min(card.reps+(card.reps<2?0.25:0), card.reps+0.25);
    card.interval=Math.min(card.interval+0.5, 20.9);
    card.due=Date.now()+3600000;
  } else {
    const rating=errors===0?3:errors<=2?2:1;
    const ni=srInt(card,rating);
    const q=[0,2,3,4][rating];
    card.ef=Math.max(1.3,card.ef+(0.1-(4-q)*(0.08+(4-q)*0.02)));
    card.reps++;
    card.interval=ni;
    card.due=Date.now()+ni*86400000;
    G.srSessionCount++;
  }

  const newLevel=cardMastery(card);
  const leveledUp=newLevel!==prevLevel&&(newLevel==='practicing'||newLevel==='mastered');
  if(leveledUp){ showMasteryLevelUp(ref,newLevel); if(newLevel==='mastered')setTimeout(checkAndGrantBossRewards,1200); }

  snapshotCollectionProgress();
  save();
  return {prevProgress, newProgress:masteryProgress(card), leveledUp, newLevel};
}

// ── Word truncation for mastered verses ──────────
function applyWordTruncation(words,ref){
  const completions=(G.verseCompletions&&G.verseCompletions[ref])||0;
  if(completions===0)return words;
  const levelsToHide=Math.min(completions,3);
  return words.map(w=>{
    if(w.length<=2)return w;
    const hide=Math.min(levelsToHide,w.length-1);
    return w.slice(0,w.length-hide)+'_'.repeat(hide);
  });
}

function incrementVerseCompletion(ref,errors){
  if(!G.verseCompletions)G.verseCompletions={};
  if(verseMastery(ref)==='mastered'){
    if(errors===0){
      G.verseCompletions[ref]=(G.verseCompletions[ref]||0)+1;
    } else if(errors>=3&&G.verseCompletions[ref]>0){
      G.verseCompletions[ref]=Math.max(0,G.verseCompletions[ref]-1);
    }
  }
}

// ── Mastery CFG overrides ──────────────────────────
let _cfgOverrides=null;
let fBtMultiplierOverride=1.0;

function applyMasteryCFG(level){
  const m=MASTERY_CFG[level];
  if(!m)return;
  _cfgOverrides={
    fallSpeed:CFG.fallSpeed,
    bottomWobbleMs:CFG.bottomWobbleMs,
    btMultiplier:1.0,
    hearts:5,
  };
  CFG.fallSpeed=m.fallSpeed;
  CFG.bottomWobbleMs=m.bottomWobbleMs;
  fBtMultiplierOverride=m.btMultiplier;
  fHearts=m.hearts;
  document.getElementById('fh-val').textContent=fHearts;
}

function restoreMasteryCFG(){
  if(!_cfgOverrides)return;
  CFG.fallSpeed=_cfgOverrides.fallSpeed;
  CFG.bottomWobbleMs=_cfgOverrides.bottomWobbleMs;
  fBtMultiplierOverride=1.0;
  _cfgOverrides=null;
}

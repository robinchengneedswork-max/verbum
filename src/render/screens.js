// ════════════════════════════════════════════════════
// TAB / SCREEN MANAGEMENT + HOME / LESSON / SR / COLLECTIONS RENDERING
// ════════════════════════════════════════════════════

function switchTab(t){
  resumeAC();
  document.querySelectorAll('.tab').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.screen').forEach(el=>el.classList.remove('active'));
  document.getElementById('tab-'+t).classList.add('active');
  document.getElementById(t+'-screen').classList.add('active');
  if(t==='home')renderHome();
  if(t==='lesson')renderLessonStart();
  if(t==='sr')renderSR();
  if(t==='flow')renderFlowMenu();
  if(t==='shop')renderShop();
  if(t==='collections')renderCollections();
}

// ── HOME ──
function renderHome(){
  const v=VERSES[G.lessonVerseIdx];
  document.getElementById('home-preview').textContent='"'+v.text.slice(0,95)+'\u2026"';
  document.getElementById('home-ref').textContent='\u2014 '+v.ref;
  const mastered=Object.values(G.lessonProgress).filter(x=>x>=2).length;
  document.getElementById('sb-m').textContent=mastered+'/'+VERSES.length;
  document.getElementById('sb-xp').textContent=G.xp;
  document.getElementById('sb-s').textContent=G.streak;
  renderVList('vlist',(i)=>{G.lessonVerseIdx=i;switchTab('lesson');});
}

function renderVList(id,fn){
  const el=document.getElementById(id);if(!el)return;el.innerHTML='';
  VERSES.forEach((v,i)=>{
    if(isBossVerse(v))return;
    const m=G.lessonProgress[v.ref]||0;
    const div=document.createElement('div');
    const _vm=verseMastery(v.ref);
    const _mastLabel=isBossVerse(v)?'boss':_vm;
    const _mastBadge=`<span class="vitem-mastery ${_mastLabel}">${_mastLabel.toUpperCase()}</span>`;
    div.className='vitem'+(i===G.lessonVerseIdx?' cur':'');
    div.onclick=()=>fn(i);
    div.innerHTML=`<div><div class="vitem-ref">${v.ref}${_mastBadge}</div><div class="vitem-book">${activeCollection().name} \u00b7 ESV</div></div>
      <div class="dots"><div class="dot${m>0?' on':''}"></div><div class="dot${m>1?' on':''}"></div><div class="dot${m>2?' on':''}"></div></div>`;
    el.appendChild(div);
  });
}

// ── LESSON ──
const MODES=["read","fill","tap","vanish","choice"];
const MLABELS={read:"\ud83d\udcd6 Read",fill:"\u270f\ufe0f Fill",tap:"\ud83e\udde9 Arrange",vanish:"\ud83c\udf2b\ufe0f Vanish",choice:"\ud83c\udfaf Reference"};
let tapSel=[],tapBank=[],lcDone=false;

function renderLessonStart(){
  const v=VERSES[G.lessonVerseIdx];
  document.getElementById('ls-preview').textContent='"'+v.text.slice(0,95)+'\u2026"';
  document.getElementById('ls-ref').textContent='\u2014 '+v.ref;
  renderVList('lesson-vlist',(i)=>{G.lessonVerseIdx=i;G.lessonModeIdx=0;renderLessonStart();});
  document.getElementById('lesson-start').style.display='block';
  document.getElementById('lesson-active').style.display='none';
}
function beginLesson(){G.lessonModeIdx=0;G.hearts=5;updateHeader();document.getElementById('lesson-start').style.display='none';document.getElementById('lesson-active').style.display='block';renderStep();}
function endLesson(){document.getElementById('lesson-active').style.display='none';document.getElementById('lesson-start').style.display='block';renderLessonStart();}
function renderStep(){
  const mode=MODES[G.lessonModeIdx],verse=VERSES[G.lessonVerseIdx];
  const pd=document.getElementById('pdots');pd.innerHTML='';
  MODES.forEach((_,i)=>{const d=document.createElement('div');d.className='pdot'+(i<G.lessonModeIdx?' done':i===G.lessonModeIdx?' cur':'');pd.appendChild(d);});
  document.getElementById('lcount').textContent=(G.lessonModeIdx+1)+'/'+MODES.length;
  document.getElementById('lmode').textContent=MLABELS[mode];
  const body=document.getElementById('lbody');body.innerHTML='';
  if(mode==='read')renderRead(body,verse);
  if(mode==='fill')renderFill(body,verse);
  if(mode==='tap')renderTap(body,verse);
  if(mode==='vanish')renderVanish(body,verse);
  if(mode==='choice')renderLC(body,verse);
}
function lResult(ok){
  G.hearts=ok?G.hearts:Math.max(0,G.hearts-1);updateHeader();
  const mode=MODES[G.lessonModeIdx],gain=mode==='read'?10:25,last=G.lessonModeIdx>=MODES.length-1;
  const verse=VERSES[G.lessonVerseIdx];
  if(ok){G.streak++;addXP(gain);addCoins(5);}
  if(ok&&last)G.lessonProgress[verse.ref]=(G.lessonProgress[verse.ref]||0)+1;
  save();
  showRO(ok,gain,verse,last,()=>{if(last){G.lessonVerseIdx=(G.lessonVerseIdx+1)%VERSES.length;G.lessonModeIdx=0;}else G.lessonModeIdx++;G.hearts=5;updateHeader();renderStep();},()=>endLesson());
}
function renderRead(b,v){b.innerHTML=`<div class="card" style="text-align:center"><div style="font-size:20px;margin-bottom:6px">\u2726</div><p class="verseText">${v.text}</p><div class="verseRef" style="margin-top:8px">\u2014 ${v.ref}</div></div><p class="hint">Study carefully</p><button class="btn" onclick="G.lessonModeIdx=1;renderStep()">I'm Ready \u2192</button>`;}
function renderFill(b,v){
  const words=v.text.split(' ');
  const elig=words.map((_,i)=>i).filter(i=>words[i].replace(/[^a-z]/gi,'').length>4);
  const blanks=shuffle(elig).slice(0,Math.max(3,Math.floor(words.length*0.25)));
  let html=`<p class="hint">Fill in the missing words</p><div class="card fill-line">`;
  words.forEach((w,i)=>{if(!blanks.includes(i))html+=`<span class="fw">${w} </span>`;else{const c=w.replace(/[^a-zA-Z']/g,'');html+=`<input class="fi" data-c="${c.toLowerCase()}" style="width:${Math.max(c.length*11,34)}px" oninput="fillReady()">`;} });
  html+=`</div><button class="btn" id="fbtn" onclick="checkFill()" disabled>Check</button>`;
  b.innerHTML=html;
}
function fillReady(){document.getElementById('fbtn').disabled=![...document.querySelectorAll('.fi')].every(i=>i.value.trim());}
function checkFill(){
  const ins=[...document.querySelectorAll('.fi')];let ok=true;
  ins.forEach(i=>{const c=i.value.trim().toLowerCase()===i.dataset.c;i.classList.toggle('ok',c);i.classList.toggle('no',!c);i.disabled=true;if(!c)ok=false;});
  document.getElementById('fbtn').style.display='none';
  const e=document.createElement('div');e.style.cssText='text-align:center;font-size:34px;margin:8px 0';e.textContent=ok?'\ud83c\udf1f':'\u271d\ufe0f';document.getElementById('lbody').appendChild(e);
  ok?sfxCorrect():sfxWrong();ok?hapCorrect():hapWrong();setTimeout(()=>lResult(ok),750);
}
function renderTap(b,v){
  tapSel=[];tapBank=shuffle(v.text.split(' ').map((w,i)=>({w,id:i})));
  b.innerHTML=`<p class="hint">Arrange in order</p><div style="text-align:center;font-size:9px;color:#C9A84C;margin-bottom:6px">\u2014 ${v.ref}</div><div class="tap-zone" id="tsel"><span class="tp">Tap below\u2026</span></div><div class="wbank" id="tbank"></div><button class="btn" id="tbtn" onclick="checkTap()" disabled>Check</button>`;
  rTapUI();
}
function rTapUI(){
  const ts=document.getElementById('tsel'),tb=document.getElementById('tbank');if(!ts||!tb)return;
  tb.innerHTML='';tapBank.forEach(item=>{const b=document.createElement('button');b.className='chip cb';b.textContent=item.w;b.onclick=()=>{hapTap();tapBank=tapBank.filter(x=>x.id!==item.id);tapSel.push(item);rTapUI();};tb.appendChild(b);});
  ts.innerHTML='';
  if(!tapSel.length)ts.innerHTML='<span class="tp">Tap words below\u2026</span>';
  else tapSel.forEach(item=>{const b=document.createElement('button');b.className='chip cs';b.textContent=item.w;b.onclick=()=>{hapTap();tapSel=tapSel.filter(x=>x.id!==item.id);tapBank=shuffle([...tapBank,item]);rTapUI();};ts.appendChild(b);});
  const btn=document.getElementById('tbtn');if(btn)btn.disabled=tapBank.length>0;
}
function checkTap(){
  const v=VERSES[G.lessonVerseIdx],ok=tapSel.map(x=>x.w).join(' ')===v.text;
  const e=document.createElement('div');e.style.cssText='text-align:center;font-size:34px;margin:8px 0';e.textContent=ok?'\ud83c\udf1f':'\u271d\ufe0f';document.getElementById('lbody').appendChild(e);
  document.getElementById('tbtn').style.display='none';
  ok?sfxCorrect():sfxWrong();ok?hapCorrect():hapWrong();setTimeout(()=>lResult(ok),750);
}
function renderLC(b,v){
  lcDone=false;
  const others=shuffle(VERSES.filter(x=>x.ref!==v.ref)).slice(0,3).map(x=>x.ref);
  const choices=shuffle([v.ref,...others]);
  const wrap=document.createElement('div');wrap.className='copts';
  choices.forEach(c=>{const btn=document.createElement('button');btn.className='copt';btn.textContent=c;btn.onclick=()=>pickLC(btn,c,v.ref);wrap.appendChild(btn);});
  b.innerHTML=`<p class="hint">Which verse is this from?</p><div class="card"><p class="verseText" style="margin:0">${v.text}</p></div>`;
  b.appendChild(wrap);
}
function pickLC(btn,c,correct){
  if(lcDone)return;lcDone=true;
  const ok=c===correct;
  document.querySelectorAll('.copt').forEach(b=>{if(b.textContent===correct)b.classList.add('ok');else if(b===btn&&!ok)b.classList.add('no');else b.classList.add('dim');b.disabled=true;});
  ok?sfxCorrect():sfxWrong();ok?hapCorrect():hapWrong();setTimeout(()=>lResult(ok),650);
}

// ── RESULT OVERLAY ──
let _roNext=null,_roHome=null;
function showRO(ok,gain,verse,last,nextFn,homeFn){
  _roNext=nextFn;_roHome=homeFn;
  document.getElementById('ro-emoji').textContent=ok?'\ud83c\udf1f':'\u271d\ufe0f';
  document.getElementById('ro-title').textContent=ok?'Excellent!':'Keep Going';
  document.getElementById('ro-title').style.color=ok?'#C9A84C':'#FF8A80';
  document.getElementById('ro-sub').textContent=ok?('+'+gain+' XP \u00b7 +5 coins'):(G.hearts+' hearts left');
  const rc=document.getElementById('ro-card');
  if(ok){rc.style.display='block';rc.innerHTML=`<p class="verseText">"${verse.text}"</p><div class="verseRef" style="margin-top:7px">\u2014 ${verse.ref}</div>`;}else rc.style.display='none';
  document.getElementById('ro-next').textContent=last?'Next Verse \u2726':'Next \u2192';
  document.getElementById('result-overlay').classList.add('show');
}
function roNext(){document.getElementById('result-overlay').classList.remove('show');if(_roNext)_roNext();}
function roHome(){document.getElementById('result-overlay').classList.remove('show');if(_roHome)_roHome();}

// ── SR ──
let srQ=[],srIdx=0,srFlipped=false;
let srSubView='review'; // 'review' | 'cram' | 'browse' — session-only UI state
let srIsDueQueue=true; // A2: true=due queue (rewards), false=study-anyway (no rewards)
const SR_MODES=[{v:'ref2text',l:'REF → TEXT'},{v:'text2ref',l:'TEXT → REF'},{v:'firstletter',l:'FIRST LETTERS'}];
const SR_MODE_LABEL={ref2text:'REFERENCE',text2ref:'VERSE TEXT',firstletter:'FIRST LETTERS'};

function renderSR(){
  renderSRSubTabs();
  if(srSubView==='cram'){showSRSection('cram');renderCram();return;}
  if(srSubView==='browse'){showSRSection('browse');renderBrowse();return;}
  showSRSection('review');
  const now=Date.now();
  document.getElementById('sr-due-count').textContent=G.srCards.filter(c=>c.due<=now).length;
  document.getElementById('sr-new-count').textContent=G.srCards.filter(c=>c.reps===0).length;
  document.getElementById('sr-reviewed').textContent=G.srSessionCount;
  document.getElementById('sr-mastered-count').textContent=G.srCards.filter(c=>c.interval>=21).length;
  renderSRModePicker();renderSRNewLine();
  srQ=getSRQ(false);srIdx=0;srIsDueQueue=true;
  const practiceHint=document.getElementById('sr-practice-hint');if(practiceHint)practiceHint.style.display='none';
  if(!srQ.length){document.getElementById('sr-card-area').style.display='none';document.getElementById('sr-done').style.display='block';}
  else{document.getElementById('sr-card-area').style.display='block';document.getElementById('sr-done').style.display='none';loadSR();}
}

// Sub-view switcher (Review | Cram | Browse)
function renderSRSubTabs(){
  const el=document.getElementById('sr-subtabs');if(!el)return;
  const views=[['review','Review'],['cram','Cram'],['browse','Browse']];
  el.innerHTML=views.map(([v,l])=>`<div class="sr-subtab${srSubView===v?' on':''}" onclick="setSRSubView('${v}')">${l}</div>`).join('');
}
function setSRSubView(v){if(srSubView===v)return;srSubView=v;cramSession=null;renderSR();}
function showSRSection(which){
  document.getElementById('sr-review-wrap').style.display=which==='review'?'block':'none';
  document.getElementById('sr-cram-wrap').style.display=which==='cram'?'block':'none';
  document.getElementById('sr-browse-wrap').style.display=which==='browse'?'block':'none';
}

// Mode picker (recall mode) — switching reloads presentation without rating.
function renderSRModePicker(){
  const el=document.getElementById('sr-mode-picker');if(!el)return;
  el.innerHTML=SR_MODES.map(m=>`<div class="sr-seg${CFG.srMode===m.v?' on':''}" onclick="setSRMode('${m.v}')">${m.l}</div>`).join('');
}
function setSRMode(m){if(CFG.srMode===m)return;CFG.srMode=m;save();renderSRModePicker();if(srSubView==='review'){if(srQ.length&&srIdx<srQ.length)loadSR();}else if(srSubView==='cram'&&cramSession&&cramSession.idx<cramSession.deck.length)loadCramCard();}

// "New today: 2/6" line under the pills when new cards were introduced/capped.
function renderSRNewLine(){
  const el=document.getElementById('sr-new-line');if(!el)return;
  const per=CFG.srNewPerDay;
  const bossRefs=new Set(VERSES.filter(v=>isBossVerse(v)).map(v=>v.ref));
  const totalNew=G.srCards.filter(c=>c.reps===0&&!bossRefs.has(c.ref)).length;
  if(!(per>0)){el.style.display='none';return;}
  const intro=srNewIntroToday();
  const remaining=Math.max(0,per-intro.count);
  if(totalNew>remaining||intro.count>0){
    el.style.display='block';
    el.textContent=`New today: ${intro.count}/${per} — more tomorrow (or use Cram)`;
  }else el.style.display='none';
}

function srRestart(){srQ=getSRQ(true);srIdx=0;srIsDueQueue=false;const practiceHint=document.getElementById('sr-practice-hint');if(practiceHint){practiceHint.style.display='block';practiceHint.textContent='Practice mode — no rewards';}document.getElementById('sr-card-area').style.display='block';document.getElementById('sr-done').style.display='none';loadSR();}

// Populate the flip card front/back per the active recall mode (shared with Cram).
function fillFlipCard(elFront,elBack,elLabel,ref,text){
  const mode=CFG.srMode;
  if(mode==='text2ref'){
    elLabel.textContent=SR_MODE_LABEL.text2ref;
    elFront.innerHTML=`<div class="fc-text">${text}</div>`;
    elBack.innerHTML=`<div class="fc-ref">${ref}</div><div class="fc-text" style="margin-top:8px;font-size:10px;opacity:0.75">${text}</div>`;
  }else if(mode==='firstletter'){
    elLabel.textContent=SR_MODE_LABEL.firstletter;
    elFront.innerHTML=`<div class="fc-ref">${ref}</div><div class="fc-text" style="margin-top:8px;font-style:normal;letter-spacing:1px">${firstLetters(text)}</div>`;
    elBack.innerHTML=`<div class="fc-text">${text}</div>`;
  }else{
    elLabel.textContent=SR_MODE_LABEL.ref2text;
    elFront.innerHTML=`<div class="fc-ref">${ref}</div>`;
    elBack.innerHTML=`<div class="fc-text">${text}</div>`;
  }
}

function loadSR(){
  if(srIdx>=srQ.length){srQ=getSRQ(false);srIdx=0;if(!srQ.length){renderSR();return;}}
  const card=srQ[srIdx],verse=VERSES.find(v=>v.ref===card.ref);
  srFlipped=false;
  document.getElementById('fc').classList.remove('flipped');
  fillFlipCard(document.getElementById('fc-front-body'),document.getElementById('fc-back-body'),document.getElementById('fc-front-label'),card.ref,verse?verse.text:'\u2014');
  document.getElementById('sr-flip-hint').style.display='block';
  document.getElementById('sr-btns').style.display='none';
  document.getElementById('sr-queue-label').textContent=`${srIdx+1} of ${srQ.length}`;
  document.getElementById('sr-streak-label').textContent=card.reps>0?`\u00d7${card.reps}`:'New';
  const gi=srInt(card,2),ei=srInt(card,3);
  document.getElementById('sr-good-int').textContent=gi<1?'<1d':gi+'d';
  document.getElementById('sr-easy-int').textContent=ei<1?'<1d':ei+'d';
}
function flipCard(){if(srFlipped)return;srFlipped=true;sfxFlip();hapTap();document.getElementById('fc').classList.add('flipped');document.getElementById('sr-flip-hint').style.display='none';document.getElementById('sr-btns').style.display='grid';}
function rateCard(r){
  if(!srFlipped)return;
  const card=srQ[srIdx];const wasNew=card.reps===0;
  sfxRate(r);hapTap();
  applySRRating(card,r,Date.now());
  if(r===0){srQ.push({...card});}
  else if(srIsDueQueue){G.srSessionCount++;addXP(r===3?15:r===2?10:5);addCoins(3);if(wasNew){const intro=srNewIntroToday();intro.count++;}}
  else{/* study-anyway: apply SR but no coins/XP */}
  srIdx++;save();
  document.getElementById('sr-reviewed').textContent=G.srSessionCount;
  document.getElementById('sr-mastered-count').textContent=G.srCards.filter(c=>c.interval>=21).length;
  renderSRNewLine();
  const fw=document.getElementById('fc-wrap');
  fw.style.cssText='transition:transform 0.15s,opacity 0.15s;transform:translateX(-38px);opacity:0';
  setTimeout(()=>{fw.style.cssText='transition:none;transform:translateX(38px);opacity:0';loadSR();setTimeout(()=>{fw.style.cssText='transition:transform 0.15s,opacity 0.15s;transform:none;opacity:1';},14);},160);
}

// ── COLLECTIONS ──
function renderCollections(){
  const list=document.getElementById('collections-list');
  if(!list)return;list.innerHTML='';
  COLLECTIONS.forEach(col=>{
    const cp=G.collectionProgress[col.id]||blankCollectionProgress(col.verses);
    const total=col.verses.length;
    const mastered=(cp.srCards||[]).filter(c=>c.interval>=21).length;
    const pct=total>0?Math.round(mastered/total*100):0;
    const isActive=col.id===G.activeCollectionId;
    const card=document.createElement('div');
    card.className='collection-card'+(isActive?' active-collection':'')+(col.unlocked?'':' locked');
    card.style.borderColor=isActive?col.theme:'#3A2800';
    card.innerHTML=`
      <div class="collection-card-header">
        <div class="collection-card-icon">${col.icon}</div>
        <div>
          <div class="collection-card-name">${col.name}</div>
          <div class="collection-card-sub">${col.subtitle}</div>
        </div>
        ${isActive?'<div class="collection-card-active-badge">ACTIVE</div>':''}
        ${!col.unlocked?'<div class="collection-card-active-badge" style="background:#3A2800;color:#7A5C2A">LOCKED</div>':''}
      </div>
      <div class="collection-progress-bar"><div class="collection-progress-fill" style="width:${pct}%;background:${col.theme}"></div></div>
      <div class="collection-stats">
        <div class="collection-stat"><span class="collection-stat-val">${mastered}</span>/${total} mastered</div>
        <div class="collection-stat"><span class="collection-stat-val">${pct}%</span> complete</div>
        <div class="collection-stat"><span class="collection-stat-val">${(cp.srCards||[]).filter(c=>c.reps===0).length}</span> new</div>
      </div>
      ${col.unlocked&&!isActive?`<button class="collection-switch-btn" onclick="switchCollection('${col.id}')">Switch to this collection \u2192</button>`:''}
      ${isActive?'<div style="font-size:9px;color:#5A4020;margin-top:8px">Currently active</div>':''}
    `;
    list.appendChild(card);
  });
}
function switchCollection(id){
  if(id===G.activeCollectionId)return;
  setActiveCollection(id);
  renderCollections();
  switchTab('flow');
  hapComplete();
}

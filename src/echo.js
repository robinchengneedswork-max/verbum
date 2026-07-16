// ════════════════════════════════════════════════════
// ECHO — call-and-response melody mode
// The mode that finally PLAYS mel(): the game performs a phrase (karaoke
// highlight + one note per word via SCALES[CFG.scale]), then the player echoes
// it back by tapping the phrase's words from a shuffled key bank in order, each
// correct tap re-sounding its note. Binds each verse to a little tune = the
// memory hook and the novelty in one feature.
//
// Structure — Simon-style cumulative WITH checkpoints:
//   • Words split into ~echoChunkSize phrases.
//   • Phrases packed greedily into checkpoint SEGMENTS bounded by
//     echoMaxChainWords, so a long verse becomes a series of digestible chains.
//   • Within a segment we Simon-accumulate: round 1 = phrase A, round 2 =
//     A+B, … Each round replays the whole cumulative sequence.
//   • Segment fully echoed → CHECKPOINT (bank reward + celebratory beat, chain
//     resets), then the next segment starts fresh.
//
// Lives in a hidden #echo-game div inside flow-screen (mirrors flow-menu /
// flow-game); no new tab, no persisted schema. CRITICAL: every listen-phase
// setTimeout id is tracked in E.timers and cleared on exit / tab switch so no
// audio keeps firing if the user bails mid-playback.
// ════════════════════════════════════════════════════

let E=null; // per-session state, rebuilt each startEcho()

// Note frequency for the word at global index gi. Using the global index (not a
// per-phrase index) keeps the tune consistent across rounds → the verse's melody.
function echoNoteFreq(gi){const fn=SCALES[CFG.scale]||SCALES.major;return fn(gi);}
function echoPlayNote(gi,delay){
  if(CFG.instrument==='off'||CFG.scale==='off')return;
  const inst=INST[CFG.instrument]||INST.sine;
  inst(echoNoteFreq(gi),0.22,0.18,delay||0);
}

// ── Pure structure builders (also unit-tested in tests/echo.test.js) ──
// Split word indices into phrases of up to echoChunkSize each.
function echoBuildPhrases(words){
  const size=Math.max(1,CFG.echoChunkSize||4);const phrases=[];
  for(let i=0;i<words.length;i+=size){
    const idxs=[];for(let j=i;j<Math.min(i+size,words.length);j++)idxs.push(j);
    phrases.push(idxs);
  }
  return phrases;
}
// Greedily pack phrases into segments whose total word count stays within the
// cap (a single over-cap phrase still gets its own segment — never dropped).
function echoBuildSegments(phrases){
  const cap=Math.max(1,CFG.echoMaxChainWords||8);const segs=[];let cur=[],curW=0;
  phrases.forEach(p=>{
    if(cur.length&&curW+p.length>cap){segs.push(cur);cur=[];curW=0;}
    cur.push(p);curW+=p.length;
  });
  if(cur.length)segs.push(cur);
  return segs;
}

// ── Session lifecycle ──
function startEcho(idx){
  resumeAC();
  if(typeof idx!=='number'||!VERSES[idx]){const order=buildSmartFlowOrder();idx=(order&&order.length)?order[0]:0;}
  const verse=VERSES[idx];const words=verse.text.split(' '); // tokenize like Flow
  const phrases=echoBuildPhrases(words);
  E={verse,words,phrases,segments:echoBuildSegments(phrases),segIdx:0,round:0,phase:null,seq:[],bank:[],tapPos:0,timers:[],errors:0,coins:0};
  document.getElementById('flow-menu').style.display='none';
  document.getElementById('flow-game').style.display='none';
  document.getElementById('echo-game').style.display='flex';
  document.getElementById('eg-done').style.display='none';
  document.getElementById('eg-ref').textContent='— '+verse.ref;
  echoStartRound();
}

function echoStartRound(){
  const seg=E.segments[E.segIdx];
  E.seq=[];for(let p=0;p<=E.round;p++)E.seq.push(...seg[p]);
  E.tapPos=0;
  document.getElementById('eg-seg').textContent='Set '+(E.segIdx+1)+'/'+E.segments.length+' · '+(E.round+1)+'/'+seg.length;
  echoUpdateProgress();
  echoListen();
}

// Listen phase: karaoke playback of the cumulative sequence, one note per word.
function echoListen(){
  E.phase='listen';clearEchoTimers();
  document.getElementById('eg-status').textContent='🔊 Listen…';
  document.getElementById('eg-bank').innerHTML='';
  const stage=document.getElementById('eg-stage');stage.innerHTML='';
  E.seq.forEach((gi,i)=>{
    const sp=document.createElement('span');sp.className='echo-word';sp.id='ew-'+i;sp.textContent=E.words[gi];
    stage.appendChild(sp);stage.appendChild(document.createTextNode(' '));
  });
  const tempo=Math.max(150,CFG.echoTempoMs||380);
  E.seq.forEach((gi,i)=>{
    E.timers.push(setTimeout(()=>{
      const el=document.getElementById('ew-'+i);
      if(el){el.classList.add('active');setTimeout(()=>{if(el)el.classList.remove('active');},tempo*0.85);}
      echoPlayNote(gi,0);
    },i*tempo));
  });
  E.timers.push(setTimeout(echoYourTurn,E.seq.length*tempo+250));
}

// Echo phase: shuffled key bank, tap the words back in order.
function echoYourTurn(){
  E.phase='echo';
  document.getElementById('eg-status').textContent='👉 Your turn — tap in order';
  E.bank=shuffle(E.seq.map(gi=>({gi})));
  echoRenderProgress();echoRenderBank();
}

function echoRenderProgress(){
  const stage=document.getElementById('eg-stage');stage.innerHTML='';
  E.seq.forEach((gi,i)=>{
    const sp=document.createElement('span');
    if(i<E.tapPos){sp.className='echo-word lit';sp.textContent=E.words[gi];}
    else{sp.className='echo-slot';sp.textContent='•';}
    stage.appendChild(sp);stage.appendChild(document.createTextNode(' '));
  });
}
function echoRenderBank(){
  const bank=document.getElementById('eg-bank');bank.innerHTML='';
  E.bank.forEach(item=>{
    const b=document.createElement('button');b.className='chip echo-chip';b.textContent=E.words[item.gi];
    b.onclick=()=>echoTap(item);bank.appendChild(b);
  });
}

function echoTap(item){
  if(!E||E.phase!=='echo')return;resumeAC();
  const expectedGi=E.seq[E.tapPos];
  // Match on word text (not gi) so duplicate words anywhere in the chain accept
  // any matching chip; the note played is the position's note → tune stays true.
  if(E.words[item.gi]===E.words[expectedGi]){
    echoPlayNote(expectedGi,0);hapCorrect();
    E.bank=E.bank.filter(x=>x!==item);E.tapPos++;
    echoRenderProgress();echoRenderBank();
    if(E.tapPos>=E.seq.length)echoRoundComplete();
  }else{
    E.errors++;sfxWrong();hapWrong();
    const bank=document.getElementById('eg-bank');bank.classList.add('echo-shake');
    setTimeout(()=>bank.classList.remove('echo-shake'),400);
  }
}

function echoRoundComplete(){
  const seg=E.segments[E.segIdx];
  if(E.round<seg.length-1){
    E.round++;echoUpdateProgress();
    document.getElementById('eg-status').textContent='✓ Nice — one more…';
    E.timers.push(setTimeout(echoStartRound,700));
  }else{
    echoCheckpoint();
  }
}

function echoCheckpoint(){
  E.phase='reward';sfxComplete();hapComplete();
  const reward=3;E.coins+=reward;addCoins(reward,'🎵 Checkpoint +'+reward);
  document.getElementById('eg-status').textContent='🎉 Checkpoint!';
  E.segIdx++;
  echoUpdateProgress();
  if(E.segIdx>=E.segments.length){E.timers.push(setTimeout(echoVerseDone,900));}
  else{E.round=0;E.timers.push(setTimeout(echoStartRound,1100));}
}

function echoVerseDone(){
  clearEchoTimers();E.phase='done';
  sfxComplete();hapComplete();showBurst();
  const xp=E.errors===0?12:7;addXP(xp);const bonus=5;addCoins(bonus);
  const totalCoins=E.coins+bonus,errors=E.errors,verse=E.verse,vi=VERSES.indexOf(verse);
  document.getElementById('eg-bank').innerHTML='';
  document.getElementById('eg-status').textContent='';
  document.getElementById('eg-stage').innerHTML='';
  const done=document.getElementById('eg-done');done.style.display='block';
  done.innerHTML=`<div class="eg-done-icon">${errors===0?'🌟':'🎵'}</div>
    <div class="eg-done-title">${errors===0?'Perfect Echo!':'Verse Echoed!'}</div>
    <div class="eg-done-sub">${errors} slip${errors!==1?'s':''} · +${xp} XP · +${totalCoins} 💰</div>
    <div class="eg-done-verse">${verse.text}</div>
    <button class="btn" onclick="startEcho(${vi})">↺ Again</button>
    <button class="btn btn-ghost" onclick="exitEcho()" style="margin-top:6px">Back to Flow</button>`;
  save();
}

function echoUpdateProgress(){
  const totalRounds=E.segments.reduce((a,s)=>a+s.length,0);
  let done=0;for(let i=0;i<E.segIdx;i++)done+=E.segments[i].length;done+=E.round;
  const fill=document.getElementById('eg-progfill');if(fill)fill.style.width=(done/Math.max(1,totalRounds)*100)+'%';
}

// ── Teardown (critical: stop scheduled audio if the user bails) ──
function clearEchoTimers(){if(E&&E.timers){E.timers.forEach(id=>clearTimeout(id));E.timers=[];}}
function echoTeardown(){if(!E)return;clearEchoTimers();const g=document.getElementById('echo-game');if(g)g.style.display='none';E=null;}
function exitEcho(){echoTeardown();renderFlowMenu();}

// Desktop convenience: number keys tap the corresponding bank chip.
document.addEventListener('keydown',(e)=>{
  if(!E||E.phase!=='echo')return;
  if(e.key==='Escape'){exitEcho();return;}
  const n=parseInt(e.key);
  if(n>=1&&n<=E.bank.length){e.preventDefault();echoTap(E.bank[n-1]);}
});

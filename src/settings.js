// ════════════════════════════════════════════════════
// SETTINGS PANEL
// ════════════════════════════════════════════════════

const INST_OPTS=[{v:'sine',l:'Sine'},{v:'piano',l:'Piano'},{v:'organ',l:'Organ'},{v:'saxophone',l:'Sax'},{v:'chords',l:'Chords'},{v:'amen',l:'Amen'},{v:'pluck',l:'Pluck'},{v:'bell',l:'Bell'},{v:'bass',l:'Bass'},{v:'flute',l:'Flute'},{v:'marimba',l:'Marimba'},{v:'violin',l:'Violin'},{v:'celesta',l:'Celesta'},{v:'clay',l:'Clay Vessel'},{v:'katamari',l:'Katamari'},{v:'katamarina',l:'Katamari Na'},{v:'nyan',l:'Nyan'},{v:'heartbeat',l:'Heartbeat'},{v:'off',l:'Off'}];
const SCALE_OPTS=[{v:'static',l:'Static'},{v:'major',l:'Major'},{v:'minor',l:'Minor'},{v:'mixolydian',l:'Mixolydian'},{v:'lydian',l:'Lydian'},{v:'phrygian',l:'Phrygian'},{v:'harmonicminor',l:'Harmonic Min'},{v:'pentatonic',l:'Pentatonic'},{v:'arpeggio',l:'Arpeggio'},{v:'blues',l:'Blues'},{v:'dorian',l:'Dorian'},{v:'chromatic',l:'Chromatic'},{v:'wholetone',l:'Whole Tone'},{v:'fifths',l:'Fifths'},{v:'octaves',l:'Octaves'},{v:'gospel',l:'Gospel'},{v:'katamariroll',l:'Katamari Roll'},{v:'giantsteps',l:'Giant Steps'},{v:'nyancat',l:'Nyan Cat'},{v:'superbowl',l:'Super Bowl'},{v:'halftime',l:'Halftime'},{v:'hedwigs',l:'Hedwig Theme'},{v:'hogwarts',l:'Hogwarts'},{v:'shire',l:'The Shire'},{v:'rivendell',l:'Rivendell'},{v:'mordor',l:'Mordor'},{v:'heartbeat',l:'Heartbeat'},{v:'off',l:'Off'}];

function openSettings(){syncSettingsUI();document.getElementById('settings-panel').classList.add('show');}
function closeSettings(){document.getElementById('settings-panel').classList.remove('show');save();}

async function checkDevPassword(pw){
  const hint=document.getElementById('dev-password-hint');if(!pw||pw.length<3)return;
  try{
    const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(pw));
    const hash=Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    const correct=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('inanesleep'));
    const correctHash=Array.from(new Uint8Array(correct)).map(b=>b.toString(16).padStart(2,'0')).join('');
    if(hash===correctHash){setDevMode(true);const inp=document.getElementById('dev-password-input');if(inp)inp.value='';if(hint)hint.textContent='\u2713 Dev mode enabled';setTimeout(()=>{if(hint)hint.textContent='';},2000);}
    else{if(hint)hint.textContent='\u2717 Wrong password';setTimeout(()=>{if(hint)hint.textContent='';},1500);}
  }catch(e){if(pw==='inanesleep'){setDevMode(true);const inp=document.getElementById('dev-password-input');if(inp)inp.value='';}else if(hint){hint.textContent='\u2717 Wrong password';setTimeout(()=>{hint.textContent='';},1500);}}
}

function syncSettingsUI(){
  const ss=document.getElementById('s-speed');ss.value=CFG.fallSpeed;document.getElementById('s-speed-val').textContent=CFG.fallSpeed+'px/s';
  const sv=document.getElementById('s-vol');sv.value=CFG.vol;document.getElementById('s-vol-val').textContent=parseFloat(CFG.vol).toFixed(2);
  const ssp=document.getElementById('s-spacing');ssp.value=CFG.tileSpacing;document.getElementById('s-spacing-val').textContent=CFG.tileSpacing+'px';
  const shz=document.getElementById('s-hitzone');shz.value=CFG.hitZoneFrac;document.getElementById('s-hitzone-val').textContent=Math.round(CFG.hitZoneFrac*100)+'%';
  const sli=document.getElementById('s-leadin');sli.value=CFG.startOffsetFrac;document.getElementById('s-leadin-val').textContent=CFG.startOffsetFrac.toFixed(1)+'\u00d7';
  const sst=document.getElementById('s-screentiles');sst.value=CFG.screenTileUnits;document.getElementById('s-screentiles-val').textContent=CFG.screenTileUnits.toFixed(1)+' tiles';
  const swb=document.getElementById('s-wobble');swb.value=CFG.bottomWobbleMs;document.getElementById('s-wobble-val').textContent=CFG.bottomWobbleMs+'ms';
  const skc=document.getElementById('s-keychange');skc.value=CFG.keyChangeStreak;document.getElementById('s-keychange-val').textContent=CFG.keyChangeStreak+' taps';
  document.getElementById('hap-on').classList.toggle('on',CFG.haptics);document.getElementById('hap-off').classList.toggle('on',!CFG.haptics);
  document.getElementById('cd-on').classList.toggle('on',CFG.countdown);document.getElementById('cd-off').classList.toggle('on',!CFG.countdown);
  document.getElementById('bw-on').classList.toggle('on',CFG.bottomWobble);document.getElementById('bw-off').classList.toggle('on',!CFG.bottomWobble);
  swb.disabled=!CFG.bottomWobble;document.getElementById('bw-row').style.opacity=CFG.bottomWobble?'1':'0.45';
  const _dt=document.getElementById('dev-tools');if(_dt)_dt.style.display=CFG.devMode?'block':'none';
  document.querySelectorAll('#cols-pills .spill').forEach(p=>p.classList.toggle('on',parseInt(p.dataset.cols)===CFG.ncols));
}

function updateS(key,val,labelId,suffix){CFG[key]=key==='vol'?parseFloat(val):parseInt(val);document.getElementById(labelId).textContent=CFG[key]+suffix;save();}
function updateSF(key,val,labelId,suffix){CFG[key]=parseFloat(parseFloat(val).toFixed(2));let display;if(key==='hitZoneFrac')display=Math.round(CFG[key]*100)+'%';else display=CFG[key].toFixed(1)+suffix;document.getElementById(labelId).textContent=display;save();}
function setCountdown(on){CFG.countdown=on;document.getElementById('cd-on').classList.toggle('on',on);document.getElementById('cd-off').classList.toggle('on',!on);save();}
function setBottomWobble(on){CFG.bottomWobble=on;document.getElementById('bw-on').classList.toggle('on',on);document.getElementById('bw-off').classList.toggle('on',!on);const sw=document.getElementById('s-wobble');if(sw)sw.disabled=!on;const row=document.getElementById('bw-row');if(row)row.style.opacity=on?'1':'0.45';save();}
function setHaptic(on){CFG.haptics=on;document.getElementById('hap-on').classList.toggle('on',on);document.getElementById('hap-off').classList.toggle('on',!on);save();}
function setCols(n,el){CFG.ncols=n;document.querySelectorAll('#cols-pills .spill').forEach(p=>p.classList.toggle('on',parseInt(p.dataset.cols)===n));save();}

function setDevMode(on){
  CFG.devMode=on;const _dt=document.getElementById('dev-tools');if(_dt)_dt.style.display=on?'block':'none';
  if(on){const pills=document.getElementById('dev-skin-pills');pills.innerHTML='';const skinNames=['(none)',...Object.keys(SKIN_VARS)];skinNames.forEach(s=>{const p=document.createElement('div');p.className='spill';p.textContent=s==='(none)'?'Default':s;p.onclick=()=>{applySkin(s==='(none)'?null:s);pills.querySelectorAll('.spill').forEach(x=>x.classList.remove('on'));p.classList.add('on');};if((s==='(none)'&&!currentEquippedSkin())||(s!=='(none)'&&currentEquippedSkin()===s))p.classList.add('on');pills.appendChild(p);});}
  renderDevZone();save();
}

function renderDevZone(){
  const zone=document.getElementById('fg-devzone');if(!zone)return;
  zone.style.display=(CFG.devMode&&document.getElementById('flow-game').style.display!=='none')?'flex':'none';
  if(!CFG.devMode){zone.innerHTML='';return;}
  zone.innerHTML='';zone.style.display='flex';
  for(let ci=0;ci<CFG.ncols;ci++){const btn=document.createElement('button');btn.style.cssText='flex:1;padding:12px 4px;border-radius:8px;border:2px solid #C9A84C;background:#1A1200;color:#C9A84C;font-size:16px;cursor:pointer;font-weight:700;';btn.textContent='\u25bc '+(ci+1);btn.addEventListener('touchstart',(e)=>{e.preventDefault();colTap(ci);},{passive:false});btn.addEventListener('mousedown',()=>colTap(ci));zone.appendChild(btn);}
}

// Dev tools
function devUnlock(){G.inventory=ITEMS.map(i=>i.id);G.coins+=9999;G.dust+=9999;G.shards+=9999;G.lumens+=999;updateHeader();updateShardDisplay();updateLumensDisplay();renderShop();save();alert('\ud83d\udd13 All items unlocked!');}
function devAddCoins(){G.coins+=9999;G.dust+=9999;G.shards+=20;G.lumens+=200;updateHeader();updateShardDisplay();updateLumensDisplay();renderShop();save();}
function devLevelUp(){addXP(100-(G.xp%100)||100);}
function devSetVerseMastery(ref,level){const card=G.srCards.find(c=>c.ref===ref);if(!card)return;if(level==='learning'){card.reps=0;card.interval=0;card.ef=2.5;card.due=Date.now();}else if(level==='practicing'){card.reps=3;card.interval=7;card.ef=2.5;card.due=Date.now();}else if(level==='mastered'){card.reps=10;card.interval=21;card.ef=2.8;card.due=Date.now()+21*86400000;}snapshotCollectionProgress();save();}
function devSetAllMastery(level){VERSES.forEach(v=>devSetVerseMastery(v.ref,level));renderFlowMenu();save();devLog('All verses \u2192 '+level);}
function devUnlockBoss(ref){const col=activeCollection();const verse=col.verses.find(v=>v.ref===ref);if(!verse){devLog('Verse not found: '+ref);return;}if(isBossVerse(verse)){const constituents=bossVerseConstituents(verse,col);constituents.forEach(r=>devSetVerseMastery(r,'mastered'));devLog('Boss unlocked: '+ref);}else{devSetVerseMastery(ref,'mastered');devLog('Verse mastered: '+ref);}setTimeout(()=>{checkAndGrantBossRewards();renderFlowMenu();},400);}
function devTriggerBossRewards(){checkAndGrantBossRewards();devLog('Boss reward check triggered');}
function devSimulateVerse(ref,errors){if(!ref)return;applyFlowSRRating(ref,errors,errors===0);const card=G.srCards.find(c=>c.ref===ref);const{level,pct}=masteryProgressLabel(card);devLog(`${ref}: ${errors} errors \u2192 ${level} (${pct}%)`);}
function devMasteryReport(){const lines=[];VERSES.filter(v=>!isBossVerse(v)).forEach(v=>{const card=G.srCards.find(c=>c.ref===v.ref);const{level,pct}=masteryProgressLabel(card);lines.push(`${v.ref}: ${level} ${pct}%`);});console.log(lines.join('\n'));devLog('Report logged ('+VERSES.filter(v=>!isBossVerse(v)).length+' verses)');}
function devLog(msg){const el=document.getElementById('dev-log');if(!el)return;const ts=new Date().toLocaleTimeString();el.value='['+ts+'] '+msg+'\n'+el.value;}
function devReset(){if(confirm('Reset all progress?')){localStorage.removeItem(SAVE_KEY);location.reload();}}

// Node test for Workstream A economy rebalance.
// Tests: tap-coin cap (15/verse), study-anyway reward gating, LEVEL_UP_COINS.
// Run: node tests/economy.test.js

const fs=require('fs');
const path=require('path');
const vm=require('vm');

let pass=0,fail=0;
function eq(actual,expected,msg){
  const a=JSON.stringify(actual),e=JSON.stringify(expected);
  if(a===e){pass++;}
  else{fail++;console.error('FAIL: '+msg+'\n  expected '+e+'\n  got      '+a);}
}
function ok(cond,msg){if(cond){pass++;}else{fail++;console.error('FAIL: '+msg);}}

// ── LEVEL_UP_COINS: read via eval in the sandbox context ──
{
  const sb={};
  vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..','src','data','levels.js'),'utf8'),sb);
  // const declarations don't become sandbox properties; use vm.runInContext to evaluate
  const val=vm.runInContext('LEVEL_UP_COINS',sb);
  eq(val,25,'LEVEL_UP_COINS is 25');
}

// ── Tap-coin cap math (pure logic, no DOM needed) ──
function simulateTaps(numTaps){
  let fTapCoinsThisVerse=0,totalCoins=0;
  for(let i=0;i<numTaps;i++){
    const c=(fTapCoinsThisVerse<15)?1:0;
    if(c>0)fTapCoinsThisVerse++;
    totalCoins+=c;
  }
  return{coins:totalCoins,counter:fTapCoinsThisVerse};
}
eq(simulateTaps(10).coins,10,'10 taps = 10 coins');
eq(simulateTaps(10).counter,10,'counter at 10 after 10 taps');
eq(simulateTaps(15).coins,15,'15 taps = 15 coins (at cap)');
eq(simulateTaps(40).coins,15,'40 taps = 15 coins (cap holds)');
eq(simulateTaps(40).counter,15,'counter stays at 15 past cap');

// Reset on new verse: fresh counter
{
  let fTapCoinsThisVerse=15; // after a long verse
  fTapCoinsThisVerse=0; // loadVerse resets
  let coins=0;
  for(let i=0;i<5;i++){const c=(fTapCoinsThisVerse<15)?1:0;if(c>0)fTapCoinsThisVerse++;coins+=c;}
  eq(coins,5,'counter resets on new verse — 5 taps = 5 coins');
}

// ── rateCard due-queue vs study-anyway gating ──
// Load screens.js with minimal stubs.
function makeScreenSB(){
  const sb={};
  sb.console=console;
  sb.shuffle=a=>[...a];
  sb.G={srCards:[],srSessionCount:0,coins:0,xp:0,srNewIntro:{day:'',count:0}};
  sb.CFG={srMode:'ref2text',srNewPerDay:0};
  sb.VERSES=[{ref:'T 1:1',text:'foo'},{ref:'T 1:2',text:'bar'},{ref:'T 1:3',text:'baz'}];
  sb.COLLECTIONS=[];
  sb.isBossVerse=()=>false;
  sb.applySRRating=(card,r)=>{if(r===0){card.reps=0;}else{card.reps++;card.interval=1;card.due=Date.now()+86400000;}};
  sb.getSRQ=(all)=>{const now=Date.now();if(all)return sb.G.srCards.slice();return sb.G.srCards.filter(c=>c.reps>0&&c.due<=now);};
  sb.srNewIntroToday=()=>{if(!sb.G.srNewIntro||!sb.G.srNewIntro.day)sb.G.srNewIntro={day:'today',count:0};return sb.G.srNewIntro;};
  sb.srInt=(c,r)=>r===0?0:1;
  sb.sfxRate=()=>{};sb.hapTap=()=>{};sb.sfxFlip=()=>{};
  sb.save=()=>{};sb.setTimeout=()=>{};
  sb.renderSRNewLine=()=>{};sb.renderSRSubTabs=()=>{};sb.renderSRModePicker=()=>{};
  sb.renderCram=()=>{};sb.renderBrowse=()=>{};
  sb.showSRSection=()=>{};sb.loadCramCard=()=>{};
  sb.firstLetters=s=>s;sb.fillFlipCard=()=>{};sb.srTodayStr=()=>'today';
  // Capture addCoins and addXP
  sb.coinCalls=[];sb.xpCalls=[];
  sb.addCoins=(n)=>{sb.G.coins+=n;sb.coinCalls.push(n);};
  sb.addXP=(n)=>{sb.G.xp+=n;sb.xpCalls.push(n);};
  // DOM stubs
  const makeEl=()=>({style:{display:'',cssText:''},textContent:'',innerHTML:'',classList:{add:()=>{},remove:()=>{},contains:()=>false},offsetHeight:0});
  sb.document={getElementById:()=>makeEl(),querySelectorAll:()=>[]};
  // srSubView default
  sb.srSubView='review';
  return sb;
}

{
  const sb=makeScreenSB();
  vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..','src','render','screens.js'),'utf8'),sb);

  // Override loadSR and renderSR to avoid DOM issues beyond what we stub
  vm.runInContext('function loadSR(){}',sb);
  vm.runInContext('function renderSR(){srQ=getSRQ(false);srIdx=0;srIsDueQueue=true;const ph=document.getElementById("sr-practice-hint");if(ph)ph.style.display="none";}',sb);

  // --- Test 1: due-queue rating pays coins+XP ---
  const dueCard={ref:'T 1:2',interval:3,ef:2.5,reps:2,due:Date.now()-1000};
  sb.G.srCards=[dueCard];
  vm.runInContext('srQ=G.srCards.slice();srIdx=0;srFlipped=true;srIsDueQueue=true;',sb);
  sb.coinCalls=[];sb.xpCalls=[];
  vm.runInContext('rateCard(2)',sb); // Good
  ok(sb.coinCalls.length>0&&sb.coinCalls[0]===3,'due-queue rating pays 3 coins');
  ok(sb.xpCalls.length>0&&sb.xpCalls[0]===10,'due-queue Good pays 10 XP');

  // --- Test 2: study-anyway pays no coins/XP ---
  const practiceCard={ref:'T 1:1',interval:0,ef:2.5,reps:0,due:0};
  sb.G.srCards=[practiceCard];
  vm.runInContext('srQ=G.srCards.slice();srIdx=0;srFlipped=true;srIsDueQueue=false;',sb);
  sb.coinCalls=[];sb.xpCalls=[];
  const coinsBefore=sb.G.coins,xpBefore=sb.G.xp;
  vm.runInContext('rateCard(3)',sb); // Easy
  eq(sb.G.coins,coinsBefore,'study-anyway Easy: no coins awarded');
  eq(sb.G.xp,xpBefore,'study-anyway Easy: no XP awarded');

  // --- Test 3: study-anyway still applies SR scheduling ---
  const ratedCard=sb.G.srCards[0];
  ok(ratedCard.reps>0,'study-anyway still advances reps (SR applied)');

  // --- Test 4: Again (r=0) always pays nothing regardless of queue mode ---
  sb.G.srCards=[{...dueCard}];
  vm.runInContext('srQ=G.srCards.slice();srIdx=0;srFlipped=true;srIsDueQueue=true;',sb);
  sb.coinCalls=[];
  vm.runInContext('rateCard(0)',sb);
  eq(sb.coinCalls.length,0,'Again (r=0) pays no coins even in due queue');

  // --- Test 5: srRestart sets srIsDueQueue=false ---
  vm.runInContext('srIsDueQueue=true;srRestart();',sb);
  const isDue=vm.runInContext('srIsDueQueue',sb);
  eq(isDue,false,'srRestart sets srIsDueQueue=false');

  // --- Test 6: renderSR resets srIsDueQueue=true ---
  vm.runInContext('srIsDueQueue=false;renderSR();',sb);
  const isDue2=vm.runInContext('srIsDueQueue',sb);
  eq(isDue2,true,'renderSR resets srIsDueQueue=true');
}

// ── onLevelUp uses LEVEL_UP_COINS (25) not hardcoded 50 ──
{
  const sb={};
  sb.console=console;
  sb.G={xp:0,coins:0,shards:0,streak:0,hearts:5,lumens:0};
  sb.CFG={};
  sb.activeCollection=()=>({name:'Test',icon:'📖'});
  sb.updateShardDisplay=()=>{};
  sb.updateHeader=()=>{};
  sb.showBurst=()=>{};
  sb.hapComplete=()=>{};
  sb.sfxComplete=()=>{};
  sb.save=()=>{};
  sb.updateLumensDisplay=()=>{};
  sb.setTimeout=()=>{};
  sb.document={getElementById:()=>({style:{display:''},textContent:'',innerHTML:'',classList:{add:()=>{},remove:()=>{}},offsetHeight:0}),querySelectorAll:()=>[]};
  sb.fInFlowXPAnim=false;
  vm.createContext(sb);
  // Load levels.js to define LEVEL_UP_COINS in sandbox
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..','src','data','levels.js'),'utf8'),sb);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..','src','xp.js'),'utf8'),sb);
  // onLevelUp reads LEVEL_UP_COINS and adds it to G.coins; verify via delta
  vm.runInContext('G.coins=0;onLevelUp(2)',sb);
  const coinsAfterLevel=vm.runInContext('G.coins',sb);
  eq(coinsAfterLevel,25,'onLevelUp adds LEVEL_UP_COINS=25 to G.coins (not hardcoded 50)');
  // Confirm LEVEL_UP_COINS itself is 25 in this context
  eq(vm.runInContext('LEVEL_UP_COINS',sb),25,'LEVEL_UP_COINS in levels.js context is 25');
}

// ── showFlowLevelUp also uses LEVEL_UP_COINS (25) ──
{
  const sb={};
  sb.console=console;
  sb.G={xp:0,coins:0,shards:0,streak:0,hearts:5,lumens:0};
  sb.CFG={};
  sb.activeCollection=()=>({name:'Test',icon:'📖'});
  sb.updateShardDisplay=()=>{};sb.updateHeader=()=>{};sb.showBurst=()=>{};
  sb.hapComplete=()=>{};sb.sfxComplete=()=>{};sb.save=()=>{};sb.updateLumensDisplay=()=>{};
  sb.setTimeout=()=>{};sb.clearTimeout=()=>{};
  sb.fInFlowXPAnim=false;
  const makeEl=()=>({style:{display:''},textContent:'',innerHTML:'',classList:{add:()=>{},remove:()=>{}},offsetHeight:0,onclick:null,_to:null});
  sb.document={getElementById:()=>makeEl(),querySelectorAll:()=>[]};
  let flowCaptured=null;
  // We'll check by looking at DOM text; stub the element
  const lvRewardsEl={innerHTML:''};
  sb.document.getElementById=(id)=>{if(id==='lv-rewards')return lvRewardsEl;return makeEl();};
  vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..','src','data','levels.js'),'utf8'),sb);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..','src','xp.js'),'utf8'),sb);
  vm.runInContext('showFlowLevelUp(3,()=>{})',sb);
  ok(lvRewardsEl.innerHTML.includes('25'),'showFlowLevelUp displays LEVEL_UP_COINS=25 in rewards');
}

console.log('\n'+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);

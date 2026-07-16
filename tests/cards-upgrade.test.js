// Node test for the Cards-tab upgrade pure functions.
// Loads src/sr-engine.js into a sandbox with stubbed globals, then asserts the
// behaviors listed in docs/cards-upgrade-spec.md Verification section.
// Run: node tests/cards-upgrade.test.js

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

// ── Sandbox with stubbed globals ──
const sandbox={};
sandbox.console=console;
// Deterministic "shuffle" (identity) so ordering assertions are stable.
sandbox.shuffle=arr=>[...arr];
// Test collection: 5 plain verses + one composite boss verse spanning 2 of them.
const COL={
  id:'test',
  verses:[
    {ref:'John 1:1'},{ref:'John 1:2'},{ref:'John 1:3'},{ref:'John 1:4'},{ref:'John 1:5'},
    {ref:'John 1:1-2'}, // boss verse: constituents John 1:1, John 1:2
  ],
  bossGroups:[[0,1,2],[3,4]],
};
sandbox.COLLECTIONS=[COL];
sandbox.activeCollection=()=>COL;
sandbox.G={srCards:[],srNewIntro:{day:'',count:0}};
sandbox.CFG={srNewPerDay:0,srMode:'ref2text'};
sandbox.VERSES=COL.verses;
// Stubs for engine functions not under test but referenced at parse time.
sandbox.showMasteryLevelUp=()=>{};
sandbox.checkAndGrantBossRewards=()=>{};
sandbox.snapshotCollectionProgress=()=>{};
sandbox.save=()=>{};
sandbox.MASTERY_CFG={};
sandbox.document={getElementById:()=>({})};
vm.createContext(sandbox);

const code=fs.readFileSync(path.join(__dirname,'..','src','sr-engine.js'),'utf8');
vm.runInContext(code,sandbox);
const {firstLetters,applySRRating,buildCramDeck,getSRQ,srInt,verseMastery,getCollectionBossGroups,isBossVerse}=sandbox;

// ── firstLetters ──
eq(firstLetters('For God so loved the world,'),'F G s l t w,','firstLetters John 3:16 opener');
eq(firstLetters('Behold, the Lamb!'),'B, t L!','firstLetters Behold example');
eq(firstLetters(''),'','firstLetters empty');
eq(firstLetters('  spaced   out  '),'s o','firstLetters collapses whitespace');

// ── isBossVerse / boss exclusion sanity ──
ok(isBossVerse({ref:'John 1:1-2'}),'John 1:1-2 detected as boss verse');
ok(!isBossVerse({ref:'John 1:1'}),'John 1:1 not a boss verse');

// ── buildCramDeck ──
eq(buildCramDeck(COL,{type:'all'}).sort(),
   ['John 1:1','John 1:2','John 1:3','John 1:4','John 1:5'],
   'buildCramDeck all excludes boss verse');
eq(buildCramDeck(COL,{type:'refs',refs:['John 1:2','John 1:1-2','John 1:5']}).sort(),
   ['John 1:2','John 1:5'],
   'buildCramDeck refs scope filters + excludes boss verse');

// getCollectionBossGroups returns null when composite boss verses exist, so section
// scope must degrade to empty rather than throw.
eq(buildCramDeck(COL,{type:'section',groupIdx:0}),[],'section scope empty when groups null (composite present)');

// Section scope over a bossGroup-only collection (no composite verses), like The
// Essentials / 2cor4: getCollectionBossGroups returns real groups.
const GCOL={id:'g',verses:[{ref:'A 1:1'},{ref:'A 1:2'},{ref:'A 1:3'},{ref:'A 1:4'},{ref:'A 1:5'}],bossGroups:[[0,1,2],[3,4]]};
eq(buildCramDeck(GCOL,{type:'section',groupIdx:1}).sort(),['A 1:4','A 1:5'],'buildCramDeck section = group refs only');
eq(buildCramDeck(GCOL,{type:'section',groupIdx:0}).sort(),['A 1:1','A 1:2','A 1:3'],'buildCramDeck section groupIdx 0');

// ── applySRRating parity with old inline rateCard math ──
// Replicated old rateCard/applyFlowSRRating arithmetic exactly.
function oldRate(card,r,now){
  const c={...card};
  const ni=srInt(c,r);
  const q=[0,2,3,4][r];
  c.ef=Math.max(1.3,c.ef+(0.1-(4-q)*(0.08+(4-q)*0.02)));
  if(r===0){c.reps=0;c.interval=0;c.due=now+60000;}
  else{c.reps++;c.interval=ni;c.due=now+ni*86400000;}
  return c;
}
const now=1000000000000;
[[{ref:'x',interval:0,ef:2.5,reps:0,due:0},'fresh'],
 [{ref:'y',interval:15,ef:2.3,reps:5,due:0},'mature']].forEach(([base,name])=>{
  for(let r=0;r<=3;r++){
    const a={...base};applySRRating(a,r,now);
    const b=oldRate(base,r,now);
    eq(a,b,`applySRRating parity ${name} r=${r}`);
  }
});

// ── getSRQ new-card capping ──
function makeCards(){
  // 2 due reviews + 5 new (reps 0). srCards order shuffled relative to VERSES.
  return [
    {ref:'John 1:5',interval:0,ef:2.5,reps:0,due:now},
    {ref:'John 1:3',interval:3,ef:2.5,reps:2,due:now-1000}, // review, due
    {ref:'John 1:1',interval:0,ef:2.5,reps:0,due:now},
    {ref:'John 1:4',interval:0,ef:2.5,reps:0,due:now},
    {ref:'John 1:2',interval:6,ef:2.5,reps:3,due:now-2000}, // review, due
    {ref:'John 1:1-2',interval:0,ef:2.5,reps:0,due:now},    // boss verse — always excluded
  ];
}
// Freeze Date.now to `now`.
const realNow=Date.now;Date.now=()=>now;

// srNewPerDay 0 = unlimited: all 3 remaining new cards (John 1:1,1:4,1:5) appear, in verse order.
sandbox.CFG.srNewPerDay=0;
sandbox.G.srCards=makeCards();
sandbox.G.srNewIntro={day:'',count:0};
let q=getSRQ(false);
eq(q.filter(c=>c.reps>0).map(c=>c.ref).sort(),['John 1:2','John 1:3'],'getSRQ includes both due reviews');
eq(q.filter(c=>c.reps===0).map(c=>c.ref),['John 1:1','John 1:4','John 1:5'],'unlimited: new cards in verse order, boss excluded');

// srNewPerDay 2 caps new cards to 2 (first two in verse order).
sandbox.CFG.srNewPerDay=2;
sandbox.G.srCards=makeCards();
sandbox.G.srNewIntro={day:sandbox.srTodayStr(),count:0};
q=getSRQ(false);
eq(q.filter(c=>c.reps===0).map(c=>c.ref),['John 1:1','John 1:4'],'cap 2: first two new by verse order');

// Counter already at limit => no new cards today.
sandbox.G.srNewIntro={day:sandbox.srTodayStr(),count:2};
q=getSRQ(false);
eq(q.filter(c=>c.reps===0).map(c=>c.ref),[],'counter at limit: no new cards surfaced');

// Day rollover resets the counter (stale day => allowance restored).
sandbox.G.srNewIntro={day:'2000-01-01',count:2};
q=getSRQ(false);
eq(q.filter(c=>c.reps===0).map(c=>c.ref),['John 1:1','John 1:4'],'day rollover resets allowance');
eq(sandbox.G.srNewIntro.day,sandbox.srTodayStr(),'srNewIntroToday rolled the day forward');

// getSRQ(true) is uncapped regardless of counter.
sandbox.CFG.srNewPerDay=2;
sandbox.G.srNewIntro={day:sandbox.srTodayStr(),count:2};
q=getSRQ(true);
eq(q.filter(c=>c.reps===0).map(c=>c.ref).sort(),['John 1:1','John 1:4','John 1:5'],'getSRQ(true) uncapped');

Date.now=realNow;

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);

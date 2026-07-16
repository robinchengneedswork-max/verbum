// Node test for Workstream C audio melody infrastructure.
// Tests: noteToFreq, mel(), key-shift deferral, every scale-type item's val in SCALES.
// Run: node tests/audio-melody.test.js

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
function near(actual,expected,msg,tol){
  tol=tol||0.5;
  if(typeof actual==='number'&&Math.abs(actual-expected)<=tol){pass++;}
  else{fail++;console.error('FAIL: '+msg+'\n  expected ~'+expected+' got '+actual);}
}

// ── Sandbox: stub browser globals needed by audio.js ──
const sb={};
sb.console=console;
sb.CFG={vol:1,instrument:'piano',scale:'major',keyChangeStreak:6};
sb.G={};
// fStreak and sfxNoteIdx must be var (not let/const) to be writable from sandbox
// We inject them as var by putting them in the global context preamble
sb.window=undefined; // let audio.js fail gracefully on AC creation
sb.document={
  addEventListener:()=>{},
  createElement:()=>({style:{},offsetHeight:0,appendChild:()=>{},addEventListener:()=>{},setAttribute:()=>{},htmlFor:'',id:''}),
  body:{appendChild:()=>{},classList:{add:()=>{},remove:()=>{}}},
};
sb.navigator={};
sb.requestAnimationFrame=()=>{};
// Stub AudioContext to not throw (returns null-like object)
sb.window={AudioContext:function(){throw new Error('no AC in test');},webkitAudioContext:function(){throw new Error('no AC in test');}};

vm.createContext(sb);

// Inject fStreak as a var before audio.js runs (it references fStreak but doesn't declare it)
vm.runInContext('var fStreak=0;',sb);
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','src','audio.js'),'utf8'),sb);

// Helper to get/set let-declared vars in the sandbox via vm.runInContext
function sbGet(name){return vm.runInContext(name,sb);}
function sbSet(name,val){vm.runInContext(name+'=('+JSON.stringify(val)+')',sb);}

const noteToFreq=sbGet('noteToFreq');
const mel=sbGet('mel');
const SCALES=sbGet('SCALES');

// ── noteToFreq spot checks ──
near(noteToFreq('C4'),261.63,'noteToFreq C4',0.5);
near(noteToFreq('A4'),440.0,'noteToFreq A4',0.01);
near(noteToFreq('F#4'),369.99,'noteToFreq F#4',0.5);
near(noteToFreq('Gb4'),369.99,'noteToFreq Gb4 = F#4',0.5);
near(noteToFreq('C5'),noteToFreq('C4')*2,'noteToFreq C5 = 2×C4',0.5);
near(noteToFreq('A5'),880,'noteToFreq A5',0.5);
near(noteToFreq('C3'),noteToFreq('C4')/2,'noteToFreq C3 = C4/2',0.5);

// ── mel() parsing ──
const testMel=mel('C4 E4:2 G4:0.5 C5');
ok(testMel.isMelody===true,'mel() sets isMelody=true');
eq(testMel.len,4,'mel() len = 4 tokens');
near(testMel(0),noteToFreq('C4'),'mel(0) = C4',0.5);
near(testMel(1),noteToFreq('E4'),'mel(1) = E4',0.5);
near(testMel(2),noteToFreq('G4'),'mel(2) = G4',0.5);
near(testMel(3),noteToFreq('C5'),'mel(3) = C5',0.5);
eq(testMel.beats(0),1,'beats(0) default 1');
eq(testMel.beats(1),2,'beats(1) = :2');
eq(testMel.beats(2),0.5,'beats(2) = :0.5');
eq(testMel.beats(3),1,'beats(3) default 1');
near(testMel(4),testMel(0),'mel(4) wraps = mel(0)',0.01);
near(testMel(7),testMel(3),'mel(7) wraps = mel(3)',0.01);
near(testMel(-1),testMel(3),'mel(-1) wraps = mel(3)',0.01);

// ── Key-shift deferral for melodies ──
// resolveKeyShift uses let _pendingKeyShift and let sfxKeyShift inside the module.
// We exercise it through sbGet/sbSet via vm.runInContext.
{
  const m4=mel('C4 D4 E4 F4'); // len=4

  // At boundary idx 0, no pending → shift stays 0
  sbSet('sfxKeyShift',0);sbSet('_pendingKeyShift',null);
  const s0=vm.runInContext('resolveKeyShift(0,'+JSON.stringify(null)+')',sb);
  // pass a melody with len 4 — since JSON can't carry the function, call it differently
  // Inject the melody as a global in sandbox, then call resolveKeyShift
  sb._testMel4=m4;
  const s0b=vm.runInContext('sfxKeyShift=0;_pendingKeyShift=null;resolveKeyShift(0,_testMel4)',sb);
  eq(s0b,0,'no pending at boundary: shift stays 0');

  // Stage pending shift, mid-phrase: should NOT apply
  vm.runInContext('sfxKeyShift=0;_pendingKeyShift=2;',sb);
  const s1=vm.runInContext('resolveKeyShift(1,_testMel4)',sb);
  eq(s1,0,'pending not applied mid-phrase at idx 1');
  eq(vm.runInContext('_pendingKeyShift',sb),2,'_pendingKeyShift still 2 after non-boundary call');

  // At idx 4 (boundary: 4%4===0): should apply shift
  vm.runInContext('sfxKeyShift=0;_pendingKeyShift=2;',sb);
  const s4=vm.runInContext('resolveKeyShift(4,_testMel4)',sb);
  eq(s4,2,'pending applied at loop boundary idx 4');
  eq(vm.runInContext('_pendingKeyShift',sb),null,'_pendingKeyShift cleared after application');

  // Non-melody scale (no .isMelody): resolveKeyShift clears pending and returns sfxKeyShift
  sb._testNonMel=(i)=>440;sb._testNonMel.isMelody=false;
  vm.runInContext('sfxKeyShift=1;_pendingKeyShift=3;',sb);
  const sNM=vm.runInContext('resolveKeyShift(2,_testNonMel)',sb);
  eq(sNM,1,'non-melody: returns current sfxKeyShift');
  eq(vm.runInContext('_pendingKeyShift',sb),null,'non-melody: clears _pendingKeyShift');
}

// ── Every type:'scale' ITEMS entry has a matching key in SCALES ──
{
  const sbP={};
  sbP.console=console;
  vm.createContext(sbP);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..','src','data','packs.js'),'utf8'),sbP);
  const ITEMS=vm.runInContext('ITEMS',sbP);
  const scaleItems=ITEMS.filter(it=>it.type==='scale');
  ok(scaleItems.length>0,'at least one scale item exists');
  scaleItems.forEach(it=>{
    ok(it.val in SCALES,'scale item "'+it.id+'" val "'+it.val+'" exists in SCALES');
  });
}

// ── Anchor melody spot checks ──
near(SCALES.odejoy(0),noteToFreq('E4'),'Ode to Joy [0]=E4',0.5);
near(SCALES.odejoy(1),noteToFreq('E4'),'Ode to Joy [1]=E4',0.5);
near(SCALES.odejoy(2),noteToFreq('F4'),'Ode to Joy [2]=F4',0.5);
near(SCALES.odejoy(3),noteToFreq('G4'),'Ode to Joy [3]=G4',0.5);
near(SCALES.amazinggrace(0),noteToFreq('G3'),'Amazing Grace [0]=G3',0.5);
ok(SCALES.heartbeat&&SCALES.heartbeat.isMelody,'heartbeat is a mel() melody');
ok(SCALES.odejoy.isMelody,'odejoy is a mel() melody');
ok(SCALES.amazinggrace.isMelody,'amazinggrace is a mel() melody');

// ── sfxComplete doesn't throw (no AC is fine via safePatch) ──
try{
  vm.runInContext('sfxNoteIdx=5;sfxKeyShift=0;CFG.instrument="piano";CFG.scale="odejoy";sfxComplete();',sb);
  pass++;
}catch(e){fail++;console.error('FAIL: sfxComplete threw with melody scale: '+e.message);}

// ── sfxComplete with non-melody scale doesn't throw ──
try{
  vm.runInContext('sfxNoteIdx=3;sfxKeyShift=0;CFG.instrument="piano";CFG.scale="major";sfxComplete();',sb);
  pass++;
}catch(e){fail++;console.error('FAIL: sfxComplete threw with major scale: '+e.message);}

// ── Heartbeat mel() structure: beats vary (lub-dub rhythm has :0.5 and :1.5) ──
const hb=SCALES.heartbeat;
ok(hb.isMelody,'heartbeat.isMelody');
ok(hb.len>=8,'heartbeat has at least 8 notes');
// Check that some beats differ from 1 (it's a dotted pattern)
let hasShortBeat=false,hasLongBeat=false;
for(let i=0;i<hb.len;i++){if(hb.beats(i)<1)hasShortBeat=true;if(hb.beats(i)>1)hasLongBeat=true;}
ok(hasShortBeat,'heartbeat has short beats (<1)');
ok(hasLongBeat,'heartbeat has long beats (>1)');

console.log('\n'+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);

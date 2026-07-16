// Node test for Echo (call-and-response) mode.
// Tests the pure structure math: phrase chunking covers every word exactly once
// in order, checkpoint segments respect the word cap (and never drop a phrase),
// and the Simon cumulative sequence within a segment is a growing superset that
// ends at the segment's full word set.
// Run: node tests/echo.test.js

const fs=require('fs');
const path=require('path');
const vm=require('vm');

let pass=0,fail=0;
function eq(actual,expected,msg){
  const a=JSON.stringify(actual),e=JSON.stringify(expected);
  if(a===e){pass++;}else{fail++;console.error('FAIL: '+msg+'\n  expected '+e+'\n  got      '+a);}
}
function ok(cond,msg){if(cond){pass++;}else{fail++;console.error('FAIL: '+msg);}}

// Load echo.js into a sandbox with just the globals its top level touches.
const sb={CFG:{echoChunkSize:4,echoMaxChainWords:8,echoTempoMs:380},
  SCALES:{major:i=>440},INST:{sine:()=>{}},
  shuffle:a=>[...a],
  document:{getElementById:()=>null,addEventListener:()=>{},createTextNode:()=>({})}};
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','src','echo.js'),'utf8'),sb);
const echoBuildPhrases=vm.runInContext('echoBuildPhrases',sb);
const echoBuildSegments=vm.runInContext('echoBuildSegments',sb);

const samples=[
  'For God so loved the world that he gave his only Son'.split(' '),   // 12
  'Jesus wept'.split(' '),                                             // 2
  'In the beginning was the Word and the Word was with God'.split(' '),// 12
  'I am the way and the truth and the life'.split(' '),                // 10
  'Rejoice'.split(' '),                                                // 1
];

const cap=sb.CFG.echoMaxChainWords, size=sb.CFG.echoChunkSize;

for(const words of samples){
  const n=words.length;
  const phrases=echoBuildPhrases(words);

  // phrases cover 0..n-1 exactly once, in order, each ≤ chunk size
  const flat=[].concat(...phrases);
  eq(flat,words.map((_,i)=>i),'phrases cover every word in order (n='+n+')');
  ok(phrases.every(p=>p.length>=1&&p.length<=size),'each phrase within chunk size (n='+n+')');

  const segs=echoBuildSegments(phrases);

  // segments partition the phrase list in order
  eq([].concat(...segs.map(s=>[].concat(...s))),words.map((_,i)=>i),
     'segments partition all words in order (n='+n+')');

  // each segment respects the cap, unless it is a single over-cap phrase
  segs.forEach(seg=>{
    const w=seg.reduce((a,p)=>a+p.length,0);
    ok(w<=cap||seg.length===1,'segment within word cap or single phrase (n='+n+', w='+w+')');
  });

  // Simon cumulative rounds within each segment: strict growing superset ending
  // at the segment's full word set
  segs.forEach(seg=>{
    const full=[].concat(...seg);
    let prev=[];
    for(let r=0;r<seg.length;r++){
      const seq=[].concat(...seg.slice(0,r+1));
      for(const x of prev)ok(seq.includes(x),'round is a superset of the previous (n='+n+')');
      ok(seq.length>prev.length,'round grows the chain (n='+n+')');
      prev=seq;
    }
    eq(prev,full,'final round covers the whole segment (n='+n+')');
  });
}

// explicit shape checks with defaults (chunk 4, cap 8)
eq(echoBuildPhrases([0,1,2,3,4,5,6,7,8,9,10,11].map(String)).map(p=>p.length),[4,4,4],
   '12 words → three 4-word phrases');
{
  const segs=echoBuildSegments(echoBuildPhrases(new Array(12).fill('x')));
  eq(segs.map(s=>s.reduce((a,p)=>a+p.length,0)),[8,4],'12 words → segments of 8 then 4');
}
{
  const segs=echoBuildSegments(echoBuildPhrases(new Array(2).fill('x')));
  eq(segs.length,1,'2-word verse → single segment');
  eq(segs[0].length,1,'single segment has one phrase');
}

console.log('\n'+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);

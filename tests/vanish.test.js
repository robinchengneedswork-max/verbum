// Node test for Vanishing Verse ("fade drill") lesson mode.
// Tests the pure core: removal order is a full permutation, round counts are
// strictly increasing / clamp for short verses / end at 100%, and every round's
// blanked set is a growing SUPERSET of the previous one.
// Run: node tests/vanish.test.js

const fs=require('fs');
const path=require('path');
const vm=require('vm');

let pass=0,fail=0;
function eq(actual,expected,msg){
  const a=JSON.stringify(actual),e=JSON.stringify(expected);
  if(a===e){pass++;}else{fail++;console.error('FAIL: '+msg+'\n  expected '+e+'\n  got      '+a);}
}
function ok(cond,msg){if(cond){pass++;}else{fail++;console.error('FAIL: '+msg);}}

// Load vanish.js into a sandbox with just the globals its pure helpers touch.
const sb={CFG:{vvInput:'fill',vvRounds:4,vvSchedule:[0.25,0.5,0.75,1]},
  shuffle:a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;},
  document:{getElementById:()=>null}};
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','src','render','vanish.js'),'utf8'),sb);
const vvBuildOrder=vm.runInContext('vvBuildOrder',sb);
const vvBuildRounds=vm.runInContext('vvBuildRounds',sb);

const samples=[
  'For God so loved the world that he gave his only Son'.split(' '),
  'Jesus wept'.split(' '),
  'I am the way'.split(' '),
  'In the beginning was the Word and the Word was with God'.split(' '),
  'Rejoice'.split(' '),
];

for(const words of samples){
  const n=words.length;
  const rounds=vvBuildRounds(n);
  for(let i=1;i<rounds.length;i++)ok(rounds[i]>rounds[i-1],'rounds strictly increasing (n='+n+') '+rounds);
  eq(rounds[rounds.length-1],n,'final round blanks all '+n+' words');
  ok(rounds.every(c=>c>=1&&c<=n),'round counts within [1,n] (n='+n+')');

  // superset + permutation across many random removal orders
  for(let t=0;t<100;t++){
    const order=vvBuildOrder(words);
    ok(order.length===n&&new Set(order).size===n,'removal order is a full permutation (n='+n+')');
    let prev=new Set();
    for(const c of rounds){
      const s=new Set(order.slice(0,c));
      for(const x of prev)ok(s.has(x),'round is a superset of the previous (n='+n+')');
      prev=s;
    }
    ok(prev.size===n,'final round hides the whole verse (n='+n+')');
  }
}

// short-verse clamp: 2-word verse collapses to 2 rounds, 1-word to 1
eq(vvBuildRounds(2),[1,2],'2-word verse clamps to [1,2]');
eq(vvBuildRounds(1),[1],'1-word verse clamps to [1]');
eq(vvBuildRounds(4),[1,2,3,4],'4-word verse gives 4 rounds');

console.log('\n'+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);

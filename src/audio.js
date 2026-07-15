// ════════════════════════════════════════════════════
// AUDIO ENGINE
// ════════════════════════════════════════════════════

let AC=null,AUDIO=null;
try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}
const resumeAC=()=>{try{if(AC&&AC.state==='suspended')AC.resume();ensureAudio();}catch(e){}};

function _unlockAudio(){
  resumeAC();
  document.removeEventListener('touchstart',_unlockAudio,true);
  document.removeEventListener('mousedown',_unlockAudio,true);
}
document.addEventListener('touchstart',_unlockAudio,{capture:true,passive:true});
document.addEventListener('mousedown',_unlockAudio,{capture:true,passive:true});

function ensureAudio(){
  if(!AC)return false;
  if(AUDIO)return true;
  try{
    const dry=AC.createGain(),wet=AC.createGain(),comp=AC.createDynamicsCompressor(),master=AC.createGain(),verb=AC.createConvolver();
    dry.gain.value=1;wet.gain.value=1;
    comp.threshold.value=-18;comp.knee.value=18;comp.ratio.value=3;comp.attack.value=0.003;comp.release.value=0.22;
    master.gain.value=1.14;
    verb.buffer=createImpulseBuffer(2.1,2.4);
    dry.connect(comp);wet.connect(verb);verb.connect(comp);comp.connect(master);master.connect(AC.destination);
    AUDIO={dry,wet,comp,master,verb,noise:createNoiseBuffer(1.2)};
    return true;
  }catch(e){AUDIO=false;return false;}
}

function createNoiseBuffer(seconds){
  const len=Math.max(1,Math.floor(AC.sampleRate*seconds));
  const buf=AC.createBuffer(1,len,AC.sampleRate);
  const d=buf.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  return buf;
}

function createImpulseBuffer(seconds,decay){
  const len=Math.max(1,Math.floor(AC.sampleRate*seconds));
  const buf=AC.createBuffer(2,len,AC.sampleRate);
  for(let ch=0;ch<2;ch++){
    const d=buf.getChannelData(ch);
    for(let i=0;i<len;i++){const n=1-i/len;d[i]=(Math.random()*2-1)*Math.pow(n,decay)*(0.75+Math.random()*0.25);}
  }
  return buf;
}

function randPan(width){return (Math.random()*2-1)*(width==null?0.14:width);}

function makeBus(wetAmt,pan){
  if(!ensureAudio()){const g=AC.createGain();g.connect(AC.destination);return g;}
  const input=AC.createGain();let node=input;
  if(AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=pan||0;input.connect(p);node=p;}
  const drySend=AC.createGain(),wetSend=AC.createGain();
  drySend.gain.value=1;wetSend.gain.value=Math.max(0,wetAmt||0);
  node.connect(drySend);node.connect(wetSend);drySend.connect(AUDIO.dry);wetSend.connect(AUDIO.wet);
  return input;
}

function applyADSR(param,t,peak,a,d,s,r,hold){
  const attack=Math.max(0.001,a||0.005),decay=Math.max(0.005,d||0.08),release=Math.max(0.02,r||0.12),stay=Math.max(0,hold||0);
  const pk=Math.max(0.0001,peak||0.001),sus=Math.max(0.0001,pk*Math.max(0.02,s==null?0.3:s));
  param.cancelScheduledValues(t);param.setValueAtTime(0.0001,t);
  param.linearRampToValueAtTime(pk,t+attack);
  param.exponentialRampToValueAtTime(sus,t+attack+decay);
  param.setValueAtTime(sus,t+attack+decay+stay);
  param.exponentialRampToValueAtTime(0.0001,t+attack+decay+stay+release);
  return t+attack+decay+stay+release;
}

function sweepFilter(filter,t,base,peak,attack,decay,hold){
  if(!filter)return;
  const atk=Math.max(0.001,attack||0.01),dec=Math.max(0.02,decay||0.12),stay=Math.max(0,hold||0),b=Math.max(30,base||800),p=Math.max(b+1,peak||b*2);
  filter.frequency.cancelScheduledValues(t);filter.frequency.setValueAtTime(b,t);
  filter.frequency.linearRampToValueAtTime(p,t+atk);
  filter.frequency.exponentialRampToValueAtTime(b,t+atk+dec+stay);
}

function spawnOsc(parent,cfg){
  const t=cfg.t||AC.currentTime,end=cfg.end||t+0.35;
  const osc=AC.createOscillator(),g=AC.createGain();
  const freq=Math.max(30,cfg.freq||440);
  osc.type=cfg.type||'sine';
  if(cfg.pitchDrop&&cfg.pitchDrop.from){osc.frequency.setValueAtTime(freq*cfg.pitchDrop.from,t);osc.frequency.exponentialRampToValueAtTime(freq,t+Math.max(0.005,cfg.pitchDrop.time||0.03));}
  else osc.frequency.setValueAtTime(freq,t);
  if(cfg.detune)osc.detune.value=cfg.detune;
  g.gain.value=cfg.gain==null?1:cfg.gain;
  osc.connect(g);g.connect(parent);
  if(cfg.lfo){
    const lfo=AC.createOscillator(),lg=AC.createGain();
    lfo.type='sine';lfo.frequency.value=cfg.lfo.rate||5;
    lg.gain.setValueAtTime(0,t);
    if(cfg.lfo.delay){lg.gain.setValueAtTime(0,t+cfg.lfo.delay);lg.gain.linearRampToValueAtTime(cfg.lfo.depth||8,t+cfg.lfo.delay+0.08);}
    else lg.gain.setValueAtTime(cfg.lfo.depth||8,t);
    lfo.connect(lg);lg.connect(osc.detune);lfo.start(t);lfo.stop(end);
  }
  osc.start(t);osc.stop(end);return osc;
}

function spawnNoise(parent,cfg){
  if(!ensureAudio())return;
  const t=cfg.t||AC.currentTime,d=Math.max(0.01,cfg.d||0.08);
  const src=AC.createBufferSource();src.buffer=AUDIO.noise;let node=src;
  if(cfg.bp){const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=cfg.bp;f.Q.value=cfg.q||0.8;node.connect(f);node=f;}
  if(cfg.hp){const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=cfg.hp;node.connect(f);node=f;}
  if(cfg.lp){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=cfg.lp;node.connect(f);node=f;}
  const g=AC.createGain();const peak=Math.max(0.0001,cfg.vol||0.05);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(peak,t+Math.min(0.006,d*0.2));
  g.gain.exponentialRampToValueAtTime(0.0001,t+d);
  node.connect(g);g.connect(parent);src.start(t);src.stop(t+d+0.02);
}

function legacyTone(freq,type,dur,vol,delay,detune){
  if(!AC)return;
  try{
    const o=AC.createOscillator(),g=AC.createGain();o.connect(g);g.connect(AC.destination);
    o.type=type||'sine';if(detune)o.detune.value=detune;
    const t=AC.currentTime+(delay||0),v=Math.max(0.0001,(vol||0.15)*CFG.vol),hold=Math.max(0.03,dur||0.08);
    o.frequency.setValueAtTime(Math.max(30,freq||440),t);g.gain.setValueAtTime(v,t);
    g.gain.exponentialRampToValueAtTime(0.001,t+hold);o.start(t);o.stop(t+hold+0.03);
  }catch(e){}
}

function tone(freq,type,dur,vol,delay,detune){
  if(!AC)return;
  if(!ensureAudio()){legacyTone(freq,type,dur,vol,delay,detune);return;}
  try{
    const t=AC.currentTime+(delay||0),hold=Math.max(0.01,dur||0.08),end=t+hold+0.18;
    const out=makeBus(0.06,0),sum=AC.createGain(),lp=AC.createBiquadFilter(),amp=AC.createGain();
    lp.type='lowpass';lp.frequency.value=Math.max(700,Math.min(5200,(freq||440)*8));lp.Q.value=0.8;
    sum.connect(lp);lp.connect(amp);amp.connect(out);
    applyADSR(amp.gain,t,(vol||0.14)*0.82*CFG.vol,0.003,Math.max(0.03,hold*0.45),0.18,0.12,0.01);
    spawnOsc(sum,{type:type||'sine',freq:freq||440,detune:detune||0,gain:0.92,t,end,pitchDrop:type==='sawtooth'?{from:1.03,time:0.02}:null});
    if(type!=='sine')spawnOsc(sum,{type:'sine',freq:(freq||440)*2,gain:0.12,t,end});
  }catch(e){legacyTone(freq,type,dur,vol,delay,detune);}
}

function noise(dur,vol,delay){
  if(!ensureAudio())return;
  const out=makeBus(0.02,0);
  spawnNoise(out,{t:AC.currentTime+(delay||0),d:dur||0.05,vol:(vol||0.12)*CFG.vol,hp:2000});
}

function drumKick(t,amp,out){
  const sum=AC.createGain(),lp=AC.createBiquadFilter(),g=AC.createGain();
  lp.type='lowpass';lp.frequency.value=190;sum.connect(lp);lp.connect(g);g.connect(out);
  g.gain.setValueAtTime(Math.max(0.0001,amp*CFG.vol),t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.18);
  spawnOsc(sum,{type:'sine',freq:46,gain:1,t,end:t+0.2,pitchDrop:{from:3.4,time:0.11}});
  spawnOsc(sum,{type:'triangle',freq:92,gain:0.12,t,end:t+0.12});
}

function drumSnare(t,amp,out){
  const sum=AC.createGain(),bp=AC.createBiquadFilter(),g=AC.createGain();
  bp.type='bandpass';bp.frequency.value=1800;bp.Q.value=0.9;sum.connect(bp);bp.connect(g);g.connect(out);
  g.gain.setValueAtTime(Math.max(0.0001,amp*CFG.vol),t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.13);
  spawnNoise(sum,{t,d:0.12,vol:0.8,hp:1200,lp:7000});
  spawnOsc(sum,{type:'triangle',freq:190,gain:0.12,t,end:t+0.1,pitchDrop:{from:1.35,time:0.045}});
}

function drumHat(t,amp,out){spawnNoise(out,{t,d:0.045,vol:Math.max(0.0001,amp*CFG.vol),hp:5000,lp:11000});}

// ── Instrument patch functions ──
function patchSine(f,d,v,dl){if(!ensureAudio())return;const t=AC.currentTime+(dl||0),hold=Math.max(0.015,d*0.15),rel=Math.max(0.18,d*1.4),end=t+hold+rel+0.18;const out=makeBus(0.22,randPan(0.12)),sum=AC.createGain(),bp=AC.createBiquadFilter(),amp=AC.createGain();bp.type='bandpass';bp.frequency.value=Math.min(3200,Math.max(500,f*3));bp.Q.value=0.65;sum.connect(bp);bp.connect(amp);amp.connect(out);applyADSR(amp.gain,t,v*0.78*CFG.vol,0.004,0.09,0.22,rel,hold);spawnOsc(sum,{type:'sine',freq:f,gain:0.9,t,end,pitchDrop:{from:1.01,time:0.02}});spawnOsc(sum,{type:'sine',freq:f*2,gain:0.16,t,end});spawnOsc(sum,{type:'triangle',freq:f*3,gain:0.05,t,end});}
function patchPiano(f,d,v,dl){if(!ensureAudio())return;const t=AC.currentTime+(dl||0),hold=Math.max(0.02,d*0.2),rel=Math.max(0.16,d*1.3),end=t+hold+rel+0.22;const out=makeBus(0.18,randPan(0.16)),sum=AC.createGain(),lp=AC.createBiquadFilter(),amp=AC.createGain();lp.type='lowpass';lp.frequency.value=1700;lp.Q.value=1.2;sum.connect(lp);lp.connect(amp);amp.connect(out);applyADSR(amp.gain,t,v*0.74*CFG.vol,0.002,0.11,0.18,rel,hold);sweepFilter(lp,t,1500,3400,0.004,0.22,hold);spawnOsc(sum,{type:'triangle',freq:f,gain:0.9,t,end,detune:-3,pitchDrop:{from:1.014,time:0.018}});spawnOsc(sum,{type:'triangle',freq:f,gain:0.42,t,end,detune:4});spawnOsc(sum,{type:'sine',freq:f*2,gain:0.16,t,end});spawnOsc(sum,{type:'sine',freq:f*3,gain:0.05,t,end});spawnNoise(sum,{t,d:0.02,vol:0.12,hp:1800,lp:7200});}
function patchOrgan(f,d,v,dl){if(!ensureAudio())return;const t=AC.currentTime+(dl||0),hold=Math.max(0.04,d*0.7),rel=Math.max(0.18,d*1.1),end=t+hold+rel+0.16;const out=makeBus(0.12,randPan(0.08)),sum=AC.createGain(),lp=AC.createBiquadFilter(),hp=AC.createBiquadFilter(),amp=AC.createGain();lp.type='lowpass';lp.frequency.value=2600;lp.Q.value=0.5;hp.type='highpass';hp.frequency.value=110;sum.connect(lp);lp.connect(hp);hp.connect(amp);amp.connect(out);applyADSR(amp.gain,t,v*0.7*CFG.vol,0.006,0.08,0.72,rel,hold);[[1,0.86,0],[2,0.32,2],[3,0.18,-2],[4,0.12,5],[6,0.07,-4]].forEach(([mul,gain,det])=>{spawnOsc(sum,{type:'sine',freq:f*mul,gain,t,end,detune:det,lfo:{rate:5.2,depth:mul===1?8:5,delay:0.05}});});}
function patchSax(f,d,v,dl){if(!ensureAudio())return;const t=AC.currentTime+(dl||0),hold=Math.max(0.03,d*0.45),rel=Math.max(0.16,d*1.15),end=t+hold+rel+0.2;const out=makeBus(0.14,randPan(0.12)),sum=AC.createGain(),bp=AC.createBiquadFilter(),lp=AC.createBiquadFilter(),amp=AC.createGain();bp.type='bandpass';bp.frequency.value=1200;bp.Q.value=0.8;lp.type='lowpass';lp.frequency.value=1500;lp.Q.value=1.4;sum.connect(bp);bp.connect(lp);lp.connect(amp);amp.connect(out);applyADSR(amp.gain,t,v*0.72*CFG.vol,0.012,0.12,0.48,rel,hold);sweepFilter(lp,t,1300,2600,0.03,0.18,hold);spawnOsc(sum,{type:'sawtooth',freq:f,gain:0.56,t,end,detune:-4,lfo:{rate:5.1,depth:12,delay:0.05},pitchDrop:{from:1.02,time:0.03}});spawnOsc(sum,{type:'triangle',freq:f,gain:0.4,t,end,detune:3,lfo:{rate:5.3,depth:8,delay:0.05}});spawnOsc(sum,{type:'sine',freq:f*2,gain:0.1,t,end});spawnNoise(sum,{t,d:hold+rel+0.12,vol:0.02,bp:1400,q:0.6});}
function patchChords(f,d,v,dl){if(!ensureAudio())return;const t=AC.currentTime+(dl||0),hold=Math.max(0.06,d*0.5),rel=Math.max(0.22,d*1.5),end=t+hold+rel+0.24;const out=makeBus(0.24,0),sum=AC.createGain(),lp=AC.createBiquadFilter(),amp=AC.createGain();lp.type='lowpass';lp.frequency.value=900;lp.Q.value=0.9;sum.connect(lp);lp.connect(amp);amp.connect(out);applyADSR(amp.gain,t,v*0.58*CFG.vol,0.01,0.18,0.42,rel,hold);sweepFilter(lp,t,900,2200,0.04,0.28,hold);[1,5/4,3/2,2].forEach((mul,idx)=>{const nt=f*mul,start=t+idx*0.004;spawnOsc(sum,{type:'sawtooth',freq:nt,gain:0.16,t:start,end,detune:idx%2?-4:4});spawnOsc(sum,{type:'triangle',freq:nt,gain:0.12,t:start,end});});}
function patchAmen(f,d,v,dl){if(!ensureAudio())return;const t=AC.currentTime+(dl||0),out=makeBus(0.05,randPan(0.03));drumKick(t,v*0.72,out);drumHat(t+0.055,v*0.24,out);drumSnare(t+0.11,v*0.4,out);drumHat(t+0.165,v*0.2,out);const sum=AC.createGain(),lp=AC.createBiquadFilter(),amp=AC.createGain();lp.type='lowpass';lp.frequency.value=900;lp.Q.value=1.1;sum.connect(lp);lp.connect(amp);amp.connect(out);applyADSR(amp.gain,t,v*0.5*CFG.vol,0.004,0.08,0.18,0.16,0.02);spawnOsc(sum,{type:'sawtooth',freq:Math.max(55,f*0.5),gain:0.34,t,end:t+0.26,pitchDrop:{from:1.05,time:0.02}});spawnOsc(sum,{type:'triangle',freq:f,gain:0.18,t,end:t+0.2});}
function patchPluck(f,d,v,dl){if(!ensureAudio())return;const t=AC.currentTime+(dl||0),hold=Math.max(0.01,d*0.1),rel=Math.max(0.16,d*1.1),end=t+hold+rel+0.18;const out=makeBus(0.16,randPan(0.14)),src=AC.createGain(),lp=AC.createBiquadFilter(),delay=AC.createDelay(0.05),fb=AC.createGain(),amp=AC.createGain();lp.type='lowpass';lp.frequency.value=Math.min(5200,Math.max(1400,f*10));lp.Q.value=0.9;delay.delayTime.value=Math.max(0.0025,Math.min(0.018,1/Math.max(80,f)));fb.gain.value=0.28;src.connect(lp);lp.connect(delay);delay.connect(fb);fb.connect(delay);lp.connect(amp);delay.connect(amp);amp.connect(out);applyADSR(amp.gain,t,v*0.68*CFG.vol,0.002,0.07,0.12,rel,hold);spawnNoise(src,{t,d:0.012,vol:0.42,hp:500,lp:6500});spawnOsc(src,{type:'triangle',freq:f,gain:0.3,t,end:t+0.36,detune:-2,pitchDrop:{from:1.03,time:0.02}});spawnOsc(src,{type:'sawtooth',freq:f*2,gain:0.07,t,end:t+0.22});}
function patchBell(f,d,v,dl){if(!ensureAudio())return;const t=AC.currentTime+(dl||0),hold=Math.max(0.02,d*0.2),rel=Math.max(0.55,d*2.1),end=t+hold+rel+0.24;const out=makeBus(0.34,randPan(0.18)),sum=AC.createGain(),bp=AC.createBiquadFilter(),amp=AC.createGain();bp.type='bandpass';bp.frequency.value=Math.min(6000,Math.max(700,f*2.7));bp.Q.value=0.85;sum.connect(bp);bp.connect(amp);amp.connect(out);applyADSR(amp.gain,t,v*0.72*CFG.vol,0.002,0.14,0.2,rel,hold);[[1,0.95],[2.756,0.42],[5.404,0.18],[8.933,0.08]].forEach(([mul,gain],idx)=>{spawnOsc(sum,{type:'sine',freq:f*mul,gain,t:t+idx*0.002,end});});}
function patchBass(f,d,v,dl){if(!ensureAudio())return;const low=Math.max(40,f*0.5),t=AC.currentTime+(dl||0),hold=Math.max(0.04,d*0.35),rel=Math.max(0.2,d*1.2),end=t+hold+rel+0.22;const out=makeBus(0.06,randPan(0.08)),sum=AC.createGain(),lp=AC.createBiquadFilter(),amp=AC.createGain();lp.type='lowpass';lp.frequency.value=520;lp.Q.value=1.1;sum.connect(lp);lp.connect(amp);amp.connect(out);applyADSR(amp.gain,t,v*0.78*CFG.vol,0.004,0.1,0.28,rel,hold);spawnOsc(sum,{type:'sawtooth',freq:low,gain:0.72,t,end,pitchDrop:{from:1.08,time:0.03}});spawnOsc(sum,{type:'square',freq:low*2,gain:0.13,t,end,detune:3});spawnOsc(sum,{type:'sine',freq:low*0.5,gain:0.22,t,end});}
function patchFlute(f,d,v,dl){if(!ensureAudio())return;const t=AC.currentTime+(dl||0),hold=Math.max(0.05,d*0.6),rel=Math.max(0.22,d*1.2),end=t+hold+rel+0.18;const out=makeBus(0.22,randPan(0.14)),sum=AC.createGain(),bp=AC.createBiquadFilter(),amp=AC.createGain();bp.type='bandpass';bp.frequency.value=Math.min(3200,Math.max(500,f*2));bp.Q.value=0.5;sum.connect(bp);bp.connect(amp);amp.connect(out);applyADSR(amp.gain,t,v*0.62*CFG.vol,0.03,0.12,0.5,rel,hold);spawnOsc(sum,{type:'sine',freq:f,gain:0.86,t,end,lfo:{rate:5.5,depth:10,delay:0.08}});spawnOsc(sum,{type:'triangle',freq:f*2,gain:0.08,t,end,lfo:{rate:5.7,depth:6,delay:0.08}});spawnNoise(sum,{t,d:hold+rel+0.1,vol:0.018,bp:1800,q:0.6});}
function patchMarimba(f,d,v,dl){if(!ensureAudio())return;const t=AC.currentTime+(dl||0),hold=Math.max(0.01,d*0.12),rel=Math.max(0.12,d*0.8),end=t+hold+rel+0.12;const out=makeBus(0.12,randPan(0.15)),sum=AC.createGain(),bp=AC.createBiquadFilter(),amp=AC.createGain();bp.type='bandpass';bp.frequency.value=Math.min(5200,Math.max(900,f*3.3));bp.Q.value=0.9;sum.connect(bp);bp.connect(amp);amp.connect(out);applyADSR(amp.gain,t,v*0.7*CFG.vol,0.002,0.05,0.1,rel,hold);spawnOsc(sum,{type:'sine',freq:f,gain:0.85,t,end,pitchDrop:{from:1.02,time:0.02}});spawnOsc(sum,{type:'triangle',freq:f*4,gain:0.18,t,end});spawnOsc(sum,{type:'sine',freq:f*2,gain:0.1,t,end});spawnNoise(sum,{t,d:0.01,vol:0.18,hp:1800,lp:7800});}
function patchViolin(f,d,v,dl){if(!ensureAudio())return;const t=AC.currentTime+(dl||0),hold=Math.max(0.06,d*0.7),rel=Math.max(0.18,d*1.1),end=t+hold+rel+0.18;const out=makeBus(0.18,randPan(0.12)),sum=AC.createGain(),lp=AC.createBiquadFilter(),amp=AC.createGain();lp.type='lowpass';lp.frequency.value=2200;lp.Q.value=1.0;sum.connect(lp);lp.connect(amp);amp.connect(out);applyADSR(amp.gain,t,v*0.62*CFG.vol,0.05,0.12,0.54,rel,hold);spawnOsc(sum,{type:'sawtooth',freq:f,gain:0.58,t,end,lfo:{rate:6,depth:11,delay:0.08}});spawnOsc(sum,{type:'triangle',freq:f,gain:0.22,t,end,detune:4,lfo:{rate:6.2,depth:8,delay:0.08}});spawnOsc(sum,{type:'sine',freq:f*2,gain:0.08,t,end});}
function patchCelesta(f,d,v,dl){if(!ensureAudio())return;const t=AC.currentTime+(dl||0),hold=Math.max(0.02,d*0.22),rel=Math.max(0.3,d*1.5),end=t+hold+rel+0.18;const out=makeBus(0.3,randPan(0.2)),sum=AC.createGain(),bp=AC.createBiquadFilter(),amp=AC.createGain();bp.type='bandpass';bp.frequency.value=Math.min(5200,Math.max(900,f*2.4));bp.Q.value=0.75;sum.connect(bp);bp.connect(amp);amp.connect(out);applyADSR(amp.gain,t,v*0.65*CFG.vol,0.002,0.08,0.18,rel,hold);spawnOsc(sum,{type:'sine',freq:f,gain:0.88,t,end});spawnOsc(sum,{type:'sine',freq:f*1.189,gain:0.22,t:t+0.006,end});spawnOsc(sum,{type:'sine',freq:f*2,gain:0.12,t,end});}
function patchKatamari(f,d,v,dl){if(!ensureAudio())return;const t=AC.currentTime+(dl||0),hold=Math.max(0.03,d*0.24),rel=Math.max(0.22,d*1.3),end=t+hold+rel+0.2;const out=makeBus(0.28,randPan(0.24)),sum=AC.createGain(),bp=AC.createBiquadFilter(),amp=AC.createGain();bp.type='bandpass';bp.frequency.value=Math.min(4200,Math.max(800,f*3));bp.Q.value=0.85;sum.connect(bp);bp.connect(amp);amp.connect(out);applyADSR(amp.gain,t,v*0.72*CFG.vol,0.004,0.08,0.34,rel,hold);spawnOsc(sum,{type:'triangle',freq:f,gain:0.62,t,end,lfo:{rate:6.8,depth:9,delay:0.03},pitchDrop:{from:1.04,time:0.03}});spawnOsc(sum,{type:'square',freq:f*2,gain:0.14,t,end,detune:6});spawnOsc(sum,{type:'sine',freq:f*4,gain:0.07,t:t+0.01,end});spawnNoise(sum,{t,d:0.018,vol:0.08,hp:1800,lp:6800});}
function patchClay(f,d,v,dl){if(!ensureAudio())return;const t=AC.currentTime+(dl||0),hold=Math.max(0.02,d*0.1),rel=Math.max(0.3,d*1.4),end=t+hold+rel+0.2;const out=makeBus(0.14,randPan(0.12)),sum=AC.createGain(),amp=AC.createGain();const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1200;lp.Q.value=0.6;sum.connect(lp);lp.connect(amp);amp.connect(out);applyADSR(amp.gain,t,v*0.65*CFG.vol,0.001,0.04,0.25,rel,hold);spawnOsc(sum,{type:'triangle',freq:f,gain:0.65,t,end,pitchDrop:{from:1.04,time:0.02}});spawnOsc(sum,{type:'sine',freq:f*2,gain:0.20,t,end});spawnNoise(sum,{t,d:0.012,vol:0.09,hp:800,lp:3000});}
function patchKatamariNa(f,d,v,dl){if(!ensureAudio())return;const t=AC.currentTime+(dl||0),hold=Math.max(0.03,d*0.18),rel=Math.max(0.25,d*1.2),end=t+hold+rel+0.2;const out=makeBus(0.22,randPan(0.18)),sum=AC.createGain(),amp=AC.createGain();const nasal=AC.createBiquadFilter();nasal.type='bandpass';nasal.frequency.value=900;nasal.Q.value=6;const open=AC.createBiquadFilter();open.type='lowpass';open.frequency.value=3200;open.Q.value=0.7;sum.connect(nasal);nasal.connect(open);open.connect(amp);amp.connect(out);nasal.frequency.setValueAtTime(900,t);nasal.frequency.linearRampToValueAtTime(2400,t+Math.max(0.04,hold*0.9));nasal.Q.setValueAtTime(7,t);nasal.Q.linearRampToValueAtTime(1.2,t+hold);applyADSR(amp.gain,t,v*0.7*CFG.vol,0.003,0.06,0.38,rel,hold);spawnOsc(sum,{type:'triangle',freq:f,gain:0.72,t,end,lfo:{rate:7,depth:10,delay:0.06},pitchDrop:{from:1.03,time:0.025}});spawnOsc(sum,{type:'square',freq:f*2,gain:0.18,t,end,detune:5});spawnOsc(sum,{type:'sine',freq:f*3,gain:0.06,t:t+0.01,end});spawnNoise(sum,{t,d:0.014,vol:0.06,hp:1200,lp:5000});}
function patchNyan(f,d,v,dl){if(!ensureAudio())return;const t=AC.currentTime+(dl||0),hold=Math.max(0.04,d*0.22),rel=Math.max(0.12,d*0.8),end=t+hold+rel+0.12;const out=makeBus(0.08,randPan(0.15)),sum=AC.createGain(),amp=AC.createGain();const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=180;sum.connect(hp);hp.connect(amp);amp.connect(out);applyADSR(amp.gain,t,v*0.68*CFG.vol,0.001,0.04,0.62,rel,hold);spawnOsc(sum,{type:'square',freq:f,gain:0.55,t,end});spawnOsc(sum,{type:'square',freq:f*2,gain:0.22,t,end,detune:-8});spawnOsc(sum,{type:'sine',freq:f*4,gain:0.08,t,end});spawnNoise(sum,{t,d:0.008,vol:0.07,hp:3000});}

function safePatch(fn,fallbackType){
  return (f,d,v,dl)=>{
    if(!AC)return;
    try{if(!ensureAudio()){legacyTone(f,fallbackType||'sine',d||0.14,v||0.16,dl||0);return;}fn(f,d,v,dl);}
    catch(e){legacyTone(f,fallbackType||'sine',d||0.14,Math.min(0.22,(v||0.16)*0.92),dl||0);}
  };
}

const INST={
  sine:safePatch(patchSine,'sine'),piano:safePatch(patchPiano,'triangle'),organ:safePatch(patchOrgan,'sine'),
  saxophone:safePatch(patchSax,'triangle'),chords:safePatch(patchChords,'triangle'),amen:safePatch(patchAmen,'triangle'),
  pluck:safePatch(patchPluck,'sawtooth'),bell:safePatch(patchBell,'sine'),bass:safePatch(patchBass,'square'),
  flute:safePatch(patchFlute,'sine'),marimba:safePatch(patchMarimba,'triangle'),violin:safePatch(patchViolin,'sawtooth'),
  celesta:safePatch(patchCelesta,'sine'),clay:safePatch(patchClay,'triangle'),katamari:safePatch(patchKatamari,'triangle'),
  katamarina:safePatch(patchKatamariNa,'triangle'),nyan:safePatch(patchNyan,'square'),
};

// ── Scale definitions ──
const SCALES={
  off:()=>440,
  static:(i)=>[660,660,660,660,660,660,660,660][i%8],
  major:(i)=>[261.6,293.7,329.6,349.2,392,440,493.9,523.3,587.3,659.3][i%10],
  minor:(i)=>[261.6,293.7,311.1,349.2,392,415.3,466.2,523.3,587.3,622.3][i%10],
  mixolydian:(i)=>[261.6,293.7,329.6,349.2,392,440,466.2,523.3,587.3,659.3][i%10],
  lydian:(i)=>[261.6,293.7,329.6,370,392,440,493.9,523.3,587.3,740][i%10],
  phrygian:(i)=>[261.6,277.2,311.1,349.2,392,415.3,466.2,523.3,554.4,622.3][i%10],
  harmonicminor:(i)=>[261.6,293.7,311.1,349.2,392,415.3,493.9,523.3,587.3,622.3][i%10],
  pentatonic:(i)=>[261.6,293.7,329.6,392,440,523.3,587.3,659.3,784,880][i%10],
  chromatic:(i)=>{const base=261.6;return base*Math.pow(2,(i%12)/12);},
  arpeggio:(i)=>[261.6,329.6,392,523.3,659.3,784,1047,1318][i%8],
  blues:(i)=>[261.6,311.1,349.2,370,392,466.2,523.3,622.3][i%8],
  dorian:(i)=>[261.6,293.7,311.1,349.2,392,440,466.2,523.3][i%8],
  wholetone:(i)=>[261.6,293.7,329.6,370,415.3,466.2,523.3,587.3][i%8],
  fifths:(i)=>[261.6,392,293.7,440,329.6,493.9,349.2,523.3,392,587.3][i%10],
  octaves:(i)=>[261.6,523.3,293.7,587.3,329.6,659.3,392,784,440,880][i%10],
  gospel:(i)=>[261.6,392,440,349.2,329.6,293.7,392,523.3,440,392][i%10],
  katamariroll:(i)=>[392,523.3,440,659.3,587.3,440,523.3,783.99,659.3,523.3,392,293.7][i%12],
  giantsteps:(i)=>[493.9,587.3,554.4,493.9,415.3,440,392,370,329.6,293.7,311.1,349.2,392,329.6,293.7,261.6][i%16],
  nyancat:(i)=>[349.2,392,440,349.2,293.7,261.6,293.7,349.2,392,440,523.3,493.9,440,392,349.2,392][i%16],
  superbowl:(i)=>[392,523.3,659.3,523.3,659.3,783.99,659.3,523.3,392,261.6,329.6,392,523.3,659.3,523.3,392][i%16],
  halftime:(i)=>[261.6,293.7,329.6,261.6,392,349.2,293.7,261.6,523.3,440,392,329.6,261.6,349.2,392,440][i%16],
  hedwigs:(i)=>[329.6,349.2,415.3,349.2,329.6,392,349.2,311.1,261.6,311.1,329.6,349.2,392,329.6,349.2,329.6][i%16],
  hogwarts:(i)=>[261.6,392,349.2,311.1,261.6,220,261.6,311.1,349.2,392,440,392,349.2,311.1,293.7,261.6][i%16],
  shire:(i)=>[261.6,293.7,329.6,392,440,392,349.2,329.6,293.7,261.6,293.7,329.6,392,440,523.3,440][i%16],
  rivendell:(i)=>[261.6,293.7,329.6,369.99,440,493.9,523.3,587.3,659.3,587.3,523.3,493.9,440,369.99,329.6,261.6][i%16],
  mordor:(i)=>[440,392,349.2,311.1,261.6,246.9,261.6,311.1,349.2,311.1,261.6,220,196,220,246.9,261.6][i%16],
};

let sfxNoteIdx=0;
let sfxKeyShift=0;
function sfxCorrect(){
  if(CFG.instrument==='off'||CFG.scale==='off')return;
  sfxKeyShift=Math.floor((typeof fStreak==='number'?fStreak:0)/Math.max(1,CFG.keyChangeStreak||6));
  const baseFreq=(SCALES[CFG.scale]||SCALES.major)(sfxNoteIdx++);
  const freq=baseFreq*Math.pow(2,sfxKeyShift/12);
  const inst=INST[CFG.instrument]||INST.sine;
  inst(freq,0.16,0.18,0);
}
function sfxWrong(){tone(130,'sawtooth',0.09,0.09);tone(82,'triangle',0.1,0.06,0.02);}
function sfxComplete(){
  if(CFG.instrument==='off')return;
  const scale=SCALES[CFG.scale]||SCALES.major;
  [0,2,4,7].forEach((step,i)=>{const freq=scale(step);(INST[CFG.instrument]||INST.sine)(freq,0.12,0.11,i*0.085);});
  sfxNoteIdx=0;sfxKeyShift=0;
}
function sfxFlip(){tone(440,'triangle',0.05,0.06);tone(660,'sine',0.03,0.03,0.01);}
function sfxRate(q){tone([220,294,392,523][q],'sine',0.06,0.08);}

// ── Haptics ──
const _hapIsIOS=(()=>{try{const t=document.createElement('input');t.type='checkbox';return 'switch' in t;}catch(e){return false;}})();

function _fireHapPulse(){
  try{
    const id='__hap_'+Date.now()+'__';
    const inp=document.createElement('input');inp.type='checkbox';inp.setAttribute('switch','');inp.id=id;
    inp.style.cssText='position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;z-index:-1;';
    const lbl=document.createElement('label');lbl.htmlFor=id;
    lbl.style.cssText='position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;z-index:-1;';
    document.body.appendChild(inp);document.body.appendChild(lbl);lbl.click();
    requestAnimationFrame(()=>{inp.remove();lbl.remove();});
  }catch(e){}
}

function _iosHap(pulses){
  if(!CFG.haptics)return;
  _fireHapPulse();
  if(pulses>=2) requestAnimationFrame(_fireHapPulse);
  if(pulses>=3) requestAnimationFrame(()=>requestAnimationFrame(_fireHapPulse));
}

const _vib=p=>{try{if(CFG.haptics&&navigator.vibrate)navigator.vibrate(p);}catch(e){}};

const hapTap      = ()=>_hapIsIOS?_iosHap(1):_vib(7);
const hapCorrect  = ()=>_hapIsIOS?_iosHap(1):_vib(20);
const hapWrong    = ()=>_hapIsIOS?_iosHap(2):_vib([40,15,40]);
const hapComplete = ()=>_hapIsIOS?_iosHap(3):_vib([25,10,25,10,50]);

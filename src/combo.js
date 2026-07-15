// ════════════════════════════════════════════════════
// COMBO SYSTEM & WORD ARC TRAILS
// ════════════════════════════════════════════════════

function updateComboMult(combo){
  const wrap=document.getElementById('combo-mult');
  const val=document.getElementById('combo-mult-val');
  if(!wrap||!val)return;
  if(combo<2){wrap.classList.remove('show');return;}
  val.textContent='\u00d7'+combo;
  const palette2=['#FFD700','#FF9500','#FF6B35','#FF3B3B','#FF3BAA','#C66FFF','#FFFFFF'];
  const comboCol=combo<2?'#FFD700':(palette2[(combo-2)%palette2.length]||'#FFD700');
  val.style.color=comboCol;
  val.style.fontSize=(28+Math.min(combo,8)*3)+'px';
  const glow=Math.min(combo,8)*5;
  val.style.textShadow=`0 0 ${glow+15}px ${comboCol}, 0 0 ${glow+30}px rgba(255,140,0,0.4)`;
  wrap.classList.add('show');
  val.classList.remove('punch');
  void val.offsetWidth;
  val.classList.add('punch');
}

function spawnWordArc(word, tileEl, combo){
  if(!tileEl)return;
  const bw=document.getElementById('fg-built');
  if(!bw)return;
  const tr=tileEl.getBoundingClientRect();
  if(!tr||!tr.width)return;
  const sx=tr.left+tr.width/2;
  const sy=tr.top+tr.height/2;
  const lastSpan=bw.lastElementChild;
  let ex,ey;
  if(lastSpan){const lr=lastSpan.getBoundingClientRect();ex=lr.right+4;ey=lr.top+lr.height/2;}
  else{const br=bw.getBoundingClientRect();ex=br.left+16;ey=br.top+br.height/2;}
  const dx=ex-sx, dy=ey-sy;
  const dur=0.28+Math.min(0.18,Math.abs(dy)/1800);

  const palette=['#A8E063','#FFD700','#FF9500','#FF6B35','#FF3B8A','#C66FFF','#FFFFFF'];
  const colours=Array.from({length:Math.max(8,combo+1)},(_,i)=>palette[i%palette.length]);
  const col=colours[Math.max(0,combo-1)]||'#FFFFFF';
  const sz=Math.min(22,12+Math.min(combo,8)*1.5);

  const el=document.createElement('div');
  el.className='word-arc';
  el.textContent=word;
  el.style.left=sx+'px';
  el.style.top=sy+'px';
  el.style.color=col;
  el.style.textShadow=`0 0 10px ${col}`;
  el.style.fontSize=sz+'px';
  el.style.setProperty('--arc-dx',dx+'px');
  el.style.setProperty('--arc-dy',dy+'px');
  el.style.setProperty('--arc-dur',dur+'s');
  document.body.appendChild(el);
  el.addEventListener('animationend',()=>el.remove(),{once:true});
}

function showBurst(){
  const el=document.getElementById('burst');el.innerHTML='';
  const colors=["#FFD700","#FF6B35","#A8E063","#56CCF2","#F7971E"];
  for(let i=0;i<12;i++){
    const d=document.createElement('div');d.className='bd';d.style.background=colors[i%5];
    const ang=i*30,r=ang*Math.PI/180,dist=60+Math.random()*32;
    d.style.setProperty('--s','translate(0,0)');
    d.style.setProperty('--e',`translate(${Math.sin(r)*dist}px,${-Math.cos(r)*dist}px)`);
    d.style.animationDelay=(i*0.025)+'s';
    el.appendChild(d);
  }
  el.classList.add('show');setTimeout(()=>el.classList.remove('show'),600);
}

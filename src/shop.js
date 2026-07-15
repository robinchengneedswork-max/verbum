// ════════════════════════════════════════════════════
// SHOP, GACHA & INVENTORY
// ════════════════════════════════════════════════════

let invFilter='all';
let _shopPage='packs';
let _gachaCb=null;
let _gachaDragCleanup=null;
let _bossRunContext=null;

function setShopPage(page,el){
  _shopPage=page;
  document.querySelectorAll('#shop-page-pills .spill').forEach(p=>p.classList.remove('on'));
  if(el)el.classList.add('on');
  ['packs','craft','skins','sounds','study','inventory'].forEach(p=>{
    const d=document.getElementById('shop-page-'+p);if(d)d.style.display=p===page?'':'none';
  });
  if(page==='skins')renderShopSkins();
  if(page==='sounds')renderShopSounds();
  if(page==='study')renderShopStudy();
  if(page==='inventory')renderInventory();
  if(page==='craft')renderCraft();
}

function renderShop(){
  document.getElementById('shop-coins-val').textContent=G.coins;
  updateShardDisplay();
  const pg=document.getElementById('pack-grid');if(pg){pg.innerHTML='';
    PACKS.filter(p=>!p.lumensOnly).forEach(pack=>{
      const div=document.createElement('div');div.className='pack-card';
      const priceStr=pack.lumensPrice?`\ud83d\udd06 ${pack.lumensPrice} Lumens`:`\ud83d\udcb0 ${pack.price}`;
      div.innerHTML=`<div class="pack-card-icon">${pack.icon}</div><div class="pack-card-name">${pack.name}</div><div class="pack-card-desc">${pack.desc}</div><div class="pack-card-price">${priceStr}</div>`;
      div.onclick=()=>buyPack(pack);pg.appendChild(div);
    });
  }
  renderLumenExchange();
  updateLumensDisplay();
  setShopPage(_shopPage, document.getElementById('sp-'+_shopPage));
}

function renderCraft(){
  const cl=document.getElementById('craft-list');if(!cl)return;cl.innerHTML='';
  CRAFTABLES.forEach(c=>{
    const item=ITEMS.find(i=>i.id===c.id);if(!item)return;
    const owned=G.inventory.includes(c.id);
    const needsShard=item.rarity==='legendary';
    const canDo=canCraft(item);
    const div=document.createElement('div');div.className='vitem';
    const costStr=needsShard?`${c.dustCost} dust + 1 \u2728 shard`:`${c.dustCost} dust`;
    const rarCol={common:'#9A9A9A',uncommon:'#A8E063',rare:'#56CCF2',legendary:'#FFD700'}[item.rarity]||'#C9A84C';
    div.innerHTML=`<div><div class="vitem-ref" style="color:${rarCol}">${item.icon} ${item.name}</div><div class="vitem-book">${item.rarity} \u00b7 ${costStr}</div></div><div style="font-size:11px;color:${owned?'#5A4020':canDo?'#A8E063':'#6A4020'}">${owned?'Owned':canDo?'Craft':'Locked'}</div>`;
    if(!owned&&canDo)div.onclick=()=>craftItem(c);
    cl.appendChild(div);
  });
}

function renderLumenExchange(){
  const el=document.getElementById('lumen-exchange-list');if(!el)return;el.innerHTML='';
  LUMEN_EXCHANGE.forEach(ex=>{
    const canAfford=G.lumens>=ex.cost;
    const pack=PACKS.find(p=>p.id===ex.packId);if(!pack)return;
    const div=document.createElement('div');div.className='vitem';
    div.innerHTML=`<div><div class="vitem-ref" style="color:#A8D8FF">${ex.icon} ${ex.label}</div><div class="vitem-book">${ex.desc}</div></div><div style="font-size:11px;color:${canAfford?'#A8E063':'#6A4020'}">${canAfford?'Redeem':'Need '+ex.cost+'\ud83d\udd06'}</div>`;
    if(canAfford)div.onclick=()=>{buyPack(pack);renderLumenExchange();};
    el.appendChild(div);
  });
}

function renderShopSkins(){
  const owned=document.getElementById('inv-grid-skins');if(!owned)return;owned.innerHTML='';
  const locked=document.getElementById('inv-grid-skins-locked');if(locked)locked.innerHTML='';
  ITEMS.filter(i=>i.type==='skin').forEach(item=>{
    const have=G.inventory.includes(item.id);
    const div=buildInvItem(item);
    if(have&&owned)owned.appendChild(div);
    else if(!have&&locked){
      if(item.unlock&&!itemUnlocked(item)){locked.appendChild(buildLockedExclusiveItem(item));}
      else{const div2=buildInvItem(item);div2.style.opacity='0.4';locked.appendChild(div2);}
    }
  });
  if(owned&&!owned.children.length)owned.innerHTML='<div style="color:#5A4020;font-size:11px;grid-column:1/-1;text-align:center;padding:16px">No skins yet \u2014 open packs!</div>';
}

function renderShopSounds(){
  const gi=document.getElementById('inv-grid-instruments');if(gi)gi.innerHTML='';
  const gs=document.getElementById('inv-grid-scales');if(gs)gs.innerHTML='';
  const gl=document.getElementById('inv-grid-sounds-locked');if(gl)gl.innerHTML='';
  ITEMS.filter(i=>i.type==='instrument'||i.type==='scale').forEach(item=>{
    const have=G.inventory.includes(item.id);
    const div=buildInvItem(item);
    if(have){if(item.type==='instrument'&&gi)gi.appendChild(div);else if(gs)gs.appendChild(div);}
    else if(gl){
      if(item.unlock&&!itemUnlocked(item)){gl.appendChild(buildLockedExclusiveItem(item));}
      else{const div2=buildInvItem(item);div2.style.opacity='0.4';gl.appendChild(div2);}
    }
  });
}

function renderShopStudy(){
  const gc=document.getElementById('inv-grid-commentary');if(gc)gc.innerHTML='';
  ITEMS.filter(i=>i.type==='commentary').forEach(item=>{
    if(G.inventory.includes(item.id)&&gc)gc.appendChild(buildInvItem(item));
  });
  if(gc&&!gc.children.length)gc.innerHTML='<div style="color:#5A4020;font-size:11px;grid-column:1/-1;text-align:center;padding:16px">No commentary yet \u2014 open Scholar Packs!</div>';
}

function buildLockedExclusiveItem(item){
  const div=document.createElement('div');div.className='inv-item exclusive-locked';
  const hint=itemUnlockHint(item);
  const rc={'common':'#9A9A9A','uncommon':'#A8E063','rare':'#56CCF2','legendary':'#FFD700'}[item.rarity]||'#C9A84C';
  div.innerHTML=`<div class="exclusive-badge">\ud83d\udd12</div><div class="inv-item-icon" style="opacity:0.5">${item.icon}</div><div class="inv-item-name" style="color:${rc};opacity:0.7">${item.name}</div><div class="exclusive-hint">${hint||'Locked'}</div>`;
  return div;
}

function buildInvItem(item){
  const counts={};G.inventory.forEach(id=>{counts[id]=(counts[id]||0)+1;});
  const count=counts[item.id]||0,isDup=count>1;
  const itemKey=item.val||item.id;
  const isEquipped=(item.type==='instrument'||item.type==='scale'||item.type==='skin')&&G.equipped[item.type]===itemKey;
  const div=document.createElement('div');div.className='inv-item'+(isEquipped?' equipped':'');div.dataset.itemId=item.id;
  const equippedBadge=isEquipped?'<div style="font-size:7px;color:#C9A84C;letter-spacing:1px;margin-top:2px">EQUIPPED</div>':'';
  div.innerHTML=`<div class="inv-item-icon">${item.icon}</div><div class="inv-item-name">${item.name}</div>${equippedBadge}${isDup?`<div class="inv-item-dust">\u00d7${count}</div><div class="dust-badge">DUP</div>`:''}`;
  div.onclick=()=>equipOrDust(item,div);
  return div;
}

function renderInventory(){
  const grid=document.getElementById('inventory-grid');if(!grid)return;grid.innerHTML='';
  const counts={};G.inventory.forEach(id=>{counts[id]=(counts[id]||0)+1;});
  const shown=Object.keys(counts).sort((a,b)=>{
    const ia=ITEMS.find(i=>i.id===a),ib=ITEMS.find(i=>i.id===b);
    return ((TYPE_ORDER[ia?.type]??99)-(TYPE_ORDER[ib?.type]??99))||((RARITY_ORDER[ia?.rarity]??99)-(RARITY_ORDER[ib?.rarity]??99))||a.localeCompare(b);
  });
  shown.forEach(id=>{const item=ITEMS.find(i=>i.id===id);if(!item)return;grid.appendChild(buildInvItem(item));});
  if(!shown.length){grid.innerHTML='<div style="color:#5A4020;font-size:11px;grid-column:1/-1;text-align:center;padding:20px">No items yet. Open packs!</div>';}
}

function buyPack(pack){
  if(pack.lumensPrice){
    if(G.lumens<pack.lumensPrice){alert('Need '+pack.lumensPrice+' \ud83d\udd06 Lumens!');return;}
    G.lumens-=pack.lumensPrice;updateLumensDisplay();
  } else {
    if(G.coins<pack.price){alert('Not enough coins! \ud83d\udcb0');return;}
    G.coins-=pack.price;
  }
  let types=pack.types||null;
  let pool=ITEMS.filter(item=>(!types||types.includes(item.type))&&itemUnlocked(item));
  let results=[];let lumensEarned=0;
  for(let i=0;i<pack.count;i++){
    const rarity=rollRarity(pack.rarityWeights);
    const filtered=pool.filter(item=>item.rarity===rarity);
    const item=filtered[Math.floor(Math.random()*filtered.length)]||pool[Math.floor(Math.random()*pool.length)];
    results.push(item);
    if(pack.lumenChance&&Math.random()<pack.lumenChance){
      const r=Math.random();lumensEarned+=r<0.6?1:r<0.9?2:3;
    }
  }
  if(lumensEarned>0){for(let li=0;li<lumensEarned;li++){results.push({_isLumen:true,lumens:1});}}
  updateHeader();
  let ri=0;
  function revealNext(){
    if(ri>=results.length){renderShop();save();return;}
    const item=results[ri++];
    if(item._isLumen){G.lumens+=item.lumens;updateLumensDisplay();showLumenReveal(item.lumens,revealNext);return;}
    const isDup=G.inventory.includes(item.id);
    G.inventory.push(item.id);
    if(isDup){G.dust+=item.dustVal;if(item.rarity==='legendary'){G.shards++;updateShardDisplay();}}
    showGachaReveal(item,isDup,revealNext);
  }
  revealNext();
}

function rollRarity(weights){
  const roll=Math.random()*100;let acc=0;
  for(const[k,v]of Object.entries(weights)){acc+=v;if(roll<acc)return k;}
  return 'common';
}

function spawnGachaParticles(rarity){
  const layer=document.getElementById('gacha-particles');if(!layer)return;
  layer.innerHTML='';layer.classList.add('show');
  const colors={uncommon:['#A8E063','#D4F08A','#7DC440'],rare:['#56CCF2','#A8E8FF','#2AAFD8'],legendary:['#FFD700','#FFF0A0','#FF9B00','#FFFFFF','#FFE54A'],}[rarity]||['#C9A84C'];
  const count=rarity==='legendary'?28:rarity==='rare'?18:10;
  const cx=window.innerWidth/2, cy=window.innerHeight/2;
  for(let i=0;i<count;i++){
    const p=document.createElement('div');p.className='gp';
    const ang=(Math.random()*360)*Math.PI/180;const dist=80+Math.random()*(rarity==='legendary'?220:130);
    p.style.left=cx+'px';p.style.top=cy+'px';
    p.style.background=colors[Math.floor(Math.random()*colors.length)];
    p.style.width=(4+Math.random()*7)+'px';p.style.height=p.style.width;
    p.style.setProperty('--gx',Math.cos(ang)*dist+'px');p.style.setProperty('--gy',Math.sin(ang)*dist+'px');
    p.style.animationDelay=(i*18)+'ms';p.style.animationDuration=(600+Math.random()*400)+'ms';
    layer.appendChild(p);
  }
  setTimeout(()=>{layer.classList.remove('show');layer.innerHTML='';},1200);
}

function fireRevealEffects(rarity, inner){
  const front = document.getElementById('gacha-card');front.classList.add('revealed');
  if(rarity==='legendary'){
    const flash=document.getElementById('gacha-flash');
    if(flash){flash.classList.add('pop');setTimeout(()=>{flash.classList.remove('pop');flash.classList.add('fade');setTimeout(()=>flash.classList.remove('fade'),500);},80);}
    spawnGachaParticles('legendary');inner.classList.add('legendary-shake');
    sfxComplete();hapComplete();tone(880,'sine',0.12,0.22,0.05);tone(1108,'sine',0.09,0.18,0.18);
  } else if(rarity==='rare'){spawnGachaParticles('rare');tone(660,'sine',0.08,0.14);tone(784,'sine',0.06,0.12,0.12);hapCorrect();}
  else if(rarity==='uncommon'){spawnGachaParticles('uncommon');sfxCorrect();hapCorrect();}
  else{sfxCorrect();hapCorrect();}
}

function hexToRgba(hex, alpha){
  const m=hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if(!m)return `rgba(201,168,76,${alpha.toFixed(2)})`;
  return `rgba(${parseInt(m[1],16)},${parseInt(m[2],16)},${parseInt(m[3],16)},${alpha.toFixed(2)})`;
}

function attachFlipDrag(inner, rarity, holdMs){
  if(_gachaDragCleanup){_gachaDragCleanup();_gachaDragCleanup=null;}
  const back=document.getElementById('gacha-back-face'),scene=document.getElementById('gacha-scene'),dismissBtn=document.getElementById('gacha-dismiss-btn');
  const rarityColor=RARITY_BORDER[rarity]||'#C9A84C';const CARD_W=scene?scene.offsetWidth:280;
  let startX=0,rawDeg=0,dragging=false,committed=false,effectsFired=false;
  function springTo(targetDeg,onDone){inner.classList.remove('dragging');inner.style.transition='transform 0.32s cubic-bezier(.2,.8,.3,1.1)';inner.style.transform=`rotateY(${targetDeg}deg)`;const handler=()=>{inner.style.transition='';inner.removeEventListener('transitionend',handler);if(onDone)onDone();};inner.addEventListener('transitionend',handler,{once:true});}
  function applyBackGlow(progress){if(!back)return;const p=Math.min(1,Math.max(0,progress));back.style.borderColor=rarityColor;const glowSize=Math.round(p*32);back.style.boxShadow=`0 0 ${glowSize}px ${hexToRgba(rarityColor,p*0.75)}`;}
  function clearBackGlow(){if(!back)return;back.style.borderColor='';back.style.boxShadow='';}
  function onDragStart(e){if(committed)return;dragging=true;startX=(e.touches?e.touches[0].clientX:e.clientX);inner.classList.add('dragging');inner.style.transition='';e.preventDefault();applyBackGlow(0.35);hapTap();}
  function onDragMove(e){if(!dragging||committed)return;const clientX=(e.touches?e.touches[0].clientX:e.clientX);const dx=clientX-startX;rawDeg=Math.max(0,Math.min(180,(dx/CARD_W)*180));inner.style.transform=`rotateY(${rawDeg}deg)`;const progress=Math.min(1,rawDeg/90);if(rawDeg<90){applyBackGlow(0.35+progress*0.65);}if(!effectsFired&&rawDeg>=90){effectsFired=true;clearBackGlow();fireRevealEffects(rarity,inner);}}
  function onDragEnd(e){if(!dragging||committed)return;dragging=false;inner.classList.remove('dragging');if(rawDeg>=90){committed=true;springTo(180,()=>{cleanup();setTimeout(()=>dismissBtn.classList.add('ready'),holdMs);});clearBackGlow();}else{effectsFired=false;springTo(0);clearBackGlow();setTimeout(()=>{const front=document.getElementById('gacha-card');front.classList.remove('revealed');inner.classList.remove('legendary-shake');},320);}}
  function cleanup(){inner.removeEventListener('touchstart',onDragStart);inner.removeEventListener('touchmove',onDragMove);inner.removeEventListener('touchend',onDragEnd);inner.removeEventListener('mousedown',onDragStart);window.removeEventListener('mousemove',onDragMove);window.removeEventListener('mouseup',onDragEnd);}
  inner.addEventListener('touchstart',onDragStart,{passive:false});inner.addEventListener('touchmove',onDragMove,{passive:false});inner.addEventListener('touchend',onDragEnd);inner.addEventListener('mousedown',onDragStart);window.addEventListener('mousemove',onDragMove);window.addEventListener('mouseup',onDragEnd);
  _gachaDragCleanup=cleanup;
}

function presentGachaCard(icon, rarity, name, desc, extra, holdMs, onDismissReady){
  const overlay=document.getElementById('gacha-overlay'),scene=document.getElementById('gacha-scene'),inner=document.getElementById('gacha-card-inner'),front=document.getElementById('gacha-card'),glow=document.getElementById('gc-glow'),dismissBtn=document.getElementById('gacha-dismiss-btn');
  document.getElementById('gc-icon').textContent=icon;document.getElementById('gc-rarity').textContent=rarity.toUpperCase();document.getElementById('gc-rarity').style.color=RARITY_COLORS[rarity]||'#C9A84C';document.getElementById('gc-name').textContent=name;document.getElementById('gc-desc').textContent=desc;
  front.style.borderColor=RARITY_BORDER[rarity]||'#C9A84C';
  if(glow){glow.style.background=RARITY_GLOW[rarity]||'none';}
  if(extra){extra(document.getElementById('gc-dup'));}
  inner.classList.remove('flipped','legendary-shake','flip-back','dragging');inner.style.transform='rotateY(0deg)';inner.style.transition='none';front.classList.remove('revealed');dismissBtn.classList.remove('ready');scene.classList.remove('entering');
  void inner.offsetHeight;
  overlay.classList.add('show');
  requestAnimationFrame(()=>{inner.style.transition='';requestAnimationFrame(()=>overlay.classList.add('gacha-ready'));});
  scene.classList.add('entering');tone(220,'sawtooth',0.04,0.06);
  setTimeout(()=>attachFlipDrag(inner,rarity,holdMs),500);
}

function showGachaReveal(item,isDup,cb){
  _gachaCb=cb;
  presentGachaCard(item.icon,item.rarity,item.name,item.desc,(dupEl)=>{dupEl.style.display=isDup?'block':'none';if(isDup)dupEl.textContent=`+${item.dustVal} dust (duplicate)`;},item.rarity==='legendary'?2200:item.rarity==='rare'?1200:700,null);
}

function showLumenReveal(amount,cb){
  _gachaCb=cb;
  presentGachaCard('\ud83d\udd06','rare','+'+amount+' Lumen'+(amount>1?'s':'')+'!','Rare currency \u2014 redeem in Shop for themed packs.',(dupEl)=>{dupEl.style.display='none';},1200,null);
  const card=document.getElementById('gacha-card');if(card)card.style.borderColor='#A8D8FF';
  document.getElementById('gc-rarity').textContent='LUMEN DROP';document.getElementById('gc-rarity').style.color='#A8D8FF';
  tone(659,'sine',0.1,0.14);tone(784,'sine',0.08,0.12,0.14);tone(1047,'sine',0.07,0.10,0.28);
}

function gachaDismiss(){
  const inner=document.getElementById('gacha-card-inner'),overlay=document.getElementById('gacha-overlay'),dismissBtn=document.getElementById('gacha-dismiss-btn');
  dismissBtn.classList.remove('ready');
  if(_gachaDragCleanup){_gachaDragCleanup();_gachaDragCleanup=null;}
  inner.style.transform='';inner.classList.remove('dragging','legendary-shake');inner.classList.add('flip-back');
  setTimeout(()=>{inner.classList.remove('flip-back','flipped');document.getElementById('gacha-card').classList.remove('revealed');document.getElementById('gacha-card').style.borderColor='';overlay.classList.remove('show','gacha-ready');if(_gachaCb){const cb=_gachaCb;_gachaCb=null;cb();}},420);
}

function equipOrDust(item,el){
  if(item.type==='commentary'){showGachaReveal(item,false,()=>{});return;}
  const itemKey=item.val||item.id;
  if(G.equipped[item.type]===itemKey){
    G.equipped[item.type]=null;
    if(item.type==='skin')applySkin(null);
    if(item.type==='instrument'){CFG.instrument='sine';}
    if(item.type==='scale'){CFG.scale='major';}
  } else {
    G.equipped[item.type]=itemKey;
    if(item.type==='instrument')CFG.instrument=item.val;
    if(item.type==='scale')CFG.scale=item.val;
    if(item.type==='skin')applySkin(item.val);
    hapTap();
    if(item.type==='instrument'||item.type==='scale'){resumeAC();sfxCorrect();}
  }
  save();
  if(_shopPage==='skins')renderShopSkins();
  else if(_shopPage==='sounds')renderShopSounds();
  else renderInventory();
}

function craftItem(c){
  const item=ITEMS.find(i=>i.id===c.id);if(!item)return;
  if(G.dust<c.dustCost){alert(`Need ${c.dustCost} dust!`);return;}
  if(item.rarity==='legendary'&&G.shards<1){alert('Need 1 \u2728 Shard of Light!');return;}
  G.dust-=c.dustCost;
  if(item.rarity==='legendary')G.shards--;
  G.inventory.push(c.id);
  updateShardDisplay();renderShop();save();
  if(item)showGachaReveal(item,false,()=>{});
}

// ════════════════════════════════════════════════════
// MASTERY PROGRESS POPUP
// ════════════════════════════════════════════════════

function showMasteryPopup(ref, ratingResult, errors){
  const popup=document.getElementById('mastery-popup');if(!popup)return;
  const card=G.srCards.find(c=>c.ref===ref);
  const {level,pct,next,label}=masteryProgressLabel(card);
  const badge=document.getElementById('mpp-badge');
  badge.textContent=level.toUpperCase();badge.className='mpp-level-badge '+level;
  const refEl=document.getElementById('mpp-ref');if(refEl)refEl.textContent=ref;
  const barColors={learning:'#A8E063',practicing:'#FFD700',mastered:'#56CCF2'};
  const bar=document.getElementById('mpp-bar');
  const prevPct=Math.round((ratingResult?ratingResult.prevProgress:0)*100);
  bar.style.width=prevPct+'%';bar.style.background=barColors[level]||'#C9A84C';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{bar.style.width=pct+'%';}));
  const barLbl=document.getElementById('mpp-bar-label');
  if(barLbl)barLbl.textContent=level==='mastered'?'\u2713 Mastered \u2014 word truncation active':label;
  const rewEl=document.getElementById('mpp-rewards');rewEl.innerHTML='';
  if(ratingResult&&ratingResult.leveledUp){
    const r=MASTERY_LEVEL_UP_REWARDS[ratingResult.newLevel];
    if(r){rewEl.innerHTML=`<span class="mpp-reward" style="color:#A8E063">\ud83c\udf89 ${r.label}</span><span class="mpp-reward" style="color:#FFD700">+${r.coins} \ud83d\udcb0</span><span class="mpp-reward" style="color:#A8D8FF">+${r.lumens} \ud83d\udd06</span>`;}
  } else if(errors>4){rewEl.innerHTML='<span style="font-size:9px;color:#5A4020">\u2191 Partial progress recorded</span>';}
  else{rewEl.innerHTML='<span style="font-size:9px;color:#5A4020">\u2191 Progress recorded</span>';}
  const col=activeCollection();
  const bossSection=document.getElementById('mpp-boss-section');const bossRows=document.getElementById('mpp-boss-rows');
  if(bossSection&&bossRows&&col){
    const relatedBosses=col.verses.filter(v=>{if(!isBossVerse(v))return false;const constituents=bossVerseConstituents(v,col);return constituents.includes(ref)&&constituents.length<col.verses.filter(x=>!isBossVerse(x)).length;});
    if(relatedBosses.length){
      bossRows.innerHTML='';
      relatedBosses.forEach(boss=>{const constituents=bossVerseConstituents(boss,col);const mastCount=constituents.filter(r=>verseMastery(r)==='mastered').length;const unlocked=bossVerseUnlocked(boss);const row=document.createElement('div');row.className='mpp-boss-row';
        if(unlocked){row.innerHTML=`<span class="mpp-boss-name">${boss.ref}</span><span class="mpp-boss-unlocked">\u2713 UNLOCKED</span>`;}
        else{const bpct=Math.round(mastCount/constituents.length*100);row.innerHTML=`<span class="mpp-boss-name">${boss.ref}</span><div class="mpp-boss-bar-wrap"><div class="mpp-boss-bar-fill" style="width:${bpct}%"></div></div><span class="mpp-boss-count">${mastCount}/${constituents.length}</span>`;}
        bossRows.appendChild(row);});
      bossSection.style.display='block';
    }else{bossSection.style.display='none';}
  }else if(bossSection){bossSection.style.display='none';}
  popup.classList.add('show');clearTimeout(popup._dismissT);
  popup._dismissT=setTimeout(()=>popup.classList.remove('show'),3500);
  popup.onclick=()=>{clearTimeout(popup._dismissT);popup.classList.remove('show');};
}

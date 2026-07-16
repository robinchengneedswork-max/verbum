// ════════════════════════════════════════════════════
// LOCALSTORAGE PERSISTENCE
// ════════════════════════════════════════════════════

const SAVE_KEY='verbum_save_v7';

function save(){
  try{
    if(typeof snapshotCollectionProgress==='function')snapshotCollectionProgress();
    localStorage.setItem(SAVE_KEY,JSON.stringify({
      xp:G.xp,streak:G.streak,coins:G.coins,dust:G.dust,shards:G.shards,lumens:G.lumens,
      inventory:G.inventory,equipped:G.equipped,
      activeCollectionId:G.activeCollectionId,
      collectionProgress:G.collectionProgress,
      verseCompletions:G.verseCompletions,
      bossGroupsBeaten:G.bossGroupsBeaten,
      CFG:{...CFG},
    }));
  }catch(e){}
}

function load(){
  try{
    const d=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(!d)return;
    G.xp=d.xp||0;G.streak=d.streak||0;G.coins=d.coins||0;G.dust=d.dust||0;G.shards=d.shards||0;G.lumens=d.lumens||0;
    G.inventory=Array.isArray(d.inventory)?d.inventory:[];
    G.equipped=d.equipped||{instrument:null,scale:null,skin:null};
    G.verseCompletions=d.verseCompletions||{};
    G.bossGroupsBeaten=d.bossGroupsBeaten||{};
    if(d.collectionProgress){
      G.collectionProgress=d.collectionProgress;
      G.activeCollectionId=d.activeCollectionId||'john';
    }else{
      G.collectionProgress={john:{
        flowVerseErrors:d.flowVerseErrors||{},
        lessonProgress:d.lessonProgress||{},
        lessonVerseIdx:d.lessonVerseIdx||0,
        srCards:d.srCards||[],
        srSessionCount:d.srSessionCount||0,
      }};
      G.activeCollectionId='john';
    }
    if(d.CFG){
      const loadedCfg={...d.CFG};
      if(typeof loadedCfg.bottomWobble==='undefined'&&typeof loadedCfg.breakBottom!=='undefined')loadedCfg.bottomWobble=!!loadedCfg.breakBottom;
      if(typeof loadedCfg.bottomWobbleMs==='undefined'&&Number.isFinite(+loadedCfg.bottomDwellMs))loadedCfg.bottomWobbleMs=+loadedCfg.bottomDwellMs;
      Object.assign(CFG,loadedCfg);
    }
  }catch(e){}
}

function exportSave(){
  const data=localStorage.getItem(SAVE_KEY);
  if(!data){alert('No save data found.');return;}
  const blob=new Blob([data],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  const date=new Date().toISOString().slice(0,10);
  a.download='verbum_save_'+date+'.json';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importSave(e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=evt=>{
    try{
      const data=evt.target.result;
      JSON.parse(data);
      if(confirm('Replace current save with imported file? This cannot be undone.')){
        localStorage.setItem(SAVE_KEY,data);
        location.reload();
      }
    }catch(err){alert('Invalid save file.');}
  };
  reader.readAsText(file);
  e.target.value='';
}

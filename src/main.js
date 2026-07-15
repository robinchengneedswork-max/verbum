// ════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ════════════════════════════════════════════════════

load();
normalizeConfig();

// Ensure all collections have a progress slot
if(!G.collectionProgress)G.collectionProgress={};
COLLECTIONS.forEach(col=>{
  if(!G.collectionProgress[col.id])
    G.collectionProgress[col.id]=blankCollectionProgress(col.verses);
});

// Activate the saved (or default) collection
setActiveCollection(G.activeCollectionId||'john', true);

if(!Array.isArray(G.inventory))G.inventory=[];
if(!G.equipped||typeof G.equipped!=='object')G.equipped={instrument:null,scale:null,skin:null};

// Apply equipped instrument/scale/skin
if(G.equipped.instrument&&INST[G.equipped.instrument])CFG.instrument=G.equipped.instrument;
if(G.equipped.scale&&SCALES[G.equipped.scale])CFG.scale=G.equipped.scale;
applySkin(G.equipped&&G.equipped.skin?G.equipped.skin:null);

// Start on Flow tab
switchTab('flow');
updateHeader();
syncSettingsUI();

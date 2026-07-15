// ════════════════════════════════════════════════════
// CENTRAL GAME STATE
// ════════════════════════════════════════════════════

let G={
  // Shared progression
  xp:0, streak:0, hearts:5, coins:0, dust:0, shards:0, lumens:0,
  // Inventory
  inventory:[], equipped:{instrument:null,scale:null,skin:null},
  // Collections
  activeCollectionId:'john',
  collectionProgress:{},
  // Per-collection working fields (populated by setActiveCollection)
  flowVerseErrors:{}, flowOrder:[], flowOrderIdx:0,
  verseCompletions:{},
  bossGroupsBeaten:{},
  lessonProgress:{}, lessonVerseIdx:0, lessonModeIdx:0,
  srCards:[], srSessionCount:0,
};

// ── Active collection ─────────────────────────────────
let VERSES = COLLECTION_JOHN.verses;
let _activeCollection = COLLECTION_JOHN;

function activeCollection() { return _activeCollection; }

function setActiveCollection(id, skipSave) {
  const col = COLLECTIONS.find(c => c.id === id);
  if (!col || !col.unlocked) return;
  if (!G.collectionProgress[id]) {
    G.collectionProgress[id] = blankCollectionProgress(col.verses);
  }
  _activeCollection = col;
  VERSES = col.verses;
  G.activeCollectionId = id;
  const cp = G.collectionProgress[id];
  G.flowVerseErrors = cp.flowVerseErrors || {};
  G.lessonProgress  = cp.lessonProgress  || {};
  G.lessonVerseIdx  = cp.lessonVerseIdx  || 0;
  G.srCards         = Array.isArray(cp.srCards) ? cp.srCards : blankCollectionProgress(col.verses).srCards;
  G.srSessionCount  = cp.srSessionCount  || 0;
  G.flowOrder       = [];
  G.flowOrderIdx    = 0;
  // Fill missing SR cards for any newly added verses
  const refSet = new Set(G.srCards.map(c => c.ref));
  col.verses.forEach(v => {
    if (!refSet.has(v.ref) && !isBossVerse(v)) {
      G.srCards.push({ ref: v.ref, interval: 0, ef: 2.5, reps: 0, due: Date.now() });
    }
  });
  if (!skipSave) save();
}

function snapshotCollectionProgress() {
  const id = _activeCollection.id;
  G.collectionProgress[id] = {
    flowVerseErrors: G.flowVerseErrors,
    lessonProgress:  G.lessonProgress,
    lessonVerseIdx:  G.lessonVerseIdx,
    srCards:         G.srCards,
    srSessionCount:  G.srSessionCount,
  };
}

// ════════════════════════════════════════════════════
// CONFIG
// ════════════════════════════════════════════════════
const CFG={
  animMs:60,fallSpeed:90,scale:'major',instrument:'sine',
  vol:0.7,haptics:true,ncols:3,
  tileSpacing:10,
  hitZoneFrac:0.95,
  startOffsetFrac:1.0,
  screenTileUnits:8.0,
  bottomWobble:true,
  bottomWobbleMs:250,
  countdown:true,
  devMode:false,
  keyChangeStreak:7,
};

function normalizeConfig(){
  if(!INST[CFG.instrument])CFG.instrument='sine';
  if(!SCALES[CFG.scale])CFG.scale='major';
  CFG.vol=Math.min(1,Math.max(0,Number.isFinite(+CFG.vol)?+CFG.vol:0.7));
  CFG.ncols=[2,3,4].includes(+CFG.ncols)?+CFG.ncols:3;
  CFG.fallSpeed=Number.isFinite(+CFG.fallSpeed)?+CFG.fallSpeed:90;
  CFG.tileSpacing=Number.isFinite(+CFG.tileSpacing)?+CFG.tileSpacing:10;
  CFG.hitZoneFrac=Number.isFinite(+CFG.hitZoneFrac)?+CFG.hitZoneFrac:0.95;
  CFG.startOffsetFrac=Number.isFinite(+CFG.startOffsetFrac)?+CFG.startOffsetFrac:1.0;
  CFG.screenTileUnits=Number.isFinite(+CFG.screenTileUnits)?Math.min(12,Math.max(4,+CFG.screenTileUnits)):8.0;
  CFG.bottomWobble=typeof CFG.bottomWobble==='boolean'?CFG.bottomWobble:true;
  CFG.bottomWobbleMs=Number.isFinite(+CFG.bottomWobbleMs)?Math.min(1800,Math.max(200,Math.round(+CFG.bottomWobbleMs))):250;
  CFG.countdown=typeof CFG.countdown==='boolean'?CFG.countdown:true;
  CFG.keyChangeStreak=Number.isFinite(+CFG.keyChangeStreak)?Math.max(1,Math.round(+CFG.keyChangeStreak)):7;
  CFG.devMode=typeof CFG.devMode==='boolean'?CFG.devMode:false;
}

// Utility
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

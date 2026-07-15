// ════════════════════════════════════════════════════
// XP THRESHOLDS & LEVEL REWARDS
// ════════════════════════════════════════════════════

// XP per level: flat 100 XP per level
// Level = floor(xp / 100) + 1
// Pct within level = xp % 100

// Rewards per level-up:
//   - Every level: +50 coins
//   - Every 5 levels: +1 Shard of Light

// Mastery level-up rewards (verse progression, not player level)
const MASTERY_LEVEL_UP_REWARDS = {
  practicing: { lumens:3,  coins:30,  label:'Practicing!' },
  mastered:   { lumens:5,  coins:75,  label:'Mastered!'   },
};

// Mastery difficulty modifiers by level
const MASTERY_CFG={
  learning:  {fallSpeed:75,  bottomWobbleMs:500, btMultiplier:2.0, hearts:3, xpMult:2.0, coinMult:2.0},
  practicing:{fallSpeed:90,  bottomWobbleMs:250, btMultiplier:1.0, hearts:5, xpMult:1.0, coinMult:1.0},
  mastered:  {fallSpeed:110, bottomWobbleMs:150, btMultiplier:1.0, hearts:5, xpMult:1.2, coinMult:1.2},
};

// Verse difficulty tier by word count
function verseTier(wordCount){
  if(wordCount<=23)return 1;
  if(wordCount<=30)return 2;
  if(wordCount<=39)return 3;
  return 4;
}

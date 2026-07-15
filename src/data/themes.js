// ════════════════════════════════════════════════════
// SKIN / THEME DEFINITIONS
// ════════════════════════════════════════════════════

const SKIN_VARS={
  gold:{   '--col-bg':'#1A1200','--col-border':'#5A4000','--col-active-bg':'#2A2000','--col-active-border':'#FFD700','--col-correct-bg':'#1A2A00','--col-correct-border':'#C9FF00','--tile-hot-bg':'linear-gradient(160deg,#3A2A00,#5A3A00)','--tile-hot-border':'#FFD700','--tile-hot-shadow':'rgba(255,215,0,0.35)','--tile-hot-color':'#FFFFF0'},
  purple:{ '--col-bg':'#0E0018','--col-border':'#3A1860','--col-active-bg':'#1A0030','--col-active-border':'#9B6FEF','--col-correct-bg':'#0A1E00','--col-correct-border':'#A8E063','--tile-hot-bg':'linear-gradient(160deg,#1A0035,#2A0055)','--tile-hot-border':'#9B6FEF','--tile-hot-shadow':'rgba(155,111,239,0.35)','--tile-hot-color':'#EED8FF'},
  fire:{   '--col-bg':'#180600','--col-border':'#6A2000','--col-active-bg':'#2A0800','--col-active-border':'#FF6B35','--col-correct-bg':'#1A1000','--col-correct-border':'#FFD700','--tile-hot-bg':'linear-gradient(160deg,#3A1200,#5A1A00)','--tile-hot-border':'#FF6B35','--tile-hot-shadow':'rgba(255,107,53,0.4)','--tile-hot-color':'#FFE0C8'},
  ice:{    '--col-bg':'#001018','--col-border':'#004060','--col-active-bg':'#001A28','--col-active-border':'#56CCF2','--col-correct-bg':'#00180A','--col-correct-border':'#A8E063','--tile-hot-bg':'linear-gradient(160deg,#00203A,#002A4A)','--tile-hot-border':'#56CCF2','--tile-hot-shadow':'rgba(86,204,242,0.4)','--tile-hot-color':'#E8F8FF'},
  neon:{   '--col-bg':'#001A00','--col-border':'#003A00','--col-active-bg':'#002200','--col-active-border':'#00FF41','--col-correct-bg':'#001A10','--col-correct-border':'#00FF99','--tile-hot-bg':'linear-gradient(160deg,#002200,#003300)','--tile-hot-border':'#00FF41','--tile-hot-shadow':'rgba(0,255,65,0.5)','--tile-hot-color':'#C8FFC8'},
  ocean:{  '--col-bg':'#001418','--col-border':'#003848','--col-active-bg':'#001C22','--col-active-border':'#00B4D8','--col-correct-bg':'#001A10','--col-correct-border':'#80FFDB','--tile-hot-bg':'linear-gradient(160deg,#002030,#003040)','--tile-hot-border':'#00B4D8','--tile-hot-shadow':'rgba(0,180,216,0.4)','--tile-hot-color':'#D0F4FF'},
  midnight:{'--col-bg':'#080018','--col-border':'#201840','--col-active-bg':'#100028','--col-active-border':'#6B6FEF','--col-correct-bg':'#001A10','--col-correct-border':'#80FFB0','--tile-hot-bg':'linear-gradient(160deg,#100030,#180048)','--tile-hot-border':'#8B8FFF','--tile-hot-shadow':'rgba(139,143,255,0.4)','--tile-hot-color':'#D8D8FF'},
  rose:{   '--col-bg':'#1A0A0C','--col-border':'#5A2030','--col-active-bg':'#220C10','--col-active-border':'#E8A0B0','--col-correct-bg':'#001A10','--col-correct-border':'#A8E063','--tile-hot-bg':'linear-gradient(160deg,#3A1018,#4A1820)','--tile-hot-border':'#E8A0B0','--tile-hot-shadow':'rgba(232,160,176,0.4)','--tile-hot-color':'#FFE8EC'},
  forest:{ '--col-bg':'#041200','--col-border':'#0C3000','--col-active-bg':'#081800','--col-active-border':'#4CAF50','--col-correct-bg':'#001810','--col-correct-border':'#80FF80','--tile-hot-bg':'linear-gradient(160deg,#0A2000,#123000)','--tile-hot-border':'#4CAF50','--tile-hot-shadow':'rgba(76,175,80,0.4)','--tile-hot-color':'#D4FFD4'},
  sunset:{ '--col-bg':'#1A0C08','--col-border':'#6A2A16','--col-active-bg':'#2A140D','--col-active-border':'#FF9E6D','--col-correct-bg':'#2A1808','--col-correct-border':'#FFD166','--tile-hot-bg':'linear-gradient(160deg,#5A1E14,#8A3A24)','--tile-hot-border':'#FF9E6D','--tile-hot-shadow':'rgba(255,158,109,0.45)','--tile-hot-color':'#FFF0E8'},
  obsidian:{'--col-bg':'#050608','--col-border':'#2E333D','--col-active-bg':'#0D1015','--col-active-border':'#B8C1CC','--col-correct-bg':'#08130E','--col-correct-border':'#9DE2B0','--tile-hot-bg':'linear-gradient(160deg,#11151B,#1A2028)','--tile-hot-border':'#C9D1D9','--tile-hot-shadow':'rgba(201,209,217,0.35)','--tile-hot-color':'#F5F7FA'},
  parchment:{'--col-bg':'#1A160D','--col-border':'#6B5734','--col-active-bg':'#241E12','--col-active-border':'#D4B870','--col-correct-bg':'#1B2110','--col-correct-border':'#C7E28B','--tile-hot-bg':'linear-gradient(160deg,#4E4128,#6C5A36)','--tile-hot-border':'#D4B870','--tile-hot-shadow':'rgba(212,184,112,0.35)','--tile-hot-color':'#FFF6DC'},
  aurora:{ '--col-bg':'#06111A','--col-border':'#204B57','--col-active-bg':'#0A1B28','--col-active-border':'#6CF0C2','--col-correct-bg':'#08151A','--col-correct-border':'#D5A6FF','--tile-hot-bg':'linear-gradient(160deg,#10304A,#2A1B4F)','--tile-hot-border':'#6CF0C2','--tile-hot-shadow':'rgba(108,240,194,0.42)','--tile-hot-color':'#F2FFFD'},
  herohighway:{ '--col-bg':'#05070E','--col-border':'#2A314B','--col-active-bg':'#101728','--col-active-border':'#FFD93B','--col-correct-bg':'#101524','--col-correct-border':'#FFFFFF','--tile-hot-bg':'linear-gradient(180deg,#1B1E29,#07080C)','--tile-hot-border':'#FF3B3B','--tile-hot-shadow':'rgba(255,59,59,0.42)','--tile-hot-color':'#FFFFFF'},
  katamari:{ '--col-bg':'#2D0B4F','--col-border':'#FF8ED1','--col-active-bg':'#522B9B','--col-active-border':'#FFF39A','--col-correct-bg':'#1D6A40','--col-correct-border':'#A7FF92','--tile-hot-bg':'linear-gradient(160deg,#63F07B,#FF7BC4,#FFE75E)','--tile-hot-border':'#FFFFFF','--tile-hot-shadow':'rgba(255,255,255,0.42)','--tile-hot-color':'#16244F'},
  darksouls:{ '--col-bg':'#0A0807','--col-border':'#4C3727','--col-active-bg':'#1C130E','--col-active-border':'#B87143','--col-correct-bg':'#18100B','--col-correct-border':'#D5A16F','--tile-hot-bg':'linear-gradient(160deg,#2E1B10,#140D09)','--tile-hot-border':'#B36A3A','--tile-hot-shadow':'rgba(179,106,58,0.34)','--tile-hot-color':'#F3E7D7'},
  manuscript:{'--col-bg':'#1A1508','--col-border':'#6B5020','--col-active-bg':'#2A2010','--col-active-border':'#D4A820','--col-correct-bg':'#181808','--col-correct-border':'#C8E880','--tile-hot-bg':'linear-gradient(160deg,#4A3010,#7A5020)','--tile-hot-border':'#F0C840','--tile-hot-shadow':'rgba(240,200,64,0.5)','--tile-hot-color':'#FFF8E0'},
  irongold:{'--col-bg':'#0A0A08','--col-border':'#3A3020','--col-active-bg':'#181810','--col-active-border':'#C8A020','--col-correct-bg':'#101008','--col-correct-border':'#D8C060','--tile-hot-bg':'linear-gradient(160deg,#2A2814,#1A1A0E)','--tile-hot-border':'#C8A020','--tile-hot-shadow':'rgba(200,160,32,0.45)','--tile-hot-color':'#F8F0D0'},
  lightindarkness:{'--col-bg':'#040402','--col-border':'#1A1400','--col-active-bg':'#0A0802','--col-active-border':'#C8A020','--col-correct-bg':'#040404','--col-correct-border':'#FFE060','--tile-hot-bg':'linear-gradient(160deg,#000000,#1A1000)','--tile-hot-border':'#FFD700','--tile-hot-shadow':'rgba(255,215,0,0.7)','--tile-hot-color':'#FFFFF0'},
  nyan:{'--col-bg':'#FF8EC8','--col-border':'#FF5BAD','--col-active-bg':'#FFC2E0','--col-active-border':'#FFFF00','--col-correct-bg':'#C8FFD4','--col-correct-border':'#00FF88','--tile-hot-bg':'linear-gradient(160deg,#FF5BAD,#FF8EC8)','--tile-hot-border':'#FFFF00','--tile-hot-shadow':'rgba(255,255,0,0.6)','--tile-hot-color':'#FFFFFF'},
  gryffindor:{'--col-bg':'#1A0500','--col-border':'#7A0E00','--col-active-bg':'#2A0800','--col-active-border':'#C9232D','--col-correct-bg':'#1A1200','--col-correct-border':'#FFC300','--tile-hot-bg':'linear-gradient(160deg,#7A0E00,#C9232D)','--tile-hot-border':'#FFC300','--tile-hot-shadow':'rgba(255,195,0,0.5)','--tile-hot-color':'#FFF5CC'},
  slytherin:{'--col-bg':'#020A02','--col-border':'#1A4A1A','--col-active-bg':'#051005','--col-active-border':'#2D9E2D','--col-correct-bg':'#001A10','--col-correct-border':'#72E872','--tile-hot-bg':'linear-gradient(160deg,#0A2A0A,#1A5A1A)','--tile-hot-border':'#7AFF7A','--tile-hot-shadow':'rgba(122,255,122,0.4)','--tile-hot-color':'#C0D8C0'},
  ravenclaw:{'--col-bg':'#020410','--col-border':'#0D1A5C','--col-active-bg':'#040824','--col-active-border':'#4169E1','--col-correct-bg':'#0A0A18','--col-correct-border':'#B8A020','--tile-hot-bg':'linear-gradient(160deg,#0D1A5C,#1A2E9E)','--tile-hot-border':'#B8A020','--tile-hot-shadow':'rgba(184,160,32,0.5)','--tile-hot-color':'#D8E4FF'},
  hufflepuff:{'--col-bg':'#0E0C00','--col-border':'#4A3A00','--col-active-bg':'#1A1600','--col-active-border':'#E8B000','--col-correct-bg':'#18180A','--col-correct-border':'#C8C8C8','--tile-hot-bg':'linear-gradient(160deg,#4A3A00,#7A6000)','--tile-hot-border':'#E8B000','--tile-hot-shadow':'rgba(232,176,0,0.5)','--tile-hot-color':'#FFF8D8'},
  shire:{'--col-bg':'#051200','--col-border':'#1A4400','--col-active-bg':'#0A2000','--col-active-border':'#5CB85C','--col-correct-bg':'#0A1A05','--col-correct-border':'#A8D860','--tile-hot-bg':'linear-gradient(160deg,#1A3A00,#2E5A0A)','--tile-hot-border':'#8BC34A','--tile-hot-shadow':'rgba(139,195,74,0.5)','--tile-hot-color':'#F0FFD8'},
  rivendell:{'--col-bg':'#060B12','--col-border':'#1C3A5A','--col-active-bg':'#0A1824','--col-active-border':'#7EB8D8','--col-correct-bg':'#060E0A','--col-correct-border':'#A8E0C0','--tile-hot-bg':'linear-gradient(160deg,#1C3A5A,#2A5A82)','--tile-hot-border':'#B8D8F0','--tile-hot-shadow':'rgba(184,216,240,0.45)','--tile-hot-color':'#F0F8FF'},
  mordor:{'--col-bg':'#0A0500','--col-border':'#3A1400','--col-active-bg':'#180800','--col-active-border':'#CC3300','--col-correct-bg':'#0A0800','--col-correct-border':'#886622','--tile-hot-bg':'linear-gradient(160deg,#3A1400,#6A2200)','--tile-hot-border':'#FF4400','--tile-hot-shadow':'rgba(255,68,0,0.5)','--tile-hot-color':'#FFD8B0'},
  galaga:{ '--col-bg':'#09133D','--col-border':'#27479C','--col-active-bg':'#152563','--col-active-border':'#7CEBFF','--col-correct-bg':'#16235E','--col-correct-border':'#FFE54A','--tile-hot-bg':'linear-gradient(180deg,#4C72FF,#1C2F7A)','--tile-hot-border':'#FF5FD1','--tile-hot-shadow':'rgba(255,95,209,0.42)','--tile-hot-color':'#FFFFFF'},
};

const SKIN_CLASS_MAP={herohighway:'gh-skin',katamari:'katamari-skin',darksouls:'darksouls-skin',galaga:'galaga-skin',nyan:'nyan-skin'};

function currentEquippedSkin(){return G&&G.equipped?G.equipped.skin:null;}

function applySkin(skinVal){
  const root=document.documentElement;
  Object.values(SKIN_CLASS_MAP).forEach(cls=>document.body.classList.remove(cls));
  ['--col-bg','--col-border','--col-active-bg','--col-active-border','--col-correct-bg','--col-correct-border','--tile-hot-bg','--tile-hot-border','--tile-hot-shadow','--tile-hot-color'].forEach(k=>root.style.removeProperty(k));
  const vars=SKIN_VARS[skinVal];
  if(vars)Object.entries(vars).forEach(([k,v])=>root.style.setProperty(k,v));
  const cls=SKIN_CLASS_MAP[skinVal];
  if(cls)document.body.classList.add(cls);
  syncFailOverlayTheme();
  syncGalagaShip(true);
}

function syncFailOverlayTheme(){
  const title=document.getElementById('fg-fail-title');
  const icon=document.getElementById('fg-fail-icon');
  if(!title||!icon)return;
  if(currentEquippedSkin()==='darksouls'){
    title.textContent='YOU DIED';
    title.style.color='#9C2B24';
    icon.textContent='';
    icon.style.display='none';
  }else{
    title.textContent='Out of Hearts';
    title.style.color='#FF8A80';
    icon.textContent='\ud83d\udc94';
    icon.style.display='block';
  }
}

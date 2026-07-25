// ════════════════════════════════════════════════════
// SHOP PACK DEFINITIONS
// ════════════════════════════════════════════════════

const ITEMS=[
  // instruments
  {id:'i_piano',type:'instrument',name:'Piano',icon:'\ud83c\udfb9',rarity:'uncommon',desc:'Warm piano tones with harmonic overtones.',val:'piano',dustVal:8},
  {id:'i_organ',type:'instrument',name:'Organ',icon:'\ud83c\udfb9',rarity:'uncommon',desc:'Rich organ with harmonics.',val:'organ',dustVal:8},
  {id:'i_saxophone',type:'instrument',name:'Saxophone',icon:'\ud83c\udfb7',rarity:'rare',desc:'FM-synthesized saxophone warmth.',val:'saxophone',dustVal:15},
  {id:'i_chords',type:'instrument',name:'Chords',icon:'\ud83c\udfb5',rarity:'uncommon',desc:'Full major chord voicings.',val:'chords',dustVal:10},
  {id:'i_amen',type:'instrument',name:'Amen Break',icon:'\ud83e\udd41',rarity:'legendary',desc:'Classic breakbeat + pitch. Fire.',val:'amen',dustVal:40,unlock:{collectionId:'john',tier:'miniboss3'}},
  {id:'i_pluck',type:'instrument',name:'Pluck',icon:'\ud83e\ude95',rarity:'common',desc:'Clean plucked string sound.',val:'pluck',dustVal:5},
  {id:'i_bell',type:'instrument',name:'Bell',icon:'\ud83d\udd14',rarity:'uncommon',desc:'Bright inharmonic bell partials.',val:'bell',dustVal:8},
  {id:'i_bass',type:'instrument',name:'Bass',icon:'\ud83c\udfb8',rarity:'common',desc:'Deep electric bass.',val:'bass',dustVal:5},
  {id:'i_flute',type:'instrument',name:'Flute',icon:'\ud83e\ude88',rarity:'rare',desc:'Breathy flute with vibrato.',val:'flute',dustVal:15},
  {id:'i_marimba',type:'instrument',name:'Marimba',icon:'\ud83e\udeb5',rarity:'uncommon',desc:'Wooden marimba resonance.',val:'marimba',dustVal:8},
  {id:'i_violin',type:'instrument',name:'Violin',icon:'\ud83c\udfbb',rarity:'rare',desc:'Bowed violin with slow attack.',val:'violin',dustVal:15,unlock:{collectionId:'noblemen',tier:'miniboss2'}},
  {id:'i_celesta',type:'instrument',name:'Celesta',icon:'\ud83c\udf80',rarity:'legendary',desc:'Magical celesta shimmer.',val:'celesta',dustVal:40,unlock:{collectionId:'john',tier:'boss'}},
  {id:'i_katamari',type:'instrument',name:'Katamari Pop',icon:'\ud83d\udfe2',rarity:'legendary',desc:'Toy-box synth pops with a wobbling cosmic grin.',val:'katamari',dustVal:40,unlock:{collectionId:'prestige',tier:'prestige'}},
  // scales / patterns
  {id:'s_pentatonic',type:'scale',name:'Pentatonic',icon:'\ud83c\udf38',rarity:'common',desc:'5-note scale. Always sounds good.',val:'pentatonic',dustVal:5},
  {id:'s_blues',type:'scale',name:'Blues Scale',icon:'\ud83c\udfb6',rarity:'uncommon',desc:'Soulful blue notes.',val:'blues',dustVal:8},
  {id:'s_dorian',type:'scale',name:'Dorian Mode',icon:'\ud83d\udd4c',rarity:'uncommon',desc:'Minor with a raised 6th. Jazz-flavored.',val:'dorian',dustVal:8},
  {id:'s_chromatic',type:'scale',name:'Chromatic',icon:'\ud83c\udf08',rarity:'rare',desc:'All 12 semitones. Chaotic beauty.',val:'chromatic',dustVal:12},
  {id:'s_arpeggio',type:'scale',name:'Arpeggio',icon:'\u2728',rarity:'common',desc:'Ascending chord tones.',val:'arpeggio',dustVal:5},
  {id:'s_mixolydian',type:'scale',name:'Mixolydian',icon:'\ud83c\udf24\ufe0f',rarity:'uncommon',desc:'Major mode with a flat 7 for open, anthemic motion.',val:'mixolydian',dustVal:8},
  {id:'s_lydian',type:'scale',name:'Lydian',icon:'\u2600\ufe0f',rarity:'rare',desc:'Floating major mode with a bright raised 4.',val:'lydian',dustVal:12},
  {id:'s_phrygian',type:'scale',name:'Phrygian',icon:'\ud83e\udd82',rarity:'uncommon',desc:'Dark mode with a lowered 2 for tense motion.',val:'phrygian',dustVal:8},
  {id:'s_harmonicminor',type:'scale',name:'Harmonic Minor',icon:'\ud83d\udd6f\ufe0f',rarity:'rare',desc:'Minor scale with a dramatic raised 7.',val:'harmonicminor',dustVal:12},
  {id:'s_wholetone',type:'scale',name:'Whole Tone',icon:'\ud83c\udf00',rarity:'rare',desc:'Dreamy equal-step color across the keyboard.',val:'wholetone',dustVal:12},
  {id:'s_fifths',type:'scale',name:'Fifths Pattern',icon:'\u26ea',rarity:'common',desc:'Leaping fifths for bold call-and-response runs.',val:'fifths',dustVal:5},
  {id:'s_octaves',type:'scale',name:'Octave Jumps',icon:'\ud83d\ude80',rarity:'common',desc:'Punchy octave skips that feel instantly bigger.',val:'octaves',dustVal:5},
  {id:'s_gospel',type:'scale',name:'Gospel Steps',icon:'\ud83d\ude4c',rarity:'rare',desc:'A warm 1-5-6-4 flavored melodic pattern.',val:'gospel',dustVal:12,unlock:{collectionId:'john',tier:'miniboss2'}},
  {id:'s_katamariroll',type:'scale',name:'Katamari Roll',icon:'\ud83c\udf08',rarity:'legendary',desc:'Bouncy toy-town leaps that keep rolling upward.',val:'katamariroll',dustVal:40,unlock:{collectionId:'prestige',tier:'prestige'}},
  {id:'s_giantsteps',type:'scale',name:'Giant Steps',icon:'\ud83c\udfba',rarity:'legendary',desc:"Coltrane's Giant Steps melody line.",val:'giantsteps',dustVal:40,unlock:{collectionId:'john',tier:'boss'}},
  // commentary
  {id:'c_john114',type:"commentary",name:'On John 1:14',icon:'\ud83d\udcdc',rarity:'uncommon',desc:"The Word became flesh \u2014 the Incarnation is the pivot of all history. The Greek skenoo (dwelt) echoes the Tabernacle of Exodus.",dustVal:8},
  {id:'c_john316',type:"commentary",name:'On John 3:16',icon:'\u2764\ufe0f',rarity:'common',desc:"The most-memorized verse. World (kosmos) here means fallen humanity in its rebellion \u2014 God loves even that.",dustVal:5},
  {id:'c_john_7_38',type:"commentary",name:'On John 7:38',icon:'\ud83d\udca7',rarity:'rare',desc:"Jesus speaks on the last day of Sukkot, when priests poured water at the Temple altar. His timing was intentional.",dustVal:12},
  {id:'c_giantsteps',type:"commentary",name:'Coltrane & Scripture',icon:'\ud83c\udfba',rarity:'legendary',desc:"Coltrane named his masterpiece after the large intervals in creation. Many scholars note his deep interest in the Psalms.",dustVal:40},
  {id:'c_john129',type:"commentary",name:'On John 1:29',icon:'\ud83d\udc11',rarity:'common',desc:"Lamb of God draws on the Passover lamb (Ex. 12) and Isaiah 53. John the Baptist identifies Jesus as the one sacrifice that ends all sacrifices.",dustVal:5},
  {id:'c_john14546',type:"commentary",name:'On John 1:45-46',icon:'\ud83d\uddfa\ufe0f',rarity:'common',desc:"Nazareth carried no prophetic prestige. Philip replies to doubt with invitation not argument: Come and see \u2014 the posture of all Christian witness.",dustVal:5},
  {id:'c_john33',type:"commentary",name:'On John 3:3',icon:'\ud83c\udf31',rarity:'common',desc:"Born again (or from above) is anothen in Greek \u2014 deliberately ambiguous. Nicodemus hears it one way; Jesus means the other. New birth is entirely God's initiative.",dustVal:5},
  {id:'c_john31617',type:"commentary",name:'On John 3:16-17',icon:'\ud83c\udf0d',rarity:'uncommon',desc:"Verse 16 states the motive (love), the means (the Son), and the result (eternal life). Verse 17 guards against misreading: the mission is rescue, not condemnation.",dustVal:8},
  {id:'c_john434',type:"commentary",name:'On John 4:34',icon:'\ud83c\udf3e',rarity:'common',desc:"Jesus reframes hunger itself. His nourishment is obedience \u2014 doing the Father's will is not duty but sustenance. This follows his conversation at the well.",dustVal:5},
  {id:'c_john524',type:"commentary",name:'On John 5:24',icon:'\u2696\ufe0f',rarity:'uncommon',desc:"Has passed from death to life is a perfect tense \u2014 a completed action with ongoing results. The believer's judgment is already settled; there is no second trial.",dustVal:8},
  {id:'c_john66869',type:"commentary",name:'On John 6:68-69',icon:'\ud83e\udea8',rarity:'common',desc:"Peter's confession here follows mass desertion. Where else would we go? is the faith of exhaustion: Jesus is the only option, and that turns out to be enough.",dustVal:5},
  {id:'c_john812',type:"commentary",name:'On John 8:12',icon:'\ud83d\udca1',rarity:'uncommon',desc:"Light of the world is spoken at Tabernacles, when massive lampstands blazed in the temple courts. Jesus claims to be what those flames only pointed toward.",dustVal:8},
  {id:'c_john101011',type:"commentary",name:'On John 10:10-11',icon:'\ud83d\udc3a',rarity:'uncommon',desc:"The contrast is stark: the thief destroys; the shepherd gives abundance. Perissos means surplus, overflow \u2014 life beyond what is merely sufficient.",dustVal:8},
  {id:'c_john102728',type:"commentary",name:'On John 10:27-28',icon:'\u270b',rarity:'common',desc:"No one will snatch them out of my hand \u2014 and then Jesus adds the Father's hand (v.29). The sheep are doubly secured. Security rests on the shepherd's grip, not the sheep's.",dustVal:5},
  {id:'c_john1125',type:"commentary",name:'On John 11:25',icon:'\ud83e\udea6',rarity:'uncommon',desc:"Martha expects resurrection at the end of history. Jesus reframes it: resurrection is a Person standing in front of her. The event she waits for is already present.",dustVal:8},
  {id:'c_john12_2425',type:"commentary",name:'On John 12:24-25',icon:'\ud83c\udf3e',rarity:'common',desc:"The grain of wheat parables the cross \u2014 death as the precondition of fruitfulness. The paradox of losing life to keep it overturns every instinct of self-preservation.",dustVal:5},
  {id:'c_john1232',type:"commentary",name:'On John 12:32',icon:'\u271d\ufe0f',rarity:'rare',desc:"Lifted up is John's double meaning: crucifixion and exaltation at once. The cross is not a defeat before the victory \u2014 it is the victory.",dustVal:12},
  {id:'c_john133435',type:"commentary",name:'On John 13:34-35',icon:'\ud83e\udd1d',rarity:'uncommon',desc:"The commandment is new not in content (Lev. 19) but in standard: as I have loved you. The measure of Christian love is the cross \u2014 a bar no one reaches without grace.",dustVal:8},
  {id:'c_john155',type:"commentary",name:'On John 15:5',icon:'\ud83c\udf47',rarity:'common',desc:"Apart from me you can do nothing \u2014 not less, not little, but nothing. The vine makes dependency structural, not optional. Fruitfulness is a symptom of abiding.",dustVal:5},
  {id:'c_john151213',type:"commentary",name:'On John 15:12-13',icon:'\ud83e\udec2',rarity:'uncommon',desc:"Greater love has no one than this \u2014 Jesus defines the ceiling of love as death, then immediately goes and does it. The command and the example arrive together.",dustVal:8},
  {id:'c_john1633',type:"commentary",name:'On John 16:33',icon:'\u2693',rarity:'common',desc:"I have overcome the world is spoken before the cross, in the present perfect tense. Jesus speaks of a victory not yet visible as already accomplished. Faith lives in that gap.",dustVal:5},
  {id:'c_john172223',type:"commentary",name:'On John 17:22-23',icon:'\ud83d\udd4a\ufe0f',rarity:'rare',desc:"The unity Jesus prays for is patterned on Trinitarian union \u2014 not mere cooperation but shared glory. The purpose is missional: that the world may know.",dustVal:12},
  {id:'c_john2031',type:"commentary",name:'On John 20:31',icon:'\ud83d\udcd6',rarity:'common',desc:"John states his purpose: these signs are written to produce belief. The Gospel is not biography \u2014 it is testimony shaped for conversion. Every selection is intentional.",dustVal:5},
  // skins
  {id:'sk_gold',type:'skin',name:'Gold Theme',icon:'\ud83d\udc51',rarity:'rare',desc:'Bright golden column tiles.',val:'gold',dustVal:8},
  {id:'sk_purple',type:'skin',name:'Royal Purple',icon:'\ud83d\udd2e',rarity:'legendary',desc:'Deep purple illuminated tiles.',val:'purple',dustVal:15},
  {id:'sk_fire',type:'skin',name:'Fire',icon:'\ud83d\udd25',rarity:'legendary',desc:'Burning orange columns.',val:'fire',dustVal:15},
  {id:'sk_ice',type:'skin',name:'Ice',icon:'\u2744\ufe0f',rarity:'legendary',desc:'Arctic blue crystalline tiles.',val:'ice',dustVal:40},
  {id:'sk_neon',type:'skin',name:'Neon',icon:'\ud83c\udf1f',rarity:'legendary',desc:'Electric neon green on black.',val:'neon',dustVal:15},
  {id:'sk_ocean',type:'skin',name:'Ocean',icon:'\ud83c\udf0a',rarity:'rare',desc:'Deep teal ocean tiles.',val:'ocean',dustVal:10},
  {id:'sk_midnight',type:'skin',name:'Midnight',icon:'\ud83c\udf19',rarity:'rare',desc:'Indigo and silver night sky.',val:'midnight',dustVal:10},
  {id:'sk_rose',type:'skin',name:'Rose Gold',icon:'\ud83c\udf39',rarity:'legendary',desc:'Warm rose gold shimmer.',val:'rose',dustVal:15},
  {id:'sk_forest',type:'skin',name:'Forest',icon:'\ud83c\udf3f',rarity:'rare',desc:'Deep emerald greens.',val:'forest',dustVal:10},
  {id:'sk_sunset',type:'skin',name:'Sunset',icon:'\ud83c\udf05',rarity:'rare',desc:'Amber, coral, and dusk-purple columns.',val:'sunset',dustVal:15},
  {id:'sk_obsidian',type:'skin',name:'Obsidian',icon:'\ud83d\udda4',rarity:'uncommon',desc:'Black glass with silver highlights.',val:'obsidian',dustVal:10},
  {id:'sk_parchment',type:'skin',name:'Parchment',icon:'\ud83d\udcdc',rarity:'common',desc:'Warm ivory and sepia manuscript tones.',val:'parchment',dustVal:5,unlock:{collectionId:'john',tier:'miniboss1'}},
  {id:'sk_aurora',type:'skin',name:'Aurora',icon:'\ud83c\udf0c',rarity:'legendary',desc:'Northern-light greens and violets.',val:'aurora',dustVal:40},
  {id:'sk_herohighway',type:'skin',name:'Hero Highway',icon:'\ud83c\udfb8',rarity:'legendary',desc:'Arcade highway HUD with neon frets and stage lights.',val:'herohighway',dustVal:40,unlock:{collectionId:'noblemen',tier:'miniboss1'}},
  {id:'sk_katamari',type:'skin',name:'Katamari Cosmos',icon:'\ud83d\udfe2',rarity:'legendary',desc:'Candy-cosmic lanes with bright toybox energy.',val:'katamari',dustVal:40,unlock:{collectionId:'prestige',tier:'prestige'}},
  {id:'sk_manuscript',type:'skin',name:'Illuminated Manuscript',icon:'\ud83d\udcd6',rarity:'legendary',desc:'Warm vellum with gold-leaf illuminations.',val:'manuscript',dustVal:40,unlock:{collectionId:'john',tier:'boss'}},
  {id:'sk_irongold',type:'skin',name:'Iron & Gold',icon:'\u2694\ufe0f',rarity:'legendary',desc:'Dark iron with burnished gold. Noble things. Noble stands.',val:'irongold',dustVal:40,unlock:{collectionId:'noblemen',tier:'boss'}},
  {id:'i_clay',type:'instrument',name:'Clay Vessel',icon:'\ud83c\udffa',rarity:'rare',desc:'Earthy plucked tone. Treasure in jars of clay.',val:'clay',dustVal:15,unlock:{collectionId:'2cor4',tier:'miniboss1'}},
  {id:'sk_lightindarkness',type:'skin',name:'Light in Darkness',icon:'\ud83d\udca1',rarity:'legendary',desc:'Pitch black with a single crack of gold light. 2 Cor 4:6.',val:'lightindarkness',dustVal:40,unlock:{collectionId:'2cor4',tier:'boss'}},
  {id:'s_heartbeat',type:'scale',name:'Heartbeat',icon:'\u2764\ufe0f',rarity:'legendary',desc:'Rhythmic dotted pattern. Renewed day by day.',val:'heartbeat',dustVal:40,unlock:{collectionId:'prestige',tier:'prestige'}},
  {id:'sk_darksouls',type:'skin',name:'Ashen Hollow',icon:'\u2694\ufe0f',rarity:'legendary',desc:'Ash, ember, and a death screen that says YOU DIED.',val:'darksouls',dustVal:40,unlock:{collectionId:'prestige',tier:'prestige'}},
  {id:'sk_galaga',type:'skin',name:'Galaga Run',icon:'\ud83d\ude80',rarity:'legendary',desc:'Starfield lanes, a player ship, and laser shots at the tiles.',val:'galaga',dustVal:40,unlock:{collectionId:'prestige',tier:'prestige'}},
  {id:'i_katamarina',type:'instrument',name:'Katamari Na',icon:'\ud83d\udfe1',rarity:'legendary',desc:'Nasal N that blooms into a bright A vowel. The cosmos is calling.',val:'katamarina',dustVal:40,unlock:{collectionId:'prestige',tier:'prestige'}},
  {id:'i_nyan',type:'instrument',name:'Nyan',icon:'\ud83c\udf08',rarity:'legendary',desc:'8-bit chiptune square wave with a rainbow shimmer. Poptart not included.',val:'nyan',dustVal:40,unlock:{collectionId:'prestige',tier:'prestige'}},
  {id:'s_nyancat',type:'scale',name:'Nyan Cat',icon:'\ud83c\udf08',rarity:'legendary',desc:'The iconic Nyan Cat loop in F major. Pop-tart melody guaranteed.',val:'nyancat',dustVal:40,unlock:{collectionId:'prestige',tier:'prestige'}},
  {id:'s_superbowl',type:'scale',name:'Super Bowl',icon:'\ud83c\udfc8',rarity:'rare',desc:'Triumphant brass fanfare. You earned this one.',val:'superbowl',dustVal:15,unlock:{collectionId:'noblemen',tier:'miniboss3'}},
  {id:'s_halftime',type:'scale',name:'Halftime',icon:'\ud83c\udfa4',rarity:'rare',desc:'Big-stage pop energy. Punchy, stepwise, built for the moment.',val:'halftime',dustVal:15,unlock:{collectionId:'noblemen',tier:'boss'}},
  {id:'s_hedwigs',type:'scale',name:"Hedwig's Theme",icon:'\ud83e\udd89',rarity:'legendary',desc:"John Williams' iconic minor-6th melody from Harry Potter.",val:'hedwigs',dustVal:40},
  {id:'s_hogwarts',type:'scale',name:'Hogwarts',icon:'\ud83c\udff0',rarity:'rare',desc:'Sweeping orchestral Dorian mode. Wide leaps, grand halls.',val:'hogwarts',dustVal:15},
  {id:'s_shire',type:'scale',name:'The Shire',icon:'\ud83c\udf3f',rarity:'rare',desc:'Gentle pastoral pentatonic from the rolling hills of the Shire.',val:'shire',dustVal:15},
  {id:'s_rivendell',type:'scale',name:'Rivendell',icon:'\ud83c\udf0a',rarity:'rare',desc:'Ethereal Lydian mode. Open, timeless, and elven.',val:'rivendell',dustVal:15,unlock:{collectionId:'2cor4',tier:'miniboss2'}},
  {id:'s_mordor',type:'scale',name:'Mordor',icon:'\ud83c\udf0b',rarity:'rare',desc:'Dark Phrygian dominant. Heavy descending lines. One scale to rule them all.',val:'mordor',dustVal:15,unlock:{collectionId:'2cor4',tier:'miniboss3'}},
  {id:'sk_nyan',type:'skin',name:'Nyan Cat',icon:'\ud83c\udf08',rarity:'legendary',desc:'Rainbow starfield, pink tiles, and chiptune energy. NYANYANYANYA.',val:'nyan',dustVal:40,unlock:{collectionId:'prestige',tier:'prestige'}},
  {id:'sk_gryffindor',type:'skin',name:'Gryffindor',icon:'\ud83e\udd81',rarity:'rare',desc:'Scarlet and gold. Brave enough to memorize the whole chapter.',val:'gryffindor',dustVal:15},
  {id:'sk_slytherin',type:'skin',name:'Slytherin',icon:'\ud83d\udc0d',rarity:'rare',desc:'Deep green and silver. Ambition applied to Scripture.',val:'slytherin',dustVal:15},
  {id:'sk_ravenclaw',type:'skin',name:'Ravenclaw',icon:'\ud83e\udd85',rarity:'rare',desc:'Royal blue and bronze. Wit and wisdom in every word.',val:'ravenclaw',dustVal:15},
  {id:'sk_hufflepuff',type:'skin',name:'Hufflepuff',icon:'\ud83e\udda1',rarity:'rare',desc:'Yellow and black. Patient, loyal, and relentlessly thorough.',val:'hufflepuff',dustVal:15},
  {id:'sk_shire',type:'skin',name:'The Shire',icon:'\ud83c\udf3f',rarity:'uncommon',desc:'Warm greens and earth tones. Home is where the Word is.',val:'shire',dustVal:10},
  {id:'sk_rivendell',type:'skin',name:'Rivendell',icon:'\ud83c\udf0a',rarity:'rare',desc:'Silver mist and elven blue. Serene and ancient.',val:'rivendell',dustVal:15,unlock:{collectionId:'2cor4',tier:'miniboss1'}},
  {id:'sk_mordor',type:'skin',name:'Mordor',icon:'\ud83c\udf0b',rarity:'legendary',desc:'Ash, ember, and volcanic shadow. The dark lord memorizes too.',val:'mordor',dustVal:40,unlock:{collectionId:'2cor4',tier:'boss'}},
  // \u2500\u2500 B1: the100 collection unlock-gated items (miniboss2 through boss) \u2500\u2500
  {id:'sk_stainedglass',type:'skin',name:'Stained Glass',icon:'\ud83c\udfdb\ufe0f',rarity:'legendary',desc:'Cathedral hues: deep cobalt, crimson, and amber light fracturing through the tiles.',val:'stainedglass',dustVal:40,unlock:{collectionId:'the100',tier:'miniboss2'}},
  {id:'sk_olivegrove',type:'skin',name:'Olive Grove',icon:'\ud83c\udf3f',rarity:'rare',desc:'Silver-green leaves, warm sienna earth. The garden before the dawn.',val:'olivegrove',dustVal:15,unlock:{collectionId:'the100',tier:'miniboss4'}},
  {id:'sk_mountsinai',type:'skin',name:'Mount Sinai',icon:'\u26a1',rarity:'legendary',desc:'Storm grey and lightning gold. The mountain that cannot be touched.',val:'mountsinai',dustVal:40,unlock:{collectionId:'the100',tier:'miniboss6'}},
  {id:'sk_jordanriver',type:'skin',name:'Jordan River',icon:'\ud83c\udf0a',rarity:'rare',desc:'River-blue and riverside stone. Where old things pass and new things begin.',val:'jordanriver',dustVal:15,unlock:{collectionId:'the100',tier:'miniboss8'}},
  {id:'sk_lilyvalley',type:'skin',name:'Lily of the Valley',icon:'\ud83c\udff5\ufe0f',rarity:'rare',desc:'White and pale green on deep garden shadow. Arrayed better than Solomon.',val:'lilyvalley',dustVal:15,unlock:{collectionId:'the100',tier:'miniboss10'}},
  {id:'sk_alabaster',type:'skin',name:'Alabaster',icon:'\ud83e\uded6',rarity:'rare',desc:'Warm ivory veined with gold. Poured out without reservation.',val:'alabaster',dustVal:15,unlock:{collectionId:'the100',tier:'miniboss12'}},
  {id:'i_harp',type:'instrument',name:'Harp',icon:'\ud83c\udfb5',rarity:'rare',desc:'Soft plucked warmth, long ringing release. A new song to the Lord.',val:'harp',dustVal:15,unlock:{collectionId:'the100',tier:'miniboss14'}},
  {id:'i_musicbox',type:'instrument',name:'Music Box',icon:'\ud83c\udf80',rarity:'rare',desc:'Bright tinkly sine partials with inharmonic shimmer.',val:'musicbox',dustVal:15,unlock:{collectionId:'the100',tier:'miniboss16'}},
  {id:'i_choir',type:'instrument',name:'Choir',icon:'\ud83c\udfc6',rarity:'legendary',desc:'Layered detuned voices through formant filters \u2014 an "aah" vowel pad from beyond the veil.',val:'choir',dustVal:40,unlock:{collectionId:'the100',tier:'boss'}},
  // \u2500\u2500 B2: new skins (shop pool \u2014 no unlock gate) \u2500\u2500
  {id:'sk_morningstar',type:'skin',name:'Morning Star',icon:'\u2b50',rarity:'legendary',desc:'Deep midnight with a single blazing point of gold. Bright and morning star.',val:'morningstar',dustVal:40},
  {id:'sk_pomegranate',type:'skin',name:'Pomegranate',icon:'\ud83c\udf4e',rarity:'rare',desc:'Deep crimson and seed-gold. 613 seeds for 613 commandments.',val:'pomegranate',dustVal:15},
  {id:'sk_cedarlebanon',type:'skin',name:'Cedar of Lebanon',icon:'\ud83c\udf32',rarity:'rare',desc:'Rich cedar-red and forest-green. Built for glory, enduring as the Word.',val:'cedarlebanon',dustVal:15},
  {id:'sk_thedeep',type:'skin',name:'The Deep',icon:'\ud83c\udf0a',rarity:'legendary',desc:'Abyssal navy with bioluminescent teal. The Spirit moved over the face of the waters.',val:'thedeep',dustVal:40},
  // \u2500\u2500 B4: hymn melody scales (shop pool) \u2500\u2500
  {id:'s_odejoy',type:'scale',name:'Ode to Joy',icon:'\ud83c\udfbb',rarity:'rare',desc:"Beethoven's Ninth, the hymn of all nations. A single melody that changed the world.",val:'odejoy',dustVal:15},
  {id:'s_amazinggrace',type:'scale',name:'Amazing Grace',icon:'\ud83d\udc4b',rarity:'uncommon',desc:"John Newton's 3/4 hymn of undeserved rescue. Once lost, now found.",val:'amazinggrace',dustVal:8},
  {id:'s_doxology',type:'scale',name:'Doxology',icon:'\u2605',rarity:'rare',desc:'Old 100th. Praise God from whom all blessings flow \u2014 the oldest congregational melody still in use.',val:'doxology',dustVal:15,unlock:{collectionId:'the100',tier:'miniboss2'}},
  {id:'s_holyholy',type:'scale',name:'Holy Holy Holy',icon:'\ud83d\udd4c',rarity:'rare',desc:"Nicaea hymn. Heber's Trinitarian text set to Dykes' ascending melody.",val:'holyholy',dustVal:15},
  {id:'s_bethoumyvision',type:'scale',name:'Be Thou My Vision',icon:'\ud83d\udc41\ufe0f',rarity:'rare',desc:"Irish hymn (Slane), 8th-century text. The oldest complete Christian poem still sung today.",val:'bethoumyvision',dustVal:15,unlock:{collectionId:'the100',tier:'miniboss12'}},
  {id:'s_comethounfount',type:'scale',name:'Come Thou Fount',icon:'\ud83c\udf0a',rarity:'uncommon',desc:"Robert Robinson, 1758. Nettleton tune. 'Here I raise mine Ebenezer' \u2014 a stone of help.",val:'comethounfount',dustVal:8},
  // \u2500\u2500 B5: new commentary (12 items, Essentials verses) \u2500\u2500
  {id:'c_prov35',type:'commentary',name:'On Prov 3:5-6',icon:'\ud83e\udde0',rarity:'uncommon',desc:"Trust (batach) is a verb of resting one's full weight on a support. Lean not on your own understanding uses the Hebrew yashin \u2014 don't rely on understanding as a load-bearing wall. Acknowledge (yada) is the same word used for intimate knowledge; God directs the path of those who know him personally, not just theologically.",dustVal:8},
  {id:'c_jer2911',type:'commentary',name:'On Jer 29:11',icon:'\ud83d\udce8',rarity:'common',desc:"This promise was given to exiles in Babylon, not to comfortable believers. Plans for welfare translates shalom \u2014 not mere absence of harm, but comprehensive human flourishing. The time horizon is 70 years. God's intentions are future-oriented, but his methods run through suffering.",dustVal:5},
  {id:'c_rom828',type:'commentary',name:'On Rom 8:28',icon:'\u2699\ufe0f',rarity:'rare',desc:"All things work together (synergei) does not mean all things are good \u2014 it means they cooperate toward a single end. The qualifier is those who love God, those called according to his purpose. The verse is not a comfort for all people; it is a covenantal promise to a particular community whose story is being woven toward glory.",dustVal:12},
  {id:'c_phil46',type:'commentary',name:'On Phil 4:6-7',icon:'\u270f\ufe0f',rarity:'uncommon',desc:"Paul writes from prison. The command is not to feel peace but to present everything to God through prayer and thanksgiving \u2014 the act shifts the center of gravity. The peace that surpasses understanding (nous) stands guard over heart and mind as a military garrison protects a city. It is not an emotion; it is an installation.",dustVal:8},
  {id:'c_eph28',type:'commentary',name:'On Eph 2:8-10',icon:'\ud83c\udf81',rarity:'uncommon',desc:"Grace (charis) and faith are both presented as gifts, not achievements. Verse 9 rules out boasting; verse 10 immediately mandates good works \u2014 not as the ground of salvation but as its fruit. Created (ktisthentes) is the same root as ktisis (creation); Paul frames the believer's new identity as a new-creation event, not a moral renovation.",dustVal:8},
  {id:'c_isa4028',type:'commentary',name:'On Isa 40:28-31',icon:'\ud83e\udd85',rarity:'rare',desc:"The passage opens with a rhetorical question \u2014 Have you not known? \u2014 implying the audience has forgotten something they once knew. The word for Creator (bore) is used exclusively of God making from nothing. Those who wait (qavah) carries the sense of twisting together, like strands of rope under tension. Waiting is not passive; it is the active bearing of tension toward a fixed point.",dustVal:12},
  {id:'c_ps4610',type:'commentary',name:'On Ps 46:10',icon:'\ud83e\uddd8',rarity:'common',desc:"Be still (raphah) means to let go, to slacken, to drop. It is used elsewhere of hands going limp in defeat \u2014 God is calling for a ceasefire of striving. The context is international chaos (vv. 6-9), not personal quiet time. Knowing that God is God is not a mental state but a political declaration.",dustVal:5},
  {id:'c_mic68',type:'commentary',name:'On Mic 6:8',icon:'\u2696\ufe0f',rarity:'uncommon',desc:"Justice (mishpat), mercy (hesed), and humility (tsana) form a legal, relational, and posture triad. Hesed is the covenant-love of Hosea \u2014 it cannot be reduced to sentiment. Walk humbly uses a rare Hebrew word (tsana) that appears only here and in Prov 11:2; its flavor is quiet, unobtrusive faithfulness rather than dramatic displays.",dustVal:8},
  {id:'c_heb111',type:'commentary',name:'On Heb 11:1',icon:'\ud83c\udf31',rarity:'common',desc:"The Greek hypostasis (substance/assurance) was a legal term for a title deed \u2014 the document proving ownership of property not yet in hand. Elenchos (conviction) means proof or evidence used in argument. The writer is not offering a psychological definition of faith; he is describing faith as a mode of legal ownership over future realities and invisible ones.",dustVal:5},
  {id:'c_gal220',type:'commentary',name:'On Gal 2:20',icon:'\u271d\ufe0f',rarity:'rare',desc:"I have been crucified with Christ uses the Greek perfect tense: a past event with permanent results. The self that lived under the law died; the self that now lives does so inside the life of Another. The Son of God who loved me and gave himself for me is the theological heart of the letter \u2014 Paul grounds justification not in doctrine but in a personal act of love toward him specifically.",dustVal:12},
  {id:'c_2tim316',type:'commentary',name:'On 2 Tim 3:16-17',icon:'\ud83d\udcd6',rarity:'uncommon',desc:"Theopneustos (God-breathed) is a compound Paul coined \u2014 it appears nowhere else in Greek literature. The emphasis is not on the human authors' experience but on the divine origin of the text. The four uses \u2014 teaching, reproof, correction, training in righteousness \u2014 describe a full hermeneutical cycle: proclamation, negative correction, positive redirection, and habitual formation.",dustVal:8},
  {id:'c_1pet56',type:'commentary',name:'On 1 Pet 5:6-7',icon:'\ud83e\udec2',rarity:'common',desc:"Humble yourselves under the mighty hand of God connects to the Exodus \u2014 God's outstretched hand lifts the humble and scatters the proud (Ps 138:6). Casting all your anxiety on him (epirripto) is an aorist imperative: do this once as a decisive act, not as a perpetual drip. The theological ground is not God's power but his care \u2014 he concerns himself with you.",dustVal:5},
  // \u2500\u2500 Psalm 1 collection cosmetics \u2500\u2500
  {id:'sk_streams',type:'skin',name:'Streams of Water',icon:'\ud83c\udf3f',rarity:'legendary',desc:'Deep evergreen and living-water teal. A tree planted by streams, whose leaf does not wither.',val:'streams',dustVal:40,unlock:{collectionId:'psalm1',tier:'boss'}},
  {id:'sk_chaff',type:'skin',name:'Chaff in the Wind',icon:'\ud83c\udf3e',rarity:'rare',desc:'Dry husk-gold and windblown straw. The wicked are like chaff that the wind drives away.',val:'chaff',dustVal:15},
  {id:'c_ps1_1',type:'commentary',name:'On Psalm 1:1',icon:'\ud83d\udeb6',rarity:'common',desc:"The blessing opens with a downward progression: walks, then stands, then sits \u2014 movement giving way to lingering to settled belonging. The company shifts in step: counsel of the wicked, way of sinners, seat of scoffers. Sin is rarely a leap; it is a drift from passing advice to fixed identity. Blessed (ashrei) is plural in Hebrew \u2014 literally 'O the happinesses' \u2014 an exclamation, not a transaction.",dustVal:5},
  {id:'c_ps1_3',type:'commentary',name:'On Psalm 1:3',icon:'\ud83c\udf33',rarity:'uncommon',desc:"Planted (shatul) means transplanted \u2014 deliberately moved and set, not sprung up wild. The streams are palgei mayim, irrigation channels dug by hand, so the tree is fed by directed water, not chance rain. Its fruit comes in season, not on demand; the leaf does not wither even in drought. The image is the meditating man of verse 2: rooted where the water is made to flow.",dustVal:8},
  {id:'c_ps1_6',type:'commentary',name:'On Psalm 1:6',icon:'\ud83d\udee4\ufe0f',rarity:'uncommon',desc:"Knows (yada) here is covenant intimacy, not mere information \u2014 the Lord knows the way of the righteous the way a shepherd knows his own. The psalm's frame is the two ways (derek): one watched and kept, the other left to perish under its own momentum. The wicked are not sentenced so much as they simply come to nothing, having no root and no keeper.",dustVal:8},
];

const PACKS=[
  {id:'basic',   name:'Wanderer Pack', icon:'\ud83d\udce6',desc:'3 items, common-heavy. Rare Lumen drops inside.',    price:240, count:3, lumenChance:0.15, rarityWeights:{common:72,uncommon:21,rare:6.9,legendary:0.1}},
  {id:'standard',name:'Pilgrim Pack',  icon:'\ud83c\udf92',desc:'5 items, balanced. Better Lumen rate.',              price:520, count:5, lumenChance:0.18, rarityWeights:{common:57,uncommon:29,rare:13.7,legendary:0.3}},
  {id:'mega',    name:'Covenant Pack', icon:'\ud83c\udf81',desc:'10 items, most Lumens per coin spent.',              price:950, count:10,lumenChance:0.22, rarityWeights:{common:52,uncommon:30,rare:17.6,legendary:0.4}},
  {id:'skin',    name:'Artisan Pack',  icon:'\ud83c\udfa8',desc:'3 guaranteed skins. Rare or better only.',           price:0,   count:3, types:['skin'],              lumensOnly:true, rarityWeights:{common:0,uncommon:35,rare:58,legendary:7}},
  {id:'sound',   name:'Composer Pack', icon:'\ud83c\udfb5',desc:'3 guaranteed instruments or scales.',                price:0,   count:3, types:['instrument','scale'], lumensOnly:true, rarityWeights:{common:30,uncommon:40,rare:26,legendary:4}},
  {id:'study',   name:'Scholar Pack',  icon:'\ud83d\udcda',desc:'8 commentary items. Feed the mind.',                price:0,   count:8, types:['commentary'],         lumensOnly:true, rarityWeights:{common:58,uncommon:28,rare:13,legendary:1}},
  {id:'prestige',name:'Reliquary',     icon:'\ud83d\udc8e',desc:'5 items, rare or legendary only. Costs 90 Lumens.', price:0,   count:5, lumensPrice:90,              rarityWeights:{common:0,uncommon:30,rare:60,legendary:10}},
];

const TYPE_ORDER={instrument:0,scale:1,skin:2,commentary:3};
const TYPE_LABELS={instrument:'instrument',scale:'scale / pattern',skin:'skin',commentary:'commentary'};
const RARITY_ORDER={common:0,uncommon:1,rare:2,legendary:3};
const RARITY_COLORS={common:'#9A9A9A',uncommon:'#A8E063',rare:'#56CCF2',legendary:'#FFD700'};
const RARITY_GLOW={
  common:  null,
  uncommon:'radial-gradient(ellipse at 50% 0%,rgba(168,224,99,0.25) 0%,transparent 70%)',
  rare:    'radial-gradient(ellipse at 50% 0%,rgba(86,204,242,0.35) 0%,transparent 70%)',
  legendary:'radial-gradient(ellipse at 50% 0%,rgba(255,215,0,0.5) 0%,transparent 65%)',
};
const RARITY_BORDER={common:'#6A6A6A',uncommon:'#A8E063',rare:'#56CCF2',legendary:'#FFD700'};

const CRAFT_COSTS={common:20,uncommon:40,rare:75,legendary:140};
function craftCostFor(item){return CRAFT_COSTS[item.rarity]||40;}
function craftShardCost(item){return item.rarity==='legendary'?1:0;}
function canCraft(item){
  const dust=craftCostFor(item);
  const shards=craftShardCost(item);
  return G.dust>=dust&&G.shards>=shards&&!G.inventory.includes(item.id);
}

const LUMEN_EXCHANGE=[
  {packId:'skin',  cost:45, label:'Artisan Pack token',  icon:'\ud83c\udfa8', desc:'45 \ud83d\udd06 \u2192 1 Artisan Pack (3 skins, rare+)'},
  {packId:'sound', cost:45, label:'Composer Pack token', icon:'\ud83c\udfb5', desc:'45 \ud83d\udd06 \u2192 1 Composer Pack (3 instruments/scales)'},
  {packId:'study', cost:30, label:'Scholar Pack token',  icon:'\ud83d\udcda', desc:'30 \ud83d\udd06 \u2192 1 Scholar Pack (5 commentary)'},
  {packId:'prestige',cost:90,label:'Reliquary token',   icon:'\ud83d\udc8e', desc:'90 \ud83d\udd06 \u2192 1 Reliquary (5 rare/legendary items)'},
];

const CRAFTABLES=ITEMS.slice().sort((a,b)=>(TYPE_ORDER[a.type]-TYPE_ORDER[b.type])||(RARITY_ORDER[a.rarity]-RARITY_ORDER[b.rarity])||a.name.localeCompare(b.name)).map(item=>({id:item.id,dustCost:craftCostFor(item)}));

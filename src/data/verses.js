// ════════════════════════════════════════════════════
// VERSE DATA — All verse collections
// ════════════════════════════════════════════════════

/**
 * Returns a blank per-collection progress snapshot.
 * @param {object[]} verses
 */
function blankCollectionProgress(verses) {
  return {
    flowVerseErrors: {},
    lessonProgress:  {},
    lessonVerseIdx:  0,
    srCards: verses.map(v => ({
      ref:      v.ref,
      interval: 0,
      ef:       2.5,
      reps:     0,
      due:      Date.now(),
    })),
    srSessionCount: 0,
  };
}

// ── Collection: Gospel of John (ESV) ─────────────────
const COLLECTION_JOHN = {
  id:       'john',
  name:     'Gospel of John',
  icon:     '\u271d\ufe0f',
  subtitle: 'ESV \u00b7 21 Verses',
  theme:    '#C9A84C',
  unlocked: true,
  bossGroups: [
    [0,1,2,3,4],
    [5,6,7,8,9],
    [10,11,12,13,14],
    [15,16,17,18,19],
    [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
  ],
  verses: [
    {ref:'John 1:14', text:'And the Word became flesh and dwelt among us, and we have seen his glory, glory as of the only Son from the Father, full of grace and truth.'},
    {ref:'John 1:29', text:'The next day he saw Jesus coming toward him, and said, "Behold, the Lamb of God, who takes away the sin of the world!"'},
    {ref:'John 1:45-46', text:'Philip found Nathanael and said to him, "We have found him of whom Moses in the Law and also the prophets wrote, Jesus of Nazareth, the son of Joseph." Nathanael said to him, "Can anything good come out of Nazareth?" Philip said to him, "Come and see."'},
    {ref:'John 3:3', text:'Jesus answered him, "Truly, truly, I say to you, unless one is born again he cannot see the kingdom of God."'},
    {ref:'John 3:16-17', text:'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life. For God did not send his Son into the world to condemn the world, but in order that the world might be saved through him.'},
    {ref:'John 4:34', text:'Jesus said to them, "My food is to do the will of him who sent me and to accomplish his work."'},
    {ref:'John 5:24', text:'Truly, truly, I say to you, whoever hears my word and believes him who sent me has eternal life. He does not come into judgment, but has passed from death to life.'},
    {ref:'John 6:68-69', text:'Simon Peter answered him, "Lord, to whom shall we go? You have the words of eternal life, and we have believed, and have come to know, that you are the Holy One of God."'},
    {ref:'John 7:38', text:'Whoever believes in me, as the Scripture has said, Out of his heart will flow rivers of living water.'},
    {ref:'John 8:12', text:'Again Jesus spoke to them, saying, "I am the light of the world. Whoever follows me will not walk in darkness, but will have the light of life."'},
    {ref:'John 10:10-11', text:'The thief comes only to steal and kill and destroy. I came that they may have life and have it abundantly. I am the good shepherd. The good shepherd lays down his life for the sheep.'},
    {ref:'John 10:27-28', text:'My sheep hear my voice, and I know them, and they follow me. I give them eternal life, and they will never perish, and no one will snatch them out of my hand.'},
    {ref:'John 11:25', text:'Jesus said to her, "I am the resurrection and the life. Whoever believes in me, though he die, yet shall he live."'},
    {ref:'John 12:24-25', text:'Truly, truly, I say to you, unless a grain of wheat falls into the earth and dies, it remains alone; but if it dies, it bears much fruit. Whoever loves his life loses it, and whoever hates his life in this world will keep it for eternal life.'},
    {ref:'John 12:32', text:'And I, when I am lifted up from the earth, will draw all people to myself.'},
    {ref:'John 13:34-35', text:'A new commandment I give to you, that you love one another: just as I have loved you, you also are to love one another. By this all people will know that you are my disciples, if you have love for one another.'},
    {ref:'John 15:5', text:'I am the vine; you are the branches. Whoever abides in me and I in him, he it is that bears much fruit, for apart from me you can do nothing.'},
    {ref:'John 15:12-13', text:'This is my commandment, that you love one another as I have loved you. Greater love has no one than this, that someone lay down his life for his friends.'},
    {ref:'John 16:33', text:'I have said these things to you, that in me you may have peace. In the world you will have tribulation. But take heart; I have overcome the world.'},
    {ref:'John 17:22-23', text:'The glory that you have given me I have given to them, that they may be one even as we are one, I in them and you in me, that they may become perfectly one, so that the world may know that you sent me and loved them even as you loved me.'},
    {ref:'John 20:31', text:'But these are written so that you may believe that Jesus is the Christ, the Son of God, and that by believing you may have life in his name.'},
  ],
};

// ── Collection: Noblemen (ESV) ────────────────────────
const COLLECTION_NOBLEMEN = {
  id:       'noblemen',
  name:     'Noblemen',
  icon:     '\u2694\ufe0f',
  subtitle: 'ESV \u00b7 21 Verses \u00b7 Men of character',
  theme:    '#7EB8D8',
  unlocked: true,
  bossGroups: [
    [0,1,2,3,4],
    [5,6,7,8,9],
    [10,11,12,13,14],
    [15,16,17,18,19],
    [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
  ],
  verses: [
    {ref:'Isaiah 32:8', text:'But he who is noble plans noble things, and on noble things he stands.'},
    {ref:'2 Corinthians 5:21', text:'For our sake he made him to be sin who knew no sin, so that in him we might become the righteousness of God.'},
    {ref:'Isaiah 61:10', text:'I will greatly rejoice in the Lord; my soul shall exult in my God, for he has clothed me with the garments of salvation; he has covered me with the robe of righteousness, as a bridegroom decks himself like a priest with a beautiful headdress, and as a bride adorns herself with her jewels.'},
    {ref:'Acts 13:22', text:'And when he had removed him, he raised up David to be their king, of whom he testified and said, I have found in David the son of Jesse a man after my heart, who will do all my will.'},
    {ref:'Ezra 7:10', text:'For Ezra had set his heart to study the Law of the Lord, and to do it and to teach his statutes and rules in Israel.'},
    {ref:'Ephesians 5:3', text:'But sexual immorality and all impurity or covetousness must not even be named among you, as is proper among saints.'},
    {ref:'2 Corinthians 7:1', text:'Since we have these promises, beloved, let us cleanse ourselves from every defilement of body and spirit, bringing holiness to completion in the fear of God.'},
    {ref:'1 Thessalonians 4:3-7', text:'For this is the will of God, your sanctification: that you abstain from sexual immorality; that each one of you know how to control his own body in holiness and honor, not in the passion of lust like the Gentiles who do not know God; that no one transgress and wrong his brother in this matter, because the Lord is an avenger in all these things, as we told you beforehand and solemnly warned you. For God has not called us for impurity, but in holiness.'},
    {ref:'Isaiah 54:4', text:'Fear not, for you will not be ashamed; be not confounded, for you will not be disgraced; for you will forget the shame of your youth, and the reproach of your widowhood you will remember no more.'},
    {ref:'Proverbs 18:4', text:'The words of a man\'s mouth are deep waters; the fountain of wisdom is a bubbling brook.'},
    {ref:'Ecclesiastes 4:9-10', text:'Two are better than one, because they have a good reward for their toil. For if they fall, one will lift up his fellow. But woe to him who is alone when he falls and has not another to lift him up!'},
    {ref:'2 Timothy 2:2', text:'And what you have heard from me in the presence of many witnesses entrust to faithful men, who will be able to teach others also.'},
    {ref:'Genesis 12:2', text:'And I will make of you a great nation, and I will bless you and make your name great, so that you will be a blessing.'},
    {ref:'2 Corinthians 6:14', text:'Do not be unequally yoked with unbelievers. For what partnership has righteousness with lawlessness? Or what fellowship has light with darkness?'},
    {ref:'Proverbs 31:30', text:'Charm is deceitful, and beauty is vain, but a woman who fears the Lord is to be praised.'},
    {ref:'Psalm 51:6', text:'Behold, you delight in truth in the inward being, and you teach me wisdom in the secret heart.'},
    {ref:'Psalm 51:17', text:'The sacrifices of God are a broken spirit; a broken and contrite heart, O God, you will not despise.'},
    {ref:'Matthew 20:25-28', text:'But Jesus called them to him and said, You know that the rulers of the Gentiles lord it over them, and their great ones exercise authority over them. It shall not be so among you. But whoever would be great among you must be your servant, and whoever would be first among you must be your slave, even as the Son of Man came not to be served but to serve, and to give his life as a ransom for many.'},
    {ref:'Psalm 78:72', text:'With upright heart he shepherded them and guided them with his skillful hand.'},
    {ref:'Philippians 2:3-5', text:'Do nothing from selfish ambition or conceit, but in humility count others more significant than yourselves. Let each of you look not only to his own interests, but also to the interests of others. Have this mind among yourselves, which is yours in Christ Jesus.'},
    {ref:'2 Samuel 23:3-4', text:'The God of Israel has spoken; the Rock of Israel has said to me: When one rules justly over men, ruling in the fear of God, he dawns on them like the morning light, like the sun shining forth on a cloudless morning, like rain that makes grass to sprout from the earth.'},
  ],
};

// ── Collection: 2 Corinthians 4 (ESV) ────────────────────────────────
const COLLECTION_2COR4 = {
  id:       '2cor4',
  name:     '2 Corinthians 4',
  icon:     '\ud83d\udca1',
  subtitle: 'ESV \u00b7 The Light of the Gospel \u00b7 18 verses + 5 passages',
  theme:    '#56CCF2',
  unlocked: true,
  verses: [
    {ref:'2 Cor 4:1', text:'Therefore, having this ministry by the mercy of God, we do not lose heart.'},
    {ref:'2 Cor 4:2', text:'But we have renounced disgraceful, underhanded ways. We refuse to practice cunning or to tamper with God\'s word, but by the open statement of the truth we would commend ourselves to everyone\'s conscience in the sight of God.'},
    {ref:'2 Cor 4:3-4', text:'And even if our gospel is veiled, it is veiled only to those who are perishing. In their case the god of this world has blinded the minds of the unbelievers, to keep them from seeing the light of the gospel of the glory of Christ, who is the image of God.'},
    {ref:'2 Cor 4:5', text:'For what we proclaim is not ourselves, but Jesus Christ as Lord, with ourselves as your servants for Jesus\' sake.'},
    {ref:'2 Cor 4:6', text:'For God, who said, Let light shine out of darkness, has shone in our hearts to give the light of the knowledge of the glory of God in the face of Jesus Christ.'},
    {ref:'2 Cor 4:7', text:'But we have this treasure in jars of clay, to show that the surpassing power belongs to God and not to us.'},
    {ref:'2 Cor 4:8', text:'We are afflicted in every way, but not crushed; perplexed, but not driven to despair;'},
    {ref:'2 Cor 4:9-10', text:'persecuted, but not forsaken; struck down, but not destroyed; always carrying in the body the death of Jesus, so that the life of Jesus may also be manifested in our bodies.'},
    {ref:'2 Cor 4:11-12', text:'For we who live are always being given over to death for Jesus\' sake, so that the life of Jesus also may be manifested in our mortal flesh. So death is at work in us, but life in you.'},
    {ref:'2 Cor 4:13-14', text:'Since we have the same spirit of faith according to what has been written, I believed, and so I spoke, we also believe, and so we also speak, knowing that he who raised the Lord Jesus will raise us also with Jesus and bring us with you into his presence.'},
    {ref:'2 Cor 4:15', text:'For it is all for your sake, so that as grace extends to more and more people it may increase thanksgiving, to the glory of God.'},
    {ref:'2 Cor 4:16', text:'So we do not lose heart. Though our outer self is wasting away, our inner self is being renewed day by day.'},
    {ref:'2 Cor 4:17-18', text:'For this light momentary affliction is preparing for us an eternal weight of glory beyond all comparison, as we look not to the things that are seen but to the things that are unseen. For the things that are seen are transient, but the things that are unseen are eternal.'},
    {ref:'2 Cor 4:1-6', text:'Therefore, having this ministry by the mercy of God, we do not lose heart. But we have renounced disgraceful, underhanded ways. We refuse to practice cunning or to tamper with God\'s word, but by the open statement of the truth we would commend ourselves to everyone\'s conscience in the sight of God. And even if our gospel is veiled, it is veiled only to those who are perishing. In their case the god of this world has blinded the minds of the unbelievers, to keep them from seeing the light of the gospel of the glory of Christ, who is the image of God. For what we proclaim is not ourselves, but Jesus Christ as Lord, with ourselves as your servants for Jesus\' sake. For God, who said, Let light shine out of darkness, has shone in our hearts to give the light of the knowledge of the glory of God in the face of Jesus Christ.'},
    {ref:'2 Cor 4:7-12', text:'But we have this treasure in jars of clay, to show that the surpassing power belongs to God and not to us. We are afflicted in every way, but not crushed; perplexed, but not driven to despair; persecuted, but not forsaken; struck down, but not destroyed; always carrying in the body the death of Jesus, so that the life of Jesus may also be manifested in our bodies. For we who live are always being given over to death for Jesus\' sake, so that the life of Jesus also may be manifested in our mortal flesh. So death is at work in us, but life in you.'},
    {ref:'2 Cor 4:13-15', text:'Since we have the same spirit of faith according to what has been written, I believed, and so I spoke, we also believe, and so we also speak, knowing that he who raised the Lord Jesus will raise us also with Jesus and bring us with you into his presence. For it is all for your sake, so that as grace extends to more and more people it may increase thanksgiving, to the glory of God.'},
    {ref:'2 Cor 4:16-18', text:'So we do not lose heart. Though our outer self is wasting away, our inner self is being renewed day by day. For this light momentary affliction is preparing for us an eternal weight of glory beyond all comparison, as we look not to the things that are seen but to the things that are unseen. For the things that are seen are transient, but the things that are unseen are eternal.'},
    {ref:'2 Cor 4:1-18', text:'Therefore, having this ministry by the mercy of God, we do not lose heart. But we have renounced disgraceful, underhanded ways. We refuse to practice cunning or to tamper with God\'s word, but by the open statement of the truth we would commend ourselves to everyone\'s conscience in the sight of God. And even if our gospel is veiled, it is veiled only to those who are perishing. In their case the god of this world has blinded the minds of the unbelievers, to keep them from seeing the light of the gospel of the glory of Christ, who is the image of God. For what we proclaim is not ourselves, but Jesus Christ as Lord, with ourselves as your servants for Jesus\' sake. For God, who said, Let light shine out of darkness, has shone in our hearts to give the light of the knowledge of the glory of God in the face of Jesus Christ. But we have this treasure in jars of clay, to show that the surpassing power belongs to God and not to us. We are afflicted in every way, but not crushed; perplexed, but not driven to despair; persecuted, but not forsaken; struck down, but not destroyed; always carrying in the body the death of Jesus, so that the life of Jesus may also be manifested in our bodies. For we who live are always being given over to death for Jesus\' sake, so that the life of Jesus also may be manifested in our mortal flesh. So death is at work in us, but life in you. Since we have the same spirit of faith according to what has been written, I believed, and so I spoke, we also believe, and so we also speak, knowing that he who raised the Lord Jesus will raise us also with Jesus and bring us with you into his presence. For it is all for your sake, so that as grace extends to more and more people it may increase thanksgiving, to the glory of God. So we do not lose heart. Though our outer self is wasting away, our inner self is being renewed day by day. For this light momentary affliction is preparing for us an eternal weight of glory beyond all comparison, as we look not to the things that are seen but to the things that are unseen. For the things that are seen are transient, but the things that are unseen are eternal.'},
  ],
};

// ── Master collection registry ────────────────────────
const COLLECTIONS = [COLLECTION_JOHN, COLLECTION_NOBLEMEN, COLLECTION_2COR4];

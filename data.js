window.LWC_DATA = {
  version: '0.6.2',
  wrestlers: {
    cody: {
      id: 'cody', name: 'Cody Rhodes', shortName: 'Cody', era: '2026',
      portrait: 'assets/wrestlers/cody-rhodes/portrait.webp',
      stats: { power: 88, speed: 91, technique: 94, brawling: 88, charisma: 98, ringIQ: 95, resilience: 96 },
      traits: { crowdGain: 1.22, comboMomentum: 1.18, reversalBonus: 0.07, comeback: 'Finish the Story' },
      library: [
        'punch','kick','clothesline','elbow','grapple','irishWhip','dragCorner','groundOpponent','block','reverseStrike','reverseGrapple','reverseAerial','reverseSubmission','reverseControl','cover','hookLeg','rollUp',
        'forearm','chop','headbutt','shoulderTackle','dropkick','shotgunDropkick','kneeLift','bodySlam','scoopSlam','hipToss','armDrag','neckbreaker','backbreaker','bulldog','wheelbarrowBulldog','ddt','verticalSuplex','snapSuplex','backSuplex','bellyToBackSuplex','bellyToBelly','germanSuplex','piledriver','legDrop','kneeDrop','sleeperHold','bostonCrab','divingElbow','crossbody','highCrossBody','mountedPunches','elbowBackHead','disasterKick','codyCutter','crossRhodes','crowdSupport','catchBreath','fireUp','scoutOpponent'
      ]
    },
    roman: {
      id: 'roman', name: 'Roman Reigns', shortName: 'Roman', era: '2026',
      portrait: 'assets/wrestlers/roman-reigns/portrait.webp',
      stats: { power: 97, speed: 86, technique: 90, brawling: 96, charisma: 99, ringIQ: 96, resilience: 98 },
      traits: { strikeDamage: 1.12, crowdFromAggression: 1.12, riskPenalty: 0.82, comeback: 'Tribal Chief Comeback' },
      library: [
        'punch','kick','clothesline','flyingClothesline','elbow','grapple','irishWhip','dragCorner','groundOpponent','block','reverseStrike','reverseGrapple','reverseAerial','reverseSubmission','reverseControl','cover','hookLeg','rollUp',
        'forearm','headbutt','shoulderTackle','dropkick','shotgunDropkick','bigBoot','kneeLift','bodySlam','scoopSlam','neckbreaker','backbreaker','ddt','verticalSuplex','backSuplex','bellyToBackSuplex','bellyToBelly','powerbomb','legDrop','kneeDrop','rearChinLock','camelClutch','sleeperHold','bostonCrab','crossbody','highCrossBody','supermanPunch','spear','guillotine','crowdSupport','catchBreath','fireUp','scoutOpponent'
      ]
    }
  },
  cards: {
    punch: { name:'Punch', type:'Strike', damage:7, momentum:8, cost:0, accuracy:92, counter:'punch', counterAccuracy:84, req:['any'], result:'standing', tags:['basic','aggressive'] },
    kick: { name:'Kick', type:'Strike', damage:8, momentum:7, cost:0, accuracy:88, counter:'kick', counterAccuracy:82, req:['any'], result:'standing', tags:['basic'] },
    clothesline: { image:'assets/wrestlers/cody-rhodes/cards/clothesline.webp', name:'Clothesline', type:'Strike', damage:11, momentum:10, cost:3, accuracy:82, req:['any'], result:'grounded', tags:['basic','aggressive'] },
    elbow: { name:'Elbow Drop', type:'Strike', damage:10, momentum:8, cost:2, accuracy:85, req:['any'], result:'grounded', tags:['basic'] },
    grapple: { name:'Standing Grapple', type:'Grapple', damage:10, momentum:9, cost:2, accuracy:84, req:['any'], result:'grounded', tags:['basic','grapple'] },
    irishWhip: { name:'Irish Whip', type:'Control', damage:3, momentum:10, cost:0, accuracy:90, req:['any'], result:'standing', setup:'running', tags:['control'] },
    dragCorner: { name:'Drive Into the Corner', type:'Control', damage:4, momentum:9, cost:1, accuracy:88, req:['any'], result:'corner', tags:['control'] },
    groundOpponent: { name:'Ground the Opponent', type:'Control', damage:5, momentum:8, cost:0, accuracy:90, req:['any'], result:'grounded', tags:['control'] },
    block: { name:'Brace and Block', type:'Defence', damage:0, momentum:8, cost:0, accuracy:100, req:['any'], result:'same', guard:0.35, tags:['defence'] },
    reverseStrike: { name:'Reverse Strike', type:'Reversal', reverse:'Strike', damage:4, momentum:10, cost:0, accuracy:78, req:['any'], result:'standing', tags:['reversal','strike'] },
    reverseGrapple: { name:'Reverse Grapple', type:'Reversal', reverse:'Grapple', damage:5, momentum:10, cost:0, accuracy:76, req:['any'], result:'standing', tags:['reversal','grapple'] },
    reverseAerial: { name:'Reverse Aerial Attack', type:'Reversal', reverse:'Aerial', damage:6, momentum:12, cost:0, accuracy:74, req:['any'], result:'grounded', tags:['reversal','aerial'] },
    reverseSubmission: { name:'Escape Submission', type:'Reversal', reverse:'Submission', damage:2, momentum:9, cost:0, accuracy:80, req:['any'], result:'standing', tags:['reversal','submission'] },
    reverseControl: { name:'Reverse Control Move', type:'Reversal', reverse:'Control', damage:3, momentum:9, cost:0, accuracy:79, req:['any'], result:'standing', tags:['reversal','control'] },
    cover: { name:'Cover', type:'Pin', damage:0, momentum:0, cost:0, accuracy:100, req:['any'], result:'grounded', pinBonus:0, tags:['pin'] },
    hookLeg: { name:'Hook the Leg', type:'Pin', damage:0, momentum:0, cost:8, accuracy:100, req:['any'], result:'grounded', pinBonus:12, tags:['pin'] },
    rollUp: { name:'Desperate Roll-Up', type:'Pin', damage:0, momentum:-5, cost:5, accuracy:72, req:['any'], result:'grounded', pinBonus:18, surprise:true, tags:['pin','risk'] },

    forearm: { name:'Forearm Smash', type:'Strike', damage:9, momentum:8, cost:0, accuracy:90, req:['any'], result:'standing', tags:['basic','strike'] },
    chop: { name:'Knife-Edge Chop', type:'Strike', damage:8, momentum:10, crowd:4, cost:0, accuracy:92, req:['any'], result:'standing', tags:['basic','strike','crowd'] },
    headbutt: { name:'Headbutt', type:'Strike', damage:10, momentum:8, cost:1, accuracy:86, req:['any'], result:'standing', tags:['strike','aggressive'] },
    shoulderTackle: { name:'Shoulder Tackle', type:'Strike', damage:11, momentum:10, cost:2, accuracy:86, req:['any'], result:'grounded', tags:['strike','power'] },
    dropkick: { name:'Dropkick', type:'Strike', damage:12, momentum:11, cost:3, accuracy:82, req:['any'], result:'grounded', tags:['strike','athletic'] },
    shotgunDropkick: { image:'assets/cards/common/shotgunDropkick.webp', name:'Shotgun Dropkick', type:'Strike', damage:15, momentum:14, cost:7, accuracy:81, req:['any'], result:'grounded', tags:['strike','athletic','impact'] },
    bigBoot: { name:'Big Boot', type:'Strike', damage:13, momentum:10, cost:4, accuracy:80, req:['any'], result:'grounded', tags:['strike','power'] },
    kneeLift: { name:'Running Knee Lift', type:'Strike', damage:12, momentum:12, cost:4, accuracy:81, req:['any'], result:'grounded', tags:['strike','aggressive'] },
    bodySlam: { name:'Body Slam', type:'Grapple', damage:11, momentum:10, cost:2, accuracy:88, req:['any'], result:'grounded', tags:['basic','grapple'] },
    scoopSlam: { name:'Scoop Slam', type:'Grapple', damage:13, momentum:11, cost:4, accuracy:85, req:['any'], result:'grounded', tags:['grapple','power'] },
    hipToss: { name:'Hip Toss', type:'Grapple', damage:9, momentum:11, cost:1, accuracy:90, req:['any'], result:'grounded', tags:['grapple','technical'] },
    armDrag: { name:'Arm Drag', type:'Grapple', damage:8, momentum:12, cost:1, accuracy:91, req:['any'], result:'grounded', tags:['grapple','technical'] },
    neckbreaker: { name:'Neckbreaker', type:'Grapple', damage:14, momentum:12, cost:6, accuracy:82, req:['any'], result:'grounded', tags:['grapple'] },
    backbreaker: { name:'Backbreaker', type:'Grapple', damage:15, momentum:12, cost:7, accuracy:81, req:['any'], result:'grounded', tags:['grapple','power'] },
    bulldog: { name:'Bulldog', type:'Grapple', damage:13, momentum:13, cost:5, accuracy:84, req:['any'], result:'grounded', tags:['grapple'] },
    wheelbarrowBulldog: { image:'assets/wrestlers/cody-rhodes/cards/wheelbarrowBulldog.webp', name:'Wheelbarrow Bulldog', type:'Grapple', damage:16, momentum:15, cost:8, accuracy:84, req:['any'], result:'grounded', tags:['grapple','signature','athletic'] },
    rearChinLock: { image:'assets/wrestlers/roman-reigns/cards/rearChinLock.webp', name:'Rear Chin-Lock', type:'Submission', damage:9, momentum:13, cost:4, accuracy:88, req:['any'], result:'grounded', tags:['submission','control'] },
    flyingClothesline: { image:'assets/wrestlers/roman-reigns/cards/flyingClothesline.webp', name:'Flying Clothesline', type:'Strike', damage:15, momentum:14, cost:7, accuracy:83, req:['any'], result:'grounded', tags:['strike','athletic'] },
    camelClutch: { image:'assets/wrestlers/roman-reigns/cards/camelClutch.webp', name:'Camel Clutch', type:'Submission', damage:13, momentum:16, cost:9, accuracy:81, req:['any'], result:'grounded', tags:['submission','power','control'] },
    bellyToBackSuplex: { image:'assets/wrestlers/cody-rhodes/cards/bellyToBackSuplex.webp', name:'Belly-to-Back Suplex', type:'Grapple', damage:16, momentum:14, cost:8, accuracy:82, req:['any'], result:'grounded', tags:['grapple','suplex'] },
    elbowBackHead: { image:'assets/wrestlers/cody-rhodes/cards/elbowBackHead.webp', name:'Elbow to the Back of the Head', type:'Strike', damage:12, momentum:11, cost:4, accuracy:86, req:['any'], result:'grounded', tags:['strike','aggressive'] },
    ddt: { name:'DDT', type:'Grapple', damage:16, momentum:13, cost:8, accuracy:80, req:['any'], result:'grounded', tags:['grapple','impact'] },
    verticalSuplex: { name:'Vertical Suplex', type:'Grapple', damage:15, momentum:13, cost:7, accuracy:83, req:['any'], result:'grounded', tags:['grapple','suplex'] },
    snapSuplex: { name:'Snap Suplex', type:'Grapple', damage:13, momentum:14, cost:5, accuracy:86, req:['any'], result:'grounded', tags:['grapple','suplex','quick'] },
    backSuplex: { name:'Back Suplex', type:'Grapple', damage:16, momentum:13, cost:8, accuracy:80, req:['any'], result:'grounded', tags:['grapple','suplex'] },
    bellyToBelly: { name:'Belly-to-Belly Suplex', type:'Grapple', damage:17, momentum:14, cost:9, accuracy:79, req:['any'], result:'grounded', tags:['grapple','suplex','power'] },
    germanSuplex: { name:'German Suplex', type:'Grapple', damage:18, momentum:15, cost:11, accuracy:77, req:['any'], result:'grounded', tags:['grapple','suplex','technical'] },
    piledriver: { name:'Piledriver', type:'Grapple', damage:21, momentum:15, cost:18, accuracy:70, req:['any'], result:'grounded', riskMomentum:10, tags:['grapple','high-impact','risk'] },
    powerbomb: { name:'Powerbomb', type:'Grapple', damage:22, momentum:16, cost:20, accuracy:69, req:['any'], result:'grounded', riskMomentum:12, tags:['grapple','power','high-impact','risk'] },
    legDrop: { name:'Leg Drop', type:'Strike', damage:12, momentum:10, cost:3, accuracy:86, req:['any'], result:'grounded', tags:['strike'] },
    kneeDrop: { name:'Knee Drop', type:'Strike', damage:11, momentum:10, cost:3, accuracy:87, req:['any'], result:'grounded', tags:['strike'] },
    sleeperHold: { name:'Sleeper Hold', type:'Submission', damage:8, momentum:15, cost:6, accuracy:84, req:['any'], result:'grounded', tags:['submission','control'] },
    bostonCrab: { name:'Boston Crab', type:'Submission', damage:12, momentum:16, cost:10, accuracy:78, req:['any'], result:'grounded', tags:['submission','technical'] },

    divingElbow: { name:'Diving Elbow Drop', type:'Aerial', damage:17, momentum:14, cost:9, accuracy:76, req:['any'], result:'grounded', tags:['aerial','high-risk'] },
    crossbody: { name:'Flying Crossbody', type:'Aerial', damage:14, momentum:15, cost:7, accuracy:80, req:['any'], result:'grounded', tags:['aerial','athletic'] },
    highCrossBody: { image:'assets/cards/common/highCrossBody.webp', name:'High Cross Body', type:'Aerial', damage:16, momentum:16, cost:9, accuracy:78, req:['any'], result:'grounded', tags:['aerial','athletic','high-risk'] },
    topRopeSplash: { name:'Top-Rope Splash', type:'Aerial', damage:20, momentum:16, cost:14, accuracy:72, req:['any'], result:'grounded', riskMomentum:8, tags:['aerial','high-risk'] },

    mountedPunches: { image:'assets/wrestlers/cody-rhodes/cards/mountedPunches.webp', name:'Mounted Punches', type:'Signature', damage:13, momentum:13, cost:7, accuracy:89, req:['any'], result:'grounded', tags:['signature','aggressive'] },


    disasterKick: { name:'Disaster Kick', type:'Aerial', damage:17, momentum:15, cost:13, result:'grounded', tags:['signature','aerial','athletic'] },
    codyCutter: { name:'Cody Cutter', type:'Aerial', damage:21, momentum:17, cost:20, result:'grounded', tags:['signature','aerial','impact'] },
    crossRhodes: { name:'Cross Rhodes', type:'Grapple', damage:30, momentum:0, crowd:20, cost:42, result:'grounded', finisher:true, pinBonus:36, tags:['finisher','grapple'] },
    supermanPunch: { name:'Superman Punch', type:'Strike', damage:20, momentum:17, cost:17, result:'grounded', tags:['signature','strike','impact'] },
    spear: { name:'Spear', type:'Strike', damage:31, momentum:0, crowd:20, cost:42, result:'grounded', finisher:true, pinBonus:37, tags:['finisher','strike'] },
    guillotine: { name:'Guillotine Choke', type:'Submission', damage:27, momentum:0, crowd:16, cost:38, result:'grounded', finisher:true, pinBonus:33, tags:['finisher','submission'] },
    crowdSupport: { name:'Crowd Support', type:'Action', damage:0, momentum:2, cost:0, result:'same', tags:['action','crowd'] },
    catchBreath: { name:'Catch Your Breath', type:'Action', damage:0, momentum:4, heal:3, cost:0, result:'same', tags:['action','recovery'] },
    fireUp: { name:'Fire Up', type:'Action', damage:0, momentum:6, crowd:4, cost:0, result:'same', tags:['action','crowd'] },
    scoutOpponent: { name:'Scout the Opponent', type:'Action', damage:0, momentum:3, guard:0.2, cost:0, result:'same', tags:['action','defence'] }
  }
};

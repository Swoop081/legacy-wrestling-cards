window.LWC_DATA = {
  version: '0.3.2',
  wrestlers: {
    austin: {
      id: 'austin', name: '"Stone Cold" Steve Austin', shortName: 'Stone Cold', era: '1999',
      portrait: 'assets/wrestlers/stone-cold-steve-austin/portrait.webp',
      stats: { power: 92, speed: 83, technique: 89, brawling: 100, charisma: 100, ringIQ: 94, resilience: 100 },
      traits: { strikeDamage: 1.10, crowdFromAggression: 1.20, riskPenalty: 0.75, comeback: 'Austin Refuses to Stay Down' },
      library: [
        'punch','kick','clothesline','elbow','grapple','irishWhip','dragCorner','groundOpponent','block','reverseGrapple','cover','hookLeg','rollUp',
        'louThesz','mountedPunches','mudHole','whoopAss','raiseHell','stunner','austinComeback'
      ]
    },
    rock: {
      id: 'rock', name: 'The Rock', shortName: 'The Rock', era: '1999',
      portrait: 'assets/wrestlers/the-rock/portrait.webp',
      stats: { power: 94, speed: 90, technique: 88, brawling: 95, charisma: 100, ringIQ: 93, resilience: 97 },
      traits: { crowdGain: 1.25, signatureAccuracy: 1.08, comboMomentum: 1.20, reversalBonus: 0.08, comeback: 'The People Are Behind Him' },
      library: [
        'punch','kick','clothesline','elbow','grapple','irishWhip','dragCorner','groundOpponent','block','reverseGrapple','cover','hookLeg','rollUp',
        'samoanDrop','floatDDT','rockSpinebuster','peoplesElbow','rockBottom','rockComeback'
      ]
    }
  },
  cards: {
    punch: { name:'Punch', type:'Strike', damage:7, momentum:8, cost:0, accuracy:92, req:['standing'], result:'standing', tags:['basic','aggressive'] },
    kick: { name:'Kick', type:'Strike', damage:8, momentum:7, cost:0, accuracy:88, req:['standing'], result:'standing', tags:['basic'] },
    clothesline: { name:'Clothesline', type:'Strike', damage:11, momentum:10, cost:3, accuracy:82, req:['standing'], result:'grounded', tags:['basic','aggressive'] },
    elbow: { name:'Elbow Drop', type:'Strike', damage:10, momentum:8, cost:2, accuracy:85, req:['grounded'], result:'grounded', tags:['basic'] },
    grapple: { name:'Standing Grapple', type:'Grapple', damage:10, momentum:9, cost:2, accuracy:84, req:['standing'], result:'grounded', tags:['basic','grapple'] },
    irishWhip: { name:'Irish Whip', type:'Control', damage:3, momentum:10, cost:0, accuracy:90, req:['standing'], result:'standing', setup:'running', tags:['control'] },
    dragCorner: { name:'Drive Into the Corner', type:'Control', damage:4, momentum:9, cost:1, accuracy:88, req:['standing'], result:'corner', tags:['control'] },
    groundOpponent: { name:'Ground the Opponent', type:'Control', damage:5, momentum:8, cost:0, accuracy:90, req:['standing','corner'], result:'grounded', tags:['control'] },
    block: { name:'Brace and Block', type:'Defence', damage:0, momentum:12, cost:0, accuracy:100, req:['any'], result:'same', guard:0.45, tags:['defence'] },
    reverseGrapple: { name:'Reverse Grapple', type:'Defence', damage:6, momentum:10, cost:4, accuracy:76, req:['any'], result:'standing', guard:0.25, tags:['defence','grapple'] },
    cover: { name:'Cover', type:'Pin', damage:0, momentum:0, cost:0, accuracy:100, req:['grounded'], result:'grounded', pinBonus:0, tags:['pin'] },
    hookLeg: { name:'Hook the Leg', type:'Pin', damage:0, momentum:0, cost:8, accuracy:100, req:['grounded'], result:'grounded', pinBonus:12, tags:['pin'] },
    rollUp: { name:'Desperate Roll-Up', type:'Pin', damage:0, momentum:-5, cost:5, accuracy:72, req:['standing'], result:'grounded', pinBonus:18, surprise:true, tags:['pin','risk'] },

    louThesz: { name:'Lou Thesz Press', type:'Signature', damage:15, momentum:14, cost:12, accuracy:86, req:['standing'], result:'grounded', tags:['signature','aggressive'], combo:'mountedPunches' },
    mountedPunches: { name:'Mounted Punches', type:'Signature', damage:13, momentum:12, cost:9, accuracy:90, req:['grounded'], result:'grounded', tags:['signature','aggressive'], combo:'mudHole' },
    mudHole: { name:'Stomp a Mud Hole', type:'Signature', damage:18, momentum:17, cost:18, accuracy:84, req:['corner'], result:'grounded', tags:['signature','aggressive'], combo:'stunner' },
    whoopAss: { name:'Open a Can of Whoop-Ass', type:'Signature', damage:16, momentum:20, cost:16, accuracy:82, req:['standing','corner'], result:'grounded', tags:['signature','aggressive'] },
    raiseHell: { name:'Raise Hell', type:'Taunt', damage:0, momentum:24, crowd:18, cost:0, accuracy:100, req:['any'], result:'same', tags:['taunt','aggressive'] },
    stunner: { name:'Stone Cold Stunner', type:'Finisher', damage:28, momentum:0, crowd:20, cost:48, accuracy:76, req:['standing'], result:'grounded', finisher:true, pinBonus:35, riskMomentum:18, tags:['finisher','grapple'] },
    austinComeback: { name:'Austin Refuses to Stay Down', type:'Comeback', damage:0, momentum:22, heal:14, crowd:12, cost:0, accuracy:100, req:['any'], result:'same', once:true, onlyBehind:true, tags:['comeback'] },

    samoanDrop: { name:'Samoan Drop', type:'Signature', damage:15, momentum:13, cost:12, accuracy:86, req:['standing'], result:'grounded', tags:['signature','grapple'] },
    floatDDT: { name:'Float-Over DDT', type:'Signature', damage:16, momentum:14, cost:14, accuracy:83, req:['standing'], result:'grounded', tags:['signature','grapple'] },
    rockSpinebuster: { name:'Spinebuster', type:'Signature', damage:18, momentum:18, cost:18, accuracy:86, req:['standing','running'], result:'grounded', tags:['signature','grapple'], combo:'peoplesElbow' },
    peoplesElbow: { name:"People's Elbow", type:'Finisher', damage:24, momentum:0, crowd:25, cost:40, accuracy:82, req:['grounded'], result:'grounded', finisher:true, pinBonus:28, riskMomentum:14, tags:['finisher','crowd'] },
    rockBottom: { name:'Rock Bottom', type:'Finisher', damage:27, momentum:0, crowd:18, cost:46, accuracy:78, req:['standing'], result:'grounded', finisher:true, pinBonus:34, riskMomentum:18, tags:['finisher','grapple'] },
    rockComeback: { name:'The People Are Behind Him', type:'Comeback', damage:0, momentum:20, heal:10, crowd:24, cost:0, accuracy:100, req:['any'], result:'same', once:true, onlyBehind:true, tags:['comeback'] }
  }
};

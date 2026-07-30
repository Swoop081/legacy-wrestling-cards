(() => {
'use strict';
const D=window.LWC_DATA,C=D.cards,W=D.wrestlers;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let state=null,selected='austin',cpuTimer=null;
const screens=['menu','select','match','result'];
const REVERSALS=['reverseStrike','reverseGrapple','reverseAerial','reverseSubmission','reverseControl'];
function show(id){screens.forEach(x=>$('#'+x).classList.toggle('active',x===id));window.scrollTo(0,0)}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function other(id){return id==='austin'?'rock':'austin'}
function stateOpponent(f){return f===state.player?state.cpu:state.player}
function isReversal(k){return C[k]?.type==='Reversal'}
function attackCategory(card){
  if(card.type==='Aerial'||card.tags?.includes('aerial'))return'Aerial';
  if(card.type==='Submission'||card.tags?.includes('submission'))return'Submission';
  if(card.type==='Control'||card.type==='Taunt'||card.type==='Comeback'||card.tags?.includes('control'))return'Control';
  if(card.type==='Strike'||card.tags?.includes('strike'))return'Strike';
  return'Grapple';
}
function weightedLibrary(id){return W[id].library.flatMap(k=>['cover','hookLeg','rollUp','stunner','rockBottom','peoplesElbow','austinComeback','rockComeback'].includes(k)?[k]:[k,k])}
function makeFighter(id){return{id,health:100,momentum:0,hand:[],discard:[],usedOnce:new Set(),guard:0,redraw:true,combo:null,lastCard:null}}
function startMatch(playerId){
  clearTimeout(cpuTimer);selected=playerId;
  state={player:makeFighter(playerId),cpu:makeFighter(other(playerId)),position:'standing',setup:null,crowd:0,control:50,turn:0,phase:'Opening',log:[],ended:false,nearFalls:0,variety:new Set(),finishers:0,possession:'player',pendingAttack:null};
  drawToFive(state.player);drawToFive(state.cpu);show('match');say(`${W[state.player.id].name} faces ${W[state.cpu.id].name}. The bell rings. ${W[state.player.id].shortName} has the opening possession.`);renderMatch();
}
function canEverDraw(k,f){const card=C[k];if(!card)return false;if(card.once&&f.usedOnce.has(k))return false;if(card.finisher&&(state.turn<4||f.momentum<24))return false;if(card.type==='Pin')return false;if(card.onlyBehind&&f.health>=stateOpponent(f).health-12)return false;return true}
function drawCard(f){
  const held=new Set(f.hand);let pool=weightedLibrary(f.id).filter(k=>canEverDraw(k,f)&&!held.has(k));
  if(!pool.length)pool=W[f.id].library.filter(k=>canEverDraw(k,f)&&!held.has(k));
  if(!pool.length)return null;return pool[Math.floor(Math.random()*pool.length)];
}
function drawToFive(f){f.hand=[...new Set(f.hand)].filter(k=>C[k]);let safety=0;while(f.hand.length<5&&safety++<100){const k=drawCard(f);if(!k)break;if(!f.hand.includes(k))f.hand.push(k)}}
function phaseAllows(card){return!(card.finisher&&state.phase==='Opening')}
function basicPlayability(k,f){const card=C[k],opp=stateOpponent(f);if(!card)return{ok:false,why:'Unavailable'};if(card.cost>f.momentum)return{ok:false,why:`Needs ${card.cost} momentum`};if(card.once&&f.usedOnce.has(k))return{ok:false,why:'Already used'};if(card.onlyBehind&&f.health>=opp.health-12)return{ok:false,why:'Only available when badly behind'};if(!phaseAllows(card))return{ok:false,why:'Unavailable in the opening'};return{ok:true,why:''}}
function playability(k,f){
  const card=C[k],base=basicPlayability(k,f);if(!base.ok)return base;
  if(f===state.player){
    if(state.possession==='player'){if(isReversal(k))return{ok:false,why:'Saved for defence'};return{ok:true,why:''}}
    if(!state.pendingAttack)return{ok:false,why:'Opponent has possession'};
    if(!isReversal(k))return{ok:false,why:'You need a reversal'};
    const needed=attackCategory(C[state.pendingAttack.key]);return card.reverse===needed?{ok:true,why:`Reverses ${needed}`}:{ok:false,why:`Needs Reverse ${needed}`};
  }
  if(state.possession!=='cpu'||isReversal(k))return{ok:false,why:'Not an attacking card'};
  return{ok:true,why:''};
}
function effectiveAccuracy(card,f,opp){let a=card.accuracy;if(card.type==='Grapple'||card.tags?.includes('grapple'))a+=(W[f.id].stats.technique-W[opp.id].stats.technique)*.12;if(card.type==='Strike')a+=(W[f.id].stats.brawling-W[opp.id].stats.brawling)*.1;if(card.type==='Signature'&&f.id==='rock')a*=W.rock.traits.signatureAccuracy;if(f.health<35)a-=6;if(f.combo===card.name||f.combo===card.id)a+=10;return clamp(Math.round(a),35,98)}
function cardDamage(card,f,critical=false){let d=card.damage||0;if(card.type==='Strike'&&f.id==='austin')d*=W.austin.traits.strikeDamage;if(state.phase==='Finishing')d*=1.08;if(critical)d*=1.25;return Math.round(d)}
function matchingReversalIndex(defender,category){return defender.hand.findIndex(k=>isReversal(k)&&C[k].reverse===category&&basicPlayability(k,defender).ok)}
function consumeCard(f,index){const key=f.hand[index];f.hand.splice(index,1);f.discard.push(key);if(C[key].once)f.usedOnce.add(key);drawToFive(f);return key}
function transferPossession(to,reason){state.possession=to;state.pendingAttack=null;state.setup=null;$('#turnLabel').textContent=to==='player'?'Your possession':'CPU possession';if(reason)say(reason);renderMatch();if(to==='cpu')cpuTimer=setTimeout(cpuSequence,700)}
function applyMove(actor,opp,key){
  const card=C[key],acc=effectiveAccuracy(card,actor,opp),roll=Math.random()*100,landed=roll<=acc,critical=landed&&roll<=Math.max(5,acc*.12);
  actor.momentum=clamp(actor.momentum-card.cost,0,100);state.variety.add(key);state.turn++;
  if(!landed){actor.momentum=clamp(actor.momentum-(card.riskMomentum||Math.round(card.cost*.4)),0,100);return{landed:false,text:`${W[opp.id].shortName} counters ${card.name} and takes possession.`}}
  let dmg=cardDamage(card,actor,critical);if(opp.guard){dmg=Math.round(dmg*(1-opp.guard));opp.guard=0}opp.health=clamp(opp.health-dmg,0,100);
  let gain=card.momentum||0;if(actor.id==='austin'&&card.tags?.includes('aggressive'))gain*=W.austin.traits.crowdFromAggression;if(actor.combo&&actor.id==='rock')gain*=W.rock.traits.comboMomentum;actor.momentum=clamp(actor.momentum+Math.round(gain),0,100);
  if(card.heal)actor.health=clamp(actor.health+card.heal,0,100);state.crowd=clamp(state.crowd+Math.round((dmg+gain+(card.crowd||0))/5),0,100);if(card.guard)actor.guard=card.guard;if(card.result&&card.result!=='same')state.position=card.result;actor.combo=card.combo?C[card.combo]?.name:null;actor.lastCard=key;if(card.finisher){state.finishers++;actor.combo=null}
  const swing=Math.round((dmg+gain*.4)/4);state.control=clamp(state.control+(actor===state.player?swing:-swing),5,95);updatePhase();
  return{landed:true,text:`${W[actor.id].shortName} ${critical?'lands a critical ': 'hits '}${card.name}${dmg?` for ${dmg} damage`:''} and keeps possession.`}
}
function playerAttack(index){
  if(state.ended||state.possession!=='player')return;const p=playability(state.player.hand[index],state.player);if(!p.ok){say(p.why);return}
  const key=consumeCard(state.player,index),card=C[key],category=attackCategory(card),ri=matchingReversalIndex(state.cpu,category);
  if(ri>=0){const rkey=consumeCard(state.cpu,ri),rev=C[rkey],chance=clamp(rev.accuracy+(W[state.cpu.id].stats.ringIQ-W[state.player.id].stats.ringIQ)*.15,45,92);if(Math.random()*100<=chance){state.cpu.momentum=clamp(state.cpu.momentum+rev.momentum,0,100);state.player.health=clamp(state.player.health-(rev.damage||0),0,100);state.turn++;updatePhase();transferPossession('cpu',`${W[state.cpu.id].shortName} plays ${rev.name}, reverses ${card.name}, and takes possession.`);return}}
  const result=applyMove(state.player,state.cpu,key);say(result.text);renderMatch();if(!result.landed)transferPossession('cpu');
}
function cpuSequence(){
  if(state.ended||state.possession!=='cpu'||state.pendingAttack)return;
  const f=state.cpu;let options=f.hand.map((k,i)=>({k,i,p:playability(k,f)})).filter(x=>x.p.ok);
  if(!options.length){pinOrPass(true);return}
  options.forEach(o=>{const c=C[o.k];o.score=(c.damage||0)*1.4+(c.momentum||0)+Math.random()*18+(c.finisher&&state.player.health<50?70:0)});options.sort((a,b)=>b.score-a.score);
  const pick=options[0],key=consumeCard(f,pick.i),category=attackCategory(C[key]);state.pendingAttack={key,category};
  const hasReverse=matchingReversalIndex(state.player,category)>=0;say(`${W[f.id].shortName} attempts ${C[key].name}. ${hasReverse?`Play Reverse ${category} now.`:'You have no matching reversal.'}`);renderMatch();
  if(!hasReverse)cpuTimer=setTimeout(()=>resolvePendingCpuAttack(false),850);
}
function resolvePendingCpuAttack(reversed){
  if(!state.pendingAttack||state.ended)return;const key=state.pendingAttack.key;state.pendingAttack=null;
  if(reversed){transferPossession('player');return}
  const result=applyMove(state.cpu,state.player,key);say(result.text);renderMatch();
  if(result.landed)cpuTimer=setTimeout(cpuSequence,700);else transferPossession('player');
}
function playerReverse(index){
  if(!state.pendingAttack||state.possession!=='cpu')return;const p=playability(state.player.hand[index],state.player);if(!p.ok){say(p.why);return}
  const key=consumeCard(state.player,index),rev=C[key],attack=C[state.pendingAttack.key],chance=clamp(rev.accuracy+(W[state.player.id].stats.ringIQ-W[state.cpu.id].stats.ringIQ)*.15,45,94);
  state.turn++;if(Math.random()*100<=chance){state.player.momentum=clamp(state.player.momentum+rev.momentum,0,100);state.cpu.health=clamp(state.cpu.health-(rev.damage||0),0,100);state.control=clamp(state.control+8,5,95);state.pendingAttack=null;updatePhase();transferPossession('player',`${W[state.player.id].shortName} uses ${rev.name} to counter ${attack.name} and takes possession.`)}else{say(`${rev.name} fails. ${W[state.cpu.id].shortName}'s ${attack.name} continues.`);renderMatch();cpuTimer=setTimeout(()=>resolvePendingCpuAttack(false),450)}
}
function pinChance(f,opp,bonus=0){let chance=(100-opp.health)*.72+bonus+(f.momentum*.08)-(opp.momentum*.05)+(W[f.id].stats.power-W[opp.id].stats.resilience)*.15;if(f.lastCard&&C[f.lastCard]?.finisher)chance+=C[f.lastCard].pinBonus||25;return clamp(Math.round(chance),3,94)}
function pinOrPass(isCpu=false){
  const actor=isCpu?state.cpu:state.player,opp=stateOpponent(actor);if(state.ended)return;
  const vulnerable=opp.health<=35||C[actor.lastCard]?.finisher;
  if(vulnerable){const chance=pinChance(actor,opp),roll=Math.random()*100;state.nearFalls++;state.turn++;if(roll<=chance){say(`${W[actor.id].shortName} covers — one, two, three!`);endMatch(actor);return}say(`${W[opp.id].shortName} kicks out! The failed cover ends ${W[actor.id].shortName}'s possession.`);opp.momentum=clamp(opp.momentum+10,0,100)}else say(`${W[actor.id].shortName} cannot continue the sequence and gives up possession.`);
  transferPossession(actor===state.player?'cpu':'player');
}
function playableOffence(f){return f.hand.some(k=>!isReversal(k)&&basicPlayability(k,f).ok)}
function redraw(){if(!state.player.redraw||state.possession!=='player')return;say('You redraw your entire hand.');state.player.hand=[];state.player.redraw=false;drawToFive(state.player);renderMatch()}
function updatePhase(){const avg=(state.player.health+state.cpu.health)/2;if(state.turn>=18||avg<50)state.phase='Finishing';else if(state.turn>=7||avg<78)state.phase='Middle';else state.phase='Opening'}
function endMatch(winner){clearTimeout(cpuTimer);state.ended=true;const loser=stateOpponent(winner),base=1.5+Math.min(2,state.turn/10)+Math.min(.75,state.variety.size/20)+Math.min(.5,state.nearFalls*.12)+Math.min(.5,state.finishers*.12)+state.crowd/250,stars=Math.round(clamp(base,1,5)*2)/2;$('#winnerPortrait').src=W[winner.id].portrait;$('#winnerName').textContent=`${W[winner.id].name} wins`;$('#resultSummary').textContent=`${W[loser.id].shortName} was defeated after ${state.turn} card plays. The match featured ${state.variety.size} different cards, possession changes and ${state.nearFalls} pin attempt${state.nearFalls===1?'':'s'}.`;$('#rating').textContent='★'.repeat(Math.floor(stars))+(stars%1?'½':'')+`  ${stars.toFixed(1)}`;setTimeout(()=>show('result'),650)}
function say(t){state.log.unshift(t);state.log=state.log.slice(0,14);$('#message').textContent=t;renderLog()}
function renderLog(){$('#log').innerHTML=state.log.map(t=>`<div>${t}</div>`).join('')}
function renderMatch(){
  const p=state.player,c=state.cpu;$('#playerPortrait').src=W[p.id].portrait;$('#cpuPortrait').src=W[c.id].portrait;$('#playerName').textContent=W[p.id].name;$('#cpuName').textContent=W[c.id].name;
  [['player',p],['cpu',c]].forEach(([pre,f])=>{$(`#${pre}HealthText`).textContent=f.health;$(`#${pre}HealthBar`).style.width=f.health+'%';$(`#${pre}MomentumText`).textContent=f.momentum;$(`#${pre}MomentumBar`).style.width=f.momentum+'%'});
  $('#playerControl').textContent=state.control;$('#cpuControl').textContent=100-state.control;$('#controlBar').style.width=state.control+'%';$('#position').textContent=`Position: ${state.position}`;$('#crowd').textContent=`Crowd ${state.crowd}`;$('#phaseBadge').textContent=state.phase;
  $('#turnLabel').textContent=state.possession==='player'?'Your possession':state.pendingAttack?'Reverse now':'CPU possession';$('#redrawBtn').disabled=!p.redraw||state.possession!=='player';
  const noOffence=state.possession==='player'&&!playableOffence(p);$('#pinBtn').hidden=state.possession==='player'?!noOffence:false;$('#pinBtn').textContent='Pin / Pass';
  if(state.possession==='cpu'&&state.pendingAttack){$('#pinBtn').hidden=false;$('#pinBtn').textContent='Take the Hit'}
  $('#handTitle').textContent=state.possession==='player'?'Your Attack':'Your Reversals';$('#handHelp').textContent=state.possession==='player'?'Keep playing until reversed.':'Only the matching reversal can take possession.';
  renderHand();renderLog();
}
function renderHand(){
  const f=state.player;$('#hand').innerHTML=f.hand.map((k,i)=>{const c=C[k],p=playability(k,f),acc=isReversal(k)?c.accuracy:effectiveAccuracy(c,f,state.cpu),req=p.ok?(isReversal(k)?`Reverses ${c.reverse}`:'Playable now'):p.why,combo=f.combo===c.name?'<div class="combo">COMBO READY · +10% accuracy</div>':c.combo?`<div class="combo">Sets up ${C[c.combo].name}</div>`:'';return `<button class="gameCard ${p.ok?'':'unplayable'}" data-card="${i}" ${p.ok?'':'disabled'}><span class="type">${c.type}</span><h4>${c.name}</h4><div class="requirement">${req}</div>${combo}<div class="cardStats"><div class="cardStat"><span>Damage</span><b>${c.damage||0}</b></div><div class="cardStat"><span>Momentum</span><b>${c.momentum>=0?'+':''}${c.momentum||0}</b></div><div class="cardStat"><span>Cost</span><b>${c.cost||0}</b></div><div class="cardStat"><span>Accuracy</span><b>${acc}%</b></div></div></button>`}).join('');
  $$('[data-card]').forEach(b=>b.addEventListener('click',()=>state.possession==='player'?playerAttack(Number(b.dataset.card)):playerReverse(Number(b.dataset.card))))
}
function renderRoster(){$('#roster').innerHTML=Object.values(W).map(w=>`<button class="rosterCard" data-w="${w.id}"><img src="${w.portrait}"><div class="rosterInfo"><h3>${w.name}</h3><p>${w.era} persona</p><div class="stats"><span>Power ${w.stats.power}</span><span>Speed ${w.stats.speed}</span><span>Brawling ${w.stats.brawling}</span><span>Technique ${w.stats.technique}</span><span>Ring IQ ${w.stats.ringIQ}</span><span>Resilience ${w.stats.resilience}</span></div></div></button>`).join('');$$('[data-w]').forEach(b=>b.onclick=()=>startMatch(b.dataset.w))}
$('#startBtn').onclick=()=>{renderRoster();show('select')};$('#quitBtn').onclick=()=>{clearTimeout(cpuTimer);show('menu')};$('#redrawBtn').onclick=redraw;$('#pinBtn').onclick=()=>{if(state.possession==='cpu'&&state.pendingAttack)resolvePendingCpuAttack(false);else pinOrPass(false)};$('#rematchBtn').onclick=()=>startMatch(selected);$$('[data-back]').forEach(b=>b.onclick=()=>show(b.dataset.back));
})();

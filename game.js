(() => {
'use strict';
const D=window.LWC_DATA,C=D.cards,W=D.wrestlers;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let state=null,selected=Object.keys(W)[0],cpuTimer=null;
const screens=['menu','select','match','result'];
const REVERSALS=['reverseStrike','reverseGrapple','reverseAerial','reverseSubmission','reverseControl'];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const other=id=>Object.keys(W).find(k=>k!==id)||id;
const isReversal=k=>C[k]?.type==='Reversal';
const isAction=k=>C[k]?.type==='Action';
const show=id=>{screens.forEach(x=>$('#'+x).classList.toggle('active',x===id));window.scrollTo(0,0)};
function opponentOf(f){return f===state.player?state.cpu:state.player}
function category(card){
  if(card.type==='Aerial'||card.tags?.includes('aerial'))return'Aerial';
  if(card.type==='Submission'||card.tags?.includes('submission'))return'Submission';
  if(card.type==='Control'||card.tags?.includes('control'))return'Control';
  if(card.type==='Strike'||card.tags?.includes('strike'))return'Strike';
  return'Grapple';
}
function makeFighter(id){return{id,health:100,momentum:0,hand:[],discard:[],usedOnce:new Set(),guard:0,combo:null,lastCard:null}}
function canDraw(k,f){const c=C[k];return !!c&&c.type!=='Pin'&&!(c.once&&f.usedOnce.has(k))&&!(c.finisher&&(state.turn<4||f.momentum<24))&&!(c.onlyBehind&&f.health>=opponentOf(f).health-12)}
function library(f){return W[f.id].library.filter(k=>canDraw(k,f))}
function randomFrom(list){return list.length?list[Math.floor(Math.random()*list.length)]:null}
function drawUnique(f,excluded=new Set()){
  const held=new Set(f.hand),pool=library(f).filter(k=>!held.has(k)&&!excluded.has(k));
  return randomFrom(pool);
}
function drawReplacement(f,excluded=new Set()){
  const k=drawUnique(f,excluded);if(k)f.hand.push(k);return k;
}
function openingHand(f){
  const used=new Set(),pick=(pool)=>{const k=randomFrom(pool.filter(x=>!used.has(x)&&canDraw(x,f)));if(k)used.add(k);return k};
  const zeroPreferred=['punch','kick'].filter(k=>W[f.id].library.includes(k));
  while(used.size<2){const k=pick(zeroPreferred.length?zeroPreferred:library(f).filter(x=>!isReversal(x)&&!isAction(x)&&(C[x].cost||0)===0));if(!k)break}
  pick(library(f).filter(x=>category(C[x])==='Grapple'&&!isReversal(x)&&!isAction(x)));
  pick(library(f).filter(isReversal));
  while(used.size<5){const k=pick(library(f));if(!k)break}
  f.hand=[...used];
}
function beginsWithCounter(k,attackKey){const c=C[k];return !!c&&(c.counter===attackKey||(isReversal(k)&&c.reverse===category(C[attackKey])))}
function matchingReversalIndex(defender,attackKey){return defender.hand.findIndex(k=>beginsWithCounter(k,attackKey)&&basicPlayability(k,defender).ok)}
function basicPlayability(k,f){const c=C[k],opp=opponentOf(f);if(!c)return{ok:false,why:'Unavailable'};if((c.cost||0)>f.momentum)return{ok:false,why:`Needs ${c.cost} momentum`};if(c.once&&f.usedOnce.has(k))return{ok:false,why:'Already used'};if(c.onlyBehind&&f.health>=opp.health-12)return{ok:false,why:'Only available when badly behind'};if(c.finisher&&state.phase==='Opening')return{ok:false,why:'Unavailable in the opening'};return{ok:true,why:''}}
function playability(k,f){const b=basicPlayability(k,f);if(!b.ok)return b;if(f===state.player){if(state.possession==='player')return isReversal(k)?{ok:false,why:'Reversal card'}:{ok:true,why:''};if(!state.pendingAttack)return{ok:false,why:'Opponent has possession'};return beginsWithCounter(k,state.pendingAttack.key)?{ok:true,why:''}:{ok:false,why:'No matching reversal'}}return state.possession==='cpu'&&!isReversal(k)?{ok:true,why:''}:{ok:false,why:'Not an attack'} }
function removeAndReplace(f,index,excluded=new Set()){
  const key=f.hand[index];f.hand.splice(index,1);f.discard.push(key);if(C[key]?.once)f.usedOnce.add(key);drawReplacement(f,new Set([...excluded,key]));return key;
}
function pushPile(key,owner,status='pending'){state.pile.push({key,owner,status,id:Date.now()+Math.random()});state.pile=state.pile.slice(-5);renderPile()}
function setPileStatus(status){if(state.pile.length)state.pile[state.pile.length-1].status=status;renderPile()}
function startMatch(playerId){
  clearTimeout(cpuTimer);selected=playerId;
  state={player:makeFighter(playerId),cpu:makeFighter(other(playerId)),position:'standing',crowd:0,control:50,turn:0,phase:'Opening',log:[],ended:false,nearFalls:0,variety:new Set(),finishers:0,possession:'player',pendingAttack:null,discardPhase:false,discardSelected:new Set(),playerPossessions:1,pile:[]};
  openingHand(state.player);openingHand(state.cpu);show('match');say(`${W[state.player.id].name} faces ${W[state.cpu.id].name}. The bell rings. ${W[state.player.id].shortName} has the opening possession.`);renderMatch();
}
function beginDiscardPhase(){if(state.ended||state.possession!=='player')return;state.discardPhase=true;state.discardSelected=new Set();renderMatch()}
function toggleDiscard(i){if(!state.discardPhase)return;state.discardSelected.has(i)?state.discardSelected.delete(i):state.discardSelected.add(i);renderMatch()}
function confirmDiscard(){
  if(!state.discardPhase)return;const indices=[...state.discardSelected].sort((a,b)=>b-a),rejected=new Set();
  indices.forEach(i=>{const k=state.player.hand[i];if(k){rejected.add(k);state.player.discard.push(k);state.player.hand.splice(i,1)}});
  while(state.player.hand.length<5){const k=drawReplacement(state.player,rejected);if(!k)break}
  state.discardPhase=false;state.discardSelected.clear();say(indices.length?`You discard ${indices.length} card${indices.length===1?'':'s'} and draw ${indices.length} replacement${indices.length===1?'':'s'}.`:'You keep your hand.');renderMatch();
}
function cardDamage(c,f){let d=c.damage||0;if(c.type==='Strike'&&W[f.id].traits.strikeDamage)d*=W[f.id].traits.strikeDamage;if(state.phase==='Finishing')d*=1.08;return Math.round(d)}
function applySuccessfulCard(actor,opp,key){
  const c=C[key];actor.momentum=clamp(actor.momentum-(c.cost||0),0,100);state.turn++;state.variety.add(key);
  let dmg=cardDamage(c,actor);if(opp.guard){dmg=Math.round(dmg*(1-opp.guard));opp.guard=0}opp.health=clamp(opp.health-dmg,0,100);
  let gain=c.momentum||0;if(W[actor.id].traits.crowdFromAggression&&c.tags?.includes('aggressive'))gain*=W[actor.id].traits.crowdFromAggression;actor.momentum=clamp(actor.momentum+Math.round(gain),0,100);
  if(c.heal)actor.health=clamp(actor.health+c.heal,0,100);if(c.guard)actor.guard=c.guard;if(c.result&&c.result!=='same')state.position=c.result;if(c.combo)actor.combo=C[c.combo]?.name||null;actor.lastCard=key;
  if(c.finisher){state.finishers++;actor.combo=null}state.crowd=clamp(state.crowd+Math.round((dmg+gain+(c.crowd||0))/5),0,100);
  state.control=clamp(state.control+(actor===state.player?1:-1)*Math.round((dmg+gain*.4)/4),5,95);updatePhase();
  return isAction(key)?`${W[actor.id].shortName} uses ${c.name} and gains ${gain} momentum.`:`${W[actor.id].shortName} hits ${c.name}${dmg?` for ${dmg} damage`:''} and keeps possession.`;
}
function flashSuccess(){setPileStatus('success');setTimeout(()=>{if(!state?.ended&&state.pile.length){state.pile[state.pile.length-1].status='resolved';renderPile()}},650)}
function playerAttack(index){
  if(state.ended||state.possession!=='player'||state.discardPhase)return;const p=playability(state.player.hand[index],state.player);if(!p.ok){say(p.why);return}
  const key=removeAndReplace(state.player,index),c=C[key];pushPile(key,'player','pending');renderHand();
  if(isAction(key)){const text=applySuccessfulCard(state.player,state.cpu,key);flashSuccess();say(text);if(checkForcedFinish(state.player,state.cpu))return;renderMatch();return}
  const ri=matchingReversalIndex(state.cpu,key);
  if(ri>=0){const rkey=removeAndReplace(state.cpu,ri);setTimeout(()=>{pushPile(rkey,'cpu','reversal');state.cpu.momentum=clamp(state.cpu.momentum+(C[rkey].momentum||0),0,100);state.player.health=clamp(state.player.health-(C[rkey].damage||0),0,100);state.turn++;updatePhase();transferPossession('cpu',`${W[state.cpu.id].shortName} plays ${C[rkey].name} over ${c.name} and takes control.`)},350);return}
  const text=applySuccessfulCard(state.player,state.cpu,key);flashSuccess();say(text);if(checkForcedFinish(state.player,state.cpu))return;renderMatch();
}
function cpuSequence(){
  if(state.ended||state.possession!=='cpu'||state.pendingAttack)return;
  let options=state.cpu.hand.map((k,i)=>({k,i,p:playability(k,state.cpu)})).filter(x=>x.p.ok);
  if(!options.length){const idx=state.cpu.hand.findIndex(isReversal);if(idx>=0){state.cpu.discard.push(state.cpu.hand.splice(idx,1)[0]);drawReplacement(state.cpu)}options=state.cpu.hand.map((k,i)=>({k,i,p:playability(k,state.cpu)})).filter(x=>x.p.ok)}
  if(!options.length){transferPossession('player',`${W[state.cpu.id].shortName} gives up possession.`);return}
  options.forEach(o=>{const c=C[o.k];o.score=(c.damage||0)*1.5+(c.momentum||0)+Math.random()*12+(c.finisher&&state.player.health<45?60:0)});options.sort((a,b)=>b.score-a.score);
  const pick=options[0],key=removeAndReplace(state.cpu,pick.i);pushPile(key,'cpu','pending');
  if(isAction(key)){const text=applySuccessfulCard(state.cpu,state.player,key);flashSuccess();say(text);if(checkForcedFinish(state.cpu,state.player))return;renderMatch();cpuTimer=setTimeout(cpuSequence,650);return}
  state.pendingAttack={key};const has=matchingReversalIndex(state.player,key)>=0;say(`${W[state.cpu.id].shortName} plays ${C[key].name}.${has?' Play a matching reversal.':''}`);renderMatch();if(!has)cpuTimer=setTimeout(resolveCpuAttack,700);
}
function resolveCpuAttack(){if(!state.pendingAttack||state.ended)return;const key=state.pendingAttack.key;state.pendingAttack=null;const text=applySuccessfulCard(state.cpu,state.player,key);flashSuccess();say(text);if(checkForcedFinish(state.cpu,state.player))return;renderMatch();cpuTimer=setTimeout(cpuSequence,650)}
function playerReverse(index){
  if(!state.pendingAttack||state.possession!=='cpu')return;const p=playability(state.player.hand[index],state.player);if(!p.ok)return;
  const attack=state.pendingAttack.key,key=removeAndReplace(state.player,index);pushPile(key,'player','reversal');state.pendingAttack=null;state.player.momentum=clamp(state.player.momentum+(C[key].momentum||0),0,100);state.cpu.health=clamp(state.cpu.health-(C[key].damage||0),0,100);state.turn++;updatePhase();transferPossession('player',`${W[state.player.id].shortName} plays ${C[key].name} over ${C[attack].name} and takes control.`)
}
function transferPossession(to,reason){
  clearTimeout(cpuTimer);state.possession=to;state.pendingAttack=null;state.discardPhase=false;state.discardSelected=new Set();if(reason)say(reason);
  if(to==='player'){state.playerPossessions++;renderMatch();if(state.playerPossessions>1)beginDiscardPhase();return}
  renderMatch();cpuTimer=setTimeout(cpuSequence,650);
}
function pinChance(f,opp,bonus=0){if(opp.health<=0)return 100;let chance=(100-opp.health)*.72+bonus+(f.momentum*.08)-(opp.momentum*.05)+(W[f.id].stats.power-W[opp.id].stats.resilience)*.15;if(f.lastCard&&C[f.lastCard]?.finisher)chance+=C[f.lastCard].pinBonus||25;return clamp(Math.round(chance),3,94)}
function checkForcedFinish(actor,opp){if(opp.health>0)return false;state.nearFalls++;state.turn++;say(`${W[actor.id].shortName} makes the cover — one, two, three!`);endMatch(actor);return true}
function pinOrPass(isCpu=false){const actor=isCpu?state.cpu:state.player,opp=opponentOf(actor);if(state.ended)return;const vulnerable=opp.health<=35||C[actor.lastCard]?.finisher;if(vulnerable){const chance=pinChance(actor,opp);state.nearFalls++;state.turn++;if(Math.random()*100<=chance){say(`${W[actor.id].shortName} covers — one, two, three!`);endMatch(actor);return}say(`${W[opp.id].shortName} kicks out!`);opp.momentum=clamp(opp.momentum+10,0,100)}transferPossession(actor===state.player?'cpu':'player')}
function updatePhase(){const avg=(state.player.health+state.cpu.health)/2;if(state.turn>=18||avg<50)state.phase='Finishing';else if(state.turn>=7||avg<78)state.phase='Middle';else state.phase='Opening'}
function endMatch(winner){clearTimeout(cpuTimer);state.ended=true;const loser=opponentOf(winner),base=1.5+Math.min(2,state.turn/10)+Math.min(.75,state.variety.size/20)+Math.min(.5,state.nearFalls*.12)+Math.min(.5,state.finishers*.12)+state.crowd/250,stars=Math.round(clamp(base,1,5)*2)/2;$('#winnerPortrait').src=W[winner.id].portrait;$('#winnerName').textContent=`${W[winner.id].name} wins`;$('#resultSummary').textContent=`${W[loser.id].shortName} was defeated after ${state.turn} card plays.`;$('#rating').textContent='★'.repeat(Math.floor(stars))+(stars%1?'½':'')+`  ${stars.toFixed(1)}`;setTimeout(()=>show('result'),650)}
function say(t){state.log.unshift(t);state.log=state.log.slice(0,14);$('#message').textContent=t;renderLog()}
function renderLog(){$('#log').innerHTML=state.log.map(t=>`<div>${t}</div>`).join('')}
function cardMarkup(k,i,mode='hand'){
  const c=C[k],selected=state.discardPhase&&state.discardSelected.has(i),p=mode==='hand'?(state.discardPhase?{ok:true,why:''}:playability(k,state.player)):{ok:true,why:''};
  const cls=`gameCard type-${String(c.type||'other').toLowerCase()} ${p.ok?'':'unplayable'} ${selected?'discardSelected':''} ${c.image?'hasArt':''}`;
  const stat=(label,val)=>`<div class="cardStat"><span>${label}</span><b>${val}</b></div>`;
  return `<button class="${cls}" data-card="${i}" ${p.ok?'':'disabled'}>${c.image?`<div class="cardArt" style="background-image:url('${c.image}')"></div>`:''}<h4>${c.name}</h4>${!p.ok?`<div class="requirement">${p.why}</div>`:''}<div class="cardStats">${stat('DMG',c.damage||0)}${stat('MOM',(c.momentum||0)>=0?`+${c.momentum||0}`:c.momentum)}${stat('COST',c.cost||0)}</div></button>`;
}
function renderPile(){
  const el=$('#playedPile');if(!el)return;if(!state.pile.length){el.innerHTML='<div class="pileEmpty">Played pile</div>';return}
  el.innerHTML=state.pile.slice(-3).map((x,n,a)=>{const c=C[x.key];return `<div class="pileCard type-${String(c.type||'other').toLowerCase()} ${x.status}" style="--stack:${n}">${c.image?`<div class="pileArt" style="background-image:url('${c.image}')"></div>`:''}<strong>${c.name}</strong>${x.status==='success'?'<span class="successFlash">SUCCESS</span>':''}${x.status==='reversal'?'<span class="reversalFlash">REVERSED</span>':''}</div>`}).join('')
}
function renderHand(){$('#hand').innerHTML=state.player.hand.map((k,i)=>cardMarkup(k,i)).join('');$$('[data-card]').forEach(b=>b.onclick=()=>state.discardPhase?toggleDiscard(+b.dataset.card):state.possession==='player'?playerAttack(+b.dataset.card):playerReverse(+b.dataset.card))}
function renderMatch(){
  const p=state.player,c=state.cpu;$('#playerPortrait').src=W[p.id].portrait;$('#cpuPortrait').src=W[c.id].portrait;$('#playerName').textContent=W[p.id].name;$('#cpuName').textContent=W[c.id].name;
  [['player',p],['cpu',c]].forEach(([pre,f])=>{$(`#${pre}HealthText`).textContent=f.health;$(`#${pre}HealthBar`).style.width=f.health+'%';$(`#${pre}MomentumText`).textContent=f.momentum;$(`#${pre}MomentumBar`).style.width=f.momentum+'%'});
  $('#playerControl').textContent=state.control;$('#cpuControl').textContent=100-state.control;$('#controlBar').style.width=state.control+'%';$('#position').textContent=`Position: ${state.position}`;$('#crowd').textContent=`Crowd ${state.crowd}`;$('#phaseBadge').textContent=state.phase;
  $('#turnLabel').textContent=state.discardPhase?'Refresh your hand':state.possession==='player'?'Your possession':state.pendingAttack?'Counter now':'Opponent thinking…';
  $('#redrawBtn').hidden=!(state.possession==='player'&&state.discardPhase);$('#redrawBtn').textContent=state.discardSelected.size?`Draw ${state.discardSelected.size}`:'Keep Hand';
  const vulnerable=state.cpu.health<=35||C[state.player.lastCard]?.finisher;$('#pinBtn').hidden=state.possession!=='player'||state.discardPhase;$('#pinBtn').textContent=vulnerable?'Attempt Pin':'Pass Possession';
  $('#handTitle').textContent=state.discardPhase?'Choose Discards':state.possession==='player'?'Your Hand':'Your Reversals';renderPile();renderHand();renderLog();
}
function renderRoster(){$('#roster').innerHTML=Object.values(W).map(w=>`<button class="rosterCard" data-w="${w.id}"><img src="${w.portrait}"><div class="rosterInfo"><h3>${w.name}</h3><p>${w.era} persona</p><div class="stats"><span>Power ${w.stats.power}</span><span>Speed ${w.stats.speed}</span><span>Brawling ${w.stats.brawling}</span><span>Technique ${w.stats.technique}</span><span>Ring IQ ${w.stats.ringIQ}</span><span>Resilience ${w.stats.resilience}</span></div></div></button>`).join('');$$('[data-w]').forEach(b=>b.onclick=()=>startMatch(b.dataset.w))}
$('#startBtn').onclick=()=>{renderRoster();show('select')};$('#quitBtn').onclick=()=>{clearTimeout(cpuTimer);show('menu')};$('#redrawBtn').onclick=confirmDiscard;$('#pinBtn').onclick=()=>pinOrPass(false);$('#rematchBtn').onclick=()=>startMatch(selected);$$('[data-back]').forEach(b=>b.onclick=()=>show(b.dataset.back));
})();

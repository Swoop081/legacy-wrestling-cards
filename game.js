(() => {
'use strict';
const D=window.LWC_DATA,C=D.cards,W=D.wrestlers;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let state=null,selected=Object.keys(W)[0],cpuTimer=null;
const screens=['menu','select','match','result'];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const other=id=>Object.keys(W).find(k=>k!==id)||id;
const isReversal=k=>C[k]?.type==='Reversal';
const isAction=k=>C[k]?.type==='Action';
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const show=id=>{screens.forEach(x=>$('#'+x).classList.toggle('active',x===id));window.scrollTo(0,0)};
function opponentOf(f){return f===state.player?state.cpu:state.player}
function category(card){
  if(card.type==='Aerial'||card.tags?.includes('aerial'))return'Aerial';
  if(card.type==='Submission'||card.tags?.includes('submission'))return'Submission';
  if(card.type==='Control'||card.tags?.includes('control'))return'Control';
  if(card.type==='Strike'||card.tags?.includes('strike'))return'Strike';
  return'Grapple';
}
function makeFighter(id){return{id,health:100,momentum:0,hand:[],deck:[],discard:[],usedOnce:new Set(),guard:0,lastCard:null,actionUsed:false,chain:0}}
function canEnterDeck(k,f){const c=C[k];return !!c&&c.type!=='Pin'&&!(c.once&&f.usedOnce.has(k))}
function buildDeck(f){f.deck=shuffle(W[f.id].library.filter(k=>canEnterDeck(k,f)).slice())}
function recycleDeck(f){if(!f.deck.length&&f.discard.length){f.deck=shuffle(f.discard.splice(0).filter(k=>canEnterDeck(k,f)))}}
function drawCard(f,preferred=null){
  recycleDeck(f);if(!f.deck.length)return null;
  let idx=-1;if(preferred)idx=f.deck.findIndex(preferred);if(idx<0)idx=0;
  const k=f.deck.splice(idx,1)[0];f.hand.push(k);return k;
}
function drawMany(f,n,preferred=null){const out=[];for(let i=0;i<n;i++){const k=drawCard(f,i===0?preferred:null);if(!k)break;out.push(k)}return out}
function openingHand(f){
  buildDeck(f);const take=pred=>drawCard(f,pred);
  take(k=>(C[k].cost||0)===0&&!isReversal(k)&&!isAction(k));
  take(k=>(C[k].cost||0)===0&&!isReversal(k)&&!isAction(k));
  take(k=>category(C[k])==='Grapple'&&!isReversal(k)&&!isAction(k));
  take(k=>isReversal(k));
  take(k=>true);
  while(f.hand.length<5&&drawCard(f));
}
function beginsWithCounter(k,attackKey){const c=C[k];return !!c&&(c.counter===attackKey||(isReversal(k)&&c.reverse===category(C[attackKey])))}
function basicPlayability(k,f){
  const c=C[k],opp=opponentOf(f);if(!c)return{ok:false,why:'Unavailable'};
  if((c.cost||0)>f.momentum)return{ok:false,why:`Needs ${c.cost} momentum`};
  if(c.once&&f.usedOnce.has(k))return{ok:false,why:'Already used'};
  if(c.onlyBehind&&f.health>=opp.health-12)return{ok:false,why:'Only available when badly behind'};
  if(c.finisher&&(state.phase==='Opening'||f.momentum<(c.cost||0)))return{ok:false,why:'Build more momentum'};
  if(isAction(k)&&f.actionUsed)return{ok:false,why:'One action per possession'};
  return{ok:true,why:''};
}
function playability(k,f){
  const b=basicPlayability(k,f);if(!b.ok)return b;
  if(f===state.player){
    if(state.possession==='player')return isReversal(k)?{ok:false,why:'Reversal card'}:{ok:true,why:''};
    if(!state.pendingAttack)return{ok:false,why:'Opponent has possession'};
    return beginsWithCounter(k,state.pendingAttack.key)?{ok:true,why:''}:{ok:false,why:'No matching reversal'};
  }
  return state.possession==='cpu'&&!isReversal(k)?{ok:true,why:''}:{ok:false,why:'Not an attack'};
}
function sortHand(f){
  const order=f.hand.map((k,i)=>({k,i,p:playability(k,f).ok}));
  order.sort((a,b)=>{
    const ap=Number(a.p),bp=Number(b.p); if(bp!==ap)return bp-ap;
    const ac=C[a.k],bc=C[b.k];
    const apr=ap&&ac?.finisher?3:ap&&ac?.tags?.includes('signature')?2:0;
    const bpr=bp&&bc?.finisher?3:bp&&bc?.tags?.includes('signature')?2:0;
    return bpr-apr||a.i-b.i;
  });f.hand=order.map(x=>x.k);
}
function useCard(f,index){const key=f.hand.splice(index,1)[0];f.discard.push(key);if(C[key]?.once)f.usedOnce.add(key);if(f.hand.length<5)drawCard(f);return key}
function defenderDraw(defender,attackKey){
  const forceReversal=opponentOf(defender).chain>=3;
  const pref=forceReversal?(k=>beginsWithCounter(k,attackKey)):null;
  if(defender.hand.length<5)drawCard(defender,pref);sortHand(defender);
}

function animatePlayedCard(key,owner,done){
  const c=C[key],stage=document.createElement('div');
  stage.className=`playAnimation owner-${owner} type-${String(c.type||'other').toLowerCase()} ${c.finisher?'is-finisher':c.tags?.includes('signature')?'is-signature':''}`;
  stage.innerHTML=`${c.image?`<div class="playAnimationArt" style="background-image:url('${c.image}')"></div>`:''}<strong>${c.name}</strong>`;
  document.body.appendChild(stage);
  requestAnimationFrame(()=>stage.classList.add('active'));
  setTimeout(()=>{stage.classList.add('land');setTimeout(()=>{stage.remove();done?.()},220)},520);
}

function pushPile(key,owner,status='pending'){state.pile.push({key,owner,status,id:Date.now()+Math.random()});state.pile=state.pile.slice(-6);renderPile()}
function setPileStatus(status){if(state.pile.length)state.pile[state.pile.length-1].status=status;renderPile()}
function startMatch(playerId){
  clearTimeout(cpuTimer);selected=playerId;
  state={player:makeFighter(playerId),cpu:makeFighter(other(playerId)),position:'standing',crowd:0,control:50,turn:0,phase:'Opening',log:[],ended:false,nearFalls:0,variety:new Set(),finishers:0,possession:'player',pendingAttack:null,pile:[]};
  openingHand(state.player);openingHand(state.cpu);sortHand(state.player);show('match');say(`${W[state.player.id].name} faces ${W[state.cpu.id].name}. The bell rings. ${W[state.player.id].shortName} has the opening possession.`);renderMatch();
}
function cardDamage(c,f){let d=c.damage||0;if(c.type==='Strike'&&W[f.id].traits.strikeDamage)d*=W[f.id].traits.strikeDamage;if(state.phase==='Finishing')d*=1.06;return Math.round(d)}
function resolveCard(actor,opp,key,{reversal=false}={}){
  const c=C[key];actor.momentum=clamp(actor.momentum-(c.cost||0),0,100);state.turn++;state.variety.add(key);
  let dmg=cardDamage(c,actor);if(opp.guard){dmg=Math.round(dmg*(1-opp.guard));opp.guard=0}opp.health=clamp(opp.health-dmg,0,100);
  let gain=c.momentum||0;if(W[actor.id].traits.crowdFromAggression&&c.tags?.includes('aggressive'))gain*=W[actor.id].traits.crowdFromAggression;actor.momentum=clamp(actor.momentum+Math.round(gain),0,100);
  if(c.heal)actor.health=clamp(actor.health+c.heal,0,100);if(c.guard)actor.guard=c.guard;if(c.result&&c.result!=='same')state.position=c.result;actor.lastCard=key;
  if(isAction(key))actor.actionUsed=true;if(c.finisher)state.finishers++;
  state.crowd=clamp(state.crowd+Math.round((dmg+gain+(c.crowd||0))/5),0,100);state.control=clamp(state.control+(actor===state.player?1:-1)*Math.round((dmg+gain*.4)/4),5,95);
  if(dmg>0)defenderDraw(opp,key);updatePhase();
  return reversal?`${W[actor.id].shortName} counters with ${c.name} and takes possession.`:isAction(key)?`${W[actor.id].shortName} uses ${c.name}.`:`${W[actor.id].shortName} hits ${c.name}${dmg?` for ${dmg} damage`:''} and keeps possession.`;
}
function flashSuccess(){setPileStatus('success');setTimeout(()=>{if(!state?.ended&&state.pile.length){state.pile[state.pile.length-1].status='resolved';renderPile()}},650)}
function matchingReversalIndex(defender,attackKey){return defender.hand.findIndex(k=>beginsWithCounter(k,attackKey)&&basicPlayability(k,defender).ok)}
function playerAttack(index){
  if(state.ended||state.possession!=='player')return;sortHand(state.player);const p=playability(state.player.hand[index],state.player);if(!p.ok){say(p.why);return}
  const key=useCard(state.player,index);sortHand(state.player);renderHand();
  animatePlayedCard(key,'player',()=>{
    if(state.ended)return;const c=C[key];pushPile(key,'player','pending');
    if(isAction(key)){const text=resolveCard(state.player,state.cpu,key);flashSuccess();say(text);renderMatch();return}
    const ri=matchingReversalIndex(state.cpu,key);
    if(ri>=0){const rkey=useCard(state.cpu,ri);animatePlayedCard(rkey,'cpu',()=>{pushPile(rkey,'cpu','reversal');const text=resolveCard(state.cpu,state.player,rkey,{reversal:true});transferPossession('cpu',text)});return}
    state.player.chain++;const text=resolveCard(state.player,state.cpu,key);flashSuccess();say(text);afterSuccessfulMove(state.player,state.cpu);renderMatch();
  });
}
function afterSuccessfulMove(actor,opp){
  if(state.ended)return;
  if(shouldPin(actor,opp)){if(actor===state.cpu){cpuTimer=setTimeout(()=>pinAttempt(actor),500)}return}
  if(state.turn>=60){say(`The referee stops the match after sustained punishment.`);endMatch(actor);return}
}
function cpuSequence(){
  if(state.ended||state.possession!=='cpu'||state.pendingAttack)return;sortHand(state.cpu);
  if(shouldPin(state.cpu,state.player)&&Math.random()<0.72){pinAttempt(state.cpu);return}
  let options=state.cpu.hand.map((k,i)=>({k,i,p:playability(k,state.cpu)})).filter(x=>x.p.ok);
  if(!options.length){drawCard(state.cpu,k=>(C[k].cost||0)===0&&!isReversal(k));sortHand(state.cpu);options=state.cpu.hand.map((k,i)=>({k,i,p:playability(k,state.cpu)})).filter(x=>x.p.ok)}
  if(!options.length){transferPossession('player',`${W[state.cpu.id].shortName} cannot continue the sequence.`);return}
  options.forEach(o=>{const c=C[o.k];o.score=(c.damage||0)*1.5+(c.momentum||0)+Math.random()*10+(c.finisher&&state.player.health<45?70:0)-(isAction(o.k)&&state.cpu.actionUsed?100:0)});options.sort((a,b)=>b.score-a.score);
  const pick=options[0],key=useCard(state.cpu,pick.i);sortHand(state.cpu);
  animatePlayedCard(key,'cpu',()=>{
    if(state.ended)return;pushPile(key,'cpu','pending');
    if(isAction(key)){const text=resolveCard(state.cpu,state.player,key);flashSuccess();say(text);renderMatch();cpuTimer=setTimeout(cpuSequence,600);return}
    state.pendingAttack={key};const has=matchingReversalIndex(state.player,key)>=0;say(`${W[state.cpu.id].shortName} plays ${C[key].name}.${has?' Play a matching reversal.':''}`);renderMatch();if(!has)cpuTimer=setTimeout(resolveCpuAttack,700);
  });
}
function resolveCpuAttack(){
  if(!state.pendingAttack||state.ended)return;const key=state.pendingAttack.key;state.pendingAttack=null;state.cpu.chain++;const text=resolveCard(state.cpu,state.player,key);flashSuccess();say(text);afterSuccessfulMove(state.cpu,state.player);renderMatch();if(!state.ended&&!shouldPin(state.cpu,state.player))cpuTimer=setTimeout(cpuSequence,650)
}
function playerReverse(index){
  if(!state.pendingAttack||state.possession!=='cpu')return;sortHand(state.player);const p=playability(state.player.hand[index],state.player);if(!p.ok)return;
  const key=useCard(state.player,index);state.pendingAttack=null;animatePlayedCard(key,'player',()=>{pushPile(key,'player','reversal');const text=resolveCard(state.player,state.cpu,key,{reversal:true});transferPossession('player',text)})
}
function transferPossession(to,reason){
  clearTimeout(cpuTimer);state.possession=to;state.pendingAttack=null;state.player.chain=0;state.cpu.chain=0;state.player.actionUsed=false;state.cpu.actionUsed=false;if(reason)say(reason);
  sortHand(state.player);sortHand(state.cpu);renderMatch();if(to==='cpu')cpuTimer=setTimeout(cpuSequence,650);
}
function shouldPin(actor,opp){return opp.health<=38||C[actor.lastCard]?.finisher||state.turn>=45}
function pinChance(f,opp){let chance=(100-opp.health)*.78+(f.momentum*.08)-(opp.momentum*.04)+(W[f.id].stats.power-W[opp.id].stats.resilience)*.14;if(C[f.lastCard]?.finisher)chance+=C[f.lastCard].pinBonus||30;if(opp.health<=0)chance=98;return clamp(Math.round(chance),5,98)}
function pinAttempt(actor){
  if(state.ended)return;const opp=opponentOf(actor),chance=pinChance(actor,opp);state.nearFalls++;state.turn++;
  if(Math.random()*100<=chance){say(`${W[actor.id].shortName} covers — one, two, three!`);endMatch(actor);return}
  say(`${W[opp.id].shortName} kicks out at two!`);opp.health=Math.max(opp.health,6);opp.momentum=clamp(opp.momentum+12,0,100);transferPossession(actor===state.player?'cpu':'player');
}
function pinOrPass(){if(state.ended||state.possession!=='player')return;if(shouldPin(state.player,state.cpu))pinAttempt(state.player);else transferPossession('cpu',`${W[state.player.id].shortName} ends the sequence.`)}
function updatePhase(){const avg=(state.player.health+state.cpu.health)/2;if(state.turn>=18||avg<50)state.phase='Finishing';else if(state.turn>=7||avg<78)state.phase='Middle';else state.phase='Opening'}
function endMatch(winner){clearTimeout(cpuTimer);state.ended=true;const loser=opponentOf(winner),base=1.5+Math.min(2,state.turn/10)+Math.min(.75,state.variety.size/20)+Math.min(.5,state.nearFalls*.12)+Math.min(.5,state.finishers*.12)+state.crowd/250,stars=Math.round(clamp(base,1,5)*2)/2;$('#winnerPortrait').src=W[winner.id].portrait;$('#winnerName').textContent=`${W[winner.id].name} wins`;$('#resultSummary').textContent=`${W[loser.id].shortName} was defeated after ${state.turn} card plays.`;$('#rating').textContent='★'.repeat(Math.floor(stars))+(stars%1?'½':'')+`  ${stars.toFixed(1)}`;setTimeout(()=>show('result'),650)}
function say(t){state.log.unshift(t);state.log=state.log.slice(0,14);$('#message').textContent=t;renderLog()}
function renderLog(){$('#log').innerHTML=state.log.map(t=>`<div>${t}</div>`).join('')}
function cardMarkup(k,i){
  const c=C[k],p=playability(k,state.player),cls=`gameCard type-${String(c.type||'other').toLowerCase()} ${p.ok?'':'unplayable'} ${c.image?'hasArt':''} ${c.finisher?'is-finisher':c.tags?.includes('signature')?'is-signature':''}`;
  const stat=(label,val)=>`<div class="cardStat"><span>${label}</span><b>${val}</b></div>`;
  return `<button class="${cls}" data-card="${i}" ${p.ok?'':'disabled'}>${c.image?`<div class="cardArt" style="background-image:url('${c.image}')"></div>`:''}<h4>${c.name}</h4>${!p.ok?`<div class="requirement">${p.why}</div>`:''}<div class="cardStats">${stat('DMG',c.damage||0)}${stat('MOM',(c.momentum||0)>=0?`+${c.momentum||0}`:c.momentum)}${stat('COST',c.cost||0)}</div></button>`;
}
function renderPile(){const el=$('#playedPile');if(!el)return;if(!state.pile.length){el.innerHTML='<div class="pileEmpty">Played pile</div>';return}el.innerHTML=state.pile.slice(-3).map((x,n)=>{const c=C[x.key];return `<div class="pileCard type-${String(c.type||'other').toLowerCase()} ${x.status}" style="--stack:${n}">${c.image?`<div class="pileArt" style="background-image:url('${c.image}')"></div>`:''}<strong>${c.name}</strong>${x.status==='success'?'<span class="successFlash">SUCCESS</span>':''}${x.status==='reversal'?'<span class="reversalFlash">REVERSED</span>':''}</div>`}).join('')}
function renderHand(){sortHand(state.player);$('#hand').innerHTML=state.player.hand.map((k,i)=>cardMarkup(k,i)).join('');$$('[data-card]').forEach(b=>b.onclick=()=>state.possession==='player'?playerAttack(+b.dataset.card):playerReverse(+b.dataset.card))}
function renderMatch(){
  const p=state.player,c=state.cpu;$('#playerPortrait').src=W[p.id].portrait;$('#cpuPortrait').src=W[c.id].portrait;$('#playerName').textContent=W[p.id].name;$('#cpuName').textContent=W[c.id].name;
  [['player',p],['cpu',c]].forEach(([pre,f])=>{$(`#${pre}HealthText`).textContent=f.health;$(`#${pre}HealthBar`).style.width=f.health+'%';$(`#${pre}MomentumText`).textContent=f.momentum;$(`#${pre}MomentumBar`).style.width=f.momentum+'%'});
  $('#playerControl').textContent=state.control;$('#cpuControl').textContent=100-state.control;$('#controlBar').style.width=state.control+'%';$('#position').textContent=`Position: ${state.position}`;$('#crowd').textContent=`Crowd ${state.crowd}`;$('#phaseBadge').textContent=state.phase;
  $('#turnLabel').textContent=state.possession==='player'?'Your possession':state.pendingAttack?'Counter now':'Opponent thinking…';$('#redrawBtn').hidden=true;
  $('#pinBtn').hidden=state.possession!=='player';$('#pinBtn').textContent=shouldPin(state.player,state.cpu)?'Attempt Pin':'Pass Possession';$('#handTitle').textContent=state.possession==='player'?`Your Hand · ${state.player.hand.length}`:'Your Reversals';renderPile();renderHand();renderLog();
}
function renderRoster(){$('#roster').innerHTML=Object.values(W).map(w=>`<button class="rosterCard" data-w="${w.id}"><img src="${w.portrait}"><div class="rosterInfo"><h3>${w.name}</h3><p>${w.era} persona</p><div class="stats"><span>Power ${w.stats.power}</span><span>Speed ${w.stats.speed}</span><span>Brawling ${w.stats.brawling}</span><span>Technique ${w.stats.technique}</span><span>Ring IQ ${w.stats.ringIQ}</span><span>Resilience ${w.stats.resilience}</span></div></div></button>`).join('');$$('[data-w]').forEach(b=>b.onclick=()=>startMatch(b.dataset.w))}
$('#startBtn').onclick=()=>{renderRoster();show('select')};$('#quitBtn').onclick=()=>{clearTimeout(cpuTimer);show('menu')};$('#pinBtn').onclick=pinOrPass;$('#rematchBtn').onclick=()=>startMatch(selected);$$('[data-back]').forEach(b=>b.onclick=()=>show(b.dataset.back));
})();

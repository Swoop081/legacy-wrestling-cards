(() => {
'use strict';
const D=window.LWC_DATA,C=D.cards,W=D.wrestlers;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let state=null,selected=Object.keys(W)[0],deckViewing=Object.keys(W)[0],cpuTimer=null;
const screens=['menu','select','deckView','match','result'];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const other=id=>Object.keys(W).find(k=>k!==id)||id;
const isReversal=k=>C[k]?.type==='Reversal';
const canCounter=k=>!!C[k]&&(!!C[k].reverse||!!C[k].counter||isReversal(k));
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
function makeFighter(id){return{id,health:100,momentum:0,hand:[],deck:[],discard:[],usedOnce:new Set(),guard:0,lastCard:null,actionUsed:false,stagedAction:null,chain:0,autoCounterUses:0,signaturePrimed:false}}
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
  take(k=>canCounter(k)&&!isAction(k));
  take(k=>true);
  while(f.hand.length<5&&drawCard(f));
}

function autoCounterCost(f){return 7+(f.autoCounterUses||0)}
function autoCounterRequired(f){return autoCounterCost(f)+5}
function autoCounterEligible(f){return !!state?.pendingAttack&&f.hand.length>=autoCounterRequired(f)}
function autoCounterDiscardScore(k){
  const c=C[k]||{};
  let score=(c.cost||0)*1.2+(c.damage||0)+(c.momentum||0)*.6;
  if(isAction(k))score+=8;
  if(canCounter(k))score+=14;
  if(c.tags?.includes('signature'))score+=35;
  if(c.finisher)score+=60;
  return score;
}
function discardForAutoCounter(f){
  const cost=autoCounterCost(f);if(f.hand.length<cost+5)return false;
  const picks=f.hand.map((k,i)=>({k,i,score:autoCounterDiscardScore(k)})).sort((a,b)=>a.score-b.score||b.i-a.i).slice(0,cost);
  picks.map(x=>x.i).sort((a,b)=>b-a).forEach(i=>{const [k]=f.hand.splice(i,1);if(k)f.discard.push(k)});
  f.autoCounterUses=(f.autoCounterUses||0)+1;sortHand(f);return cost;
}
function shouldCpuAutoCounter(attackKey){
  if(!autoCounterEligible(state.cpu))return false;
  const c=C[attackKey]||{};
  const danger=(c.damage||0)+(c.finisher?35:0)+(c.tags?.includes('signature')?18:0)+(state.cpu.health<=30?18:0);
  return danger>=24||Math.random()<0.32;
}
function playerAutoCounter(){
  if(state.ended||state.possession!=='cpu'||!autoCounterEligible(state.player))return;
  const spent=discardForAutoCounter(state.player);if(!spent)return;
  const attack=state.pendingAttack?.key;state.pendingAttack=null;cancelStagedAction(state.cpu);
  setPileStatus('reversal');
  transferPossession('player',`${W[state.player.id].shortName} discards ${spent} cards and uses an Auto Counter${attack?` against ${C[attack].name}`:''}.`);
}

function beginsWithCounter(k,attackKey){const c=C[k];return !!c&&(c.counter===attackKey||(isReversal(k)&&c.reverse===category(C[attackKey])))}
function basicPlayability(k,f){
  const c=C[k],opp=opponentOf(f);if(!c)return{ok:false,why:'Unavailable'};
  const defending=state&&f===state.player&&state.possession==='cpu'&&state.pendingAttack;
  const effectiveCost=defending&&beginsWithCounter(k,state.pendingAttack.key)?(c.counterCost??0):(c.cost||0);
  if(effectiveCost>f.momentum)return{ok:false,why:`Needs ${effectiveCost} momentum`};
  if(c.once&&f.usedOnce.has(k))return{ok:false,why:'Already used'};
  if(c.onlyBehind&&f.health>=opp.health-12)return{ok:false,why:'Only available when badly behind'};
  if(c.finisher&&(state.phase==='Opening'||f.momentum<(c.cost||0)))return{ok:false,why:'Build more momentum'};
  if(isAction(k)&&f.actionUsed)return{ok:false,why:'One action per possession'};
  if(isAction(k)&&f.stagedAction)return{ok:false,why:'Play your setup move first'};
  return{ok:true,why:''};
}
function playability(k,f){
  const b=basicPlayability(k,f);if(!b.ok)return b;
  if(f===state.player){
    if(state.possession==='player')return isReversal(k)?{ok:false,why:'Reversal-only card'}:{ok:true,why:''};
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
  // Taking a connected move always awards one extra card, even above five.
  // Only the wrestler playing a card uses the below-five replacement rule in useCard().
  drawCard(defender,pref);sortHand(defender);
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
function cardDamage(c,f){
  let d=c.damage||0;
  if(!c.finisher&&!c.tags?.includes('signature')&&c.type!=='Reversal')d*=0.8;
  if(c.type==='Strike'&&W[f.id].traits.strikeDamage)d*=W[f.id].traits.strikeDamage;
  if(state.phase==='Finishing')d*=1.04;
  return Math.round(d);
}
function resolveCard(actor,opp,key,{reversal=false}={}){
  const c=C[key];actor.momentum=clamp(actor.momentum-(reversal?(c.counterCost??0):(c.cost||0)),0,100);state.turn++;state.variety.add(key);
  let dmg=cardDamage(c,actor);if(opp.guard){dmg=Math.round(dmg*(1-opp.guard));opp.guard=0}opp.health=clamp(opp.health-dmg,0,100);
  let gain=c.momentum||0;
  if(W[actor.id].traits.crowdFromAggression&&c.tags?.includes('aggressive'))gain*=W[actor.id].traits.crowdFromAggression;
  if(W[actor.id].traits.comboMomentum&&actor.chain>=2)gain*=W[actor.id].traits.comboMomentum;
  actor.momentum=clamp(actor.momentum+Math.round(gain),0,100);
  if(c.heal)actor.health=clamp(actor.health+c.heal,0,100);if(c.guard)actor.guard=c.guard;if(c.result&&c.result!=='same')state.position=c.result;actor.lastCard=key;
  if(isAction(key))actor.actionUsed=true;if(c.finisher)state.finishers++;
  let crowdGain=Math.round((dmg+gain+(c.crowd||0))/5);
  if(W[actor.id].traits.crowdGain)crowdGain=Math.round(crowdGain*W[actor.id].traits.crowdGain);
  state.crowd=clamp(state.crowd+crowdGain,0,100);state.control=clamp(state.control+(actor===state.player?1:-1)*Math.round((dmg+gain*.4)/4),5,95);
  if(dmg>0)defenderDraw(opp,key);if(c.tags?.includes('signature'))primeFinisher(actor,true);updatePhase();
  return reversal?`${W[actor.id].shortName} counters with ${c.name} and takes possession.`:isAction(key)?`${W[actor.id].shortName} uses ${c.name}.`:`${W[actor.id].shortName} hits ${c.name}${dmg?` for ${dmg} damage`:''} and keeps possession.`;
}
function resolveStagedAction(actor,opp){
  const key=actor.stagedAction;if(!key)return'';
  actor.stagedAction=null;actor.lastResolvedAction=key;
  const text=resolveCard(actor,opp,key);
  const staged=[...state.pile].reverse().find(x=>x.key===key&&x.owner===(actor===state.player?'player':'cpu')&&x.status==='setup');
  if(staged)staged.status='resolved';
  renderPile();
  return text;
}
function cancelStagedAction(actor){
  const key=actor.stagedAction;if(!key)return;
  actor.stagedAction=null;
  const staged=[...state.pile].reverse().find(x=>x.key===key&&x.owner===(actor===state.player?'player':'cpu')&&x.status==='setup');
  if(staged)staged.status='cancelled';
  renderPile();
}
function flashSuccess(){setPileStatus('success');setTimeout(()=>{if(!state?.ended&&state.pile.length){state.pile[state.pile.length-1].status='resolved';renderPile()}},650)}
function matchingReversalIndex(defender,attackKey){return defender.hand.findIndex(k=>beginsWithCounter(k,attackKey)&&basicPlayability(k,defender).ok)}
function playerAttack(index){
  if(state.ended||state.possession!=='player')return;sortHand(state.player);const p=playability(state.player.hand[index],state.player);if(!p.ok){say(p.why);return}
  const key=useCard(state.player,index);sortHand(state.player);renderHand();
  animatePlayedCard(key,'player',()=>{
    if(state.ended)return;const c=C[key];pushPile(key,'player','pending');
    if(isAction(key)){state.player.stagedAction=key;state.player.actionUsed=true;setPileStatus('setup');say(`${C[key].name} is set. Choose a move — the action only resolves if that move connects.`);renderMatch();return}
    if(shouldCpuAutoCounter(key)){const spent=discardForAutoCounter(state.cpu);cancelStagedAction(state.player);setPileStatus('reversal');transferPossession('cpu',`${W[state.cpu.id].shortName} discards ${spent} cards and uses an Auto Counter against ${C[key].name}.`);return}
    const ri=matchingReversalIndex(state.cpu,key);
    if(ri>=0){const rkey=useCard(state.cpu,ri);animatePlayedCard(rkey,'cpu',()=>{cancelStagedAction(state.player);pushPile(rkey,'cpu','reversal');const text=resolveCard(state.cpu,state.player,rkey,{reversal:true});transferPossession('cpu',text)});return}
    state.player.chain++;const actionText=resolveStagedAction(state.player,state.cpu);const text=resolveCard(state.player,state.cpu,key);flashSuccess();say(actionText?`${actionText} ${text}`:text);afterSuccessfulMove(state.player,state.cpu);renderMatch();
  });
}
function afterSuccessfulMove(actor,opp){
  if(state.ended)return;
  const actionKey=actor.lastResolvedAction;actor.lastResolvedAction=null;if(actionKey&&C[actionKey]?.endPossession){transferPossession(actor===state.player?'cpu':'player',`${C[actionKey].name} ends the sequence.`);return}
  const last=C[actor.lastCard]||{};
  if(last.type==='Submission'&&(last.tags?.includes('signature')||opp.health<=32)){setTimeout(()=>submissionAttempt(actor,last),420);return}
  if(shouldPin(actor,opp)){if(actor===state.cpu){cpuTimer=setTimeout(()=>pinAttempt(actor),500)}return}
  if(state.turn>=60){say(`The referee stops the match after sustained punishment.`);endMatch(actor);return}
}
function cpuSequence(){
  if(state.ended||state.possession!=='cpu'||state.pendingAttack)return;sortHand(state.cpu);
  if(!state.cpu.stagedAction&&shouldPin(state.cpu,state.player)){
    const last=C[state.cpu.lastCard]||{},profile=W[state.cpu.id].ai||{},pinUrge=(last.finisher?.92:last.tags?.includes('signature')?.68:state.player.health<=10?.65:.28)*(profile.pinAggression||1);
    if(Math.random()<pinUrge){pinAttempt(state.cpu);return}
  }
  let options=state.cpu.hand.map((k,i)=>({k,i,p:playability(k,state.cpu)})).filter(x=>x.p.ok);
  if(!options.length){drawCard(state.cpu,k=>(C[k].cost||0)===0&&!isReversal(k));sortHand(state.cpu);options=state.cpu.hand.map((k,i)=>({k,i,p:playability(k,state.cpu)})).filter(x=>x.p.ok)}
  if(!options.length){transferPossession('player',`${W[state.cpu.id].shortName} cannot continue the sequence.`);return}
  const hasFollowUp=options.some(o=>!isAction(o.k));
  options.forEach(o=>{const c=C[o.k],profile=W[state.cpu.id].ai||{},weights=profile.weights||{},styleWeight=weights[category(c)]||1;let score=((c.damage||0)*1.5+(c.momentum||0)+Math.random()*10)*styleWeight;if(c.tags?.includes('signature'))score+=24*(profile.signatureBias||1);if(c.finisher&&state.player.health<50)score+=75;if(isAction(o.k)&&(!hasFollowUp||state.cpu.actionUsed||state.cpu.stagedAction))score-=1000;o.score=score});options.sort((a,b)=>b.score-a.score);
  const pick=options[0],key=useCard(state.cpu,pick.i);sortHand(state.cpu);
  animatePlayedCard(key,'cpu',()=>{
    if(state.ended)return;pushPile(key,'cpu','pending');
    if(isAction(key)){state.cpu.stagedAction=key;state.cpu.actionUsed=true;setPileStatus('setup');say(`${W[state.cpu.id].shortName} sets up ${C[key].name}. The effect depends on the next move connecting.`);renderMatch();cpuTimer=setTimeout(cpuSequence,500);return}
    state.pendingAttack={key};const has=matchingReversalIndex(state.player,key)>=0;say(`${W[state.cpu.id].shortName} plays ${C[key].name}.${has?' Play a matching reversal.':''}`);renderMatch();if(!has)cpuTimer=setTimeout(resolveCpuAttack,700);
  });
}
function resolveCpuAttack(){
  if(!state.pendingAttack||state.ended)return;const key=state.pendingAttack.key;state.pendingAttack=null;state.cpu.chain++;const actionText=resolveStagedAction(state.cpu,state.player);const text=resolveCard(state.cpu,state.player,key);flashSuccess();say(actionText?`${actionText} ${text}`:text);afterSuccessfulMove(state.cpu,state.player);renderMatch();if(!state.ended&&!shouldPin(state.cpu,state.player))cpuTimer=setTimeout(cpuSequence,650)
}
function playerReverse(index){
  if(!state.pendingAttack||state.possession!=='cpu')return;sortHand(state.player);const p=playability(state.player.hand[index],state.player);if(!p.ok)return;
  const key=useCard(state.player,index);state.pendingAttack=null;animatePlayedCard(key,'player',()=>{cancelStagedAction(state.cpu);pushPile(key,'player','reversal');const text=resolveCard(state.player,state.cpu,key,{reversal:true});transferPossession('player',text)})
}
function transferPossession(to,reason){
  clearTimeout(cpuTimer);cancelStagedAction(state.player);cancelStagedAction(state.cpu);state.possession=to;state.pendingAttack=null;state.player.chain=0;state.cpu.chain=0;state.player.actionUsed=false;state.cpu.actionUsed=false;if(reason)say(reason);
  sortHand(state.player);sortHand(state.cpu);renderMatch();if(to==='cpu')cpuTimer=setTimeout(cpuSequence,650);
}
function shouldPin(actor,opp){const last=C[actor.lastCard];return opp.health<=25||last?.finisher||last?.tags?.includes('signature')||state.turn>=55}
function pinChance(f,opp){
  const last=C[f.lastCard]||{};let chance=(100-opp.health)*.52+(f.momentum*.05)-(opp.momentum*.05)+(W[f.id].stats.power-W[opp.id].stats.resilience)*.10;
  if(last.tags?.includes('signature'))chance+=18;
  if(last.finisher)chance+=last.pinBonus||34;
  if(!last.finisher&&!last.tags?.includes('signature')&&opp.health>12)chance-=12;
  if(W[opp.id].traits.reversalBonus)chance-=Math.round(W[opp.id].traits.reversalBonus*100);
  if(opp.health<=0)chance=96;return clamp(Math.round(chance),3,98);
}
function showCountSequence(words,finalWord,done){
  const overlay=$('#countOverlay'),text=$('#countText');overlay.hidden=false;let i=0;
  const step=()=>{text.textContent=words[i];overlay.classList.remove('pop');void overlay.offsetWidth;overlay.classList.add('pop');i++;if(i<words.length)setTimeout(step,480);else setTimeout(()=>{text.textContent=finalWord;overlay.classList.remove('pop');void overlay.offsetWidth;overlay.classList.add('pop');setTimeout(()=>{overlay.hidden=true;done?.()},650)},520)};step();
}
function pinAttempt(actor){
  if(state.ended)return;const opp=opponentOf(actor),chance=pinChance(actor,opp);state.nearFalls++;state.turn++;const success=Math.random()*100<=chance;
  showCountSequence(['ONE','TWO'],success?'THREE!':'KICK OUT!',()=>{
    if(success){say(`${W[actor.id].shortName} gets the three-count!`);endMatch(actor);return}
    say(`${W[opp.id].shortName} kicks out at two!`);opp.health=Math.max(opp.health,6);opp.momentum=clamp(opp.momentum+12,0,100);state.crowd=clamp(state.crowd+10,0,100);drawCard(opp);transferPossession(actor===state.player?'cpu':'player');
  });
}
function submissionAttempt(actor,card){
  if(state.ended)return;const opp=opponentOf(actor),overlay=$('#submissionOverlay'),text=$('#submissionText');
  let chance=(100-opp.health)*.42+(W[actor.id].stats.technique-W[opp.id].stats.resilience)*.18+(card.tags?.includes('signature')?22:6)+(actor.momentum-opp.momentum)*.06;chance=clamp(chance,4,90);
  overlay.hidden=false;text.textContent=card.name.toUpperCase();overlay.classList.add('pop');
  setTimeout(()=>{const tap=Math.random()*100<=chance;if(tap){text.textContent='TAP OUT!'}else{text.textContent=Math.random()<.45?'ROPE BREAK!':'ESCAPE!'}overlay.classList.remove('pop');void overlay.offsetWidth;overlay.classList.add('pop');setTimeout(()=>{overlay.hidden=true;if(tap){say(`${W[opp.id].shortName} taps out to ${card.name}!`);endMatch(actor)}else{say(`${W[opp.id].shortName} escapes ${card.name}.`);opp.momentum=clamp(opp.momentum+9,0,100);transferPossession(actor===state.player?'cpu':'player')}},650)},650);
}
function pinOrPass(){if(state.ended||state.possession!=='player'||state.player.stagedAction)return;if(shouldPin(state.player,state.cpu))pinAttempt(state.player);else transferPossession('cpu',`${W[state.player.id].shortName} ends the sequence.`)}
function primeSignature(f){const idx=f.deck.findIndex(k=>C[k]?.tags?.includes('signature'));if(idx<0)return;const [key]=f.deck.splice(idx,1);f.deck.splice(Math.min(f.deck.length,Math.floor(Math.random()*3)),0,key)}
function primeFinisher(f,urgent=false){
  const idx=f.deck.findIndex(k=>C[k]?.finisher);if(idx<0)return;
  const [key]=f.deck.splice(idx,1),slot=urgent?0:Math.min(f.deck.length,Math.floor(Math.random()*3));f.deck.splice(slot,0,key);
}
function updatePhase(){
  const old=state.phase,avg=(state.player.health+state.cpu.health)/2;
  if(state.turn>=22||avg<45)state.phase='Finishing';else if(state.turn>=8||avg<75)state.phase='Middle';else state.phase='Opening';
  if(old==='Opening'&&state.phase==='Middle'){primeSignature(state.player);primeSignature(state.cpu)}if(old!=='Finishing'&&state.phase==='Finishing'){primeFinisher(state.player);primeFinisher(state.cpu)}
}
function endMatch(winner){clearTimeout(cpuTimer);state.ended=true;const loser=opponentOf(winner),base=1.5+Math.min(2,state.turn/10)+Math.min(.75,state.variety.size/20)+Math.min(.5,state.nearFalls*.12)+Math.min(.5,state.finishers*.12)+state.crowd/250,stars=Math.round(clamp(base,1,5)*2)/2;$('#winnerPortrait').src=W[winner.id].portrait;$('#winnerName').textContent=`${W[winner.id].name} wins`;$('#resultSummary').textContent=`${W[loser.id].shortName} was defeated after ${state.turn} card plays.`;$('#rating').textContent='★'.repeat(Math.floor(stars))+(stars%1?'½':'')+`  ${stars.toFixed(1)}`;setTimeout(()=>show('result'),650)}
function say(t){state.log.unshift(t);state.log=state.log.slice(0,14);$('#message').textContent=t;renderLog()}
function renderLog(){$('#log').innerHTML=state.log.map(t=>`<div>${t}</div>`).join('')}
function cardMarkup(k,i){
  const c=C[k],p=playability(k,state.player),cls=`gameCard type-${String(c.type||'other').toLowerCase()} ${p.ok?'':'unplayable'} ${c.image?'hasArt':''} ${c.finisher?'is-finisher':c.tags?.includes('signature')?'is-signature':''}`;
  const stat=(label,val)=>`<div class="cardStat"><span>${label}</span><b>${val}</b></div>`;
  return `<button class="${cls}" data-card="${i}" ${p.ok?'':'disabled'}>${c.image?`<div class="cardArt" style="background-image:url('${c.image}')"></div>`:''}<h4>${c.name}</h4>${!p.ok?`<div class="requirement">${p.why}</div>`:''}<div class="cardStats">${stat('DMG',c.damage||0)}${stat('MOM',(c.momentum||0)>=0?`+${c.momentum||0}`:c.momentum)}${stat('COST',c.cost||0)}</div></button>`;
}
function renderPile(){const el=$('#playedPile');if(!el)return;if(!state.pile.length){el.innerHTML='<div class="pileEmpty">Played pile</div>';return}el.innerHTML=state.pile.slice(-3).map((x,n)=>{const c=C[x.key];return `<div class="pileCard type-${String(c.type||'other').toLowerCase()} ${x.status}" style="--stack:${n}">${c.image?`<div class="pileArt" style="background-image:url('${c.image}')"></div>`:''}<strong>${c.name}</strong>${x.status==='success'?'<span class="successFlash">SUCCESS</span>':''}${x.status==='reversal'?'<span class="reversalFlash">REVERSED</span>':''}</div>`}).join('')}
function updateHandPosition(){const hand=$('#hand'),cards=[...hand.children],meta=$('#handPosition');if(!cards.length){meta.textContent='0 cards';return}const left=hand.scrollLeft,start=Math.min(cards.length-1,cards.findIndex(c=>c.offsetLeft+c.offsetWidth>left+8));const visible=Math.max(1,Math.floor(hand.clientWidth/(cards[0].offsetWidth+12)));meta.textContent=`${start+1}–${Math.min(cards.length,start+visible)} of ${cards.length}`}
function renderHand(){sortHand(state.player);$('#hand').innerHTML=state.player.hand.map((k,i)=>cardMarkup(k,i)).join('');$$('[data-card]').forEach(b=>b.onclick=()=>state.possession==='player'?playerAttack(+b.dataset.card):playerReverse(+b.dataset.card));requestAnimationFrame(updateHandPosition)}
function renderMatch(){
  const p=state.player,c=state.cpu;$('#playerPortrait').src=W[p.id].portrait;$('#cpuPortrait').src=W[c.id].portrait;$('#playerName').textContent=W[p.id].name;$('#cpuName').textContent=W[c.id].name;
  [['player',p],['cpu',c]].forEach(([pre,f])=>{const health=$(`#${pre}HealthText`);health.textContent=f.health;health.className=f.health>55?'healthFull':f.health>25?'healthMid':'healthLow';$(`#${pre}MomentumText`).textContent=f.momentum});
  $('#playerControl').textContent=state.control;$('#cpuControl').textContent=100-state.control;$('#controlBar').style.width=state.control+'%';$('#position').textContent=`Position: ${state.position}`;$('#crowd').textContent=`Crowd ${state.crowd}`;$('#phaseBadge').textContent=state.phase;
  $('#turnLabel').textContent=state.possession==='player'?'Your possession':state.pendingAttack?'Counter now':'Opponent thinking…';$('#redrawBtn').hidden=true;const ac=$('#autoCounterBtn');if(ac){ac.hidden=!(state.possession==='cpu'&&autoCounterEligible(state.player));ac.textContent=`Auto Counter · Discard ${autoCounterCost(state.player)}`;}
  $('#pinBtn').hidden=state.possession!=='player'||!!state.player.stagedAction;$('#pinBtn').textContent=shouldPin(state.player,state.cpu)?'Attempt Pin':'Pass Possession';$('#handTitle').textContent=state.possession==='player'?`Your Hand · ${state.player.hand.length}`:'Your Reversals';renderPile();renderHand();renderLog();
}

function overallRating(w){const v=[w.stats.power,w.stats.speed,w.stats.brawling,w.stats.technique,w.stats.ringIQ,w.stats.resilience];return Math.round(v.reduce((a,b)=>a+b,0)/v.length)}
function rosterCardMarkup(w){
  return `<div class="rosterCardWrap">
    <button class="rosterTradeCard clean" data-select="${w.id}" aria-label="Choose ${w.name}">
      <div class="rosterTradeArt"><img src="${w.selectionImage || w.portrait}" alt="${w.name}"></div>
      <div class="rosterTradeName"><h3>${w.name}</h3></div>
    </button>
    <div class="rosterTradeActions"><button class="primary compact" data-select="${w.id}">Choose Wrestler</button><button class="ghost compact" data-viewdeck="${w.id}">View Deck</button></div>
  </div>`;
}
function staticCardMarkup(k){
  const c=C[k],cls=`gameCard readonlyCard type-${String(c.type||'other').toLowerCase()} ${c.image?'hasArt':''} ${c.finisher?'is-finisher':c.tags?.includes('signature')?'is-signature':''}`;
  const stat=(label,val)=>`<div class="cardStat"><span>${label}</span><b>${val}</b></div>`;
  const extra=(c.reverse?`Counters ${c.reverse}`:c.counter?`Counters ${C[c.counter]?.name||c.counter}`:c.finisher?'Finisher':c.tags?.includes('signature')?'Signature':'' );
  return `<article class="${cls}">${c.image?`<div class="cardArt" style="background-image:url('${c.image}')"></div>`:''}<h4>${c.name}</h4>${extra?`<div class="requirement deckNote">${extra}</div>`:''}<div class="cardStats">${stat('DMG',c.damage||0)}${stat('MOM',(c.momentum||0)>=0?`+${c.momentum||0}`:c.momentum)}${stat('COST',c.cost||0)}</div></article>`;
}
function renderRoster(){
  $('#roster').innerHTML=Object.values(W).map(rosterCardMarkup).join('');
  $$('[data-select]').forEach(b=>b.onclick=e=>{e.stopPropagation();startMatch(b.dataset.select)});
  $$('[data-viewdeck]').forEach(b=>b.onclick=e=>{e.stopPropagation();renderDeckView(b.dataset.viewdeck);show('deckView')});
}
function renderDeckView(id){
  deckViewing=id;
  const w=W[id], lib=w.library.slice();
  const finishers=lib.filter(k=>C[k]?.finisher);
  const signatures=lib.filter(k=>C[k]?.tags?.includes('signature') && !C[k]?.finisher);
  const others=lib.filter(k=>!C[k]?.finisher && !C[k]?.tags?.includes('signature'));
  const counts={finishers:finishers.length, signatures:signatures.length, moves:others.length};
  const typeCounts=lib.reduce((m,k)=>{const t=category(C[k]);m[t]=(m[t]||0)+1;return m},{Aerial:0,Grapple:0,Strike:0,Submission:0,Control:0,Action:0});
  $('#deckTitle').textContent=`${w.name} Deck`;
  $('#deckHero').innerHTML=`<article class="rosterTradeCard featured"><div class="rosterTradeTop"><span class="rosterChip">${w.era} persona</span><span class="rosterChip overall">Overall ${overallRating(w)}</span></div><div class="rosterTradeArt"><img src="${w.selectionImage || w.portrait}" alt="${w.name}"></div><div class="rosterTradeName"><h3>${w.name}</h3><p>${w.ai?.style||'Wrestler'}</p></div><div class="rosterTradeStats stats"><span>Power ${w.stats.power}</span><span>Speed ${w.stats.speed}</span><span>Brawling ${w.stats.brawling}</span><span>Technique ${w.stats.technique}</span><span>Ring IQ ${w.stats.ringIQ}</span><span>Resilience ${w.stats.resilience}</span></div></article>`;
  $('#deckSummary').innerHTML=`<div class="deckSummaryCard"><b>${lib.length}</b><span>Total cards</span></div><div class="deckSummaryCard"><b>${counts.finishers}</b><span>Finishers</span></div><div class="deckSummaryCard"><b>${counts.signatures}</b><span>Signatures</span></div><div class="deckSummaryCard"><b>${counts.moves}</b><span>Other moves</span></div><div class="deckSummaryCard"><b>${typeCounts.Strike}</b><span>Strikes</span></div><div class="deckSummaryCard"><b>${typeCounts.Grapple}</b><span>Grapples</span></div><div class="deckSummaryCard"><b>${typeCounts.Aerial}</b><span>Aerial</span></div><div class="deckSummaryCard"><b>${typeCounts.Submission}</b><span>Submissions</span></div>`;
  const section=(title,cards,cls='')=>cards.length?`<section class="deckSection ${cls}"><div class="deckSectionTitle">${title} <span>${cards.length}</span></div><div class="deckGrid">${cards.map(staticCardMarkup).join('')}</div></section>`:'';
  $('#deckSections').innerHTML=[section('Finishers',finishers,'finishers'),section('Signatures',signatures,'signatures'),section('Moves',others,'moves')].join('');
}
$('#hand').addEventListener('scroll',updateHandPosition,{passive:true});$('#jumpPlayableBtn').onclick=()=>{$('#hand').scrollTo({left:0,behavior:'smooth'})};$('#autoCounterBtn').onclick=playerAutoCounter;$('#startBtn').onclick=()=>{renderRoster();show('select')};$('#quitBtn').onclick=()=>{clearTimeout(cpuTimer);show('menu')};$('#pinBtn').onclick=pinOrPass;$('#rematchBtn').onclick=()=>startMatch(selected);$('#deckBackBtn').onclick=()=>show('select');$('#deckChooseBtn').onclick=()=>startMatch(deckViewing);$$('[data-back]').forEach(b=>b.onclick=()=>show(b.dataset.back));
})();

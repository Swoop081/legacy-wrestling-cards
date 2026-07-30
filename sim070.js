const vm=require('vm'),fs=require('fs');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/data.js','utf8'),ctx);
const D=ctx.window.LWC_DATA,C=D.cards,W=D.wrestlers,ids=Object.keys(W);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const rev=k=>C[k]?.type==='Reversal', act=k=>C[k]?.type==='Action';
function cat(card){if(card.type==='Aerial'||card.tags?.includes('aerial'))return'Aerial';if(card.type==='Submission'||card.tags?.includes('submission'))return'Submission';if(card.type==='Control'||card.tags?.includes('control'))return'Control';if(card.type==='Strike'||card.tags?.includes('strike'))return'Strike';return'Grapple'}
function counter(k,a){const c=C[k];return !!c&&(c.counter===a||(rev(k)&&c.reverse===cat(C[a])))}
function fighter(id){return{id,health:100,momentum:0,hand:[],deck:[],discard:[],usedOnce:new Set(),guard:0,lastCard:null,actionUsed:false,stagedAction:null,chain:0,autoCounterUses:0,lastResolvedAction:null}}
function canDeck(k,f){const c=C[k];return !!c&&c.type!=='Pin'&&!(c.once&&f.usedOnce.has(k))}
function build(f){f.deck=shuffle(W[f.id].library.filter(k=>canDeck(k,f)).slice())}
function recycle(f){if(!f.deck.length&&f.discard.length)f.deck=shuffle(f.discard.splice(0).filter(k=>canDeck(k,f)))}
function draw(f,pred=null){recycle(f);if(!f.deck.length)return null;let i=pred?f.deck.findIndex(pred):0;if(i<0)i=0;const k=f.deck.splice(i,1)[0];f.hand.push(k);return k}
function opening(f){build(f);draw(f,k=>(C[k].cost||0)===0&&!rev(k)&&!act(k));draw(f,k=>(C[k].cost||0)===0&&!rev(k)&&!act(k));draw(f,k=>cat(C[k])==='Grapple'&&!rev(k)&&!act(k));draw(f,canCounter);draw(f);while(f.hand.length<5&&draw(f));}
function use(f,index){const k=f.hand.splice(index,1)[0];f.discard.push(k);if(C[k]?.once)f.usedOnce.add(k);if(f.hand.length<5)draw(f);return k}
function basicPlayable(k,f,opp,phase){const c=C[k];if(!c||rev(k))return false;if((c.cost||0)>f.momentum)return false;if(c.once&&f.usedOnce.has(k))return false;if(c.onlyBehind&&f.health>=opp.health-12)return false;if(c.finisher&&(phase==='Opening'||f.momentum<(c.cost||0)))return false;if(act(k)&&f.actionUsed)return false;if(act(k)&&f.stagedAction)return false;return true}
function discardScore(k){const c=C[k]||{};let s=(c.cost||0)*1.2+(c.damage||0)+(c.momentum||0)*.6;if(act(k))s+=8;if(rev(k))s+=14;if(c.tags?.includes('signature'))s+=35;if(c.finisher)s+=60;return s}
function autoCost(f){return 7+(f.autoCounterUses||0)}
function autoDiscard(f){const cost=autoCost(f);if(f.hand.length<cost+5)return false;const inds=f.hand.map((k,i)=>({i,s:discardScore(k)})).sort((a,b)=>a.s-b.s||b.i-a.i).slice(0,cost).map(x=>x.i).sort((a,b)=>b-a);for(const i of inds){const [k]=f.hand.splice(i,1);if(k)f.discard.push(k)}f.autoCounterUses++;return true}
function shouldAuto(f,attackKey){if(f.hand.length<autoCost(f)+5)return false;const c=C[attackKey]||{};const danger=(c.damage||0)+(c.finisher?35:0)+(c.tags?.includes('signature')?18:0)+(f.health<=30?18:0);return danger>=24||Math.random()<0.32}
function pinChance(a,o){const last=C[a.lastCard]||{};let ch=(100-o.health)*.52+(a.momentum*.05)-(o.momentum*.05)+(W[a.id].stats.power-W[o.id].stats.resilience)*.10;if(last.tags?.includes('signature'))ch+=18;if(last.finisher)ch+=last.pinBonus||34;if(!last.finisher&&!last.tags?.includes('signature')&&o.health>12)ch-=12;if(W[o.id].traits.reversalBonus)ch-=Math.round(W[o.id].traits.reversalBonus*100);if(o.health<=0)ch=96;return clamp(Math.round(ch),3,98)}
function cardDamage(c,f,phase){let d=c.damage||0;if(!c.finisher&&!c.tags?.includes('signature')&&c.type!=='Reversal')d*=.8;if(c.type==='Strike'&&W[f.id].traits.strikeDamage)d*=W[f.id].traits.strikeDamage;if(phase==='Finishing')d*=1.04;return Math.round(d)}
function match(){
 let A=fighter(ids[0]),B=fighter(ids[1]);opening(A);opening(B);let actor=Math.random()<.5?A:B,opp=actor===A?B:A;
 let turn=0,near=0,finishers=0,sigs=0,normalRev=0,auto=0,actionsStaged=0,actionsResolved=0,actionsCancelled=0,maxHand=5,maxChain=0,pins=0,passes=0,stoppage=false;
 let phase='Opening';
 function primeSig(f){const idx=f.deck.findIndex(k=>C[k]?.tags?.includes('signature'));if(idx<0)return;const [k]=f.deck.splice(idx,1);f.deck.splice(Math.min(f.deck.length,Math.floor(Math.random()*3)),0,k)}
 function prime(f,urgent=false){const idx=f.deck.findIndex(k=>C[k]?.finisher);if(idx<0)return;const [k]=f.deck.splice(idx,1);f.deck.splice(urgent?0:Math.min(f.deck.length,Math.floor(Math.random()*3)),0,k)}
 const updatePhase=()=>{const old=phase,avg=(A.health+B.health)/2;phase=turn>=22||avg<45?'Finishing':turn>=8||avg<75?'Middle':'Opening';if(old==='Opening'&&phase==='Middle'){primeSig(A);primeSig(B)}if(old!=='Finishing'&&phase==='Finishing'){prime(A);prime(B)}};
 function resolve(f,o,k,isReversal=false){const c=C[k];f.momentum=clamp(f.momentum-(c.cost||0),0,100);turn++;let dmg=cardDamage(c,f,phase);if(o.guard){dmg=Math.round(dmg*(1-o.guard));o.guard=0}o.health=clamp(o.health-dmg,0,100);let gain=c.momentum||0;if(W[f.id].traits.crowdFromAggression&&c.tags?.includes('aggressive'))gain*=W[f.id].traits.crowdFromAggression;if(W[f.id].traits.comboMomentum&&f.chain>=2)gain*=W[f.id].traits.comboMomentum;f.momentum=clamp(f.momentum+Math.round(gain),0,100);if(c.heal)f.health=clamp(f.health+c.heal,0,100);if(c.guard)f.guard=c.guard;f.lastCard=k;if(c.finisher)finishers++;if(c.tags?.includes('signature')){sigs++;prime(f,true)}if(dmg>0){const pref=f.chain>=3?(x=>counter(x,k)):null;draw(o,pref)}updatePhase();return dmg}
 function transfer(){[actor,opp]=[opp,actor];actor.chain=0;opp.chain=0;actor.actionUsed=opp.actionUsed=false;actor.stagedAction=opp.stagedAction=null}
 while(turn<120){
   maxHand=Math.max(maxHand,A.hand.length,B.hand.length);
   // CPU-like pin decision for both sides
   const last=C[actor.lastCard]||{},shouldPin=opp.health<=25||last.finisher||last.tags?.includes('signature')||turn>=55;
   const pinUrge=last.finisher?.92:last.tags?.includes('signature')?.68:opp.health<=10?.65:.28;
   if(!actor.stagedAction&&shouldPin&&Math.random()<pinUrge){pins++;near++;turn++;if(Math.random()*100<=pinChance(actor,opp))return {winner:actor.id,turn,near,pins,finishers,sigs,normalRev,auto,actionsStaged,actionsResolved,actionsCancelled,maxHand,maxChain,passes,stoppage};opp.health=Math.max(opp.health,6);opp.momentum=clamp(opp.momentum+12,0,100);transfer();continue}
   let opts=actor.hand.map((k,i)=>({k,i})).filter(x=>basicPlayable(x.k,actor,opp,phase));
   if(!opts.length){draw(actor,k=>(C[k].cost||0)===0&&!rev(k));opts=actor.hand.map((k,i)=>({k,i})).filter(x=>basicPlayable(x.k,actor,opp,phase));}
   if(!opts.length){passes++;transfer();continue}
   const follow=opts.some(o=>!act(o.k));
   for(const o of opts){const c=C[o.k],profile=W[actor.id].ai||{},weights=profile.weights||{},styleWeight=weights[cat(c)]||1;o.score=((c.damage||0)*1.5+(c.momentum||0)+Math.random()*10)*styleWeight+(c.finisher&&opp.health<45?70:0)-(act(o.k)&&(!follow||actor.actionUsed||actor.stagedAction)?1000:0);if(c.tags?.includes('signature'))o.score+=24*(profile.signatureBias||1);}
   opts.sort((a,b)=>b.score-a.score);const pick=opts[0],key=use(actor,pick.i),c=C[key];
   if(act(key)){actor.stagedAction=key;actor.actionUsed=true;actionsStaged++;continue}
   // defender auto-counter before normal reversal
   if(shouldAuto(opp,key)){
      autoDiscard(opp);auto++;if(actor.stagedAction){actionsCancelled++;actor.stagedAction=null}transfer();continue;
   }
   const ri=opp.hand.findIndex(k=>counter(k,key)&&(C[k].cost||0)<=opp.momentum);
   if(ri>=0){const rk=use(opp,ri);normalRev++;if(actor.stagedAction){actionsCancelled++;actor.stagedAction=null}resolve(opp,actor,rk,true);transfer();continue}
   actor.chain++;maxChain=Math.max(maxChain,actor.chain);
   let endAfter=false;if(actor.stagedAction){const ak=actor.stagedAction;actor.stagedAction=null;resolve(actor,opp,ak);actionsResolved++;endAfter=!!C[ak]?.endPossession;}
   resolve(actor,opp,key);if(c.type==='Submission'&&(c.tags?.includes('signature')||opp.health<=32)){let ch=(100-opp.health)*.42+(W[actor.id].stats.technique-W[opp.id].stats.resilience)*.18+(c.tags?.includes('signature')?22:6)+(actor.momentum-opp.momentum)*.06;ch=clamp(ch,4,90);if(Math.random()*100<=ch)return {winner:actor.id,turn,near,pins,finishers,sigs,normalRev,auto,actionsStaged,actionsResolved,actionsCancelled,maxHand,maxChain,passes,stoppage};opp.momentum=clamp(opp.momentum+9,0,100);transfer();continue}if(endAfter){transfer();continue}
   if(turn>=60){stoppage=true;return {winner:actor.id,turn,near,pins,finishers,sigs,normalRev,auto,actionsStaged,actionsResolved,actionsCancelled,maxHand,maxChain,passes,stoppage}}
 }
 return {failed:true,turn,near,pins,finishers,sigs,normalRev,auto,actionsStaged,actionsResolved,actionsCancelled,maxHand,maxChain,passes,stoppage};
}
const N=50000,out=[];for(let i=0;i<N;i++)out.push(match());
const avg=k=>out.reduce((s,x)=>s+(x[k]||0),0)/N;
const pct=k=>100*out.filter(k).length/N;
const sorted=out.map(x=>x.turn).sort((a,b)=>a-b);const q=p=>sorted[Math.floor((N-1)*p)];
console.log(JSON.stringify({N,finished:out.filter(x=>!x.failed).length,winners:Object.fromEntries(ids.map(id=>[id,out.filter(x=>x.winner===id).length])),avgTurns:avg('turn'),median:q(.5),p90:q(.9),p99:q(.99),avgPins:avg('pins'),avgNearFalls:avg('near'),avgNormalReversals:avg('normalRev'),avgAutoCounters:avg('auto'),matchesWithAutoCounter:pct(x=>x.auto>0),avgActionsStaged:avg('actionsStaged'),avgActionsResolved:avg('actionsResolved'),avgActionsCancelled:avg('actionsCancelled'),matchesWithFinisher:pct(x=>x.finishers>0),matchesWithSignature:pct(x=>x.sigs>0),avgMaxHand:avg('maxHand'),maxHand:Math.max(...out.map(x=>x.maxHand)),avgMaxChain:avg('maxChain'),maxChain:Math.max(...out.map(x=>x.maxChain)),avgPasses:avg('passes'),stoppages:out.filter(x=>x.stoppage).length,failed:out.filter(x=>x.failed).length},null,2));

'use strict';

const app = document.getElementById('app');
const homeButton = document.getElementById('homeButton');
const roster = Array.isArray(window.LEGACY_WRESTLERS) ? window.LEGACY_WRESTLERS : [];

const state = {
  player: null, opponent: null,
  playerHealth: 100, opponentHealth: 100,
  playerMomentum: 18, opponentMomentum: 18,
  control: 50, turn: 1, phase: 'Opening Bell',
  crowd: 0, nearFalls: 0, finishers: 0,
  playerPerformance: 0, opponentPerformance: 0,
  log: [], highlights: [], ended: false
};

const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
const rnd = (min,max)=>Math.floor(Math.random()*(max-min+1))+min;
const one = arr=>arr[Math.floor(Math.random()*arr.length)];
const esc = value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function resetMatch(){
  Object.assign(state,{playerHealth:100,opponentHealth:100,playerMomentum:18,opponentMomentum:18,control:50,turn:1,phase:'Opening Bell',crowd:0,nearFalls:0,finishers:0,playerPerformance:0,opponentPerformance:0,log:[],highlights:[],ended:false});
}

function renderHome(){
  state.player=null; state.opponent=null;
  app.innerHTML=`<section class="home-screen screen-shell"><img class="main-logo" src="assets/branding/lpw-logo-main-menu-1200.webp" alt="LEGACY Pro Wrestling"><div class="mode-card"><p class="eyebrow">PLAY MODE</p><h1>Exhibition 1v1</h1><p>Choose a 1999 wrestling icon and play through the restored LEGACY match engine using trading-card decisions.</p><button id="exhibitionButton" class="primary-button">START EXHIBITION</button></div><p class="baseline-note">Trading Card Match Engine Test</p></section>`;
  document.getElementById('exhibitionButton').onclick=()=>renderSelection('player');
}

function statRows(w){const labels={power:'Power',speed:'Speed',technique:'Technique',brawling:'Brawling',charisma:'Charisma',ringIQ:'Ring IQ',resilience:'Resilience',hardcore:'Hardcore'};return Object.entries(w.stats).map(([k,v])=>`<div class="stat-row"><span>${labels[k]}</span><div class="stat-track"><i style="width:${v}%"></i></div><b>${v}</b></div>`).join('')}
function rosterCard(w,disabled=false){return `<button class="wrestler-card ${disabled?'disabled':''}" data-id="${esc(w.id)}" ${disabled?'disabled':''}><div class="portrait-wrap"><img src="${esc(w.portrait)}" alt="${esc(w.name)}"></div><div class="overall-badge">${w.overall}</div><p class="card-era">${esc(w.era)} PERSONA</p><strong>${esc(w.name)}</strong><span>${esc(w.nickname)}</span></button>`}
function renderSelection(side){const p=side==='player';app.innerHTML=`<section class="selection-screen screen-shell"><button class="back-button" id="backButton">← ${p?'MAIN MENU':'PLAYER SELECT'}</button><p class="eyebrow">EXHIBITION 1v1</p><h1>${p?'Choose Your Wrestler':'Choose Your Opponent'}</h1><div class="roster-grid">${roster.map(w=>rosterCard(w,!p&&state.player?.id===w.id)).join('')}</div><div id="wrestlerDetails"></div></section>`;document.getElementById('backButton').onclick=p?renderHome:()=>renderSelection('player');document.querySelectorAll('.wrestler-card:not(.disabled)').forEach(c=>c.onclick=()=>renderWrestlerDetails(roster.find(w=>w.id===c.dataset.id),side))}
function renderWrestlerDetails(w,side){const panel=document.getElementById('wrestlerDetails');panel.innerHTML=`<section class="details-panel"><div><p class="eyebrow">${esc(w.archetype)}</p><h2>${esc(w.name)}</h2><p>${esc(w.height)} · ${esc(w.weight)} · ${esc(w.hometown)}</p><p><strong>Finisher:</strong> ${esc(w.finisher)}</p><button class="primary-button" id="confirmWrestler">CONFIRM ${side==='player'?'WRESTLER':'OPPONENT'}</button></div><div class="stats-list">${statRows(w)}</div></section>`;panel.scrollIntoView({behavior:'smooth',block:'nearest'});document.getElementById('confirmWrestler').onclick=()=>{if(side==='player'){state.player=w;renderSelection('opponent')}else{state.opponent=w;renderMatchPreview()}}}
function previewWrestler(w,label){return `<article class="preview-wrestler"><span class="side-label">${label}</span><img src="${esc(w.portrait)}" alt="${esc(w.name)}"><h2>${esc(w.name)}</h2><p>${esc(w.nickname)}</p><b>OVR ${w.overall}</b></article>`}
function renderMatchPreview(){app.innerHTML=`<section class="match-preview screen-shell"><button class="back-button" id="backButton">← OPPONENT SELECT</button><p class="eyebrow">1999 EXHIBITION</p><h1>Tonight’s Main Event</h1><div class="versus-layout">${previewWrestler(state.player,'YOU')}<div class="vs-mark">VS</div>${previewWrestler(state.opponent,'CPU')}</div><div class="rules-box"><strong>LEGACY MATCH ENGINE</strong><span>Health, momentum, control, match phases, counters, near falls, finishers and match rating all affect the result.</span></div><button class="primary-button" id="beginMatch">BEGIN MATCH</button></section>`;document.getElementById('backButton').onclick=()=>renderSelection('opponent');document.getElementById('beginMatch').onclick=()=>{resetMatch();renderDecision()}}

function meter(label,value,type){return `<div class="meter"><div class="meter-label"><span>${label}</span><b>${Math.round(value)}</b></div><div class="meter-track"><i class="${type}" style="width:${value}%"></i></div></div>`}
function statusPanel(){return `<section class="match-status"><article><div class="status-name"><img src="${esc(state.player.portrait)}" alt=""><strong>${esc(state.player.shortName)}</strong></div>${meter('HEALTH',state.playerHealth,'health')}${meter('MOMENTUM',state.playerMomentum,'momentum')}</article><div class="turn-badge"><span>TURN ${state.turn}</span><b>${esc(state.phase)}</b></div><article><div class="status-name cpu"><strong>${esc(state.opponent.shortName)}</strong><img src="${esc(state.opponent.portrait)}" alt=""></div>${meter('HEALTH',state.opponentHealth,'health')}${meter('MOMENTUM',state.opponentMomentum,'momentum')}</article><div class="control-meter"><span>PLAYER CONTROL</span><div><i style="width:${state.control}%"></i></div><b>${Math.round(state.control)}%</b></div></section>`}
function decisionCard(w,i){return `<button class="trading-card" data-card="${i}" aria-label="Choose ${esc(w.decisionName)}"><div class="card-frame"><img src="${esc(w.decisionCard)}" alt="${esc(w.decisionName)}"><div class="move-name-overlay">${esc(w.decisionName)}</div></div></button>`}

function phaseForTurn(){if(state.turn<=2)return 'Opening Bell';if(state.playerHealth<35||state.opponentHealth<35)return 'Closing Stretch';if(state.turn<=5)return 'Building Momentum';return 'High Drama'}
function attr(w,...keys){return keys.reduce((s,k)=>s+(w.stats[k]||0),0)/keys.length}
function cardProfile(slot){
  const phase=phaseForTurn();
  const profiles=[
    {kind:'risk',name:'Explosive Attack',base:.55,power:1.25,momentum:14,control:9},
    {kind:'control',name:'Calculated Pressure',base:.72,power:.92,momentum:9,control:13},
    {kind:'counter',name:'Counter and Capitalise',base:.64,power:1.05,momentum:11,control:11}
  ];
  if(phase==='Closing Stretch')profiles[slot]={kind:'finisher',name:'Commit to the Finish',base:.48,power:1.55,momentum:18,control:15};
  return profiles[slot];
}
function successChance(attacker,defender,profile,isPlayer){
  const attack=profile.kind==='risk'?attr(attacker,'speed','brawling','charisma'):profile.kind==='control'?attr(attacker,'technique','ringIQ','resilience'):profile.kind==='counter'?attr(attacker,'ringIQ','technique','speed'):attr(attacker,'charisma','brawling','power');
  const defence=attr(defender,'resilience','ringIQ','technique');
  const controlEdge=(isPlayer?state.control-50:50-state.control)/180;
  const momentumEdge=((isPlayer?state.playerMomentum:state.opponentMomentum)-(isPlayer?state.opponentMomentum:state.playerMomentum))/300;
  return clamp(profile.base+(attack-defence)/230+controlEdge+momentumEdge,.22,.92);
}
function moveLine(w,profile,success){
  if(profile.kind==='finisher')return success?`${w.shortName} connects with the ${w.finisher}!`:`${w.shortName} goes for the ${w.finisher}, but it is countered!`;
  const moves=profile.kind==='risk'?[...w.signatures,w.finisher]:profile.kind==='control'?[w.signatures[1],w.signatures[2],w.signatures[0]]:[w.signatures[2],w.signatures[0],w.finisher];
  return success?`${w.shortName} lands ${one(moves)} and takes control.`:`${w.shortName} commits, but the opening disappears.`;
}
function applyAction(attacker,defender,profile,isPlayer){
  const success=Math.random()<successChance(attacker,defender,profile,isPlayer);
  const critical=success&&Math.random()<.14+(profile.kind==='finisher'?.12:0);
  const attackScore=attr(attacker,'power','brawling','technique');
  let damage=success?Math.round((7+(attackScore-80)/8+rnd(0,7))*profile.power):rnd(0,3);
  if(critical)damage+=rnd(5,10);
  if(profile.kind==='finisher'&&success)state.finishers++;
  const line=moveLine(attacker,profile,success);
  if(isPlayer){state.opponentHealth=clamp(state.opponentHealth-damage,0,100);state.playerMomentum=clamp(state.playerMomentum+(success?profile.momentum:2),0,100);state.opponentMomentum=clamp(state.opponentMomentum-(success?5:0),0,100);state.control=clamp(state.control+(success?profile.control:-8),5,95);state.playerPerformance+=success?damage+profile.control:1}else{state.playerHealth=clamp(state.playerHealth-damage,0,100);state.opponentMomentum=clamp(state.opponentMomentum+(success?profile.momentum:2),0,100);state.playerMomentum=clamp(state.playerMomentum-(success?5:0),0,100);state.control=clamp(state.control-(success?profile.control:-8),5,95);state.opponentPerformance+=success?damage+profile.control:1}
  state.crowd=clamp(state.crowd+(success?rnd(4,9):1)+(critical?6:0),0,100);
  if(success&&damage>=18)state.highlights.push(line);
  state.log.push(line);
  return {success,damage,line,critical};
}
function cpuProfile(){
  if(state.playerHealth<30&&state.opponentMomentum>55)return {kind:'finisher',name:'Commit to the Finish',base:.48,power:1.55,momentum:18,control:15};
  if(state.control>62)return {kind:'counter',name:'Counter and Capitalise',base:.64,power:1.05,momentum:11,control:11};
  return Math.random()<.5?{kind:'risk',name:'Explosive Attack',base:.55,power:1.25,momentum:14,control:9}:{kind:'control',name:'Calculated Pressure',base:.72,power:.92,momentum:9,control:13};
}
function checkNearFall(){
  const low=Math.min(state.playerHealth,state.opponentHealth);
  if(low>30||Math.random()>.34)return '';
  state.nearFalls++;
  const victim=state.playerHealth<state.opponentHealth?state.player:state.opponent;
  const line=`${victim.shortName} kicks out at two and nine-tenths!`;
  state.log.push(line); state.highlights.push(line); state.crowd=clamp(state.crowd+12,0,100); return line;
}
function shouldEnd(){if(state.playerHealth<=0||state.opponentHealth<=0)return true;if(state.turn>=12)return true;if(state.turn>=7&&Math.min(state.playerHealth,state.opponentHealth)<18&&Math.random()<.34)return true;return false}
function winner(){if(state.playerHealth===state.opponentHealth)return state.playerPerformance>=state.opponentPerformance?state.player:state.opponent;return state.playerHealth>state.opponentHealth?state.player:state.opponent}
function matchRating(){const drama=(100-Math.abs(state.playerHealth-state.opponentHealth))*.016;const base=1.2+state.turn*.15+state.nearFalls*.35+state.finishers*.3+state.crowd/100;return clamp(Math.round(base*2)/2,1,5)}

function renderDecision(message=''){
  state.phase=phaseForTurn();
  app.innerHTML=`<section class="match-screen screen-shell">${statusPanel()}${message?`<div class="turn-message">${esc(message)}</div>`:''}<p class="eyebrow">MAKE YOUR MOVE</p><h1>Choose a Trading Card</h1><div class="trading-card-grid">${[0,1,2].map(i=>decisionCard(state.player,i)).join('')}</div><div class="match-log">${state.log.slice(-4).reverse().map(x=>`<p>${esc(x)}</p>`).join('')}</div></section>`;
  document.querySelectorAll('.trading-card').forEach(c=>c.onclick=()=>resolveTurn(Number(c.dataset.card)));
}
function resolveTurn(slot){
  document.querySelectorAll('.trading-card').forEach(c=>c.disabled=true);
  const p=applyAction(state.player,state.opponent,cardProfile(slot),true);
  let message=p.line;
  if(state.opponentHealth>0){const c=applyAction(state.opponent,state.player,cpuProfile(),false);message+=` ${c.line}`}
  const nf=checkNearFall(); if(nf)message+=` ${nf}`;
  state.turn++;
  if(shouldEnd()){state.ended=true;setTimeout(renderResult,420)}else setTimeout(()=>renderDecision(message),420);
}
function renderStars(r){let s='';for(let i=1;i<=5;i++)s+=i<=Math.floor(r)?'★':i-r===.5?'⯪':'☆';return s}
function renderResult(){const w=winner(),won=w.id===state.player.id,rating=matchRating();app.innerHTML=`<section class="result-screen screen-shell"><p class="eyebrow">MATCH COMPLETE</p><h1>${won?'Victory!':'Defeat'}</h1><div class="winner-card"><img src="${esc(w.portrait)}" alt="${esc(w.name)}"><span>${won?'YOUR WINNER':'MATCH WINNER'}</span><h2>${esc(w.name)}</h2><p>${esc(w.finisher)} decides the match.</p></div><div class="rating-panel"><small>MATCH RATING</small><strong>${renderStars(rating)}</strong><b>${rating.toFixed(1)} STARS</b><div><span>${state.turn-1} turns</span><span>${state.nearFalls} near falls</span><span>${state.finishers} finishers</span></div></div><div class="result-actions"><button class="primary-button" id="rematch">REMATCH</button><button class="secondary-button" id="newMatch">NEW MATCH</button></div></section>`;document.getElementById('rematch').onclick=()=>{resetMatch();renderDecision()};document.getElementById('newMatch').onclick=renderHome}

homeButton.addEventListener('click',renderHome);renderHome();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));

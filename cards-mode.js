(function(){
 const VERSION='0.2.4';
 function portrait(w){return `<img src="${w.image}" alt="${w.name}">`}
 window.home=function(){
  clearStoryTimer(); M=null; setActiveGameMode('exhibition');
  render(`<section class="panel cards-home"><div class="tv-kicker">EXHIBITION 1V1</div><h1>CHOOSE YOUR WRESTLER</h1><p class="sub">1999 Attitude Era prototype</p><div class="cards-roster">${WRESTLERS.map(w=>`<button class="cards-roster-card" onclick="cardsStart('${w.id}')">${portrait(w)}<small>${w.title}</small><b>${w.name}</b><span>OVERALL ${w.overall}</span></button>`).join('')}</div></section>`);
 };
 window.cardsStart=function(id){
  const p=WRESTLERS.find(w=>w.id===id),o=WRESTLERS.find(w=>w.id!==id);
  S={team:[p],opp:[o],streak:0,chem:0,momentum:0,wind:false,windAwarded:false,challengeSeen:false,specialSingles:true,tagBackup:null,exhibition:true,quickType:'singles',quickPlayer:p,quickSelections:[],manager:null,nextMatchBonus:0,eventHistory:[],interviewCount:0};
  match();
 };
 const originalDecisionHTML=window.decisionHTML||decisionHTML;
 window.decisionHTML=decisionHTML=function(){
  if(M.decisionOutcome)return originalDecisionHTML();
  const d=getDecision(); M.currentDecision=d;
  const p=S.team[M.activeP];
  const img=p.id==='the-rock'?'assets/cards/the-rock/rock-bottom.webp':'assets/cards/stone-cold-steve-austin/stone-cold-stunner.webp';
  const move=p.finisher;
  return `<div class="story-decision trading-decision"><small>YOUR CALL</small><h2>${d.title}</h2><p>${d.text}</p><div class="choice-grid trading-choice-grid">${d.options.map((x,i)=>`<button class="choice trading-choice" onclick="storyChoice('choice-${i}')" aria-label="${x.name}"><img src="${img}" alt="${move}"><span>${move}</span></button>`).join('')}</div></div>`;
 };
 document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('.build-tag,.lpw-start-version').forEach(x=>x.textContent='VERSION '+VERSION);});
 setTimeout(()=>{window.__LPW_BOOT_COMPLETE__=true;home()},100);
})();

/* LEGACY Pro Wrestling 1.0 — Consolidated Runtime
   Canonical runtime entry point for the consolidated 1.0 build. */
/* =============================================================================
   LEGACY PRO WRESTLING 1.0 — CONSOLIDATED RUNTIME MODULE
   Mobile layout, canonical NPC progression, social/editorial redesigns,
   post-match career growth, show-brand sizing and dialogue expansion.
   ============================================================================= */
(function(){
 const BUILD='1.0.2';
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
 const choose=a=>a[Math.floor(Math.random()*a.length)];
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 function activeCareer(c){
  if(!c)return null;c.livingCareers=c.livingCareers||{};
  const x=c.livingCareers[c.active]||(c.livingCareers[c.active]={id:c.active,wins:Number(c.wins)||0,losses:Number(c.losses)||0,streak:0,momentum:Number(c.momentum)||50,popularity:Number(c.popularity)||20,relationships:{},modifiers:{},opportunities:{},history:[]});
  x.relationships=x.relationships||{};x.modifiers=x.modifiers||{};x.opportunities=x.opportunities||{};return x;
 }
 function syncCareer(c){const x=activeCareer(c);if(!x)return;x.momentum=clamp(x.momentum,0,100);x.popularity=clamp(x.popularity,0,100);c.momentum=x.momentum;c.popularity=x.popularity;}
 function npcVisual(id){return typeof lpw836NpcVisual==='function'?lpw836NpcVisual(id,'portrait'):npcImage(id,'portrait')}
 function currentRank(c,id){const rows=typeof lpw8Rankings==='function'?lpw8Rankings(c):(c.rankings||[]);const i=rows.findIndex(r=>r.id===id);return i<0?null:i+1}
 function showLogoCleanup(){
  document.querySelectorAll('.live-match-card .brand,.live-match-card .lpw913-legacy-mark,.live-match-card .lpw-brand-logo,.live-show-intro .lpw913-legacy-mark,.live-show-intro .lpw-brand-logo').forEach(n=>n.remove());
  document.querySelectorAll('.live-match-card img').forEach(img=>{if(/legacy/i.test(img.alt||'')||/legacy-logo/i.test(img.src||''))img.remove()});
  document.querySelectorAll('.lpw-show-logo').forEach(n=>n.classList.add('lpw91-responsive-show-logo'));
 }
 function repairStarMarkup(){document.querySelectorAll('.result-stars').forEach(n=>{const t=n.textContent||'';if(t.includes('<i class="lpw913-star'))n.innerHTML=t})}
 function compactCareerHeader(){
  const top=document.querySelector('.live-calendar-top');if(!top)return;
  top.querySelectorAll('.lpw84-dashboard-btn,[onclick*="lpw84Dashboard"]').forEach(n=>n.remove());
  const logo=[...document.querySelectorAll('img')].find(i=>/legacy-logo/i.test(i.src||''));
  if(logo&&!top.contains(logo)){const wrap=document.createElement('div');wrap.className='lpw91-career-logo';logo.parentNode?.removeChild(logo);wrap.appendChild(logo);top.prepend(wrap)}
  top.classList.add('lpw91-career-header');
 }
 function moveRankingArrows(){
  document.querySelectorAll('.lpw8-ranking-list article,.lpw919-rank-row,.lpw918-rank-row,.lpw-living-rank-row').forEach(row=>{
   const name=row.querySelector('span b, .rank-name, b');if(!name)return;
   const move=[...row.querySelectorAll('*')].find(n=>n!==name&&/^[▲▼↑↓]\s*\d*$/.test((n.textContent||'').trim()));
   if(move){move.classList.add('lpw91-rank-movement');name.insertAdjacentElement('afterend',move)}
  });
 }
 function afterRender(){setTimeout(()=>{showLogoCleanup();repairStarMarkup();compactCareerHeader();moveRankingArrows()},35)}
 ['gauntletLiveCalendar','gauntletLiveShowIntro','gauntletLiveMatchCard65','lpw8RankingScreen','lpw84Dashboard','gauntletLiveWorldRecap'].forEach(name=>{const old=window[name];if(typeof old!=='function')return;window[name]=function(){const r=old.apply(this,arguments);afterRender();return r}});

 // One canonical NPC outcome transaction powers preview, save, outcome and hub.
 window.lpw91ApplyOutcome=function(npcId,title,changes,reaction,ripple){
  const c=liveLoad();if(!c)return gauntletLiveCalendar();const x=activeCareer(c),p=liveProgress(c.active,c),f=liveFeud(c),before={},after={};
  Object.keys(changes||{}).forEach(k=>{before[k]=['power','speed','technique','charisma','resilience','versatility','finisher','recovery'].includes(k)?Number(p.stats[k]||0):k==='feud'?Number(f?.intensity||0):k==='momentum'?Number(x.momentum||50):k==='popularity'?Number(x.popularity||20):Number(x[k]||0)});
  Object.entries(changes||{}).forEach(([k,v])=>{v=Number(v)||0;if(k==='feud'){if(f)f.intensity=clamp(Number(f.intensity||0)+v,0,100)}else if(['power','speed','technique','charisma','resilience','versatility','finisher','recovery'].includes(k)){const cap=Number(p.caps?.[k]||100);p.stats[k]=clamp(Number(p.stats[k]||0)+v,0,cap)}else if(k==='momentum')x.momentum=clamp(Number(x.momentum||50)+v,0,100);else if(k==='popularity')x.popularity=clamp(Number(x.popularity||20)+v,0,100);else x[k]=Number(x[k]||0)+v});
  Object.keys(changes||{}).forEach(k=>{after[k]=['power','speed','technique','charisma','resilience','versatility','finisher','recovery'].includes(k)?Number(p.stats[k]||0):k==='feud'?Number(f?.intensity||0):k==='momentum'?Number(x.momentum||50):k==='popularity'?Number(x.popularity||20):Number(x[k]||0)});
  x.relationships[npcId]=clamp(Number(x.relationships[npcId]||0)+(Object.values(changes||{}).some(v=>Number(v)>0)?5:-2),-100,100);syncCareer(c);if(typeof liveAwardXp==='function')liveAwardXp(c,c.active,35,'Career activity');if(typeof liveAdvanceDay==='function')liveAdvanceDay(c);liveSave(c);
  const rows=Object.keys(after).map(k=>{const d=after[k]-before[k];return `<div class="lpw91-change"><small>${esc(k.toUpperCase())}</small><b>${before[k]} <span>→</span> ${after[k]}</b><em class="${d<0?'down':''}">${d>0?'+'+d:d<0?d:'NO CHANGE'}</em></div>`}).join('');
  render(`<section class="panel live-day-complete lpw-consequence-screen lpw91-consequence"><div class="tv-kicker">OUTCOME</div><h1>${esc(title)}</h1><div class="lpw-consequence-host">${npcVisual(npcId)}<span><small>${esc(npc(npcId)?.role||'')}</small><b>${esc(npc(npcId)?.name||'')}</b></span></div><div class="lpw-change-grid">${rows}</div><div class="lpw-world-reaction"><small>WORLD REACTION</small><p>${esc(reaction)}</p></div><div class="lpw-ripple"><b>THE FALLOUT</b><span>${esc(ripple)}</span></div><button class="btn live-primary" onclick="gauntletLiveCalendar()">CONTINUE</button></section>`)
 };
 window.lpw836ApplyOutcome=window.lpw91ApplyOutcome;
 window.lpw837SocialChoice=(title,changes,reaction)=>lpw91ApplyOutcome('ava-cross',title,changes,reaction,'The post can influence future commentary, Dirt Sheet coverage and rival responses.');

 // Match results now write visible form and popularity progression immediately.
 if(typeof liveCompleteBroadcast==='function'){
  const complete=liveCompleteBroadcast;liveCompleteBroadcast=function(win){const before=liveLoad(),id=before?.active,oldW=id?Number(activeCareer(before)?.wins||0):0;const result=complete.apply(this,arguments),c=liveLoad();if(c&&id){const x=activeCareer(c),last=c.world?.lastResult||{},rating=Number(last.rating||3),crowd=Number(last.crowd||last.excitement||50),oppRank=currentRank(c,last.opponent),myRank=currentRank(c,id),upset=win&&oppRank&&myRank&&oppRank<myRank;const momentumDelta=win?(upset?8:5):-4;const popDelta=Math.max(win?2:0,Math.round((rating-2.5)*2)+(crowd>=70?2:0)+(upset?2:0));x.momentum=clamp(Number(x.momentum||50)+momentumDelta,0,100);x.popularity=clamp(Number(x.popularity||20)+Math.max(0,popDelta),0,100);syncCareer(c);c.world.pendingFirstCareerVictory=win&&oldW===0;liveSave(c)}return result};window.liveCompleteBroadcast=liveCompleteBroadcast;
 }

 // Achievement should appear immediately after the first committed Career win.
 const milestone0=window.milestoneData;window.milestoneData=function(){const c=liveLoad();if(c?.world?.pendingFirstCareerVictory){c.world.pendingFirstCareerVictory=false;liveSave(c);return [['FIRST CAREER VICTORY','Your first Career victory is officially in the record books.']]}return typeof milestone0==='function'?milestone0():[]};

 // Healthy wrestlers no longer receive a redundant full-screen medical check.
 if(typeof lpw837Medical==='function'){
  const medical0=lpw837Medical;window.lpw837Medical=function(){const c=liveLoad(),x=activeCareer(c),p=liveProgress(c.active,c),injured=!!(c?.world?.injury||c?.world?.injuryDetail),recovery=Number(p?.stats?.recovery||75),matches=Number(x?.wins||0)+Number(x?.losses||0);if(!injured&&recovery>=60&&matches<3){return typeof lpw836Training==='function'?lpw836Training():lpw837AvaPulse()}return medical0.apply(this,arguments)};
 }

 // Ava's Pulse: actual social feed and quote-based response composer.
 window.lpw837AvaPulse=function(){
  const c=liveLoad(),p=liveFounder(c.active),r=liveFeudOpponent(c),last=c.world?.lastResult,rank=currentRank(c,c.active),pool=(typeof liveOtherPool==='function'?liveOtherPool(c):[]).filter(w=>w.id!==c.active),other=choose(pool)||p,hash='#'+p.name.replace(/[^A-Za-z0-9]/g,'');
  const posts=[
   {avatar:'ava-cross',name:'Ava Cross',handle:'@AvaCrossLPW',time:'8m',text:last?.win?`${p.name} is building momentum after another televised victory. Who should be next?`:`The conversation is already turning to how ${p.name} responds next.`,eng:'♡ 1.8K   ↻ 412   💬 296',official:true},
   {avatar:null,name:'LPW Official',handle:'@LPWOfficial',time:'23m',text:`Power Rankings update: ${p.name} is now #${rank||'—'}.`,eng:'♡ 3.1K   ↻ 780   💬 441',official:true},
   {avatar:r?.id||other.id,name:r?.name||other.name,handle:'@'+(r?.name||other.name).replace(/[^A-Za-z0-9]/g,''),time:'41m',text:r?choose([`One result does not change the hierarchy.`,`Keep watching the rankings. The next bell tells the truth.`,`The spotlight is temporary. The fight is permanent.`]):`The whole roster is watching what happens next.`,eng:'♡ 2.4K   ↻ 519   💬 633'}
  ];
  render(`<section class="panel live-world-screen lpw91-social"><header>${npcVisual('ava-cross')}<h1>AVA'S PULSE</h1><span>LPW SOCIAL FEED · ${hash} TRENDING</span></header><div class="lpw91-feed">${posts.map(z=>`<article class="${z.official?'official':''}"><div class="lpw91-feed-head">${z.avatar?npcVisual(z.avatar):'<span class="lpw91-avatar">LPW</span>'}<p><b>${esc(z.name)} ${z.official?'✓':''}</b><small>${esc(z.handle)} · ${z.time}</small></p></div><div>${esc(z.text)}</div><small>${z.eng}</small></article>`).join('')}</div><h2>CHOOSE YOUR RESPONSE</h2><div class="live-choice-grid lpw91-post-choices"><button onclick="lpw837SocialChoice('YOUR POST GOES VIRAL',{popularity:4,momentum:2,feud:5},'A confident post is shared across the LPW audience.')"><b>“${r?`${r.name} can keep talking. I’ll keep winning.`:`The whole roster can watch what happens next.`}”</b><span>Bold · Popularity +4 · Momentum +2${r?' · Feud +5':''}</span></button><button onclick="lpw837SocialChoice('FANS RESPECT THE FOCUS',{popularity:3,momentum:4},'A measured response earns respect without losing focus.')"><b>“Respect to everyone in LPW. My focus is the next match.”</b><span>Professional · Popularity +3 · Momentum +4</span></button><button onclick="lpw837SocialChoice('SILENCE BUILDS INTRIGUE',{momentum:2},'The decision not to respond creates more speculation.')"><b>Do not post. Let the story develop.</b><span>Reserved · Momentum +2</span></button></div></section>`)
 };

 // Dirt Sheet: compact publication layout sharing Ava's modern card language.
 window.lpw837DirtSheet=function(supercard=false){
  const c=liveLoad(),p=liveFounder(c.active),r=liveFeudOpponent(c),last=c.world?.lastResult,pool=(typeof liveOtherPool==='function'?liveOtherPool(c):[]).filter(w=>w.id!==c.active),rise=choose(pool)||p,fall=choose(pool.filter(w=>w.id!==rise.id))||r||p,rating=Number(last?.rating||3.5),issue=`SEASON ${Math.floor((Number(c.month||1)-1)/12)+1} · WEEK ${liveMonthWeek(c)}`;
  const articles=[
   ['LEAD STORY',last?`${last.win?p.name:liveFounder(last.opponent)?.name} owns the week’s defining result`:`The next broadcast could reshape the rankings`,last?.win?`${p.name}'s latest victory has forced the locker room to reassess the current pecking order.`:`Derek Pierce examines the most consequential story in LPW.`],
   ['MATCH OF THE WEEK',last?`${p.name} vs ${liveFounder(last.opponent)?.name||'an opponent'}`:'To be determined',`${rating.toFixed(1)} stars · The match everyone is still discussing.`],
   ['STOCK RISING',rise.name,choose(['Backstage confidence is rising after a string of sharp performances.','A quiet run of results is beginning to become impossible to ignore.','The rankings movement is matching the growing crowd response.'])],
   ['STOCK FALLING',fall.name,choose(['The next appearance now carries uncomfortable pressure.','Officials want to see a convincing response before confidence returns.','A difficult stretch has created questions that only a win can answer.'])],
   ['CONTRACT & OPPORTUNITY',choose(pool)?.name||p.name,choose(['Talent Relations is believed to be discussing a larger role.','Production is reportedly considering a featured television opportunity.','Several people backstage expect a major announcement before the next SuperCard.'])],
   ['RUMOUR OF THE WEEK','SOURCES SAY…',r?`Officials have discussed adding a stipulation to ${p.name} and ${r.name}'s next confrontation.`:'A significant rivalry is expected to emerge from the middle of the Power Rankings.']
  ];
  render(`<section class="panel live-world-screen lpw91-dirt"><button class="btn live-primary lpw91-top-continue" onclick="lpw836CompleteMedia()">CONTINUE TO NEXT DAY</button><header>${npcVisual('derek-pierce')}<h1>DIRT SHEET DIGEST</h1><span>${issue} · BY DEREK PIERCE</span><p>“Results are public. Context is where the real story begins.”</p></header><div class="lpw91-publication">${articles.map((a,i)=>`<article class="${i===0?'lead':''}"><small>${a[0]} · ${i*9+4} MIN AGO</small><h2>${esc(a[1])}</h2><p>${esc(a[2])}</p></article>`).join('')}</div><p class="lpw-disclaimer">Rumours are based on anonymous sources and backstage speculation. LPW has not verified these claims.</p><button class="btn live-primary" onclick="lpw836CompleteMedia()">CONTINUE</button></section>`)
 };

 // Contextual Katie Morgan interview with actual quote choices.
 window.gauntletLiveKatieInterview=function(){
  const c=liveLoad(),p=liveFounder(c.active),r=liveFeudOpponent(c),x=activeCareer(c),rank=currentRank(c,c.active),last=c.world?.lastResult;
  const questions=[
   r&&last?.win?`You have beaten ${r.name}, but the rivalry is far from settled. What changes next time?`:null,
   r?`You are ranked #${rank||'—'} while ${r.name} remains directly in your path. Is this still about the rivalry or already about the championship?`:null,
   last?.win?`Your latest victory changed the conversation around ${p.name}. What should the locker room understand now?`:`The latest result did not go your way. What do you say to the people questioning your momentum?`,
   `You have ${x.wins||0} wins this season. What is the next step in ${p.name}'s career?`
  ].filter(Boolean);
  const q=choose(questions);
  render(`<section class="panel live-world-screen lpw-katie-interview lpw91-npc-compact"><button class="shell-back" onclick="gauntletLiveCalendar()">← CALENDAR</button><div class="lpw91-npc-head">${npcVisual('katie-morgan')}<div><small>EXCLUSIVE · BACKSTAGE</small><h1>KATIE MORGAN</h1><span>BACKSTAGE INTERVIEWER</span></div></div><blockquote>“${esc(q)}”</blockquote><div class="live-choice-grid"><button onclick="lpw91ApplyOutcome('katie-morgan','RESPECTFUL CONFIDENCE',{popularity:6},'The audience responds to the balanced answer.','Katie may frame future interviews more favourably.')"><b>“${r?`${r.name} pushed me, but pressure brings out my best.`:`I respect this roster, but I know I belong here.`}”</b><span>Popularity +6 · Katie relationship</span></button><button onclick="lpw91ApplyOutcome('katie-morgan','RIVALRY ESCALATED',{momentum:5,feud:7},'The warning becomes the lead quote from the interview.','Your rival is likely to answer publicly.')"><b>“${r?`${r.name} knows what is coming. There is nowhere left to hide.`:`The next opponent will find out exactly what I can do.`}”</b><span>Momentum +5${r?' · Feud +7':''}</span></button><button onclick="lpw91ApplyOutcome('katie-morgan','CHAMPIONSHIP AMBITION',{popularity:3,momentum:3},'The championship declaration spreads through LPW media.','Management will judge whether your results match the ambition.')"><b>“Every opponent is an obstacle. The World Championship is the destination.”</b><span>Popularity +3 · Momentum +3 · Management attention</span></button></div></section>`)
 };

 // More varied backstage-attack reports and meaningful choices.
 const oldStory=window.gauntletLiveStorySegment;window.gauntletLiveStorySegment=function(seg){if(seg!=='backstage-attack')return oldStory.apply(this,arguments);const c=liveLoad(),r=liveFeudOpponent(c),p=liveFounder(c.active),places=['loading dock','production corridor','parking structure','locker-room entrance','interview position'],motives=['retaliation for the latest loss','an attempt to derail your rankings climb','a warning before the next televised match','a response to your public comments','a bid to control the rivalry narrative'];render(`<section class="panel live-world-screen lpw-story lpw91-attack"><div class="tv-kicker">${liveShowName(c)} · BACKSTAGE ATTACK</div><h1>BACKSTAGE ATTACK</h1><div class="live-npc-scene compact">${npcVisual('leon-ward')}<div><small>HEAD OF SECURITY</small><b>Leon Ward</b><p>${esc(`${r.name} ambushed ${p.name} near the ${choose(places)}. Security believes it was ${choose(motives)}.`)}</p></div></div><div class="lpw-story-matchup">${lpwPortraitCard(p,'ACTIVE WRESTLER')}${lpwPortraitCard(r,'RIVAL')}</div><div class="live-choice-grid"><button onclick="lpw91ApplyOutcome('leon-ward','CONTROL MAINTAINED',{popularity:6},'The measured response earns respect without losing the audience.','Security trust improves and your rival must reconsider the next move.')"><b>LET SECURITY HANDLE IT</b><span>Popularity +6 · Leon relationship</span></button><button onclick="lpw91ApplyOutcome('leon-ward','PUBLIC CHALLENGE ISSUED',{popularity:4,feud:8},'Your public challenge dominates the next news cycle.','A confrontation may be added to the next broadcast.')"><b>CALL THEM OUT PUBLICLY</b><span>Popularity +4 · Feud +8</span></button><button onclick="lpw91ApplyOutcome('leon-ward','IMMEDIATE RETALIATION',{momentum:6,feud:10},'The rivalry becomes more volatile after your response.','Management may consider disciplinary consequences.')"><b>STRIKE BACK IMMEDIATELY</b><span>Momentum +6 · Feud +10 · Discipline risk</span></button></div></section>`)};

 // World recap top spacing and all show logo sizing handled by CSS; tag results
 // receive equal winner art columns and no centre seam.
 const render0=window.render;if(typeof render0==='function')window.render=function(html){const r=render0(html);afterRender();return r};
 document.querySelectorAll('.build-tag,.live-cycle b').forEach(n=>n.textContent=`VERSION ${BUILD}`);window.TTG_APP_VERSION=BUILD;window.LPW_GAMEPLAY_BUILD=BUILD;
})();

/* =============================================================================
   LEGACY PRO WRESTLING 1.0 — CONSOLIDATED RUNTIME MODULE
   Direct component corrections following 1.0 device testing.
   ============================================================================= */
(function(){
 const BUILD='1.0.2';
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
 const pick=a=>a[Math.floor(Math.random()*a.length)];
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const portrait=id=>typeof lpw836NpcVisual==='function'?lpw836NpcVisual(id,'portrait'):npcImage(id,'portrait');
 const career=c=>{c.livingCareers=c.livingCareers||{};const x=c.livingCareers[c.active]||(c.livingCareers[c.active]={id:c.active,wins:c.wins||0,losses:c.losses||0,momentum:c.momentum||50,popularity:c.popularity||20,relationships:{},modifiers:{},opportunities:{},history:[]});return x};
 const rank=(c,id)=>{const rows=typeof lpw8Rankings==='function'?lpw8Rankings(c):(c.rankings||[]);const i=rows.findIndex(r=>r.id===id);return i<0?null:i+1};
 const otherPool=c=>(typeof liveOtherPool==='function'?liveOtherPool(c):WRESTLERS).filter(w=>w&&w.id!==c.active);
 const npcInfo=id=>typeof npc==='function'?npc(id):null;

 function wait(fn){setTimeout(fn,20)}
 function findLegacyLogo(root=document){return [...root.querySelectorAll('img')].find(i=>/legacy-logo|legacy.*pro.*wrestling/i.test((i.src||'')+' '+(i.alt||'')))}

 function fixCareerHeader(){
  const screen=document.querySelector('.live-calendar-screen');
  const top=screen?.querySelector('.live-calendar-top');
  if(!screen||!top)return;
  top.querySelectorAll('.lpw84-dashboard-btn,[onclick*="lpw84Dashboard"]').forEach(n=>n.remove());
  let logo=findLegacyLogo(screen);
  if(!logo){
   const src=[...document.querySelectorAll('img')].find(i=>/legacy-logo/i.test(i.src||''))?.src||'assets/branding/legacy-logo.webp';
   logo=document.createElement('img');logo.src=src;logo.alt='LEGACY Pro Wrestling';
  }
  const wrap=document.createElement('div');wrap.className='lpw911-career-brand';wrap.appendChild(logo);
  top.prepend(wrap);top.classList.add('lpw911-career-header');
 }

 function fixRankingRows(){
  const c=typeof liveLoad==='function'?liveLoad():null;
  const fresh=!!c&&Number(c.wins||0)+Number(c.losses||0)===0&&Object.values(c.livingCareers||{}).every(x=>Number(x.wins||0)+Number(x.losses||0)===0);
  document.querySelectorAll('.lpw8-ranking-list article,.lpw919-rank-row,.lpw918-rank-row,.lpw-living-rank-row,.lpw84-dashboard .power-rankings article,.lpw-living-dashboard .power-rankings article').forEach(row=>{
   const move=[...row.querySelectorAll('i,em,span,small')].find(n=>/^[▲▼↑↓]\s*\d*$/.test((n.textContent||'').trim()));
   if(!move)return;
   if(fresh){move.remove();return}
   const candidates=[...row.querySelectorAll('b,span')].filter(n=>!/^#?\d+$/.test((n.textContent||'').trim())&&!/^(YOU|ACTIVE|WORLD CHAMPION)$/i.test((n.textContent||'').trim())&&!n.contains(move));
   const name=candidates.find(n=>(n.textContent||'').trim().length>2);
   if(name){move.classList.add('lpw911-rank-movement');name.insertAdjacentElement('afterend',move)}
  });
 }

 function repairResultStars(){
  document.querySelectorAll('.result-stars,.lpw913-stars').forEach(n=>{const t=n.textContent||'';if(/<i class=["']lpw913-star/.test(t))n.innerHTML=t});
 }

 function commonAfterRender(){wait(()=>{fixCareerHeader();fixRankingRows();repairResultStars()})}
 ['gauntletLiveCalendar','lpw8RankingScreen','lpw84Dashboard'].forEach(name=>{const old=window[name];if(typeof old==='function')window[name]=function(){const r=old.apply(this,arguments);commonAfterRender();return r}});

 // Proper full-width Throwdown treatment on every screen and transition.
 function fixShowBranding(){
  document.querySelectorAll('.lpw-show-logo.throwdown').forEach(n=>n.classList.add('lpw911-throwdown'));
  document.querySelectorAll('.live-match-card,.live-show-intro').forEach(root=>findLegacyLogo(root)?.remove());
 }
 ['gauntletLiveShowIntro','gauntletLiveMatchCard65','gauntletLiveShowTransition'].forEach(name=>{const old=window[name];if(typeof old==='function')window[name]=function(){const r=old.apply(this,arguments);wait(fixShowBranding);return r}});

 // World recap receives a real two-sided header plus top and bottom progression controls.
 window.gauntletLiveWorldRecap=function(){
  // World Recap is always a Career screen. Force the correct shell state before rendering
  // so the global main-menu header can never appear above this screen.
  if(typeof setActiveGameMode==='function')setActiveGameMode('career');
  document.body.classList.add('lpw-world-recap-view');
  const c=liveLoad(),p=liveFounder(c.active),r=liveFeudOpponent(c),last=c.world?.lastResult,rankNow=rank(c,c.active);
  if(!c.world?.worldStories?.length&&typeof liveSimulateWorld==='function')liveSimulateWorld(c);
  const stories=(c.world?.worldStories||[]).slice(0,4);
  const lead=last?(last.win?`${p.name}'s victory is the lead story coming out of the latest broadcast.`:`The response to ${p.name}'s defeat is now one of the week's central questions.`):'The LPW landscape continues to evolve before the next bell.';
  const analysis=r?`${r.name} is unlikely to let the latest chapter go unanswered.`:'The locker room is already preparing for the next opportunity.';
  const pool=otherPool(c),surprise=pool[0],disappointment=pool[1]||r;
  const rows=stories.map(s=>`<article><span>${s.a?imageWithFallback(liveFounder(s.a),'portrait','art-portrait','matchPortrait'):''}</span><p>${esc(s.text)}</p>${s.b?`<span>${imageWithFallback(liveFounder(s.b),'portrait','art-portrait','matchPortrait')}</span>`:''}</article>`).join('');
  render(`<section class="panel live-world-screen lpw837-recap lpw911-world-recap"><button class="shell-back lpw-recap-calendar" onclick="gauntletLiveCalendar()">← CALENDAR</button><div class="tv-kicker">AROUND LPW</div><h1>WORLD RECAP</h1><button class="btn live-primary lpw911-recap-continue" onclick="gauntletLiveCompleteWorldRecap()">CONTINUE</button><div class="live-commentary-duo"><div>${portrait('mike-sullivan')}<b>Mike Sullivan</b><p>${esc(lead)}</p></div><div>${portrait('johnny-cannon')}<b>Johnny Cannon</b><p>${esc(analysis)}</p></div></div><div class="lpw837-recap-cards"><article><small>CHAMPIONSHIP OUTLOOK</small><b>RANKED #${rankNow||'—'}</b><p>${rankNow===1?'The World Championship opportunity is now within reach.':rankNow<=10?'The contender conversation is becoming more serious.':'Management is monitoring the early progress, but the championship picture remains some distance away.'}</p></article><article><small>BIGGEST SURPRISE</small><p>${surprise?`${surprise.name} created one of the week's most unexpected talking points.`:'The week produced no clear surprise.'}</p></article><article><small>BIGGEST DISAPPOINTMENT</small><p>${disappointment?`${disappointment.name} now carries added pressure into the next appearance.`:'No single disappointment defined the week.'}</p></article><article><small>RIVALRY WATCH</small><p>${r?`${p.name} and ${r.name} appear destined for another confrontation.`:'A new rivalry has yet to be confirmed.'}</p></article></div><div class="live-world-results">${rows}</div><div class="lpw-ripple"><b>LOOKING AHEAD</b><span>${r?`${r.name} may respond before the next SuperCard.`:'The next broadcast could reshape the rankings.'}</span></div><button class="btn live-primary lpw911-recap-continue" onclick="gauntletLiveCompleteWorldRecap()">CONTINUE</button></section>`);
  wait(()=>{
   document.body.classList.add('lpw-world-recap-view');
   const globalHeader=document.querySelector('body > header');
   if(globalHeader)globalHeader.setAttribute('aria-hidden','true');
   document.querySelectorAll('.lpw911-world-recap img[src=""],.lpw911-world-recap img:not([src]),.lpw911-recap-header').forEach(n=>n.remove());
  });
 };

 // A true social feed, compact enough for mobile and shared by every Ava entry point.
 function socialPostPool(c,p,r,other){
  const rankNow=rank(c,c.active),last=c.world?.lastResult;
  return [
   {id:'ava',avatar:'ava-cross',name:'Ava Cross',handle:'@AvaCrossLPW',text:last?.win?`${p.name}'s latest victory is climbing the clip charts. Who should be next?`:`All eyes are on how ${p.name} answers the latest setback.`,official:true},
   {id:'official',name:'LPW Official',handle:'@LPWOfficial',text:`Power Rankings update: ${p.name} currently sits at #${rankNow||'—'}.`,official:true},
   {id:'rival',avatar:r?.id||other.id,name:r?.name||other.name,handle:'@'+(r?.name||other.name).replace(/[^A-Za-z0-9]/g,''),text:r?pick(['One result does not change the hierarchy.','The rankings can wait. The next bell tells the truth.','Enjoy the attention while it lasts.']):'The locker room is watching the next move.'},
   {id:'fans',name:'LPW Fans',handle:'@LPWFans',text:pick(['The title picture feels one result away from changing.','Tonight proved the middle of the rankings is wide open.','Which wrestler deserves more television time next week?'])},
   {id:'commentary',avatar:'johnny-cannon',name:'Johnny Cannon',handle:'@CannonCalls',text:pick(['Momentum is useful. Pressure is the real test.','Every ranking rise creates a bigger target.','The next match will reveal whether this is form or a breakthrough.'])}
  ];
 }
 window.lpw911AvaPulse=function(){
  const c=liveLoad(),p=liveFounder(c.active),r=liveFeudOpponent(c),other=pick(otherPool(c))||p,posts=socialPostPool(c,p,r,other).sort(()=>Math.random()-.5).slice(0,3);
  render(`<section class="panel live-world-screen lpw91-social lpw911-social"><header>${portrait('ava-cross')}<h1>AVA'S PULSE</h1><span>LPW SOCIAL FEED · TRENDING NOW</span></header><div class="lpw91-feed">${posts.map((z,i)=>`<article class="${z.official?'official':''}"><div class="lpw91-feed-head">${z.avatar?portrait(z.avatar):'<span class="lpw91-avatar">LPW</span>'}<p><b>${esc(z.name)}${z.official?' ✓':''}</b><small>${esc(z.handle)} · ${8+i*13}m</small></p></div><div>${esc(z.text)}</div><small>♡ ${1+i}.8K   ↻ ${212+i*137}   💬 ${96+i*83}</small></article>`).join('')}</div><h2>CHOOSE YOUR RESPONSE</h2><div class="live-choice-grid lpw91-post-choices"><button onclick="lpw837SocialChoice('YOUR POST GOES VIRAL',{popularity:4,momentum:2,feud:5},'A confident post spreads across the LPW audience.')"><b>“${r?`${r.name} can keep talking. I’ll keep winning.`:'The whole roster can watch what happens next.'}”</b><span>Bold · Popularity +4 · Momentum +2${r?' · Feud +5':''}</span></button><button onclick="lpw837SocialChoice('FANS RESPECT THE FOCUS',{popularity:3,momentum:4},'A measured response earns respect without losing focus.')"><b>“Respect to everyone in LPW. My focus is the next match.”</b><span>Professional · Popularity +3 · Momentum +4</span></button><button onclick="lpw837SocialChoice('SILENCE BUILDS INTRIGUE',{momentum:2},'The decision not to respond creates more speculation.')"><b>Do not post. Let the story develop.</b><span>Reserved · Momentum +2</span></button></div></section>`);
 };
 window.lpw837AvaPulse=window.lpw911AvaPulse; window.lpw836AvaPulse=window.lpw911AvaPulse;

 // Compact publication redesign and both entry point aliases.
 window.lpw911DirtSheet=function(supercard=false){
  const c=liveLoad(),p=liveFounder(c.active),r=liveFeudOpponent(c),last=c.world?.lastResult,pool=otherPool(c),rise=pick(pool)||p,fall=pick(pool.filter(w=>w.id!==rise.id))||r||p,rating=Number(last?.rating||3.5),week=typeof liveMonthWeek==='function'?liveMonthWeek(c):c.week;
  const stories=[
   ['LEAD STORY',last?`${last.win?p.name:(liveFounder(last.opponent)?.name||p.name)} owns the week's defining result`:'The next broadcast could reshape the rankings',last?.win?`${p.name}'s latest victory has forced the locker room to reassess the current pecking order.`:'Derek Pierce examines the most consequential story in LPW.'],
   ['MATCH OF THE WEEK',last?`${p.name} vs ${liveFounder(last.opponent)?.name||'Opponent'}`:'To be determined',`${rating.toFixed(1)} stars · The match still generating debate.`],
   ['SUPERSTAR OF THE WEEK',rise.name,pick(['The performance creating the loudest conversation.','Backstage confidence is rising quickly.','A week of sharp work has changed the outlook.'])],
   ['STOCK FALLING',fall.name,pick(['The next appearance now carries added pressure.','A difficult result has raised uncomfortable questions.','The rankings offer little room for another setback.'])],
   ['CONTRACT GOSSIP',pick(pool)?.name||p.name,'Talent Relations is believed to be discussing future opportunities.'],
   ['RUMOUR OF THE WEEK','SOURCES SAY...',r?`Officials are considering a new stipulation involving ${p.name} and ${r.name}.`:'Management may be preparing a major announcement.']
  ];
  render(`<section class="panel live-world-screen lpw91-dirt lpw911-dirt"><header>${portrait('derek-pierce')}<h1>${supercard?'INSTANT REACTION':'DIRT SHEET DIGEST'}</h1><span>SEASON ${Math.floor((Number(c.month||1)-1)/12)+1} · WEEK ${week} · DEREK PIERCE</span></header><button class="btn live-primary lpw91-top-continue" onclick="lpw836CompleteMedia()">CONTINUE TO NEXT DAY</button><div class="lpw91-publication">${stories.map((s,i)=>`<article class="${i===0?'lead':''}"><small>${s[0]}</small><h2>${esc(s[1])}</h2><p>${esc(s[2])}</p><em>By Derek Pierce · ${i*11+4}m ago</em></article>`).join('')}</div><p class="lpw-disclaimer">Rumours are based on anonymous sources and backstage speculation. LPW has not verified these claims.</p><button class="btn live-primary lpw911-centered-button" onclick="lpw836CompleteMedia()">CONTINUE</button></section>`);
 };
 window.lpw837DirtSheet=window.lpw911DirtSheet; window.lpw836DirtSheet=window.lpw911DirtSheet;

 // Outcome screen is always centred and box-free, whether one, two or three stats change.
 const outcome0=window.lpw91ApplyOutcome||window.lpw836ApplyOutcome;
 window.lpw911ApplyOutcome=function(npcId,title,changes,reaction,ripple){
  if(typeof outcome0==='function'){const r=outcome0(npcId,title,changes,reaction,ripple);wait(()=>document.querySelector('.lpw91-consequence')?.classList.add('lpw911-consequence'));return r}
 };
 window.lpw91ApplyOutcome=window.lpw911ApplyOutcome;window.lpw836ApplyOutcome=window.lpw911ApplyOutcome;
 window.lpw837SocialChoice=(title,changes,reaction)=>window.lpw911ApplyOutcome('ava-cross',title,changes,reaction,'The post can influence future commentary, Dirt Sheet coverage and rival responses.');

 // Ensure canonical Career form values are shown on every hub return.
 const calSync=window.gauntletLiveCalendar;
 window.gauntletLiveCalendar=function(){const c=liveLoad();if(c){const x=career(c);c.momentum=clamp(x.momentum,0,100);c.popularity=clamp(x.popularity,0,100);liveSave(c)}const r=calSync.apply(this,arguments);commonAfterRender();return r};

 // Direct render hooks for compact NPC portrait screens.
 const renderBase=window.render;
 window.render=function(html){
  const out=renderBase.call(this,html);
  wait(()=>{
   const sec=document.querySelector('.live-world-screen,.lpw-consequence-screen');
   if(!sec)return;
   sec.querySelectorAll('.live-npc-scene.large').forEach(scene=>{scene.classList.remove('large');scene.classList.add('lpw911-npc-portrait');const img=scene.querySelector('img');if(img)img.src=img.src.replace('/full.','/portrait.')});
   repairResultStars();fixShowBranding();
  });
  return out;
 };

 document.querySelectorAll('.build-tag,.live-cycle b').forEach(n=>n.textContent=`VERSION ${BUILD}`);
 window.TTG_APP_VERSION=BUILD;window.LPW_GAMEPLAY_BUILD=BUILD;
})();

/* =============================================================================
   LEGACY PRO WRESTLING 1.0 — CONSOLIDATED RUNTIME MODULE
   Removes legacy component fallbacks and routes every Career QA entry point to
   the approved 1.0 layouts.
   ============================================================================= */
(function(){
 const BUILD='1.0.2';
 const pick=a=>a[Math.floor(Math.random()*a.length)];
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const portrait=id=>typeof lpw836NpcVisual==='function'?lpw836NpcVisual(id,'portrait'):npcImage(id,'portrait');
 const getCareer=c=>{c.livingCareers=c.livingCareers||{};return c.livingCareers[c.active]||(c.livingCareers[c.active]={id:c.active,wins:0,losses:0,momentum:50,popularity:20,relationships:{},modifiers:{},opportunities:{},history:[]})};
 const rankOf=(c,id)=>{const rows=typeof lpw8Rankings==='function'?lpw8Rankings(c):(c.rankings||[]);const i=rows.findIndex(x=>x.id===id);return i<0?null:i+1};
 const rosterPool=c=>(typeof liveOtherPool==='function'?liveOtherPool(c):WRESTLERS).filter(w=>w&&w.id!==c.active);
 function later(fn){setTimeout(fn,25)}
 function logoNode(){const img=document.createElement('img');img.src='assets/branding/legacy-logo.webp';img.alt='LEGACY Pro Wrestling';return img}

 function finalDomCleanup(){
  document.querySelectorAll('.lpw84-dashboard-btn,.lpw84-home-dashboard,[onclick*="lpw84Dashboard"]')
   .forEach(n=>{if(/DASHBOARD/i.test(n.textContent||''))n.remove()});
  document.querySelectorAll('.build-tag,.live-cycle b').forEach(n=>n.textContent=`VERSION ${BUILD}`);
  document.querySelectorAll('.result-stars,.lpw913-stars').forEach(n=>{const t=n.textContent||'';if(/<i class=["']lpw913-star/.test(t))n.innerHTML=t});
  document.querySelectorAll('.live-match-card,.live-show-intro').forEach(root=>{
   root.querySelectorAll('img').forEach(i=>{if(/legacy-logo/i.test(i.src||''))i.remove()});
   root.querySelectorAll('.lpw913-legacy-mark,.lpw-brand-logo').forEach(n=>n.remove());
  });
  document.querySelectorAll('.live-npc-scene.large').forEach(scene=>{
   scene.classList.remove('large');scene.classList.add('lpw912-npc-portrait');
   const img=scene.querySelector('img');if(img)img.src=img.src.replace('/full.','/portrait.');
  });
 }

 function rebuildCareerHeader(){
  const screen=document.querySelector('.live-calendar-screen');
  const oldTop=screen?.querySelector('.live-calendar-top');
  if(!screen||!oldTop)return;
  oldTop.querySelectorAll('.lpw912-career-header').forEach(n=>n.remove());
  const buttons=[...oldTop.querySelectorAll('button')].filter(b=>/MAIN MENU|CAREER MENU/i.test(b.textContent||''));
  const row=document.createElement('div');row.className='lpw912-career-header';row.appendChild(logoNode());
  buttons.slice(0,2).forEach(b=>row.appendChild(b));
  oldTop.prepend(row);
  [...oldTop.children].forEach(ch=>{if(ch!==row&&ch.tagName==='IMG'&&/legacy-logo/i.test(ch.src||''))ch.remove()});
 }

 function fixRankingMovement(){
  const c=typeof liveLoad==='function'?liveLoad():null;
  const fresh=!!c&&Object.values(c.livingCareers||{}).every(x=>Number(x.wins||0)+Number(x.losses||0)===0);
  document.querySelectorAll('.lpw8-ranking-list article,.lpw919-rank-row,.lpw918-rank-row,.lpw-living-rank-row,.power-rankings article').forEach(row=>{
   const movement=[...row.querySelectorAll('i,em,small,span')].find(n=>/^[▲▼↑↓]\s*\d*$/.test((n.textContent||'').trim()));
   if(!movement)return;
   if(fresh){movement.remove();return}
   const name=[...row.querySelectorAll('b,span')].find(n=>{
    const t=(n.textContent||'').trim();return t.length>2&&!/^#?\d+$/.test(t)&&!/^(YOU|ACTIVE|WORLD CHAMPION)$/i.test(t)&&n!==movement&&!n.contains(movement)
   });
   if(name){movement.classList.add('lpw912-rank-movement');name.insertAdjacentElement('afterend',movement)}
  });
 }

 function postRender(){later(()=>{finalDomCleanup();rebuildCareerHeader();fixRankingMovement()})}
 const rawRender=window.render;
 window.render=function(html){const r=rawRender.call(this,html);postRender();return r};

 // Compact Katie interview is the only active Katie render path.
 window.gauntletLiveKatieInterview=function(){
  const c=liveLoad(),p=liveFounder(c.active),r=liveFeudOpponent(c),rk=rankOf(c,c.active),x=getCareer(c);
  const questions=[
   `${p.name}, your latest results have moved you to #${rk||'—'}. Do you demand tougher opposition, or keep letting the wins speak?`,
   `${r?`${r.name} keeps escalating this rivalry.`:'The rankings are beginning to tighten around you.'} What message do you want the locker room to hear?`,
   `You are ${x.wins||0}-${x.losses||0} this season. Is this about proving yourself, building your stable, or chasing the World Championship?`,
   `The audience is paying closer attention. How much responsibility comes with becoming one of LPW's most discussed wrestlers?`
  ];
  render(`<section class="panel live-world-screen lpw912-npc-screen"><div class="tv-kicker">BACKSTAGE INTERVIEW</div><header class="lpw912-npc-header">${portrait('katie-morgan')}<div><small>BACKSTAGE INTERVIEWER</small><h1>Katie Morgan</h1></div></header><blockquote>“${esc(pick(questions))}”</blockquote><div class="live-choice-grid lpw912-quote-choices"><button onclick="lpw91ApplyOutcome('katie-morgan','OPPORTUNITY REQUESTED',{popularity:4},'Your ambition becomes a major talking point.','Management may offer stronger opposition.')"><b>“Give me the toughest opponent available. I want every win to mean something.”</b><span>Call your shot · Popularity +4</span></button><button onclick="lpw91ApplyOutcome('katie-morgan','RESULTS SPEAK',{momentum:4},'The measured answer earns respect backstage.','Your next performance carries added significance.')"><b>“I do not need to make promises. The results will keep speaking for me.”</b><span>Stay focused · Momentum +4</span></button><button onclick="lpw91ApplyOutcome('katie-morgan','RIVAL WARNED',{momentum:3,feud:6},'Your rival receives a direct warning through the broadcast.','The next confrontation may arrive sooner.')"><b>“${r?`${r.name} knows where to find me. The next move is theirs.`:'Anyone who wants my place can step forward.'}”</b><span>Escalate · Momentum +3 · Feud +6</span></button></div></section>`)
 };

 function socialPosts(c,p,r){
  const others=rosterPool(c),o1=pick(others)||p,o2=pick(others.filter(w=>w.id!==o1.id))||p,rk=rankOf(c,c.active),last=c.world?.lastResult;
  const pools=[
   {avatar:'ava-cross',name:'Ava Cross',handle:'@AvaCrossLPW',official:true,text:pick([`${p.name} is ranked #${rk||'—'}. Who should be the next test?`,`Clips from the latest broadcast are moving fast. What moment deserves another look?`,`The LPW audience has been debating the rankings all morning. Keep the replies coming.`])},
   {name:'LPW Official',handle:'@LPWOfficial',official:true,text:pick([`The next televised card is taking shape.`, `House-show results have been added to the official records.`, `${o1.name} is among the most active wrestlers this week.`])},
   {avatar:r?.id||o1.id,name:r?.name||o1.name,handle:'@'+(r?.name||o1.name).replace(/[^A-Za-z0-9]/g,''),text:pick([`One result does not change the hierarchy.`,`The rankings can wait. The next bell tells the truth.`,`I do not need every headline. I need the next win.`])},
   {avatar:o2.id,name:o2.name,handle:'@'+o2.name.replace(/[^A-Za-z0-9]/g,''),text:pick([`Everybody is watching the same few names. That will change.`,`The middle of the rankings is where the real fight is happening.`,`A quiet week can become a career-changing week with one result.`])},
   {name:'LPW Fans',handle:'@LPWFans',text:pick([`Which wrestler deserves more television time?`,`The title picture feels one result away from changing.`,`Who had the strongest performance of the week?`])}
  ];
  if(last?.win)pools.push({avatar:'johnny-cannon',name:'Johnny Cannon',handle:'@CannonCalls',text:`A win creates momentum. The next opponent decides whether it becomes a run.`});
  return pools.sort(()=>Math.random()-.5).slice(0,3)
 }
 window.lpw912AvaPulse=function(){
  const c=liveLoad(),p=liveFounder(c.active),r=liveFeudOpponent(c),posts=socialPosts(c,p,r);
  render(`<section class="panel live-world-screen lpw912-social"><header>${portrait('ava-cross')}<h1>AVA'S PULSE</h1><span>LPW SOCIAL FEED · TRENDING NOW</span></header><div class="lpw912-feed">${posts.map((z,i)=>`<article class="${z.official?'official':''}"><div class="lpw912-post-head">${z.avatar?portrait(z.avatar):'<span class="lpw912-avatar">LPW</span>'}<p><b>${esc(z.name)}${z.official?' ✓':''}</b><small>${esc(z.handle)} · ${8+i*14}m</small></p></div><p>${esc(z.text)}</p><small>♡ ${(1.4+i*.7).toFixed(1)}K   ↻ ${180+i*137}   💬 ${84+i*91}</small></article>`).join('')}</div><h2>CHOOSE YOUR RESPONSE</h2><div class="live-choice-grid lpw912-post-choices"><button onclick="lpw837SocialChoice('YOUR POST GOES VIRAL',{popularity:4,momentum:2,feud:5},'A confident post spreads across the LPW audience.')"><b>“${r?`${r.name} can keep talking. I’ll keep winning.`:'The whole roster can watch what happens next.'}”</b><span>Bold · Popularity +4 · Momentum +2${r?' · Feud +5':''}</span></button><button onclick="lpw837SocialChoice('FANS RESPECT THE FOCUS',{popularity:3,momentum:4},'A measured response earns respect without losing focus.')"><b>“Respect to everyone in LPW. My focus is the next match.”</b><span>Professional · Popularity +3 · Momentum +4</span></button></div></section>`)
 };
 window.lpw837AvaPulse=window.lpw912AvaPulse;window.lpw836AvaPulse=window.lpw912AvaPulse;window.gauntletLiveAvaEvent=window.lpw912AvaPulse;

 window.lpw912DirtSheet=function(supercard=false){
  const c=liveLoad(),p=liveFounder(c.active),r=liveFeudOpponent(c),pool=rosterPool(c),rise=pick(pool)||p,fall=pick(pool.filter(w=>w.id!==rise.id))||r||p,last=c.world?.lastResult,rating=Number(last?.rating||3.5),week=typeof liveMonthWeek==='function'?liveMonthWeek(c):c.week;
  const stories=[
   ['LEAD STORY',last?(last.win?`${p.name} forces a rankings rethink`:`Questions follow ${p.name}'s latest result`):pick(['The rankings race begins again','Backstage attention turns to the new month','A crowded field prepares for the next broadcast']),last?.win?`${p.name}'s latest victory has changed how the locker room views the current pecking order.`:'Derek Pierce examines the most consequential story developing across LPW.'],
   ['MATCH OF THE WEEK',last?`${p.name} vs ${liveFounder(last.opponent)?.name||'Opponent'}`:`${rise.name} vs ${fall.name}`,`${rating.toFixed(1)} stars · The match still generating debate.`],
   ['SUPERSTAR OF THE WEEK',rise.name,pick(['A sharp performance has changed the conversation.','Backstage confidence is rising quickly.','The strongest week on the live-event circuit belongs here.'])],
   ['STOCK FALLING',fall.name,pick(['The next appearance now carries added pressure.','One more setback could reshape the ranking outlook.','A difficult result has raised uncomfortable questions.'])],
   ['CONTRACT GOSSIP',pick(pool)?.name||p.name,pick(['Talent Relations is believed to be discussing future opportunities.','Officials may be considering a higher-profile programme.','Sources claim management has taken notice of recent consistency.'])],
   ['RUMOUR OF THE WEEK','SOURCES SAY...',r?pick([`Officials are considering a stipulation for ${p.name} and ${r.name}.`,`${r.name} may demand another confrontation before the SuperCard.`,`Management is discussing how far the ${p.name}-${r.name} rivalry should escalate.`]):'A major announcement may be closer than officials are admitting.']
  ];
  render(`<section class="panel live-world-screen lpw912-dirt"><header>${portrait('derek-pierce')}<h1>${supercard?'INSTANT REACTION':'DIRT SHEET DIGEST'}</h1><span>SEASON ${Math.floor((Number(c.month||1)-1)/12)+1} · WEEK ${week} · DEREK PIERCE</span></header><button class="btn live-primary lpw912-centered" onclick="lpw836CompleteMedia()">CONTINUE TO NEXT DAY</button><div class="lpw912-publication">${stories.map((s,i)=>`<article class="${i===0?'lead':''}"><small>${s[0]}</small><h2>${esc(s[1])}</h2><p>${esc(s[2])}</p><em>By Derek Pierce · ${4+i*11}m ago</em></article>`).join('')}</div><p class="lpw-disclaimer">Rumours are based on anonymous sources and backstage speculation. LPW has not verified these claims.</p><button class="btn live-primary lpw912-centered" onclick="lpw836CompleteMedia()">CONTINUE</button></section>`)
 };
 window.lpw837DirtSheet=window.lpw912DirtSheet;window.lpw836DirtSheet=window.lpw912DirtSheet;
 window.lpw836MediaDay=function(){const c=liveLoad(),w=typeof lpw836Week==='function'?lpw836Week(c):c.week;if(w===1||w===3)return window.lpw912AvaPulse();return window.lpw912DirtSheet(w===4)};

 // Remove all obsolete dashboard/version mutations after every hub render.
 const oldCalendar=window.gauntletLiveCalendar;
 window.gauntletLiveCalendar=function(){const c=liveLoad();if(c){const x=getCareer(c);c.momentum=Number(x.momentum??50);c.popularity=Number(x.popularity??20);liveSave(c)}const r=oldCalendar.apply(this,arguments);postRender();return r};
 const oldHome=window.gauntletLiveHome;
 if(typeof oldHome==='function')window.gauntletLiveHome=function(){const r=oldHome.apply(this,arguments);later(finalDomCleanup);return r};

 window.TTG_APP_VERSION=BUILD;window.LPW_GAMEPLAY_BUILD=BUILD;
 later(finalDomCleanup);
})();

/* ================================================================
   LEGACY Pro Wrestling 1.0 — Consolidated Runtime Module
   ================================================================ */
(()=>{
 'use strict';
 const BUILD='1.0.2';
 const later=(fn,ms=0)=>setTimeout(fn,ms);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const pick=a=>a?.length?a[Math.floor(Math.random()*a.length)]:'';
 const unique=a=>[...new Set(a.filter(Boolean))];
 const founder=id=>typeof liveFounder==='function'?liveFounder(id):null;
 const rankings=c=>typeof lpw8Rankings==='function'?lpw8Rankings(c):(c.rankings||[]);
 const activeCareer=c=>c?.livingCareers?.[c.active]||{};
 const isFreshCareer=c=>{
  if(!c)return false;
  const all=Object.values(c.livingCareers||{});
  const noCareerResults=all.every(x=>Number(x?.wins||0)+Number(x?.losses||0)===0);
  const noRankingResults=rankings(c).every(x=>Number(x?.wins||0)+Number(x?.losses||0)===0);
  const noWorldResults=!c.world?.lastResult&&!c.world?.latestHouseShow;
  return noCareerResults&&noRankingResults&&noWorldResults;
 };
 function ensureFeedState(c){
  c.world=c.world||{};
  c.world.hubFeedState=c.world.hubFeedState||{};
  const s=c.world.hubFeedState;
  if(!s.saveSeed){
   try{s.saveSeed=(crypto.getRandomValues(new Uint32Array(1))[0]>>>0).toString(36)}catch(e){s.saveSeed=(Date.now()+Math.random()).toString(36)}
  }
  s.history=s.history||{headlines:[],social:[],dirt:[]};
  return s;
 }
 function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
 function rng(seed){let x=seed>>>0;return()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
 function chooseWithCooldown(pool,count,history,seed){
  const r=rng(hash(seed));
  let candidates=unique(pool).filter(x=>!history.slice(-12).includes(x));
  if(candidates.length<count)candidates=unique(pool).filter(x=>!history.slice(-5).includes(x));
  if(candidates.length<count)candidates=unique(pool);
  const out=[];
  while(candidates.length&&out.length<count){const i=Math.floor(r()*candidates.length);out.push(candidates.splice(i,1)[0])}
  history.push(...out);if(history.length>48)history.splice(0,history.length-48);
  return out;
 }
 function rosterPool(c){
  return rankings(c).map(x=>founder(x.id)).filter(Boolean);
 }
 function rankOf(c,id){const i=rankings(c).findIndex(x=>x.id===id);return i<0?null:i+1}
 function latestHouse(c){
  const h=c.world?.latestHouseShow?.matches?.[0];if(!h)return null;
  const w=founder(h.winner),l=founder(h.loser);return w&&l?{...h,w,l}:null;
 }
 function feedPools(c){
  const p=founder(c.active),r=typeof liveFeudOpponent==='function'?liveFeudOpponent(c):null,champ=founder(c.championships?.world);
  const rows=rankings(c),idx=rows.findIndex(x=>x.id===c.active),rank=idx+1;
  const above=idx>0?founder(rows[idx-1].id):null,below=idx>=0&&idx<rows.length-1?founder(rows[idx+1].id):null;
  const others=rosterPool(c).filter(w=>![p?.id,r?.id,champ?.id].includes(w.id));
  const a=others[0]||p,b=others[1]||p,d=others[2]||p,e=others[3]||p,f=others[4]||p,house=latestHouse(c);
  const result=c.world?.lastResult;
  const headlines=unique([
   champ&&`${champ.name} begins the day carrying the pressure that follows every reigning World Champion.`,
   champ&&`Contenders across LPW are measuring their progress against ${champ.name}'s championship standard.`,
   p&&`${p.name} enters the new cycle ranked #${rank||'—'}, with every televised result capable of changing the picture.`,
   above&&`${above.name} currently holds the position directly above ${p.name}, but the margin remains within reach.`,
   below&&`${below.name} is close enough to challenge ${p.name}'s current place in the rankings.`,
   r&&`${r.name} has sharpened the tone of the rivalry before the next confrontation.`,
   r&&`The tension between ${p.name} and ${r.name} is beginning to influence the wider card.`,
   a&&`${a.name} is drawing stronger internal reviews after a productive run away from television.`,
   b&&`${b.name} has asked for opposition capable of proving whether the recent momentum is real.`,
   d&&`${d.name} is quietly becoming one of the promotion's most active competitors.`,
   e&&`${e.name} is being discussed as a possible breakout name for the coming weeks.`,
   f&&`Officials are studying ${f.name}'s recent form before finalising another televised opportunity.`,
   house&&`${house.w.name} defeated ${house.l.name} at the latest house show${house.upset?', producing an upset that reached the locker room quickly':''}.`,
   house&&`${house.w.name}'s live-event victory has created fresh pressure for a television booking.`,
   result&&result.win&&`${p.name}'s latest victory has forced the rankings committee to reconsider the middle of the table.`,
   result&&!result.win&&`The response to ${p.name}'s latest defeat is now one of the week's central questions.`,
   `Management is reviewing recent results before locking in the next televised card.`,
   `Several wrestlers outside the spotlight improved their records on the live-event circuit.`,
   `The middle of the Power Rankings is becoming the most unstable part of LPW.`,
   `A strong week at house shows has made upcoming television selections harder for management.`,
   `The locker room is paying closer attention to strength of opposition as records begin to separate.`,
   `One unexpected result has changed how producers are discussing the next round of matches.`,
   `The road to the next SuperCard is already producing new alliances and new pressure.`,
   `LPW officials are balancing established names against wrestlers demanding a larger opportunity.`,
   `A cluster of contenders has emerged within only a few ranking points of one another.`,
   `The next televised result could alter several matchups currently under discussion.`
  ]);
  const social=unique([
   `@AvaCross: House shows matter. Every win counts, even when the cameras are not there.`,
   `@AvaCross: New results are official, the rankings are moving, and the next card already feels different.`,
   `@AvaCross: Which wrestler deserves more television time this week? The replies are open.`,
   `@AvaCross: Match announcements, backstage clips and rankings updates are coming throughout the day.`,
   `@AvaCross: One result can change an entire month. That is not hype—it is the standings.`,
   `@AvaCross: The road to the next SuperCard continues whether the cameras are rolling or not.`,
   `@AvaCross: Fan poll—who has earned the next main-event opportunity?`,
   `@AvaCross: The audience is debating the rankings again. Keep the arguments respectful. Mostly.`,
   `@AvaCross: There are more stories in LPW today than any one rivalry can contain.`,
   `@AvaCross: The latest live-event report is in. A few wrestlers just made management's job harder.`,
   `@AvaCross: Today’s question—momentum, rankings or championships: which matters most right now?`,
   `@AvaCross: Some of the loudest reactions this week came from matches that never aired.`,
   `@LPWOfficial: Results from across the roster have been added to the official records.`,
   `@LPWOfficial: The next televised card is taking shape.`,
   `@LPWOfficial: Updated rankings will follow the completion of the current results cycle.`,
   `@LPWFans: The championship picture feels one result away from changing.`,
   `@LPWFans: Who had the strongest performance of the week?`,
   `@LPWFans: The middle of the rankings is absolute chaos right now.`,
   `@RingsideReport: Recent activity and strength of opposition are becoming impossible to ignore.`,
   `@BackstageWire: Several wrestlers are asking for tougher opponents after recent wins.`,
   a&&`@${a.name.replace(/[^A-Za-z0-9]/g,'')}: “I do not need every headline. I need the next win.”`,
   b&&`@${b.name.replace(/[^A-Za-z0-9]/g,'')}: “Check the record after the next bell.”`,
   d&&`@${d.name.replace(/[^A-Za-z0-9]/g,'')}: “The spotlight eventually finds the person who keeps winning.”`,
   e&&`@${e.name.replace(/[^A-Za-z0-9]/g,'')}: “Everybody keeps talking about opportunity. I am preparing for it.”`,
   r&&`@${r.name.replace(/[^A-Za-z0-9]/g,'')}: “One result does not settle this.”`,
   house&&`@LPWFans: ${house.w.name}'s house-show victory deserves a televised follow-up.`,
   p&&`@CannonCalls: ${p.name}'s next result will tell us whether the current attention becomes a real run.`
  ]);
  const dirt=unique([
   `The rankings committee is placing more weight on recent activity and strength of opposition.`,
   b&&d&&`There has been internal discussion about pairing ${b.name} with ${d.name} in a fresh programme.`,
   a&&`${a.name} is believed to be lobbying for a televised match after increased live-event activity.`,
   e&&`Sources say ${e.name} has impressed producers with consistency away from the main broadcasts.`,
   f&&`Talent Relations is reportedly discussing a higher-profile opportunity for ${f.name}.`,
   r&&`Officials are considering how far the rivalry involving ${p.name} and ${r.name} should escalate.`,
   r&&`A stipulation may be discussed if ${p.name} and ${r.name} continue to raise the intensity.`,
   house&&`Officials were reportedly impressed by ${house.w.name}'s victory over ${house.l.name} at the latest house show.`,
   house&&`${house.l.name} may receive another booking quickly after the latest live-event result raised questions.`,
   champ&&`Management is believed to be protecting ${champ.name}'s next championship programme from premature exposure.`,
   `Producers are said to be using house-show performance to influence upcoming television bookings.`,
   `A wrestler currently outside the top ten is reportedly receiving strong backstage reviews.`,
   `One planned match may be changed after an unexpected result away from television.`,
   `Several names with fewer appearances have been prioritised for upcoming live events.`,
   `Officials are debating whether ranking position or current form should carry more booking weight.`,
   `A possible surprise opponent has been discussed for an upcoming televised match.`,
   `Management is reportedly monitoring one rivalry for signs that it can carry a SuperCard.`,
   `Sources claim a recent social-media reaction has influenced how one segment will be presented.`,
   `There is internal pressure to feature more wrestlers from the lower half of the rankings.`,
   `A veteran name is believed to be advising a younger wrestler behind the scenes.`,
   `Producers may reward a strong house-show run with a televised match before the month ends.`,
   `One wrestler has reportedly rejected an easy opponent in favour of a more dangerous test.`,
   `The next rankings update may create a matchup that was not part of the original monthly plan.`,
   `Backstage discussion has shifted toward who can sustain momentum rather than create one viral moment.`,
   `A future contract conversation may depend on consistency over the next several appearances.`
  ]);
  return {headlines,social,dirt,champ,rows,idx};
 }
 function movementFor(c,id){
  if(isFreshCareer(c))return 0;
  const m=Number(c.world?.rankingMovement?.[id]||0);
  return Number.isFinite(m)?m:0;
 }
 function renderHubFeed(){
  const host=document.querySelector('.lpw908-living-world,.lpw909-living-world,.lpw-future-hub');
  const c=typeof liveLoad==='function'?liveLoad():null;if(!host||!c)return;
  const state=ensureFeedState(c),pools=feedPools(c);
  const cycle=`${state.saveSeed}|${c.month||1}|${c.week||1}|${c.day||1}|${activeCareer(c).wins||0}|${activeCareer(c).losses||0}`;
  const headlines=chooseWithCooldown(pools.headlines,2,state.history.headlines,cycle+'|h');
  const social=chooseWithCooldown(pools.social,2,state.history.social,cycle+'|s');
  const dirt=chooseWithCooldown(pools.dirt,2,state.history.dirt,cycle+'|d');
  const idx=Math.max(0,pools.idx),from=Math.max(0,Math.min(idx-2,Math.max(0,pools.rows.length-5)));
  const rankRows=pools.rows.slice(from,from+5).map((row,i)=>{
   const w=founder(row.id),move=movementFor(c,row.id),mark=move>0?`<i class="lpw913-rank-movement up">▲${move>1?move:''}</i>`:move<0?`<i class="lpw913-rank-movement down">▼${move<-1?Math.abs(move):''}</i>`:'';
   return `<div class="lpw908-rank-row ${row.id===c.active?'is-player':''}"><strong>#${from+i+1}</strong><span>${esc(w?.name||'Unknown')}${mark}</span>${row.id===c.active?'<em>YOU</em>':''}</div>`
  }).join('');
  host.className='lpw908-living-world lpw909-living-world lpw913-living-world';
  host.innerHTML=`<div class="lpw908-feed-heading"><small>LPW LIVING WORLD</small><h2>AROUND THE LIVING WORLD</h2><p>Updated every in-game day as results, stories and rankings evolve.</p></div>
  <section class="lpw908-feed-section"><div class="lpw908-section-title"><h3>LATEST HEADLINES</h3><button onclick="lpw909OpenNews()">VIEW NEWS</button></div>${headlines.map((x,i)=>`<article><small>${i?'AROUND LPW':'TOP STORY'}</small><p>${esc(x)}</p></article>`).join('')}</section>
  <section class="lpw908-feed-section lpw908-rankings"><div class="lpw908-section-title"><h3>POWER RANKINGS</h3><button onclick="lpw909OpenRankings()">FULL RANKINGS</button></div><div class="lpw908-champion"><small>WORLD CHAMPION</small><b>${esc(pools.champ?.name||'VACANT')}</b></div>${rankRows}</section>
  <section class="lpw908-feed-section"><div class="lpw908-section-title"><h3>SOCIAL PULSE</h3></div>${social.map(x=>`<article class="lpw908-social"><p>${esc(x)}</p></article>`).join('')}</section>
  <section class="lpw908-feed-section"><div class="lpw908-section-title"><h3>DIRT SHEET DIGEST</h3><button onclick="lpw909OpenArchive()">MEDIA ARCHIVE</button></div>${dirt.map(x=>`<article><small>SOURCES SAY…</small><p>${esc(x)}</p></article>`).join('')}</section>`;
  try{liveSave(c)}catch(e){}
 }
 function cleanRankingMarkers(){
  const c=typeof liveLoad==='function'?liveLoad():null;if(!c)return;
  const fresh=isFreshCareer(c);
  document.querySelectorAll('.lpw908-rank-row,.lpw8-ranking-list article,.power-rankings article,.lpw919-rank-row').forEach(row=>{
   const rank=row.querySelector('strong');
   const name=[...row.querySelectorAll('span,b')].find(n=>n!==rank&&!/^(YOU|ACTIVE|WORLD CHAMPION)$/i.test((n.textContent||'').trim())&&!/^#?\d+$/.test((n.textContent||'').trim()));
   const markers=[...row.querySelectorAll('i,em,small,span')].filter(n=>/^[▲▼↑↓]\s*\d*$/.test((n.textContent||'').trim()));
   markers.forEach(m=>{if(fresh)m.remove();else if(name&&!name.contains(m)){m.classList.add('lpw913-rank-movement');name.appendChild(m)}});
  });
 }
 const oldCalendar=window.gauntletLiveCalendar;
 window.gauntletLiveCalendar=function(){const r=oldCalendar.apply(this,arguments);later(()=>{renderHubFeed();cleanRankingMarkers()},30);return r};
 const oldRender=window.render;
 window.render=function(html){const r=oldRender.call(this,html);later(cleanRankingMarkers,30);return r};
 window.LPW913_renderHubFeed=renderHubFeed;
 window.TTG_APP_VERSION=BUILD;window.LPW_GAMEPLAY_BUILD=BUILD;
 later(()=>{renderHubFeed();cleanRankingMarkers()},80);
})();

/* =============================================================================
   LEGACY PRO WRESTLING 1.0 — CONSOLIDATED RUNTIME MODULE
   Rebuilds the actual .live-calendar-top element and clears all inherited
   header classes from earlier patches so the navigation cannot collapse.
   ============================================================================= */
(function(){
  const previousRender=window.render;
  function repairCareerHubHeader(){
    const screen=document.querySelector('.live-calendar-screen');
    const top=screen&&screen.querySelector('.live-calendar-top');
    if(!top)return;

    // Earlier 1.0.x patches added grid classes directly to this element. They
    // must be removed or they constrain the replacement header to one grid cell.
    [...top.classList].forEach(cls=>{if(/^lpw91\d*-career-header$/.test(cls)||cls==='lpw91-career-header')top.classList.remove(cls)});
    top.classList.add('lpw915-career-header');
    top.removeAttribute('style');
    top.innerHTML=`
      <img class="lpw915-career-logo" src="assets/branding/lpw-logo-compact-400.webp" alt="LEGACY Pro Wrestling">
      <button type="button" class="shell-back lpw915-career-nav" onclick="home()">← MAIN MENU</button>
      <button type="button" class="shell-back lpw915-career-nav" onclick="gauntletLiveHome()">CAREER MENU</button>`;
  }
  window.LPW915_repairCareerHubHeader=repairCareerHubHeader;
  window.render=function(html){
    const result=previousRender.call(this,html);
    setTimeout(repairCareerHubHeader,0);
    setTimeout(repairCareerHubHeader,60);
    return result;
  };
  const previousCalendar=window.gauntletLiveCalendar;
  if(typeof previousCalendar==='function')window.gauntletLiveCalendar=function(){
    const result=previousCalendar.apply(this,arguments);
    setTimeout(repairCareerHubHeader,0);
    setTimeout(repairCareerHubHeader,80);
    return result;
  };
})();

/* =============================================================================
   LEGACY PRO WRESTLING 1.0 — CONSOLIDATED RUNTIME MODULE
   ============================================================================= */
(function(){
 const BUILD='1.0.2';

 function repairCareerHeader916(){
  const top=document.querySelector('.live-calendar-screen .live-calendar-top');
  if(!top)return;
  [...top.classList].forEach(cls=>{if(/^lpw91\d*-career-header$/.test(cls)||cls==='lpw91-career-header')top.classList.remove(cls)});
  top.classList.add('lpw916-career-header');
  top.removeAttribute('style');
  top.innerHTML=`
   <img class="lpw916-career-logo" src="assets/branding/lpw-logo-compact-400.webp" alt="LEGACY Pro Wrestling">
   <div class="lpw916-career-actions">
    <button type="button" class="lpw916-career-nav" onclick="home()">← MAIN MENU</button>
    <button type="button" class="lpw916-career-nav" onclick="gauntletLiveHome()">CAREER MENU</button>
   </div>`;
 }

 function repairPlayerPreviewArt916(){
  const card=document.querySelector('.live-match-card');
  const c=typeof liveLoad==='function'?liveLoad():null;
  if(!card||!c)return;
  const first=card.querySelector('.live-match-lineup > div');
  const wrestler=typeof liveFounder==='function'?liveFounder(c.active):null;
  if(!first||!wrestler)return;
  const current=first.querySelector('img.wrestler-art, img');
  const replacement=imageWithFallback(wrestler,'portrait','art-portrait lpw916-player-preview-art','matchPortrait');
  if(current)current.outerHTML=replacement;
  else first.insertAdjacentHTML('afterbegin',replacement);
  const img=first.querySelector('img.lpw916-player-preview-art');
  if(img){img.style.display='block';img.removeAttribute('hidden');}
  first.classList.remove('missing-art');
 }

 function markShowBumper916(){
  document.querySelectorAll('body > .lpw904-show-bumper,.lpw904-show-bumper').forEach(node=>node.classList.add('lpw916-show-bumper'));
 }

 const previousRender=window.render;
 window.render=function(html){
  const result=previousRender.call(this,html);
  setTimeout(()=>{repairCareerHeader916();repairPlayerPreviewArt916();markShowBumper916()},0);
  setTimeout(()=>{repairCareerHeader916();repairPlayerPreviewArt916();markShowBumper916()},80);
  return result;
 };

 const previousCalendar=window.gauntletLiveCalendar;
 if(typeof previousCalendar==='function')window.gauntletLiveCalendar=function(){
  const result=previousCalendar.apply(this,arguments);
  setTimeout(repairCareerHeader916,0);setTimeout(repairCareerHeader916,80);
  return result;
 };

 const previousMatchCard=window.gauntletLiveMatchCard65;
 if(typeof previousMatchCard==='function')window.gauntletLiveMatchCard65=function(){
  const result=previousMatchCard.apply(this,arguments);
  setTimeout(repairPlayerPreviewArt916,0);setTimeout(repairPlayerPreviewArt916,100);
  return result;
 };

 window.LPW916_repairCareerHeader=repairCareerHeader916;
 window.LPW916_repairPlayerPreviewArt=repairPlayerPreviewArt916;
 window.TTG_APP_VERSION=BUILD;window.LPW_GAMEPLAY_BUILD=BUILD;
 document.querySelectorAll('.build-tag,.live-cycle b').forEach(node=>node.textContent=`VERSION ${BUILD}`);
})();

/* =============================================================================
   LEGACY PRO WRESTLING 1.0 — CONSOLIDATED RUNTIME MODULE
   Uses a requestAnimationFrame transform written as an inline !important value,
   so older transition CSS and reduced-motion overrides cannot suppress scaling.
   ============================================================================= */
(function(){
 const BUILD='1.0.2';
 const previousRun=window.gauntletLiveRunShowSegment;
 const DURATION=1550;

 function easeOutCubic(t){return 1-Math.pow(1-t,3)}

 if(typeof previousRun==='function'){
  window.gauntletLiveRunShowSegment=function(){
   const intro=document.querySelector('.live-show-intro,.lpw-show-open');
   if(!intro)return previousRun.apply(this,arguments);
   const approved=intro.querySelector('.lpw-show-logo,.lpw-ple-title,.lpw904-supercard-title');
   if(!approved)return previousRun.apply(this,arguments);

   const buildLogo=typeof window.lpw919BuildExactTransitionLogo==='function'
    ? window.lpw919BuildExactTransitionLogo
    : source=>source.cloneNode(true);

   const overlay=document.createElement('section');
   overlay.className='lpw9111-show-bumper';
   overlay.setAttribute('aria-hidden','true');

   const stage=document.createElement('div');
   stage.className='lpw9111-transition-stage';
   stage.appendChild(buildLogo(approved));
   overlay.appendChild(stage);
   document.body.appendChild(overlay);

   // Remove the intro before invoking older code later; this makes every older
   // transition wrapper fall straight through to the broadcast renderer.
   intro.remove();
   const args=arguments,self=this,start=performance.now();

   function frame(now){
    const raw=Math.min(1,(now-start)/DURATION);
    const eased=easeOutCubic(raw);
    const scale=1+(4.6-1)*eased;
    const fadeStart=.72;
    const opacity=raw<fadeStart?1:Math.max(0,1-(raw-fadeStart)/(1-fadeStart));
    stage.style.setProperty('transform',`translate3d(0,0,0) scale(${scale})`,'important');
    stage.style.setProperty('opacity',String(opacity),'important');
    if(raw<1){requestAnimationFrame(frame);return;}
    overlay.remove();
    previousRun.apply(self,args);
   }

   // Paint one stable frame at the exact intro size before zooming.
   stage.style.setProperty('transform','translate3d(0,0,0) scale(1)','important');
   stage.style.setProperty('opacity','1','important');
   requestAnimationFrame(frame);
  };
 }

 window.TTG_APP_VERSION=BUILD;
 window.LPW_GAMEPLAY_BUILD=BUILD;
 document.querySelectorAll('.build-tag,.live-cycle b').forEach(n=>n.textContent=`VERSION ${BUILD}`);
})();
/* Cold-boot parity: initial menu must use the same enhanced renderer as return navigation. */
(function(){
 const VERSION='1.0.2';
 function refreshHomeEnhancements(){
  try{
   document.querySelectorAll('#battleRoyalMenuButton,#specialtyMatchesMenuButton').forEach(node=>node.remove());
   document.querySelectorAll('.hub-menu button').forEach(button=>{
    const label=(button.textContent||'').toUpperCase();
    if(label.includes('TAG TEAM GAUNTLET')||label.includes('20-PERSON BATTLE ROYAL')||label.includes('SPECIALTY MATCHES'))button.remove();
   });
   document.querySelectorAll('.build-tag,.live-cycle b').forEach(n=>n.textContent=`VERSION ${VERSION}`);
  }catch(e){console.error('1.0 home enhancement',e)}
 }
 const baseHome=window.home;
 if(typeof baseHome==='function')window.home=function(){const r=baseHome.apply(this,arguments);setTimeout(refreshHomeEnhancements,0);return r};
 window.addEventListener('load',()=>setTimeout(()=>{if(document.querySelector('.game-hub'))refreshHomeEnhancements()},80));
 window.LPW_CONSOLIDATED_RUNTIME_VERSION=VERSION;
})();

/* =============================================================================
   LEGACY PRO WRESTLING 1.0 — COMMENTARY DESK CONSOLIDATION
   Presents Mike Sullivan and Johnny Cannon together at one broadcast desk with
   their dialogue flowing beneath as a single television introduction.
   ============================================================================= */
(function(){
 const BUILD='1.0.2';
 window.gauntletLiveShowIntro=function(){
  const c=liveLoad(),item=livePlanItem(c),firstShow=c.week===1&&c.day===0&&!c.world.lastResult,
   venue=one(VENUES),attendance=Math.floor(rnd(11000,20500)).toLocaleString(),
   show=liveIsSupercard(c)?liveCurrentSupercard(c).toUpperCase():liveShowName(c),
   p=liveFounder(c.active),r=liveFeudOpponent(c);
  let stories=[];if(!firstShow)stories=liveSimulateWorld(c);liveSave(c);
  const card=firstShow
   ?`<li>${p.name} makes an LPW debut tonight.</li><li>${r?`${r.name} is expected to make a presence felt tonight.`:'The LEGACY World Championship picture begins to take shape.'}</li>`
   :stories.slice(0,3).map(s=>`<li>${String(s?.text||'').replace(/<[^>]*>/g,'').trim()}</li>`).join('');
  const mike=firstShow
   ?`Welcome to Monday Night Mayhem, LPW's flagship show—where rivalries begin and reputations are made.`
   :`${p.name} enters tonight with a ${c.wins}-${c.losses} record, and every result now carries more weight.`;
  const johnny=firstShow
   ?`Everybody on this roster has something to prove, and somebody is going to make an unforgettable first impression.`
   :r?`${r.name} is watching closely. One bad decision could change the entire rivalry.`
   :'The pressure is rising, and nobody can afford to stand still.';
  render(`<section class="panel live-show-intro lpw-show-open lpw837-show-open-b2 lpw921-show-open"><div class="show-intro-copy">${liveIsSupercard(c)?`<div class="lpw-ple-title">${show}</div>`:lpwShowLogo(show)}<button class="btn live-primary lpw837-start-first" onclick="gauntletLiveRunShowSegment()">START THE SHOW</button><div class="tv-kicker">LIVE FROM ${venue.toUpperCase()} · ${attendance} IN ATTENDANCE</div><section class="lpw921-commentary-desk" aria-label="LPW commentary desk"><div class="lpw921-commentators"><div class="lpw921-commentator">${npcImage('mike-sullivan','portrait')}<b>Mike Sullivan</b></div><div class="lpw921-commentator">${npcImage('johnny-cannon','portrait')}<b>Johnny Cannon</b></div></div><div class="lpw921-commentary-copy"><p><strong>Mike Sullivan</strong><span>${mike}</span></p><p><strong>Johnny Cannon</strong><span>${johnny}</span></p></div></section><div class="show-card-list"><small>TONIGHT ON LPW</small><ul>${card}</ul><b>YOUR SEGMENT · ${liveIsSupercard(c)?'FEUD FINALE':item.type==='segment'?liveSegmentTitle(item.segment):item.type.toUpperCase()+' MATCH'}</b></div></div></section>`);
 };
 window.TTG_APP_VERSION=BUILD;
 window.LPW_GAMEPLAY_BUILD=BUILD;
 document.querySelectorAll('.build-tag,.live-cycle b').forEach(n=>n.textContent=`VERSION ${BUILD}`);
})();

/* =============================================================================
   LEGACY PRO WRESTLING 1.0 — CANONICAL CAREER BEGIN CONTROL
   One route for click, touch and keyboard activation. The normal Career day
   engine remains responsible for preparing and opening every show.
   ============================================================================= */
(function(){
 const BUILD='1.0.2';
 const SELECTOR='.live-today .live-primary';

 function ensureShowPlan(c){
  if(!c||!(Number(c.day)===0||Number(c.day)===3||liveIsSupercard(c)))return;
  c.world=c.world||{};
  if(!Array.isArray(c.world.monthPlan)||!c.world.monthPlan.length){
   if(typeof liveGenerateMonthlyPlan==='function')liveGenerateMonthlyPlan(c);
  }
  if(!Array.isArray(c.world.monthPlan))c.world.monthPlan=[];
  if(!liveIsSupercard(c)&&typeof liveMonthSlot==='function'){
   const slot=liveMonthSlot(c);
   if(!c.world.monthPlan[slot]){
    const rival=typeof liveFeudOpponent==='function'?liveFeudOpponent(c):null;
    const fallback=rival||(typeof livePickDifferent==='function'?livePickDifferent(c,[c.active]):null);
    c.world.monthPlan[slot]=fallback
     ?{type:'singles',week:Number(c.week)||1,day:Number(c.day)||0,opponents:[fallback.id]}
     :{type:'segment',week:Number(c.week)||1,day:Number(c.day)||0,segment:'promo'};
   }
  }
  if(typeof liveSave==='function')liveSave(c);
 }

 window.legacyCareerBegin=function(event){
  if(event){event.preventDefault();event.stopPropagation();}
  if(window.__legacyCareerBeginBusy)return false;
  window.__legacyCareerBeginBusy=true;
  try{
   const c=typeof liveLoad==='function'?liveLoad():null;
   if(!c){if(typeof gauntletLiveHome==='function')gauntletLiveHome();return false;}
   ensureShowPlan(c);
   if(typeof gauntletLiveBeginDay!=='function')throw new Error('Career day engine unavailable');
   gauntletLiveBeginDay();
  }catch(error){
   console.error('Career Begin failed:',error);
   const button=document.querySelector(SELECTOR);
   if(button){button.disabled=false;button.textContent='BEGIN';button.setAttribute('aria-disabled','false');}
  }finally{
   setTimeout(()=>{window.__legacyCareerBeginBusy=false},500);
  }
  return false;
 };

 function wireBegin(){
  const button=document.querySelector(SELECTOR);
  if(!button)return;
  button.type='button';
  button.disabled=false;
  button.setAttribute('aria-disabled','false');
  button.setAttribute('onclick','return window.legacyCareerBegin(event)');
  button.classList.add('lpw10-begin-ready');
  const card=button.closest('.live-today');
  if(card){card.classList.add('lpw10-begin-card-ready');card.dataset.lpwBeginCard='1';}
 }

 function delegatedBegin(event){
  const button=event.target&&event.target.closest?event.target.closest(SELECTOR):null;
  if(button)return window.legacyCareerBegin(event);
 }
 document.addEventListener('click',delegatedBegin,true);
 document.addEventListener('touchend',delegatedBegin,{capture:true,passive:false});

 const previousRender=window.render;
 if(typeof previousRender==='function')window.render=function(){const out=previousRender.apply(this,arguments);queueMicrotask(wireBegin);setTimeout(wireBegin,60);return out};
 const previousCalendar=window.gauntletLiveCalendar;
 if(typeof previousCalendar==='function')window.gauntletLiveCalendar=function(){const out=previousCalendar.apply(this,arguments);queueMicrotask(wireBegin);setTimeout(wireBegin,60);return out};
 document.addEventListener('DOMContentLoaded',wireBegin);
 window.LPW10_wireCareerBegin=wireBegin;
 window.TTG_APP_VERSION=BUILD;
 window.LPW_GAMEPLAY_BUILD=BUILD;
})();

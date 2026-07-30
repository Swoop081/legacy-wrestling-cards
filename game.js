'use strict';

const app = document.getElementById('app');
const homeButton = document.getElementById('homeButton');
const roster = Array.isArray(window.LEGACY_WRESTLERS) ? window.LEGACY_WRESTLERS : [];

const state = {
  player: null,
  opponent: null,
  playerHealth: 100,
  opponentHealth: 100,
  playerMomentum: 50,
  opponentMomentum: 50,
  turn: 1,
  log: []
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function randomBetween(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function resetMatch() {
  state.playerHealth = 100;
  state.opponentHealth = 100;
  state.playerMomentum = 50;
  state.opponentMomentum = 50;
  state.turn = 1;
  state.log = [];
}

function renderHome() {
  state.player = null;
  state.opponent = null;
  app.innerHTML = `
    <section class="home-screen screen-shell">
      <img class="main-logo" src="assets/branding/lpw-logo-main-menu-1200.webp" alt="LEGACY Pro Wrestling">
      <div class="mode-card">
        <p class="eyebrow">PLAY MODE</p>
        <h1>Exhibition 1v1</h1>
        <p>Choose a 1999 wrestling icon and battle through a fast trading-card match.</p>
        <button id="exhibitionButton" class="primary-button">START EXHIBITION</button>
      </div>
      <p class="baseline-note">Trading Card Prototype · Two-Wrestler Test Roster</p>
    </section>`;
  document.getElementById('exhibitionButton').addEventListener('click', () => renderSelection('player'));
}

function statRows(wrestler) {
  const labels = {power:'Power',speed:'Speed',technique:'Technique',brawling:'Brawling',charisma:'Charisma',ringIQ:'Ring IQ',resilience:'Resilience',hardcore:'Hardcore'};
  return Object.entries(wrestler.stats).map(([key,value]) => `
    <div class="stat-row"><span>${labels[key]}</span><div class="stat-track"><i style="width:${value}%"></i></div><b>${value}</b></div>`).join('');
}

function rosterCard(wrestler, disabled = false) {
  return `
    <button class="wrestler-card ${disabled ? 'disabled' : ''}" data-id="${escapeHtml(wrestler.id)}" ${disabled ? 'disabled' : ''}>
      <div class="portrait-wrap"><img src="${escapeHtml(wrestler.portrait)}" alt="${escapeHtml(wrestler.name)}"></div>
      <div class="overall-badge">${wrestler.overall}</div>
      <p class="card-era">${escapeHtml(wrestler.era)} PERSONA</p>
      <strong>${escapeHtml(wrestler.name)}</strong>
      <span>${escapeHtml(wrestler.nickname)}</span>
    </button>`;
}

function renderSelection(side) {
  const choosingPlayer = side === 'player';
  app.innerHTML = `
    <section class="selection-screen screen-shell">
      <button class="back-button" id="backButton">← ${choosingPlayer ? 'MAIN MENU' : 'PLAYER SELECT'}</button>
      <p class="eyebrow">EXHIBITION 1v1</p>
      <h1>${choosingPlayer ? 'Choose Your Wrestler' : 'Choose Your Opponent'}</h1>
      <p class="selection-help">Tap a wrestler to view their 1999 ratings and confirm the selection.</p>
      <div class="roster-grid">${roster.map(w => rosterCard(w, !choosingPlayer && state.player?.id === w.id)).join('')}</div>
      <div id="wrestlerDetails"></div>
    </section>`;

  document.getElementById('backButton').addEventListener('click', choosingPlayer ? renderHome : () => renderSelection('player'));
  document.querySelectorAll('.wrestler-card:not(.disabled)').forEach(card => {
    card.addEventListener('click', () => renderWrestlerDetails(roster.find(w => w.id === card.dataset.id), side));
  });
}

function renderWrestlerDetails(wrestler, side) {
  const panel = document.getElementById('wrestlerDetails');
  panel.innerHTML = `
    <section class="details-panel">
      <div>
        <p class="eyebrow">${escapeHtml(wrestler.archetype)}</p>
        <h2>${escapeHtml(wrestler.name)}</h2>
        <p>${escapeHtml(wrestler.height)} · ${escapeHtml(wrestler.weight)} · ${escapeHtml(wrestler.hometown)}</p>
        <p><strong>Finisher:</strong> ${escapeHtml(wrestler.finisher)}</p>
        <button class="primary-button" id="confirmWrestler">CONFIRM ${side === 'player' ? 'WRESTLER' : 'OPPONENT'}</button>
      </div>
      <div class="stats-list">${statRows(wrestler)}</div>
    </section>`;
  panel.scrollIntoView({behavior:'smooth', block:'nearest'});
  document.getElementById('confirmWrestler').addEventListener('click', () => {
    if (side === 'player') {
      state.player = wrestler;
      renderSelection('opponent');
    } else {
      state.opponent = wrestler;
      renderMatchPreview();
    }
  });
}

function renderMatchPreview() {
  app.innerHTML = `
    <section class="match-preview screen-shell">
      <button class="back-button" id="backButton">← OPPONENT SELECT</button>
      <p class="eyebrow">1999 EXHIBITION</p>
      <h1>Tonight’s Main Event</h1>
      <div class="versus-layout">
        ${previewWrestler(state.player, 'YOU')}
        <div class="vs-mark">VS</div>
        ${previewWrestler(state.opponent, 'CPU')}
      </div>
      <div class="rules-box">
        <strong>TRADING CARD MATCH</strong>
        <span>Choose one of three cards each turn. Reduce your opponent’s health to zero.</span>
      </div>
      <button class="primary-button" id="beginMatch">BEGIN MATCH</button>
    </section>`;
  document.getElementById('backButton').addEventListener('click', () => renderSelection('opponent'));
  document.getElementById('beginMatch').addEventListener('click', () => { resetMatch(); renderDecision(); });
}

function previewWrestler(wrestler, label) {
  return `
    <article class="preview-wrestler">
      <span class="side-label">${label}</span>
      <img src="${escapeHtml(wrestler.portrait)}" alt="${escapeHtml(wrestler.name)}">
      <h2>${escapeHtml(wrestler.name)}</h2>
      <p>${escapeHtml(wrestler.nickname)}</p>
      <b>OVR ${wrestler.overall}</b>
    </article>`;
}

function meter(label, value, type) {
  return `<div class="meter"><div class="meter-label"><span>${label}</span><b>${Math.round(value)}</b></div><div class="meter-track"><i class="${type}" style="width:${value}%"></i></div></div>`;
}

function statusPanel() {
  return `
    <section class="match-status">
      <article>
        <div class="status-name"><img src="${escapeHtml(state.player.portrait)}" alt=""><strong>${escapeHtml(state.player.shortName)}</strong></div>
        ${meter('HEALTH', state.playerHealth, 'health')}${meter('MOMENTUM', state.playerMomentum, 'momentum')}
      </article>
      <div class="turn-badge">TURN ${state.turn}</div>
      <article>
        <div class="status-name cpu"><strong>${escapeHtml(state.opponent.shortName)}</strong><img src="${escapeHtml(state.opponent.portrait)}" alt=""></div>
        ${meter('HEALTH', state.opponentHealth, 'health')}${meter('MOMENTUM', state.opponentMomentum, 'momentum')}
      </article>
    </section>`;
}

function decisionCard(wrestler, index) {
  return `
    <button class="trading-card" data-card="${index}" aria-label="Choose ${escapeHtml(wrestler.decisionName)} card ${index + 1}">
      <div class="card-frame">
        <div class="card-header"><span>FINISHER</span><b>${wrestler.overall}</b></div>
        <img src="${escapeHtml(wrestler.decisionCard)}" alt="${escapeHtml(wrestler.decisionName)}">
        <div class="card-copy">
          <h3>${escapeHtml(wrestler.decisionName)}</h3>
          <p>${escapeHtml(wrestler.name)}</p>
          <div class="card-effect">HIGH IMPACT · +MOMENTUM</div>
        </div>
      </div>
    </button>`;
}

function renderDecision(message = '') {
  app.innerHTML = `
    <section class="match-screen screen-shell">
      ${statusPanel()}
      ${message ? `<div class="turn-message">${escapeHtml(message)}</div>` : ''}
      <p class="eyebrow">MAKE YOUR MOVE</p>
      <h1>Choose a Trading Card</h1>
      <p class="selection-help">Prototype view: all three choices currently use the same finisher card.</p>
      <div class="trading-card-grid">${[0,1,2].map(i => decisionCard(state.player, i)).join('')}</div>
      <div class="match-log">${state.log.slice(-3).reverse().map(line => `<p>${escapeHtml(line)}</p>`).join('')}</div>
    </section>`;
  document.querySelectorAll('.trading-card').forEach(card => card.addEventListener('click', () => resolveTurn(Number(card.dataset.card))));
}

function resolveTurn(slot) {
  document.querySelectorAll('.trading-card').forEach(card => card.disabled = true);
  const playerRoll = randomBetween(13, 22) + Math.floor((state.player.overall - 90) / 2) + Math.floor(state.playerMomentum / 25);
  const cpuRoll = randomBetween(11, 21) + Math.floor((state.opponent.overall - 90) / 2) + Math.floor(state.opponentMomentum / 28);

  const playerDamage = clamp(playerRoll, 12, 30);
  const cpuDamage = clamp(cpuRoll, 10, 28);
  state.opponentHealth = clamp(state.opponentHealth - playerDamage, 0, 100);
  state.playerMomentum = clamp(state.playerMomentum + randomBetween(7, 13), 0, 100);

  let message = `${state.player.shortName} lands the ${state.player.decisionName} for ${playerDamage} damage!`;
  state.log.push(message);

  if (state.opponentHealth > 0) {
    state.playerHealth = clamp(state.playerHealth - cpuDamage, 0, 100);
    state.opponentMomentum = clamp(state.opponentMomentum + randomBetween(6, 12), 0, 100);
    const cpuLine = `${state.opponent.shortName} answers with the ${state.opponent.decisionName} for ${cpuDamage} damage!`;
    state.log.push(cpuLine);
    message += ` ${cpuLine}`;
  }

  state.turn += 1;
  if (state.playerHealth <= 0 || state.opponentHealth <= 0 || state.turn > 10) {
    window.setTimeout(renderResult, 450);
  } else {
    window.setTimeout(() => renderDecision(message), 450);
  }
}

function renderResult() {
  let winner;
  if (state.playerHealth === state.opponentHealth) winner = state.player.overall >= state.opponent.overall ? state.player : state.opponent;
  else winner = state.playerHealth > state.opponentHealth ? state.player : state.opponent;
  const playerWon = winner.id === state.player.id;
  app.innerHTML = `
    <section class="result-screen screen-shell">
      <p class="eyebrow">MATCH COMPLETE</p>
      <h1>${playerWon ? 'Victory!' : 'Defeat'}</h1>
      <div class="winner-card">
        <img src="${escapeHtml(winner.portrait)}" alt="${escapeHtml(winner.name)}">
        <span>${playerWon ? 'YOUR WINNER' : 'MATCH WINNER'}</span>
        <h2>${escapeHtml(winner.name)}</h2>
        <p>${escapeHtml(winner.finisher)} decides the match.</p>
      </div>
      <div class="result-actions">
        <button class="primary-button" id="rematch">REMATCH</button>
        <button class="secondary-button" id="newMatch">NEW MATCH</button>
      </div>
    </section>`;
  document.getElementById('rematch').addEventListener('click', () => { resetMatch(); renderDecision(); });
  document.getElementById('newMatch').addEventListener('click', renderHome);
}

homeButton.addEventListener('click', renderHome);
renderHome();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
}

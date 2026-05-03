/* =============================================================
   ChronoTask — script.js
   Vanilla JavaScript, no external dependencies.
============================================================= */

'use strict';

// ─────────────────────────────────────────────
//  UTILS
// ─────────────────────────────────────────────

/** Zero-pads a number to `d` digits (default 2). */
function pad(n, d = 2) {
  return String(n).padStart(d, '0');
}

/**
 * Formats a millisecond value as HH:MM:SS.
 * When showMs is true, appends centiseconds wrapped in a <span class="ms">.
 */
function formatTime(ms, showMs = false) {
  const total = Math.floor(ms / 1000);
  const h  = Math.floor(total / 3600);
  const m  = Math.floor((total % 3600) / 60);
  const s  = total % 60;
  const cs = Math.floor((ms % 1000) / 10);
  const base = `${pad(h)}:${pad(m)}:${pad(s)}`;
  return showMs ? `${base}<span class="ms">.${pad(cs)}</span>` : base;
}

/** Shows or hides an element by toggling display:flex / none. */
function show(id, visible) {
  document.getElementById(id).style.display = visible ? 'flex' : 'none';
}

// ─────────────────────────────────────────────
//  TAB SWITCHER
// ─────────────────────────────────────────────

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));

  if (tab === 'stopwatch') {
    document.querySelector('.stop-tab').classList.add('active');
    document.getElementById('stopwatch-card').classList.add('active');
  } else {
    document.querySelector('.count-tab').classList.add('active');
    document.getElementById('countdown-card').classList.add('active');
  }
}

// ─────────────────────────────────────────────
//  STOPWATCH
// ─────────────────────────────────────────────

/**
 * SW state object.
 * elapsed     — total milliseconds accumulated (updated live during a run).
 * baseElapsed — snapshot of elapsed when a run segment starts; the live
 *               delta from startTs is added on top to produce elapsed.
 * startTs     — performance.now() timestamp at the start of the current segment.
 * timer       — setInterval handle.
 * state       — 'idle' | 'running' | 'paused' | 'done'
 * laps        — array of { split, total } objects.
 * lapStartMs  — elapsed value when the last lap was recorded.
 */
const SW = {
  elapsed:     0,
  baseElapsed: 0,
  startTs:     null,
  timer:       null,
  state:       'idle',
  laps:        [],
  lapStartMs:  0,
};

function swSetStatus(state, text) {
  const pill = document.getElementById('sw-status');
  pill.className = 'status-pill ' + state;
  document.getElementById('sw-status-text').textContent = text;
}

/** Called by setInterval every ~30 ms to refresh the display. */
function swUpdate() {
  SW.elapsed = SW.baseElapsed + (performance.now() - SW.startTs);
  document.getElementById('sw-clock').innerHTML = formatTime(SW.elapsed, true);
}

function swStart() {
  // Full reset when starting fresh
  if (SW.state === 'idle' || SW.state === 'done') {
    SW.elapsed     = 0;
    SW.baseElapsed = 0;
    SW.laps        = [];
    SW.lapStartMs  = 0;
    document.getElementById('sw-laps-list').innerHTML = '';
    document.getElementById('sw-laps').classList.remove('show');
  }

  SW.startTs = performance.now();
  SW.state   = 'running';
  SW.timer   = setInterval(swUpdate, 30);

  // UI state
  show('sw-main-btns',    false);
  show('sw-running-btns', true);
  show('sw-done-btns',    false);
  swSetStatus('running', 'En marcha');
  document.getElementById('sw-clock').className  = 'clock running-stop';
  document.getElementById('sw-pause-btn').textContent = '⏸ Pausar';
  document.getElementById('sw-pause-btn').className   = 'btn btn-pause';
}

function swPause() {
  const btn = document.getElementById('sw-pause-btn');

  if (SW.state === 'running') {
    clearInterval(SW.timer);
    SW.baseElapsed = SW.elapsed;   // freeze the accumulated time
    SW.state = 'paused';
    btn.textContent = '▶ Reanudar';
    btn.className   = 'btn btn-primary';
    swSetStatus('paused', 'Pausado');
    document.getElementById('sw-clock').className = 'clock paused';

  } else if (SW.state === 'paused') {
    SW.startTs = performance.now();
    SW.timer   = setInterval(swUpdate, 30);
    SW.state   = 'running';
    btn.textContent = '⏸ Pausar';
    btn.className   = 'btn btn-pause';
    swSetStatus('running', 'En marcha');
    document.getElementById('sw-clock').className = 'clock running-stop';
  }
}

function swLap() {
  const lapMs = SW.elapsed - SW.lapStartMs;
  SW.lapStartMs = SW.elapsed;
  const num = SW.laps.length + 1;
  SW.laps.push({ split: lapMs, total: SW.elapsed });

  const list = document.getElementById('sw-laps-list');
  const item = document.createElement('div');
  item.className = 'lap-item';
  item.innerHTML =
    `<span class="lap-num">Vuelta ${pad(num)}</span>` +
    `<span class="lap-split">${formatTime(lapMs)}</span>` +
    `<span class="lap-total">Total: ${formatTime(SW.elapsed)}</span>`;
  list.prepend(item);
  document.getElementById('sw-laps').classList.add('show');
}

function swStop() {
  clearInterval(SW.timer);
  SW.state = 'done';
  show('sw-running-btns', false);
  show('sw-done-btns',    true);
  swSetStatus('done', 'Finalizado');
  document.getElementById('sw-clock').className = 'clock done';
}

function swReset() {
  clearInterval(SW.timer);
  SW.elapsed     = 0;
  SW.baseElapsed = 0;
  SW.laps        = [];
  SW.lapStartMs  = 0;
  SW.state       = 'idle';

  document.getElementById('sw-clock').innerHTML = formatTime(0, true);
  document.getElementById('sw-clock').className = 'clock';
  document.getElementById('sw-laps-list').innerHTML = '';
  document.getElementById('sw-laps').classList.remove('show');

  show('sw-main-btns',    true);
  show('sw-running-btns', false);
  show('sw-done-btns',    false);
  swSetStatus('idle', 'En espera');
}

// ─────────────────────────────────────────────
//  COUNTDOWN
// ─────────────────────────────────────────────

/**
 * CD state object.
 * totalMs        — original countdown duration in ms.
 * remaining      — current ms left (updated live).
 * baseRemaining  — snapshot of remaining when a run segment starts.
 * startTs        — performance.now() timestamp at the start of the current segment.
 * timer          — setInterval handle.
 * state          — 'idle' | 'running' | 'paused' | 'done'
 */
const CD = {
  totalMs:       0,
  remaining:     0,
  baseRemaining: 0,
  startTs:       null,
  timer:         null,
  state:         'idle',
};

function cdSetStatus(state, text) {
  const pill = document.getElementById('cd-status');
  pill.className = 'status-pill ' + state;
  document.getElementById('cd-status-text').textContent = text;
}

/** Called by setInterval every ~50 ms to refresh the display. */
function cdUpdate() {
  const delta    = performance.now() - CD.startTs;
  const rem      = Math.max(0, CD.baseRemaining - delta);
  CD.remaining   = rem;

  document.getElementById('cd-clock').textContent = formatTime(rem);

  const pct = CD.totalMs > 0 ? (rem / CD.totalMs) * 100 : 0;
  document.getElementById('cd-progress-fill').style.width = pct + '%';

  if (rem <= 0) cdFinish();
}

function cdStart() {
  const h = parseInt(document.getElementById('cd-h').value) || 0;
  const m = parseInt(document.getElementById('cd-m').value) || 0;
  const s = parseInt(document.getElementById('cd-s').value) || 0;
  const total = (h * 3600 + m * 60 + s) * 1000;

  if (total <= 0) { shakeCdInput(); return; }

  CD.totalMs       = total;
  CD.baseRemaining = total;
  CD.startTs       = performance.now();
  CD.state         = 'running';
  CD.timer         = setInterval(cdUpdate, 50);

  // UI state
  disableCdFields(true);
  show('cd-input-area',   false);
  show('cd-main-btns',    false);
  show('cd-running-btns', true);
  show('cd-done-btns',    false);
  document.getElementById('cd-alert').classList.remove('show');
  document.getElementById('cd-progress-wrap').style.display = 'block';
  document.getElementById('cd-progress-fill').style.width   = '100%';
  cdSetStatus('running', 'En marcha');
  document.getElementById('cd-clock').className  = 'clock running-count';
  document.getElementById('cd-pause-btn').textContent = '⏸ Pausar';
  document.getElementById('cd-pause-btn').className   = 'btn btn-pause';
}

function cdPause() {
  const btn = document.getElementById('cd-pause-btn');

  if (CD.state === 'running') {
    clearInterval(CD.timer);
    CD.baseRemaining = CD.remaining;   // freeze remaining time
    CD.state = 'paused';
    btn.textContent = '▶ Reanudar';
    btn.className   = 'btn btn-primary';
    cdSetStatus('paused', 'Pausado');
    document.getElementById('cd-clock').className = 'clock paused';

  } else if (CD.state === 'paused') {
    CD.startTs = performance.now();
    CD.timer   = setInterval(cdUpdate, 50);
    CD.state   = 'running';
    btn.textContent = '⏸ Pausar';
    btn.className   = 'btn btn-pause';
    cdSetStatus('running', 'En marcha');
    document.getElementById('cd-clock').className = 'clock running-count';
  }
}

function cdStop() {
  clearInterval(CD.timer);
  CD.state = 'idle';
  cdReset();
}

function cdFinish() {
  clearInterval(CD.timer);
  CD.state = 'done';

  document.getElementById('cd-clock').textContent          = '00:00:00';
  document.getElementById('cd-clock').className            = 'clock done';
  document.getElementById('cd-progress-fill').style.width  = '0%';

  show('cd-running-btns', false);
  show('cd-done-btns',    true);
  document.getElementById('cd-alert').classList.add('show');
  cdSetStatus('done', '¡Tiempo agotado!');

  flashScreen();
}

function cdReset() {
  clearInterval(CD.timer);
  CD.state = 'idle';

  document.getElementById('cd-clock').textContent         = '00:00:00';
  document.getElementById('cd-clock').className           = 'clock';
  document.getElementById('cd-progress-wrap').style.display = 'none';
  document.getElementById('cd-alert').classList.remove('show');

  disableCdFields(false);
  show('cd-input-area',   true);
  show('cd-main-btns',    true);
  show('cd-running-btns', false);
  show('cd-done-btns',    false);
  cdSetStatus('idle', 'En espera');
}

// ─────────────────────────────────────────────
//  COUNTDOWN HELPERS
// ─────────────────────────────────────────────

function disableCdFields(disabled) {
  ['cd-h', 'cd-m', 'cd-s'].forEach(id => {
    document.getElementById(id).disabled = disabled;
  });
}

function shakeCdInput() {
  const area = document.getElementById('cd-input-area');
  area.style.animation = 'none';
  area.offsetHeight;                        // force reflow to restart animation
  area.style.animation = 'shake .4s ease';
}

function flashScreen() {
  const flash = document.createElement('div');
  flash.style.cssText =
    'position:fixed;inset:0;background:rgba(239,83,80,.18);' +
    'pointer-events:none;z-index:9999;animation:flashOut .6s ease forwards';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 650);
}

// ─────────────────────────────────────────────
//  INPUT SANITATION
// ─────────────────────────────────────────────

document.getElementById('cd-m').addEventListener('change', function () {
  if (parseInt(this.value) > 59) this.value = 59;
  if (parseInt(this.value) < 0)  this.value = 0;
});
document.getElementById('cd-s').addEventListener('change', function () {
  if (parseInt(this.value) > 59) this.value = 59;
  if (parseInt(this.value) < 0)  this.value = 0;
});

// ─────────────────────────────────────────────
//  KEYBOARD SHORTCUTS
//  Enter  → starts the active tool (when idle)
//  Space  → pauses / resumes the active tool (when running or paused)
// ─────────────────────────────────────────────

document.addEventListener('keydown', e => {
  const swActive = document.getElementById('stopwatch-card').classList.contains('active');
  const cdActive = document.getElementById('countdown-card').classList.contains('active');

  if (e.key === 'Enter') {
    if (swActive && SW.state === 'idle') swStart();
    if (cdActive && CD.state === 'idle') cdStart();
  }

  if (e.key === ' ') {
    e.preventDefault();
    if (swActive && (SW.state === 'running' || SW.state === 'paused')) swPause();
    if (cdActive && (CD.state === 'running' || CD.state === 'paused')) cdPause();
  }
});

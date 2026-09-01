import "./styles.css";
import { makeLevel, species, MAX_LEVEL, TRAY_LIMIT } from "./game-core.js";

const STORAGE_KEY = "kus-bahcesi-save-v1";
const SETTINGS_KEY = "kus-bahcesi-settings-v1";

const defaultSave = {
  level: 1,
  score: 0,
  stars: 0,
  completed: [],
  discovered: ["mavi", "nar", "limon"],
  onboardingSeen: false,
  currentGame: null
};

const defaultSettings = {
  sound: true,
  haptics: true,
  largeText: false,
  highContrast: false,
  reduceMotion: false
};

let save = loadJson(STORAGE_KEY, defaultSave);
let settings = loadJson(SETTINGS_KEY, defaultSettings);
let game = null;
let toastTimer = null;
let audioContext = null;

function loadJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return { ...fallback, ...(value || {}) };
  } catch {
    return structuredClone(fallback);
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function icon(name) {
  const icons = {
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 8.96 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3v-4h.08A1.7 1.7 0 0 0 4.6 8.95a1.7 1.7 0 0 0-.34-1.88L4.2 7l2.83-2.83.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 10 3.03V3h4v.08a1.7 1.7 0 0 0 1.03 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06L19.8 7l-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    undo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7 5 11l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 11h8a5 5 0 0 1 5 5v1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    shuffle: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 3h5v5M4 17l5.8-5.8M21 3l-8.2 8.2M16 21h5v-5M4 7h2.5c1.4 0 2.2.5 3.3 1.7L21 21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    hint: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 22h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8.5 15.5C7.6 14.6 7 13.1 7 11.5a5 5 0 0 1 10 0c0 1.6-.6 3.1-1.5 4-.6.6-1 1.2-1.2 2h-4.6c-.2-.8-.6-1.4-1.2-2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/></svg>'
  };
  return icons[name] || "";
}

function birdSvg(bird, decorative = false) {
  const mark = bird.mark === "dots"
    ? `<circle cx="42" cy="54" r="3" fill="${bird.wing}" opacity=".7"/><circle cx="50" cy="62" r="2.4" fill="${bird.wing}" opacity=".65"/>`
    : bird.mark === "bib"
      ? `<path d="M52 42c-2 7-1 13 4 20-8 2-15-2-18-9 3-6 7-9 14-11Z" fill="${bird.wing}" opacity=".58"/>`
      : bird.mark === "mask"
        ? `<path d="M56 25c8-1 14 2 18 7-5 5-12 6-18 3Z" fill="${bird.wing}" opacity=".9"/>`
        : `<path d="M37 54c8 4 15 5 24 1" fill="none" stroke="${bird.wing}" stroke-width="3.5" stroke-linecap="round" opacity=".7"/>`;
  return `<svg viewBox="0 0 100 92" role="img" aria-hidden="${decorative ? "true" : "false"}" ${decorative ? "" : `aria-label="${bird.name}"`}>
    <ellipse cx="47" cy="78" rx="28" ry="5" fill="rgba(30,60,40,.14)"/>
    <path d="M29 65 15 75l19-2Z" fill="${bird.wing}"/>
    <ellipse cx="48" cy="52" rx="27" ry="30" transform="rotate(-10 48 52)" fill="${bird.body}"/>
    <ellipse cx="53" cy="58" rx="18" ry="22" transform="rotate(-12 53 58)" fill="${bird.chest}"/>
    <path d="M31 48c-10 9-10 24 2 29 10-5 15-15 16-29-6-4-12-4-18 0Z" fill="${bird.wing}"/>
    <path d="M34 52c-4 6-4 13 0 18" fill="none" stroke="rgba(255,255,255,.38)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="61" cy="29" r="18" fill="${bird.body}"/>
    ${mark}
    <path d="m76 31 15 6-16 5Z" fill="${bird.accent}"/>
    <circle cx="66" cy="25" r="4" fill="#fff"/>
    <circle cx="67" cy="25" r="2.1" fill="#1f3028"/>
    <circle cx="67.7" cy="24.2" r=".6" fill="#fff"/>
    <path d="M57 14c3-5 7-8 12-9-2 5-2 8 0 12" fill="${bird.wing}"/>
    <path d="M39 79v6M55 78v7" stroke="#875c3e" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}

function applyA11yClasses() {
  const shell = document.querySelector(".app-shell");
  if (!shell) return;
  shell.classList.toggle("large-text", settings.largeText);
  shell.classList.toggle("high-contrast", settings.highContrast);
  shell.classList.toggle("reduce-motion", settings.reduceMotion);
}

function renderHome() {
  game = null;
  const app = document.querySelector("#app");
  const hero = species[(save.level - 1) % Math.min(species.length, 6)];
  app.innerHTML = `<main class="app-shell">
    <section class="screen home-screen" aria-labelledby="home-title">
      <header class="home-topbar">
        <div class="brand-mark">
          <div class="brand-badge">${birdSvg(species[0], true)}</div>
          <div><p class="eyebrow">Her gün yeni bir keşif</p><h1 class="brand-title" id="home-title">Kuş Bahçesi</h1></div>
        </div>
        <button class="icon-button" data-action="settings" aria-label="Ayarları aç">${icon("settings")}</button>
      </header>

      <article class="hero-card">
        <div class="hero-copy">
          <div class="hero-kicker">✦ BAHÇE YOLCULUĞU</div>
          <h2>Bölüm ${save.level}<br><span style="color:#ffe0a7">seni bekliyor</span></h2>
          <p>Aynı üç kuşu bul, yuvanı rahatlat ve bahçenin yeni köşesini aç.</p>
          <button class="primary-button" data-action="play">${save.currentGame ? "Kaldığın yerden devam et" : "Oyuna devam et"}</button>
        </div>
        <div class="hero-bird" aria-hidden="true">${birdSvg(hero, true)}</div>
      </article>

      <section class="journey-strip" aria-label="Bahçe yolculuğu ilerlemesi">
        <div class="journey-copy"><span>Günışığı Bahçesi</span><strong>${save.completed.length} / ${MAX_LEVEL} bölüm</strong></div>
        <div class="progress-track"><div class="progress-fill" style="width:${Math.max(2, (save.completed.length / MAX_LEVEL) * 100)}%"></div></div>
      </section>

      <div class="quick-grid" aria-label="Diğer oyun alanları">
        <button class="quick-card" data-action="daily"><span class="mini-icon">☀️</span><strong>Günün keşfi</strong><span>Bugüne özel sakin bir bulmaca</span></button>
        <button class="quick-card" data-action="album"><span class="mini-icon">🪶</span><strong>Kuş albümü</strong><span>${save.discovered.length} kuş keşfedildi</span></button>
      </div>
    </section>
  </main>`;
  bindCommonActions();
  applyA11yClasses();
}

function startGame(daily = false) {
  if (!daily && save.currentGame?.status === "playing" && save.currentGame.level === save.level) {
    game = save.currentGame;
  } else {
    game = makeLevel(save.level, daily);
  }
  renderGame();
}

function saveGame() {
  if (game && !game.daily && game.status === "playing") save.currentGame = game;
  persist();
}

function renderGame() {
  const app = document.querySelector("#app");
  const cleared = game.initialCount - game.board.length;
  const progress = Math.round((cleared / game.initialCount) * 100);
  app.innerHTML = `<main class="app-shell">
    <section class="screen game-screen" aria-labelledby="level-title">
      <header class="game-topbar">
        <button class="icon-button back-button" data-action="home" aria-label="Ana sayfaya dön">${icon("back")}</button>
        <div class="level-heading"><h1 id="level-title">${game.daily ? "Günün keşfi" : `Bölüm ${game.level}`}</h1><p>${levelSubtitle(game.level)}</p></div>
        <div class="score-pill" aria-label="${save.score} yaprak puanı">🍃 <span>${save.score}</span></div>
      </header>
      <div class="progress-wrap" aria-label="Bölüm ilerlemesi yüzde ${progress}">
        <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
        <div class="progress-label">${cleared}/${game.initialCount}</div>
      </div>
      <div class="board-wrap">
        <div class="bird-board" role="group" aria-label="Eşleştirilecek kuşlar">${game.board.map(tileMarkup).join("")}</div>
        ${!save.onboardingSeen && game.level === 1 ? '<div class="coach-bubble" role="status">Aynı türden üç kuşa sırayla dokun. Kuşlar aşağıdaki yuvada buluşacak.</div>' : ""}
      </div>
      <section class="tray-section" aria-labelledby="tray-title">
        <div class="tray-label"><span id="tray-title">Eşleştirme yuvası</span><span class="${game.tray.length >= 5 ? "danger" : ""}">${game.tray.length}/${TRAY_LIMIT}</span></div>
        <div class="bird-tray" aria-live="polite">${trayMarkup()}</div>
      </section>
      <div class="power-row" aria-label="Yardımcı araçlar">
        <button class="power-button" data-action="undo" ${game.history.length ? "" : "disabled"}>${icon("undo")}<span>Geri al</span></button>
        <button class="power-button" data-action="shuffle" ${game.shuffles > 0 ? "" : "disabled"}>${icon("shuffle")}<span>Karıştır (${game.shuffles})</span></button>
        <button class="power-button" data-action="hint" ${game.hints > 0 ? "" : "disabled"}>${icon("hint")}<span>İpucu (${game.hints})</span></button>
      </div>
    </section>
  </main>`;
  bindGameActions();
  applyA11yClasses();
}

function levelSubtitle(level) {
  const names = ["Günışığı Bahçesi", "Ihlamur Yolu", "Gül Avlusu", "Sakin Göl", "Lavanta Tepesi"];
  return names[Math.floor((level - 1) / 20) % names.length];
}

function tileMarkup(tile) {
  const bird = species.find((item) => item.id === tile.speciesId);
  return `<button class="bird-tile" data-uid="${tile.uid}" aria-label="${bird.name}">${birdSvg(bird)}</button>`;
}

function trayMarkup() {
  const slots = [];
  for (let i = 0; i < TRAY_LIMIT; i += 1) {
    const tile = game.tray[i];
    if (tile) {
      const bird = species.find((item) => item.id === tile.speciesId);
      slots.push(`<div class="tray-slot"><div class="tray-bird" data-tray-uid="${tile.uid}">${birdSvg(bird, true)}</div></div>`);
    } else {
      slots.push('<div class="tray-slot" aria-hidden="true"></div>');
    }
  }
  return slots.join("");
}

function bindCommonActions() {
  document.querySelector('[data-action="settings"]')?.addEventListener("click", openSettings);
  document.querySelector('[data-action="play"]')?.addEventListener("click", () => startGame(false));
  document.querySelector('[data-action="daily"]')?.addEventListener("click", () => startGame(true));
  document.querySelector('[data-action="album"]')?.addEventListener("click", openAlbum);
}

function bindGameActions() {
  document.querySelectorAll(".bird-tile").forEach((button) => button.addEventListener("click", () => selectTile(button.dataset.uid, button)));
  document.querySelector('[data-action="home"]')?.addEventListener("click", () => { saveGame(); renderHome(); });
  document.querySelector('[data-action="undo"]')?.addEventListener("click", undoMove);
  document.querySelector('[data-action="shuffle"]')?.addEventListener("click", shuffleBoard);
  document.querySelector('[data-action="hint"]')?.addEventListener("click", showHint);
}

async function selectTile(uid, button) {
  if (game.busy || game.status !== "playing") return;
  const index = game.board.findIndex((tile) => tile.uid === uid);
  if (index < 0) return;
  if (!save.onboardingSeen) {
    save.onboardingSeen = true;
    document.querySelector(".coach-bubble")?.remove();
  }
  const [tile] = game.board.splice(index, 1);
  game.history.push({ tile, index });
  game.tray.push(tile);
  button.classList.add("is-selected");
  playTone(430 + game.tray.length * 35, .06);
  haptic(18);
  await wait(settings.reduceMotion ? 1 : 180);
  renderGame();
  await resolveMatches(tile.speciesId);
  saveGame();
}

async function resolveMatches(speciesId) {
  const matches = game.tray.filter((tile) => tile.speciesId === speciesId);
  if (matches.length >= 3) {
    game.busy = true;
    const ids = matches.slice(0, 3).map((tile) => tile.uid);
    ids.forEach((id) => document.querySelector(`[data-tray-uid="${id}"]`)?.classList.add("is-matched"));
    playMatchSound();
    haptic([30, 40, 30]);
    await wait(settings.reduceMotion ? 1 : 360);
    game.tray = game.tray.filter((tile) => !ids.includes(tile.uid));
    game.removed.push(...matches.slice(0, 3));
    save.score += 15;
    const bird = species.find((item) => item.id === speciesId);
    if (!save.discovered.includes(speciesId)) {
      save.discovered.push(speciesId);
      showToast(`${bird.name} albümüne eklendi!`);
    }
    game.busy = false;
    renderGame();
  }

  if (game.board.length === 0 && game.tray.length === 0) return finishLevel(true);
  if (game.tray.length >= TRAY_LIMIT) return finishLevel(false);
}

function undoMove() {
  if (game.busy || !game.history.length || game.status !== "playing") return;
  const last = game.history.pop();
  const trayIndex = game.tray.findIndex((tile) => tile.uid === last.tile.uid);
  if (trayIndex < 0) {
    showToast("Eşleşmiş bir kuş geri alınamaz.");
    game.history.push(last);
    return;
  }
  game.tray.splice(trayIndex, 1);
  game.board.splice(Math.min(last.index, game.board.length), 0, last.tile);
  playTone(280, .05);
  renderGame();
  saveGame();
}

function shuffleBoard() {
  if (game.busy || game.shuffles <= 0 || game.status !== "playing") return;
  for (let i = game.board.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [game.board[i], game.board[j]] = [game.board[j], game.board[i]];
  }
  game.shuffles -= 1;
  haptic(25);
  renderGame();
  showToast("Kuşlar yeni yerlere kondu.");
  saveGame();
}

function showHint() {
  if (game.busy || game.hints <= 0 || game.status !== "playing") return;
  const trayCounts = game.tray.reduce((acc, tile) => ({ ...acc, [tile.speciesId]: (acc[tile.speciesId] || 0) + 1 }), {});
  const preferred = Object.entries(trayCounts).sort((a, b) => b[1] - a[1]).find(([id]) => game.board.some((tile) => tile.speciesId === id));
  const targetId = preferred?.[0] || game.board[0]?.speciesId;
  const target = game.board.find((tile) => tile.speciesId === targetId);
  if (!target) return;
  document.querySelector(`[data-uid="${target.uid}"]`)?.classList.add("is-hint");
  game.hints -= 1;
  playTone(620, .11);
  saveGame();
  setTimeout(() => renderGame(), settings.reduceMotion ? 60 : 2000);
}

function finishLevel(won) {
  game.status = won ? "won" : "lost";
  if (won && !game.daily) {
    if (!save.completed.includes(game.level)) save.completed.push(game.level);
    save.stars += 3;
    save.score += 50;
    save.level = Math.min(MAX_LEVEL, save.level + 1);
    save.currentGame = null;
  }
  persist();
  openResult(won);
}

function openResult(won) {
  const bird = species[(game.level + 1) % species.length];
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal result-copy" role="dialog" aria-modal="true" aria-labelledby="result-title">
    <div class="result-illustration">${birdSvg(bird, true)}</div>
    <div class="stars">${won ? "★ ★ ★" : "★ · ·"}</div>
    <h2 id="result-title">${won ? "Bahçe şenlendi!" : "Yuva biraz doldu"}</h2>
    <p>${won ? "Tüm kuşlar eşlerini buldu. Yeni bir bahçe yolu açıldı." : "Çok yaklaştın. Aynı kuşları daha erken bulmaya çalışabilirsin."}</p>
    <div class="modal-actions">
      <button class="primary-button" data-result="primary">${won ? (game.daily || game.level === MAX_LEVEL ? "Ana bahçeye dön" : "Sonraki bölüme geç") : "Yeniden dene"}</button>
      <button class="secondary-button" data-result="home">Ana sayfa</button>
    </div>
  </section>`;
  document.body.append(backdrop);
  backdrop.querySelector('[data-result="primary"]').addEventListener("click", () => {
    backdrop.remove();
    if (won && (game.daily || game.level === MAX_LEVEL)) renderHome();
    else { game = makeLevel(won ? save.level : game.level, false); renderGame(); }
  });
  backdrop.querySelector('[data-result="home"]').addEventListener("click", () => { backdrop.remove(); renderHome(); });
  backdrop.querySelector("button")?.focus();
}

function openSettings() {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
    <div class="modal-head"><h2 id="settings-title">Rahatına göre</h2><button class="icon-button" data-close aria-label="Ayarları kapat">${icon("close")}</button></div>
    <p>Görünümü ve oyun hissini istediğin gibi ayarla.</p>
    <div class="settings-list">
      ${settingToggle("sound", "Oyun sesleri", "Yumuşak seçim ve eşleşme sesleri")}
      ${settingToggle("haptics", "Titreşim", "Dokunuşlarda hafif geri bildirim")}
      ${settingToggle("largeText", "Büyük yazılar", "Metinleri daha rahat oku")}
      ${settingToggle("highContrast", "Yüksek kontrast", "Kuşları ve yazıları daha belirgin göster")}
      ${settingToggle("reduceMotion", "Hareketleri azalt", "Animasyonları en aza indir")}
    </div>
  </section>`;
  document.body.append(backdrop);
  backdrop.querySelectorAll("input").forEach((input) => input.addEventListener("change", () => {
    settings[input.name] = input.checked;
    persist();
    applyA11yClasses();
  }));
  const close = () => backdrop.remove();
  backdrop.querySelector("[data-close]").addEventListener("click", close);
  backdrop.addEventListener("click", (event) => { if (event.target === backdrop) close(); });
  backdrop.querySelector("button")?.focus();
}

function openAlbum() {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal album-modal" role="dialog" aria-modal="true" aria-labelledby="album-title">
    <div class="modal-head"><div><p class="eyebrow">Keşif defteri</p><h2 id="album-title">Kuş albümü</h2></div><button class="icon-button" data-close aria-label="Albümü kapat">${icon("close")}</button></div>
    <p>${save.discovered.length} kuşu yakından tanıdın. Yeni türler ilerleyen bahçelerde ortaya çıkacak.</p>
    <div class="album-grid">${species.map((bird) => {
      const discovered = save.discovered.includes(bird.id);
      return `<article class="album-bird ${discovered ? "" : "is-locked"}" aria-label="${discovered ? bird.name : "Henüz keşfedilmemiş kuş"}">
        <div>${birdSvg(bird, true)}</div><strong>${discovered ? bird.name : "Yeni keşif"}</strong>
      </article>`;
    }).join("")}</div>
  </section>`;
  document.body.append(backdrop);
  const close = () => backdrop.remove();
  backdrop.querySelector("[data-close]").addEventListener("click", close);
  backdrop.addEventListener("click", (event) => { if (event.target === backdrop) close(); });
  backdrop.querySelector("button")?.focus();
}

function settingToggle(key, label, help) {
  return `<div class="setting-row"><div><label for="setting-${key}">${label}</label><small>${help}</small></div><label class="switch"><input id="setting-${key}" name="${key}" type="checkbox" ${settings[key] ? "checked" : ""}><span aria-hidden="true"></span></label></div>`;
}

function showToast(message) {
  document.querySelector(".toast")?.remove();
  clearTimeout(toastTimer);
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.append(toast);
  toastTimer = setTimeout(() => toast.remove(), 2600);
}

function haptic(pattern) {
  if (settings.haptics && navigator.vibrate) navigator.vibrate(pattern);
}

function playTone(frequency, duration) {
  if (!settings.sound) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.07, audioContext.currentTime + .01);
    gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration + .02);
  } catch { /* Ses desteği yoksa oyun sessiz devam eder. */ }
}

function playMatchSound() {
  playTone(520, .12);
  setTimeout(() => playTone(660, .14), 90);
  setTimeout(() => playTone(810, .18), 180);
}

function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

window.addEventListener("pagehide", saveGame);
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
    scope: import.meta.env.BASE_URL
  }).catch(() => {}));
}
renderHome();

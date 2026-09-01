import "./styles.css";
import {
  makeLevel,
  makeWordState,
  species,
  MAX_LEVEL,
  getConflicts,
  inventoryFor,
  isGridSolved,
  missionComplete
} from "./game-core.js";

const STORAGE_KEY = "kus-bahcesi-save-v1";
const SETTINGS_KEY = "kus-bahcesi-settings-v1";

const defaultSave = {
  level: 1,
  score: 0,
  stars: 0,
  completed: [],
  discovered: ["mavi", "nar", "limon"],
  onboardingSeen: false,
  wordOnboardingSeen: false,
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
    clear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16 9-11 7 6-7 9H8Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m10 19-4-4M13 20h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
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
    <circle cx="61" cy="29" r="18" fill="${bird.body}"/>${mark}
    <path d="m76 31 15 6-16 5Z" fill="${bird.accent}"/><circle cx="66" cy="25" r="4" fill="#fff"/><circle cx="67" cy="25" r="2.1" fill="#1f3028"/>
    <path d="M57 14c3-5 7-8 12-9-2 5-2 8 0 12" fill="${bird.wing}"/><path d="M39 79v6M55 78v7" stroke="#875c3e" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}

function birdById(id) { return species.find((bird) => bird.id === id); }

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
  app.innerHTML = `<main class="app-shell"><section class="screen home-screen" aria-labelledby="home-title">
    <header class="home-topbar"><div class="brand-mark"><div class="brand-badge">${birdSvg(species[0], true)}</div><div><p class="eyebrow">Mantık ve kelime macerası</p><h1 class="brand-title" id="home-title">Kuş Bahçesi</h1></div></div><button class="icon-button" data-action="settings" aria-label="Ayarları aç">${icon("settings")}</button></header>
    <article class="hero-card"><div class="hero-copy"><div class="hero-kicker">✦ KUŞLARIN ŞİFRESİ</div><h2>Bölüm ${save.level}<br><span style="color:#ffe0a7">seni bekliyor</span></h2><p>Kuşları akıllıca yerleştir, bahçenin gizli sözcüğünü bul.</p><button class="primary-button" data-action="play">${save.currentGame?.version === 3 ? "Kaldığın yerden devam et" : "Bulmacaya başla"}</button></div><div class="hero-bird" aria-hidden="true">${birdSvg(hero, true)}</div></article>
    <section class="journey-strip" aria-label="Bahçe yolculuğu ilerlemesi"><div class="journey-copy"><span>${levelSubtitle(save.level)}</span><strong>${save.completed.length} / ${MAX_LEVEL} bölüm</strong></div><div class="progress-track"><div class="progress-fill" style="width:${Math.max(2, (save.completed.length / MAX_LEVEL) * 100)}%"></div></div></section>
    <div class="quick-grid"><button class="quick-card" data-action="daily"><span class="mini-icon">☀️</span><strong>Günün şifresi</strong><span>Her gün yeni bir mantık ve kelime bulmacası</span></button><button class="quick-card" data-action="album"><span class="mini-icon">🪶</span><strong>Kuş albümü</strong><span>${save.discovered.length} kuş keşfedildi</span></button></div>
  </section></main>`;
  bindCommonActions();
  applyA11yClasses();
}

function startGame(daily = false) {
  if (!daily && save.currentGame?.version === 3 && save.currentGame.status === "playing" && save.currentGame.level === save.level) game = save.currentGame;
  else game = makeLevel(save.level, daily);
  renderGame();
}

function saveGame() {
  if (game && !game.daily && game.status === "playing") save.currentGame = game;
  persist();
}

function renderGame() {
  if (game.phase === "word") return renderWordGame();
  const app = document.querySelector("#app");
  const conflicts = getConflicts(game.cells, game.size);
  const openCount = game.cells.filter((cell) => !cell.given).length;
  const filled = game.cells.filter((cell) => !cell.given && cell.speciesId).length;
  const progress = Math.round((filled / openCount) * 65);
  const inventory = inventoryFor(game);
  app.innerHTML = `<main class="app-shell"><section class="screen game-screen logic-screen" aria-labelledby="level-title">
    ${gameHeader("1/2 · Kuş düzeni")}
    <div class="progress-wrap" aria-label="Bölüm ilerlemesi yüzde ${progress}"><div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div><div class="progress-label">${filled}/${openCount}</div></div>
    <aside class="mission-card ${missionComplete(game) ? "is-safe" : ""}"><span class="mission-medal">✦</span><div><strong>${game.mission.title}</strong><span>${game.mission.copy}</span></div></aside>
    <div class="logic-board-wrap">
      <div class="logic-board" style="--grid-size:${game.size}" role="grid" aria-label="Kuş yerleştirme bahçesi">${game.cells.map((cell) => cellMarkup(cell, conflicts)).join("")}</div>
      ${!save.onboardingSeen && game.level === 1 ? '<div class="coach-bubble" role="status"><strong>Her satır ve sütunda her kuş yalnızca bir kez bulunmalı.</strong><br>Önce aşağıdan bir kuş seç, sonra boş bir yuvaya dokun.</div>' : ""}
    </div>
    <section class="flock-section" aria-labelledby="flock-title"><div class="tray-label"><span id="flock-title">Yerleştirilecek kuşlar</span><span>${conflicts.size ? `${conflicts.size} çakışma` : "Düzen temiz"}</span></div><div class="bird-palette">${game.speciesIds.map((id) => paletteMarkup(id, inventory[id])).join("")}</div></section>
    <div class="power-row"><button class="power-button" data-action="undo" ${game.history.length ? "" : "disabled"}>${icon("undo")}<span>Geri al</span></button><button class="power-button" data-action="clear" ${conflicts.size && game.clears > 0 ? "" : "disabled"}>${icon("clear")}<span>Çakışmayı sil (${game.clears})</span></button><button class="power-button" data-action="hint" ${game.hints > 0 ? "" : "disabled"}>${icon("hint")}<span>İpucu (${game.hints})</span></button></div>
  </section></main>`;
  bindGameActions();
  applyA11yClasses();
}

function gameHeader(phase) {
  return `<header class="game-topbar"><button class="icon-button back-button" data-action="home" aria-label="Ana sayfaya dön">${icon("back")}</button><div class="level-heading"><h1 id="level-title">${game.daily ? "Günün şifresi" : `Bölüm ${game.level}`}</h1><p>${phase}</p></div><div class="score-pill" aria-label="${save.score} yaprak puanı">🍃 <span>${save.score}</span></div></header>`;
}

function cellMarkup(cell, conflicts) {
  const bird = cell.speciesId ? birdById(cell.speciesId) : null;
  const classes = ["logic-cell", cell.given ? "is-given" : "", conflicts.has(cell.index) ? "is-conflict" : "", bird ? "is-filled" : ""].filter(Boolean).join(" ");
  const label = bird ? `${cell.row + 1}. satır ${cell.col + 1}. sütun, ${bird.name}${cell.given ? ", sabit kuş" : ", değiştirmek için dokun"}` : `${cell.row + 1}. satır ${cell.col + 1}. sütun, boş yuva`;
  return `<button class="${classes}" data-cell="${cell.index}" role="gridcell" aria-label="${label}" ${cell.given ? "disabled" : ""}>${bird ? birdSvg(bird, true) : '<span class="nest-mark" aria-hidden="true">⌄</span>'}${cell.given ? '<span class="given-pin" aria-hidden="true">●</span>' : ""}</button>`;
}

function paletteMarkup(id, count) {
  const bird = birdById(id);
  const selected = game.selectedSpeciesId === id;
  return `<button class="palette-bird ${selected ? "is-selected" : ""}" data-species="${id}" ${count <= 0 ? "disabled" : ""} aria-pressed="${selected}" aria-label="${bird.name}, ${count} adet kaldı"><span>${birdSvg(bird, true)}</span><strong>${count}</strong></button>`;
}

function bindCommonActions() {
  document.querySelector('[data-action="settings"]')?.addEventListener("click", openSettings);
  document.querySelector('[data-action="play"]')?.addEventListener("click", () => startGame(false));
  document.querySelector('[data-action="daily"]')?.addEventListener("click", () => startGame(true));
  document.querySelector('[data-action="album"]')?.addEventListener("click", openAlbum);
}

function bindGameActions() {
  document.querySelectorAll("[data-species]").forEach((button) => button.addEventListener("click", () => selectSpecies(button.dataset.species)));
  document.querySelectorAll("[data-cell]").forEach((button) => button.addEventListener("click", () => placeBird(Number(button.dataset.cell))));
  document.querySelector('[data-action="home"]')?.addEventListener("click", () => { saveGame(); renderHome(); });
  document.querySelector('[data-action="undo"]')?.addEventListener("click", undoMove);
  document.querySelector('[data-action="clear"]')?.addEventListener("click", clearConflicts);
  document.querySelector('[data-action="hint"]')?.addEventListener("click", showHint);
}

function selectSpecies(id) {
  game.selectedSpeciesId = game.selectedSpeciesId === id ? null : id;
  playTone(390, .05);
  haptic(12);
  renderGame();
}

function rememberBoard() {
  game.history.push(game.cells.map((cell) => cell.speciesId));
  if (game.history.length > 60) game.history.shift();
}

async function placeBird(index) {
  if (game.busy || game.status !== "playing") return;
  const cell = game.cells[index];
  if (!cell || cell.given) return;
  if (!game.selectedSpeciesId && cell.speciesId) {
    rememberBoard();
    game.selectedSpeciesId = cell.speciesId;
    cell.speciesId = null;
    playTone(290, .05);
  } else if (game.selectedSpeciesId) {
    const inventory = inventoryFor(game);
    if (cell.speciesId !== game.selectedSpeciesId && inventory[game.selectedSpeciesId] <= 0) return showToast("Bu kuşların hepsi bahçede.");
    rememberBoard();
    cell.speciesId = game.selectedSpeciesId;
    const conflicts = getConflicts(game.cells, game.size);
    if (conflicts.has(index)) {
      game.conflictMoves += 1;
      playTone(210, .12);
      haptic([18, 30, 18]);
    } else {
      playTone(470, .06);
      haptic(14);
    }
    if (inventoryFor(game)[game.selectedSpeciesId] === 0) game.selectedSpeciesId = null;
  } else {
    showToast("Önce aşağıdan bir kuş seç.");
    return;
  }
  if (!save.onboardingSeen) save.onboardingSeen = true;
  renderGame();
  saveGame();
  if (isGridSolved(game)) {
    game.busy = true;
    playSuccessSound();
    await wait(settings.reduceMotion ? 1 : 650);
    beginWordChallenge();
  }
}

function undoMove() {
  const previous = game.history.pop();
  if (!previous || game.busy) return;
  game.cells.forEach((cell, index) => { cell.speciesId = previous[index]; });
  game.undoCount += 1;
  playTone(280, .05);
  renderGame();
  saveGame();
}

function clearConflicts() {
  const conflicts = getConflicts(game.cells, game.size);
  if (!conflicts.size || game.clears <= 0 || game.busy) return;
  rememberBoard();
  for (const index of conflicts) if (!game.cells[index].given) game.cells[index].speciesId = null;
  game.clears -= 1;
  game.helpsUsed += 1;
  game.selectedSpeciesId = null;
  showToast("Çakışan kuşlar sürüye döndü.");
  renderGame();
  saveGame();
}

function showHint() {
  if (game.hints <= 0 || game.busy) return;
  const candidate = game.cells.find((cell) => !cell.given && cell.speciesId !== cell.solutionId);
  if (!candidate) return;
  rememberBoard();
  const inventory = inventoryFor(game);
  if (inventory[candidate.solutionId] <= 0) {
    const donor = game.cells.find((cell) => !cell.given && cell.index !== candidate.index && cell.speciesId === candidate.solutionId && cell.speciesId !== cell.solutionId);
    if (donor) donor.speciesId = null;
  }
  candidate.speciesId = candidate.solutionId;
  game.hints -= 1;
  game.helpsUsed += 1;
  game.selectedSpeciesId = null;
  renderGame();
  document.querySelector(`[data-cell="${candidate.index}"]`)?.classList.add("is-hint");
  playTone(650, .12);
  saveGame();
  if (isGridSolved(game)) setTimeout(beginWordChallenge, settings.reduceMotion ? 20 : 700);
}

function beginWordChallenge() {
  game.phase = "word";
  game.busy = false;
  game.wordState ||= makeWordState(game.level, game.daily);
  renderWordGame();
  saveGame();
}

function renderWordGame() {
  const app = document.querySelector("#app");
  const word = game.wordState;
  const progress = 65 + Math.round((word.answer.length / word.word.length) * 35);
  app.innerHTML = `<main class="app-shell"><section class="screen game-screen word-screen" aria-labelledby="level-title">
    ${gameHeader("2/2 · Gizli sözcük")}
    <div class="progress-wrap"><div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div><div class="progress-label">${word.answer.length}/${word.word.length}</div></div>
    <article class="word-stage"><div class="word-kicker">Bahçe konuşuyor</div><h2>Gizli sözcüğü bul</h2><p class="word-clue">“${word.clue}”</p><div class="answer-slots" aria-label="Verilen cevap">${Array.from({ length: word.word.length }, (_, index) => `<span class="answer-slot ${word.answer[index] !== undefined ? "is-filled" : ""}">${word.answer[index] !== undefined ? word.letters[word.answer[index]].letter : ""}</span>`).join("")}</div><div class="letter-wheel" aria-label="Harfler">${word.letters.map((item, index) => `<button class="letter-button ${item.used ? "is-used" : ""}" data-letter="${index}" ${item.used ? "disabled" : ""} aria-label="${item.letter} harfi">${item.letter}</button>`).join("")}</div><p class="word-help">Harfleri doğru sırayla seç. Yanlış denemen puanını düşürmez.</p></article>
    ${!save.wordOnboardingSeen ? '<div class="word-coach" role="status">İpucunu oku ve harflere sırayla dokun. Bu bölümde süre sınırı yok.</div>' : ""}
    <div class="power-row word-actions"><button class="power-button" data-action="word-back" ${word.answer.length ? "" : "disabled"}>${icon("undo")}<span>Son harfi sil</span></button><button class="power-button" data-action="word-clear" ${word.answer.length ? "" : "disabled"}>${icon("clear")}<span>Temizle</span></button><button class="power-button" data-action="word-hint">${icon("hint")}<span>Harf ipucu</span></button></div>
  </section></main>`;
  document.querySelectorAll("[data-letter]").forEach((button) => button.addEventListener("click", () => chooseLetter(Number(button.dataset.letter))));
  document.querySelector('[data-action="word-back"]')?.addEventListener("click", removeLastLetter);
  document.querySelector('[data-action="word-clear"]')?.addEventListener("click", clearWord);
  document.querySelector('[data-action="word-hint"]')?.addEventListener("click", wordHint);
  document.querySelector('[data-action="home"]')?.addEventListener("click", () => { saveGame(); renderHome(); });
  applyA11yClasses();
}

async function chooseLetter(index) {
  const word = game.wordState;
  if (game.busy || word.letters[index].used) return;
  save.wordOnboardingSeen = true;
  word.letters[index].used = true;
  word.answer.push(index);
  playTone(430 + word.answer.length * 45, .06);
  renderWordGame();
  saveGame();
  if (word.answer.length !== word.word.length) return;
  const answer = word.answer.map((item) => word.letters[item].letter).join("");
  if (answer === word.word) {
    game.busy = true;
    playSuccessSound();
    await wait(settings.reduceMotion ? 1 : 700);
    finishLevel();
  } else {
    game.busy = true;
    word.attempts += 1;
    document.querySelector(".answer-slots")?.classList.add("is-wrong");
    haptic([30, 45, 30]);
    await wait(settings.reduceMotion ? 1 : 650);
    word.answer = [];
    word.letters.forEach((letter) => { letter.used = false; });
    game.busy = false;
    renderWordGame();
    showToast("Harfler henüz doğru sırada değil; yeniden düşün.");
    saveGame();
  }
}

function removeLastLetter() {
  const index = game.wordState.answer.pop();
  if (index === undefined) return;
  game.wordState.letters[index].used = false;
  renderWordGame();
  saveGame();
}

function clearWord() {
  game.wordState.answer = [];
  game.wordState.letters.forEach((letter) => { letter.used = false; });
  renderWordGame();
  saveGame();
}

function wordHint() {
  const word = game.wordState;
  const current = word.answer.map((index) => word.letters[index].letter).join("");
  if (!word.word.startsWith(current)) clearWord();
  const wanted = word.word[word.answer.length];
  const index = word.letters.findIndex((letter) => !letter.used && letter.letter === wanted);
  if (index < 0) return;
  word.hintUsed = true;
  game.helpsUsed += 1;
  showToast(`Sıradaki harf: ${wanted}`);
  chooseLetter(index);
}

function finishLevel() {
  game.status = "won";
  const missionStar = missionComplete(game) ? 1 : 0;
  const masteryStar = game.helpsUsed === 0 && game.wordState.attempts <= 1 ? 1 : 0;
  game.earnedStars = 1 + missionStar + masteryStar;
  if (!game.daily) {
    if (!save.completed.includes(game.level)) save.completed.push(game.level);
    save.stars += game.earnedStars;
    save.score += 60 + game.earnedStars * 20;
    for (const id of game.speciesIds) if (!save.discovered.includes(id)) save.discovered.push(id);
    save.level = Math.min(MAX_LEVEL, save.level + 1);
    save.currentGame = null;
  }
  persist();
  openResult();
}

function openResult() {
  const backdrop = document.createElement("div");
  const bird = birdById(game.speciesIds[(game.level + 1) % game.speciesIds.length]);
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal result-copy" role="dialog" aria-modal="true" aria-labelledby="result-title"><div class="result-illustration">${birdSvg(bird, true)}</div><div class="stars">${"★ ".repeat(game.earnedStars)}${"· ".repeat(3 - game.earnedStars)}</div><p class="eyebrow">${game.wordState.word} bulundu</p><h2 id="result-title">Şifre çözüldü!</h2><p>Kuş düzenini kurdun ve bahçenin gizli sözcüğünü açtın.${missionComplete(game) ? ` “${game.mission.title}” görevini de tamamladın.` : ""}</p><div class="result-breakdown"><span>Bulmaca</span><strong>+60</strong><span>Ustalık</span><strong>+${game.earnedStars * 20}</strong></div><div class="modal-actions"><button class="primary-button" data-result="primary">${game.daily || game.level === MAX_LEVEL ? "Ana bahçeye dön" : "Sonraki bölüme geç"}</button><button class="secondary-button" data-result="home">Ana sayfa</button></div></section>`;
  document.body.append(backdrop);
  backdrop.querySelector('[data-result="primary"]').addEventListener("click", () => { backdrop.remove(); if (game.daily || game.level === MAX_LEVEL) renderHome(); else { game = makeLevel(save.level); renderGame(); } });
  backdrop.querySelector('[data-result="home"]').addEventListener("click", () => { backdrop.remove(); renderHome(); });
  backdrop.querySelector("button")?.focus();
}

function levelSubtitle(level) {
  const names = ["Günışığı Bahçesi", "Ihlamur Yolu", "Gül Avlusu", "Sakin Göl", "Lavanta Tepesi", "Bülbül Korusu", "Zümrüt Vadi", "Safran Ovası", "Leylak Adası", "Çınar Köyü", "Yıldız Yaylası", "Sonsuz Bahçe"];
  const chapter = Math.min(names.length - 1, Math.floor((level - 1) / 100));
  return `${names[chapter]} · ${(level - 1) % 100 + 1}/100`;
}

function openSettings() {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div class="modal-head"><h2 id="settings-title">Rahatına göre</h2><button class="icon-button" data-close aria-label="Ayarları kapat">${icon("close")}</button></div><p>Görünümü ve oyun hissini istediğin gibi ayarla.</p><div class="settings-list">${settingToggle("sound", "Oyun sesleri", "Yumuşak seçim ve başarı sesleri")}${settingToggle("haptics", "Titreşim", "Dokunuşlarda hafif geri bildirim")}${settingToggle("largeText", "Büyük yazılar", "Metinleri daha rahat oku")}${settingToggle("highContrast", "Yüksek kontrast", "Kuşları ve yazıları daha belirgin göster")}${settingToggle("reduceMotion", "Hareketleri azalt", "Animasyonları en aza indir")}</div></section>`;
  document.body.append(backdrop);
  backdrop.querySelectorAll("input").forEach((input) => input.addEventListener("change", () => { settings[input.name] = input.checked; persist(); applyA11yClasses(); }));
  const close = () => backdrop.remove();
  backdrop.querySelector("[data-close]").addEventListener("click", close);
  backdrop.addEventListener("click", (event) => { if (event.target === backdrop) close(); });
  backdrop.querySelector("button")?.focus();
}

function openAlbum() {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal album-modal" role="dialog" aria-modal="true" aria-labelledby="album-title"><div class="modal-head"><div><p class="eyebrow">Keşif defteri</p><h2 id="album-title">Kuş albümü</h2></div><button class="icon-button" data-close aria-label="Albümü kapat">${icon("close")}</button></div><p>${save.discovered.length} kuşu yakından tanıdın. Yeni türler ilerleyen bahçelerde ortaya çıkacak.</p><div class="album-grid">${species.map((bird) => { const discovered = save.discovered.includes(bird.id); return `<article class="album-bird ${discovered ? "" : "is-locked"}" aria-label="${discovered ? bird.name : "Henüz keşfedilmemiş kuş"}"><div>${birdSvg(bird, true)}</div><strong>${discovered ? bird.name : "Yeni keşif"}</strong></article>`; }).join("")}</div></section>`;
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
  toastTimer = setTimeout(() => toast.remove(), 2800);
}

function haptic(pattern) { if (settings.haptics && navigator.vibrate) navigator.vibrate(pattern); }

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

function playSuccessSound() {
  playTone(520, .12);
  setTimeout(() => playTone(660, .14), 90);
  setTimeout(() => playTone(810, .18), 180);
}

function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

window.addEventListener("pagehide", saveGame);
if ("serviceWorker" in navigator && import.meta.env.PROD) window.addEventListener("load", () => navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL }).catch(() => {}));
renderHome();

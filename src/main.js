import "./styles.css";
import {
  makeLogicStage,
  makeWordStage,
  species,
  MAX_LEVEL,
  getConflicts,
  inventoryFor,
  isGridSolved,
  missionComplete,
  logicHintFor,
  gardenDay,
  stageForLevel
} from "./game-core.js";
import {
  applyFleetMove,
  defaultFleetVoyage,
  fleetMoveAdvice,
  fleetMissionComplete,
  fleetVessels,
  fleetVoyageFromGame,
  hasFleetMoves,
  makeFleetStage,
  normalizeFleetVoyage,
  resetFleetBoard,
  undoFleetMove,
  vesselForRank
} from "./fleet-core.js";
import {
  defaultVillage,
  villageBuildings,
  normalizeVillage,
  upgradeCost,
  canUpgrade,
  upgradeBuilding,
  stageReward,
  applyReward,
  idleGift,
  collectIdleGift
} from "./village-core.js";
import { backupFilename, parseBackup, stringifyBackup } from "./backup-core.js";
import {
  allowNativeScreenSleep,
  hideHomeBanner,
  isNativeApp,
  keepNativeScreenAwake,
  openPrivacyPolicy,
  registerNativeBackHandler,
  showHomeBanner,
  showPrivacyChoices,
  watchRewardedHintAd
} from "./native-shell.js";

const STORAGE_KEY = "kus-bahcesi-save-v1";
const SETTINGS_KEY = "kus-bahcesi-settings-v1";

const defaultSave = {
  level: 1,
  score: 0,
  stars: 0,
  completed: [],
  skipped: [],
  discovered: ["mavi", "nar", "limon"],
  onboardingSeen: false,
  wordOnboardingSeen: false,
  orderOnboardingSeen: false,
  villageSeen: false,
  skipOrders: true,
  dailyCompleted: [],
  village: defaultVillage,
  currentGame: null,
  hasStarted: false,
  logicTutorialDays: [],
  fleetTutorialSeen: false,
  fleetGesturePracticed: false,
  fleetVoyage: defaultFleetVoyage
};

const defaultSettings = {
  sound: true,
  haptics: true,
  keepAwake: true,
  largeText: false,
  highContrast: false,
  reduceMotion: false
};

const storedSaveHasStartedFlag = storedObjectHasOwn(STORAGE_KEY, "hasStarted");
let save = loadJson(STORAGE_KEY, defaultSave);
save.village = normalizeVillage(save.village);
save.skipped = Array.isArray(save.skipped) ? save.skipped : [];
save.logicTutorialDays = Array.isArray(save.logicTutorialDays) ? save.logicTutorialDays : [];
save.fleetVoyage = normalizeFleetVoyage(save.fleetVoyage);
if (!storedSaveHasStartedFlag) save.hasStarted = inferStartedState(save);
let settings = loadJson(SETTINGS_KEY, defaultSettings);
let game = null;
let toastTimer = null;
let resultTimer = null;
let resultCountdownTimer = null;
let audioContext = null;
let wakeLockSentinel = null;
let wakeLockRequestPending = false;
let nativeWakeLockActive = false;

if (migrateLegacyOrderGame()) persist();

function inferStartedState(value) {
  return value.level > 1
    || value.score > 0
    || value.completed.length > 0
    || value.skipped.length > 0
    || Boolean(value.currentGame?.history?.length || value.currentGame?.wordState?.answer?.length);
}

function loadJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return { ...fallback, ...(value || {}) };
  } catch {
    return structuredClone(fallback);
  }
}

function storedObjectHasOwn(key, field) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Boolean(value && Object.prototype.hasOwnProperty.call(value, field));
  } catch {
    return false;
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

function shipSvg(vessel, decorative = false) {
  const upper = {
    rowboat: `<path d="M36 48 64 33l28 15" fill="none" stroke="#8c5a35" stroke-width="5" stroke-linecap="round"/><path d="m35 36 67 34M104 36 42 70" stroke="#b97843" stroke-width="4" stroke-linecap="round"/>`,
    sailboat: `<path d="M68 13v45" stroke="#76543c" stroke-width="4"/><path d="m65 17-31 34h31Z" fill="${vessel.accent}"/><path d="m72 25 25 26H72Z" fill="#e16f5c"/>`,
    motorboat: `<path d="M49 48 60 31h35l13 17Z" fill="${vessel.accent}"/><rect x="68" y="35" width="20" height="10" rx="3" fill="#9ed5df"/><path d="M103 39h13" stroke="#e8b84f" stroke-width="4"/>`,
    fishing: `<rect x="54" y="31" width="42" height="22" rx="5" fill="${vessel.accent}"/><rect x="62" y="35" width="22" height="9" rx="2" fill="#9bd3dc"/><path d="M96 20v33m0-28h16l-8 13" fill="none" stroke="#75553e" stroke-width="3"/>`,
    yacht: `<path d="M45 49 58 31h45l13 18Z" fill="${vessel.accent}"/><path d="M64 34h31l8 12H57Z" fill="#eef8f4"/><path d="M70 37h20" stroke="#79b8cf" stroke-width="6"/>`,
    ferry: `<rect x="39" y="26" width="70" height="29" rx="5" fill="${vessel.accent}"/><path d="M46 34h55M46 43h55" stroke="#76adc1" stroke-width="6" stroke-dasharray="8 5"/><rect x="63" y="18" width="25" height="10" rx="3" fill="#f8f3df"/>`,
    cargo: `<rect x="39" y="35" width="21" height="17" fill="#e6a447"/><rect x="62" y="35" width="21" height="17" fill="#d96755"/><rect x="85" y="35" width="21" height="17" fill="#6aa58a"/><rect x="48" y="20" width="21" height="14" fill="#5c82aa"/><rect x="72" y="20" width="21" height="14" fill="#e4b14e"/>`,
    cruise: `<path d="M38 49 48 22h62l8 27Z" fill="${vessel.accent}"/><path d="M50 29h54M47 38h62" stroke="#77abc2" stroke-width="5" stroke-dasharray="6 4"/><rect x="69" y="12" width="24" height="11" rx="3" fill="#f7f4e7"/>`,
    liner: `<path d="M34 49 46 20h68l8 29Z" fill="${vessel.accent}"/><path d="M48 29h62M44 39h72" stroke="#82b4c8" stroke-width="5" stroke-dasharray="7 4"/><path d="M59 20v-9m20 9v-9m20 9v-9" stroke="#b95f4c" stroke-width="8"/>`,
    transatlantic: `<path d="M28 50 43 17h76l12 33Z" fill="${vessel.accent}"/><path d="M45 25h69M41 36h79M38 45h86" stroke="#72a9c1" stroke-width="5" stroke-dasharray="7 4"/><path d="M59 17V6m24 11V5m24 12V7" stroke="#ca674e" stroke-width="9"/><path d="M31 54h98" stroke="#e9bd55" stroke-width="4"/>`
  }[vessel.kind];
  return `<svg viewBox="0 0 140 90" role="img" aria-hidden="${decorative ? "true" : "false"}" ${decorative ? "" : `aria-label="${vessel.name}"`}>
    <ellipse cx="72" cy="78" rx="54" ry="6" fill="rgba(20,68,89,.16)"/>
    ${upper}
    <path d="M19 51h115c-5 15-17 24-35 27H50C35 72 25 63 19 51Z" fill="${vessel.color}"/>
    <path d="M29 58h93" stroke="rgba(255,255,255,.58)" stroke-width="4" stroke-linecap="round"/>
    <path d="M11 80c13-6 23 6 36 0s23 6 36 0 23 6 43 0" fill="none" stroke="#78bed0" stroke-width="4" stroke-linecap="round"/>
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
  void releaseWakeLock();
  void showHomeBanner();
  const app = document.querySelector("#app");
  const hero = species[(gardenDay(save.level) - 1) % species.length];
  const day = gardenDay(save.level);
  const mode = stageForLevel(save.level);
  const meta = stageMeta(mode);
  const route = ["logic", "fleet", "word"];
  const dayStep = route.indexOf(mode);
  const gift = idleGift(save.village);
  const journeyCount = save.completed.length + save.skipped.length;
  app.innerHTML = `<main class="app-shell"><section class="screen home-screen" aria-labelledby="home-title">
    <header class="home-topbar"><div class="brand-mark"><div class="brand-badge">${birdSvg(species[0], true)}</div><div><p class="eyebrow">Yaşayan bulmaca köyü</p><h1 class="brand-title" id="home-title">Kuş Köyü</h1></div></div><button class="icon-button" data-action="settings" aria-label="Ayarları aç">${icon("settings")}</button></header>
    <div class="resource-bar" aria-label="Köy kaynakları"><span title="Sağlam dal">🪵 <strong>${save.village.resources.dal}</strong></span><span title="Altın tohum">🌾 <strong>${save.village.resources.tohum}</strong></span><span title="Berrak damla">💧 <strong>${save.village.resources.damla}</strong></span><button data-action="village">Köyü geliştir</button></div>
    <article class="village-hero">
      <div class="village-sky" aria-hidden="true"><span class="village-sun">☀</span><span class="village-cloud">☁</span></div>
      <button class="village-house house-main" data-action="village" aria-label="Kuş Konağı seviye ${save.village.buildings.konak}"><span>🏡</span><strong>${save.village.buildings.konak}</strong></button>
      <button class="village-house house-green" data-action="village" aria-label="Günışığı Serası seviye ${save.village.buildings.sera}"><span>🌿</span><strong>${save.village.buildings.sera}</strong></button>
      <button class="village-house house-work" data-action="village" aria-label="Liman Atölyesi seviye ${save.village.buildings.atolye}"><span>⚓</span><strong>${save.village.buildings.atolye}</strong></button>
      <div class="village-path" aria-hidden="true"></div><div class="village-bird" aria-hidden="true">${birdSvg(hero, true)}</div>
      <div class="village-copy"><div class="hero-kicker">✦ BAHÇE GÜNÜ ${day}</div><h2>${meta.greeting}<br><span>${meta.title}</span></h2><p>${meta.copy}</p><button class="primary-button" data-action="play">${canResumeGame() ? "Kaldığın yerden devam et" : save.hasStarted ? `${meta.icon} ${meta.button}` : "▶ Oyuna başla"}</button></div>
    </article>
    ${gift ? `<button class="idle-gift" data-action="collect-gift"><span>🎁</span><div><strong>Kuşlar seni beklerken çalıştı</strong><small>${gift.hours} saatlik köy hediyesini topla</small></div><b>Topla</b></button>` : ""}
    <section class="day-route" aria-label="Bahçe Günü ${day} oyunları"><div class="day-route-head"><div><span>Bugünün üç oyunu</span><strong>${levelSubtitle(save.level)}</strong></div><em>${day}/400 gün</em></div><div class="route-steps">${route.map((id, index) => { const item = stageMeta(id); return `<div class="route-step ${index < dayStep ? "is-done" : index === dayStep ? "is-current" : ""}"><span>${index < dayStep ? "✓" : item.icon}</span><small>${item.short}</small></div>`; }).join("")}</div><div class="progress-track"><div class="progress-fill" style="width:${Math.max(1, (journeyCount / MAX_LEVEL) * 100)}%"></div></div></section>
    <div class="quick-grid quick-grid-three"><button class="quick-card" data-action="daily"><span class="mini-icon">☀️</span><strong>Günün görevi</strong><span>Her gün değişen özel bir köy bulmacası</span></button><button class="quick-card" data-action="album"><span class="mini-icon">🪶</span><strong>Kuş albümü</strong><span>${save.discovered.length} kuş keşfedildi</span></button><button class="quick-card" data-action="fleet-album"><span class="mini-icon">⚓</span><strong>Filo defteri</strong><span>${save.fleetVoyage.discovered.length}/10 gemi keşfedildi</span></button></div>
  </section></main>`;
  bindCommonActions();
  applyA11yClasses();
}

function startGame(daily = false) {
  if (migrateLegacyOrderGame()) persist();
  if (!daily && canResumeGame()) game = save.currentGame;
  else game = createStage(save.level, daily);
  save.hasStarted = true;
  persist();
  void hideHomeBanner();
  void requestWakeLock();
  renderGame();
}

function canResumeGame() {
  const saved = save.currentGame;
  return save.hasStarted
    && ((saved?.version === 4 && ["logic", "word"].includes(saved.mode)) || (saved?.version === 5 && saved.mode === "fleet"))
    && saved.status === "playing"
    && saved.level === save.level;
}

function migrateLegacyOrderGame() {
  let changed = false;
  if (!save.skipOrders) {
    save.skipOrders = true;
    changed = true;
  }
  if (save.currentGame?.mode === "order") {
    save.currentGame = null;
    changed = true;
  }
  return changed;
}

function createStage(level, daily = false) {
  const mode = stageForLevel(level, daily);
  const stage = mode === "logic"
    ? makeLogicStage(level, daily)
    : mode === "fleet"
      ? makeFleetStage(level, daily, new Date(), save.fleetVoyage)
      : makeWordStage(level, daily);
  stage.dateKey = new Date().toISOString().slice(0, 10);
  return stage;
}

function stageMeta(mode) {
  return {
    logic: { icon: "🧩", short: "Sabah", greeting: "Günaydın!", title: "Kuş Düzeni", button: "Kuşları yerleştir", copy: "Her satır ve sütunda kuşları dengeli biçimde yerleştir." },
    fleet: { icon: "⚓", short: "Öğle", greeting: "Liman canlanıyor", title: "Büyük Filo", button: "Filoyu büyüt", copy: "Aynı gemileri birleştir; kayıktan transatlantiğe uzanan filonu kur." },
    word: { icon: "🔤", short: "Akşam", greeting: "Bahçe fısıldıyor", title: "Gizli Sözcük", button: "Sözcüğü bul", copy: "İpucunu çöz, karışık harfleri anlamlı bir sözcüğe dönüştür." }
  }[mode];
}

function saveGame() {
  if (game && !game.daily && game.status === "playing") {
    save.currentGame = game;
    if (game.mode === "fleet") save.fleetVoyage = fleetVoyageFromGame(game);
  }
  persist();
}

function renderGame() {
  if (game.mode === "word") return renderWordGame();
  if (game.mode === "fleet") return renderFleetGame();
  const app = document.querySelector("#app");
  const conflicts = getConflicts(game.cells, game.size);
  const openCount = game.cells.filter((cell) => !cell.given).length;
  const filled = game.cells.filter((cell) => !cell.given && cell.speciesId).length;
  const progress = Math.round((filled / openCount) * 100);
  const inventory = inventoryFor(game);
  const tutorial = currentLogicTutorial();
  const hintAction = tutorial
    ? `<button class="power-button" disabled>${icon("hint")}<span>Ders sonrası ipucu</span></button>`
    : game.hints > 0
    ? `<button class="power-button" data-action="hint">${icon("hint")}<span>İpucu (${game.hints})</span></button>`
    : game.rewardedHintUsed
      ? `<button class="power-button" disabled>${icon("hint")}<span>İpuçları bitti</span></button>`
      : `<button class="power-button reward-hint-button" data-action="reward-hint">${icon("hint")}<span>30 sn reklam · +1</span></button>`;
  app.innerHTML = `<main class="app-shell"><section class="screen game-screen logic-screen" aria-labelledby="level-title">
    ${gameHeader("Sabah · Kuş düzeni")}
    <div class="progress-wrap" aria-label="Bölüm ilerlemesi yüzde ${progress}"><div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div><div class="progress-label">${filled}/${openCount}</div></div>
    ${tutorial ? tutorialMarkup(tutorial) : game.activeHint ? hintCoachMarkup(game.activeHint) : `<aside class="mission-card ${missionComplete(game) ? "is-safe" : ""}"><span class="mission-medal">✦</span><div><strong>${game.mission.title}</strong><span>${game.mission.copy}</span></div></aside>`}
    <div class="logic-board-wrap">
      <div class="logic-board" style="--grid-size:${game.size}" role="grid" aria-label="Kuş yerleştirme bahçesi">${game.cells.map((cell) => cellMarkup(cell, conflicts)).join("")}</div>
    </div>
    <section class="flock-section" aria-labelledby="flock-title"><div class="tray-label"><span id="flock-title">Yerleştirilecek kuşlar</span><span>${conflicts.size ? `${conflicts.size} çakışma` : "Düzen temiz"}</span></div><div class="bird-palette">${game.speciesIds.map((id) => paletteMarkup(id, inventory[id])).join("")}</div></section>
    <div class="power-row"><button class="power-button" data-action="undo" ${game.history.length ? "" : "disabled"}>${icon("undo")}<span>Geri al</span></button><button class="power-button" data-action="clear" ${conflicts.size && game.clears > 0 ? "" : "disabled"}>${icon("clear")}<span>Çakışmayı sil (${game.clears})</span></button>${hintAction}</div>
  </section></main>`;
  bindGameActions();
  applyA11yClasses();
}

function gameHeader(phase) {
  return `<header class="game-topbar"><button class="icon-button back-button" data-action="home" aria-label="Kuş Köyüne dön">${icon("back")}</button><div class="level-heading"><h1 id="level-title">${game.daily ? "Günün görevi" : `Bahçe Günü ${game.day}`}</h1><p>${phase}</p></div><div class="score-pill" aria-label="${save.score} yaprak puanı">🍃 <span>${save.score}</span></div></header>`;
}

function cellMarkup(cell, conflicts) {
  const bird = cell.speciesId ? birdById(cell.speciesId) : null;
  const tutorial = currentLogicTutorial();
  const guided = (tutorial && tutorial.step >= 1 && tutorial.targetIndex === cell.index) || game.activeHint?.targetIndex === cell.index;
  const classes = ["logic-cell", cell.given ? "is-given" : "", conflicts.has(cell.index) ? "is-conflict" : "", bird ? "is-filled" : "", guided ? "is-guided" : ""].filter(Boolean).join(" ");
  const label = bird ? `${cell.row + 1}. satır ${cell.col + 1}. sütun, ${bird.name}${cell.given ? ", sabit kuş" : ", değiştirmek için dokun"}` : `${cell.row + 1}. satır ${cell.col + 1}. sütun, boş yuva`;
  return `<button class="${classes}" data-cell="${cell.index}" role="gridcell" aria-label="${label}" ${cell.given ? "disabled" : ""}>${bird ? birdSvg(bird, true) : '<span class="nest-mark" aria-hidden="true">⌄</span>'}${cell.given ? '<span class="given-pin" aria-hidden="true">●</span>' : ""}</button>`;
}

function paletteMarkup(id, count) {
  const bird = birdById(id);
  const selected = game.selectedSpeciesId === id;
  const tutorial = currentLogicTutorial();
  const guided = (tutorial && tutorial.step >= 1 && tutorial.speciesId === id) || game.activeHint?.speciesId === id;
  return `<button class="palette-bird ${selected ? "is-selected" : ""} ${guided ? "is-guided" : ""}" data-species="${id}" ${count <= 0 ? "disabled" : ""} aria-pressed="${selected}" aria-label="${bird.name}, ${count} adet kaldı"><span>${birdSvg(bird, true)}</span><strong>${count}</strong></button>`;
}

function currentLogicTutorial() {
  if (!game || game.mode !== "logic" || game.day > 2 || save.logicTutorialDays.includes(game.day)) return null;
  const target = game.cells[game.tutorialTargetIndex];
  if (!target) return null;
  const bird = birdById(target.solutionId);
  return {
    day: game.day,
    step: Number(game.tutorialStep || 0),
    targetIndex: target.index,
    speciesId: target.solutionId,
    bird,
    row: target.row + 1,
    col: target.col + 1
  };
}

function tutorialMarkup(tutorial) {
  const lesson = tutorial.day === 1 ? "Ders 1/2" : "Ders 2/2";
  const line = tutorial.day === 1 ? `${tutorial.row}. satıra` : `${tutorial.col}. sütuna`;
  const rule = tutorial.day === 1 ? "İlk derste bir satırdaki eksik kuşu bulacağız." : "Şimdi aynı eleme yöntemini bir sütunda kullanacağız.";
  if (tutorial.step === 0) return `<aside class="tutorial-card" role="status"><span class="tutorial-badge">${lesson}</span><div><strong>Her kuş, her satır ve sütunda yalnızca bir kez bulunur.</strong><span>${rule}</span></div><button data-tutorial="start">Birlikte yapalım</button></aside>`;
  if (tutorial.step === 1) return `<aside class="tutorial-card" role="status"><span class="tutorial-badge">${lesson}</span><div><strong>${line} bak: eksik kuş ${tutorial.bird.name}.</strong><span>Bu çizgideki diğer kuşlar zaten kullanıldı. Aşağıda parlayan ${tutorial.bird.name} kuşunu seç.</span></div></aside>`;
  if (tutorial.step === 2) return `<aside class="tutorial-card" role="status"><span class="tutorial-badge">${lesson}</span><div><strong>Şimdi parlayan yuvaya dokun.</strong><span>${tutorial.row}. satır, ${tutorial.col}. sütunda ${tutorial.bird.name} tekrara yol açmıyor.</span></div></aside>`;
  return `<aside class="tutorial-card is-success" role="status"><span class="tutorial-badge">✓</span><div><strong>Harika! Kuşu neden oraya koyduğunu artık biliyorsun.</strong><span>Her boş yuvada satır ve sütundaki kuşları ele; geriye kalan doğru seçimdir.</span></div><button data-tutorial="finish">Kendim devam edeceğim</button></aside>`;
}

function hintCoachMarkup(hint) {
  return `<aside class="hint-coach" role="status"><span>${icon("hint")}</span><div><strong>${hint.title}</strong><small>${hint.copy}</small></div></aside>`;
}

function bindCommonActions() {
  document.querySelector('[data-action="settings"]')?.addEventListener("click", openSettings);
  document.querySelector('[data-action="play"]')?.addEventListener("click", () => startGame(false));
  document.querySelector('[data-action="daily"]')?.addEventListener("click", () => startGame(true));
  document.querySelector('[data-action="album"]')?.addEventListener("click", openAlbum);
  document.querySelector('[data-action="fleet-album"]')?.addEventListener("click", openFleetAlbum);
  document.querySelectorAll('[data-action="village"]').forEach((button) => button.addEventListener("click", openVillage));
  document.querySelector('[data-action="collect-gift"]')?.addEventListener("click", collectGift);
}

function bindGameActions() {
  document.querySelectorAll("[data-species]").forEach((button) => button.addEventListener("click", () => selectSpecies(button.dataset.species)));
  document.querySelectorAll("[data-cell]").forEach((button) => button.addEventListener("click", () => placeBird(Number(button.dataset.cell))));
  document.querySelector('[data-action="home"]')?.addEventListener("click", () => { saveGame(); renderHome(); });
  document.querySelector('[data-action="undo"]')?.addEventListener("click", undoMove);
  document.querySelector('[data-action="clear"]')?.addEventListener("click", clearConflicts);
  document.querySelector('[data-action="hint"]')?.addEventListener("click", showHint);
  document.querySelector('[data-action="reward-hint"]')?.addEventListener("click", openRewardedHintConfirmation);
  document.querySelector('[data-tutorial="start"]')?.addEventListener("click", () => {
    game.tutorialStep = 1;
    renderGame();
    saveGame();
  });
  document.querySelector('[data-tutorial="finish"]')?.addEventListener("click", finishLogicTutorial);
}

function selectSpecies(id) {
  const tutorial = currentLogicTutorial();
  if (tutorial && tutorial.step === 0) return showToast("Önce ‘Birlikte yapalım’ düğmesine dokun.");
  if (tutorial && tutorial.step === 1 && id !== tutorial.speciesId) return showToast(`Bu derste ${tutorial.bird.name} kuşunu arıyoruz.`);
  if (tutorial && tutorial.step === 2) return showToast("Şimdi parlayan yuvaya dokun.");
  if (tutorial && tutorial.step === 3) return showToast("Önce öğretici kartını tamamla.");
  game.selectedSpeciesId = game.selectedSpeciesId === id ? null : id;
  if (tutorial && tutorial.step === 1 && id === tutorial.speciesId) game.tutorialStep = 2;
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
  const tutorial = currentLogicTutorial();
  if (tutorial && tutorial.step === 3) return showToast("Önce ‘Kendim devam edeceğim’ düğmesine dokun.");
  if (tutorial && tutorial.step < 2) return showToast("Önce parlayan kuşu seç.");
  if (tutorial && tutorial.step === 2 && index !== tutorial.targetIndex) return showToast("Bu derste parlayan yuvaya dokun.");
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
  game.activeHint = null;
  if (tutorial && tutorial.step === 2 && index === tutorial.targetIndex && cell.speciesId === tutorial.speciesId) game.tutorialStep = 3;
  renderGame();
  saveGame();
  if (isGridSolved(game)) {
    game.busy = true;
    playSuccessSound();
    await wait(settings.reduceMotion ? 1 : 650);
    finishStage();
  }
}

function finishLogicTutorial() {
  const tutorial = currentLogicTutorial();
  if (!tutorial || tutorial.step !== 3) return;
  if (!save.logicTutorialDays.includes(tutorial.day)) save.logicTutorialDays.push(tutorial.day);
  save.onboardingSeen = true;
  game.selectedSpeciesId = null;
  playSuccessSound();
  renderGame();
  saveGame();
}

function undoMove() {
  const previous = game.history.pop();
  if (!previous || game.busy) return;
  game.cells.forEach((cell, index) => { cell.speciesId = previous[index]; });
  const tutorial = currentLogicTutorial();
  if (tutorial?.step === 3) {
    game.tutorialStep = 1;
    game.selectedSpeciesId = null;
  }
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
  game.activeHint = null;
  showToast("Çakışan kuşlar sürüye döndü.");
  renderGame();
  saveGame();
}

function showHint() {
  if (currentLogicTutorial()) return showToast("Önce kısa dersi tamamla; üç ipucun korunacak.");
  if (game.hints <= 0 || game.busy) return;
  const hint = logicHintFor(game);
  if (!hint) return showToast("Bahçe zaten doğru görünüyor.");
  game.hints -= 1;
  game.helpsUsed += 1;
  game.hintTrail = { targetIndex: hint.targetIndex, step: hint.step };
  game.activeHint = hint;
  game.selectedSpeciesId = null;
  renderGame();
  playTone(650, .12);
  saveGame();
}

function openRewardedHintConfirmation() {
  if (game.hints > 0 || game.rewardedHintUsed || game.busy) return;
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="reward-hint-title"><div class="confirm-icon" aria-hidden="true">💡</div><h2 id="reward-hint-title">Bir ipucu daha ister misin?</h2><p>Yaklaşık 30 saniyelik ödüllü reklamı sonuna kadar izlersen bir ek düşünme ipucu kazanırsın.</p><div class="modal-actions"><button class="primary-button" data-watch-hint-ad>Reklamı izle · +1 ipucu</button><button class="secondary-button" data-cancel-hint-ad>Şimdi değil</button></div></section>`;
  document.body.append(backdrop);
  const close = () => backdrop.remove();
  backdrop.querySelector("[data-cancel-hint-ad]").addEventListener("click", close);
  backdrop.querySelector("[data-watch-hint-ad]").addEventListener("click", async () => {
    const button = backdrop.querySelector("[data-watch-hint-ad]");
    button.disabled = true;
    button.textContent = "Reklam hazırlanıyor…";
    const earned = await watchRewardedHintAd();
    if (!earned) {
      button.disabled = false;
      button.textContent = "Tekrar dene · +1 ipucu";
      showToast("Reklam şu anda hazır değil; ipucu hakkın harcanmadı.");
      return;
    }
    game.hints = 1;
    game.rewardedHintUsed = true;
    close();
    renderGame();
    saveGame();
    showToast("Bir ek ipucu kazandın.");
  });
  backdrop.querySelector("[data-watch-hint-ad]").focus();
}

function renderFleetGame() {
  const app = document.querySelector("#app");
  if (!Number.isInteger(game.tutorialMoves)) game.tutorialMoves = 0;
  if (!game.fleetFeedback || typeof game.fleetFeedback !== "object") game.fleetFeedback = null;
  const progress = Math.min(100, Math.round((game.merges / game.targetMerges) * 100));
  const best = vesselForRank(game.bestRank);
  const remaining = Math.max(0, game.targetMerges - game.merges);
  const gestureCoach = !save.fleetGesturePracticed ? fleetGestureCoachMarkup() : "";
  app.innerHTML = `<main class="app-shell"><section class="screen game-screen fleet-screen" aria-labelledby="level-title">
    ${gameHeader("Öğle · Büyük Filo")}
    <div class="fleet-progress-summary"><div class="progress-wrap" aria-label="Bugünkü hedefte ${game.merges} birleşme tamamlandı, ${remaining} birleşme kaldı"><div class="progress-track fleet-progress"><div class="progress-fill" style="width:${progress}%"></div></div><div class="progress-label">${game.merges} / ${game.targetMerges}</div></div><strong>${remaining ? `Hedefe ${remaining} birleşme kaldı` : "Hedef tamamlandı"}</strong></div>
    <aside class="fleet-mission"><div class="fleet-best">${shipSvg(best, true)}</div><div><div class="fleet-mission-head"><span>Bugünkü sefer</span><button class="fleet-help-button" data-action="fleet-help" aria-label="Büyük Filo nasıl oynanır?">? Nasıl oynanır</button></div><strong>Aynı gemileri birleştir</strong><small>En büyük gemin: ${best.name} · Filo puanın: ${game.totalScore}</small></div></aside>
    ${fleetMergeGuideMarkup()}
    <div class="fleet-board-wrap"><div class="fleet-board-stage">${gestureCoach}<div class="fleet-board ${gestureCoach ? "is-learning-swipe" : ""} ${game.lastDirection ? `fleet-move-${game.lastDirection}` : ""}" role="grid" aria-label="Büyük Filo oyun alanı. Gemileri taşımak için denizin üzerinde parmağını kaydır.">${game.board.map((rank, index) => fleetTileMarkup(rank, index)).join("")}</div></div><p class="fleet-swipe-help"><strong>Oynamak için mavi denizin üzerinde parmağını kaydır.</strong><span>Bütün gemiler seçtiğin yöne gider. Her hamlede yeni bir Kayık gelebilir.</span></p></div>
    ${fleetFeedbackMarkup()}
    <div class="power-row fleet-actions"><button class="power-button" data-action="fleet-undo" ${game.history.length ? "" : "disabled"}>${icon("undo")}<span>Geri al</span></button><button class="power-button" data-action="fleet-album">⚓<span>Filo defteri</span></button></div>
  </section></main>`;
  document.querySelector('[data-action="fleet-undo"]')?.addEventListener("click", () => {
    if (!undoFleetMove(game)) return;
    game.fleetFeedback = { kind: "info", title: "Son hamle geri alındı", copy: "Gemilerin ve puanın bir önceki durumuna döndü." };
    playTone(280, .05);
    renderFleetGame();
    saveGame();
  });
  document.querySelector('[data-action="fleet-help"]')?.addEventListener("click", () => openFleetHelp(false));
  document.querySelector('[data-action="fleet-album"]')?.addEventListener("click", openFleetAlbum);
  document.querySelector('[data-action="home"]')?.addEventListener("click", () => { saveGame(); renderHome(); });
  const board = document.querySelector(".fleet-board-stage");
  let startPoint = null;
  board.addEventListener("pointerdown", (event) => {
    startPoint = { x: event.clientX, y: event.clientY };
    board.setPointerCapture?.(event.pointerId);
  });
  board.addEventListener("pointerup", (event) => {
    if (!startPoint) return;
    const dx = event.clientX - startPoint.x;
    const dy = event.clientY - startPoint.y;
    startPoint = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    moveFleet(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
  });
  board.addEventListener("pointercancel", () => { startPoint = null; });
  applyA11yClasses();
  game.lastDirection = null;
  if (!save.fleetTutorialSeen) openFleetHelp(true);
}

function fleetTileMarkup(rank, index) {
  if (!rank) return `<div class="fleet-tile is-empty" role="gridcell" aria-label="Boş deniz karesi"></div>`;
  const vessel = vesselForRank(rank);
  return `<div class="fleet-tile fleet-rank-${rank}" role="gridcell" aria-label="${vessel.name}, ${vessel.rank}. gemi kademesi" style="--fleet-color:${vessel.color};--fleet-accent:${vessel.accent}">${shipSvg(vessel, true)}<strong>${vessel.short}</strong></div>`;
}

const fleetDirectionMeta = {
  left: { label: "sola", arrow: "←" },
  right: { label: "sağa", arrow: "→" },
  up: { label: "yukarı", arrow: "↑" },
  down: { label: "aşağı", arrow: "↓" }
};

function fleetGestureCoachMarkup() {
  const direction = fleetMoveAdvice(game.board) || "left";
  const meta = fleetDirectionMeta[direction];
  return `<div class="fleet-gesture-coach direction-${direction}" role="status"><strong>Şimdi sen dene</strong><span>Parmağını denizin üzerinde <b>${meta.label}</b> kaydır</span><div class="fleet-gesture-demo" aria-hidden="true"><span class="fleet-finger">☝️</span><span class="fleet-gesture-arrow">${meta.arrow}</span></div></div>`;
}

function fleetMergeGuideMarkup() {
  const counts = new Map();
  game.board.forEach((rank) => { if (rank) counts.set(rank, (counts.get(rank) || 0) + 1); });
  const sourceRank = [...counts].find(([rank, count]) => count >= 2 && rank < fleetVessels.length)?.[0] || 1;
  const source = vesselForRank(sourceRank);
  const result = vesselForRank(Math.min(fleetVessels.length, sourceRank + 1));
  return `<aside class="fleet-merge-guide" aria-label="Birleşme örneği: iki ${source.name}, ${result.name} olur"><div class="fleet-guide-ship">${shipSvg(source, true)}</div><span class="fleet-guide-plus">+</span><div class="fleet-guide-ship">${shipSvg(source, true)}</div><span class="fleet-guide-equals">=</span><div class="fleet-guide-ship is-result">${shipSvg(result, true)}</div><div class="fleet-guide-copy"><strong>Aynı iki gemiyi buluştur</strong><span>İki ${source.short} birleşince ${result.short} olur.</span></div></aside>`;
}

function fleetFeedbackMarkup() {
  if (!game.fleetFeedback) return '<div class="fleet-feedback is-quiet" role="status" aria-live="polite"><strong>Hamleni bekliyorum</strong><span>Denizin üzerinde parmağını bir yöne kaydır.</span></div>';
  return `<div class="fleet-feedback is-${game.fleetFeedback.kind}" role="status" aria-live="polite"><strong>${game.fleetFeedback.title}</strong><span>${game.fleetFeedback.copy}</span></div>`;
}

function openFleetHelp(firstVisit = false) {
  if (document.querySelector("[data-fleet-help]")) return;
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.dataset.fleetHelp = "";
  let step = 0;
  const renderStep = () => {
    const kayik = vesselForRank(1);
    const sandal = vesselForRank(2);
    const pages = [
      { kicker: "1 · Hareket", title: "Denizin üzerinde kaydır", visual: '<div class="fleet-help-swipe" aria-hidden="true"><span>☝️</span><b>←</b><b>↑</b><b>→</b><b>↓</b></div>', copy: "Parmağını mavi oyun alanına koy. Sola, sağa, yukarı veya aşağı kaydır. Bütün gemiler birlikte hareket eder." },
      { kicker: "2 · Birleştirme", title: "Aynı gemiler büyür", visual: `<div class="fleet-help-merge" aria-hidden="true"><div>${shipSvg(kayik, true)}</div><b>+</b><div>${shipSvg(kayik, true)}</div><b>=</b><div>${shipSvg(sandal, true)}</div></div>`, copy: "İki aynı gemiyi birbirine doğru kaydır. İki Minik Kayık birleşince Yelkenli Sandal olur." },
      { kicker: "3 · Rahatça oyna", title: "Süre ve hak sınırı yok", visual: '<div class="fleet-help-comfort" aria-hidden="true"><span>🎯<b>Hedefi doldur</b></span><span>↶<b>İstersen geri al</b></span></div>', copy: `Bugünkü hedef ${game.targetMerges} birleşme. Yanlış hamlede puanın silinmez; “Geri al” ile son hamleni düzeltebilirsin.` }
    ];
    const page = pages[step];
    backdrop.innerHTML = `<section class="modal fleet-help-modal" role="dialog" aria-modal="true" aria-labelledby="fleet-help-title">${firstVisit ? "" : `<button class="icon-button fleet-help-close" data-close-fleet-help aria-label="Nasıl oynanır penceresini kapat">${icon("close")}</button>`}<p class="eyebrow">${page.kicker}</p><h2 id="fleet-help-title">${page.title}</h2>${page.visual}<p>${page.copy}</p><div class="fleet-help-dots" aria-label="${step + 1}. anlatım sayfası">${pages.map((_, index) => `<span class="${index === step ? "is-current" : ""}"></span>`).join("")}</div><div class="modal-actions fleet-help-actions">${step ? '<button class="secondary-button" data-fleet-help-back>Geri</button>' : ""}<button class="primary-button" data-fleet-help-next>${step === pages.length - 1 ? (firstVisit ? "Denizde dene" : "Oyuna dön") : "Devam"}</button></div></section>`;
    backdrop.querySelector("[data-close-fleet-help]")?.addEventListener("click", () => backdrop.remove());
    backdrop.querySelector("[data-fleet-help-back]")?.addEventListener("click", () => { step -= 1; renderStep(); });
    backdrop.querySelector("[data-fleet-help-next]").addEventListener("click", () => {
      if (step < pages.length - 1) { step += 1; renderStep(); return; }
      if (firstVisit) {
        save.fleetTutorialSeen = true;
        persist();
      }
      backdrop.remove();
      document.querySelector(".fleet-board")?.focus?.();
    });
    backdrop.querySelector("[data-fleet-help-next]").focus();
  };
  document.body.append(backdrop);
  renderStep();
}

async function moveFleet(direction) {
  if (game.busy || game.status !== "playing") return;
  const previousBest = game.bestRank;
  const result = applyFleetMove(game, direction);
  if (!result.moved) {
    game.fleetFeedback = { kind: "notice", title: "Bu yönde hareket yok", copy: "Başka bir yöne kaydır. Puanın ve hakkın kaybolmadı." };
    playTone(190, .07);
    haptic(18);
    renderFleetGame();
    saveGame();
    if (!hasFleetMoves(game.board)) openFleetRescue();
    return;
  }
  game.tutorialMoves += 1;
  if (game.tutorialMoves >= 2) save.fleetGesturePracticed = true;
  const remaining = Math.max(0, game.targetMerges - game.merges);
  if (result.merges === 1) {
    const created = vesselForRank(result.createdRanks[0]);
    const source = vesselForRank(result.createdRanks[0] - 1);
    game.fleetFeedback = { kind: "success", title: `${created.name} oluştu!`, copy: `İki ${source.short} birleşti. ${remaining ? `Hedefe ${remaining} birleşme kaldı.` : "Bugünkü hedef tamamlandı."}` };
  } else if (result.merges > 1) {
    game.fleetFeedback = { kind: "success", title: `${result.merges} çift gemi birleşti!`, copy: remaining ? `Harika hamle. Hedefe ${remaining} birleşme kaldı.` : "Harika hamle. Bugünkü hedef tamamlandı." };
  } else {
    const meta = fleetDirectionMeta[direction];
    game.fleetFeedback = { kind: "info", title: `Gemiler ${meta.label} kaydı`, copy: "Bu hamlede birleşme olmadı. Aynı iki gemiyi buluşturmaya çalış." };
  }
  game.lastDirection = direction;
  playTone(result.merges ? 560 : 380, .06);
  haptic(result.merges ? [12, 20, 12] : 10);
  renderFleetGame();
  saveGame();
  if (game.bestRank > previousBest) {
    const vessel = vesselForRank(game.bestRank);
    showToast(`Yeni gemi keşfedildi: ${vessel.name}!`);
    playSuccessSound();
  }
  if (fleetMissionComplete(game)) {
    game.busy = true;
    await wait(settings.reduceMotion ? 1 : 600);
    finishStage();
    return;
  }
  if (!hasFleetMoves(game.board)) openFleetRescue();
}

function openFleetRescue() {
  if (document.querySelector("[data-fleet-rescue]")) return;
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal confirm-modal" data-fleet-rescue role="dialog" aria-modal="true" aria-labelledby="fleet-rescue-title"><div class="confirm-icon" aria-hidden="true">⚓</div><h2 id="fleet-rescue-title">Liman doldu</h2><p>Bu seferde hareket kalmadı. Keşfettiğin gemiler ve puanın korunacak; limanı yeniden düzenleyebilirsin.</p><div class="modal-actions"><button class="primary-button" data-reset-fleet>Limanda yeniden başla</button><button class="secondary-button" data-fleet-home>Şimdi ara ver</button></div></section>`;
  document.body.append(backdrop);
  backdrop.querySelector("[data-reset-fleet]").addEventListener("click", () => {
    resetFleetBoard(game);
    backdrop.remove();
    renderFleetGame();
    saveGame();
  });
  backdrop.querySelector("[data-fleet-home]").addEventListener("click", () => {
    backdrop.remove();
    saveGame();
    renderHome();
  });
  backdrop.querySelector("[data-reset-fleet]").focus();
}

function renderWordGame() {
  const app = document.querySelector("#app");
  const word = game.wordState;
  if (!Number.isInteger(game.hints)) game.hints = 3;
  if (!Number.isInteger(game.hintStep)) game.hintStep = 0;
  const progress = Math.round((word.answer.length / word.word.length) * 100);
  const hintAction = game.hints > 0
    ? `<button class="power-button" data-action="word-hint">${icon("hint")}<span>İpucu (${game.hints})</span></button>`
    : game.rewardedHintUsed
      ? `<button class="power-button" disabled>${icon("hint")}<span>İpuçları bitti</span></button>`
      : `<button class="power-button reward-hint-button" data-action="reward-hint">${icon("hint")}<span>30 sn reklam · +1</span></button>`;
  app.innerHTML = `<main class="app-shell"><section class="screen game-screen word-screen" aria-labelledby="level-title">
    ${gameHeader("Akşam · Gizli sözcük")}
    <div class="progress-wrap"><div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div><div class="progress-label">${word.answer.length}/${word.word.length}</div></div>
    <article class="word-stage"><div class="word-kicker">Bahçe konuşuyor</div><h2>Gizli sözcüğü bul</h2><p class="word-clue">“${word.clue}”</p><div class="answer-slots" aria-label="Verilen cevap">${Array.from({ length: word.word.length }, (_, index) => `<span class="answer-slot ${word.answer[index] !== undefined ? "is-filled" : ""}">${word.answer[index] !== undefined ? word.letters[word.answer[index]].letter : ""}</span>`).join("")}</div><div class="letter-wheel" aria-label="Harfler">${word.letters.map((item, index) => `<button class="letter-button ${item.used ? "is-used" : ""}" data-letter="${index}" ${item.used ? "disabled" : ""} aria-label="${item.letter} harfi">${item.letter}</button>`).join("")}</div><p class="word-help">Harfleri doğru sırayla seç. Yanlış denemen puanını düşürmez.</p></article>
    ${game.activeHint ? `<div class="word-coach word-hint-coach" role="status"><strong>${game.activeHint.title}</strong><span>${game.activeHint.copy}</span></div>` : !save.wordOnboardingSeen ? '<div class="word-coach" role="status">İpucunu oku ve harflere sırayla dokun. “Geri al” ile son harfi istediğin zaman kaldırabilirsin.</div>' : ""}
    <div class="power-row word-actions"><button class="power-button" data-action="word-back" ${word.answer.length ? "" : "disabled"}>${icon("undo")}<span>Geri al</span></button><button class="power-button" data-action="word-clear" ${word.answer.length ? "" : "disabled"}>${icon("clear")}<span>Temizle</span></button>${hintAction}</div>
  </section></main>`;
  document.querySelectorAll("[data-letter]").forEach((button) => button.addEventListener("click", () => chooseLetter(Number(button.dataset.letter))));
  document.querySelector('[data-action="word-back"]')?.addEventListener("click", removeLastLetter);
  document.querySelector('[data-action="word-clear"]')?.addEventListener("click", clearWord);
  document.querySelector('[data-action="word-hint"]')?.addEventListener("click", wordHint);
  document.querySelector('[data-action="reward-hint"]')?.addEventListener("click", openRewardedHintConfirmation);
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
    finishStage();
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
  if (game.hints <= 0 || game.busy) return;
  const step = Math.min(3, game.hintStep || 0);
  const vowels = [...new Set([...word.word].filter((letter) => "AEIİOÖUÜ".includes(letter)))];
  const hints = [
    { title: "Başlangıcı düşün", copy: `Aradığın sözcük ${word.word[0]} harfiyle başlıyor.` },
    { title: "Sonunu yakala", copy: `Sözcüğün son harfi ${word.word.at(-1)}.` },
    { title: "Sesini dinle", copy: vowels.length ? `Sözcükte ${vowels.join(", ")} sesli harfleri bulunuyor.` : "Bu sözcükte sesli harf bulunmuyor." },
    { title: "Ek düşünme ipucu", copy: `İlk iki harf ${word.word.slice(0, 2)}. Harfleri kutulara yine sen yerleştir.` }
  ];
  word.hintUsed = true;
  game.helpsUsed += 1;
  game.hints -= 1;
  game.hintStep = step + 1;
  game.activeHint = hints[step];
  playTone(650, .12);
  renderWordGame();
  saveGame();
}

function finishStage() {
  game.status = "won";
  game.busy = false;
  if (game.mode === "fleet") save.fleetVoyage = fleetVoyageFromGame(game);
  const careful = game.mode === "logic"
    ? missionComplete(game)
    : game.mode === "fleet"
      ? game.undoCount <= 1
      : game.wordState.attempts <= 1;
  const mastery = game.helpsUsed === 0;
  game.earnedStars = 1 + (careful ? 1 : 0) + (mastery ? 1 : 0);
  game.completedDay = !game.daily && game.level % 3 === 0;
  const rewardAllowed = !game.daily || !save.dailyCompleted.includes(game.dateKey);
  game.reward = rewardAllowed ? stageReward(game.mode, save.village, game.completedDay) : { dal: 0, tohum: 0, damla: 0 };
  if (rewardAllowed) {
    applyReward(save.village, game.reward);
    save.score += 35 + game.earnedStars * 15;
  }
  if (game.daily) {
    if (rewardAllowed) save.dailyCompleted.push(game.dateKey);
  } else {
    if (!save.completed.includes(game.level)) save.completed.push(game.level);
    save.stars += game.earnedStars;
    if (game.mode === "logic") for (const id of game.speciesIds) if (!save.discovered.includes(id)) save.discovered.push(id);
    save.level = Math.min(MAX_LEVEL, save.level + 1);
    save.currentGame = null;
    migrateLegacyOrderGame();
  }
  persist();
  openResult();
}

function openResult() {
  clearResultTimers();
  const backdrop = document.createElement("div");
  const bird = species[(game.level + 1) % species.length];
  const result = game.mode === "logic"
    ? { kicker: "Kuş düzeni tamamlandı", title: "Bahçe dengelendi!", copy: "Her kuş doğru yerini buldu. Köyün yeni yapıları için sağlam dallar kazandın." }
    : game.mode === "fleet"
      ? { kicker: `${game.merges} başarılı birleşme`, title: "Filo büyüdü!", copy: `${vesselForRank(game.bestRank).name} limana öncülük ediyor. Yolculuğun bir sonraki seferde aynı filoyla sürecek.` }
      : { kicker: `${game.wordState.word} bulundu`, title: "Bahçe konuştu!", copy: "Gizli sözcüğü çözdün ve Çınar Kütüphanesi için berrak damlalar kazandın." };
  const nextMeta = !game.daily && game.level < MAX_LEVEL ? stageMeta(stageForLevel(save.level)) : null;
  const rewardLine = Object.entries(game.reward).filter(([, amount]) => amount > 0).map(([id, amount]) => `${{ dal: "🪵", tohum: "🌾", damla: "💧" }[id]} +${amount}`).join("  ");
  const returnsHome = game.daily || game.level === MAX_LEVEL || game.completedDay;
  const autoCopy = returnsHome ? "Kuş Köyüne otomatik dönülüyor" : `${nextMeta.short} aşaması otomatik açılıyor`;
  backdrop.className = `modal-backdrop ${settings.reduceMotion ? "reduce-motion" : ""}`;
  const resultIllustration = game.mode === "fleet" ? shipSvg(vesselForRank(game.bestRank), true) : birdSvg(bird, true);
  backdrop.innerHTML = `<section class="modal result-copy" role="dialog" aria-modal="true" aria-labelledby="result-title"><div class="result-illustration ${game.mode === "fleet" ? "is-ship" : ""}">${resultIllustration}</div><div class="stars">${"★ ".repeat(game.earnedStars)}${"· ".repeat(3 - game.earnedStars)}</div><p class="eyebrow">${result.kicker}</p><h2 id="result-title">${result.title}</h2><p>${result.copy}</p>${game.completedDay ? '<div class="day-complete-ribbon">☀ Bahçe Günü tamamlandı</div>' : ""}<div class="result-breakdown"><span>Köy ödülü</span><strong>${rewardLine || "Bugün alındı"}</strong><span>Yaprak puanı</span><strong>+${game.reward && rewardLine ? 35 + game.earnedStars * 15 : 0}</strong></div><div class="auto-continue" role="status"><strong>${autoCopy} · <b data-auto-seconds>4</b></strong><div class="auto-track" aria-hidden="true"><i></i></div></div><div class="modal-actions"><button class="primary-button" data-result="primary">${returnsHome ? "Hemen Kuş Köyüne dön" : `${nextMeta.icon} Hemen ${nextMeta.button.toLocaleLowerCase("tr-TR")}`}</button><button class="secondary-button" data-result="home">Şimdi ara ver</button></div></section>`;
  document.body.append(backdrop);
  const continueJourney = () => {
    clearResultTimers();
    if (!backdrop.isConnected) return;
    backdrop.remove();
    if (returnsHome) renderHome();
    else {
      game = createStage(save.level);
      renderGame();
    }
  };
  backdrop.querySelector('[data-result="primary"]').addEventListener("click", continueJourney);
  backdrop.querySelector('[data-result="home"]').addEventListener("click", () => {
    clearResultTimers();
    backdrop.remove();
    renderHome();
  });
  let seconds = 4;
  resultCountdownTimer = setInterval(() => {
    seconds -= 1;
    const counter = backdrop.querySelector("[data-auto-seconds]");
    if (counter) counter.textContent = Math.max(0, seconds);
  }, 1000);
  resultTimer = setTimeout(continueJourney, 4000);
  backdrop.querySelector("button")?.focus();
}

function clearResultTimers() {
  clearTimeout(resultTimer);
  clearInterval(resultCountdownTimer);
  resultTimer = null;
  resultCountdownTimer = null;
}

function levelSubtitle(level) {
  const names = ["Günışığı Bahçesi", "Ihlamur Yolu", "Gül Avlusu", "Sakin Göl", "Lavanta Tepesi", "Bülbül Korusu", "Zümrüt Vadi", "Safran Ovası", "Leylak Adası", "Çınar Köyü", "Yıldız Yaylası", "Sonsuz Bahçe"];
  const day = gardenDay(level);
  const chapter = Math.min(names.length - 1, Math.floor((day - 1) / 34));
  return `${names[chapter]} · Gün ${day}`;
}

function openVillage() {
  void hideHomeBanner();
  save.villageSeen = true;
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal village-modal" role="dialog" aria-modal="true" aria-labelledby="village-title"><div class="modal-head"><div><p class="eyebrow">Kalıcı köy gelişimi</p><h2 id="village-title">Kuş Köyü</h2></div><button class="icon-button" data-close aria-label="Köy penceresini kapat">${icon("close")}</button></div><div class="village-modal-resources"><span>🪵 ${save.village.resources.dal}</span><span>🌾 ${save.village.resources.tohum}</span><span>💧 ${save.village.resources.damla}</span></div><p>Bulmacalardan kazandığın kaynaklarla köyü büyüt. Yükseltmeler yeni ödülleri güçlendirir.</p><div class="building-list">${villageBuildings.map(buildingMarkup).join("")}</div></section>`;
  document.body.append(backdrop);
  const close = () => { backdrop.remove(); void showHomeBanner(); };
  backdrop.querySelector("[data-close]").addEventListener("click", close);
  backdrop.addEventListener("click", (event) => { if (event.target === backdrop) close(); });
  backdrop.querySelectorAll("[data-building]").forEach((button) => button.addEventListener("click", () => {
    const id = button.dataset.building;
    if (!upgradeBuilding(save.village, id)) return;
    const building = villageBuildings.find((item) => item.id === id);
    playSuccessSound();
    haptic([20, 30, 20]);
    persist();
    close();
    renderHome();
    showToast(`${building.name} seviye ${save.village.buildings[id]} oldu!`);
  }));
  backdrop.querySelector("button")?.focus();
  persist();
}

function buildingMarkup(building) {
  const level = save.village.buildings[building.id];
  const cost = upgradeCost(building.id, level);
  const allowed = canUpgrade(save.village, building.id);
  const costText = `🪵 ${cost.dal} · 🌾 ${cost.tohum} · 💧 ${cost.damla}`;
  return `<article class="building-row" style="--building-accent:${building.accent}"><div class="building-icon">${building.icon}</div><div class="building-copy"><div><strong>${building.name}</strong><span>Seviye ${level}</span></div><p>${building.copy}</p><small>${costText}</small></div><button data-building="${building.id}" ${allowed ? "" : "disabled"}>Yükselt</button></article>`;
}

function collectGift() {
  const gift = collectIdleGift(save.village);
  if (!gift) return;
  persist();
  renderHome();
  playSuccessSound();
  showToast(`Köy hediyesi: 🪵 ${gift.dal} · 🌾 ${gift.tohum} · 💧 ${gift.damla}`);
}

function openSettings() {
  void hideHomeBanner();
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div class="modal-head"><h2 id="settings-title">Rahatına göre</h2><button class="icon-button" data-close aria-label="Ayarları kapat">${icon("close")}</button></div><p>Görünümü ve oyun hissini istediğin gibi ayarla.</p><div class="settings-list">${settingToggle("sound", "Oyun sesleri", "Yumuşak seçim ve başarı sesleri")}${settingToggle("haptics", "Titreşim", "Dokunuşlarda hafif geri bildirim")}${settingToggle("keepAwake", "Ekranı açık tut", "Oynarken telefon ekranının uykuya geçmesini önle")}${settingToggle("largeText", "Büyük yazılar", "Metinleri daha rahat oku")}${settingToggle("highContrast", "Yüksek kontrast", "Kuşları ve yazıları daha belirgin göster")}${settingToggle("reduceMotion", "Hareketleri azalt", "Animasyonları en aza indir")}</div><section class="device-transfer" aria-labelledby="transfer-title"><div><span aria-hidden="true">☁️</span><div><strong id="transfer-title">Kayıt ve telefon değişimi</strong><small>İlerlemeni bir dosyayla güvenle başka telefona taşı.</small></div></div><div class="device-transfer-actions"><button class="secondary-button" data-backup="share">Kaydı paylaş</button><button class="secondary-button" data-backup="import">Kayıt yükle</button>${isNativeApp() ? '<button class="text-button" data-privacy>Reklam gizlilik tercihleri</button>' : ""}<button class="text-button" data-privacy-policy>Gizlilik politikası</button></div><input data-backup-file type="file" accept="application/json,.json" hidden></section></section>`;
  document.body.append(backdrop);
  backdrop.querySelectorAll("input").forEach((input) => input.addEventListener("change", () => {
    settings[input.name] = input.checked;
    persist();
    applyA11yClasses();
    if (input.name === "keepAwake") void (input.checked ? requestWakeLock() : releaseWakeLock());
  }));
  backdrop.querySelector('[data-backup="share"]').addEventListener("click", () => void shareBackupFile());
  const fileInput = backdrop.querySelector("[data-backup-file]");
  backdrop.querySelector('[data-backup="import"]').addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    try {
      const backup = parseBackup(await file.text(), MAX_LEVEL);
      close();
      openBackupConfirmation(backup);
    } catch (error) {
      showToast(error.message || "Kayıt dosyası okunamadı.");
      fileInput.value = "";
    }
  });
  backdrop.querySelector("[data-privacy]")?.addEventListener("click", async () => {
    if (!(await showPrivacyChoices())) showToast("Gizlilik seçenekleri şu anda gösterilemiyor.");
  });
  backdrop.querySelector("[data-privacy-policy]").addEventListener("click", () => void openPrivacyPolicy());
  const close = () => { backdrop.remove(); void showHomeBanner(); };
  backdrop.querySelector("[data-close]").addEventListener("click", close);
  backdrop.addEventListener("click", (event) => { if (event.target === backdrop) close(); });
  backdrop.querySelector("button")?.focus();
}

async function shareBackupFile() {
  saveGame();
  const now = new Date();
  const file = new File([stringifyBackup(save, settings, now)], backupFilename(now), { type: "application/json" });
  try {
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: "Kuş Köyü kaydım", text: "Kuş Köyü ilerleme kaydım", files: [file] });
      showToast("Kayıt paylaşılmaya hazır.");
      return;
    }
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Kayıt dosyası indirildi.");
  } catch (error) {
    if (error?.name !== "AbortError") showToast("Kayıt dosyası paylaşılamadı.");
  }
}

function openBackupConfirmation(backup) {
  const backdrop = document.createElement("div");
  const importedDay = gardenDay(backup.save.level);
  const importedScore = Math.max(0, Number(backup.save.score) || 0);
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="backup-title"><div class="confirm-icon" aria-hidden="true">📱</div><h2 id="backup-title">Bu kayda devam edilsin mi?</h2><p>Telefondaki mevcut kayıt yerine seçtiğin ilerleme açılacak.</p><div class="backup-summary"><span>Bahçe günü</span><strong>${importedDay}</strong><span>Yaprak puanı</span><strong>${importedScore}</strong></div><div class="modal-actions"><button class="primary-button" data-confirm-backup>Kaydı yükle</button><button class="secondary-button" data-cancel-backup>Vazgeç</button></div></section>`;
  document.body.append(backdrop);
  const close = () => { backdrop.remove(); void showHomeBanner(); };
  backdrop.querySelector("[data-cancel-backup]").addEventListener("click", close);
  backdrop.querySelector("[data-confirm-backup]").addEventListener("click", () => {
    const importedHasStartedFlag = Object.prototype.hasOwnProperty.call(backup.save, "hasStarted");
    save = { ...structuredClone(defaultSave), ...backup.save };
    save.village = normalizeVillage(save.village);
    save.skipped = Array.isArray(save.skipped) ? save.skipped : [];
    save.logicTutorialDays = Array.isArray(save.logicTutorialDays) ? save.logicTutorialDays : [];
    save.fleetVoyage = normalizeFleetVoyage(save.fleetVoyage);
    if (!importedHasStartedFlag) save.hasStarted = inferStartedState(save);
    settings = { ...defaultSettings, ...backup.settings };
    game = null;
    migrateLegacyOrderGame();
    persist();
    close();
    renderHome();
    showToast(`Bahçe Günü ${gardenDay(save.level)} kaydı açıldı.`);
  });
  backdrop.querySelector("[data-confirm-backup]").focus();
}

function openAlbum() {
  void hideHomeBanner();
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal album-modal" role="dialog" aria-modal="true" aria-labelledby="album-title"><div class="modal-head"><div><p class="eyebrow">Keşif defteri</p><h2 id="album-title">Kuş albümü</h2></div><button class="icon-button" data-close aria-label="Albümü kapat">${icon("close")}</button></div><p>${save.discovered.length} kuşu yakından tanıdın. Yeni türler ilerleyen bahçelerde ortaya çıkacak.</p><div class="album-grid">${species.map((bird) => { const discovered = save.discovered.includes(bird.id); return `<article class="album-bird ${discovered ? "" : "is-locked"}" aria-label="${discovered ? bird.name : "Henüz keşfedilmemiş kuş"}"><div>${birdSvg(bird, true)}</div><strong>${discovered ? bird.name : "Yeni keşif"}</strong></article>`; }).join("")}</div></section>`;
  document.body.append(backdrop);
  const close = () => { backdrop.remove(); void showHomeBanner(); };
  backdrop.querySelector("[data-close]").addEventListener("click", close);
  backdrop.addEventListener("click", (event) => { if (event.target === backdrop) close(); });
  backdrop.querySelector("button")?.focus();
}

function openFleetAlbum() {
  void hideHomeBanner();
  const discovered = new Set(game?.mode === "fleet" ? game.discovered : save.fleetVoyage.discovered);
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal fleet-album-modal" role="dialog" aria-modal="true" aria-labelledby="fleet-album-title"><div class="modal-head"><div><p class="eyebrow">Sandaldan transatlantiğe</p><h2 id="fleet-album-title">Filo defteri</h2></div><button class="icon-button" data-close aria-label="Filo defterini kapat">${icon("close")}</button></div><p>${discovered.size}/10 gemi keşfedildi. Aynı gemileri birleştirdikçe daha büyük bir gemi limana katılır.</p><div class="fleet-album-grid">${fleetVessels.map((vessel) => `<article class="fleet-album-item ${discovered.has(vessel.rank) ? "is-found" : "is-locked"}"><div>${discovered.has(vessel.rank) ? shipSvg(vessel, true) : "?"}</div><strong>${discovered.has(vessel.rank) ? vessel.name : "Henüz keşfedilmedi"}</strong><span>${vessel.rank}. kademe</span></article>`).join("")}</div></section>`;
  document.body.append(backdrop);
  const close = () => {
    backdrop.remove();
    if (!game) void showHomeBanner();
  };
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

async function requestWakeLock() {
  if (!settings.keepAwake || !game || document.visibilityState !== "visible" || wakeLockSentinel || nativeWakeLockActive || wakeLockRequestPending) return;
  wakeLockRequestPending = true;
  try {
    if (isNativeApp()) {
      nativeWakeLockActive = await keepNativeScreenAwake();
      return;
    }
    if (!("wakeLock" in navigator)) return;
    const sentinel = await navigator.wakeLock.request("screen");
    if (!settings.keepAwake || !game || document.visibilityState !== "visible") {
      await sentinel.release();
      return;
    }
    wakeLockSentinel = sentinel;
    sentinel.addEventListener("release", () => {
      if (wakeLockSentinel === sentinel) wakeLockSentinel = null;
    });
  } catch {
    wakeLockSentinel = null;
  } finally {
    wakeLockRequestPending = false;
  }
}

async function releaseWakeLock() {
  if (nativeWakeLockActive) {
    nativeWakeLockActive = false;
    await allowNativeScreenSleep();
  }
  const sentinel = wakeLockSentinel;
  wakeLockSentinel = null;
  if (!sentinel || sentinel.released) return;
  try { await sentinel.release(); } catch { /* Sistem kilidi daha önce bıraktıysa devam et. */ }
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

function playSuccessSound() {
  playTone(520, .12);
  setTimeout(() => playTone(660, .14), 90);
  setTimeout(() => playTone(810, .18), 180);
}

function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && game) void requestWakeLock();
  else void releaseWakeLock();
});
document.addEventListener("pointerdown", () => { if (game) void requestWakeLock(); }, { passive: true });
document.addEventListener("keydown", (event) => {
  if (game?.mode !== "fleet" || document.querySelector(".modal-backdrop")) return;
  const direction = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" }[event.key];
  if (!direction) return;
  event.preventDefault();
  void moveFleet(direction);
});
window.addEventListener("pagehide", () => { saveGame(); void releaseWakeLock(); void hideHomeBanner(); });
if ("serviceWorker" in navigator && import.meta.env.PROD && !import.meta.env.VITE_NATIVE_BUILD) window.addEventListener("load", () => navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL }).catch(() => {}));
void registerNativeBackHandler(async () => {
  const modal = [...document.querySelectorAll(".modal-backdrop")].at(-1);
  if (modal) {
    const closeButton = modal.querySelector("[data-close], [data-close-fleet-help], [data-cancel-backup], [data-result='home'], [data-cancel-hint-ad], [data-fleet-home]");
    if (closeButton) closeButton.click();
    else {
      clearResultTimers();
      modal.remove();
      renderHome();
    }
    return true;
  }
  if (game) {
    saveGame();
    renderHome();
    return true;
  }
  return false;
});
renderHome();

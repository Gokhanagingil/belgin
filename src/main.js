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
  gardenDay,
  stageForLevel
} from "./game-core.js";
import {
  makeOrderStage,
  workshopItems,
  workshopRecipes,
  canCraft,
  craftOne,
  undoCraft,
  resetOrder,
  isOrderComplete,
  orderProgress,
  orderHint
} from "./order-core.js";
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
  orderOnboardingSeen: false,
  villageSeen: false,
  dailyCompleted: [],
  village: defaultVillage,
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
save.village = normalizeVillage(save.village);
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
  const hero = species[(gardenDay(save.level) - 1) % species.length];
  const day = gardenDay(save.level);
  const mode = stageForLevel(save.level);
  const meta = stageMeta(mode);
  const dayStep = (save.level - 1) % 3;
  const gift = idleGift(save.village);
  app.innerHTML = `<main class="app-shell"><section class="screen home-screen" aria-labelledby="home-title">
    <header class="home-topbar"><div class="brand-mark"><div class="brand-badge">${birdSvg(species[0], true)}</div><div><p class="eyebrow">Yaşayan bulmaca köyü</p><h1 class="brand-title" id="home-title">Kuş Köyü</h1></div></div><button class="icon-button" data-action="settings" aria-label="Ayarları aç">${icon("settings")}</button></header>
    <div class="resource-bar" aria-label="Köy kaynakları"><span title="Sağlam dal">🪵 <strong>${save.village.resources.dal}</strong></span><span title="Altın tohum">🌾 <strong>${save.village.resources.tohum}</strong></span><span title="Berrak damla">💧 <strong>${save.village.resources.damla}</strong></span><button data-action="village">Köyü geliştir</button></div>
    <article class="village-hero">
      <div class="village-sky" aria-hidden="true"><span class="village-sun">☀</span><span class="village-cloud">☁</span></div>
      <button class="village-house house-main" data-action="village" aria-label="Kuş Konağı seviye ${save.village.buildings.konak}"><span>🏡</span><strong>${save.village.buildings.konak}</strong></button>
      <button class="village-house house-green" data-action="village" aria-label="Günışığı Serası seviye ${save.village.buildings.sera}"><span>🌿</span><strong>${save.village.buildings.sera}</strong></button>
      <button class="village-house house-work" data-action="village" aria-label="Bahçe Atölyesi seviye ${save.village.buildings.atolye}"><span>🛠️</span><strong>${save.village.buildings.atolye}</strong></button>
      <div class="village-path" aria-hidden="true"></div><div class="village-bird" aria-hidden="true">${birdSvg(hero, true)}</div>
      <div class="village-copy"><div class="hero-kicker">✦ BAHÇE GÜNÜ ${day}</div><h2>${meta.greeting}<br><span>${meta.title}</span></h2><p>${meta.copy}</p><button class="primary-button" data-action="play">${save.currentGame?.version === 4 ? "Kaldığın yerden devam et" : `${meta.icon} ${meta.button}`}</button></div>
    </article>
    ${gift ? `<button class="idle-gift" data-action="collect-gift"><span>🎁</span><div><strong>Kuşlar seni beklerken çalıştı</strong><small>${gift.hours} saatlik köy hediyesini topla</small></div><b>Topla</b></button>` : ""}
    <section class="day-route" aria-label="Bahçe Günü ${day} aşamaları"><div class="day-route-head"><div><span>Bugünün yolu</span><strong>${levelSubtitle(save.level)}</strong></div><em>${day}/400 gün</em></div><div class="route-steps">${["logic", "order", "word"].map((id, index) => { const item = stageMeta(id); return `<div class="route-step ${index < dayStep ? "is-done" : index === dayStep ? "is-current" : ""}"><span>${index < dayStep ? "✓" : item.icon}</span><small>${item.short}</small></div>`; }).join("")}</div><div class="progress-track"><div class="progress-fill" style="width:${Math.max(1, (save.completed.length / MAX_LEVEL) * 100)}%"></div></div></section>
    <div class="quick-grid"><button class="quick-card" data-action="daily"><span class="mini-icon">☀️</span><strong>Günün görevi</strong><span>Her gün değişen özel bir köy bulmacası</span></button><button class="quick-card" data-action="album"><span class="mini-icon">🪶</span><strong>Kuş albümü</strong><span>${save.discovered.length} kuş keşfedildi</span></button></div>
  </section></main>`;
  bindCommonActions();
  applyA11yClasses();
}

function startGame(daily = false) {
  if (!daily && save.currentGame?.version === 4 && save.currentGame.status === "playing" && save.currentGame.level === save.level) game = save.currentGame;
  else game = createStage(save.level, daily);
  renderGame();
}

function createStage(level, daily = false) {
  const mode = stageForLevel(level, daily);
  const stage = mode === "logic" ? makeLogicStage(level, daily) : mode === "order" ? makeOrderStage(level, daily) : makeWordStage(level, daily);
  stage.dateKey = new Date().toISOString().slice(0, 10);
  return stage;
}

function stageMeta(mode) {
  return {
    logic: { icon: "🧩", short: "Sabah", greeting: "Günaydın!", title: "Kuş Düzeni", button: "Kuşları yerleştir", copy: "Her satır ve sütunda kuşları dengeli biçimde yerleştir." },
    order: { icon: "🧺", short: "Öğle", greeting: "Atölye açıldı", title: "Siparişler hazır", button: "Atölyeye gir", copy: "Ara ürünleri doğru sırada hazırla, köyün siparişlerini tamamla." },
    word: { icon: "🔤", short: "Akşam", greeting: "Bahçe fısıldıyor", title: "Gizli Sözcük", button: "Sözcüğü bul", copy: "İpucunu çöz, karışık harfleri anlamlı bir sözcüğe dönüştür." }
  }[mode];
}

function saveGame() {
  if (game && !game.daily && game.status === "playing") save.currentGame = game;
  persist();
}

function renderGame() {
  if (game.mode === "word") return renderWordGame();
  if (game.mode === "order") return renderOrderGame();
  const app = document.querySelector("#app");
  const conflicts = getConflicts(game.cells, game.size);
  const openCount = game.cells.filter((cell) => !cell.given).length;
  const filled = game.cells.filter((cell) => !cell.given && cell.speciesId).length;
  const progress = Math.round((filled / openCount) * 100);
  const inventory = inventoryFor(game);
  app.innerHTML = `<main class="app-shell"><section class="screen game-screen logic-screen" aria-labelledby="level-title">
    ${gameHeader("Sabah · Kuş düzeni")}
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
  return `<header class="game-topbar"><button class="icon-button back-button" data-action="home" aria-label="Kuş Köyüne dön">${icon("back")}</button><div class="level-heading"><h1 id="level-title">${game.daily ? "Günün görevi" : `Bahçe Günü ${game.day}`}</h1><p>${phase}</p></div><div class="score-pill" aria-label="${save.score} yaprak puanı">🍃 <span>${save.score}</span></div></header>`;
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
    finishStage();
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
  if (isGridSolved(game)) setTimeout(finishStage, settings.reduceMotion ? 20 : 700);
}

function renderOrderGame() {
  const app = document.querySelector("#app");
  const progress = orderProgress(game);
  const percent = Math.round((progress.delivered / progress.total) * 100);
  const inventoryItems = Object.entries(game.inventory).filter(([, count]) => count > 0);
  const recipes = workshopRecipes.filter((recipe) => game.availableRecipeIds.includes(recipe.id));
  app.innerHTML = `<main class="app-shell"><section class="screen game-screen order-screen" aria-labelledby="level-title">
    ${gameHeader("Öğle · Atölye siparişleri")}
    <div class="progress-wrap" aria-label="Sipariş ilerlemesi yüzde ${percent}"><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div><div class="progress-label">${progress.delivered}/${progress.total}</div></div>
    <aside class="mission-card ${game.moves <= game.optimalMoves ? "is-safe" : ""}"><span class="mission-medal">✦</span><div><strong>Usta üretici</strong><span>${game.optimalMoves} üretim hamlesinde tamamlamayı dene · Şu an ${game.moves}</span></div></aside>
    <section class="orders-panel" aria-labelledby="orders-title"><div class="section-title"><div><span>Köy meydanı</span><h2 id="orders-title">Bekleyen siparişler</h2></div><em>${game.orders.filter((order) => order.delivered >= order.required).length}/${game.orders.length}</em></div><div class="order-cards">${game.orders.map((order) => { const item = workshopItems[order.productId]; const done = order.delivered >= order.required; return `<article class="order-card ${done ? "is-done" : ""}"><span class="order-icon">${done ? "✓" : item.icon}</span><div><strong>${item.name}</strong><small>${order.delivered}/${order.required} hazır</small></div></article>`; }).join("")}</div></section>
    <section class="workshop-panel" aria-labelledby="workshop-title"><div class="section-title"><div><span>Malzeme rafı</span><h2 id="workshop-title">Atölyede üret</h2></div></div><div class="ingredient-shelf">${inventoryItems.map(([id, count]) => { const item = workshopItems[id]; return `<div class="ingredient-chip" aria-label="${item.name}, ${count} adet"><span>${item.icon}</span><small>${item.name}</small><strong>${count}</strong></div>`; }).join("")}</div><div class="recipe-grid">${recipes.map(recipeMarkup).join("")}</div></section>
    ${!save.orderOnboardingSeen ? '<div class="order-coach" role="status"><strong>Siparişler birkaç üretim adımı isteyebilir.</strong><br>Örneğin sepetten önce iplik hazırla. Malzemeleri ortak kullandığın için sıranı planla.</div>' : ""}
    <div class="power-row"><button class="power-button" data-action="order-undo" ${game.history.length ? "" : "disabled"}>${icon("undo")}<span>Geri al</span></button><button class="power-button" data-action="order-reset">${icon("clear")}<span>Baştan başla</span></button><button class="power-button" data-action="order-hint">${icon("hint")}<span>Sıradaki adım</span></button></div>
  </section></main>`;
  document.querySelectorAll("[data-recipe]").forEach((button) => button.addEventListener("click", () => craftRecipe(button.dataset.recipe)));
  document.querySelector('[data-action="order-undo"]')?.addEventListener("click", undoOrderMove);
  document.querySelector('[data-action="order-reset"]')?.addEventListener("click", resetOrderGame);
  document.querySelector('[data-action="order-hint"]')?.addEventListener("click", showOrderHint);
  document.querySelector('[data-action="home"]')?.addEventListener("click", () => { saveGame(); renderHome(); });
  applyA11yClasses();
}

function recipeMarkup(recipe) {
  const output = workshopItems[recipe.output];
  const inputCounts = recipe.inputs.reduce((counts, id) => ({ ...counts, [id]: (counts[id] || 0) + 1 }), {});
  const inputs = Object.entries(inputCounts).map(([id, count]) => `<span>${workshopItems[id].icon}${count > 1 ? `×${count}` : ""}</span>`).join('<b aria-hidden="true">+</b>');
  return `<button class="recipe-card" data-recipe="${recipe.id}" ${canCraft(game, recipe.id) ? "" : "disabled"} aria-label="${output.name} üret, ${recipe.station}"><div class="recipe-output">${output.icon}</div><div><strong>${output.name}</strong><small>${recipe.station}</small><div class="recipe-inputs">${inputs}<b aria-hidden="true">→</b><span>${output.icon}</span></div></div></button>`;
}

async function craftRecipe(recipeId) {
  if (game.busy || !craftOne(game, recipeId)) return;
  save.orderOnboardingSeen = true;
  playTone(440 + Math.min(game.moves, 5) * 35, .08);
  haptic(16);
  renderOrderGame();
  document.querySelector(`[data-recipe="${recipeId}"]`)?.classList.add("is-crafted");
  saveGame();
  if (isOrderComplete(game)) {
    game.busy = true;
    playSuccessSound();
    await wait(settings.reduceMotion ? 1 : 700);
    finishStage();
  }
}

function undoOrderMove() {
  if (!undoCraft(game) || game.busy) return;
  playTone(280, .05);
  renderOrderGame();
  saveGame();
}

function resetOrderGame() {
  if (game.busy) return;
  resetOrder(game);
  renderOrderGame();
  showToast("Atölye ilk haline döndü.");
  saveGame();
}

function showOrderHint() {
  if (game.busy) return;
  const recipeId = orderHint(game);
  if (!recipeId) return showToast("Önce bir hamleyi geri almayı dene.");
  const recipe = workshopRecipes.find((item) => item.id === recipeId);
  game.helpsUsed += 1;
  renderOrderGame();
  document.querySelector(`[data-recipe="${recipeId}"]`)?.classList.add("is-hint");
  showToast(`Sıradaki iyi adım: ${workshopItems[recipe.output].name}`);
  saveGame();
}

function renderWordGame() {
  const app = document.querySelector("#app");
  const word = game.wordState;
  const progress = Math.round((word.answer.length / word.word.length) * 100);
  app.innerHTML = `<main class="app-shell"><section class="screen game-screen word-screen" aria-labelledby="level-title">
    ${gameHeader("Akşam · Gizli sözcük")}
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

function finishStage() {
  game.status = "won";
  game.busy = false;
  const careful = game.mode === "logic" ? missionComplete(game) : game.mode === "order" ? game.moves <= game.optimalMoves : game.wordState.attempts <= 1;
  const mastery = game.helpsUsed === 0 && (game.mode !== "order" || game.resetCount === 0);
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
  }
  persist();
  openResult();
}

function openResult() {
  const backdrop = document.createElement("div");
  const bird = species[(game.level + 1) % species.length];
  const result = game.mode === "logic"
    ? { kicker: "Kuş düzeni tamamlandı", title: "Bahçe dengelendi!", copy: "Her kuş doğru yerini buldu. Köyün yeni yapıları için sağlam dallar kazandın." }
    : game.mode === "order"
      ? { kicker: "Tüm siparişler hazır", title: "Atölye şenlendi!", copy: "Ara ürünleri doğru sırada hazırladın; kuşlar siparişlerini mutlulukla teslim aldı." }
      : { kicker: `${game.wordState.word} bulundu`, title: "Bahçe konuştu!", copy: "Gizli sözcüğü çözdün ve Çınar Kütüphanesi için berrak damlalar kazandın." };
  const nextMeta = !game.daily && game.level < MAX_LEVEL ? stageMeta(stageForLevel(save.level)) : null;
  const rewardLine = Object.entries(game.reward).filter(([, amount]) => amount > 0).map(([id, amount]) => `${{ dal: "🪵", tohum: "🌾", damla: "💧" }[id]} +${amount}`).join("  ");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal result-copy" role="dialog" aria-modal="true" aria-labelledby="result-title"><div class="result-illustration">${birdSvg(bird, true)}</div><div class="stars">${"★ ".repeat(game.earnedStars)}${"· ".repeat(3 - game.earnedStars)}</div><p class="eyebrow">${result.kicker}</p><h2 id="result-title">${result.title}</h2><p>${result.copy}</p>${game.completedDay ? '<div class="day-complete-ribbon">☀ Bahçe Günü tamamlandı</div>' : ""}<div class="result-breakdown"><span>Köy ödülü</span><strong>${rewardLine || "Bugün alındı"}</strong><span>Yaprak puanı</span><strong>+${game.reward && rewardLine ? 35 + game.earnedStars * 15 : 0}</strong></div><div class="modal-actions"><button class="primary-button" data-result="primary">${game.daily || game.level === MAX_LEVEL || game.completedDay ? "Kuş Köyüne dön" : `${nextMeta.icon} ${nextMeta.button}`}</button><button class="secondary-button" data-result="home">Şimdi ara ver</button></div></section>`;
  document.body.append(backdrop);
  backdrop.querySelector('[data-result="primary"]').addEventListener("click", () => { backdrop.remove(); if (game.daily || game.level === MAX_LEVEL || game.completedDay) renderHome(); else { game = createStage(save.level); renderGame(); } });
  backdrop.querySelector('[data-result="home"]').addEventListener("click", () => { backdrop.remove(); renderHome(); });
  backdrop.querySelector("button")?.focus();
}

function levelSubtitle(level) {
  const names = ["Günışığı Bahçesi", "Ihlamur Yolu", "Gül Avlusu", "Sakin Göl", "Lavanta Tepesi", "Bülbül Korusu", "Zümrüt Vadi", "Safran Ovası", "Leylak Adası", "Çınar Köyü", "Yıldız Yaylası", "Sonsuz Bahçe"];
  const day = gardenDay(level);
  const chapter = Math.min(names.length - 1, Math.floor((day - 1) / 34));
  return `${names[chapter]} · Gün ${day}`;
}

function openVillage() {
  save.villageSeen = true;
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal village-modal" role="dialog" aria-modal="true" aria-labelledby="village-title"><div class="modal-head"><div><p class="eyebrow">Kalıcı köy gelişimi</p><h2 id="village-title">Kuş Köyü</h2></div><button class="icon-button" data-close aria-label="Köy penceresini kapat">${icon("close")}</button></div><div class="village-modal-resources"><span>🪵 ${save.village.resources.dal}</span><span>🌾 ${save.village.resources.tohum}</span><span>💧 ${save.village.resources.damla}</span></div><p>Bulmacalardan kazandığın kaynaklarla köyü büyüt. Yükseltmeler yeni ödülleri güçlendirir.</p><div class="building-list">${villageBuildings.map(buildingMarkup).join("")}</div></section>`;
  document.body.append(backdrop);
  const close = () => backdrop.remove();
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

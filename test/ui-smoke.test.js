import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { Window } from "happy-dom";
import { makeLogicStage, makeWordStage, species } from "../src/game-core.js";

const pause = (ms = 30) => new Promise((resolve) => setTimeout(resolve, ms));

async function bootApp({ save, wakeLock } = {}) {
  const window = new Window({ url: "https://kus-bahcesi.test/" });
  if (wakeLock) Object.defineProperty(window.navigator, "wakeLock", { configurable: true, value: wakeLock });
  window.localStorage.setItem("kus-bahcesi-settings-v1", JSON.stringify({
    sound: false,
    haptics: false,
    largeText: false,
    highContrast: false,
    reduceMotion: true
  }));
  if (save) window.localStorage.setItem("kus-bahcesi-save-v1", JSON.stringify(save));
  const scripts = (await readdir(new URL("../dist/assets/", import.meta.url))).filter((file) => file.endsWith(".js"));
  assert.equal(scripts.length, 1, "production build should contain one application bundle");
  const source = await readFile(new URL(`../dist/assets/${scripts[0]}`, import.meta.url), "utf8");
  window.document.body.innerHTML = '<div id="app"></div>';
  window.eval(source);
  return window;
}

async function solveLogic(document, levelNumber) {
  const level = makeLogicStage(levelNumber);
  for (const target of level.cells.filter((cell) => !cell.given)) {
    const bird = species.find((item) => item.id === target.solutionId);
    const palette = document.querySelector(`[data-species="${bird.id}"]`);
    if (!palette.classList.contains("is-selected")) palette.click();
    document.querySelector(`[data-cell="${target.index}"]`).click();
    await pause(2);
  }
  await pause();
}

async function solveWord(document, levelNumber) {
  const targetWord = makeWordStage(levelNumber).wordState.word;
  for (const character of targetWord) {
    const button = [...document.querySelectorAll(".letter-button:not(:disabled)")]
      .find((item) => item.textContent === character);
    assert.ok(button, `letter ${character} should be available`);
    button.click();
    await pause(2);
  }
  await pause();
}

test("production output targets the GitHub Pages project path", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  assert.match(html, /\/belgin\/assets\//);
  assert.match(html, /\/belgin\/manifest\.webmanifest/);
  assert.match(html, /\/belgin\/icon\.svg/);
});

test("one garden day connects logic, word and village progression", async () => {
  const window = await bootApp();
  const { document } = window;

  assert.match(document.body.textContent, /Kuş Köyü/);
  assert.match(document.body.textContent, /1\/400 gün/);
  assert.equal(document.querySelectorAll(".route-step").length, 2);
  assert.equal(document.querySelectorAll("[data-route]").length, 0);
  assert.ok(document.querySelector('[aria-label="Köy kaynakları"]'));

  document.querySelector('[data-action="play"]').click();
  assert.equal(document.querySelectorAll(".logic-cell").length, 16);
  assert.equal(document.querySelectorAll(".palette-bird").length, 4);
  assert.equal(document.querySelectorAll(".bird-tile").length, 0, "the old triple-match board must not return");
  assert.match(document.body.textContent, /her kuş yalnızca bir kez/i);

  await solveLogic(document, 1);
  assert.match(document.querySelector(".result-copy").textContent, /Bahçe dengelendi/);
  assert.match(document.querySelector(".result-breakdown").textContent, /Köy ödülü/);
  assert.match(document.querySelector(".auto-continue").textContent, /otomatik açılıyor/);
  assert.equal(JSON.parse(window.localStorage.getItem("kus-bahcesi-save-v1")).level, 3);

  await pause(4200);
  assert.ok(document.querySelector(".word-stage"));
  assert.match(document.body.textContent, /Gizli sözcüğü bul/);

  await solveWord(document, 3);
  assert.match(document.querySelector(".result-copy").textContent, /Bahçe konuştu/);
  assert.match(document.querySelector(".day-complete-ribbon").textContent, /Bahçe Günü tamamlandı/);

  document.querySelector('[data-result="primary"]').click();
  assert.match(document.body.textContent, /2\/400 gün/);
  assert.equal(document.querySelectorAll(".route-step.is-done").length, 0);

  document.querySelector('[data-action="village"]').click();
  assert.equal(document.querySelectorAll(".building-row").length, 4);
  const upgrade = document.querySelector('[data-building="konak"]');
  assert.equal(upgrade.disabled, false, "a complete garden day should fund the first village upgrade");
  upgrade.click();
  assert.ok(document.querySelector('[aria-label="Kuş Konağı seviye 2"]'));

  document.querySelector('[data-action="album"]').click();
  assert.ok(document.querySelector(".album-modal"));
  assert.equal(document.querySelectorAll(".album-bird").length, 12);
  window.close();
});

test("an unfinished placement resumes exactly where it was left", async () => {
  const window = await bootApp();
  const { document } = window;
  document.querySelector('[data-action="play"]').click();
  const palette = document.querySelector(".palette-bird:not(:disabled)");
  palette.click();
  const speciesId = palette.dataset.species;
  document.querySelector(".logic-cell:not(.is-given)").click();
  document.querySelector('[data-action="home"]').click();
  assert.match(document.querySelector('[data-action="play"]').textContent, /Kaldığın yerden/);
  document.querySelector('[data-action="play"]').click();
  assert.ok(document.querySelector(".logic-cell:not(.is-given) svg"));
  assert.ok(document.querySelector(`[data-species="${speciesId}"]`));
  window.close();
});

test("a legacy in-progress puzzle never corrupts the current journey", async () => {
  const window = await bootApp({
    save: {
      level: 1,
      currentGame: { version: 3, status: "playing", level: 1 },
      village: { resources: { dal: 2 }, buildings: { konak: 1 } }
    }
  });
  const { document } = window;
  assert.doesNotMatch(document.querySelector('[data-action="play"]').textContent, /Kaldığın yerden/);
  assert.match(document.querySelector('[aria-label="Köy kaynakları"]').textContent, /2/);
  document.querySelector('[data-action="play"]').click();
  assert.ok(document.querySelector(".logic-screen"));
  window.close();
});

test("an in-progress workshop save is discarded and resumes at the word game", async () => {
  const window = await bootApp({
    save: {
      level: 2,
      currentGame: { version: 4, mode: "order", status: "playing", level: 2 },
      village: { resources: { dal: 4, tohum: 4, damla: 4 }, buildings: { konak: 1, sera: 1, atolye: 1, kutuphane: 1 } }
    }
  });
  const { document } = window;
  assert.doesNotMatch(document.querySelector('[data-action="play"]').textContent, /Kaldığın yerden/);
  const stored = JSON.parse(window.localStorage.getItem("kus-bahcesi-save-v1"));
  assert.equal(stored.level, 3);
  assert.deepEqual(stored.skipped, [2]);
  assert.equal(stored.currentGame, null);
  document.querySelector('[data-action="play"]').click();
  assert.ok(document.querySelector(".word-stage"));
  assert.equal(document.querySelectorAll(".order-screen").length, 0);
  window.close();
});

test("a legacy full-route preference cannot re-enable the workshop", async () => {
  const window = await bootApp({
    save: {
      level: 1,
      skipOrders: false,
      village: { resources: { dal: 8, tohum: 5, damla: 5 }, buildings: { konak: 1, sera: 1, atolye: 1, kutuphane: 1 } }
    }
  });
  const { document } = window;
  assert.equal(document.querySelectorAll("[data-route]").length, 0);
  assert.equal(document.querySelectorAll(".route-step").length, 2);
  assert.doesNotMatch(document.body.textContent, /Sipariş|Üçlü Bahçe Günü/);
  const stored = JSON.parse(window.localStorage.getItem("kus-bahcesi-save-v1"));
  assert.equal(stored.skipOrders, true);
  document.querySelector('[data-action="play"]').click();
  assert.ok(document.querySelector(".logic-screen"));
  window.close();
});

test("active gameplay keeps the screen awake and releases it at home", async () => {
  let requests = 0;
  let releases = 0;
  const sentinel = new EventTarget();
  sentinel.released = false;
  sentinel.release = async () => {
    if (sentinel.released) return;
    sentinel.released = true;
    releases += 1;
    sentinel.dispatchEvent(new Event("release"));
  };
  const window = await bootApp({
    wakeLock: {
      request: async (type) => {
        assert.equal(type, "screen");
        requests += 1;
        return sentinel;
      }
    }
  });
  const { document } = window;
  document.querySelector('[data-action="settings"]').click();
  assert.equal(document.querySelector('[name="keepAwake"]').checked, true);
  document.querySelector("[data-close]").click();
  document.querySelector('[data-action="play"]').click();
  await pause();
  assert.equal(requests, 1);
  document.querySelector('[data-action="home"]').click();
  await pause();
  assert.equal(releases, 1);
  window.close();
});

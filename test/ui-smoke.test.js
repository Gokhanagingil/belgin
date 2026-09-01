import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { Window } from "happy-dom";
import { makeLevel, species, wordForLevel } from "../src/game-core.js";

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function bootApp() {
  const window = new Window({ url: "https://kus-bahcesi.test/" });
  const scripts = (await readdir(new URL("../dist/assets/", import.meta.url))).filter((file) => file.endsWith(".js"));
  assert.equal(scripts.length, 1, "production build should contain one application bundle");
  const source = await readFile(new URL(`../dist/assets/${scripts[0]}`, import.meta.url), "utf8");
  window.document.body.innerHTML = '<div id="app"></div>';
  window.eval(source);
  return window;
}

test("production output targets the GitHub Pages project path", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  assert.match(html, /\/belgin\/assets\//);
  assert.match(html, /\/belgin\/manifest\.webmanifest/);
  assert.match(html, /\/belgin\/icon\.svg/);
});

test("home, two-stage puzzle, scoring and album flows stay operational", async () => {
  const window = await bootApp();
  const { document } = window;

  assert.match(document.body.textContent, /KUŞLARIN ŞİFRESİ/);
  document.querySelector('[data-action="play"]').click();
  assert.equal(document.querySelectorAll(".logic-cell").length, 16);
  assert.equal(document.querySelectorAll(".palette-bird").length, 4);
  assert.equal(document.querySelectorAll(".bird-tile").length, 0, "the old triple-match board must not return");
  assert.match(document.body.textContent, /her kuş yalnızca bir kez/i);

  const level = makeLevel(1);
  for (const target of level.cells.filter((cell) => !cell.given)) {
    const bird = species.find((item) => item.id === target.solutionId);
    const palette = document.querySelector(`[data-species="${bird.id}"]`);
    if (!palette.classList.contains("is-selected")) palette.click();
    document.querySelector(`[data-cell="${target.index}"]`).click();
    await pause(5);
  }
  await pause(850);

  assert.ok(document.querySelector(".word-stage"), "solving the logic grid should unlock the word stage");
  assert.match(document.body.textContent, /Gizli sözcüğü bul/);
  const targetWord = wordForLevel(1).word;
  for (const character of targetWord) {
    const button = [...document.querySelectorAll(".letter-button:not(:disabled)")].find((item) => item.textContent === character);
    assert.ok(button, `letter ${character} should be available`);
    button.click();
    await pause(5);
  }
  await pause(850);

  assert.ok(document.querySelector(".result-copy"));
  assert.match(document.querySelector(".result-copy").textContent, /Şifre çözüldü/);
  assert.match(document.querySelector(".result-breakdown").textContent, /Bulmaca\+60/);

  document.querySelector('[data-result="home"]').click();
  assert.match(document.querySelector(".journey-copy").textContent, /1 \/ 1200/);
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
  assert.ok(document.querySelector(`.logic-cell:not(.is-given) svg`));
  assert.ok(document.querySelector(`[data-species="${speciesId}"]`));
  window.close();
});

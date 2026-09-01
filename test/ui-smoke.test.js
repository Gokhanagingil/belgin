import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { Window } from "happy-dom";

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

test("home, game, match and album flows stay operational", async () => {
  const window = await bootApp();
  const { document } = window;

  assert.match(document.body.textContent, /Kuş Bahçesi/);
  assert.ok(document.querySelector('[data-action="play"]'));

  document.querySelector('[data-action="play"]').click();
  assert.equal(document.querySelectorAll(".bird-tile").length, 24);
  assert.equal(document.querySelectorAll(".tray-slot").length, 7);

  const grouped = new Map();
  for (const tile of document.querySelectorAll(".bird-tile")) {
    const label = tile.getAttribute("aria-label");
    grouped.set(label, [...(grouped.get(label) || []), tile]);
  }
  const triple = [...grouped.values()].find((tiles) => tiles.length >= 3);
  assert.ok(triple, "level one should expose at least one selectable triple");

  triple[0].click();
  await pause(230);
  document.querySelector(`[aria-label="${triple[0].getAttribute("aria-label")}"]`).click();
  await pause(230);
  document.querySelector(`[aria-label="${triple[0].getAttribute("aria-label")}"]`).click();
  await pause(650);

  assert.equal(document.querySelectorAll(".bird-tile").length, 21);
  assert.match(document.querySelector(".score-pill").textContent, /15/);
  assert.equal(document.querySelectorAll(".tray-bird").length, 0);

  document.querySelector('[data-action="home"]').click();
  document.querySelector('[data-action="album"]').click();
  assert.ok(document.querySelector(".album-modal"));
  assert.equal(document.querySelectorAll(".album-bird").length, 12);

  window.close();
});

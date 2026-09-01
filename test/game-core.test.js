import test from "node:test";
import assert from "node:assert/strict";
import { dailySeed, makeLevel, species, MAX_LEVEL, TRAY_LIMIT } from "../src/game-core.js";

test("all 1,200 campaign levels are composed of complete triples", () => {
  for (let level = 1; level <= MAX_LEVEL; level += 1) {
    const game = makeLevel(level);
    assert.equal(game.board.length % 3, 0);
    assert.ok(game.board.length <= 42);

    const counts = new Map();
    for (const tile of game.board) counts.set(tile.speciesId, (counts.get(tile.speciesId) || 0) + 1);
    for (const count of counts.values()) assert.equal(count % 3, 0);
  }
});

test("campaign levels are deterministic", () => {
  assert.deepEqual(makeLevel(317).board, makeLevel(317).board);
  assert.notDeepEqual(makeLevel(317).board, makeLevel(318).board);
});

test("daily discovery is stable for the same calendar date", () => {
  const day = new Date("2026-09-01T12:00:00Z");
  assert.equal(dailySeed(day), 20260901);
  assert.deepEqual(makeLevel(1, true, day).board, makeLevel(1, true, day).board);
});

test("game constants preserve the seven-slot risk rule", () => {
  assert.equal(TRAY_LIMIT, 7);
  assert.equal(MAX_LEVEL, 1200);
  assert.equal(species.length, 12);
});

test("invalid campaign levels fail explicitly", () => {
  assert.throws(() => makeLevel(0), RangeError);
  assert.throws(() => makeLevel(1201), RangeError);
});

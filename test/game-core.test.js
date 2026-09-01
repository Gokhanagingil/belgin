import test from "node:test";
import assert from "node:assert/strict";
import {
  dailySeed,
  getConflicts,
  inventoryFor,
  isGridSolved,
  makeLevel,
  makeWordState,
  missionComplete,
  puzzleSize,
  species,
  MAX_LEVEL
} from "../src/game-core.js";

test("all 1,200 campaign levels form valid Latin-style bird gardens", () => {
  for (let level = 1; level <= MAX_LEVEL; level += 1) {
    const game = makeLevel(level);
    assert.equal(game.cells.length, game.size ** 2);
    assert.equal(game.speciesIds.length, game.size);
    assert.equal(new Set(game.speciesIds).size, game.size);
    assert.equal(getConflicts(game.cells.map((cell) => ({ ...cell, speciesId: cell.solutionId })), game.size).size, 0);
    assert.ok(game.cells.some((cell) => cell.given));
    assert.ok(game.cells.some((cell) => !cell.given));
    for (const count of Object.values(inventoryFor(game))) assert.ok(count >= 0);
  }
});

test("difficulty grows from four to six bird types", () => {
  assert.equal(puzzleSize(1), 4);
  assert.equal(puzzleSize(12), 4);
  assert.equal(puzzleSize(13), 5);
  assert.equal(puzzleSize(80), 5);
  assert.equal(puzzleSize(81), 6);
  assert.equal(puzzleSize(1200), 6);
});

test("a completed garden is recognized without requiring a single hidden solution", () => {
  const game = makeLevel(42);
  game.cells.forEach((cell) => { cell.speciesId = cell.solutionId; });
  assert.equal(isGridSolved(game), true);
  game.cells[0].speciesId = game.cells[1].speciesId;
  assert.equal(isGridSolved(game), false);
  assert.ok(getConflicts(game.cells, game.size).size >= 2);
});

test("campaign and word puzzles are deterministic", () => {
  assert.deepEqual(makeLevel(317).cells, makeLevel(317).cells);
  assert.notDeepEqual(makeLevel(317).cells, makeLevel(318).cells);
  assert.deepEqual(makeWordState(317), makeWordState(317));
  const word = makeWordState(317);
  assert.equal(word.letters.map((item) => item.letter).sort().join(""), [...word.word].sort().join(""));
});

test("daily puzzle is stable for the same calendar date", () => {
  const day = new Date("2026-09-01T12:00:00Z");
  assert.equal(dailySeed(day), 20260901);
  assert.deepEqual(makeLevel(1, true, day).cells, makeLevel(1, true, day).cells);
  assert.deepEqual(makeWordState(1, true, day), makeWordState(1, true, day));
});

test("missions reward careful play and remain optional", () => {
  const game = makeLevel(1);
  assert.equal(missionComplete(game), true);
  game.conflictMoves = 1;
  assert.equal(missionComplete(game), false);
});

test("game constants and invalid levels are explicit", () => {
  assert.equal(MAX_LEVEL, 1200);
  assert.equal(species.length, 12);
  assert.throws(() => makeLevel(0), RangeError);
  assert.throws(() => makeLevel(1201), RangeError);
});

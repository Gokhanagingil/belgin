import test from "node:test";
import assert from "node:assert/strict";
import {
  dailySeed,
  gardenDay,
  getConflicts,
  inventoryFor,
  isGridSolved,
  makeLogicStage,
  makeWordStage,
  missionComplete,
  puzzleSize,
  species,
  stageForLevel,
  wordPuzzles,
  MAX_LEVEL
} from "../src/game-core.js";
import {
  craftOne,
  isOrderComplete,
  makeOrderStage,
  orderMissionComplete,
  orderProgress,
  workshopCustomers,
  workshopRecipes,
  workshopStories
} from "../src/order-core.js";
import { applyReward, canUpgrade, collectIdleGift, defaultVillage, normalizeVillage, stageReward, upgradeBuilding } from "../src/village-core.js";

test("the stage catalog retains 400 days and dormant workshop levels", () => {
  const modes = { logic: 0, order: 0, word: 0 };
  for (let level = 1; level <= MAX_LEVEL; level += 1) modes[stageForLevel(level)] += 1;
  assert.deepEqual(modes, { logic: 400, order: 400, word: 400 });
  assert.equal(gardenDay(1), 1);
  assert.equal(gardenDay(3), 1);
  assert.equal(gardenDay(4), 2);
  assert.equal(gardenDay(1200), 400);
});

test("all 400 logic stages form valid bird gardens", () => {
  for (let level = 1; level <= MAX_LEVEL; level += 3) {
    const game = makeLogicStage(level);
    assert.equal(game.mode, "logic");
    assert.equal(game.cells.length, game.size ** 2);
    assert.equal(game.speciesIds.length, game.size);
    const solvedCells = game.cells.map((cell) => ({ ...cell, speciesId: cell.solutionId }));
    assert.equal(getConflicts(solvedCells, game.size).size, 0);
    for (const count of Object.values(inventoryFor(game))) assert.ok(count >= 0);
  }
});

test("all 400 workshop stages have a proven production plan", () => {
  for (let level = 2; level <= MAX_LEVEL; level += 3) {
    const game = makeOrderStage(level);
    assert.equal(game.mode, "order");
    assert.equal(game.orderVersion, 2);
    assert.ok(game.orders.length >= 2);
    assert.ok(game.orders.every((order) => order.customerId && order.customerName && order.note));
    assert.ok(game.story.title && game.mission.title);
    assert.equal(game.optimalMoves, game.solutionPlan.length);
    assert.ok(game.solutionPlan.every((recipeId) => game.availableRecipeIds.includes(recipeId)));
    for (const recipeId of game.solutionPlan) assert.equal(craftOne(game, recipeId), true, `stage ${level} should craft ${recipeId}`);
    assert.equal(isOrderComplete(game), true, `stage ${level} should complete`);
    const progress = orderProgress(game);
    assert.equal(progress.delivered, progress.total);
  }
});

test("workshop orders vary from day one without back-to-back repeats", () => {
  const signatures = [];
  for (let level = 2; level <= MAX_LEVEL; level += 3) {
    const game = makeOrderStage(level);
    signatures.push(game.orders.map((order) => `${order.productId}x${order.required}`).sort().join("|"));
  }
  assert.equal(new Set(signatures.slice(0, 7)).size, 7);
  assert.ok(signatures.every((signature, index) => !index || signature !== signatures[index - 1]));
  assert.ok(new Set(signatures).size >= 350);
});

test("all 400 word stages contain the exact shuffled answer letters", () => {
  const campaignWords = new Set();
  for (let level = 3; level <= MAX_LEVEL; level += 3) {
    const game = makeWordStage(level);
    const letters = game.wordState.letters.map((item) => item.letter).sort().join("");
    assert.equal(letters, [...game.wordState.word].sort().join(""));
    campaignWords.add(game.wordState.word);
  }
  assert.ok(wordPuzzles.length >= 400);
  assert.equal(new Set(wordPuzzles.map((puzzle) => puzzle.word)).size, wordPuzzles.length);
  assert.equal(campaignWords.size, 400, "the one-year campaign must not repeat a word");
});

test("difficulty grows over garden days instead of jumping after a few stages", () => {
  assert.equal(puzzleSize(1), 4);
  assert.equal(puzzleSize(60), 4);
  assert.equal(puzzleSize(61), 5);
  assert.equal(puzzleSize(300), 5);
  assert.equal(puzzleSize(301), 6);
  assert.equal(puzzleSize(1200), 6);
});

test("a completed garden accepts any conflict-free valid arrangement", () => {
  const game = makeLogicStage(124);
  game.cells.forEach((cell) => { cell.speciesId = cell.solutionId; });
  assert.equal(isGridSolved(game), true);
  game.cells[0].speciesId = game.cells[1].speciesId;
  assert.equal(isGridSolved(game), false);
});

test("village rewards, idle gifts and upgrades form a persistent economy", () => {
  const village = normalizeVillage(structuredClone(defaultVillage), 1_000);
  applyReward(village, stageReward("logic", village, false));
  applyReward(village, stageReward("order", village, false));
  applyReward(village, stageReward("word", village, true));
  assert.equal(canUpgrade(village, "konak"), true);
  assert.equal(upgradeBuilding(village, "konak"), true);
  assert.equal(village.buildings.konak, 2);
  const gift = collectIdleGift(village, 1_000 + 3 * 3_600_000);
  assert.equal(gift.hours, 3);
  assert.ok(village.resources.dal >= gift.dal);
});

test("campaign and daily generators stay deterministic", () => {
  assert.deepEqual(makeLogicStage(307).cells, makeLogicStage(307).cells);
  assert.deepEqual(makeOrderStage(308), makeOrderStage(308));
  assert.deepEqual(makeWordStage(309), makeWordStage(309));
  const day = new Date("2026-09-01T12:00:00Z");
  assert.equal(dailySeed(day), 20260901);
  assert.equal(stageForLevel(1, true, day), stageForLevel(999, true, day));
});

test("missions, constants and recipe library remain explicit", () => {
  const game = makeLogicStage(1);
  assert.equal(missionComplete(game), true);
  game.conflictMoves = 1;
  assert.equal(missionComplete(game), false);
  assert.equal(MAX_LEVEL, 1200);
  assert.equal(species.length, 12);
  assert.ok(workshopRecipes.length >= 10);
  assert.ok(workshopCustomers.length >= 8);
  assert.ok(workshopStories.length >= 8);
  assert.equal(orderMissionComplete(makeOrderStage(2)), true);
  assert.throws(() => makeLogicStage(0), RangeError);
  assert.throws(() => makeOrderStage(0), RangeError);
  assert.throws(() => makeWordStage(1201), RangeError);
});

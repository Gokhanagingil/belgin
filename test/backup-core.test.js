import test from "node:test";
import assert from "node:assert/strict";
import { backupFilename, parseBackup, stringifyBackup } from "../src/backup-core.js";

test("a progress backup survives a round trip", () => {
  const save = { level: 303, score: 8420, completed: [1, 3], skipped: [2], discovered: ["mavi"], dailyCompleted: [] };
  const settings = { sound: false, keepAwake: true, largeText: true };
  const source = stringifyBackup(save, settings, new Date("2026-09-01T12:00:00Z"));
  const restored = parseBackup(source, 1200);
  assert.deepEqual(restored.save, save);
  assert.deepEqual(restored.settings, settings);
  assert.equal(backupFilename(new Date("2026-09-01T12:00:00Z")), "kus-koyu-kayit-2026-09-01.json");
});

test("invalid and oversized backup files fail closed", () => {
  assert.throws(() => parseBackup("not-json", 1200), /geçerli bir Kuş Köyü/);
  assert.throws(() => parseBackup(JSON.stringify({ format: "kus-koyu-backup", version: 1, save: { level: 0 }, settings: {} }), 1200), /bölüm bilgisi/);
  assert.throws(() => parseBackup("x".repeat(250_001), 1200), /kadar büyük/);
});

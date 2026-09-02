export const FLEET_SIZE = 4;

export const fleetVessels = [
  { rank: 1, id: "kayik", name: "Minik Kayık", short: "Kayık", color: "#ca7a45", accent: "#f4c46f", kind: "rowboat" },
  { rank: 2, id: "sandal", name: "Yelkenli Sandal", short: "Sandal", color: "#4e9bb3", accent: "#fff3c4", kind: "sailboat" },
  { rank: 3, id: "motor", name: "Motorlu Tekne", short: "Motor", color: "#d66d55", accent: "#f8e2b5", kind: "motorboat" },
  { rank: 4, id: "balikci", name: "Balıkçı Teknesi", short: "Balıkçı", color: "#4f8e75", accent: "#e9b95e", kind: "fishing" },
  { rank: 5, id: "yat", name: "Gezi Yatı", short: "Yat", color: "#486f9e", accent: "#f6f2df", kind: "yacht" },
  { rank: 6, id: "feribot", name: "Ada Feribotu", short: "Feribot", color: "#d88a3d", accent: "#fff0c8", kind: "ferry" },
  { rank: 7, id: "kargo", name: "Konteyner Gemisi", short: "Kargo", color: "#547b72", accent: "#e66f55", kind: "cargo" },
  { rank: 8, id: "kruvaziyer", name: "Kruvaziyer", short: "Kruvaziyer", color: "#5975a5", accent: "#f3c768", kind: "cruise" },
  { rank: 9, id: "okyanus", name: "Okyanus Gemisi", short: "Okyanus", color: "#405d84", accent: "#db7458", kind: "liner" },
  { rank: 10, id: "transatlantik", name: "Büyük Transatlantik", short: "Transatlantik", color: "#334e72", accent: "#e8b64f", kind: "transatlantic" }
];

export const defaultFleetVoyage = {
  board: null,
  bestRank: 1,
  totalScore: 0,
  rngState: 2048,
  discovered: [1]
};

export function normalizeFleetVoyage(value) {
  const board = validBoard(value?.board) ? value.board.map(normalizeRank) : null;
  const bestOnBoard = board ? Math.max(1, ...board) : 1;
  const bestRank = clampRank(Math.max(Number(value?.bestRank) || 1, bestOnBoard));
  const discovered = Array.from(new Set([
    1,
    ...(Array.isArray(value?.discovered) ? value.discovered.map(normalizeRank).filter(Boolean) : []),
    ...Array.from({ length: bestRank }, (_, index) => index + 1)
  ])).sort((a, b) => a - b);
  return {
    board,
    bestRank,
    totalScore: Math.max(0, Number(value?.totalScore) || 0),
    rngState: normalizeSeed(value?.rngState),
    discovered
  };
}

export function makeFleetStage(level, daily = false, date = new Date(), voyage = defaultFleetVoyage) {
  const normalized = normalizeFleetVoyage(voyage);
  const day = Math.ceil(level / 3);
  const game = {
    version: 5,
    mode: "fleet",
    level,
    day,
    daily,
    status: "playing",
    board: normalized.board ? [...normalized.board] : Array(FLEET_SIZE ** 2).fill(0),
    bestRank: normalized.bestRank,
    totalScore: normalized.totalScore,
    startScore: normalized.totalScore,
    rngState: normalized.rngState || seedFrom(level, daily, date),
    discovered: [...normalized.discovered],
    merges: 0,
    targetMerges: fleetTargetForDay(day),
    history: [],
    helpsUsed: 0,
    undoCount: 0,
    tutorialMoves: 0,
    fleetFeedback: null,
    busy: false
  };
  if (!game.board.some(Boolean)) startFleetBoard(game);
  return game;
}

export function fleetTargetForDay(day) {
  return Math.min(12, 5 + Math.floor((Math.max(1, day) - 1) / 55));
}

export function applyFleetMove(game, direction) {
  if (!game || game.mode !== "fleet" || game.busy || game.status !== "playing") return { moved: false, score: 0, merges: 0, createdRanks: [] };
  const result = slideFleet(game.board, direction);
  if (!result.moved) return result;
  game.history.push({
    board: [...game.board],
    totalScore: game.totalScore,
    bestRank: game.bestRank,
    discovered: [...game.discovered],
    merges: game.merges,
    rngState: game.rngState
  });
  if (game.history.length > 20) game.history.shift();
  game.board = result.board;
  game.totalScore += result.score;
  game.merges += result.merges;
  const rank = Math.max(...game.board);
  if (rank > game.bestRank) game.bestRank = rank;
  for (let value = 1; value <= game.bestRank; value += 1) if (!game.discovered.includes(value)) game.discovered.push(value);
  spawnFleetTile(game);
  return result;
}

export function undoFleetMove(game) {
  const previous = game?.history?.pop();
  if (!previous || game.busy) return false;
  game.board = previous.board;
  game.totalScore = previous.totalScore;
  game.bestRank = previous.bestRank;
  game.discovered = previous.discovered;
  game.merges = previous.merges;
  game.rngState = previous.rngState;
  game.undoCount += 1;
  return true;
}

export function slideFleet(board, direction) {
  if (!validBoard(board) || !["left", "right", "up", "down"].includes(direction)) {
    return { board: validBoard(board) ? [...board] : Array(FLEET_SIZE ** 2).fill(0), moved: false, score: 0, merges: 0, createdRanks: [] };
  }
  const next = [...board];
  let score = 0;
  let merges = 0;
  const createdRanks = [];
  for (const indices of movementLines(direction)) {
    const compact = indices.map((index) => board[index]).filter(Boolean);
    const merged = [];
    for (let index = 0; index < compact.length; index += 1) {
      if (compact[index] === compact[index + 1] && compact[index] < fleetVessels.length) {
        const rank = compact[index] + 1;
        merged.push(rank);
        createdRanks.push(rank);
        score += 2 ** (rank + 1);
        merges += 1;
        index += 1;
      } else merged.push(compact[index]);
    }
    while (merged.length < FLEET_SIZE) merged.push(0);
    indices.forEach((boardIndex, offset) => { next[boardIndex] = merged[offset]; });
  }
  return { board: next, moved: next.some((value, index) => value !== board[index]), score, merges, createdRanks };
}

export function fleetMoveAdvice(board) {
  if (!validBoard(board)) return null;
  const directions = ["left", "right", "up", "down"];
  return directions.find((direction) => slideFleet(board, direction).merges > 0)
    || directions.find((direction) => slideFleet(board, direction).moved)
    || null;
}

export function hasFleetMoves(board) {
  if (!validBoard(board)) return false;
  if (board.some((rank) => rank === 0)) return true;
  for (let row = 0; row < FLEET_SIZE; row += 1) {
    for (let col = 0; col < FLEET_SIZE; col += 1) {
      const index = row * FLEET_SIZE + col;
      if (col + 1 < FLEET_SIZE && board[index] === board[index + 1]) return true;
      if (row + 1 < FLEET_SIZE && board[index] === board[index + FLEET_SIZE]) return true;
    }
  }
  return false;
}

export function resetFleetBoard(game) {
  game.board = Array(FLEET_SIZE ** 2).fill(0);
  game.history = [];
  game.tutorialMoves = 0;
  game.fleetFeedback = null;
  startFleetBoard(game);
}

export function fleetMissionComplete(game) {
  return game.merges >= game.targetMerges;
}

export function fleetVoyageFromGame(game) {
  return normalizeFleetVoyage({
    board: game.board,
    bestRank: game.bestRank,
    totalScore: game.totalScore,
    rngState: game.rngState,
    discovered: game.discovered
  });
}

export function vesselForRank(rank) {
  return fleetVessels[Math.max(0, Math.min(fleetVessels.length - 1, Number(rank) - 1))];
}

function spawnFleetTile(game) {
  const empty = game.board.map((value, index) => value ? -1 : index).filter((index) => index >= 0);
  if (!empty.length) return false;
  const position = empty[Math.floor(nextRandom(game) * empty.length)];
  game.board[position] = nextRandom(game) < 0.9 ? 1 : 2;
  return true;
}

function startFleetBoard(game) {
  // İlk hamlede kuralı tesadüfe bırakma: ortadaki iki kayık tek kaydırmayla birleşebilir.
  game.board[5] = 1;
  game.board[6] = 1;
}

function nextRandom(game) {
  game.rngState = (Math.imul(normalizeSeed(game.rngState), 1664525) + 1013904223) >>> 0;
  return game.rngState / 4294967296;
}

function movementLines(direction) {
  const lines = [];
  for (let line = 0; line < FLEET_SIZE; line += 1) {
    const indices = [];
    for (let offset = 0; offset < FLEET_SIZE; offset += 1) {
      if (direction === "left") indices.push(line * FLEET_SIZE + offset);
      if (direction === "right") indices.push(line * FLEET_SIZE + (FLEET_SIZE - 1 - offset));
      if (direction === "up") indices.push(offset * FLEET_SIZE + line);
      if (direction === "down") indices.push((FLEET_SIZE - 1 - offset) * FLEET_SIZE + line);
    }
    lines.push(indices);
  }
  return lines;
}

function validBoard(board) {
  return Array.isArray(board) && board.length === FLEET_SIZE ** 2 && board.every((rank) => Number.isInteger(Number(rank)) && Number(rank) >= 0);
}

function normalizeRank(rank) {
  const value = Math.floor(Number(rank) || 0);
  return value <= 0 ? 0 : clampRank(value);
}

function clampRank(rank) {
  return Math.min(fleetVessels.length, Math.max(1, Math.floor(rank)));
}

function normalizeSeed(seed) {
  const value = Number(seed);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) >>> 0 : 2048;
}

function seedFrom(level, daily, date) {
  return daily ? Number(date.toISOString().slice(0, 10).replaceAll("-", "")) : (level * 2654435761) >>> 0;
}

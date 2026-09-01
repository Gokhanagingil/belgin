export const TRAY_LIMIT = 7;
export const MAX_LEVEL = 1200;

export const species = [
  { id: "mavi", name: "Maviş", body: "#68a9cf", chest: "#d9f1ef", wing: "#3678a2", accent: "#f0b44d", mark: "dots" },
  { id: "nar", name: "Nar Bülbülü", body: "#cf6656", chest: "#f4c8a2", wing: "#9e463d", accent: "#e9a13e", mark: "bib" },
  { id: "limon", name: "Limon İspinozu", body: "#e8c94b", chest: "#fff1a9", wing: "#91833a", accent: "#d68f38", mark: "stripe" },
  { id: "leylak", name: "Leylak Kuşu", body: "#9878bd", chest: "#eadff2", wing: "#65508f", accent: "#e2a654", mark: "dots" },
  { id: "zeytin", name: "Zeytin Baştankarası", body: "#718d55", chest: "#dbe3ad", wing: "#465f39", accent: "#d68f38", mark: "bib" },
  { id: "mercan", name: "Mercan Kuşu", body: "#e17f78", chest: "#ffe0d0", wing: "#b45661", accent: "#efb342", mark: "stripe" },
  { id: "gece", name: "Gece Sakası", body: "#536778", chest: "#d9e0df", wing: "#283d4e", accent: "#e1a442", mark: "mask" },
  { id: "turkuaz", name: "Turkuaz Ardıç", body: "#4aa9a0", chest: "#caece4", wing: "#24736f", accent: "#e49c45", mark: "dots" },
  { id: "gul", name: "Gül Sığırcığı", body: "#c77e9e", chest: "#f4d5e1", wing: "#8d4f71", accent: "#e2a348", mark: "mask" },
  { id: "tarçın", name: "Tarçın Serçesi", body: "#b67b51", chest: "#ead2ad", wing: "#745039", accent: "#df9c42", mark: "stripe" },
  { id: "buz", name: "Buzkuşu", body: "#86b7c7", chest: "#edf7f4", wing: "#477c91", accent: "#e5a84a", mark: "bib" },
  { id: "erik", name: "Erik Baştankarası", body: "#80608c", chest: "#d9c6d9", wing: "#55405d", accent: "#e5a84a", mark: "mask" }
];

export function dailySeed(date = new Date()) {
  return Number(date.toISOString().slice(0, 10).replaceAll("-", ""));
}

export function makeLevel(level, daily = false, date = new Date()) {
  if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) {
    throw new RangeError(`Bölüm 1 ile ${MAX_LEVEL} arasında olmalıdır.`);
  }

  const rng = seededRandom(daily ? dailySeed(date) : level * 9973 + 41);
  const speciesCount = Math.min(4 + Math.floor((level - 1) / 3), species.length);
  const tripleCount = Math.min(8 + Math.floor((level - 1) / 2), 14);
  const available = species.slice(0, speciesCount);
  const board = [];

  // Her kuş üçlü bir paket halinde üretildiği için bölüm, sıralama nasıl
  // değişirse değişsin matematiksel olarak tamamlanabilir kalır.
  for (let i = 0; i < tripleCount; i += 1) {
    const bird = available[Math.floor(rng() * available.length)];
    for (let n = 0; n < 3; n += 1) {
      board.push({
        uid: `${daily ? "daily" : level}-${i}-${n}-${Math.floor(rng() * 1e7)}`,
        speciesId: bird.id
      });
    }
  }

  for (let i = board.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [board[i], board[j]] = [board[j], board[i]];
  }

  return {
    level,
    daily,
    board,
    tray: [],
    removed: [],
    history: [],
    initialCount: board.length,
    hints: 3,
    shuffles: 2,
    status: "playing",
    busy: false
  };
}

function seededRandom(seed) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => (value = value * 16807 % 2147483647) / 2147483647;
}

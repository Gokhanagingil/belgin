import { extraWordPuzzles } from "./extra-word-puzzles.js";

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

export const wordPuzzles = [
  { word: "BAHÇE", clue: "Kuşların ve çiçeklerin huzurlu evi" },
  { word: "KANAT", clue: "Kuşu gökyüzüne taşıyan iki güç" },
  { word: "SERÇE", clue: "Şehirlerde sık gördüğümüz küçük kuş" },
  { word: "YAPRAK", clue: "Dalların yeşil süsü" },
  { word: "YUVA", clue: "Bir kuşun güvenli evi" },
  { word: "GÜNEŞ", clue: "Bahçeyi ısıtan gökyüzü ışığı" },
  { word: "RÜZGAR", clue: "Yaprakları dans ettiren hava" },
  { word: "TOHUM", clue: "Yeni bir bitkinin başlangıcı" },
  { word: "ORMAN", clue: "Ağaçlarla kaplı büyük yaşam alanı" },
  { word: "ÇİÇEK", clue: "Bahçenin renkli ve kokulu konuğu" },
  { word: "BULUT", clue: "Gökyüzünde gezen beyaz küme" },
  { word: "PINAR", clue: "Topraktan çıkan berrak su" },
  { word: "MEŞE", clue: "Palamut veren güçlü ağaç" },
  { word: "LALE", clue: "Baharın zarif çiçeklerinden biri" },
  { word: "DERE", clue: "Küçük, akışkan su yolu" },
  { word: "NEHİR", clue: "Denize doğru akan büyük su" },
  { word: "MARTI", clue: "Deniz kıyılarının sesli beyaz kuşu" },
  { word: "KUMRU", clue: "Yumuşak sesiyle bilinen şehir kuşu" },
  { word: "KUĞU", clue: "Uzun boyunlu zarif su kuşu" },
  { word: "ÖRDEK", clue: "Suda yüzen geniş gagalı kuş" },
  { word: "ARDIÇ", clue: "Kışın da yeşil kalan kokulu ağaç" },
  { word: "ÇINAR", clue: "Geniş yapraklı, uzun ömürlü ağaç" },
  { word: "KAVAK", clue: "İnce ve uzun boylu ağaç" },
  { word: "KAYIN", clue: "Düz gövdeli görkemli orman ağacı" },
  { word: "AKASYA", clue: "Salkım çiçekli hoş kokulu ağaç" },
  { word: "ZEYTİN", clue: "Meyvesinden yağ yapılan bereket ağacı" },
  { word: "İNCİR", clue: "İçi çekirdek dolu tatlı yaz meyvesi" },
  { word: "CEVİZ", clue: "Sert kabuklu, beyni andıran yemiş" },
  { word: "FINDIK", clue: "Karadeniz'in küçük yuvarlak yemişi" },
  { word: "LİMON", clue: "Sarı renkli ekşi meyve" },
  { word: "MEYVE", clue: "Ağacın yenebilen renkli armağanı" },
  { word: "FİDAN", clue: "Henüz büyümekte olan genç ağaç" },
  { word: "ÇAYIR", clue: "Otlarla kaplı geniş düzlük" },
  { word: "TARLA", clue: "Ürün yetiştirilen geniş toprak" },
  { word: "SAKSI", clue: "Çiçeklerin evdeki küçük yuvası" },
  { word: "SEPET", clue: "Bahçeden toplananları taşıyan örgü kap" },
  { word: "PETEK", clue: "Arıların bal doldurduğu odacıklar" },
  { word: "GÖLGE", clue: "Güneşten koruyan serin karanlık" },
  { word: "DAMLA", clue: "Yağmurun tek bir küçük tanesi" },
  { word: "DENİZ", clue: "Ufka uzanan büyük tuzlu su" },
  { word: "IRMAK", clue: "Toprak boyunca akıp giden su" },
  { word: "ŞELALE", clue: "Yüksekten dökülen güçlü su" },
  { word: "KIYI", clue: "Suyla toprağın buluştuğu yer" },
  { word: "YOSUN", clue: "Nemli yerde yetişen yumuşak yeşillik" },
  { word: "IŞIK", clue: "Karanlığı görünür yapan aydınlık" },
  { word: "YILDIZ", clue: "Gece göğünde parlayan uzak ışık" },
  { word: "ŞAFAK", clue: "Güneş doğmadan önceki ilk aydınlık" },
  { word: "SABAH", clue: "Günün güneşle başlayan bölümü" },
  { word: "UFUK", clue: "Gökle yerin birleşir gibi göründüğü çizgi" },
  { word: "NİSAN", clue: "Bahar yağmurlarıyla bilinen ay" },
  { word: "OCAK", clue: "Yılın ilk ayı" },
  { word: "HUZUR", clue: "İnsanın içindeki sakinlik duygusu" },
  { word: "MASAL", clue: "Hayal gücüyle anlatılan eski öykü" },
  { word: "BONCUK", clue: "İpe dizilen küçük renkli süs" },
  { word: "FENER", clue: "Gece yolunu aydınlatan taşınır ışık" },
  { word: "KÖPRÜ", clue: "İki yakayı birbirine bağlayan yapı" },
  { word: "MERCAN", clue: "Deniz altında büyüyen renkli canlı yapı" },
  { word: "ZÜMRÜT", clue: "Derin yeşil renkli değerli taş" },
  { word: "SAFRAN", clue: "Altın renk veren kıymetli baharat" },
  { word: "KEKİK", clue: "Dağlarda yetişen kokulu ot" },
  { word: "REYHAN", clue: "Mor yapraklı hoş kokulu ot" },
  { word: "TARÇIN", clue: "Tatlılara yakışan kokulu baharat" },
  { word: "NERGİS", clue: "Sarı göbekli kokulu bahar çiçeği" },
  { word: "ZAMBAK", clue: "Büyük ve gösterişli çiçek" },
  { word: "SÜMBÜL", clue: "Salkım salkım açan kokulu çiçek" },
  { word: "ÇİĞDEM", clue: "Soğukta bile açabilen kır çiçeği" },
  { word: "LEYLAK", clue: "Mor salkımlı kokulu bahçe çalısı" },
  { word: "KORU", clue: "Bakımlı küçük ormanlık alan" },
  { word: "EVREN", clue: "Gökyüzü ve ötesindeki her şey" },
  { word: "ÇİMEN", clue: "Toprağı örten kısa yeşil otlar" },
  { word: "DOST", clue: "Güvendiğimiz yakın arkadaş" },
  { word: "UMUT", clue: "Geleceğe dair güzel beklenti" },
  { word: "NEŞE", clue: "İçimizi canlandıran sevinç" },
  { word: "EMEK", clue: "Bir işi başarmak için verilen çaba" },
  { word: "SABIR", clue: "Sakin biçimde bekleme gücü" },
  { word: "ANLAM", clue: "Bir sözün bize anlattığı düşünce" },
  { word: "RENK", clue: "Çevremizi farklı gösteren görsel özellik" },
  { word: "EZGİ", clue: "Kulağa hoş gelen düzenli sesler" },
  { word: "NAĞME", clue: "Bir ezginin kulağa hoş gelen parçası" },
  ...extraWordPuzzles
];

export function dailySeed(date = new Date()) {
  return Number(date.toISOString().slice(0, 10).replaceAll("-", ""));
}

export function gardenDay(level) {
  return Math.ceil(level / 3);
}

export function stageForLevel(level, daily = false, date = new Date()) {
  if (daily) return ["logic", "fleet", "word"][dailySeed(date) % 3];
  return ["logic", "fleet", "word"][(level - 1) % 3];
}

export function puzzleSize(level) {
  const day = gardenDay(level);
  if (day <= 20) return 4;
  if (day <= 100) return 5;
  return 6;
}

export function getConflicts(cells, size) {
  const conflicts = new Set();
  const scan = (indices) => {
    const seen = new Map();
    for (const index of indices) {
      const id = cells[index].speciesId;
      if (!id) continue;
      if (seen.has(id)) {
        conflicts.add(index);
        conflicts.add(seen.get(id));
      } else seen.set(id, index);
    }
  };
  for (let row = 0; row < size; row += 1) scan(Array.from({ length: size }, (_, col) => row * size + col));
  for (let col = 0; col < size; col += 1) scan(Array.from({ length: size }, (_, row) => row * size + col));
  return conflicts;
}

export function inventoryFor(game) {
  const counts = Object.fromEntries(game.speciesIds.map((id) => [id, game.size]));
  for (const cell of game.cells) if (cell.speciesId) counts[cell.speciesId] -= 1;
  return counts;
}

export function candidatesForCell(game, cellIndex) {
  const cell = game.cells[cellIndex];
  if (!cell || cell.given) return [];
  const blocked = new Set();
  for (const item of game.cells) {
    if (item.index === cellIndex || !item.speciesId) continue;
    if (item.row === cell.row || item.col === cell.col) blocked.add(item.speciesId);
  }
  return game.speciesIds.filter((id) => !blocked.has(id));
}

export function logicHintFor(game) {
  const conflicts = getConflicts(game.cells, game.size);
  const previousTarget = Number(game.hintTrail?.targetIndex);
  const previousCell = Number.isInteger(previousTarget) ? game.cells[previousTarget] : null;
  const conflictTarget = previousCell && conflicts.has(previousTarget)
    ? previousCell
    : game.cells.find((cell) => !cell.given && conflicts.has(cell.index));
  if (conflictTarget) {
    const sameBird = species.find((item) => item.id === conflictTarget.speciesId);
    const step = conflictTarget.index === previousTarget ? Math.min(2, Number(game.hintTrail?.step || 0) + 1) : 0;
    const rowMatch = game.cells.some((cell) => cell.index !== conflictTarget.index && cell.row === conflictTarget.row && cell.speciesId === conflictTarget.speciesId);
    const line = rowMatch ? `${conflictTarget.row + 1}. satırda` : `${conflictTarget.col + 1}. sütunda`;
    const location = `${conflictTarget.row + 1}. satırdaki ${conflictTarget.col + 1}. yuva`;
    if (step === 0) return { targetIndex: conflictTarget.index, step, speciesId: null, title: "Tekrarı fark et", copy: `${location} parlıyor. Bu yuvadaki kuş aynı satırda veya sütunda bir kez daha bulunuyor.` };
    if (step === 1) return { targetIndex: conflictTarget.index, step, speciesId: null, title: "Çakışmayı karşılaştır", copy: `${sameBird?.name || "Bu kuş"} ${line} tekrar ediyor. Parlayan yuvayı ve diğer ${sameBird?.name || "kuşu"} yan yana düşün.` };
    return { targetIndex: conflictTarget.index, step, speciesId: null, title: "Bir adım geri düşün", copy: `Parlayan yuvadaki ${sameBird?.name || "kuşu"} geri alıp satır ve sütunda eksik kalan türü dene.` };
  }
  const stillUseful = previousCell && !previousCell.given && !previousCell.speciesId;
  const candidates = game.cells
    .filter((cell) => !cell.given && !cell.speciesId)
    .map((cell) => ({ cell, choices: candidatesForCell(game, cell.index) }))
    .sort((a, b) => a.choices.length - b.choices.length);
  const target = stillUseful
    ? candidates.find((item) => item.cell.index === previousTarget)
    : candidates[0];
  if (!target) return null;
  const step = stillUseful ? Math.min(2, Number(game.hintTrail?.step || 0) + 1) : 0;
  const bird = species.find((item) => item.id === target.cell.solutionId);
  const names = target.choices.map((id) => species.find((item) => item.id === id)?.name).filter(Boolean);
  const location = `${target.cell.row + 1}. satırdaki ${target.cell.col + 1}. yuva`;
  if (!target.choices.length) {
    const editableBlocker = game.cells.find((cell) => !cell.given && cell.speciesId && (cell.row === target.cell.row || cell.col === target.cell.col));
    const blockerBird = editableBlocker ? species.find((item) => item.id === editableBlocker.speciesId) : null;
    if (step === 0) return { targetIndex: target.cell.index, step, speciesId: null, title: "Bu yuva kilitlendi", copy: `${location} için uygun kuş kalmamış. Daha önce koyduğun kuşlardan biri satırı veya sütunu kapatıyor.` };
    if (step === 1 || !editableBlocker) return { targetIndex: target.cell.index, step, speciesId: null, title: "Önce alan aç", copy: "Bu satır ve sütunda kendi yerleştirdiğin kuşları karşılaştır; birini geri alarak eksik tür için yer aç." };
    return { targetIndex: target.cell.index, step, speciesId: null, title: "Geri alınacak yeri bul", copy: `${editableBlocker.row + 1}. satırdaki ${editableBlocker.col + 1}. yuvaya koyduğun ${blockerBird?.name || "kuşu"} geri almayı dene.` };
  }
  if (step === 0) {
    return {
      targetIndex: target.cell.index,
      step,
      speciesId: null,
      title: `${target.cell.row + 1}. satıra odaklan`,
      copy: `${location} parlıyor. Önce bu satırda ve sütunda bulunan kuşları ele; tekrar eden kuş olamaz.`
    };
  }
  if (step === 1) {
    const copy = names.length === 1
      ? `Eledikten sonra bu yuvaya yalnız ${names[0]} kalıyor.`
      : `Bu yuva için güçlü adaylar: ${names.slice(0, 3).join(" ve ")}. Sütundaki kuşları bir kez daha karşılaştır.`;
    return { targetIndex: target.cell.index, step, speciesId: names.length === 1 ? target.cell.solutionId : null, title: "Adayları daralt", copy };
  }
  const suggestedId = target.choices.includes(target.cell.solutionId) ? target.cell.solutionId : target.choices[0];
  const suggestedBird = species.find((item) => item.id === suggestedId) || bird;
  return {
    targetIndex: target.cell.index,
    step,
    speciesId: suggestedId,
    title: "Son düşünme adımı",
    copy: `${location} için uygun seçim ${suggestedBird.name}. Kuşu aşağıdan sen seçip yuvaya yerleştir.`
  };
}

export function isGridSolved(game) {
  return game.cells.every((cell) => cell.speciesId) && getConflicts(game.cells, game.size).size === 0;
}

export function missionForLevel(level) {
  const missions = [
    { type: "conflicts", target: 0, title: "Temiz uçuş", copy: "Hiç çakışma yapmadan bahçeyi tamamla." },
    { type: "helps", target: 0, title: "Usta göz", copy: "İpucu kullanmadan tamamla." },
    { type: "undos", target: 2, title: "Kararlı adımlar", copy: "En fazla 2 kez geri al." }
  ];
  return missions[Math.floor((level - 1) / 4) % missions.length];
}

export function missionComplete(game) {
  if (game.mission.type === "conflicts") return game.conflictMoves <= game.mission.target;
  if (game.mission.type === "helps") return game.helpsUsed <= game.mission.target;
  return game.undoCount <= game.mission.target;
}

export function wordForLevel(level, daily = false, date = new Date()) {
  const index = daily ? dailySeed(date) : Math.floor((level - 1) / 3);
  return wordPuzzles[Math.abs(index) % wordPuzzles.length];
}

export function makeWordState(level, daily = false, date = new Date()) {
  const puzzle = wordForLevel(level, daily, date);
  const rng = seededRandom((daily ? dailySeed(date) : level * 701) + 19);
  const letters = [...puzzle.word].map((letter, index) => ({ letter, index, used: false }));
  shuffle(letters, rng);
  if (letters.map((item) => item.letter).join("") === puzzle.word) letters.push(letters.shift());
  return { ...puzzle, letters, answer: [], attempts: 0, hintUsed: false };
}

export function makeWordStage(level, daily = false, date = new Date()) {
  validateLevel(level);
  return {
    version: 4,
    mode: "word",
    level,
    day: gardenDay(level),
    daily,
    status: "playing",
    wordState: makeWordState(level, daily, date),
    hints: 3,
    rewardedHintUsed: false,
    hintStep: 0,
    activeHint: null,
    helpsUsed: 0,
    busy: false
  };
}

export function makeLogicStage(level, daily = false, date = new Date()) {
  validateLevel(level);
  const day = gardenDay(level);
  const seed = daily ? dailySeed(date) : level * 9973 + 41;
  const rng = seededRandom(seed);
  const size = puzzleSize(level);
  const offset = Math.floor((day - 1) / 8) % species.length;
  const available = Array.from({ length: size }, (_, index) => species[(offset + index) % species.length]);
  const symbolOrder = shuffledRange(size, rng);
  const rowOrder = shuffledRange(size, rng);
  const colOrder = shuffledRange(size, rng);
  const solution = Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size);
    const col = index % size;
    return available[symbolOrder[(rowOrder[row] + colOrder[col]) % size]].id;
  });

  const baseGivens = size === 4 ? 7 : size === 5 ? 10 : 15;
  const challengeStep = size === 4 ? Math.floor((day - 1) / 5) : Math.floor((day - 1) / 18);
  const givenCount = Math.max(size, baseGivens - (challengeStep % 4));
  const tutorial = day <= 2 ? chooseTutorialGivens(size, givenCount, rng, day) : null;
  const givenIndices = tutorial?.givenIndices || chooseGivens(size, givenCount, rng);
  const cells = solution.map((solutionId, index) => ({
    index,
    row: Math.floor(index / size),
    col: index % size,
    given: givenIndices.has(index),
    speciesId: givenIndices.has(index) ? solutionId : null,
    solutionId
  }));

  return {
    version: 4,
    mode: "logic",
    level,
    day,
    daily,
    size,
    speciesIds: available.map((bird) => bird.id),
    cells,
    tutorialTargetIndex: tutorial?.targetIndex ?? null,
    selectedSpeciesId: null,
    history: [],
    hints: 3,
    rewardedHintUsed: false,
    hintTrail: null,
    activeHint: null,
    clears: 2,
    helpsUsed: 0,
    undoCount: 0,
    conflictMoves: 0,
    status: "playing",
    mission: missionForLevel(level),
    busy: false
  };
}

function chooseTutorialGivens(size, count, rng, day) {
  const teachesColumn = day === 2;
  const targetIndex = teachesColumn ? (size - 1) * size : size - 1;
  const selected = new Set();
  if (teachesColumn) {
    for (let row = 0; row < size - 1; row += 1) selected.add(row * size);
    for (let col = 1; col < size; col += 1) selected.add(((col + 1) % size) * size + col);
  } else {
    for (let col = 0; col < size - 1; col += 1) selected.add(col);
    for (let row = 1; row < size; row += 1) selected.add(row * size + ((row + 1) % size));
  }
  for (const index of shuffledRange(size * size, rng)) {
    if (selected.size >= count) break;
    if (index !== targetIndex) selected.add(index);
  }
  return { givenIndices: selected, targetIndex };
}

// Eski entegrasyonlar için mantık bulmacası üreticisinin uyumlu adı.
export function makeLevel(level, daily = false, date = new Date()) {
  return makeLogicStage(level, daily, date);
}

function validateLevel(level) {
  if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) {
    throw new RangeError(`Bölüm 1 ile ${MAX_LEVEL} arasında olmalıdır.`);
  }
}

function chooseGivens(size, count, rng) {
  const selected = new Set();
  for (let row = 0; row < size; row += 1) selected.add(row * size + Math.floor(rng() * size));
  for (let col = 0; col < size; col += 1) selected.add(Math.floor(rng() * size) * size + col);
  const candidates = shuffledRange(size * size, rng);
  for (const index of candidates) {
    if (selected.size >= count) break;
    selected.add(index);
  }
  return selected;
}

function shuffledRange(length, rng) {
  const values = Array.from({ length }, (_, index) => index);
  return shuffle(values, rng);
}

function shuffle(values, rng) {
  for (let i = values.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

function seededRandom(seed) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => (value = value * 16807 % 2147483647) / 2147483647;
}

export const villageBuildings = [
  { id: "konak", name: "Kuş Konağı", icon: "🏡", copy: "Köyün kalbi; mantık ödüllerini ve dönüş hediyelerini güçlendirir.", accent: "#d88755" },
  { id: "sera", name: "Günışığı Serası", icon: "🌿", copy: "Siparişlerden daha fazla tohum kazandırır.", accent: "#6c9d5c" },
  { id: "atolye", name: "Bahçe Atölyesi", icon: "🛠️", copy: "Üretim ödüllerini ve dönüş hediyelerini güçlendirir.", accent: "#aa744b" },
  { id: "kutuphane", name: "Çınar Kütüphanesi", icon: "📚", copy: "Sözcüklerden daha fazla damla kazandırır.", accent: "#7586a9" }
];

export const defaultVillage = {
  resources: { dal: 4, tohum: 4, damla: 4 },
  buildings: { konak: 1, sera: 1, atolye: 1, kutuphane: 1 },
  lastCollected: 0,
  upgrades: 0
};

export function normalizeVillage(value, now = Date.now()) {
  return {
    ...defaultVillage,
    ...(value || {}),
    resources: { ...defaultVillage.resources, ...(value?.resources || {}) },
    buildings: { ...defaultVillage.buildings, ...(value?.buildings || {}) },
    lastCollected: value?.lastCollected || now
  };
}

export function upgradeCost(buildingId, currentLevel) {
  const bases = {
    konak: { dal: 9, tohum: 7, damla: 6 },
    sera: { dal: 6, tohum: 9, damla: 5 },
    atolye: { dal: 10, tohum: 5, damla: 6 },
    kutuphane: { dal: 6, tohum: 5, damla: 9 }
  };
  const scale = 1 + Math.max(0, currentLevel - 1) * .55;
  return Object.fromEntries(Object.entries(bases[buildingId]).map(([id, amount]) => [id, Math.ceil(amount * scale)]));
}

export function canUpgrade(village, buildingId) {
  const level = village.buildings[buildingId];
  if (!level || level >= 20) return false;
  if (buildingId !== "konak" && level >= village.buildings.konak + 1) return false;
  const cost = upgradeCost(buildingId, level);
  return Object.entries(cost).every(([id, amount]) => village.resources[id] >= amount);
}

export function upgradeBuilding(village, buildingId) {
  if (!canUpgrade(village, buildingId)) return false;
  const level = village.buildings[buildingId];
  const cost = upgradeCost(buildingId, level);
  for (const [id, amount] of Object.entries(cost)) village.resources[id] -= amount;
  village.buildings[buildingId] += 1;
  village.upgrades += 1;
  return true;
}

export function stageReward(mode, village, completesDay = false) {
  const reward = { dal: 1, tohum: 1, damla: 1 };
  if (mode === "logic") reward.dal += 3 + village.buildings.konak - 1;
  if (mode === "order") reward.tohum += 3 + village.buildings.sera + village.buildings.atolye - 2;
  if (mode === "word") reward.damla += 3 + village.buildings.kutuphane - 1;
  if (completesDay) {
    reward.dal += 2;
    reward.tohum += 2;
    reward.damla += 2;
  }
  return reward;
}

export function applyReward(village, reward) {
  for (const [id, amount] of Object.entries(reward)) village.resources[id] += amount;
}

export function idleGift(village, now = Date.now()) {
  const hours = Math.min(8, Math.floor((now - village.lastCollected) / 3600000));
  if (hours < 1) return null;
  const strength = Math.max(1, Math.floor((village.buildings.konak + village.buildings.sera + village.buildings.atolye + village.buildings.kutuphane) / 5));
  return { hours, dal: hours * strength, tohum: hours * strength, damla: hours * strength };
}

export function collectIdleGift(village, now = Date.now()) {
  const gift = idleGift(village, now);
  if (!gift) return null;
  applyReward(village, { dal: gift.dal, tohum: gift.tohum, damla: gift.damla });
  village.lastCollected = now;
  return gift;
}

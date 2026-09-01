export const workshopItems = {
  su: { id: "su", name: "Kaynak suyu", icon: "💧", raw: true },
  meyve: { id: "meyve", name: "Orman meyvesi", icon: "🫐", raw: true },
  tohum: { id: "tohum", name: "Altın tohum", icon: "🌾", raw: true },
  dal: { id: "dal", name: "Sağlam dal", icon: "🪵", raw: true },
  yaprak: { id: "yaprak", name: "Taze yaprak", icon: "🍃", raw: true },
  tuy: { id: "tuy", name: "Yumuşak tüy", icon: "🪶", raw: true },
  cay_ozu: { id: "cay_ozu", name: "Meyve özü", icon: "🫙" },
  iplik: { id: "iplik", name: "Bahçe ipliği", icon: "🧶" },
  hamur: { id: "hamur", name: "Tohum hamuru", icon: "🥣" },
  sicak_cay: { id: "sicak_cay", name: "Sıcak meyve çayı", icon: "🍵" },
  sepet: { id: "sepet", name: "Tohum sepeti", icon: "🧺" },
  battaniye: { id: "battaniye", name: "Yuva battaniyesi", icon: "🧣" },
  kurabiye: { id: "kurabiye", name: "Tohum kurabiyesi", icon: "🍪" },
  kus_evi: { id: "kus_evi", name: "Minik kuş evi", icon: "🏠" },
  cicek_demeti: { id: "cicek_demeti", name: "Bahçe demeti", icon: "💐" },
  recel: { id: "recel", name: "Orman reçeli", icon: "🍯" },
  pasta: { id: "pasta", name: "Meyveli pasta", icon: "🍰" }
};

export const workshopRecipes = [
  { id: "cay_ozu", output: "cay_ozu", inputs: ["meyve", "su"], station: "Çaydanlık", tier: 1 },
  { id: "iplik", output: "iplik", inputs: ["yaprak", "tuy"], station: "Dokuma", tier: 1 },
  { id: "hamur", output: "hamur", inputs: ["tohum", "su"], station: "Değirmen", tier: 1 },
  { id: "sicak_cay", output: "sicak_cay", inputs: ["cay_ozu", "su"], station: "Çaydanlık", tier: 1, final: true },
  { id: "kus_evi", output: "kus_evi", inputs: ["dal", "dal"], station: "Marangoz", tier: 1, final: true },
  { id: "sepet", output: "sepet", inputs: ["dal", "iplik"], station: "Marangoz", tier: 2, final: true },
  { id: "battaniye", output: "battaniye", inputs: ["iplik", "tuy"], station: "Dokuma", tier: 2, final: true },
  { id: "kurabiye", output: "kurabiye", inputs: ["hamur", "meyve"], station: "Fırın", tier: 2, final: true },
  { id: "cicek_demeti", output: "cicek_demeti", inputs: ["yaprak", "meyve"], station: "Çiçek masası", tier: 3, final: true },
  { id: "recel", output: "recel", inputs: ["cay_ozu", "meyve"], station: "Bakır tencere", tier: 3, final: true },
  { id: "pasta", output: "pasta", inputs: ["hamur", "cay_ozu"], station: "Fırın", tier: 4, final: true }
];

const recipeByOutput = Object.fromEntries(workshopRecipes.map((recipe) => [recipe.output, recipe]));
const rawIds = Object.values(workshopItems).filter((item) => item.raw).map((item) => item.id);

export function makeOrderStage(level, daily = false, date = new Date()) {
  if (!Number.isInteger(level) || level < 1 || level > 1200) {
    throw new RangeError("Aşama 1 ile 1200 arasında olmalıdır.");
  }
  const day = Math.ceil(level / 3);
  const seed = daily ? Number(date.toISOString().slice(0, 10).replaceAll("-", "")) : level * 811 + 73;
  const rng = seededRandom(seed);
  const maxTier = day < 8 ? 1 : day < 25 ? 2 : day < 80 ? 3 : 4;
  const available = workshopRecipes.filter((recipe) => recipe.final && recipe.tier <= maxTier);
  const lineCount = day < 6 ? 2 : day < 45 ? 3 : 4;
  const shuffled = shuffle([...available], rng);
  const orders = shuffled.slice(0, Math.min(lineCount, shuffled.length)).map((recipe) => ({
    productId: recipe.output,
    required: day > 15 && rng() > .72 ? 2 : 1,
    delivered: 0
  }));
  const rawInventory = Object.fromEntries(rawIds.map((id) => [id, 0]));
  const solutionPlan = [];
  for (const order of orders) {
    for (let copy = 0; copy < order.required; copy += 1) expandRequirements(order.productId, rawInventory, solutionPlan);
  }
  if (day > 10) {
    rawInventory[rawIds[Math.floor(rng() * rawIds.length)]] += 1;
    if (day > 60) rawInventory[rawIds[Math.floor(rng() * rawIds.length)]] += 1;
  }
  const inventory = Object.fromEntries(Object.keys(workshopItems).map((id) => [id, rawInventory[id] || 0]));
  return {
    version: 4,
    mode: "order",
    level,
    day,
    daily,
    status: "playing",
    inventory,
    initialInventory: { ...inventory },
    orders,
    solutionPlan,
    optimalMoves: solutionPlan.length,
    moves: 0,
    helpsUsed: 0,
    resetCount: 0,
    history: [],
    availableRecipeIds: workshopRecipes.filter((recipe) => recipe.tier <= maxTier).map((recipe) => recipe.id),
    busy: false
  };
}

function expandRequirements(productId, rawInventory, plan) {
  const recipe = recipeByOutput[productId];
  if (!recipe) {
    rawInventory[productId] = (rawInventory[productId] || 0) + 1;
    return;
  }
  for (const input of recipe.inputs) expandRequirements(input, rawInventory, plan);
  plan.push(productId);
}

export function canCraft(state, recipeId) {
  const recipe = workshopRecipes.find((item) => item.id === recipeId);
  if (!recipe || !state.availableRecipeIds.includes(recipe.id)) return false;
  const needed = countIds(recipe.inputs);
  return Object.entries(needed).every(([id, count]) => (state.inventory[id] || 0) >= count);
}

export function craftOne(state, recipeId) {
  const recipe = workshopRecipes.find((item) => item.id === recipeId);
  if (!recipe || !canCraft(state, recipeId)) return false;
  state.history.push({
    inventory: { ...state.inventory },
    orders: state.orders.map((order) => ({ ...order })),
    moves: state.moves
  });
  const needed = countIds(recipe.inputs);
  for (const [id, count] of Object.entries(needed)) state.inventory[id] -= count;
  const order = state.orders.find((item) => item.productId === recipe.output && item.delivered < item.required);
  if (order) order.delivered += 1;
  else state.inventory[recipe.output] = (state.inventory[recipe.output] || 0) + 1;
  state.moves += 1;
  return true;
}

export function undoCraft(state) {
  const previous = state.history.pop();
  if (!previous) return false;
  state.inventory = previous.inventory;
  state.orders = previous.orders;
  state.moves = previous.moves;
  return true;
}

export function resetOrder(state) {
  state.inventory = { ...state.initialInventory };
  state.orders = state.orders.map((order) => ({ ...order, delivered: 0 }));
  state.moves = 0;
  state.history = [];
  state.resetCount += 1;
}

export function isOrderComplete(state) {
  return state.orders.every((order) => order.delivered >= order.required);
}

export function orderProgress(state) {
  const delivered = state.orders.reduce((sum, order) => sum + order.delivered, 0);
  const total = state.orders.reduce((sum, order) => sum + order.required, 0);
  return { delivered, total };
}

export function orderHint(state) {
  for (const order of state.orders) {
    if (order.delivered >= order.required) continue;
    const suggestion = nextNeededCraft(state, order.productId);
    if (suggestion) return suggestion;
  }
  return state.availableRecipeIds.find((id) => canCraft(state, id)) || null;
}

function nextNeededCraft(state, productId) {
  const recipe = recipeByOutput[productId];
  if (!recipe) return null;
  if (canCraft(state, recipe.id)) return recipe.id;
  for (const input of recipe.inputs) {
    if (workshopItems[input]?.raw || (state.inventory[input] || 0) > 0) continue;
    const nested = nextNeededCraft(state, input);
    if (nested) return nested;
  }
  return null;
}

function countIds(ids) {
  return ids.reduce((counts, id) => ({ ...counts, [id]: (counts[id] || 0) + 1 }), {});
}

function seededRandom(seed) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => (value = value * 16807 % 2147483647) / 2147483647;
}

function shuffle(items, rng) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const target = Math.floor(rng() * (index + 1));
    [items[index], items[target]] = [items[target], items[index]];
  }
  return items;
}

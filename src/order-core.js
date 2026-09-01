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
  meyve_tabagi: { id: "meyve_tabagi", name: "Meyve tabağı", icon: "🍇" },
  tohum_kesesi: { id: "tohum_kesesi", name: "Tohum kesesi", icon: "🎒" },
  yuva_yastigi: { id: "yuva_yastigi", name: "Yuva yastığı", icon: "🛏️" },
  recel: { id: "recel", name: "Orman reçeli", icon: "🍯" },
  pasta: { id: "pasta", name: "Meyveli pasta", icon: "🍰" }
};

export const workshopRecipes = [
  { id: "cay_ozu", output: "cay_ozu", inputs: ["meyve", "su"], station: "Çaydanlık", unlockDay: 1 },
  { id: "iplik", output: "iplik", inputs: ["yaprak", "tuy"], station: "Dokuma", unlockDay: 1 },
  { id: "hamur", output: "hamur", inputs: ["tohum", "su"], station: "Değirmen", unlockDay: 1 },
  { id: "sicak_cay", output: "sicak_cay", inputs: ["cay_ozu", "su"], station: "Çaydanlık", unlockDay: 1, final: true },
  { id: "kus_evi", output: "kus_evi", inputs: ["dal", "dal"], station: "Marangoz", unlockDay: 1, final: true },
  { id: "cicek_demeti", output: "cicek_demeti", inputs: ["yaprak", "meyve"], station: "Çiçek masası", unlockDay: 1, final: true },
  { id: "meyve_tabagi", output: "meyve_tabagi", inputs: ["meyve", "meyve"], station: "Hazırlık masası", unlockDay: 1, final: true },
  { id: "tohum_kesesi", output: "tohum_kesesi", inputs: ["tohum", "yaprak"], station: "Paketleme", unlockDay: 1, final: true },
  { id: "yuva_yastigi", output: "yuva_yastigi", inputs: ["tuy", "tuy"], station: "Dokuma", unlockDay: 1, final: true },
  { id: "kurabiye", output: "kurabiye", inputs: ["hamur", "meyve"], station: "Fırın", unlockDay: 2, final: true },
  { id: "sepet", output: "sepet", inputs: ["dal", "iplik"], station: "Marangoz", unlockDay: 3, final: true },
  { id: "battaniye", output: "battaniye", inputs: ["iplik", "tuy"], station: "Dokuma", unlockDay: 4, final: true },
  { id: "recel", output: "recel", inputs: ["cay_ozu", "meyve"], station: "Bakır tencere", unlockDay: 5, final: true },
  { id: "pasta", output: "pasta", inputs: ["hamur", "cay_ozu"], station: "Fırın", unlockDay: 7, final: true }
];

export const workshopCustomers = [
  { birdId: "mavi", name: "Maviş", notes: ["Yavruların sofrası için", "Yeni yuvasına götürecek"] },
  { birdId: "nar", name: "Nar Bülbülü", notes: ["Komşusuna sürpriz yapacak", "Meydan buluşması için"] },
  { birdId: "limon", name: "Limon İspinozu", notes: ["Uzun bahçe yürüyüşü için", "Ailesiyle paylaşacak"] },
  { birdId: "leylak", name: "Leylak Kuşu", notes: ["Şenlik masasına götürecek", "Misafirlerini karşılayacak"] },
  { birdId: "zeytin", name: "Zeytin Baştankarası", notes: ["Yağmur öncesi hazırlanıyor", "Yeni komşusunu ağırlayacak"] },
  { birdId: "mercan", name: "Mercan Kuşu", notes: ["Koru pikniği için", "Dostuna hediye edecek"] },
  { birdId: "gece", name: "Gece Sakası", notes: ["Akşam nöbeti için", "Kütüphane buluşmasına götürecek"] },
  { birdId: "turkuaz", name: "Turkuaz Ardıç", notes: ["Göç molasında paylaşacak", "Bahçe ekibine teşekkür edecek"] }
];

export const workshopStories = [
  { icon: "🌤️", title: "Meydan Sabahı", copy: "Kuşlar güne birlikte başlıyor; sofralar için farklı hazırlıklar gerekiyor." },
  { icon: "🧺", title: "Koru Pikniği", copy: "Herkes yanına başka bir şey almak istiyor. Malzemeleri dikkatle paylaştır." },
  { icon: "🏡", title: "Yeni Komşular", copy: "Köye yeni kuşlar taşındı. Yuvaları için sıcak bir karşılama hazırla." },
  { icon: "🌧️", title: "Yağmur Hazırlığı", copy: "Bulutlar yaklaşırken kuşlar eksiklerini tamamlamak için atölyeye uğradı." },
  { icon: "🎈", title: "Bahçe Şenliği", copy: "Meydandaki uzun masa renkli ürünlerle dolmayı bekliyor." },
  { icon: "📚", title: "Kütüphane Günü", copy: "Sessiz okuma buluşmasına küçük ikramlar ve rahat yuvalıklar hazırlanıyor." },
  { icon: "🪶", title: "Göç Molası", copy: "Yolcu kuşlar kısa bir mola verdi. İhtiyaçlarını doğru sırayla tamamla." },
  { icon: "🌙", title: "Akşam Buluşması", copy: "Gün batmadan son siparişleri yetiştirip meydanı huzurla kapat." }
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
  const available = finalRecipesForDay(day);
  const lineCount = day < 4 ? 2 : day < 21 ? 3 : 4;
  const selectedRecipes = pickOrderRecipes(available, lineCount, seed);
  const customers = shuffle([...workshopCustomers], rng);
  const orders = selectedRecipes.map((recipe, index) => ({
    productId: recipe.output,
    required: day > 12 && rng() > .76 ? 2 : 1,
    delivered: 0,
    customerId: customers[index].birdId,
    customerName: customers[index].name,
    note: customers[index].notes[(day + index) % customers[index].notes.length]
  }));
  const rawInventory = Object.fromEntries(rawIds.map((id) => [id, 0]));
  const solutionPlan = [];
  for (const order of orders) {
    for (let copy = 0; copy < order.required; copy += 1) expandRequirements(order.productId, rawInventory, solutionPlan);
  }
  const missionType = ["optimal", "noHint", "noReset", "reserve"][(daily ? seed : day - 1) % 4];
  const reserve = missionType === "reserve" ? { id: rawIds[Math.floor(rng() * rawIds.length)], count: 1 } : null;
  if (reserve) rawInventory[reserve.id] += reserve.count;
  if (day > 3) {
    rawInventory[rawIds[Math.floor(rng() * rawIds.length)]] += 1;
    if (day > 30) rawInventory[rawIds[Math.floor(rng() * rawIds.length)]] += 1;
  }
  const inventory = Object.fromEntries(Object.keys(workshopItems).map((id) => [id, rawInventory[id] || 0]));
  const availableRecipeIds = visibleRecipeIds(selectedRecipes, available, day, seed);
  const mission = makeMission(missionType, solutionPlan.length, reserve);
  return {
    version: 4,
    orderVersion: 2,
    mode: "order",
    level,
    day,
    daily,
    status: "playing",
    inventory,
    initialInventory: { ...inventory },
    orders,
    story: workshopStories[(daily ? seed : day - 1) % workshopStories.length],
    mission,
    reserve,
    solutionPlan,
    optimalMoves: solutionPlan.length,
    moves: 0,
    helpsUsed: 0,
    resetCount: 0,
    history: [],
    availableRecipeIds,
    busy: false
  };
}

function finalRecipesForDay(day) {
  return workshopRecipes.filter((recipe) => recipe.final && recipe.unlockDay <= day);
}

function pickOrderRecipes(available, lineCount, seed) {
  return shuffle([...available], seededRandom(seed)).slice(0, Math.min(lineCount, available.length));
}

function visibleRecipeIds(selected, available, day, seed) {
  const visible = new Set();
  const addPath = (productId) => {
    const recipe = recipeByOutput[productId];
    if (!recipe || recipe.unlockDay > day || visible.has(recipe.id)) return;
    visible.add(recipe.id);
    recipe.inputs.forEach(addPath);
  };
  selected.forEach((recipe) => addPath(recipe.output));
  const selectedIds = new Set(selected.map((recipe) => recipe.id));
  const decoys = shuffle(available.filter((recipe) => !selectedIds.has(recipe.id)), seededRandom(seed + 991))
    .slice(0, day < 10 ? 1 : 2);
  decoys.forEach((recipe) => addPath(recipe.output));
  return [...visible];
}

function makeMission(type, optimalMoves, reserve) {
  if (type === "noHint") return { type, title: "Kendi planın", copy: "Sıradaki adım desteğini kullanmadan tamamla." };
  if (type === "noReset") return { type, title: "Tek hazırlık", copy: "Atölyeyi baştan başlatmadan siparişleri tamamla." };
  if (type === "reserve") {
    const item = workshopItems[reserve.id];
    return { type, title: "Ambar payı", copy: `${item.icon} ${item.name} malzemesinden ${reserve.count} adet artır.` };
  }
  return { type, title: "İsrafsız üretim", copy: `Tam olarak ${optimalMoves} üretim hamlesinde tamamla.` };
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

export function orderMissionComplete(state) {
  if (state.mission.type === "noHint") return state.helpsUsed === 0;
  if (state.mission.type === "noReset") return state.resetCount === 0;
  if (state.mission.type === "reserve") return (state.inventory[state.reserve.id] || 0) >= state.reserve.count;
  return state.moves <= state.optimalMoves;
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

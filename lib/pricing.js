// Equipment purchase prices from the Wholesale Payments Equipment Pricing Matrix (V5.261).
// Used to auto-fill the Purchase Order. price = upfront purchase price, rental = min monthly rental.
const MATRIX = [
  // Valor
  ["VP100", 350, 25], ["VP300 PRO", 300, 20], ["VP350", 400, 35], ["Valor RCKT", 200, 15],
  ["VP550", 425, 35], ["VP550C", 375, 30], ["VP550E", 400, 35], ["VP800", 700, 65], ["VP800 Multi Hub", 50, 5],
  ["VL100 PRO", 350, 25], ["VL110", 425, 35], ["VL300", 300, 20], ["VL550", 375, 30], ["VL550 Magic Box", 50, 5],
  // PAX
  ["S920", 300, 25], ["A920 PRO", 450, 40], ["A920 MAX", 475, 45], ["A77", 300, 25], ["A80", 325, 25],
  ["A30", 400, 35], ["A35", 300, 25], ["Q25", 250, 20], ["Aries8", 500, 45], ["A800", 600, 55],
  ["A920 Charging Dock", 125, 10],
  // Elys
  ["Elys Tablet A3700", 450, 40], ["Elys Mini L3700", 750, 70], ["Elys Station L1400", 850, 80],
  ["Elys T3180", 200, 15], ["Elys Eye T3200", 200, 15], ["Elys K21", 700, 65], ["Elys PB20", 200, 15],
  // Dejavoo
  ["Z8", 300, 25], ["Z9", 500, 50], ["Z11", 400, 35], ["Z6", 275, 20],
  ["QD1", 650, 60], ["QD2", 500, 45], ["QD3", 400, 35], ["QD4", 400, 35], ["QD5", 350, 30],
  // Basil bundles
  ["Basil View", 950, 55], ["Basil View Plus", 1350, 65], ["Basil View Pro", 1700, 125],
  // Clover
  ["Clover Solo", 1850, 180], ["Clover Duo", 2150, 210], ["Clover Mini Bundle", 1050, 95],
  ["Clover Kiosk Bundle", 3600, 360], ["Clover Flex Pocket", 550, 50], ["Clover Flex", 850, 65],
  ["Clover Mini", 975, 90], ["Clover Go", 150, 10], ["Clover Compact", 275, 25],
];

const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
// brand words to strip so "PAX A920" matches "A920 ..."
const BRANDS = /\b(pax|valor|valorpaytech|dejavoo|clover|elys|paytech)\b/gi;

// Longest model names first so "Clover Flex Pocket" wins over "Clover Flex".
const ENTRIES = MATRIX.map(([model, price, rental]) => ({ model, price, rental, key: norm(model) }))
  .sort((a, b) => b.key.length - a.key.length);

/**
 * Look up the purchase price (and min rental) for an equipment model string.
 * Tolerant of brand prefixes and spacing. Returns null if no confident match.
 */
export function priceFor(modelStr) {
  if (!modelStr) return null;
  const cands = [norm(modelStr), norm(String(modelStr).replace(BRANDS, ""))].filter(Boolean);
  // 1. exact
  for (const e of ENTRIES) if (cands.includes(e.key)) return e;
  // 2. the query contains a full model key — most specific (longest) key wins
  let best = null;
  for (const e of ENTRIES) for (const c of cands) if (c.includes(e.key) && (!best || e.key.length > best.key.length)) best = e;
  if (best) return best;
  // 3. a model key starts with the query — the closest (shortest) such model wins
  best = null;
  for (const e of ENTRIES) for (const c of cands) if (e.key.startsWith(c) && (!best || e.key.length < best.key.length)) best = e;
  return best;
}

/** True if the model string refers to a Clover point-of-sale device. */
export function isClover(modelStr) {
  return /clover/i.test(String(modelStr || ""));
}

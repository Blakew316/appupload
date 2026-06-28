// Equipment purchase prices from the Wholesale Payments Equipment Pricing Matrix (V5.261).
// Used to auto-fill the Purchase Order. price = upfront purchase price, rental = min monthly rental.
const MATRIX = [
  // Valor — [model, purchase price, min rental, category]
  ["VP100", 350, 25, "Terminals"], ["VP300 PRO", 300, 20, "Pin Pads"], ["VP350", 400, 35, "Terminals / Pin Pads"], ["Valor RCKT", 200, 15, "Mobile Swipers"],
  ["VP550", 425, 35, "Terminals"], ["VP550C", 375, 30, "Terminals"], ["VP550E", 400, 35, "Terminals"], ["VP800", 700, 65, "Terminals"], ["VP800 Multi Hub", 50, 5, "Accessories"],
  ["VL100 PRO", 350, 25, "Terminals"], ["VL110", 425, 35, "Terminals"], ["VL300", 300, 20, "Pin Pads"], ["VL550", 375, 30, "Terminals"], ["VL550 Magic Box", 50, 5, "Accessories"],
  // PAX
  ["S920", 300, 25, "Terminals"], ["A920 PRO", 450, 40, "Terminals"], ["A920 MAX", 475, 45, "Terminals"], ["A77", 300, 25, "Terminals"], ["A80", 325, 25, "Terminals"],
  ["A30", 400, 35, "Pin Pads"], ["A35", 300, 25, "Pin Pads"], ["Q25", 250, 20, "Pin Pads"], ["Aries8", 500, 45, "Terminals / Pin Pads"], ["A800", 600, 55, "Terminals"],
  ["A920 Charging Dock", 125, 10, "Accessories"],
  // Elys
  ["Elys Tablet A3700", 450, 40, "Terminals / Pin Pads"], ["Elys Mini L3700", 750, 70, "Terminals / Pin Pads"], ["Elys Station L1400", 850, 80, "Terminals"],
  ["Elys T3180", 200, 15, "Accessories"], ["Elys Eye T3200", 200, 15, "Accessories"], ["Elys K21", 700, 65, "Accessories"], ["Elys PB20", 200, 15, "Accessories"],
  // Dejavoo
  ["Z8", 300, 25, "Terminals"], ["Z9", 500, 50, "Terminals"], ["Z11", 400, 35, "Terminals"], ["Z6", 275, 20, "Pin Pads"],
  ["QD1", 650, 60, "Terminals"], ["QD2", 500, 45, "Terminals"], ["QD3", 400, 35, "Pin Pads"], ["QD4", 400, 35, "Terminals"], ["QD5", 350, 30, "Pin Pads"],
  // Basil bundles
  ["Basil View", 950, 55, "Bundles"], ["Basil View Plus", 1350, 65, "Bundles"], ["Basil View Pro", 1700, 125, "Bundles"],
  // Clover
  ["Clover Solo", 1850, 180, "Bundles"], ["Clover Duo", 2150, 210, "Bundles"], ["Clover Mini Bundle", 1050, 95, "Bundles"],
  ["Clover Kiosk Bundle", 3600, 360, "Bundles"], ["Clover Flex Pocket", 550, 50, "Terminals"], ["Clover Flex", 850, 65, "Terminals"],
  ["Clover Mini", 975, 90, "Terminals"], ["Clover Go", 150, 10, "Mobile Swipers"], ["Clover Compact", 275, 25, "Pin Pads"],
];

/** Full model list for the equipment dropdown. */
export const MODELS = MATRIX.map(([model, price, rental, category]) => ({ model, price, rental, category }));

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

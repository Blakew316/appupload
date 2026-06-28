import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { loadAnchors, findLabel, renderedPageBytes, TEMPLATES } from "./anchors.js";
import { FORM_MAPS } from "./formMaps.js";
import { isClover } from "./pricing.js";

const INK = rgb(0.05, 0.1, 0.45); // dark blue so filled values read as the typed overlay
const DEFAULT_SIZE = 9;
const MIN_SIZE = 6;
const BELOW_DY = -11.5; // value sits this far below the label baseline on column-header forms

/**
 * Fill a template form by compositing the rendered page background with a text
 * overlay. (The source PDFs are encrypted and can't be edited directly, so we
 * draw onto a high-res image of each page instead.)
 * @returns {Promise<Uint8Array>}
 */
export async function fillForm(form, record) {
  const anchors = loadAnchors(form);
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pages = [];
  for (let i = 0; i < anchors.pages.length; i++) {
    const { width, height } = anchors.pages[i];
    const page = pdf.addPage([width, height]);
    const png = await pdf.embedPng(renderedPageBytes(form, i + 1));
    page.drawImage(png, { x: 0, y: 0, width, height });
    pages.push(page);
  }

  const measure = (text, size) => font.widthOfTextAtSize(text, size);
  for (const item of computePlacements(form, record, measure)) {
    const page = pages[item.page - 1];
    page.drawText(item.text, { x: item.x, y: item.y, size: item.size, font: item.bold ? fontBold : font, color: INK });
  }

  return pdf.save();
}

/**
 * Compute every overlay placement (page, x, y, text, size) for a record.
 * Shared by fillForm and the verification tooling so they can't drift.
 * @param {(text:string,size:number)=>number} measure  text-width measuring fn
 */
export function computePlacements(form, record, measure) {
  const map = FORM_MAPS[form];
  if (!map) throw new Error(`No field map for form: ${form}`);
  const anchors = loadAnchors(form);
  const out = [];

  for (const spec of map.text || []) {
    const value = safe(spec.get(record));
    if (!value) continue;
    const anchor = findLabel(anchors, { page: spec.page, text: spec.text, occ: spec.occ, region: spec.region, exact: spec.exact });
    if (!anchor) continue;

    const { text, size } = fitText(value, measure, spec.size ?? DEFAULT_SIZE, spec.maxWidth);
    const isBelow = spec.place !== "right" && spec.place !== "leftOf" && spec.place !== "center";
    const y = (spec.absY != null ? spec.absY : anchor.y) + (spec.dy ?? (isBelow ? BELOW_DY : 0));
    let x;
    if (spec.place === "center") {
      // Center the text horizontally on absX (or the anchor's mid-point) — used to
      // sit a value neatly on a printed line or inside a box.
      const cx = spec.absX != null ? spec.absX : (anchor.x + anchor.x2) / 2;
      x = cx - measure(text, size) / 2 + (spec.dx ?? 0);
    } else if (spec.absX != null) x = spec.absX + (spec.dx ?? 0);
    else if (spec.place === "right") x = anchor.x2 + (spec.dx ?? 4);
    else if (spec.place === "leftOf") x = anchor.x - measure(text, size) - (spec.pad ?? 2) + (spec.dx ?? 0);
    else x = anchor.x + (spec.dx ?? 0);
    out.push({ page: spec.page, x, y, text, size, bold: false });
  }

  for (const spec of map.check || []) {
    if (!spec.on(record)) continue;
    const anchor = findLabel(anchors, { page: spec.page, text: spec.text, occ: spec.occ, region: spec.region, exact: spec.exact });
    if (!anchor) continue;
    const mark = spec.mark || "X";
    const size = spec.size ?? 8; // checkbox marks are small to fit the printed boxes
    // center: true treats absX as the box center and centers the mark on it.
    let x;
    if (spec.center) x = (spec.absX != null ? spec.absX : (anchor.x + anchor.x2) / 2) - measure(mark, size) / 2 + (spec.dx ?? 0);
    else x = (spec.absX != null ? spec.absX : (spec.fromRight ? anchor.x2 : anchor.x)) + (spec.dx ?? 0);
    const y = (spec.absY != null ? spec.absY : anchor.y) + (spec.dy ?? 0);
    out.push({ page: spec.page, x, y, text: mark, size, bold: true });
  }
  return out;
}

/**
 * Build the full packet: the detected/selected application filled in, plus the
 * matching pre-filled coversheet.
 * @param {object} record  normalized extraction record
 * @param {object} [opts]  { form?: 'citizens'|'merrick', date?: string }
 */
export function resolveForm(record, formOverride) {
  if (formOverride && ["citizens", "merrick"].includes(formOverride)) return formOverride;
  return record.appType === "merrick" ? "merrick" : record.appType === "citizens" ? "citizens" : null;
}

/** True if any equipment line is a Clover device (drives the Clover addendum). */
export function hasCloverEquipment(record) {
  return (record.equipment || []).some((e) => e && isClover(e.model || e.type));
}

/**
 * Prepare a fill-ready record: stamp the date and derive the coversheet boarding
 * fees from the application's fee schedule when not entered directly.
 */
export function prepareRecord(record, opts = {}) {
  const c = record.coversheet || {};
  const f = record.fees || {};
  return {
    ...record,
    _date: opts.date || "",
    coversheet: {
      ...c,
      etf: c.etf || f.earlyTermination || "",
      annualFee: c.annualFee || f.annual || "",
      monthlyMin: c.monthlyMin || f.monthlyMinimum || "",
      svcFee: c.svcFee || f.monthlyService || "",
    },
  };
}

export async function buildPacket(record, opts = {}) {
  const form = resolveForm(record, opts.form);
  const base = prepareRecord(record, opts);
  const coversheetPdf = await fillForm("coversheet", base);
  const applicationPdf = form ? await fillForm(form, base) : null;
  return { form, applicationPdf, coversheetPdf };
}

export function formTitle(form) {
  return TEMPLATES[form]?.label || form;
}

/** Merge several PDFs (Uint8Array) into one, in order. */
export async function mergePdfs(parts) {
  const out = await PDFDocument.create();
  for (const bytes of parts) {
    if (!bytes) continue;
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const copied = await out.copyPages(src, src.getPageIndices());
    copied.forEach((p) => out.addPage(p));
  }
  return out.save();
}

function safe(v) {
  if (v == null) return "";
  return String(v).replace(/\s+/g, " ").trim();
}

/** Shrink the font (then truncate) so text fits within maxWidth. `measure(text,size)->width`. */
function fitText(text, measure, size, maxWidth) {
  if (!maxWidth) return { text, size };
  let s = size;
  while (s > MIN_SIZE && measure(text, s) > maxWidth) s -= 0.5;
  if (measure(text, s) <= maxWidth) return { text, size: s };
  let t = text;
  while (t.length > 1 && measure(t + "…", s) > maxWidth) t = t.slice(0, -1);
  return { text: t + "…", size: s };
}

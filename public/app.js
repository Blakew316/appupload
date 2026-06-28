"use strict";

const MAX_FILES = 15;
const MAX_DIMENSION = 1568;
const JPEG_QUALITY = 0.85;

const el = (id) => document.getElementById(id);
const statusBanner = el("statusBanner");

function showBanner(kind, msg) {
  statusBanner.className = `banner ${kind}`;
  statusBanner.textContent = msg;
  statusBanner.classList.remove("hidden");
  statusBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
const hideBanner = () => statusBanner.classList.add("hidden");

/* ---------------- shared image handling ---------------- */
function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve({ dataUrl: canvas.toDataURL("image/jpeg", JPEG_QUALITY), blob }) : reject(new Error("toBlob failed"))),
        "image/jpeg",
        JPEG_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode failed"));
    };
    img.src = url;
  });
}

/** Wire a dropzone + file input + thumbnail list into a small uploader. */
function makeUploader({ dropzone, input, browseBtn, thumbs, onChange }) {
  const pages = [];
  let nextId = 1;

  async function add(fileList) {
    const isPdf = (f) => f.type === "application/pdf" || /\.pdf$/i.test(f.name);
    const files = Array.from(fileList).filter((f) => /^image\//.test(f.type) || isPdf(f));
    for (const file of files) {
      if (pages.length >= MAX_FILES) {
        showBanner("warn", `Up to ${MAX_FILES} files.`);
        break;
      }
      if (isPdf(file)) {
        // PDFs are sent as-is; the server renders each page to an image.
        pages.push({ id: nextId++, isPdf: true, name: file.name, blob: file });
        continue;
      }
      try {
        const { dataUrl, blob } = await resizeImage(file);
        pages.push({ id: nextId++, dataUrl, blob });
      } catch {
        showBanner("error", `Could not read "${file.name}".`);
      }
    }
    render();
  }
  function remove(id) {
    const i = pages.findIndex((p) => p.id === id);
    if (i >= 0) pages.splice(i, 1);
    render();
  }
  function clear() {
    pages.length = 0;
    render();
  }
  function render() {
    thumbs.innerHTML = "";
    pages.forEach((p, idx) => {
      const li = document.createElement("li");
      li.className = "thumb" + (p.isPdf ? " thumb-pdf" : "");
      if (p.isPdf) {
        li.innerHTML = `<span class="page-badge">${idx + 1}</span><button class="remove-thumb" aria-label="Remove">×</button><div class="pdf-tile"><span class="pdf-ico">PDF</span><span class="pdf-name"></span></div>`;
        li.querySelector(".pdf-name").textContent = p.name || "Document.pdf";
      } else {
        li.innerHTML = `<span class="page-badge">${idx + 1}</span><button class="remove-thumb" aria-label="Remove">×</button><img alt="upload ${idx + 1}" />`;
        li.querySelector("img").src = p.dataUrl;
      }
      li.querySelector(".remove-thumb").addEventListener("click", () => remove(p.id));
      thumbs.appendChild(li);
    });
    onChange(pages.length);
  }

  browseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    input.click();
  });
  dropzone.addEventListener("click", () => input.click());
  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      input.click();
    }
  });
  input.addEventListener("change", (e) => {
    add(e.target.files);
    input.value = "";
  });
  ["dragenter", "dragover"].forEach((ev) =>
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    })
  );
  ["dragleave", "drop"].forEach((ev) =>
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      if (ev === "dragleave" && dropzone.contains(e.relatedTarget)) return;
      dropzone.classList.remove("dragover");
    })
  );
  dropzone.addEventListener("drop", (e) => e.dataTransfer?.files?.length && add(e.dataTransfer.files));

  return { pages, clear };
}

/* ---------------- record path helpers ---------------- */
const getPath = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
function setPath(obj, path, value) {
  const keys = path.split(".");
  let o = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (o[keys[i]] == null) o[keys[i]] = {};
    o = o[keys[i]];
  }
  o[keys[keys.length - 1]] = value;
}

/* ---------------- review form schema ---------------- */
const REVIEW_SECTIONS = [
  {
    title: "Business",
    open: true,
    fields: [
      ["business.dba", "DBA / Trade name"],
      ["business.legalName", "Legal / corporate name"],
      ["business.locationAddress", "Location address"],
      ["business.locationCity", "City"],
      ["business.locationState", "State"],
      ["business.locationZip", "ZIP"],
      ["__sameAsDba", "Corporate address same as DBA / location address", "sameAsDba"],
      ["business.corpAddress", "Corporate address"],
      ["business.corpCity", "Corp city"],
      ["business.corpState", "Corp state"],
      ["business.corpZip", "Corp ZIP"],
      ["business.phone", "Phone"],
      ["business.fax", "Fax"],
      ["business.contactName", "Contact name"],
      ["business.contactPhone", "Contact phone"],
      ["business.customerServicePhone", "Customer service phone"],
      ["business.email", "Business email"],
      ["business.website", "Website"],
      ["business.federalTaxId", "Federal Tax ID"],
      ["business.taxType", "Tax type"],
      ["business.taxFilingName", "Tax filing name"],
      ["business.businessType", "Business type"],
      ["business.productsSold", "Products / services sold"],
      ["business.organizationType", "Organization type"],
      ["business.stateIssued", "State issued"],
      ["business.businessStarted", "Business started"],
      ["business.lengthOwnershipYears", "Ownership (years)"],
      ["business.lengthOwnershipMonths", "Ownership (months)"],
    ],
  },
  { title: "Banking (from voided check)", owner: null, fields: [
    ["banking.bankName", "Bank name"],
    ["banking.routing", "Routing #"],
    ["banking.account", "Account #"],
    ["banking.bankPhone", "Bank phone"],
    ["banking.accountType", "Account type", "select", ["", "checking", "savings"]],
  ]},
  { title: "Transaction", fields: [
    ["transaction.monthlyVolume", "Monthly volume ($)"],
    ["transaction.avgTicket", "Average ticket ($)"],
    ["transaction.highTicket", "High ticket ($)"],
    ["transaction.amexVolume", "Amex volume ($)"],
    ["transaction.swipePct", "Swipe %"],
    ["transaction.motoPct", "MO/TO %"],
    ["transaction.internetPct", "Internet %"],
    ["transaction.salesToConsumerPct", "Sales to consumer %"],
    ["transaction.salesToBusinessPct", "Sales to business %"],
    ["transaction.salesToGovPct", "Sales to government %"],
    ["transaction.previousProcessor", "Previous processor"],
    ["transaction.reasonForLeaving", "Reason for leaving"],
  ]},
  { title: "Fees — authorization / monthly / misc", fields: [
    ["fees.authVmcda", "Auth Visa/MC/Disc/Amex ($)"],
    ["fees.fleet", "Fleet card ($)"],
    ["fees.pinDebit", "Pin debit ($)"],
    ["fees.pinDebitPct", "Pin debit (%)"],
    ["fees.ebt", "EBT ($)"],
    ["fees.salesTxn", "Sales transaction ($)"],
    ["fees.monthlyService", "Monthly service ($)"],
    ["fees.monthlyMinimum", "Monthly minimum ($)"],
    ["fees.wireless", "Wireless ($)"],
    ["fees.pinDebitMonthly", "Pin debit monthly ($)"],
    ["fees.industryCompliance", "Industry compliance ($)"],
    ["fees.chargeback", "Chargeback ($)"],
    ["fees.retrieval", "Retrieval ($)"],
    ["fees.achReject", "ACH reject ($)"],
    ["fees.annual", "Annual fee ($)"],
    ["fees.equipmentRental", "Equipment monthly rental ($)"],
    ["fees.monthToBill", "Month to bill"],
    ["fees.earlyTermination", "Early termination / ETF ($)"],
    ["fees.basilPos", "Basil POS ($) — Merrick"],
    ["fees.saasFee", "SAAS fee ($) — Merrick"],
    ["fees.inactivityFee", "Inactivity fee ($) — Merrick"],
    ["fees.gatewayMonthly", "Gateway monthly ($) — Merrick"],
    ["fees.gatewayTxn", "Gateway transaction ($) — Merrick"],
    ["fees.monthlyMisc", "Monthly misc ($) — Merrick"],
  ]},
  { title: "Service acceptance & fee schedule", fields: [
    ["serviceAcceptance.cardVisaCredit", "Visa credit", "checkbox"],
    ["serviceAcceptance.cardVisaDebit", "Visa debit", "checkbox"],
    ["serviceAcceptance.cardMcCredit", "Mastercard credit", "checkbox"],
    ["serviceAcceptance.cardMcDebit", "Mastercard debit", "checkbox"],
    ["serviceAcceptance.cardDiscover", "Discover", "checkbox"],
    ["serviceAcceptance.cardAmex", "Amex", "checkbox"],
    ["serviceAcceptance.cardPin", "Pin debit", "checkbox"],
    ["serviceAcceptance.cardEbt", "EBT (Merrick)", "checkbox"],
    ["serviceAcceptance.discountPlan", "Discount plan", "select", [["", "—"], ["flat", "Flat Rate"], ["passthrough", "Passthrough IC"]]],
    ["serviceAcceptance.flatCreditPct", "Flat credit %"],
    ["serviceAcceptance.flatDebitPct", "Flat debit %"],
    ["serviceAcceptance.flatAmexPct", "Flat amex % (Merrick)"],
    ["serviceAcceptance.passCreditPct", "Passthrough credit %"],
    ["serviceAcceptance.passDebitPct", "Passthrough debit %"],
    ["serviceAcceptance.passAmexPct", "Passthrough amex %"],
    ["serviceAcceptance.assessments", "Assessments", "select", [["", "—"], ["included", "Included"], ["billed", "Billed Separately"]]],
    ["serviceAcceptance.paymentMethod", "Discount payment method", "select", [["", "—"], ["daily", "Daily"], ["monthly", "Monthly"]]],
  ]},
  { title: "Signatures (printed name / title / date)", fields: [
    ["signatures.printedName", "Signer 1 printed name"],
    ["signatures.title", "Signer 1 title"],
    ["signatures.date", "Signer 1 date"],
    ["signatures.printedName2", "Signer 2 printed name"],
    ["signatures.title2", "Signer 2 title"],
    ["signatures.date2", "Signer 2 date"],
  ]},
  { title: "Equipment", fields: [
    ["equipment.0.model", "Item 1 — choose equipment", "modelSelect"],
    ["equipment.0.quantity", "Qty"],
    ["equipment.1.model", "Item 2 — choose equipment", "modelSelect"],
    ["equipment.1.quantity", "Qty"],
    ["equipment.2.model", "Item 3 — choose equipment", "modelSelect"],
    ["equipment.2.quantity", "Qty"],
  ]},
  { title: "Coversheet — set-up form", fields: [
    ["sales.salesAgentName", "Sales partner name"],
    ["coversheet.territoryManager", "Territory manager"],
    ["coversheet.teamColor", "Team color"],
    ["coversheet.platform", "Requested platform", "select", [["", "—"], ["tsys", "TSYS (Synovus)"], ["fdomaha", "FD Omaha (Wells Fargo)"], ["fdnorth", "FD North (Synovus)"], ["other", "Other"]]],
    ["coversheet.platformOther", "Platform — other"],
    ["coversheet.telemarketing", "Telemarketing lead", "checkbox"],
    ["coversheet.reBoard", "Re-board", "checkbox"],
    ["coversheet.docPictures", "Pictures inside & out", "checkbox"],
    ["coversheet.docStatements", "Statements", "checkbox"],
    ["coversheet.etf", "Boarding ETF ($)"],
    ["coversheet.annualFee", "Boarding annual fee ($)"],
    ["coversheet.monthlyMin", "Boarding monthly min ($)"],
    ["coversheet.svcFee", "Boarding svc fee ($)"],
    ["coversheet.cashDiscount", "Cash discount", "checkbox"],
    ["coversheet.cashDiscountTerminalRate", "Cash discount terminal rate"],
    ["coversheet.bypassFee", "Bypass fee option", "checkbox"],
    ["coversheet.shipping", "Shipping to", "select", [["", "—"], ["dba", "DBA Address"], ["agent", "Sales Agent Address"], ["other", "Other"]]],
    ["coversheet.shippingOther", "Shipping — other"],
    ["coversheet.vasGiftCards", "Gift cards", "checkbox"],
    ["coversheet.vasCheckServices", "Check services", "checkbox"],
    ["coversheet.vasWpiRewards", "WPI rewards", "checkbox"],
    ["coversheet.vasCustomerConnect", "Customer connect", "checkbox"],
    ["coversheet.fbAppType", "File build — application type", "select", [["", "—"], ["retail", "Retail"], ["restaurant", "Restaurant"], ["ecommerce", "E-Commerce"], ["moto", "Moto"]]],
    ["coversheet.fbConnection", "File build — connection", "select", [["", "—"], ["ethernet", "Ethernet"], ["dial", "Dial"], ["wifi", "Wifi"], ["wireless", "Wireless 3g/4g"]]],
    ["coversheet.enPinDebit", "Enable Pin Debit", "checkbox"],
    ["coversheet.enEbt", "Enable EBT", "checkbox"],
    ["coversheet.enWex", "Enable Wex/Voyager", "checkbox"],
    ["coversheet.fnsNumber", "FNS #"],
    ["coversheet.autoClose", "Auto close", "checkbox"],
    ["coversheet.autoCloseTime", "Auto close time"],
    ["coversheet.timezone", "Timezone", "select", [["", "—"], ["pst", "PST"], ["mst", "MST"], ["cst", "CST"], ["est", "EST"]]],
    ["coversheet.tips", "Tips", "select", [["", "—"], ["none", "None"], ["tipline", "Tip Line"], ["tipprompt", "Tip Prompt"]]],
    ["coversheet.serverNumbers", "Server #'s", "checkbox"],
    ["coversheet.avsCvv", "AVS/CVV", "checkbox"],
    ["coversheet.invoiceNumber", "Invoice #", "checkbox"],
    ["coversheet.specialOther", "Special prompts — other"],
    ["coversheet.notes", "Notes & special instructions"],
  ]},
  { title: "Purchase order (optional)", fields: [
    ["po.mid", "Merchant MID"],
    ["po.team", "Team (defaults to team color)"],
    ["po.salesManager", "Sales manager (defaults to territory mgr)"],
    ["po.billTo", "Equipment bill to (defaults Merchant)"],
    ["po.shipTo", "Ship to", "select", [["", "—"], ["dba", "Merchant DBA"], ["rep", "Sales Rep"], ["other", "Other"]]],
    ["po.shippingMethod", "Shipping method", "select", [["", "—"], ["ground", "Ground (Free)"], ["2day", "2 Day"], ["overnight", "Overnight"]]],
    ["po.payPlan", "Pay plan", "select", [["", "—"], ["3pay", "3 Pay"], ["4pay", "4 Pay"]]],
    ["po.billingType", "Billing", "select", [["", "—"], ["ach", "ACH (voided check)"], ["cc", "Credit Card"]]],
    ["po.shCost", "S&H cost ($)"],
    ["po.salesTax", "Sales tax ($)"],
    ["po.frontendPlatform", "Clover frontend platform", "select", [["", "—"], ["omaha", "Omaha"], ["nashville", "Nashville"]]],
  ]},
];

const OWNER_FIELDS = [
  ["first", "First name"],
  ["last", "Last name"],
  ["title", "Title"],
  ["ownershipPct", "Ownership %"],
  ["homeAddress", "Home address"],
  ["city", "City"],
  ["state", "State"],
  ["zip", "ZIP"],
  ["phone", "Phone"],
  ["email", "Email"],
  ["ssn", "SSN"],
  ["dob", "Date of birth"],
  ["dlNumber", "Driver's license #"],
  ["dlState", "License state"],
  ["dlExp", "License expiration"],
];

let workingRecord = null;
let EQUIPMENT_MODELS = [];

function buildEquipmentDatalist() {
  const dl = el("equipmentModels");
  if (!dl) return;
  dl.innerHTML = "";
  EQUIPMENT_MODELS.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.model;
    opt.label = `$${m.price} · ${m.category}`;
    dl.appendChild(opt);
  });
}

// Which review sections matter for each form, so picking a form shows only those fields.
// Citizens and Merrick are entirely separate applications; they share the same
// review data but are chosen independently.
const APP_SECTIONS = ["Business", "Owner / Principal 1", "Owner / Principal 2", "Banking (from voided check)", "Transaction", "Fees — authorization / monthly / misc", "Service acceptance & fee schedule", "Signatures (printed name / title / date)", "Documents provided"];
const FORM_SECTIONS = {
  citizens: APP_SECTIONS,
  merrick: APP_SECTIONS,
  application: APP_SECTIONS, // fallback alias
  coversheet: ["Coversheet — set-up form", "Business", "Documents provided"],
  po: ["Purchase order (optional)", "Equipment", "Business", "Banking (from voided check)"],
  clover: ["Business", "Signatures (printed name / title / date)"],
};

// Within the shown sections, only these field keys matter for a given form, so a
// shared section (e.g. Business) shows only the fields that form actually uses.
// An entry ending in "." matches a whole group by prefix; otherwise it's exact.
const FORM_FIELDS = {
  po: [
    "po.", "equipment.",
    "banking.bankName", "banking.routing", "banking.account",
    "business.dba", "business.legalName", "business.phone", "business.contactName",
    "business.locationAddress", "business.locationCity", "business.locationState", "business.locationZip",
  ],
  coversheet: [
    "coversheet.", "documents.", "sales.salesAgentName", "transaction.seasonal",
    "business.dba", "business.email", "business.federalTaxId",
  ],
  clover: [
    "business.legalName", "business.email",
    "signatures.printedName", "signatures.title", "signatures.date",
  ],
};
const fieldAllowed = (k, allow) => allow.some((a) => (a.endsWith(".") ? k.startsWith(a) : k === a));

function focusForm(key) {
  const sections = [...document.querySelectorAll("#reviewForm > details.review-section")];
  const wanted = FORM_SECTIONS[key];
  const allow = FORM_FIELDS[key];
  const clearFields = (d) => d.querySelectorAll(".field.field-hidden").forEach((f) => f.classList.remove("field-hidden"));
  if (!wanted) {
    // "All sections" — show everything, open the first, reveal all fields.
    sections.forEach((d, i) => {
      d.classList.remove("section-off");
      d.open = i === 0;
      clearFields(d);
    });
    return;
  }
  let first = null;
  sections.forEach((d) => {
    const title = d.querySelector("summary")?.textContent || "";
    const match = wanted.includes(title);
    d.classList.toggle("section-off", !match); // hide sections this form doesn't use
    d.open = match;
    if (match && !first) first = d;
    // Within a shown section, hide fields the form doesn't use.
    if (match && allow) {
      d.querySelectorAll(".field").forEach((f) => {
        const k = f.dataset.key || "";
        f.classList.toggle("field-hidden", Boolean(k) && !fieldAllowed(k, allow));
      });
    } else {
      clearFields(d);
    }
  });
  if (first) first.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------------- submission history (browser-only) ---------------- */
const HISTORY_KEY = "appupload.history.v1";
const REP_KEY = "appupload.rep";
const MANAGER_KEY = "appupload.manager";
// Sales agents shown in the rep dropdown (and seeded into the history rep filter).
const AGENTS = [
  "Jaden Dufek", "Sadie Scoville", "Timothy Constenius", "Gabriel Craft",
  "Judah Steelman", "Adam Drexler", "Jason Coutcher",
  "Lloyd Cruz", "Isaac Jenkins", "Jabe Schoenrock", "Max Alperstein",
  "Seth Manshum", "Walter Smith",
];
// Default territory manager (you) — auto-populates the form when none is set.
const DEFAULT_MANAGER = "Blake Woodruff";
let currentHistoryId = null;
let HISTORY_BACKEND = "local"; // becomes 'supabase' when the server has a database configured

function getCurrentRep() {
  try {
    return localStorage.getItem(REP_KEY) || "";
  } catch {
    return "";
  }
}
function setCurrentRep(v) {
  try {
    localStorage.setItem(REP_KEY, v);
  } catch {}
}
const repFor = (record) => getCurrentRep() || (record && record.sales && record.sales.salesAgentName) || "";

function getCurrentManager() {
  try {
    return localStorage.getItem(MANAGER_KEY) || DEFAULT_MANAGER;
  } catch {
    return DEFAULT_MANAGER;
  }
}
// The manager name (the person running this) defaults the coversheet territory
// manager, which in turn defaults the purchase order's sales manager. Only fills
// when the record hasn't already specified one, so it never clobbers real data.
function applyManagerDefault(record) {
  const mgr = getCurrentManager();
  if (!mgr || !record) return;
  record.coversheet = record.coversheet || {};
  if (!record.coversheet.territoryManager) record.coversheet.territoryManager = mgr;
}

function downloadJson(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  triggerDownload(blob, filename);
}
async function exportEntry(id, dba) {
  const rec = await historyGet(id);
  if (!rec) return;
  const name = (dba || "submission").replace(/[^a-z0-9-_]+/gi, "_").slice(0, 50);
  downloadJson(rec, `${name}.json`);
}
async function exportAll() {
  let items;
  if (HISTORY_BACKEND === "supabase") {
    try {
      items = (await (await fetch("/api/history/export")).json()).items || [];
    } catch {
      items = [];
    }
  } else {
    items = loadHistory().map((e) => ({ id: e.id, dba: e.dba, appType: e.appType, rep: e.rep || "", savedAt: e.savedAt, record: e.record }));
  }
  if (!items.length) return;
  downloadJson(items, "appupload-history.json");
}

async function historyList() {
  if (HISTORY_BACKEND === "supabase") {
    try {
      const d = await (await fetch("/api/history")).json();
      return d.items || [];
    } catch {
      return [];
    }
  }
  return loadHistory();
}
async function historyGet(id) {
  if (HISTORY_BACKEND === "supabase") {
    try {
      const r = await fetch(`/api/history/${id}`);
      return r.ok ? (await r.json()).record : null;
    } catch {
      return null;
    }
  }
  return (loadHistory().find((x) => x.id === id) || {}).record || null;
}
async function historyUpsert(record, id) {
  const dba = (record.business && (record.business.dba || record.business.legalName)) || "(unnamed)";
  if (HISTORY_BACKEND === "supabase") {
    try {
      const r = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, dba, appType: record.appType || "unknown", rep: repFor(record), data: record }),
      });
      return (await r.json().catch(() => ({}))).id || id;
    } catch {
      return id;
    }
  }
  return upsertHistory(record, id);
}
async function historyDelete(id) {
  if (HISTORY_BACKEND === "supabase") {
    try {
      await fetch(`/api/history/${id}`, { method: "DELETE" });
    } catch {}
    return;
  }
  saveHistoryList(loadHistory().filter((x) => x.id !== id));
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveHistoryList(list) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {}
}
function upsertHistory(record, id) {
  const list = loadHistory();
  const entry = {
    id: id || "h" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    savedAt: Date.now(),
    dba: (record.business && (record.business.dba || record.business.legalName)) || "(unnamed)",
    appType: record.appType || "unknown",
    rep: repFor(record),
    record,
  };
  const idx = list.findIndex((e) => e.id === entry.id);
  if (idx >= 0) list[idx] = entry;
  else list.unshift(entry);
  saveHistoryList(list);
  return entry.id;
}
let historyCache = [];

async function renderHistory() {
  historyCache = await historyList();
  paintHistory();
}

const typeLabel = (e) => (e.appType === "merrick" ? "Merrick" : e.appType === "citizens" ? "Citizens" : "—");

// Build the top-of-page rep dropdown from the agent list, preserving any
// previously-saved rep that isn't on the list (so a custom value still shows).
function populateRepPicker() {
  const sel = el("repInput");
  if (!sel) return;
  const cur = getCurrentRep();
  sel.innerHTML = "";
  const blank = document.createElement("option");
  blank.value = "";
  blank.textContent = "Select rep…";
  sel.appendChild(blank);
  AGENTS.forEach((name) => {
    const o = document.createElement("option");
    o.value = name;
    o.textContent = name;
    sel.appendChild(o);
  });
  if (cur && !AGENTS.includes(cur)) {
    const o = document.createElement("option");
    o.value = cur;
    o.textContent = `${cur} (custom)`;
    sel.appendChild(o);
  }
  sel.value = cur;
}

function populateRepFilter() {
  const sel = el("repFilter");
  if (!sel) return;
  // Always include the known agents, plus any reps that already appear in history.
  const reps = [...new Set([...AGENTS, ...historyCache.map((e) => e.rep).filter(Boolean)])].sort();
  const cur = sel.value;
  sel.innerHTML = "";
  const all = document.createElement("option");
  all.value = "";
  all.textContent = "All reps";
  sel.appendChild(all);
  reps.forEach((r) => {
    const o = document.createElement("option");
    o.value = r;
    o.textContent = r;
    sel.appendChild(o);
  });
  if ([...sel.options].some((o) => o.value === cur)) sel.value = cur;
}

function paintHistory() {
  const ul = el("historyList");
  if (!ul) return;
  populateRepFilter();
  const q = (el("historySearch")?.value || "").trim().toLowerCase();
  const repSel = el("repFilter")?.value || "";
  let list = historyCache;
  if (q) list = list.filter((e) => `${e.dba || ""} ${typeLabel(e)} ${e.rep || ""}`.toLowerCase().includes(q));
  if (repSel) list = list.filter((e) => (e.rep || "") === repSel);

  ul.innerHTML = "";
  if (list.length === 0) {
    const li = document.createElement("li");
    li.className = "history-empty";
    li.textContent = historyCache.length ? "No matches." : "No saved submissions yet.";
    ul.appendChild(li);
  }
  list.forEach((e) => {
    const li = document.createElement("li");
    li.className = "history-item";
    const d = new Date(e.savedAt);
    const when = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    const open = document.createElement("button");
    open.type = "button";
    open.className = "history-open";
    open.innerHTML = `<strong></strong><span class="history-meta"></span>`;
    open.querySelector("strong").textContent = e.dba;
    open.querySelector(".history-meta").textContent = `${typeLabel(e)}${e.rep ? " · " + e.rep : ""} · ${when}`;
    open.addEventListener("click", () => resumeHistory(e.id));
    const exp = document.createElement("button");
    exp.type = "button";
    exp.className = "history-exp";
    exp.title = "Export as JSON";
    exp.textContent = "⬇";
    exp.addEventListener("click", () => exportEntry(e.id, e.dba));
    const del = document.createElement("button");
    del.type = "button";
    del.className = "history-del";
    del.title = "Remove";
    del.textContent = "×";
    del.addEventListener("click", async () => {
      await historyDelete(e.id);
      renderHistory();
    });
    li.appendChild(open);
    li.appendChild(exp);
    li.appendChild(del);
    ul.appendChild(li);
  });
  updateHistoryVisibility();
}

let appView = "upload";
function updateHistoryVisibility() {
  // Show the section whenever we're on the home/upload view. Deleting the last
  // item then shows the empty-state message rather than making the section vanish.
  const sec = el("historySection");
  if (sec) sec.classList.toggle("hidden", appView !== "upload");
}
async function resumeHistory(id) {
  const record = await historyGet(id);
  if (!record) return;
  workingRecord = record;
  currentHistoryId = id;
  switchMode("app");
  showReview(workingRecord);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function blankRecord() {
  return {
    appType: "unknown", appTypeConfidence: "", documents: {},
    business: {}, owners: [{}, {}], banking: {}, transaction: {}, fees: {},
    serviceAcceptance: {}, signatures: {}, equipment: [{}, {}, {}],
    coversheet: {}, po: {}, sales: {}, notes: "",
  };
}

/** Home-page picker: open the review form (blank if nothing uploaded) focused on one form. */
function startBlankForm(key) {
  if (!key) return;
  if (!workingRecord) {
    workingRecord = blankRecord();
    currentHistoryId = null;
  }
  // Citizens / Merrick are distinct applications — lock the app type to the choice.
  if (key === "citizens" || key === "merrick") workingRecord.appType = key;
  showReview(workingRecord);
  focusForm(key);
  const js = el("jumpFormSelect");
  if (js) js.value = ["citizens", "merrick", "coversheet", "po", "clover"].includes(key) ? key : "";
  const hs = el("homeFormSelect");
  if (hs) hs.value = "";
}

function renderReviewForm(record) {
  const container = el("reviewForm");
  container.innerHTML = "";

  const makeField = (path, label, type, options) => {
    const value = getPath(record, path);
    if (type === "checkbox" || type === "sameAsDba") {
      const lab = document.createElement("label");
      lab.className = "field checkfield";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      if (type === "sameAsDba") {
        cb.id = "sameAsDbaToggle";
        cb.addEventListener("change", () => applySameAsDba(cb.checked));
      } else {
        cb.checked = Boolean(value);
        cb.dataset.path = path;
        cb.dataset.type = "checkbox";
      }
      lab.appendChild(cb);
      const span = document.createElement("span");
      span.textContent = label;
      lab.appendChild(span);
      return lab;
    }
    if (type === "modelSelect") {
      const wrap = document.createElement("label");
      wrap.className = "field field-wide" + (value ? "" : " empty");
      const span = document.createElement("span");
      span.textContent = label;
      wrap.appendChild(span);
      const sel = document.createElement("select");
      sel.dataset.path = path;
      const blank = document.createElement("option");
      blank.value = "";
      blank.textContent = "— none —";
      sel.appendChild(blank);
      const groups = {};
      EQUIPMENT_MODELS.forEach((m) => (groups[m.category] = groups[m.category] || []).push(m));
      Object.keys(groups).sort().forEach((cat) => {
        const og = document.createElement("optgroup");
        og.label = cat;
        groups[cat].forEach((m) => {
          const o = document.createElement("option");
          o.value = m.model;
          o.textContent = `${m.model} — $${m.price}`;
          og.appendChild(o);
        });
        sel.appendChild(og);
      });
      if (value && ![...sel.options].some((o) => o.value === value)) {
        const o = document.createElement("option");
        o.value = value;
        o.textContent = value;
        sel.insertBefore(o, blank.nextSibling);
      }
      sel.value = value || "";
      const hint = document.createElement("span");
      hint.className = "price-hint";
      const sync = () => {
        wrap.classList.toggle("empty", sel.value === "");
        const m = EQUIPMENT_MODELS.find((x) => x.model === sel.value);
        hint.textContent = m ? `${m.category} · $${m.price}` : "";
      };
      sel.addEventListener("change", sync);
      wrap.appendChild(sel);
      wrap.appendChild(hint);
      sync();
      return wrap;
    }
    const wrap = document.createElement("label");
    const isEmpty = value === "" || value == null;
    wrap.className = "field" + (isEmpty ? " empty" : "");
    const span = document.createElement("span");
    span.textContent = label;
    wrap.appendChild(span);
    let inputEl;
    if (type === "select") {
      inputEl = document.createElement("select");
      options.forEach((o) => {
        const [ov, ol] = Array.isArray(o) ? o : [o, o === "" ? "—" : o];
        const opt = document.createElement("option");
        opt.value = ov;
        opt.textContent = ol;
        if (ov === value) opt.selected = true;
        inputEl.appendChild(opt);
      });
    } else {
      inputEl = document.createElement("input");
      inputEl.type = "text";
      inputEl.value = value ?? "";
      if (type === "model") inputEl.setAttribute("list", "equipmentModels");
    }
    inputEl.dataset.path = path;
    inputEl.addEventListener("input", () => wrap.classList.toggle("empty", inputEl.value === ""));
    wrap.appendChild(inputEl);
    if (type === "model") {
      const hint = document.createElement("span");
      hint.className = "price-hint";
      const sync = () => {
        const m = EQUIPMENT_MODELS.find((x) => x.model.toLowerCase() === inputEl.value.trim().toLowerCase());
        hint.textContent = m ? `${m.category} · $${m.price}` : "";
        if (m) {
          const typeInp = document.querySelector(`[data-path="${path.replace(/\.model$/, ".type")}"]`);
          if (typeInp) { typeInp.value = m.category; typeInp.dispatchEvent(new Event("input")); }
        }
      };
      inputEl.addEventListener("input", sync);
      wrap.appendChild(hint);
      sync();
    }
    return wrap;
  };

  const addSection = (title, fields, open) => {
    const det = document.createElement("details");
    det.className = "review-section";
    if (open) det.open = true;
    const sum = document.createElement("summary");
    sum.textContent = title;
    det.appendChild(sum);
    const body = document.createElement("div");
    body.className = "section-body";
    const row = document.createElement("div");
    row.className = "field-row";
    fields.forEach(([path, label, type, options]) => {
      const f = makeField(path, label, type, options);
      f.dataset.key = path; // used by focusForm for per-form field filtering
      row.appendChild(f);
    });
    body.appendChild(row);
    det.appendChild(body);
    container.appendChild(det);
  };

  REVIEW_SECTIONS.forEach((s, i) => {
    if (s.title === "Banking (from voided check)") {
      // Insert owners before banking.
      [0, 1].forEach((oi) =>
        addSection(`Owner / Principal ${oi + 1}`, OWNER_FIELDS.map(([k, l]) => [`owners.${oi}.${k}`, l]), false)
      );
    }
    addSection(s.title, s.fields, s.open);
  });

  // Documents present (drive coversheet checklist).
  const det = document.createElement("details");
  det.className = "review-section";
  det.innerHTML = `<summary>Documents provided</summary>`;
  const body = document.createElement("div");
  body.className = "section-body";
  [["documents.hasVoidedCheck", "Voided check included"], ["documents.hasDriversLicense", "Driver's license included"], ["transaction.seasonal", "Seasonal merchant"]].forEach(([path, label]) => {
    const lab = document.createElement("label");
    lab.className = "field checkfield";
    lab.dataset.key = path;
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = Boolean(getPath(record, path));
    cb.dataset.path = path;
    cb.dataset.type = "checkbox";
    lab.appendChild(cb);
    const span = document.createElement("span");
    span.textContent = label;
    lab.appendChild(span);
    body.appendChild(lab);
  });
  det.appendChild(body);
  container.appendChild(det);

  // Keep the corporate address mirroring the DBA / location address while the toggle is on.
  const toggle = document.getElementById("sameAsDbaToggle");
  ["business.locationAddress", "business.locationCity", "business.locationState", "business.locationZip"].forEach((p) => {
    container.querySelector(`[data-path="${p}"]`)?.addEventListener("input", () => {
      if (toggle && toggle.checked) applySameAsDba(true);
    });
  });
  buildEquipmentDatalist();
}

function applySameAsDba(checked) {
  const pairs = [
    ["business.locationAddress", "business.corpAddress"],
    ["business.locationCity", "business.corpCity"],
    ["business.locationState", "business.corpState"],
    ["business.locationZip", "business.corpZip"],
  ];
  pairs.forEach(([src, dst]) => {
    const s = document.querySelector(`[data-path="${src}"]`);
    const d = document.querySelector(`[data-path="${dst}"]`);
    if (!s || !d) return;
    if (checked) {
      d.value = s.value;
      d.readOnly = true;
      const f = d.closest(".field");
      if (f) { f.classList.remove("empty"); f.classList.add("mirrored"); }
    } else {
      d.readOnly = false;
      d.closest(".field")?.classList.remove("mirrored");
    }
  });
}

function collectReview() {
  el("reviewForm")
    .querySelectorAll("[data-path]")
    .forEach((inp) => {
      const path = inp.dataset.path;
      const value = inp.dataset.type === "checkbox" ? inp.checked : inp.value;
      setPath(workingRecord, path, value);
    });
  workingRecord.appType = el("appTypeSelect").value;
  applyManagerDefault(workingRecord); // ensure generated PDFs carry the manager even if the section was never opened
}

/* ---------------- application flow ---------------- */
let appUploader;

async function extractApplication() {
  if (appUploader.pages.length === 0) return;
  showSection("app", "processing");
  const form = new FormData();
  appUploader.pages.forEach((p, i) => form.append("images", p.blob, p.isPdf ? `doc-${i + 1}.pdf` : `img-${i + 1}.jpg`));
  try {
    const res = await fetch("/api/extract", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Extraction failed (${res.status}).`);
    workingRecord = data.record;
    currentHistoryId = await historyUpsert(workingRecord);
    renderHistory();
    showReview(workingRecord, true); // came from upload + auto-detection
  } catch (e) {
    showSection("app", "upload");
    showBanner("error", e.message);
  }
}

// Download buttons: none highlighted until the user clicks one.
function resetGenBtns() {
  document.querySelectorAll(".gen-btn").forEach((b) => { b.classList.add("btn-secondary"); b.classList.remove("btn-primary"); });
}
function selectGenBtn(btn) {
  resetGenBtns();
  if (btn) { btn.classList.add("btn-primary"); btn.classList.remove("btn-secondary"); }
}

function showReview(record, detected = false) {
  resetGenBtns();
  applyManagerDefault(record);
  el("appTypeSelect").value = record.appType || "unknown";
  const badge = el("detectBadge");
  const type = record.appType || "unknown";
  if (detected) {
    // Only after a real upload + auto-detection do we show the detection result.
    const conf = record.appTypeConfidence || "";
    badge.className = `detect-badge ${type}`;
    badge.textContent =
      type === "unknown" ? "Could not detect form — choose one below" : `Detected: ${type === "citizens" ? "Citizens" : "Merrick"}${conf ? ` (${conf} confidence)` : ""}`;
  } else {
    // Manual form pick or reopened submission — no detection banner.
    badge.className = "detect-badge hidden";
    badge.textContent = "";
  }
  renderReviewForm(record);
  showSection("app", "review");
}

async function generate(kind) {
  collectReview();
  currentHistoryId = await historyUpsert(workingRecord, currentHistoryId);
  renderHistory();
  const body = { record: workingRecord, form: el("appTypeSelect").value, date: el("coverDate").value.trim(), kind };
  try {
    const res = await fetch("/api/packet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Could not generate PDF.");
    }
    const blob = await res.blob();
    triggerDownload(blob, pdfFileName(workingRecord, kind));
  } catch (e) {
    showBanner("error", e.message);
  }
}

/* ---------------- menu flow ---------------- */
let menuUploader;
let menuItems = [];

async function extractMenu() {
  if (menuUploader.pages.length === 0) return;
  showSection("menu", "processing");
  const form = new FormData();
  menuUploader.pages.forEach((p, i) => form.append("images", p.blob, p.isPdf ? `menu-${i + 1}.pdf` : `menu-${i + 1}.jpg`));
  try {
    const res = await fetch("/api/menu/extract", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Menu extraction failed (${res.status}).`);
    menuItems = data.menu.items || [];
    el("restaurantName").value = data.menu.restaurantName || "";
    renderMenuTable();
    showSection("menu", "review");
  } catch (e) {
    showSection("menu", "upload");
    showBanner("error", e.message);
  }
}

function renderMenuTable() {
  const tbody = el("menuTable").querySelector("tbody");
  tbody.innerHTML = "";
  menuItems.forEach((it, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input data-k="name" value="${esc(it.name)}" /></td>
      <td class="price-col"><input data-k="price" value="${esc(it.price)}" inputmode="decimal" /></td>
      <td class="cat-col"><input data-k="category" value="${esc(it.category)}" /></td>
      <td><input data-k="description" value="${esc(it.description)}" /></td>
      <td><button class="row-del" title="Remove">×</button></td>`;
    tr.querySelectorAll("input").forEach((inp) =>
      inp.addEventListener("input", () => (menuItems[idx][inp.dataset.k] = inp.value))
    );
    tr.querySelector(".row-del").addEventListener("click", () => {
      menuItems.splice(idx, 1);
      renderMenuTable();
    });
    tbody.appendChild(tr);
  });
}

async function downloadXlsx() {
  const menu = { restaurantName: el("restaurantName").value.trim(), items: menuItems };
  try {
    const res = await fetch("/api/menu/xlsx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menu }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Could not build spreadsheet.");
    }
    const blob = await res.blob();
    const name = (menu.restaurantName || "menu").replace(/[^a-z0-9-_]+/gi, "_").slice(0, 50);
    triggerDownload(blob, `${name}-clover-import.xlsx`);
  } catch (e) {
    showBanner("error", e.message);
  }
}

/* ---------------- helpers ---------------- */
function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
// Human-readable form labels used in downloaded file names.
const FORM_LABELS = { combined: "Packet", application: "Application", coversheet: "Coversheet", po: "Purchase Order", clover: "Clover Addendum" };
// Lead the file name with the Doing-Business-As name so downloads are auto-labeled
// and easy to find. Falls back to legal name, then a generic label.
function pdfFileName(record, kind) {
  const dba = ((record && record.business && (record.business.dba || record.business.legalName)) || "").trim();
  const safe = dba.replace(/[\/\\:*?"<>|\x00-\x1f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
  const label = FORM_LABELS[kind] || "Document";
  return `${safe || "Application"} - ${label}.pdf`;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function showSection(mode, which) {
  if (mode === "app") {
    appView = which;
    el("appUpload").classList.toggle("hidden", which !== "upload");
    el("appProcessing").classList.toggle("hidden", which !== "processing");
    el("appReview").classList.toggle("hidden", which !== "review");
    updateHistoryVisibility();
  } else {
    el("menuUpload").classList.toggle("hidden", which !== "upload");
    el("menuProcessing").classList.toggle("hidden", which !== "processing");
    el("menuReview").classList.toggle("hidden", which !== "review");
  }
  if (which !== "review") hideBanner();
}

function switchMode(mode) {
  const isApp = mode === "app";
  el("tabApp").classList.toggle("active", isApp);
  el("tabMenu").classList.toggle("active", !isApp);
  el("tabApp").setAttribute("aria-selected", String(isApp));
  el("tabMenu").setAttribute("aria-selected", String(!isApp));
  el("appMode").classList.toggle("hidden", !isApp);
  el("menuMode").classList.toggle("hidden", isApp);
  hideBanner();
}

async function checkHealth() {
  try {
    const data = await (await fetch("/api/health")).json();
    if (!data.ready) showBanner("warn", "Not configured: set ANTHROPIC_API_KEY on the server (or TRANSCRIBE_MOCK=1 for a demo).");
    else if (data.mock) showBanner("info", "Demo mode: uploads return sample data so you can preview the workflow.");
    HISTORY_BACKEND = data.historyBackend || "local";
    const note = el("historyNote");
    if (note) {
      note.textContent =
        HISTORY_BACKEND === "supabase"
          ? "Shared across your team's devices. Click one to reopen and fill more forms."
          : "Saved only in this browser (extracted data only — no photos). Click one to reopen and fill more forms.";
    }
    renderHistory();
  } catch {}
}

function init() {
  appUploader = makeUploader({
    dropzone: el("appDropzone"),
    input: el("appFileInput"),
    browseBtn: el("appBrowseBtn"),
    thumbs: el("appThumbs"),
    onChange: (n) => {
      el("extractBtn").disabled = n === 0;
      el("appClearBtn").classList.toggle("hidden", n === 0);
      if (n) hideBanner();
    },
  });
  menuUploader = makeUploader({
    dropzone: el("menuDropzone"),
    input: el("menuFileInput"),
    browseBtn: el("menuBrowseBtn"),
    thumbs: el("menuThumbs"),
    onChange: (n) => {
      el("menuExtractBtn").disabled = n === 0;
      el("menuClearBtn").classList.toggle("hidden", n === 0);
      if (n) hideBanner();
    },
  });

  el("tabApp").addEventListener("click", () => switchMode("app"));
  el("tabMenu").addEventListener("click", () => switchMode("menu"));

  el("extractBtn").addEventListener("click", extractApplication);
  el("appClearBtn").addEventListener("click", () => appUploader.clear());
  el("genPacketBtn").addEventListener("click", (e) => { selectGenBtn(e.currentTarget); generate("combined"); });
  el("genAppBtn").addEventListener("click", (e) => { selectGenBtn(e.currentTarget); generate("application"); });
  el("genCoverBtn").addEventListener("click", (e) => { selectGenBtn(e.currentTarget); generate("coversheet"); });
  el("genPoBtn").addEventListener("click", (e) => { selectGenBtn(e.currentTarget); generate("po"); });
  el("genCloverBtn").addEventListener("click", (e) => { selectGenBtn(e.currentTarget); generate("clover"); });
  el("jumpFormSelect").addEventListener("change", (e) => {
    const v = e.target.value;
    if (v === "citizens" || v === "merrick") {
      el("appTypeSelect").value = v;
      if (workingRecord) workingRecord.appType = v;
    }
    focusForm(v);
  });
  el("homeFormSelect").addEventListener("change", (e) => startBlankForm(e.target.value));
  el("historySearch").addEventListener("input", paintHistory);
  el("repFilter").addEventListener("change", paintHistory);
  el("exportAllBtn").addEventListener("click", exportAll);
  populateRepPicker();
  el("repInput").addEventListener("change", (e) => setCurrentRep(e.target.value));
  el("clearHistoryBtn").addEventListener("click", async () => {
    if (!confirm("Clear all saved submissions?")) return;
    if (HISTORY_BACKEND === "supabase") {
      const items = await historyList();
      await Promise.all(items.map((e) => historyDelete(e.id)));
    } else {
      saveHistoryList([]);
    }
    renderHistory();
  });
  el("appRestartBtn").addEventListener("click", () => {
    appUploader.clear();
    workingRecord = null;
    currentHistoryId = null;
    showSection("app", "upload");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  el("menuExtractBtn").addEventListener("click", extractMenu);
  el("menuClearBtn").addEventListener("click", () => menuUploader.clear());
  el("addItemBtn").addEventListener("click", () => {
    menuItems.push({ name: "", price: "", category: "", description: "" });
    renderMenuTable();
  });
  el("genXlsxBtn").addEventListener("click", downloadXlsx);
  el("menuRestartBtn").addEventListener("click", () => {
    menuUploader.clear();
    menuItems = [];
    showSection("menu", "upload");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  checkHealth();
  renderHistory();
  fetch("/api/equipment")
    .then((r) => r.json())
    .then((d) => {
      EQUIPMENT_MODELS = d.models || [];
      buildEquipmentDatalist();
      // If a review form is already on screen (e.g. models loaded late), rebuild it
      // so the equipment dropdowns populate — preserving any edits already made.
      if (workingRecord && !el("appReview").classList.contains("hidden")) {
        collectReview();
        renderReviewForm(workingRecord);
        focusForm(el("jumpFormSelect").value);
      }
    })
    .catch(() => {});
}

document.addEventListener("DOMContentLoaded", init);

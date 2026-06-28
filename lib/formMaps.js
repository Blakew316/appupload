// Field-placement maps for each template form.
//
// Text spec:  { get, page, text, exact?, occ?, region?, place, dx?, dy?, size?, maxWidth?, absX?, absY?, pad? }
//   place 'below'  -> value below the label   (column-header forms: Citizens / Merrick)
//   place 'right'  -> value right of the label / anchored symbol
//   place 'leftOf' -> value right-aligned to end just before the anchor (numbers before a % symbol)
//   absX/absY      -> absolute PDF coordinate (overrides anchor x/y); still needs a found anchor
// Check spec: { on, page, text, exact?, occ?, region?, dx?, dy?, absX?, absY?, mark? }
//
// `get(record)` returns the string to draw; `on(record)` returns a boolean.
// Numbers that sit next to a preprinted $ or % are anchored on that symbol so they
// land cleanly inside the box (no doubled $/%).

import { priceFor } from "./pricing.js";

const full = (o) => [o?.first, o?.last].filter(Boolean).join(" ").trim();
const raw = (v) => (v == null ? "" : String(v).trim());
// Team is shown without a trailing color word (e.g. "Maverick Blue" -> "Maverick").
const teamName = (v) => raw(v).replace(/\s*\bblue\b\s*$/i, "").trim();

/* ----------------------------- Citizens ----------------------------- */
const citizens = {
  text: [
    // 1. General information
    { get: (r) => r.business.dba, page: 1, text: "Client’s Business Name", place: "below", maxWidth: 275 },
    { get: (r) => r.business.legalName, page: 1, text: "Client’s Corporate/Legal Name", place: "below", maxWidth: 285 },
    { get: (r) => r.business.locationAddress, page: 1, text: "Location Address", occ: 0, place: "below", maxWidth: 275 },
    { get: (r) => r.business.corpAddress, page: 1, text: "Corporate Address (if Different", place: "below", maxWidth: 285 },
    { get: (r) => r.business.locationCity, page: 1, text: "City", region: { yMin: 696, yMax: 704, xMax: 120 }, place: "below", maxWidth: 130 },
    { get: (r) => r.business.locationState, page: 1, text: "State", region: { yMin: 696, yMax: 704, xMin: 140, xMax: 220 }, place: "below", maxWidth: 70 },
    { get: (r) => r.business.locationZip, page: 1, text: "Zip", region: { yMin: 696, yMax: 704, xMin: 220, xMax: 300 }, place: "below", maxWidth: 60 },
    { get: (r) => r.business.corpCity, page: 1, text: "City", region: { yMin: 696, yMax: 704, xMin: 300 }, place: "below", maxWidth: 130 },
    { get: (r) => r.business.corpState, page: 1, text: "State", region: { yMin: 696, yMax: 704, xMin: 430, xMax: 500 }, place: "below", maxWidth: 70 },
    { get: (r) => r.business.corpZip, page: 1, text: "Zip", region: { yMin: 696, yMax: 704, xMin: 510 }, place: "below", maxWidth: 60 },
    { get: (r) => r.business.phone, page: 1, text: "Location Phone", place: "below", maxWidth: 125 },
    { get: (r) => r.business.fax, page: 1, text: "Location Fax", place: "below", maxWidth: 140 },
    { get: (r) => r.business.contactName, page: 1, text: "Contact Name", place: "below", maxWidth: 120 },
    { get: (r) => r.business.contactPhone, page: 1, text: "Contact Phone", place: "below", maxWidth: 130 },
    { get: (r) => r.business.customerServicePhone, page: 1, text: "Customer Service Phone", place: "below", maxWidth: 160 },
    { get: (r) => r.business.email, page: 1, text: "Business Email", place: "below", maxWidth: 150 },
    { get: (r) => r.business.dnb, page: 1, text: "D&B #", place: "below", maxWidth: 70 },
    { get: (r) => r.business.website, page: 1, text: "Business Website Address", place: "below", maxWidth: 270 },
    { get: (r) => r.business.federalTaxId, page: 1, text: "Fed Tax ID", place: "below", maxWidth: 150 },
    { get: (r) => r.business.taxType, page: 1, text: "Tax Type", place: "below", maxWidth: 80 },
    { get: (r) => r.business.taxFilingName, page: 1, text: "Tax Filing Name", place: "below", maxWidth: 270 },
    { get: (r) => r.business.businessStarted, page: 1, text: "Business Started", place: "below", maxWidth: 160 },
    { get: (r) => ownLen(r), page: 1, text: "Length Current Ownership", place: "below", maxWidth: 120 },

    // 2. Owners / officers
    { get: (r) => full(r.owners[0]), page: 1, text: "Owner/Officer 1", place: "below", maxWidth: 125 },
    { get: (r) => r.owners[0].homeAddress, page: 1, text: "Home Address", occ: 0, place: "below", maxWidth: 150 },
    { get: (r) => r.owners[0].phone, page: 1, text: "Telephone", occ: 0, place: "below", maxWidth: 145 },
    { get: (r) => r.owners[0].ssn, page: 1, text: "Social Security #", occ: 0, place: "below", maxWidth: 120 },
    { get: (r) => r.owners[0].title, page: 1, text: "Title", occ: 0, place: "below", maxWidth: 70 },
    { get: (r) => raw(r.owners[0].ownershipPct), page: 1, text: "% Ownership", occ: 0, place: "below", dx: 6, maxWidth: 50 },
    { get: (r) => r.owners[0].city, page: 1, text: "City", region: { yMin: 516, yMax: 524, xMin: 150, xMax: 220 }, place: "below", maxWidth: 70 },
    { get: (r) => r.owners[0].state, page: 1, text: "State", region: { yMin: 516, yMax: 524, xMin: 225, xMax: 260 }, place: "below", maxWidth: 35 },
    { get: (r) => r.owners[0].zip, page: 1, text: "Zip", region: { yMin: 516, yMax: 524, xMin: 260 }, place: "below", maxWidth: 45 },
    { get: (r) => r.owners[0].email, page: 1, text: "Email Address", occ: 0, place: "below", maxWidth: 150 },
    { get: (r) => r.owners[0].dob, page: 1, text: "Birth Date", occ: 0, place: "below", size: 9, maxWidth: 100 },

    { get: (r) => full(r.owners[1]), page: 1, text: "Ownership / Officer 2", place: "below", maxWidth: 125 },
    { get: (r) => r.owners[1].homeAddress, page: 1, text: "Home Address", occ: 1, place: "below", maxWidth: 150 },
    { get: (r) => r.owners[1].phone, page: 1, text: "Telephone", occ: 1, place: "below", maxWidth: 145 },
    { get: (r) => r.owners[1].ssn, page: 1, text: "Social Security #", occ: 1, place: "below", maxWidth: 120 },
    { get: (r) => r.owners[1].title, page: 1, text: "Title", occ: 1, place: "below", maxWidth: 70 },
    { get: (r) => raw(r.owners[1].ownershipPct), page: 1, text: "% Ownership", occ: 1, place: "below", dx: 6, maxWidth: 50 },
    { get: (r) => r.owners[1].city, page: 1, text: "City", region: { yMin: 457, yMax: 465, xMin: 150, xMax: 220 }, place: "below", maxWidth: 70 },
    { get: (r) => r.owners[1].state, page: 1, text: "State", region: { yMin: 457, yMax: 465, xMin: 225, xMax: 260 }, place: "below", maxWidth: 35 },
    { get: (r) => r.owners[1].zip, page: 1, text: "Zip", region: { yMin: 457, yMax: 465, xMin: 260 }, place: "below", maxWidth: 45 },
    { get: (r) => r.owners[1].email, page: 1, text: "Email Address", occ: 1, place: "below", maxWidth: 150 },
    { get: (r) => r.owners[1].dob, page: 1, text: "Birth Date", occ: 1, place: "below", size: 9, maxWidth: 100 },

    // 3. Transaction info — numbers anchored to the right of the printed "$"
    { get: (r) => raw(r.transaction.monthlyVolume), page: 1, text: "$", region: { yMin: 374, yMax: 382, xMin: 170, xMax: 185 }, place: "right", dx: 3, maxWidth: 120 },
    { get: (r) => raw(r.transaction.avgTicket), page: 1, text: "$", region: { yMin: 357, yMax: 365, xMin: 170, xMax: 185 }, place: "right", dx: 3, maxWidth: 120 },
    { get: (r) => raw(r.transaction.highTicket), page: 1, text: "$", region: { yMin: 340, yMax: 348, xMin: 170, xMax: 185 }, place: "right", dx: 3, maxWidth: 120 },
    { get: (r) => r.transaction.previousProcessor, page: 1, text: "Previous Processor", place: "right", dx: 6, maxWidth: 110 },
    { get: (r) => r.transaction.reasonForLeaving, page: 1, text: "Reason For Leaving", place: "right", dx: 6, maxWidth: 110 },

    // 4. Nature of business
    { get: (r) => r.business.productsSold, page: 1, text: "Describe Product / Services Sold", place: "right", dx: 6, maxWidth: 130 },
    { get: (r) => r.business.businessType, page: 1, text: "Business Type", place: "right", dx: 6, maxWidth: 130 },
    { get: (r) => raw(r.transaction.swipePct), page: 1, text: "SWIPE % :", place: "right", dx: 8, maxWidth: 90 },
    { get: (r) => raw(r.transaction.motoPct), page: 1, text: "MOTO % :", place: "right", dx: 8, maxWidth: 90 },
    { get: (r) => raw(r.transaction.internetPct), page: 1, text: "INTERNET % :", place: "right", dx: 8, maxWidth: 90 },

    // 5. Banking
    { get: (r) => r.banking.bankName, page: 1, text: "Deposit Bank Name", place: "below", dy: -10, maxWidth: 100 },
    { get: (r) => r.banking.routing, page: 1, text: "Routing #", place: "below", dy: -10, maxWidth: 90 },
    { get: (r) => raw(r.banking.account), page: 1, text: "Account #", place: "below", dy: -10, maxWidth: 80 },
    { get: (r) => r.banking.bankPhone, page: 1, text: "Bank Phone", place: "below", dy: -10, maxWidth: 120 },

    // 6. Fee schedule — anchored to the right of each printed "$"
    { get: (r) => raw(r.fees.authVmcda), page: 1, text: "$", region: { yMin: 147, yMax: 155, xMin: 84, xMax: 95 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.monthlyService), page: 1, text: "$", region: { yMin: 147, yMax: 155, xMin: 218, xMax: 230 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.monthlyMinimum), page: 1, text: "$", region: { yMin: 130, yMax: 138, xMin: 225, xMax: 237 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.annual), page: 1, text: "$", region: { yMin: 96, yMax: 104, xMin: 340, xMax: 355 }, place: "right", dx: 3, maxWidth: 55 },
    // 6b. Remaining fee schedule (anchored to each printed "$")
    { get: (r) => raw(r.fees.fleet), page: 1, text: "$", region: { yMin: 130, yMax: 138, xMin: 56, xMax: 67 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.pinDebit), page: 1, text: "$", region: { yMin: 113, yMax: 121, xMin: 54, xMax: 64 }, place: "right", dx: 3, maxWidth: 40 },
    { get: (r) => raw(r.fees.ebt), page: 1, text: "$", region: { yMin: 96, yMax: 104, xMin: 38, xMax: 48 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.salesTxn), page: 1, text: "$", region: { yMin: 79, yMax: 87, xMin: 89, xMax: 99 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.wireless), page: 1, text: "$", region: { yMin: 113, yMax: 121, xMin: 208, xMax: 220 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.pinDebitMonthly), page: 1, text: "$", region: { yMin: 96, yMax: 104, xMin: 223, xMax: 235 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.industryCompliance), page: 1, text: "$", region: { yMin: 79, yMax: 87, xMin: 231, xMax: 243 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.chargeback), page: 1, text: "$", region: { yMin: 147, yMax: 155, xMin: 345, xMax: 357 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.retrieval), page: 1, text: "$", region: { yMin: 130, yMax: 138, xMin: 336, xMax: 348 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.achReject), page: 1, text: "$", region: { yMin: 113, yMax: 121, xMin: 343, xMax: 355 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.equipmentRental), page: 1, text: "$", region: { yMin: 147, yMax: 155, xMin: 529, xMax: 540 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.monthToBill), page: 1, text: "Month to Bill:", place: "right", dx: 4, maxWidth: 70 },
    // Service acceptance — discount plan percentages, centered in the blank after each "%:" label
    { get: (r) => raw(r.serviceAcceptance.flatCreditPct), page: 1, text: "%", region: { yMin: 228, yMax: 236, xMin: 235, xMax: 247 }, place: "center", absX: 266, maxWidth: 28 },
    { get: (r) => raw(r.serviceAcceptance.flatDebitPct), page: 1, text: "%", region: { yMin: 228, yMax: 236, xMin: 293, xMax: 305 }, place: "center", absX: 327, maxWidth: 36 },
    { get: (r) => raw(r.serviceAcceptance.passCreditPct), page: 1, text: "%", region: { yMin: 228, yMax: 236, xMin: 430, xMax: 442 }, place: "center", absX: 460, maxWidth: 28 },
    { get: (r) => raw(r.serviceAcceptance.passDebitPct), page: 1, text: "%", region: { yMin: 228, yMax: 236, xMin: 485, xMax: 497 }, place: "center", absX: 516, maxWidth: 28 },
    { get: (r) => raw(r.serviceAcceptance.passAmexPct), page: 1, text: "%", region: { yMin: 228, yMax: 236, xMin: 544, xMax: 556 }, place: "center", absX: 574, maxWidth: 28 },

    // 10. Signatures (page 2) — printed names / titles / dates (signature stays handwritten)
    // Principal/Officer block: left = signer 1, right = signer 2
    { get: (r) => r.signatures.printedName, page: 2, text: "Print Name", region: { yMin: 235, yMax: 243, xMax: 200 }, place: "right", dx: 55, dy: -2, maxWidth: 110 },
    { get: (r) => r.signatures.title, page: 2, text: "Title", region: { yMin: 255, yMax: 263, xMax: 280 }, place: "right", dx: 6, maxWidth: 95 },
    { get: (r) => r.signatures.date, page: 2, text: "Date:", region: { yMin: 232, yMax: 240, xMax: 280 }, place: "right", dx: 6, maxWidth: 95 },
    { get: (r) => r.signatures.printedName2, page: 2, text: "Print Name", region: { yMin: 235, yMax: 243, xMin: 250 }, place: "right", dx: 55, dy: -2, maxWidth: 110 },
    { get: (r) => r.signatures.title2, page: 2, text: "Title", region: { yMin: 255, yMax: 263, xMin: 400 }, place: "right", dx: 6, maxWidth: 95 },
    { get: (r) => r.signatures.date2, page: 2, text: "Date:", region: { yMin: 232, yMax: 240, xMin: 400 }, place: "right", dx: 6, maxWidth: 95 },
    // Personal Guarantee block (same signers)
    { get: (r) => r.signatures.printedName, page: 2, text: "Print Name", region: { yMin: 120, yMax: 128, xMax: 200 }, place: "right", dx: 55, dy: -2, maxWidth: 110 },
    { get: (r) => r.signatures.title, page: 2, text: "Title", region: { yMin: 139, yMax: 147, xMax: 280 }, place: "right", dx: 6, maxWidth: 95 },
    { get: (r) => r.signatures.date, page: 2, text: "Date:", region: { yMin: 115, yMax: 123, xMax: 280 }, place: "right", dx: 6, maxWidth: 95 },
    { get: (r) => r.signatures.printedName2, page: 2, text: "Print Name", region: { yMin: 120, yMax: 128, xMin: 250 }, place: "right", dx: 55, dy: -2, maxWidth: 110 },
    { get: (r) => r.signatures.title2, page: 2, text: "Title", region: { yMin: 139, yMax: 147, xMin: 400 }, place: "right", dx: 6, maxWidth: 95 },
    { get: (r) => r.signatures.date2, page: 2, text: "Date:", region: { yMin: 115, yMax: 123, xMin: 400 }, place: "right", dx: 6, maxWidth: 95 },

    // Confirmation page (page 3)
    { get: (r) => r.business.legalName, page: 3, text: "Print Client’s Business Legal Name", place: "right", dx: 14, maxWidth: 260 },
    { get: (r) => r.signatures.title, page: 3, text: "Title:", place: "right", dx: 6, maxWidth: 110 },
    { get: (r) => r.signatures.date, page: 3, text: "Date:", place: "right", dx: 6, maxWidth: 100 },
  ],
  check: [
    { on: (r) => r.banking.accountType === "checking", page: 1, text: "Checking", dx: -11, dy: 0 },
    { on: (r) => r.banking.accountType === "savings", page: 1, text: "Savings", dx: -11, dy: 0 },
    // Card types (boxes sit left of each label)
    { on: (r) => r.serviceAcceptance.cardVisaCredit, page: 1, text: "VISA CREDIT", dx: -12 },
    { on: (r) => r.serviceAcceptance.cardVisaDebit, page: 1, text: "VISA DEBIT", dx: -12 },
    { on: (r) => r.serviceAcceptance.cardMcCredit, page: 1, text: "MASTERCARD CREDIT", dx: -12 },
    { on: (r) => r.serviceAcceptance.cardMcDebit, page: 1, text: "MASTERCARD DEBIT", dx: -12 },
    { on: (r) => r.serviceAcceptance.cardDiscover, page: 1, text: "DISCOVER", region: { yMin: 244, yMax: 252 }, dx: -12 },
    { on: (r) => r.serviceAcceptance.cardAmex, page: 1, text: "AMEX CREDIT", dx: -12 },
    { on: (r) => r.serviceAcceptance.cardPin, page: 1, text: "PIN CREDIT", dx: -12 },
    // Discount plan + assessments + payment method
    { on: (r) => r.serviceAcceptance.discountPlan === "flat", page: 1, text: "Flat Rate", dx: -12 },
    { on: (r) => r.serviceAcceptance.discountPlan === "passthrough", page: 1, text: "Passthrough IC", dx: -12 },
    { on: (r) => r.serviceAcceptance.assessments === "included", page: 1, text: "Included", dx: -12 },
    { on: (r) => r.serviceAcceptance.assessments === "billed", page: 1, text: "Billed Separately", dx: -12 },
    { on: (r) => r.serviceAcceptance.paymentMethod === "daily", page: 1, text: "Daily", dx: -12 },
    { on: (r) => r.serviceAcceptance.paymentMethod === "monthly", page: 1, text: "Monthly", region: { yMin: 210, yMax: 220 }, dx: -12 },
  ],
};

/* ----------------------------- Merrick ----------------------------- */
const merrick = {
  text: [
    { get: (r) => r.business.dba, page: 1, text: "MERCHANT NAME", place: "below", maxWidth: 230 },
    { get: (r) => r.business.legalName, page: 1, text: "CORPORATE / LEGAL NAME", place: "below", maxWidth: 230 },
    { get: (r) => r.business.locationAddress, page: 1, text: "LOCATION ADDRESS", place: "below", maxWidth: 230 },
    { get: (r) => r.business.corpAddress, page: 1, text: "CORPORATE ADDRESS", place: "below", maxWidth: 230 },
    { get: (r) => r.business.locationCity, page: 1, text: "CITY", region: { yMin: 665, yMax: 673, xMax: 120 }, place: "below", maxWidth: 130 },
    { get: (r) => r.business.locationState, page: 1, text: "STATE", region: { yMin: 665, yMax: 673, xMin: 160, xMax: 220 }, place: "below", maxWidth: 40 },
    { get: (r) => r.business.locationZip, page: 1, text: "ZIP", region: { yMin: 665, yMax: 673, xMin: 220, xMax: 300 }, place: "below", maxWidth: 55 },
    { get: (r) => r.business.corpCity, page: 1, text: "CITY", region: { yMin: 665, yMax: 673, xMin: 300 }, place: "below", maxWidth: 130 },
    { get: (r) => r.business.corpState, page: 1, text: "STATE", region: { yMin: 665, yMax: 673, xMin: 450, xMax: 510 }, place: "below", maxWidth: 40 },
    { get: (r) => r.business.corpZip, page: 1, text: "ZIP", region: { yMin: 665, yMax: 673, xMin: 510 }, place: "below", maxWidth: 55 },
    { get: (r) => r.business.phone, page: 1, text: "PHONE NUMBER", place: "below", maxWidth: 150 },
    { get: (r) => r.business.fax, page: 1, text: "FAX NUMBER", place: "below", maxWidth: 120 },
    { get: (r) => r.business.contactName, page: 1, text: "CONTACT NAME", place: "below", maxWidth: 110 },
    { get: (r) => r.business.contactPhone, page: 1, text: "CONTACT PHONE", place: "below", maxWidth: 120 },
    { get: (r) => r.business.email, page: 1, text: "BUSINESS EMAIL", place: "below", maxWidth: 160 },
    { get: (r) => r.business.website, page: 1, text: "WEBSITE", place: "below", maxWidth: 120 },
    { get: (r) => r.business.federalTaxId, page: 1, text: "FEDERAL TAX ID", place: "below", maxWidth: 130 },
    { get: (r) => r.business.stateIssued, page: 1, text: "STATE ISSUED", place: "below", maxWidth: 45 },
    // Length of ownership: years / months placed just before each preprinted word
    { get: (r) => raw(r.business.lengthOwnershipYears), page: 1, text: "YEARS", place: "center", absX: 466, maxWidth: 30 },
    { get: (r) => raw(r.business.lengthOwnershipMonths), page: 1, text: "MONTHS", place: "center", absX: 531, maxWidth: 34 },

    // Owner 1
    { get: (r) => r.owners[0].first, page: 1, text: "FIRST", occ: 0, place: "below", maxWidth: 90 },
    { get: (r) => r.owners[0].last, page: 1, text: "LAST", occ: 0, place: "below", maxWidth: 90 },
    { get: (r) => r.owners[0].homeAddress, page: 1, text: "HOME ADDRESS", occ: 0, place: "below", maxWidth: 170 },
    { get: (r) => r.owners[0].city, page: 1, text: "CITY", region: { yMin: 566, yMax: 574, xMin: 400, xMax: 500 }, place: "below", maxWidth: 90 },
    { get: (r) => r.owners[0].state, page: 1, text: "STATE", region: { yMin: 566, yMax: 574, xMin: 500, xMax: 545 }, place: "below", maxWidth: 40 },
    { get: (r) => r.owners[0].zip, page: 1, text: "ZIP", region: { yMin: 566, yMax: 574, xMin: 545 }, place: "below", maxWidth: 50 },
    { get: (r) => r.owners[0].title, page: 1, text: "TITLE", occ: 0, place: "below", maxWidth: 80 },
    { get: (r) => raw(r.owners[0].ownershipPct), page: 1, text: "OWNERSHIP", exact: true, occ: 0, place: "below", maxWidth: 80 },
    { get: (r) => r.owners[0].phone, page: 1, text: "TELEPHONE", occ: 0, place: "below", maxWidth: 170 },
    { get: (r) => r.owners[0].email, page: 1, text: "EMAIL", exact: true, occ: 0, place: "below", maxWidth: 170 },
    { get: (r) => r.owners[0].ssn, page: 1, text: "SOCIAL", occ: 0, place: "below", maxWidth: 180 },
    { get: (r) => r.owners[0].dob, page: 1, text: "DATE OF BIRTH", occ: 0, place: "below", size: 9, maxWidth: 130 },
    { get: (r) => r.owners[0].dlNumber, page: 1, text: "DRIVERS LICENSE", occ: 0, place: "below", maxWidth: 80 },
    { get: (r) => r.owners[0].dlState, page: 1, text: "DRIVERS LICENSE", occ: 0, absX: 505, place: "below", size: 9, maxWidth: 35 },
    { get: (r) => r.owners[0].dlExp, page: 1, text: "EXP", occ: 0, absX: 543, place: "below", size: 8, maxWidth: 62 },

    // Owner 2
    { get: (r) => r.owners[1].first, page: 1, text: "FIRST", occ: 1, place: "below", maxWidth: 90 },
    { get: (r) => r.owners[1].last, page: 1, text: "LAST", occ: 1, place: "below", maxWidth: 90 },
    { get: (r) => r.owners[1].homeAddress, page: 1, text: "HOME ADDRESS", occ: 1, place: "below", maxWidth: 170 },
    { get: (r) => r.owners[1].title, page: 1, text: "TITLE", occ: 1, place: "below", maxWidth: 80 },
    { get: (r) => raw(r.owners[1].ownershipPct), page: 1, text: "OWNERSHIP", exact: true, occ: 1, place: "below", maxWidth: 80 },
    { get: (r) => r.owners[1].phone, page: 1, text: "TELEPHONE", occ: 1, place: "below", maxWidth: 170 },
    { get: (r) => r.owners[1].email, page: 1, text: "EMAIL", exact: true, occ: 1, place: "below", maxWidth: 170 },
    { get: (r) => r.owners[1].ssn, page: 1, text: "SOCIAL", occ: 1, place: "below", maxWidth: 180 },
    { get: (r) => r.owners[1].dob, page: 1, text: "DATE OF BIRTH", occ: 1, place: "below", size: 9, maxWidth: 130 },
    { get: (r) => r.owners[1].dlNumber, page: 1, text: "DRIVERS LICENSE", occ: 1, place: "below", maxWidth: 80 },
    { get: (r) => r.owners[1].dlState, page: 1, text: "DRIVERS LICENSE", occ: 1, absX: 505, place: "below", size: 9, maxWidth: 35 },
    { get: (r) => r.owners[1].dlExp, page: 1, text: "EXP", occ: 1, absX: 543, place: "below", size: 8, maxWidth: 62 },

    // Banking
    { get: (r) => r.banking.bankName, page: 1, text: "BANK NAME", place: "below", maxWidth: 160 },
    { get: (r) => r.banking.routing, page: 1, text: "TRANSIT", place: "below", maxWidth: 150 },
    { get: (r) => raw(r.banking.account), page: 1, text: "ACCOUNT(DDA)", place: "below", maxWidth: 130 },
    { get: (r) => r.banking.bankPhone, page: 1, text: "PHONE", region: { yMin: 415, yMax: 430 }, place: "below", maxWidth: 70 },

    // Transaction — numbers right of "$"
    { get: (r) => r.business.businessType, page: 1, text: "BUSINESS TYPE", place: "right", dx: 6, maxWidth: 110 },
    { get: (r) => r.business.productsSold, page: 1, text: "PRODUCT/SERVICES SOLD", place: "center", absX: 284, maxWidth: 74 },
    { get: (r) => raw(r.transaction.monthlyVolume), page: 1, text: "$", region: { yMin: 356, yMax: 364, xMin: 169, xMax: 180 }, place: "right", dx: 3, maxWidth: 90 },
    { get: (r) => raw(r.transaction.amexVolume), page: 1, text: "$", region: { yMin: 341, yMax: 349, xMin: 169, xMax: 180 }, place: "right", dx: 3, maxWidth: 90 },
    { get: (r) => raw(r.transaction.avgTicket), page: 1, text: "$", region: { yMin: 326, yMax: 334, xMin: 169, xMax: 180 }, place: "right", dx: 3, maxWidth: 90 },
    { get: (r) => raw(r.transaction.highTicket), page: 1, text: "$", region: { yMin: 311, yMax: 319, xMin: 169, xMax: 180 }, place: "right", dx: 3, maxWidth: 90 },

    // Nature of business — numbers just before each "%"
    { get: (r) => raw(r.transaction.swipePct), page: 1, text: "%", region: { yMin: 371, yMax: 379, xMin: 438, xMax: 450 }, place: "leftOf", pad: 2, maxWidth: 30 },
    { get: (r) => raw(r.transaction.motoPct), page: 1, text: "%", region: { yMin: 356, yMax: 364, xMin: 438, xMax: 450 }, place: "leftOf", pad: 2, maxWidth: 30 },
    { get: (r) => raw(r.transaction.internetPct), page: 1, text: "%", region: { yMin: 341, yMax: 349, xMin: 438, xMax: 450 }, place: "leftOf", pad: 2, maxWidth: 30 },
    { get: (r) => raw(r.transaction.salesToConsumerPct), page: 1, text: "%", region: { yMin: 371, yMax: 379, xMin: 570, xMax: 582 }, place: "leftOf", pad: 2, maxWidth: 30 },
    { get: (r) => raw(r.transaction.salesToBusinessPct), page: 1, text: "%", region: { yMin: 356, yMax: 364, xMin: 570, xMax: 582 }, place: "leftOf", pad: 2, maxWidth: 30 },
    { get: (r) => raw(r.transaction.salesToGovPct), page: 1, text: "%", region: { yMin: 341, yMax: 349, xMin: 570, xMax: 582 }, place: "leftOf", pad: 2, maxWidth: 30 },

    // Fee schedule — numbers anchored to each printed "$"
    { get: (r) => raw(r.fees.authVmcda), page: 1, text: "$", region: { yMin: 162, yMax: 170, xMin: 120, xMax: 132 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.fleet), page: 1, text: "$", region: { yMin: 147, yMax: 155, xMin: 120, xMax: 132 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.pinDebit), page: 1, text: "$", region: { yMin: 132, yMax: 140, xMin: 120, xMax: 132 }, place: "right", dx: 3, maxWidth: 40 },
    { get: (r) => raw(r.fees.pinDebitPct), page: 1, text: "%", region: { yMin: 132, yMax: 140, xMin: 175, xMax: 187 }, place: "leftOf", pad: 2, maxWidth: 26 },
    { get: (r) => raw(r.fees.ebt), page: 1, text: "$", region: { yMin: 117, yMax: 125, xMin: 120, xMax: 132 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.electronicAvs), page: 1, text: "$", region: { yMin: 102, yMax: 110, xMin: 120, xMax: 132 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.voiceAuth), page: 1, text: "$", region: { yMin: 87, yMax: 95, xMin: 120, xMax: 132 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.monthlyService), page: 1, text: "$", region: { yMin: 162, yMax: 170, xMin: 261, xMax: 272 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.monthlyMinimum), page: 1, text: "$", region: { yMin: 147, yMax: 155, xMin: 261, xMax: 272 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.pinDebitMonthly), page: 1, text: "$", region: { yMin: 132, yMax: 140, xMin: 261, xMax: 272 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.wireless), page: 1, text: "$", region: { yMin: 117, yMax: 125, xMin: 261, xMax: 272 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.industryCompliance), page: 1, text: "$", region: { yMin: 102, yMax: 110, xMin: 261, xMax: 272 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.basilPos), page: 1, text: "$", region: { yMin: 162, yMax: 170, xMin: 389, xMax: 400 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.saasFee), page: 1, text: "$", region: { yMin: 147, yMax: 155, xMin: 389, xMax: 400 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.inactivityFee), page: 1, text: "$", region: { yMin: 132, yMax: 140, xMin: 389, xMax: 400 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.gatewayMonthly), page: 1, text: "$", region: { yMin: 117, yMax: 125, xMin: 389, xMax: 400 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.monthlyMisc), page: 1, text: "$", region: { yMin: 102, yMax: 110, xMin: 389, xMax: 400 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.batch), page: 1, text: "$", region: { yMin: 87, yMax: 95, xMin: 389, xMax: 400 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.chargeback), page: 1, text: "$", region: { yMin: 162, yMax: 170, xMin: 527, xMax: 538 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.retrieval), page: 1, text: "$", region: { yMin: 147, yMax: 155, xMin: 527, xMax: 538 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.achReject), page: 1, text: "$", region: { yMin: 132, yMax: 140, xMin: 527, xMax: 538 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.gatewayTxn), page: 1, text: "$", region: { yMin: 117, yMax: 125, xMin: 527, xMax: 538 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.salesTxn), page: 1, text: "$", region: { yMin: 102, yMax: 110, xMin: 527, xMax: 538 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.returnTxn), page: 1, text: "$", region: { yMin: 87, yMax: 95, xMin: 527, xMax: 538 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => raw(r.fees.annual), page: 1, text: "$", region: { yMin: 72, yMax: 80, xMin: 390, xMax: 400 }, place: "right", dx: 3, maxWidth: 55 },
    { get: (r) => r.fees.monthToBill, page: 1, text: "Month to Bill:", place: "right", dx: 4, maxWidth: 60 },
    // Discount plan percentages (numbers before each "%")
    // Numbers go in the cell to the right of each printed "%", centered.
    { get: (r) => raw(r.serviceAcceptance.flatDebitPct), page: 1, text: "%", region: { yMin: 221, yMax: 229, xMin: 221, xMax: 233 }, place: "center", absX: 262, maxWidth: 55 },
    { get: (r) => raw(r.serviceAcceptance.flatCreditPct), page: 1, text: "%", region: { yMin: 221, yMax: 229, xMin: 364, xMax: 376 }, place: "center", absX: 405, maxWidth: 55 },
    { get: (r) => raw(r.serviceAcceptance.flatAmexPct), page: 1, text: "%", region: { yMin: 221, yMax: 229, xMin: 508, xMax: 520 }, place: "center", absX: 549, maxWidth: 60 },
    { get: (r) => raw(r.serviceAcceptance.passDebitPct), page: 1, text: "%", region: { yMin: 236, yMax: 244, xMin: 221, xMax: 233 }, place: "leftOf", pad: 2, maxWidth: 30 },
    { get: (r) => raw(r.serviceAcceptance.passCreditPct), page: 1, text: "%", region: { yMin: 236, yMax: 244, xMin: 364, xMax: 376 }, place: "leftOf", pad: 2, maxWidth: 30 },
    { get: (r) => raw(r.serviceAcceptance.passAmexPct), page: 1, text: "%", region: { yMin: 236, yMax: 244, xMin: 508, xMax: 520 }, place: "leftOf", pad: 2, maxWidth: 30 },
  ],
  check: [
    { on: (r) => r.banking.accountType === "checking", page: 1, text: "CHECKING", dx: -12, dy: 0 },
    { on: (r) => r.banking.accountType === "savings", page: 1, text: "SAVINGS", dx: -12, dy: 0 },
    { on: (r) => r.serviceAcceptance.discountPlan === "flat", page: 1, text: "Flat Rate", center: true, absX: 31 },
    { on: (r) => r.serviceAcceptance.discountPlan === "passthrough", page: 1, text: "Passthrough IC", dx: -14 },
    { on: (r) => r.serviceAcceptance.assessments === "included", page: 1, text: "INCLUDED", dx: -12 },
    { on: (r) => r.serviceAcceptance.assessments === "billed", page: 1, text: "BILLED SEPERATELY", dx: -12 },
    { on: (r) => r.serviceAcceptance.paymentMethod === "daily", page: 1, text: "DAILY", dx: -12 },
    { on: (r) => r.serviceAcceptance.paymentMethod === "monthly", page: 1, text: "MONTHLY", region: { yMin: 205, yMax: 215 }, dx: -12 },
    // Requested card types (boxes left of each label on the y≈270 row, centered)
    { on: (r) => r.serviceAcceptance.cardVisaCredit, page: 1, text: "VISA CREDIT", region: { yMin: 268, yMax: 273 }, center: true, absX: 106 },
    { on: (r) => r.serviceAcceptance.cardVisaDebit, page: 1, text: "VISA DEBIT", region: { yMin: 268, yMax: 273 }, center: true, absX: 157.5 },
    { on: (r) => r.serviceAcceptance.cardMcCredit, page: 1, text: "MASTERCARD CREDIT", region: { yMin: 268, yMax: 273 }, center: true, absX: 206 },
    { on: (r) => r.serviceAcceptance.cardMcDebit, page: 1, text: "MASTERCARD DEBIT", region: { yMin: 268, yMax: 273 }, center: true, absX: 282 },
    { on: (r) => r.serviceAcceptance.cardDiscover, page: 1, text: "DISCOVER", region: { yMin: 268, yMax: 273 }, center: true, absX: 354 },
    { on: (r) => r.serviceAcceptance.cardAmex, page: 1, text: "AMERICAN EXPRESS", region: { yMin: 268, yMax: 273 }, center: true, absX: 400 },
    { on: (r) => r.serviceAcceptance.cardPin, page: 1, text: "PIN DEBIT", region: { yMin: 268, yMax: 273 }, center: true, absX: 472 },
    { on: (r) => r.serviceAcceptance.cardEbt, page: 1, text: "EBT", region: { yMin: 268, yMax: 273 }, center: true, absX: 516.5 },
  ],
};

/* ----------------------------- Coversheet ----------------------------- */
// Header value lines start at x=380; merchant-info lines start at x=60.
const cs = (r) => r.coversheet || {};
const coversheet = {
  text: [
    // Header
    { get: (r) => r.sales.salesAgentName || r.sales.salesRep, page: 1, text: "Sales Partner Name:", place: "right", absX: 384, maxWidth: 200 },
    { get: (r) => cs(r).territoryManager, page: 1, text: "Territory Manager:", place: "right", absX: 384, maxWidth: 200 },
    { get: (r) => teamName(cs(r).teamColor), page: 1, text: "Team Color:", place: "right", absX: 384, maxWidth: 200 },
    { get: (r) => r._date, page: 1, text: "Date:", region: { xMin: 260 }, place: "right", absX: 384, maxWidth: 200 },
    // Merchant info
    { get: (r) => r.business.dba, page: 1, text: "DBA:", place: "right", absX: 62, maxWidth: 200 },
    { get: (r) => r.business.email, page: 1, text: "Email:", region: { xMax: 120 }, place: "right", absX: 62, maxWidth: 200 },
    { get: (r) => r.business.federalTaxId, page: 1, text: "Tax ID:", place: "right", absX: 62, maxWidth: 200 },
    { get: (r) => r.owners[0].ssn, page: 1, text: "SSN:", region: { xMax: 120 }, place: "right", absX: 62, maxWidth: 200 },
    // Boarding ($ amounts, anchored to each printed "$")
    { get: (r) => raw(cs(r).etf), page: 1, text: "$", region: { yMin: 511, yMax: 519, xMin: 160, xMax: 172 }, place: "right", dx: 3, maxWidth: 80 },
    { get: (r) => raw(cs(r).annualFee), page: 1, text: "$", region: { yMin: 497, yMax: 505, xMin: 160, xMax: 172 }, place: "right", dx: 3, maxWidth: 80 },
    { get: (r) => raw(cs(r).monthlyMin), page: 1, text: "$", region: { yMin: 482, yMax: 490, xMin: 160, xMax: 172 }, place: "right", dx: 3, maxWidth: 80 },
    { get: (r) => raw(cs(r).svcFee), page: 1, text: "$", region: { yMin: 468, yMax: 476, xMin: 160, xMax: 172 }, place: "right", dx: 3, maxWidth: 80 },
    { get: (r) => cs(r).cashDiscountTerminalRate, page: 1, text: "Cash Discount Terminal Rate", place: "center", absX: 205, maxWidth: 120 },
    // Equipment rows (model + quantity) — row 1 is the top row (y≈378)
    { get: (r) => r.equipment[0].model, page: 1, text: "Model:", region: { yMin: 374, yMax: 382 }, place: "right", dx: 5, maxWidth: 195 },
    { get: (r) => r.equipment[0].quantity, page: 1, text: "Quantity:", region: { yMin: 374, yMax: 382 }, place: "right", dx: 5, maxWidth: 55 },
    { get: (r) => r.equipment[1].model, page: 1, text: "Model:", region: { yMin: 331, yMax: 339 }, place: "right", dx: 5, maxWidth: 195 },
    { get: (r) => r.equipment[1].quantity, page: 1, text: "Quantity:", region: { yMin: 331, yMax: 339 }, place: "right", dx: 5, maxWidth: 55 },
    { get: (r) => r.equipment[2].model, page: 1, text: "Model:", region: { yMin: 286, yMax: 294 }, place: "right", dx: 5, maxWidth: 195 },
    { get: (r) => r.equipment[2].quantity, page: 1, text: "Quantity:", region: { yMin: 286, yMax: 294 }, place: "right", dx: 5, maxWidth: 55 },
    // File build / enablements / special prompts (text bits)
    { get: (r) => cs(r).fnsNumber, page: 1, text: "FNS #:", place: "right", dx: 6, maxWidth: 110 },
    { get: (r) => cs(r).autoCloseTime, page: 1, text: "Time:", region: { yMin: 224, yMax: 232, xMin: 480 }, place: "center", absX: 538, maxWidth: 80 },
    // "Other:" fill-ins (disambiguated by region)
    { get: (r) => cs(r).platformOther, page: 1, text: "Other:", region: { yMin: 561, yMax: 569, xMin: 430 }, place: "right", dx: 6, maxWidth: 90 },
    { get: (r) => cs(r).shippingOther, page: 1, text: "Other:", region: { yMin: 482, yMax: 490, xMin: 270, xMax: 330 }, place: "right", dx: 6, maxWidth: 110 },
    { get: (r) => cs(r).specialOther, page: 1, text: "Other:", region: { yMin: 181, yMax: 189, xMin: 480 }, place: "right", dx: 6, maxWidth: 90 },
    // Notes and Special Instructions (user-entered, on the blank line below the header)
    { get: (r) => cs(r).notes, page: 1, text: "Notes and Special Instructions:", absX: 24, absY: 112, place: "right", maxWidth: 540 },
  ],
  check: [
    // All boxes centered on the detected box mid-points (center: true).
    // Document checklist (boxes x≈412)
    { on: (r) => r.documents.hasVoidedCheck, page: 1, text: "Voided Check", center: true, absX: 412 },
    { on: (r) => r.documents.hasDriversLicense, page: 1, text: "Drivers License", center: true, absX: 412 },
    { on: (r) => cs(r).docPictures, page: 1, text: "Pictures Inside", center: true, absX: 412 },
    { on: (r) => cs(r).docStatements, page: 1, text: "Statements", center: true, absX: 412 },
    // Telemarketing / Re-Board (Yes x≈170.5 / No x≈219)
    { on: (r) => cs(r).telemarketing, page: 1, text: "Telemarketing Lead", center: true, absX: 170.5 },
    { on: (r) => !cs(r).telemarketing, page: 1, text: "Telemarketing Lead", center: true, absX: 219 },
    { on: (r) => cs(r).reBoard, page: 1, text: "Re-Board", center: true, absX: 170.5 },
    { on: (r) => !cs(r).reBoard, page: 1, text: "Re-Board", center: true, absX: 219 },
    // Requested platform (boxes far right x≈568)
    { on: (r) => cs(r).platform === "tsys", page: 1, text: "TSYS", center: true, absX: 568 },
    { on: (r) => cs(r).platform === "fdomaha", page: 1, text: "FD Omaha", center: true, absX: 568 },
    { on: (r) => cs(r).platform === "fdnorth", page: 1, text: "FD North", center: true, absX: 568 },
    { on: (r) => cs(r).platform === "other", page: 1, text: "Other:", region: { yMin: 561, yMax: 569, xMin: 430 }, center: true, absX: 568 },
    // Boarding Yes/No
    { on: (r) => cs(r).cashDiscount, page: 1, text: "Cash Discount:", region: { yMin: 453, yMax: 461 }, center: true, absX: 102.5 },
    { on: (r) => !cs(r).cashDiscount, page: 1, text: "Cash Discount:", region: { yMin: 453, yMax: 461 }, center: true, absX: 149.5 },
    { on: (r) => cs(r).bypassFee, page: 1, text: "Bypass Fee", center: true, absX: 125.5 },
    { on: (r) => !cs(r).bypassFee, page: 1, text: "Bypass Fee", center: true, absX: 173 },
    // Shipping (boxes x≈416)
    { on: (r) => cs(r).shipping === "dba", page: 1, text: "DBA Address", center: true, absX: 416 },
    { on: (r) => cs(r).shipping === "agent", page: 1, text: "Sales Agent Address", center: true, absX: 416 },
    { on: (r) => cs(r).shipping === "other", page: 1, text: "Other:", region: { yMin: 482, yMax: 490, xMin: 270, xMax: 330 }, center: true, absX: 416 },
    // Value added services (boxes far right x≈568)
    { on: (r) => cs(r).vasGiftCards, page: 1, text: "Gift Cards", center: true, absX: 568 },
    { on: (r) => cs(r).vasCheckServices, page: 1, text: "Check Services", center: true, absX: 568 },
    { on: (r) => cs(r).vasWpiRewards, page: 1, text: "WPI Rewards", center: true, absX: 568 },
    { on: (r) => cs(r).vasCustomerConnect, page: 1, text: "Customer Connect", center: true, absX: 568 },
    // File build — application type (boxes x≈470) + connection type (x≈568)
    { on: (r) => cs(r).fbAppType === "retail", page: 1, text: "Retail", center: true, absX: 470 },
    { on: (r) => cs(r).fbAppType === "restaurant", page: 1, text: "Restaurant", center: true, absX: 470 },
    { on: (r) => cs(r).fbAppType === "ecommerce", page: 1, text: "E-Commerce", center: true, absX: 470 },
    { on: (r) => cs(r).fbAppType === "moto", page: 1, text: "Moto", center: true, absX: 470 },
    { on: (r) => cs(r).fbConnection === "ethernet", page: 1, text: "Ethernet", center: true, absX: 568 },
    { on: (r) => cs(r).fbConnection === "dial", page: 1, text: "Dial", center: true, absX: 568 },
    { on: (r) => cs(r).fbConnection === "wifi", page: 1, text: "Wifi", center: true, absX: 568 },
    { on: (r) => cs(r).fbConnection === "wireless", page: 1, text: "Wireless 3g/4g", center: true, absX: 568 },
    // Enablements (boxes far right x≈568)
    { on: (r) => cs(r).enPinDebit, page: 1, text: "Pin Debit", region: { yMin: 300, yMax: 308 }, center: true, absX: 568 },
    { on: (r) => cs(r).enEbt, page: 1, text: "EBT", region: { yMin: 286, yMax: 294 }, center: true, absX: 568 },
    { on: (r) => cs(r).enWex, page: 1, text: "Wex/Voyager", center: true, absX: 568 },
    // Special prompts — auto close / server / avs / invoice (boxes x≈459)
    { on: (r) => cs(r).autoClose, page: 1, text: "Auto Close", center: true, absX: 459 },
    { on: (r) => cs(r).timezone === "pst", page: 1, text: "PST", center: true, absX: 435.5 },
    { on: (r) => cs(r).timezone === "mst", page: 1, text: "MST", center: true, absX: 468.5 },
    { on: (r) => cs(r).timezone === "cst", page: 1, text: "CST", center: true, absX: 507.5 },
    { on: (r) => cs(r).timezone === "est", page: 1, text: "EST", center: true, absX: 541.5 },
    { on: (r) => cs(r).tips === "none", page: 1, text: "None", center: true, absX: 431 },
    { on: (r) => cs(r).tips === "tipline", page: 1, text: "Tip Line", center: true, absX: 472.5 },
    { on: (r) => cs(r).tips === "tipprompt", page: 1, text: "Tip Prompt", center: true, absX: 519.5 },
    { on: (r) => cs(r).serverNumbers, page: 1, text: "Server #", center: true, absX: 459 },
    { on: (r) => cs(r).avsCvv, page: 1, text: "AVS/CVV", center: true, absX: 459 },
    { on: (r) => cs(r).invoiceNumber, page: 1, text: "Invoice #", center: true, absX: 459 },
  ],
};

function ownLen(r) {
  const y = r.business.lengthOwnershipYears;
  const m = r.business.lengthOwnershipMonths;
  if (y && m) return `${y} yr ${m} mo`;
  if (y) return `${y} yr`;
  return r.business.businessStarted || "";
}

/* ----------------------------- Purchase Order ----------------------------- */
const po = (r) => r.po || {};
const eqItem = (r, i) => (r.equipment || [])[i] || {};
const eqHas = (r, i) => Boolean(eqItem(r, i).model || eqItem(r, i).type);
const eqName = (r, i) => {
  const e = eqItem(r, i);
  return [e.model, e.type && e.type !== e.model ? `(${e.type})` : ""].filter(Boolean).join(" ").trim();
};
function poSubtotal(r) {
  let s = 0;
  for (let i = 0; i < (r.equipment || []).length; i++) {
    if (!eqHas(r, i)) continue;
    const p = priceFor(eqItem(r, i).model || eqItem(r, i).type);
    s += (p ? p.price : 0) * (parseFloat(eqItem(r, i).quantity) || 1);
  }
  return s;
}
const poTotal = (r) => poSubtotal(r) + (parseFloat(po(r).shCost) || 0) + (parseFloat(po(r).salesTax) || 0);
const poAddress = (r) => {
  const b = r.business;
  return [b.locationAddress, [b.locationCity, b.locationState].filter(Boolean).join(", "), b.locationZip].filter(Boolean).join("  ");
};
const ROWY = [556, 538, 520, 502];

const purchase_order = {
  text: [
    { get: (r) => po(r).mid, page: 1, text: "Merchant MID:", place: "right", dx: 4, maxWidth: 160 },
    { get: (r) => r._date, page: 1, text: "Date:", region: { yMin: 678, yMax: 686 }, place: "right", dx: 4, maxWidth: 70 },
    { get: (r) => teamName(po(r).team || cs(r).teamColor), page: 1, text: "Team:", place: "right", dx: 4, maxWidth: 120 },
    { get: (r) => r.business.dba, page: 1, text: "Merchant DBA:", place: "right", dx: 4, maxWidth: 230 },
    { get: (r) => r.sales.salesAgentName || r.sales.salesRep, page: 1, text: "Sales Rep:", place: "right", dx: 4, maxWidth: 200 },
    { get: (r) => r.business.phone, page: 1, text: "Phone Number:", place: "right", dx: 4, maxWidth: 200 },
    { get: (r) => po(r).salesManager || cs(r).territoryManager, page: 1, text: "Sales Manager:", place: "right", dx: 4, maxWidth: 200 },
    { get: (r) => poAddress(r), page: 1, text: "Address:", place: "right", dx: 4, maxWidth: 470 },
    // Equipment line items (model | bill to | qty | price)
    ...ROWY.flatMap((y, i) => [
      { get: (r) => (eqHas(r, i) ? eqName(r, i) : ""), page: 1, text: "Equipment Type", absX: 145, absY: y, place: "center", maxWidth: 180 },
      { get: (r) => (eqHas(r, i) ? po(r).billTo || "Merchant" : ""), page: 1, text: "Bill To", absX: 248, absY: y, place: "right", maxWidth: 80 },
      { get: (r) => (eqHas(r, i) ? eqItem(r, i).quantity || "1" : ""), page: 1, text: "Quantity", absX: 362, absY: y, place: "right", maxWidth: 55 },
      { get: (r) => { if (!eqHas(r, i)) return ""; const p = priceFor(eqItem(r, i).model || eqItem(r, i).type); return p ? `$${p.price}` : ""; }, page: 1, text: "Price", absX: 450, absY: y, place: "right", maxWidth: 90 },
    ]),
    { get: (r) => (poSubtotal(r) ? `${poSubtotal(r)}` : ""), page: 1, text: "Sub Total: $", place: "right", dx: 4, maxWidth: 90 },
    // Shipping
    { get: (r) => po(r).shAttention || r.business.contactName || r.business.dba, page: 1, text: "Attention To:", place: "right", dx: 4, maxWidth: 170 },
    { get: (r) => po(r).shipStreet || r.business.locationAddress, page: 1, text: "Street Address:", place: "right", dx: 4, maxWidth: 400 },
    { get: (r) => po(r).shipCity || r.business.locationCity, page: 1, text: "City:", region: { yMin: 358, yMax: 366 }, place: "right", dx: 4, maxWidth: 170 },
    { get: (r) => po(r).shipState || r.business.locationState, page: 1, text: "State:", region: { yMin: 341, yMax: 349 }, place: "right", dx: 4, maxWidth: 170 },
    { get: (r) => po(r).shipZip || r.business.locationZip, page: 1, text: "Zip:", region: { yMin: 323, yMax: 331 }, place: "right", dx: 4, maxWidth: 170 },
    // Billing (ACH from the voided check)
    { get: (r) => r.banking.routing, page: 1, text: "Routing:", place: "right", dx: 4, maxWidth: 170 },
    { get: (r) => raw(r.banking.account), page: 1, text: "Account #:", place: "right", dx: 4, maxWidth: 170 },
    { get: (r) => r.business.legalName || r.business.dba, page: 1, text: "Name on Account:", place: "right", dx: 4, maxWidth: 170 },
    { get: (r) => r.banking.bankName, page: 1, text: "Name of Bank:", place: "right", dx: 4, maxWidth: 170 },
    { get: (r) => po(r).shCost, page: 1, text: "S&H Cost: $", place: "right", dx: 4, maxWidth: 90 },
    { get: (r) => po(r).salesTax, page: 1, text: "Sales Tax: $", place: "right", dx: 4, maxWidth: 90 },
    { get: (r) => (poTotal(r) ? `${poTotal(r)}` : ""), page: 1, text: "Total Amount", absX: 432, absY: 76, place: "right", maxWidth: 110 },
  ],
  check: [
    // All boxes centered on detected box mid-points; dy raises the mark to the box's vertical center.
    { on: (r) => po(r).payPlan === "3pay", page: 1, text: "3 Pay*", center: true, absX: 98.5, dy: 2.5 },
    { on: (r) => po(r).payPlan === "4pay", page: 1, text: "4 Pay*", center: true, absX: 154.5, dy: 2.5 },
    { on: (r) => (po(r).shipTo || "dba") === "dba", page: 1, text: "Merchant DBA", region: { yMin: 391, yMax: 403 }, center: true, absX: 291, dy: 2.5 },
    { on: (r) => po(r).shipTo === "rep", page: 1, text: "Sales Rep", region: { yMin: 391, yMax: 403 }, center: true, absX: 389.5, dy: 2.5 },
    { on: (r) => po(r).shipTo === "other", page: 1, text: "Other", region: { yMin: 391, yMax: 403 }, center: true, absX: 479.5, dy: 2.5 },
    { on: (r) => (po(r).shippingMethod || "ground") === "ground", page: 1, text: "Ground:", center: true, absX: 242.5, dy: 2.5 },
    { on: (r) => po(r).shippingMethod === "2day", page: 1, text: "2 Day:", center: true, absX: 242.5, dy: 2.5 },
    { on: (r) => po(r).shippingMethod === "overnight", page: 1, text: "Overnight:", center: true, absX: 242.5, dy: 2.5 },
    { on: (r) => po(r).billingType === "cc", page: 1, text: "Credit Card", center: true, absX: 65.5, dy: 2.5 },
    { on: (r) => (po(r).billingType || "ach") === "ach", page: 1, text: "ACH", region: { yMin: 219, yMax: 227 }, center: true, absX: 297.5, dy: 2.5 },
  ],
};

/* ----------------------------- Clover Addendum ----------------------------- */
const clover_addendum = {
  text: [
    { get: (r) => r.business.legalName || r.business.dba, page: 1, text: "Business Legal Name", absX: 150, absY: 204, place: "right", maxWidth: 140 },
    { get: (r) => r.signatures.printedName, page: 1, text: "Name:", region: { yMin: 146, yMax: 154 }, absX: 78, absY: 150, place: "right", maxWidth: 170 },
    { get: (r) => r.signatures.title, page: 1, text: "Title:", absX: 72, absY: 123, place: "right", maxWidth: 170 },
    { get: (r) => r._date || r.signatures.date, page: 1, text: "Date:", region: { yMin: 93, yMax: 101 }, absX: 72, absY: 97, place: "right", maxWidth: 170 },
    { get: (r) => r.business.email, page: 1, text: "Email:", region: { yMin: 201, yMax: 209 }, absX: 410, absY: 207, place: "right", maxWidth: 150 },
  ],
  check: [
    { on: (r) => (po(r).frontendPlatform || "omaha") === "omaha", page: 1, text: "Omaha", region: { yMin: 154, yMax: 162 }, dx: -12 },
    { on: (r) => po(r).frontendPlatform === "nashville", page: 1, text: "Nashville", region: { yMin: 154, yMax: 162 }, dx: -12 },
  ],
};

export const FORM_MAPS = { citizens, merrick, coversheet, purchase_order, clover_addendum };

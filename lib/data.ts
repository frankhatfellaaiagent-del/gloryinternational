import { addDays } from "./dates";
import type {
  ActivityEntry,
  DemoData,
  Document,
  Expense,
  Lender,
  LenderTask,
  Offer,
  Property,
  Vendor,
} from "./types";

const LENDERS: Lender[] = [
  {
    id: "lender-keystone",
    name: "Keystone Asset Management",
    reimbursementRule: "Expenses submitted by the 25th of each month, reimbursed net-30",
    contactEmail: "reo-desk@keystoneam.example",
  },
  {
    id: "lender-meridian",
    name: "Meridian Bank REO",
    reimbursementRule: "Reimbursement request due within 30 days of the expense date",
    contactEmail: "reoclaims@meridianbank.example",
  },
  {
    id: "lender-pinnacle",
    name: "Pinnacle Loss Mitigation",
    reimbursementRule: "Batched with the MMR, due last business day of the month",
    contactEmail: "assetmgmt@pinnaclelm.example",
  },
];

const VENDORS: Vendor[] = [
  { id: "vendor-dana", name: "Dana Reyes", trade: "Photography", email: "dana@reyesphoto.example", phone: "(209) 555-0142" },
  { id: "vendor-marcus", name: "Marcus Cole", trade: "Trash-out & Debris", email: "marcus@coleclearing.example", phone: "(330) 555-0198" },
  { id: "vendor-priya", name: "Priya Patel", trade: "General Repairs", email: "priya@patelhandyman.example", phone: "(210) 555-0117" },
  { id: "vendor-wanda", name: "Wanda Ortiz", trade: "Eviction / CFK Coordination", email: "wanda@ortizfieldservices.example", phone: "(419) 555-0163" },
  { id: "vendor-leon", name: "Leon Brooks", trade: "Locksmith / Re-key & Secure", email: "leon@brooksrekey.example", phone: "(904) 555-0184" },
];

const PROPERTIES: (Omit<Property, "archivedAt"> & { archivedAt?: string | null })[] = [
  { id: "prop-larkspur", address: "412 Larkspur Ave", city: "Modesto", state: "CA", zip: "95350", lenderId: "lender-keystone", occupancyStatus: "cash_for_keys", listPrice: 289000, photoTag: "bungalow" },
  { id: "prop-winding-creek", address: "78 Winding Creek Rd", city: "Canton", state: "OH", zip: "44708", lenderId: "lender-meridian", occupancyStatus: "vacant", listPrice: 154000, photoTag: "ranch" },
  { id: "prop-sable-ridge", address: "2290 Sable Ridge Dr", city: "San Antonio", state: "TX", zip: "78244", lenderId: "lender-pinnacle", occupancyStatus: "vacant", listPrice: 198500, photoTag: "suburban" },
  { id: "prop-poplar", address: "615 Poplar St", city: "Toledo", state: "OH", zip: "43604", lenderId: "lender-keystone", occupancyStatus: "eviction", listPrice: 121000, photoTag: "rowhouse" },
  { id: "prop-harborview", address: "934 Harborview Ct", city: "Jacksonville", state: "FL", zip: "32218", lenderId: "lender-meridian", occupancyStatus: "vacant", listPrice: 265000, photoTag: "coastal" },
  { id: "prop-quail-hollow", address: "3387 Quail Hollow Ln", city: "Charlotte", state: "NC", zip: "28215", lenderId: "lender-pinnacle", occupancyStatus: "occupied", listPrice: 241000, photoTag: "colonial" },
  { id: "prop-birchwood", address: "56 Birchwood Terrace", city: "Rochester", state: "NY", zip: "14609", lenderId: "lender-keystone", occupancyStatus: "vacant", listPrice: 133500, photoTag: "cape-cod" },
  { id: "prop-desert-willow", address: "1180 Desert Willow Way", city: "Tucson", state: "AZ", zip: "85705", lenderId: "lender-meridian", occupancyStatus: "cash_for_keys", listPrice: 209900, photoTag: "adobe" },
];

interface TaskSeed {
  title: string;
  category: LenderTask["category"];
  offset: number;
  status?: LenderTask["status"];
  vendorId?: string | null;
  requirements: string;
}

function buildTasks(propertyId: string, seeds: TaskSeed[], now: Date): LenderTask[] {
  return seeds.map((s, i) => ({
    id: `${propertyId}-task-${i}`,
    propertyId,
    title: s.title,
    category: s.category,
    status: s.status ?? "todo",
    dueDate: addDays(now, s.offset),
    assignedVendorId: s.vendorId ?? null,
    lenderRequirements: s.requirements,
  }));
}

interface ExpenseSeed {
  description: string;
  amount: number;
  incurredOffset: number;
  deadlineOffset: number;
  status: Expense["status"];
  vendorId?: string | null;
  receiptUploaded?: boolean;
}

function buildExpenses(propertyId: string, seeds: ExpenseSeed[], now: Date): Expense[] {
  return seeds.map((s, i) => ({
    id: `${propertyId}-exp-${i}`,
    propertyId,
    vendorId: s.vendorId ?? null,
    description: s.description,
    amount: s.amount,
    incurredOn: addDays(now, s.incurredOffset),
    reimbursementDeadline: addDays(now, s.deadlineOffset),
    status: s.status,
    receiptUploaded: s.receiptUploaded ?? true,
  }));
}

function buildActivity(propertyId: string, entries: [string, string, number][], now: Date): ActivityEntry[] {
  return entries.map(([actor, message, offset], i) => ({
    id: `${propertyId}-act-${i}`,
    propertyId,
    actor,
    message,
    createdAt: addDays(now, offset),
  }));
}

export function generateSeedData(now: Date = new Date()): DemoData {
  const tasks: LenderTask[] = [
    ...buildTasks("prop-larkspur", [
      { title: "BPO submission to Keystone", category: "valuation", offset: -2, status: "done", requirements: "Interior + exterior photos, comps within 0.5mi, submitted via portal." },
      { title: "Cash-for-keys agreement signature", category: "occupancy", offset: -1, vendorId: "vendor-wanda", requirements: "Signed CFK agreement + move-out date, upload scanned copy." },
      { title: "Re-key & secure once vacated", category: "repair", offset: 2, vendorId: "vendor-leon", status: "todo", requirements: "All exterior locks re-keyed, lockbox installed, photos of each door." },
      { title: "Listing photos", category: "reporting", offset: 4, vendorId: "vendor-dana", requirements: "20+ MLS-ready photos, exterior + every room." },
      { title: "Monthly Marketing Report", category: "reporting", offset: 12, requirements: "Standard MMR template, showing activity + price recommendation." },
    ], now),
    ...buildTasks("prop-winding-creek", [
      { title: "Occupancy verification", category: "occupancy", offset: -4, status: "done", requirements: "Confirm vacant, photo of posted notice." },
      { title: "Trash-out", category: "repair", offset: -1, vendorId: "vendor-marcus", requirements: "Full interior + garage trash-out, before/after photos, dump receipt." },
      { title: "Repair bid: roof leak", category: "repair", offset: 3, vendorId: "vendor-priya", requirements: "Licensed contractor bid on letterhead, 3 photos of damage." },
      { title: "Utility shut-off confirmation", category: "admin", offset: 6, requirements: "Confirmation number from each utility, upload to portal." },
    ], now),
    ...buildTasks("prop-sable-ridge", [
      { title: "BPO submission to Pinnacle", category: "valuation", offset: 1, status: "in_progress", requirements: "Pinnacle BPO form v3, exterior photos + 3 comps." },
      { title: "Secure property", category: "repair", offset: -2, vendorId: "vendor-leon", status: "done", requirements: "Board broken window, re-key front/back, lockbox code logged." },
      { title: "Landscaping / curb appeal", category: "repair", offset: 8, vendorId: "vendor-marcus", requirements: "Mow, trim, remove yard debris — photo required." },
    ], now),
    ...buildTasks("prop-poplar", [
      { title: "Eviction status update", category: "occupancy", offset: -3, vendorId: "vendor-wanda", status: "in_progress", requirements: "Court date confirmation + attorney status note." },
      { title: "Occupancy re-verification", category: "occupancy", offset: -1, requirements: "Weekly drive-by confirmation, dated photo of exterior." },
      { title: "Winterization once vacant", category: "repair", offset: 15, vendorId: "vendor-priya", requirements: "Standard winterization checklist + certificate." },
    ], now),
    ...buildTasks("prop-harborview", [
      { title: "BPO submission to Meridian", category: "valuation", offset: 5, requirements: "Meridian BPO packet, comps within 1mi, interior access photos." },
      { title: "Pool safety inspection", category: "repair", offset: 2, vendorId: "vendor-priya", requirements: "Fence/gate compliance check, photo of latch + fence line." },
      { title: "Listing photos", category: "reporting", offset: 9, vendorId: "vendor-dana", requirements: "Include pool + dock area, twilight exterior shot." },
    ], now),
    ...buildTasks("prop-quail-hollow", [
      { title: "Occupancy verification", category: "occupancy", offset: 0, requirements: "In-person contact attempt, note occupant response." },
      { title: "Cash-for-keys offer sent", category: "occupancy", offset: -5, vendorId: "vendor-wanda", status: "done", requirements: "Offer letter sent certified mail, tracking number logged." },
      { title: "HOA compliance check", category: "admin", offset: 7, requirements: "Confirm dues current, upload HOA statement." },
    ], now),
    ...buildTasks("prop-birchwood", [
      { title: "BPO submission to Keystone", category: "valuation", offset: -6, status: "done", requirements: "Interior + exterior photos, comps within 0.5mi, submitted via portal." },
      { title: "Trash-out", category: "repair", offset: -8, vendorId: "vendor-marcus", status: "done", requirements: "Full interior trash-out, before/after photos, dump receipt." },
      { title: "Monthly Marketing Report", category: "reporting", offset: 1, requirements: "Standard MMR template, showing activity + price recommendation." },
      { title: "Insurance binder upload", category: "admin", offset: 20, requirements: "Current vacant-property insurance binder on file." },
    ], now),
    ...buildTasks("prop-desert-willow", [
      { title: "Cash-for-keys agreement signature", category: "occupancy", offset: -1, vendorId: "vendor-wanda", requirements: "Signed CFK agreement + move-out date, upload scanned copy." },
      { title: "HVAC service call", category: "repair", offset: 4, vendorId: "vendor-priya", requirements: "Service report, confirm unit operational for showings." },
      { title: "Repair bid: stucco crack", category: "repair", offset: 10, vendorId: "vendor-priya", requirements: "Licensed contractor bid on letterhead, 3 photos of damage." },
    ], now),
  ];

  const expenses: Expense[] = [
    ...buildExpenses("prop-larkspur", [
      { description: "Cash-for-keys payment", amount: 1200, incurredOffset: -1, deadlineOffset: 6, status: "unsubmitted" },
      { description: "Lock re-key (4 doors)", amount: 240, incurredOffset: -1, deadlineOffset: 2, status: "submitted", vendorId: "vendor-leon" },
    ], now),
    ...buildExpenses("prop-winding-creek", [
      { description: "Trash-out crew + dump fees", amount: 860, incurredOffset: -1, deadlineOffset: -1, status: "unsubmitted", vendorId: "vendor-marcus" },
      { description: "Roof tarp (emergency)", amount: 410, incurredOffset: -5, deadlineOffset: 3, status: "submitted" },
    ], now),
    ...buildExpenses("prop-sable-ridge", [
      { description: "Board-up + re-key", amount: 320, incurredOffset: -2, deadlineOffset: 22, status: "approved", vendorId: "vendor-leon" },
    ], now),
    ...buildExpenses("prop-poplar", [
      { description: "Attorney filing fee — eviction", amount: 275, incurredOffset: -10, deadlineOffset: 1, status: "unsubmitted" },
      { description: "Utility shut-off coordination", amount: 90, incurredOffset: -3, deadlineOffset: 18, status: "unsubmitted" },
    ], now),
    ...buildExpenses("prop-harborview", [
      { description: "Pool service (monthly)", amount: 150, incurredOffset: -4, deadlineOffset: 26, status: "unsubmitted" },
    ], now),
    ...buildExpenses("prop-quail-hollow", [
      { description: "Cash-for-keys mailing + certified fees", amount: 45, incurredOffset: -5, deadlineOffset: 25, status: "paid" },
      { description: "HOA past-due payoff", amount: 630, incurredOffset: -2, deadlineOffset: 4, status: "submitted" },
    ], now),
    ...buildExpenses("prop-birchwood", [
      { description: "Trash-out crew + dump fees", amount: 720, incurredOffset: -8, deadlineOffset: -3, status: "rejected", vendorId: "vendor-marcus" },
      { description: "MLS photography", amount: 175, incurredOffset: -6, deadlineOffset: 19, status: "paid", vendorId: "vendor-dana" },
    ], now),
    ...buildExpenses("prop-desert-willow", [
      { description: "HVAC service call", amount: 265, incurredOffset: -1, deadlineOffset: 29, status: "unsubmitted", vendorId: "vendor-priya" },
      { description: "Cash-for-keys payment", amount: 1000, incurredOffset: -1, deadlineOffset: 5, status: "unsubmitted" },
    ], now),
  ];

  const offers: Offer[] = [
    { id: "prop-sable-ridge-offer-1", propertyId: "prop-sable-ridge", buyerName: "R. Delgado (investor)", amount: 191000, status: "countered", submittedAt: addDays(now, -6) },
    { id: "prop-sable-ridge-offer-2", propertyId: "prop-sable-ridge", buyerName: "Maple Peak Homes LLC", amount: 196500, status: "pending", submittedAt: addDays(now, -2) },
    { id: "prop-quail-hollow-offer-1", propertyId: "prop-quail-hollow", buyerName: "T. & J. Whitfield", amount: 236000, status: "pending", submittedAt: addDays(now, -3) },
    { id: "prop-birchwood-offer-1", propertyId: "prop-birchwood", buyerName: "Genesee Rentals Inc.", amount: 129000, status: "accepted", submittedAt: addDays(now, -9) },
  ];

  const activity: ActivityEntry[] = [
    ...buildActivity("prop-larkspur", [
      ["Agent", "Property added to portfolio", -14],
      ["Agent", "BPO submitted to Keystone", -2],
      ["Wanda Ortiz", "CFK agreement signed by occupant", -1],
    ], now),
    ...buildActivity("prop-winding-creek", [
      ["Agent", "Property added to portfolio", -20],
      ["Marcus Cole", "Trash-out completed, photos uploaded", -1],
    ], now),
    ...buildActivity("prop-sable-ridge", [
      ["Agent", "Property added to portfolio", -30],
      ["R. Delgado (investor)", "Offer submitted: $191,000", -6],
      ["Agent", "Countered at $198,000", -5],
      ["Maple Peak Homes LLC", "Offer submitted: $196,500", -2],
    ], now),
    ...buildActivity("prop-poplar", [
      ["Agent", "Property added to portfolio", -45],
      ["Wanda Ortiz", "Eviction filing in progress, court date set", -3],
    ], now),
    ...buildActivity("prop-harborview", [
      ["Agent", "Property added to portfolio", -9],
    ], now),
    ...buildActivity("prop-quail-hollow", [
      ["Agent", "Property added to portfolio", -25],
      ["Wanda Ortiz", "CFK offer mailed certified", -5],
      ["T. & J. Whitfield", "Offer submitted: $236,000", -3],
    ], now),
    ...buildActivity("prop-birchwood", [
      ["Agent", "Property added to portfolio", -60],
      ["Genesee Rentals Inc.", "Offer accepted: $129,000", -9],
      ["Agent", "Closing scheduled", -4],
    ], now),
    ...buildActivity("prop-desert-willow", [
      ["Agent", "Property added to portfolio", -11],
      ["Wanda Ortiz", "CFK agreement signed by occupant", -1],
    ], now),
  ];

  const documents: Document[] = PROPERTIES.flatMap((p) => [
    { id: `${p.id}-doc-1`, propertyId: p.id, name: "Broker Price Opinion.pdf", kind: "Valuation" },
    { id: `${p.id}-doc-2`, propertyId: p.id, name: "Listing Agreement.pdf", kind: "Contract" },
  ]);

  const properties: Property[] = PROPERTIES.map((p) => ({ ...p, archivedAt: p.archivedAt ?? null }));

  return { lenders: LENDERS, vendors: VENDORS, properties, tasks, expenses, offers, activity, documents };
}

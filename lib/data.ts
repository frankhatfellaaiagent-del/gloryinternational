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
  {
    id: "lender-unassigned",
    name: "Unassigned",
    reimbursementRule: "Pending — lender not yet set for this property",
    contactEmail: "",
  },
];

const VENDORS: Vendor[] = [
  { id: "vendor-dana", name: "Dana Reyes", trade: "Photography", email: "dana@reyesphoto.example", phone: "(209) 555-0142" },
  { id: "vendor-marcus", name: "Marcus Cole", trade: "Trash-out & Debris", email: "marcus@coleclearing.example", phone: "(330) 555-0198" },
  { id: "vendor-priya", name: "Priya Patel", trade: "General Repairs", email: "priya@patelhandyman.example", phone: "(210) 555-0117" },
  { id: "vendor-wanda", name: "Wanda Ortiz", trade: "Eviction / CFK Coordination", email: "wanda@ortizfieldservices.example", phone: "(419) 555-0163" },
  { id: "vendor-leon", name: "Leon Brooks", trade: "Locksmith / Re-key & Secure", email: "leon@brooksrekey.example", phone: "(904) 555-0184" },
];

// Jennifer Clark's Aryeo orders, last two months (Jun 21 – Aug 17). Address
// only, per instructions — no lender/occupancy/tasks/expenses invented.
// Fill those in from the property detail page as real information comes in.
const REAL_PROPERTY_ADDRESSES: { address: string; city: string; orderedOn: string }[] = [
  { address: "720 Tomlinson Terrace", city: "Lake Mary", orderedOn: "2026-08-17" },
  { address: "463 River Square Ln", city: "Ormond Beach", orderedOn: "2026-08-15" },
  { address: "921 S Salisbury Ave", city: "DeLand", orderedOn: "2026-08-14" },
  { address: "164 Debary Dr", city: "DeBary", orderedOn: "2026-08-11" },
  { address: "3647 S Atlantic Ave", city: "Daytona Beach Shores", orderedOn: "2026-08-10" },
  { address: "259 Colomba Rd", city: "DeBary", orderedOn: "2026-08-08" },
  { address: "216 Graham St", city: "Daytona Beach", orderedOn: "2026-08-05" },
  { address: "4027 Woodsong Dr", city: "Orlando", orderedOn: "2026-07-31" },
  { address: "495 North St", city: "De Leon Springs", orderedOn: "2026-07-30" },
  { address: "5825 Alstrum Dr", city: "Port Orange", orderedOn: "2026-07-28" },
  { address: "873 Silversmith Cir", city: "Lake Mary", orderedOn: "2026-07-27" },
  { address: "1526 Cherry Lake Way", city: "Lake Mary", orderedOn: "2026-07-24" },
  { address: "521 Tacoma Ave", city: "Deltona", orderedOn: "2026-07-18" },
  { address: "3 Eastgate Ln", city: "Palm Coast", orderedOn: "2026-07-17" },
  { address: "134 Crown Colony Way", city: "Sanford", orderedOn: "2026-07-14" },
  { address: "708 Celery Ave", city: "Sanford", orderedOn: "2026-07-09" },
  { address: "11355 SW 58th Cir", city: "Ocala", orderedOn: "2026-07-02" },
  { address: "2805 NE 24th Ct", city: "Ocala", orderedOn: "2026-07-02" },
  { address: "483 Spruceview Dr", city: "Port Orange", orderedOn: "2026-06-21" },
];

function slugify(address: string): string {
  return address
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const PROPERTIES: Property[] = REAL_PROPERTY_ADDRESSES.map(({ address, city }) => ({
  id: `prop-${slugify(address)}`,
  address,
  city,
  state: "FL",
  zip: "",
  lenderId: "lender-unassigned",
  occupancyStatus: "unknown",
  listPrice: 0,
  archivedAt: null,
  photoTag: "unknown",
}));

const activity: ActivityEntry[] = REAL_PROPERTY_ADDRESSES.map(({ address, city, orderedOn }) => ({
  id: `act-${slugify(address)}`,
  propertyId: `prop-${slugify(address)}`,
  actor: "Agent",
  message: `Property added — ${address}, ${city}`,
  createdAt: orderedOn,
}));

const tasks: LenderTask[] = [];
const expenses: Expense[] = [];
const offers: Offer[] = [];
const documents: Document[] = [];

export function generateSeedData(): DemoData {
  return { lenders: LENDERS, vendors: VENDORS, properties: PROPERTIES, tasks, expenses, offers, activity, documents };
}

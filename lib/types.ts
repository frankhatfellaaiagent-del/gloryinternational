export type PropertyStatus = "on_track" | "due_soon" | "overdue";

export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskCategory =
  | "valuation"
  | "occupancy"
  | "repair"
  | "reporting"
  | "admin";

export type ExpenseStatus =
  | "unsubmitted"
  | "submitted"
  | "approved"
  | "paid"
  | "rejected";

export type OfferStatus = "pending" | "countered" | "accepted" | "rejected";

export interface Lender {
  id: string;
  name: string;
  reimbursementRule: string;
  contactEmail: string;
}

export interface Vendor {
  id: string;
  name: string;
  trade: string;
  email: string;
  phone: string;
}

export interface LenderTask {
  id: string;
  propertyId: string;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  dueDate: string; // ISO date
  assignedVendorId: string | null;
  lenderRequirements: string;
}

export interface Expense {
  id: string;
  propertyId: string;
  vendorId: string | null;
  description: string;
  amount: number;
  incurredOn: string; // ISO date
  reimbursementDeadline: string; // ISO date
  status: ExpenseStatus;
  receiptUploaded: boolean;
}

export interface Offer {
  id: string;
  propertyId: string;
  buyerName: string;
  amount: number;
  status: OfferStatus;
  submittedAt: string; // ISO date
}

export interface ActivityEntry {
  id: string;
  propertyId: string;
  actor: string;
  message: string;
  createdAt: string; // ISO date
}

export interface Document {
  id: string;
  propertyId: string;
  name: string;
  kind: string;
}

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lenderId: string;
  occupancyStatus: "vacant" | "occupied" | "cash_for_keys" | "eviction";
  listPrice: number;
  archivedAt: string | null;
  photoTag: string;
}

export interface DemoData {
  lenders: Lender[];
  vendors: Vendor[];
  properties: Property[];
  tasks: LenderTask[];
  expenses: Expense[];
  offers: Offer[];
  activity: ActivityEntry[];
  documents: Document[];
}

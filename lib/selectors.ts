import { daysUntil, statusFromDays } from "./dates";
import type { DemoData, Expense, LenderTask, Property, PropertyStatus } from "./types";

export function tasksForProperty(data: DemoData, propertyId: string): LenderTask[] {
  return data.tasks.filter((t) => t.propertyId === propertyId);
}

export function expensesForProperty(data: DemoData, propertyId: string): Expense[] {
  return data.expenses.filter((e) => e.propertyId === propertyId);
}

export function offersForProperty(data: DemoData, propertyId: string) {
  return data.offers.filter((o) => o.propertyId === propertyId);
}

export function activityForProperty(data: DemoData, propertyId: string) {
  return data.activity
    .filter((a) => a.propertyId === propertyId)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function documentsForProperty(data: DemoData, propertyId: string) {
  return data.documents.filter((d) => d.propertyId === propertyId);
}

export interface NextDeadline {
  date: string;
  label: string;
  status: PropertyStatus;
}

/** Worst-case status across a property's open tasks and unresolved expenses. */
export function propertyStatus(data: DemoData, propertyId: string, now: Date = new Date()): PropertyStatus {
  const deadline = nextDeadline(data, propertyId, now);
  return deadline ? deadline.status : "on_track";
}

export function nextDeadline(data: DemoData, propertyId: string, now: Date = new Date()): NextDeadline | null {
  const openDates: { date: string; label: string }[] = [];

  for (const t of tasksForProperty(data, propertyId)) {
    if (t.status !== "done") openDates.push({ date: t.dueDate, label: t.title });
  }
  for (const e of expensesForProperty(data, propertyId)) {
    if (e.status === "unsubmitted" || e.status === "submitted") {
      openDates.push({ date: e.reimbursementDeadline, label: `Reimbursement: ${e.description}` });
    }
  }

  if (openDates.length === 0) return null;

  openDates.sort((a, b) => a.date.localeCompare(b.date));
  const soonest = openDates[0];
  const days = daysUntil(soonest.date, now);
  return { date: soonest.date, label: soonest.label, status: statusFromDays(days) };
}

export function moneyAtRisk(data: DemoData): number {
  return data.expenses
    .filter((e) => e.status === "unsubmitted" || e.status === "submitted" || e.status === "approved")
    .reduce((sum, e) => sum + e.amount, 0);
}

export function lenderName(data: DemoData, lenderId: string): string {
  return data.lenders.find((l) => l.id === lenderId)?.name ?? "Unknown lender";
}

export function vendorName(data: DemoData, vendorId: string | null): string | null {
  if (!vendorId) return null;
  return data.vendors.find((v) => v.id === vendorId)?.name ?? null;
}

export function activeProperties(data: DemoData): Property[] {
  return data.properties.filter((p) => !p.archivedAt);
}

export function tasksForVendor(data: DemoData, vendorId: string): LenderTask[] {
  return data.tasks
    .filter((t) => t.assignedVendorId === vendorId)
    .slice()
    .sort((a, b) => (a.status === "done" ? 1 : 0) - (b.status === "done" ? 1 : 0) || a.dueDate.localeCompare(b.dueDate));
}

export const STATUS_ORDER: PropertyStatus[] = ["overdue", "due_soon", "on_track"];

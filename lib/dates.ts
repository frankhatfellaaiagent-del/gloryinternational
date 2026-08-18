import type { PropertyStatus } from "./types";

export function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysUntil(iso: string, now: Date = new Date()): number {
  const target = new Date(iso + "T00:00:00");
  const today = new Date(now.toISOString().slice(0, 10) + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function statusFromDays(days: number): PropertyStatus {
  if (days < 0) return "overdue";
  if (days <= 3) return "due_soon";
  return "on_track";
}

export function statusFromDeadline(iso: string, now?: Date): PropertyStatus {
  return statusFromDays(daysUntil(iso, now));
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDeadlineLabel(iso: string, now?: Date): string {
  const days = daysUntil(iso, now);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "due today";
  if (days === 1) return "due tomorrow";
  return `due in ${days}d`;
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

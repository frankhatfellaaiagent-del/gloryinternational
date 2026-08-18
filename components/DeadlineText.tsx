"use client";

import { formatDeadlineLabel, statusFromDeadline } from "@/lib/dates";

const COLOR = {
  on_track: "text-status-on-track",
  due_soon: "text-status-due-soon",
  overdue: "text-status-overdue",
};

export function DeadlineText({ date, className = "" }: { date: string; className?: string }) {
  const status = statusFromDeadline(date);
  return <span className={`font-medium ${COLOR[status]} ${className}`}>{formatDeadlineLabel(date)}</span>;
}

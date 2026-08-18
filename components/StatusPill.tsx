import type { PropertyStatus } from "@/lib/types";

const LABEL: Record<PropertyStatus, string> = {
  on_track: "On track",
  due_soon: "Due soon",
  overdue: "Overdue",
};

const STYLE: Record<PropertyStatus, string> = {
  on_track: "bg-status-on-track-bg text-status-on-track border-status-on-track-border",
  due_soon: "bg-status-due-soon-bg text-status-due-soon border-status-due-soon-border",
  overdue: "bg-status-overdue-bg text-status-overdue border-status-overdue-border",
};

export function StatusPill({ status, className = "" }: { status: PropertyStatus; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${STYLE[status]} ${className}`}
    >
      {status === "overdue" && <span className="h-1.5 w-1.5 rounded-full bg-status-overdue" />}
      {LABEL[status]}
    </span>
  );
}

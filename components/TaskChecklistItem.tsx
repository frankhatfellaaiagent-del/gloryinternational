"use client";

import { useState } from "react";
import { DeadlineText } from "./DeadlineText";
import { useData } from "@/lib/data-context";
import type { LenderTask } from "@/lib/types";

const CATEGORY_LABEL: Record<LenderTask["category"], string> = {
  valuation: "Valuation",
  occupancy: "Occupancy",
  repair: "Repair",
  reporting: "Reporting",
  admin: "Admin",
};

const NEXT_STATUS: Record<LenderTask["status"], LenderTask["status"]> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
};

export function TaskChecklistItem({ task, vendorName }: { task: LenderTask; vendorName: string | null }) {
  const { setTaskStatus } = useData();
  const [expanded, setExpanded] = useState(false);
  const done = task.status === "done";

  return (
    <li className={`rounded-lg border border-border bg-surface p-3 ${done ? "opacity-70" : ""}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label={`Advance status for ${task.title}`}
          onClick={() => setTaskStatus(task.id, NEXT_STATUS[task.status])}
          className={`tap-target mt-0.5 flex w-11 shrink-0 items-center justify-center rounded-md border text-sm ${
            done
              ? "border-status-on-track-border bg-status-on-track-bg text-status-on-track"
              : task.status === "in_progress"
                ? "border-status-due-soon-border bg-status-due-soon-bg text-status-due-soon"
                : "border-border bg-white text-muted"
          }`}
        >
          {done ? "✓" : task.status === "in_progress" ? "…" : ""}
        </button>

        <button type="button" className="flex-1 text-left" onClick={() => setExpanded((v) => !v)}>
          <p className={`text-sm font-medium ${done ? "line-through text-muted" : "text-foreground"}`}>
            {task.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-muted">
              {CATEGORY_LABEL[task.category]}
            </span>
            {!done && <DeadlineText date={task.dueDate} />}
            {vendorName && <span className="text-muted">Assigned: {vendorName}</span>}
          </div>
        </button>
      </div>

      {expanded && (
        <p className="mt-2 rounded-md bg-slate-50 p-2 text-xs text-muted">
          <span className="font-semibold text-foreground">Lender requirements: </span>
          {task.lenderRequirements}
        </p>
      )}
    </li>
  );
}

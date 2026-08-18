"use client";

import { DeadlineText } from "./DeadlineText";
import { useData } from "@/lib/data-context";
import { formatDate, formatMoney } from "@/lib/dates";
import type { Expense, ExpenseStatus } from "@/lib/types";

const STATUS_LABEL: Record<ExpenseStatus, string> = {
  unsubmitted: "Unsubmitted",
  submitted: "Submitted",
  approved: "Approved",
  paid: "Paid",
  rejected: "Rejected",
};

const STATUS_STYLE: Record<ExpenseStatus, string> = {
  unsubmitted: "bg-slate-100 text-slate-700",
  submitted: "bg-blue-50 text-blue-700",
  approved: "bg-status-due-soon-bg text-status-due-soon",
  paid: "bg-status-on-track-bg text-status-on-track",
  rejected: "bg-status-overdue-bg text-status-overdue",
};

const FLOW: ExpenseStatus[] = ["unsubmitted", "submitted", "approved", "paid"];

export function ExpenseRow({
  expense,
  propertyLabel,
}: {
  expense: Expense;
  propertyLabel?: string;
}) {
  const { setExpenseStatus, toggleReceiptUploaded } = useData();
  const flowIndex = FLOW.indexOf(expense.status);
  const nextStatus = flowIndex >= 0 && flowIndex < FLOW.length - 1 ? FLOW[flowIndex + 1] : null;
  const outstanding = expense.status !== "paid" && expense.status !== "rejected";

  return (
    <li className="rounded-lg border border-border bg-surface p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {propertyLabel && <p className="text-xs font-medium text-muted">{propertyLabel}</p>}
          <p className="text-sm font-medium text-foreground">{expense.description}</p>
          <p className="text-xs text-muted">Incurred {formatDate(expense.incurredOn)}</p>
        </div>
        <p className="shrink-0 text-sm font-semibold text-foreground">{formatMoney(expense.amount)}</p>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full px-2 py-0.5 font-semibold ${STATUS_STYLE[expense.status]}`}>
            {STATUS_LABEL[expense.status]}
          </span>
          {outstanding && (
            <span>
              Deadline: <DeadlineText date={expense.reimbursementDeadline} />
            </span>
          )}
          <button
            type="button"
            onClick={() => toggleReceiptUploaded(expense.id)}
            className={`rounded-full border px-2 py-0.5 font-medium ${
              expense.receiptUploaded
                ? "border-status-on-track-border text-status-on-track"
                : "border-status-overdue-border text-status-overdue"
            }`}
          >
            {expense.receiptUploaded ? "Receipt uploaded" : "No receipt — tap to add"}
          </button>
        </div>

        {nextStatus && (
          <button
            type="button"
            onClick={() => setExpenseStatus(expense.id, nextStatus)}
            className="tap-target rounded-md border border-border px-3 text-xs font-semibold text-brand hover:bg-brand-soft"
          >
            Mark {STATUS_LABEL[nextStatus].toLowerCase()}
          </button>
        )}
      </div>
    </li>
  );
}

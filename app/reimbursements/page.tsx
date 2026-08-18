"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { ExpenseRow } from "@/components/ExpenseRow";
import { useData } from "@/lib/data-context";
import { daysUntil, formatMoney } from "@/lib/dates";
import { moneyAtRisk } from "@/lib/selectors";
import type { Expense } from "@/lib/types";

const OUTSTANDING: Expense["status"][] = ["unsubmitted", "submitted", "approved"];

export default function ReimbursementsPage() {
  return <RequireAuth role="agent">{() => <ReimbursementTracker />}</RequireAuth>;
}

function ReimbursementTracker() {
  const { data } = useData();

  const outstanding = data.expenses.filter((e) => OUTSTANDING.includes(e.status));
  const totalAtRisk = moneyAtRisk(data);
  const overdueTotal = outstanding
    .filter((e) => daysUntil(e.reimbursementDeadline) < 0)
    .reduce((s, e) => s + e.amount, 0);
  const dueSoonTotal = outstanding
    .filter((e) => {
      const d = daysUntil(e.reimbursementDeadline);
      return d >= 0 && d <= 3;
    })
    .reduce((s, e) => s + e.amount, 0);

  const byLender = data.lenders.map((lender) => {
    const properties = data.properties.filter((p) => p.lenderId === lender.id);
    const propertyIds = new Set(properties.map((p) => p.id));
    const expenses = outstanding
      .filter((e) => propertyIds.has(e.propertyId))
      .sort((a, b) => a.reimbursementDeadline.localeCompare(b.reimbursementDeadline));
    const batchReady = expenses.filter((e) => e.status !== "unsubmitted" && e.receiptUploaded);
    return { lender, expenses, batchReady };
  });

  function exportBatch(lenderName: string, expenses: Expense[]) {
    const rows = [
      ["Property", "Description", "Amount", "Incurred", "Deadline", "Status"],
      ...expenses.map((e) => {
        const property = data.properties.find((p) => p.id === e.propertyId);
        return [
          property?.address ?? "",
          e.description,
          e.amount.toFixed(2),
          e.incurredOn,
          e.reimbursementDeadline,
          e.status,
        ];
      }),
    ];
    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lenderName.replace(/\s+/g, "-").toLowerCase()}-reimbursement-batch.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Reimbursement tracker</h1>
      <p className="text-sm text-muted">Every dollar you&apos;ve fronted, sorted by how soon you need it back.</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Total money at risk" value={formatMoney(totalAtRisk)} tone="brand" />
        <StatCard label="Overdue" value={formatMoney(overdueTotal)} tone="overdue" />
        <StatCard label="Due within 3 days" value={formatMoney(dueSoonTotal)} tone="due_soon" />
      </div>

      <div className="mt-6 space-y-6">
        {byLender.map(({ lender, expenses, batchReady }) => (
          <section key={lender.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-foreground">{lender.name}</h2>
                <p className="text-xs text-muted">{lender.reimbursementRule}</p>
              </div>
              <button
                type="button"
                disabled={batchReady.length === 0}
                onClick={() => exportBatch(lender.name, batchReady)}
                className="tap-target rounded-md border border-border px-3 text-xs font-semibold text-brand hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Export batch ({batchReady.length}) — CSV
              </button>
            </div>

            {expenses.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Nothing outstanding for this lender.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {expenses.map((e) => {
                  const property = data.properties.find((p) => p.id === e.propertyId);
                  return <ExpenseRow key={e.id} expense={e} propertyLabel={property?.address} />;
                })}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "brand" | "overdue" | "due_soon";
}) {
  const style = {
    brand: "border-brand/30 text-brand-strong",
    overdue: "border-status-overdue-border text-status-overdue",
    due_soon: "border-status-due-soon-border text-status-due-soon",
  }[tone];

  return (
    <div className={`rounded-xl border bg-surface p-4 shadow-sm ${style}`}>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

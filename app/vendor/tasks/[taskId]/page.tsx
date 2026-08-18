"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { DeadlineText } from "@/components/DeadlineText";
import { useData } from "@/lib/data-context";
import type { TaskStatus } from "@/lib/types";

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "Not started",
  in_progress: "In progress",
  done: "Complete",
};

export default function VendorTaskPage() {
  return <RequireAuth role="vendor">{(session) => <VendorTaskDetail vendorId={session.vendorId} vendorName={session.name} />}</RequireAuth>;
}

function VendorTaskDetail({ vendorId, vendorName }: { vendorId: string; vendorName: string }) {
  const params = useParams<{ taskId: string }>();
  const { data, setTaskStatus, submitVendorInvoice } = useData();
  const task = data.tasks.find((t) => t.id === params.taskId);

  const [photoName, setPhotoName] = useState<string | null>(null);
  const [invoiceDesc, setInvoiceDesc] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceSent, setInvoiceSent] = useState(false);

  if (!task || task.assignedVendorId !== vendorId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 text-sm text-muted">
        <Link href="/vendor" className="text-brand hover:underline">
          ← Back to your tasks
        </Link>
        <p className="mt-4">This task isn&apos;t assigned to you.</p>
      </div>
    );
  }

  const property = data.properties.find((p) => p.id === task.propertyId);

  function handleInvoiceSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(invoiceAmount);
    if (!invoiceDesc.trim() || !amount || !task) return;
    submitVendorInvoice({
      propertyId: task.propertyId,
      vendorId,
      vendorName,
      description: invoiceDesc.trim(),
      amount,
    });
    setInvoiceSent(true);
    setInvoiceDesc("");
    setInvoiceAmount("");
  }

  return (
    <div className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <Link href="/vendor" className="text-sm text-brand hover:underline">
        ← Back to your tasks
      </Link>

      <h1 className="mt-3 text-xl font-semibold tracking-tight">{task.title}</h1>
      <p className="text-sm text-muted">{property?.address}</p>
      <p className="mt-1 text-sm">
        <DeadlineText date={task.dueDate} />
      </p>

      <div className="mt-5 rounded-xl border border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Lender requirements</p>
        <p className="mt-1 text-sm text-foreground">{task.lenderRequirements}</p>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold text-foreground">Status</p>
        <div className="flex gap-2">
          {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setTaskStatus(task.id, s)}
              className={`tap-target flex-1 rounded-md border text-sm font-medium ${
                task.status === s
                  ? "border-brand bg-brand-soft text-brand-strong"
                  : "border-border bg-white text-muted hover:bg-slate-50"
              }`}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-border bg-surface p-4">
        <p className="text-sm font-semibold text-foreground">Proof-of-completion photo</p>
        <p className="mt-1 text-xs text-muted">Upload a photo showing the completed work.</p>
        <label className="tap-target mt-2 flex cursor-pointer items-center justify-center rounded-md border border-dashed border-border bg-slate-50 text-sm font-medium text-muted hover:bg-slate-100">
          {photoName ?? "Choose a photo…"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? null)}
          />
        </label>
        {photoName && <p className="mt-1 text-xs text-status-on-track">✓ {photoName} attached</p>}
      </div>

      <div className="mt-5 rounded-xl border border-border bg-surface p-4">
        <p className="text-sm font-semibold text-foreground">Submit an invoice</p>
        <p className="mt-1 text-xs text-muted">
          Creates an expense on this property for the agent to review and submit for reimbursement.
        </p>

        {invoiceSent ? (
          <p className="mt-3 rounded-md bg-status-on-track-bg p-3 text-sm text-status-on-track">
            Invoice submitted — the agent will review it on the property page.
          </p>
        ) : (
          <form onSubmit={handleInvoiceSubmit} className="mt-3 space-y-2">
            <input
              value={invoiceDesc}
              onChange={(e) => setInvoiceDesc(e.target.value)}
              placeholder="What was this for?"
              required
              className="tap-target w-full rounded-md border border-border px-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
            <input
              value={invoiceAmount}
              onChange={(e) => setInvoiceAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="Amount ($)"
              inputMode="decimal"
              required
              className="tap-target w-full rounded-md border border-border px-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
            <button
              type="submit"
              className="tap-target w-full rounded-md bg-brand text-sm font-semibold text-white hover:bg-brand-strong"
            >
              Submit invoice
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

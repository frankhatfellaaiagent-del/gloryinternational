"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { StatusPill } from "@/components/StatusPill";
import { TaskChecklistItem } from "@/components/TaskChecklistItem";
import { ExpenseRow } from "@/components/ExpenseRow";
import { useData } from "@/lib/data-context";
import { formatDate, formatMoney } from "@/lib/dates";
import {
  activityForProperty,
  documentsForProperty,
  expensesForProperty,
  lenderName,
  offersForProperty,
  propertyStatus,
  tasksForProperty,
  vendorName,
} from "@/lib/selectors";
import type { Property } from "@/lib/types";

const OCCUPANCY_LABEL: Record<Property["occupancyStatus"], string> = {
  vacant: "Vacant",
  occupied: "Occupied",
  cash_for_keys: "Cash-for-keys",
  eviction: "Eviction",
  unknown: "Not set",
};

export default function PropertyDetailPage() {
  return <RequireAuth role="agent">{() => <PropertyDetail />}</RequireAuth>;
}

function PropertyDetail() {
  const params = useParams<{ id: string }>();
  const { data } = useData();
  const property = data.properties.find((p) => p.id === params.id);

  if (!property) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted">
        <Link href="/dashboard" className="text-brand hover:underline">
          ← Back to dashboard
        </Link>
        <p className="mt-4">Property not found.</p>
      </div>
    );
  }

  const status = propertyStatus(data, property.id);
  const tasks = tasksForProperty(data, property.id);
  const expenses = expensesForProperty(data, property.id);
  const offers = offersForProperty(data, property.id);
  const activity = activityForProperty(data, property.id);
  const documents = documentsForProperty(data, property.id);

  const assignedVendorIds = Array.from(new Set(tasks.map((t) => t.assignedVendorId).filter((v): v is string => !!v)));

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <Link href="/dashboard" className="text-sm text-brand hover:underline">
        ← Back to dashboard
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{property.address}</h1>
          <p className="text-sm text-muted">
            {property.city}, {property.state} {property.zip}
          </p>
        </div>
        <StatusPill status={status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Fact label="Lender" value={lenderName(data, property.lenderId)} />
        <Fact label="Occupancy" value={OCCUPANCY_LABEL[property.occupancyStatus]} />
        <Fact label="List price" value={property.listPrice > 0 ? formatMoney(property.listPrice) : "—"} />
        <Fact label="Open tasks" value={String(tasks.filter((t) => t.status !== "done").length)} />
      </div>

      <Section title="Task checklist">
        {tasks.length === 0 ? (
          <EmptyRow>No tasks yet.</EmptyRow>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => (
              <TaskChecklistItem key={t.id} task={t} vendorName={vendorName(data, t.assignedVendorId)} />
            ))}
          </ul>
        )}
      </Section>

      <Section title="Vendors on this property">
        {assignedVendorIds.length === 0 ? (
          <EmptyRow>No vendors assigned yet.</EmptyRow>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {assignedVendorIds.map((vid) => {
              const v = data.vendors.find((x) => x.id === vid)!;
              return (
                <li key={vid} className="rounded-lg border border-border bg-surface p-3">
                  <p className="text-sm font-medium text-foreground">{v.name}</p>
                  <p className="text-xs text-muted">{v.trade}</p>
                  <p className="mt-1 text-xs text-muted">
                    {v.email} · {v.phone}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="Expenses">
        {expenses.length === 0 ? (
          <EmptyRow>No expenses logged yet.</EmptyRow>
        ) : (
          <ul className="space-y-2">
            {expenses.map((e) => (
              <ExpenseRow key={e.id} expense={e} />
            ))}
          </ul>
        )}
      </Section>

      {offers.length > 0 && (
        <Section title="Offers">
          <ul className="space-y-2">
            {offers.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{o.buyerName}</p>
                  <p className="text-xs text-muted">Submitted {formatDate(o.submittedAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{formatMoney(o.amount)}</p>
                  <p className="text-xs capitalize text-muted">{o.status}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Documents">
        {documents.length === 0 ? (
          <EmptyRow>No documents uploaded yet.</EmptyRow>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {documents.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface p-3 text-sm text-foreground"
              >
                <span aria-hidden>📄</span>
                <span className="truncate">{d.name}</span>
                <span className="ml-auto shrink-0 text-xs text-muted">{d.kind}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Activity timeline">
        <ol className="space-y-2 border-l-2 border-border pl-4">
          {activity.map((a) => (
            <li key={a.id} className="relative text-sm">
              <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand" />
              <p className="text-foreground">{a.message}</p>
              <p className="text-xs text-muted">
                {a.actor} · {formatDate(a.createdAt)}
              </p>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2>
      {children}
    </section>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface p-4 text-sm text-muted">
      {children}
    </div>
  );
}

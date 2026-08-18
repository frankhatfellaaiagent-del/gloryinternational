"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { PropertyCard } from "@/components/PropertyCard";
import { AddPropertyForm } from "@/components/AddPropertyForm";
import { useData } from "@/lib/data-context";
import { activeProperties, propertyStatus } from "@/lib/selectors";
import type { PropertyStatus } from "@/lib/types";

const FILTERS: { value: PropertyStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "overdue", label: "Overdue" },
  { value: "due_soon", label: "Due soon" },
  { value: "on_track", label: "On track" },
];

export default function DashboardPage() {
  return (
    <RequireAuth role="agent">{(session) => <Dashboard agentName={session.name} />}</RequireAuth>
  );
}

function Dashboard({ agentName }: { agentName: string }) {
  const { data } = useData();
  const [filter, setFilter] = useState<PropertyStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const properties = activeProperties(data);

  const counts: Record<PropertyStatus, number> = { on_track: 0, due_soon: 0, overdue: 0 };
  for (const p of properties) counts[propertyStatus(data, p.id)]++;

  const filtered = properties
    .filter((p) => (filter === "all" ? true : propertyStatus(data, p.id) === filter))
    .filter((p) => `${p.address} ${p.city} ${p.state}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      const order: Record<PropertyStatus, number> = { overdue: 0, due_soon: 1, on_track: 2 };
      return order[propertyStatus(data, a.id)] - order[propertyStatus(data, b.id)] || a.address.localeCompare(b.address);
    });

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Good to see you, {agentName.split(" ")[0]}</h1>
          <p className="text-sm text-muted">{properties.length} active properties across every lender.</p>
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="tap-target rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          + Add property
        </button>
      </div>

      {showAdd && <AddPropertyForm onDone={() => setShowAdd(false)} />}

      <div className="mb-5 grid grid-cols-3 gap-3">
        <SummaryStat label="Overdue" value={counts.overdue} tone="overdue" />
        <SummaryStat label="Due soon" value={counts.due_soon} tone="due_soon" />
        <SummaryStat label="On track" value={counts.on_track} tone="on_track" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`tap-target whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors ${
                filter === f.value ? "bg-white text-foreground shadow-sm" : "text-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search address or city…"
          className="tap-target w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand sm:w-64"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
          No properties match this filter.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: number; tone: PropertyStatus }) {
  const border = {
    overdue: "border-status-overdue-border",
    due_soon: "border-status-due-soon-border",
    on_track: "border-status-on-track-border",
  }[tone];
  const text = {
    overdue: "text-status-overdue",
    due_soon: "text-status-due-soon",
    on_track: "text-status-on-track",
  }[tone];

  return (
    <div className={`rounded-xl border bg-surface p-3 text-center shadow-sm ${border}`}>
      <p className={`text-2xl font-bold ${text}`}>{value}</p>
      <p className="text-xs font-medium text-muted">{label}</p>
    </div>
  );
}

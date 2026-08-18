"use client";

import Link from "next/link";
import { RequireAuth } from "@/components/RequireAuth";
import { DeadlineText } from "@/components/DeadlineText";
import { useData } from "@/lib/data-context";
import { tasksForVendor } from "@/lib/selectors";

export default function VendorPage() {
  return <RequireAuth role="vendor">{(session) => <VendorTasks vendorId={session.vendorId} name={session.name} />}</RequireAuth>;
}

function VendorTasks({ vendorId, name }: { vendorId: string; name: string }) {
  const { data } = useData();
  const tasks = tasksForVendor(data, vendorId);
  const open = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Your open tasks</h1>
      <p className="text-sm text-muted">Signed in as {name}. You only see work assigned to you.</p>

      {open.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
          Nothing open right now — nice work.
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {open.map((t) => {
            const property = data.properties.find((p) => p.id === t.propertyId);
            return (
              <li key={t.id}>
                <Link
                  href={`/vendor/tasks/${t.id}`}
                  className="block rounded-xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{t.title}</p>
                      <p className="truncate text-sm text-muted">{property?.address}</p>
                    </div>
                    <DeadlineText date={t.dueDate} className="shrink-0 text-sm" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {done.length > 0 && (
        <>
          <h2 className="mt-8 mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Completed</h2>
          <ul className="space-y-2">
            {done.map((t) => {
              const property = data.properties.find((p) => p.id === t.propertyId);
              return (
                <li
                  key={t.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 opacity-70"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground line-through">{t.title}</p>
                    <p className="truncate text-xs text-muted">{property?.address}</p>
                  </div>
                  <span className="text-status-on-track">✓</span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

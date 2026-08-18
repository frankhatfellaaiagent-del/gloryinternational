"use client";

import Link from "next/link";
import { StatusPill } from "./StatusPill";
import { DeadlineText } from "./DeadlineText";
import { useData } from "@/lib/data-context";
import { lenderName, nextDeadline, propertyStatus, tasksForProperty } from "@/lib/selectors";
import type { Property } from "@/lib/types";

const OCCUPANCY_LABEL: Record<Property["occupancyStatus"], string> = {
  vacant: "Vacant",
  occupied: "Occupied",
  cash_for_keys: "Cash-for-keys",
  eviction: "Eviction",
};

export function PropertyCard({ property }: { property: Property }) {
  const { data } = useData();
  const status = propertyStatus(data, property.id);
  const deadline = nextDeadline(data, property.id);
  const tasks = tasksForProperty(data, property.id);
  const openCount = tasks.filter((t) => t.status !== "done").length;

  return (
    <Link
      href={`/properties/${property.id}`}
      className="block rounded-xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{property.address}</p>
          <p className="truncate text-sm text-muted">
            {property.city}, {property.state} {property.zip}
          </p>
        </div>
        <StatusPill status={status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="text-muted">{lenderName(data, property.lenderId)}</span>
        <span className="text-muted">·</span>
        <span className="text-muted">{OCCUPANCY_LABEL[property.occupancyStatus]}</span>
        <span className="text-muted">·</span>
        <span className="text-muted">
          {openCount} open task{openCount === 1 ? "" : "s"}
        </span>
      </div>

      {deadline && (
        <div className="mt-3 border-t border-border pt-3 text-sm">
          <span className="text-muted">Next: </span>
          <span className="text-foreground">{deadline.label}</span>{" "}
          <DeadlineText date={deadline.date} />
        </div>
      )}
    </Link>
  );
}

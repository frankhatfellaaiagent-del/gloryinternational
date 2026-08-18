"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/lib/data-context";
import type { Property } from "@/lib/types";

const OCCUPANCY_OPTIONS: { value: Property["occupancyStatus"]; label: string }[] = [
  { value: "unknown", label: "Not set" },
  { value: "vacant", label: "Vacant" },
  { value: "occupied", label: "Occupied" },
  { value: "cash_for_keys", label: "Cash-for-keys" },
  { value: "eviction", label: "Eviction" },
];

export function AddPropertyForm({ onDone }: { onDone: () => void }) {
  const { data, addProperty } = useData();
  const router = useRouter();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [lenderId, setLenderId] = useState(data.lenders[0]?.id ?? "");
  const [listPrice, setListPrice] = useState("");
  const [occupancyStatus, setOccupancyStatus] = useState<Property["occupancyStatus"]>("vacant");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim() || !city.trim() || !state.trim()) return;
    const id = addProperty({
      address: address.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
      zip: zip.trim(),
      lenderId,
      listPrice: Number(listPrice) || 0,
      occupancyStatus,
    });
    onDone();
    router.push(`/properties/${id}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 rounded-xl border border-border bg-surface p-4 shadow-sm"
    >
      <p className="mb-3 text-sm font-semibold text-foreground">Add a property</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-muted">Street address</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="tap-target w-full rounded-md border border-border px-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            placeholder="412 Larkspur Ave"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">City</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="tap-target w-full rounded-md border border-border px-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">State</label>
            <input
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              maxLength={2}
              className="tap-target w-full rounded-md border border-border px-3 text-sm uppercase outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">ZIP</label>
            <input
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="tap-target w-full rounded-md border border-border px-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Lender</label>
          <select
            value={lenderId}
            onChange={(e) => setLenderId(e.target.value)}
            className="tap-target w-full rounded-md border border-border px-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          >
            {data.lenders.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Occupancy</label>
          <select
            value={occupancyStatus}
            onChange={(e) => setOccupancyStatus(e.target.value as Property["occupancyStatus"])}
            className="tap-target w-full rounded-md border border-border px-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          >
            {OCCUPANCY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">List price</label>
          <input
            value={listPrice}
            onChange={(e) => setListPrice(e.target.value.replace(/[^0-9]/g, ""))}
            inputMode="numeric"
            className="tap-target w-full rounded-md border border-border px-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            placeholder="215000"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onDone}
          className="tap-target rounded-md border border-border px-4 text-sm font-medium text-muted hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="tap-target rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          Add property — seeds the standard checklist
        </button>
      </div>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";

export default function LoginPage() {
  const { session, ready, login } = useAuth();
  const { data } = useData();
  const router = useRouter();

  const [role, setRole] = useState<"agent" | "vendor">("agent");
  const [name, setName] = useState("Jennifer Ruiz");
  const [vendorId, setVendorId] = useState(data.vendors[0]?.id ?? "");

  useEffect(() => {
    if (!ready || !session) return;
    router.replace(session.role === "vendor" ? "/vendor" : "/dashboard");
  }, [ready, session, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (role === "agent") {
      login({ role: "agent", name: name.trim() || "Agent" });
      router.push("/dashboard");
    } else {
      const vendor = data.vendors.find((v) => v.id === vendorId);
      if (!vendor) return;
      login({ role: "vendor", vendorId: vendor.id, name: vendor.name });
      router.push("/vendor");
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-lg font-bold text-white">
            RC
          </span>
          <h1 className="text-xl font-semibold tracking-tight">REO Command Center</h1>
          <p className="mt-1 text-sm text-muted">
            One place for every property, vendor, and reimbursement deadline.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setRole("agent")}
              className={`tap-target rounded-md text-sm font-medium transition-colors ${
                role === "agent" ? "bg-white text-foreground shadow-sm" : "text-muted"
              }`}
            >
              Agent
            </button>
            <button
              type="button"
              onClick={() => setRole("vendor")}
              className={`tap-target rounded-md text-sm font-medium transition-colors ${
                role === "vendor" ? "bg-white text-foreground shadow-sm" : "text-muted"
              }`}
            >
              Vendor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {role === "agent" ? (
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="name">
                  Your name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="tap-target w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  placeholder="Jennifer Ruiz"
                />
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="vendor">
                  Choose your vendor account
                </label>
                <select
                  id="vendor"
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="tap-target w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                >
                  {data.vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} — {v.trade}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              className="tap-target w-full rounded-md bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              Sign in
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted">
            Demo build — sign-in is mocked, no password required.
          </p>
        </div>
      </div>
    </div>
  );
}

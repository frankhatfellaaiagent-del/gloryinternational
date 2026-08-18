"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const AGENT_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reimbursements", label: "Reimbursements" },
];

const VENDOR_LINKS = [{ href: "/vendor", label: "My tasks" }];

export function AppHeader() {
  const { session, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const links = session?.role === "vendor" ? VENDOR_LINKS : AGENT_LINKS;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href={session?.role === "vendor" ? "/vendor" : "/dashboard"} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-sm font-bold text-white">
            RC
          </span>
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">REO Command Center</span>
        </Link>

        {session && (
          <nav className="flex items-center gap-1 overflow-x-auto">
            {links.map((l) => {
              const active = pathname === l.href || pathname?.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`tap-target flex items-center rounded-md px-3 text-sm font-medium transition-colors ${
                    active ? "bg-brand-soft text-brand-strong" : "text-muted hover:bg-slate-100 hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        )}

        {session && (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">{session.name}</span>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="tap-target rounded-md border border-border px-3 text-sm font-medium text-muted hover:bg-slate-100"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

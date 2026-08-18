"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type Session } from "@/lib/auth-context";

export function RequireAuth<R extends Session["role"]>({
  role,
  children,
}: {
  role: R;
  children: (session: Extract<Session, { role: R }>) => React.ReactNode;
}) {
  const { session, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.role !== role) {
      router.replace(session.role === "vendor" ? "/vendor" : "/dashboard");
    }
  }, [ready, session, role, router]);

  if (!ready || !session || session.role !== role) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-sm text-muted">Loading…</div>
    );
  }

  return <>{children(session as Extract<Session, { role: R }>)}</>;
}

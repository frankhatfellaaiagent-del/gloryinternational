"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Session =
  | { role: "agent"; name: string }
  | { role: "vendor"; vendorId: string; name: string };

interface AuthContextValue {
  session: Session | null;
  ready: boolean;
  login: (session: Session) => void;
  logout: () => void;
}

const STORAGE_KEY = "reo-command-center-auth-v1";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage on mount — an external system
    // read, not a derived-state update, so this is exempt from the
    // "no setState in effects" rule of thumb.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setSession(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
    setReady(true);
  }, []);

  function login(next: Session) {
    setSession(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function logout() {
    setSession(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ session, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

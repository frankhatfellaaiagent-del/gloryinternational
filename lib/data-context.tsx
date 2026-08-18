"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { generateSeedData } from "./data";
import type { DemoData, Expense, ExpenseStatus, Property, TaskStatus } from "./types";

const STORAGE_KEY = "reo-command-center-data-v1";

interface NewPropertyInput {
  address: string;
  city: string;
  state: string;
  zip: string;
  lenderId: string;
  listPrice: number;
  occupancyStatus: Property["occupancyStatus"];
}

interface DataContextValue {
  data: DemoData;
  setTaskStatus: (taskId: string, status: TaskStatus) => void;
  setExpenseStatus: (expenseId: string, status: ExpenseStatus) => void;
  toggleReceiptUploaded: (expenseId: string) => void;
  addProperty: (input: NewPropertyInput) => string;
  submitVendorInvoice: (input: {
    propertyId: string;
    vendorId: string;
    vendorName: string;
    description: string;
    amount: number;
  }) => void;
  resetDemoData: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

const STANDARD_CHECKLIST: { title: string; category: "valuation" | "occupancy" | "repair" | "reporting" | "admin"; days: number; requirements: string }[] = [
  { title: "BPO submission", category: "valuation", days: 10, requirements: "Interior + exterior photos, comps within 0.5mi, submitted via portal." },
  { title: "Occupancy verification", category: "occupancy", days: 3, requirements: "Confirm occupancy status, dated photo of exterior." },
  { title: "Secure & re-key", category: "repair", days: 7, requirements: "All exterior locks re-keyed, lockbox installed, photos of each door." },
  { title: "Monthly Marketing Report", category: "reporting", days: 30, requirements: "Standard MMR template, showing activity + price recommendation." },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DemoData>(() => generateSeedData(new Date()));
  const hydrated = useRef(false);

  useEffect(() => {
    // One-time hydration from localStorage on mount — an external system
    // read, not a derived-state update, so this is exempt from the
    // "no setState in effects" rule of thumb.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setData(JSON.parse(raw));
    } catch {
      // ignore malformed storage, fall back to fresh seed
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  function setTaskStatus(taskId: string, status: TaskStatus) {
    setData((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId);
      if (!task) return prev;
      const activity = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        propertyId: task.propertyId,
        actor: "Agent",
        message: `"${task.title}" marked ${status.replace("_", " ")}`,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      return {
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
        activity: [...prev.activity, activity],
      };
    });
  }

  function setExpenseStatus(expenseId: string, status: ExpenseStatus) {
    setData((prev) => {
      const expense = prev.expenses.find((e) => e.id === expenseId);
      if (!expense) return prev;
      const activity = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        propertyId: expense.propertyId,
        actor: "Agent",
        message: `Expense "${expense.description}" marked ${status}`,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      return {
        ...prev,
        expenses: prev.expenses.map((e) => (e.id === expenseId ? { ...e, status } : e)),
        activity: [...prev.activity, activity],
      };
    });
  }

  function toggleReceiptUploaded(expenseId: string) {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === expenseId ? { ...e, receiptUploaded: !e.receiptUploaded } : e)),
    }));
  }

  function addProperty(input: NewPropertyInput): string {
    const id = `prop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date();
    setData((prev) => {
      const property: Property = { id, archivedAt: null, photoTag: "generic", ...input };
      const tasks = STANDARD_CHECKLIST.map((c, i) => ({
        id: `${id}-task-${i}`,
        propertyId: id,
        title: c.title,
        category: c.category,
        status: "todo" as TaskStatus,
        dueDate: new Date(now.getTime() + c.days * 86_400_000).toISOString().slice(0, 10),
        assignedVendorId: null,
        lenderRequirements: c.requirements,
      }));
      const activity = {
        id: `act-${Date.now()}`,
        propertyId: id,
        actor: "Agent",
        message: "Property added to portfolio",
        createdAt: now.toISOString().slice(0, 10),
      };
      return {
        ...prev,
        properties: [...prev.properties, property],
        tasks: [...prev.tasks, ...tasks],
        activity: [...prev.activity, activity],
      };
    });
    return id;
  }

  function submitVendorInvoice(input: {
    propertyId: string;
    vendorId: string;
    vendorName: string;
    description: string;
    amount: number;
  }) {
    const now = new Date();
    setData((prev) => {
      const expense: Expense = {
        id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        propertyId: input.propertyId,
        vendorId: input.vendorId,
        description: input.description,
        amount: input.amount,
        incurredOn: now.toISOString().slice(0, 10),
        reimbursementDeadline: new Date(now.getTime() + 21 * 86_400_000).toISOString().slice(0, 10),
        status: "submitted",
        receiptUploaded: true,
      };
      const activity = {
        id: `act-${Date.now()}`,
        propertyId: input.propertyId,
        actor: input.vendorName,
        message: `Invoice submitted: "${input.description}" — $${input.amount.toLocaleString("en-US")}`,
        createdAt: now.toISOString().slice(0, 10),
      };
      return {
        ...prev,
        expenses: [...prev.expenses, expense],
        activity: [...prev.activity, activity],
      };
    });
  }

  function resetDemoData() {
    const fresh = generateSeedData(new Date());
    setData(fresh);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  }

  return (
    <DataContext.Provider
      value={{
        data,
        setTaskStatus,
        setExpenseStatus,
        toggleReceiptUploaded,
        addProperty,
        submitVendorInvoice,
        resetDemoData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

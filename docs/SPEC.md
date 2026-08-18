# REO Command Center — Product Spec

Single app for a high-volume REO (bank-owned property) listing agent to
replace a spreadsheet + a stack of servicer portals (Equator, Res.net,
Exceleras) with one agent-controlled system. Source material: the REO
Command Center execution plan and the REO Listing App competitive gap
analysis.

## 1. Who uses it

- **Agent** (owner) — full access to every property, lender, vendor,
  expense, and report.
- **Vendor** (contractor/photographer/trash-out crew/etc.) — sees only
  their own assigned tasks, the lender's requirements for that task, and
  can upload proof-of-completion photos or an invoice. Nothing else.

## 2. Data model

Tables live in Postgres (Supabase). See `supabase/schema.sql` for the
runnable DDL. Summary:

- **lenders** — `id, name, reimbursement_rule` (e.g. "expenses by 25th of
  month", "30 days after closing"), `contact_email`.
- **properties** — `id, address, lender_id, status` (`on_track` |
  `due_soon` | `overdue`), `list_price`, `occupancy_status`, `next_deadline`,
  `next_deadline_label`, `archived_at` (null until closed). Never
  hard-deleted — closing sets `archived_at` and the record stays queryable
  forever with all its children intact.
- **tasks** — `id, property_id, title, category` (`valuation` | `occupancy`
  | `repair` | `reporting` | `admin`), `status` (`todo` | `in_progress` |
  `done`), `due_date`, `assigned_vendor_id` (nullable), `lender_requirements`
  (free text — what the servicer wants to see for this task).
- **vendors** — `id, name, trade` (photography | trash-out | repairs |
  eviction/CFK | inspection), `email`, `phone`.
- **expenses** — `id, property_id, vendor_id` (nullable), `description`,
  `amount`, `incurred_on`, `reimbursement_deadline` (computed from the
  lender's rule), `status` (`unsubmitted` | `submitted` | `approved` |
  `paid` | `rejected`), `receipt_url`.
- **offers** — `id, property_id, buyer_name, amount, status`
  (`pending` | `countered` | `accepted` | `rejected`), `submitted_at`,
  counter history as a linked list of prior offers.
- **activity_log** — `id, property_id, actor, message, created_at` — the
  permanent audit trail (task completions, expense submissions, offer
  events, closing).
- **mmrs** (Monthly Marketing Reports) — `id, property_id, month`,
  pre-filled fields, `sent_at`.

## 3. The five screens (design locked in `/design`, tokens in
docs/DESIGN.md)

1. **Agent dashboard** — every non-archived property as a card/row:
   address, status pill, lender, next deadline, red overdue flags. This
   is the "replace Jennifer's Excel sheet" screen.
2. **Property detail** — task checklist, assigned vendors, expenses,
   documents, activity timeline.
3. **Vendor view** — "your open tasks" list, and a task page showing the
   lender's requirements plus a photo/invoice upload.
4. **Reimbursement tracker** — total money at risk, deadline countdowns,
   batch-ready expenses grouped by lender.
5. **Login** — agent or vendor.

Status colors are semantic, not decorative: on-track (green), due-soon
(amber, ≤3 days out), overdue (red) — used consistently on properties,
tasks, and reimbursement deadlines.

## 4. Feature checklist (what a purpose-built app has to cover, per the
gap analysis of Equator / Res.net / Exceleras / Open to Close / dotloop)

- BPO / valuation deadlines and submission tracking
- Occupancy verification, cash-for-keys, eviction tracking
- Re-key, secure, trash-out, repair/rehab bid management
- Utility monitoring and shut-off coordination
- Monthly Marketing Reports to asset managers
- Multi-offer / counteroffer tracking per property
- **Expenses & reimbursement (the highest-value gap):** every dollar
  fronted, deadlines computed per lender's rule, "money at risk" view,
  reminders before the deadline
- A **permanent** per-property record that survives closing — none of the
  incumbent portals or general transaction platforms (dotloop, SkySlope,
  Brokermint) keep one

## 5. Build phases

1. **Phase 1 — Dashboard + property records.** Lenders/properties/tasks/
   activity-log schema, agent login, dashboard + property detail matching
   the mockups, pre-seeded REO task checklist per property, full CRUD,
   demo data. No vendor logins, no expenses yet.
2. **Phase 2 — Reimbursement engine.** Expense tracking with receipt photo
   upload, per-lender deadline rules, auto-computed deadlines, the
   Reimbursement screen, email alerts 3–5 days out, one-click batch
   export (PDF/CSV) per lender.
3. **Phase 3 — Vendor logins.** Vendor role, invite-by-email, Row-Level
   Security so a vendor only ever sees their own tasks (write RLS tests
   proving this), vendor dashboard/task view, proof-of-completion photo
   upload, vendor invoice upload that creates an Expense for agent review.
4. **Phase 4 — Offers, MMRs, archive.** Offer/counter tracking with
   multiple simultaneous offers, MMR builder that pre-fills property data,
   closing flow that moves a property into a permanent, searchable
   Archive with every document/expense/activity record intact.

## 6. Current state of this build

This repository currently ships the **design + Phase 1 experience** as a
fully interactive Next.js app running on seeded demo data (8 properties,
3 lenders, 5 vendors) held in browser `localStorage` — no external
services required to click through it. `supabase/schema.sql` has the
Postgres DDL matching the model above, ready to swap in as the real data
source (replace `lib/data.ts` reads/writes with Supabase queries) once a
Supabase project and Vercel env vars exist, per Step 0 of the execution
plan.

## 7. Non-negotiable rules

- Properties are archived, never hard-deleted.
- Vendor data isolation is enforced at the database layer (RLS), not just
  hidden in the UI.
- Mobile-first — the agent and every vendor live on their phones.
- Every phase ships with seed data so the app never looks empty.

## 8. Open questions for the agent (ask at the Phase 1 demo)

- Which lenders/servicers does she actually work with, and what's each
  one's exact reimbursement deadline rule?
- Current vendor list and their trades/contact info.
- Column headers from her current Excel sheet — what is she tracking
  today that this spec might be missing?
- Which task categories/checklist items are truly standard across every
  property vs. lender-specific?

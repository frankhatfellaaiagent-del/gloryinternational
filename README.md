# REO Command Center

Single source of truth for a high-volume REO listing agent: properties,
tasks, vendors, expenses, reimbursement deadlines, offers, and a permanent
post-close record — replacing a spreadsheet and a stack of servicer
portals. See `docs/SPEC.md` for the full product spec and `docs/DESIGN.md`
for the design system.

## Running it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Sign in as either role — no password needed:

- **Agent** — enter any name, lands on the dashboard.
- **Vendor** — pick one of the five demo vendor accounts, lands on "My
  tasks" (Dana Reyes and Priya Patel both have open work in the seed data).

The app runs entirely on seeded demo data (`lib/data.ts`): 8 properties, 3
lenders, 5 vendors, with a mix of overdue/due-soon/on-track deadlines
recomputed relative to today. Every edit (checking off a task, advancing an
expense's status, adding a property, a vendor submitting an invoice)
persists to the browser's `localStorage`, so it survives a refresh but
stays local to your browser — no backend required to click through it.

To reset back to the original seed data, clear `localStorage` for the site
(or open dev tools → Application → Local Storage → remove the
`reo-command-center-*` keys).

## Screens

- `/dashboard` — every property as a card: status, lender, next deadline;
  filter by status, search, add a property (seeds the standard task
  checklist).
- `/properties/[id]` — task checklist, vendors, expenses, offers,
  documents, activity timeline.
- `/vendor` — a vendor's own open tasks only.
- `/vendor/tasks/[taskId]` — the lender's requirements for that task, a
  status control, a mock photo upload, and an invoice submission that
  creates an expense on the property for the agent to review.
- `/reimbursements` — total money at risk, grouped by lender with each
  lender's actual reimbursement rule, and a CSV export of batch-ready
  expenses.

## Wiring up a real backend

`supabase/schema.sql` has the Postgres schema (tables + Row-Level Security
so a vendor can only ever read their own assigned tasks) matching the data
model in `docs/SPEC.md`. To go from demo data to a real Supabase project:
run that file against a new Supabase project, then swap the reads/writes in
`lib/data-context.tsx` for `@supabase/supabase-js` queries — the rest of
the app (components, pages, selectors) is written against the same
`DemoData`-shaped types in `lib/types.ts` and doesn't need to change.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4. Hand-built Tailwind
components following shadcn/ui conventions (see `docs/DESIGN.md`) rather
than the shadcn CLI, to keep the build dependency-free.

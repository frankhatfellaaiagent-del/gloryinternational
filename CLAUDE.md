# REO Command Center

App for a high-volume REO (bank-owned) listing agent. Single source of truth
per property: tasks, vendors, lender requirements, fronted expenses,
reimbursement deadlines, permanent post-close records.

## Read first

- docs/SPEC.md — full product spec (data model, roles, phases). Follow it.
- docs/DESIGN.md — approved design system (colors, type, components).
  Never invent new styles; use these tokens.

## Stack

Next.js (App Router) + Tailwind + shadcn/ui-style components. Data layer is
built against the Supabase schema in `supabase/schema.sql` (Postgres, Auth,
Storage) but currently runs on seeded demo data in `lib/data.ts` so the app
is fully interactive without external credentials — see docs/SPEC.md for how
to wire up a real Supabase project.

## Rules

- Property records are PERMANENT. Never hard-delete a property; archive it.
- Vendors see ONLY their assigned tasks — enforce with Supabase Row-Level
  Security once a real backend is connected, never with UI hiding alone.
- Mobile-first: the agent and vendors live on their phones.
- Every phase must ship with seed/demo data so the app never looks empty.
- Small PRs, one phase at a time. Plain-English PR descriptions — the
  reviewer is not an engineer.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

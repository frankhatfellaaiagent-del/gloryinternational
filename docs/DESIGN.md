# REO Command Center — Design System

Approved design tokens and components. Follow these — don't invent new
styles. Defined in `app/globals.css` as CSS variables mapped through
Tailwind v4's `@theme inline`.

## Color

One accent color, plus three semantic status colors used consistently
everywhere a deadline or record appears (dashboard cards, task rows,
expense rows, reimbursement stat cards).

| Token | Hex | Use |
|---|---|---|
| `--brand` | `#1d4ed8` | Primary actions, active nav, links |
| `--brand-strong` | `#1e3a8a` | Hover state on brand elements, headings on brand surfaces |
| `--brand-soft` | `#eff4ff` | Selected/active background |
| `--background` | `#f6f7f9` | App background |
| `--surface` | `#ffffff` | Cards, headers, inputs |
| `--foreground` | `#0f172a` | Primary text |
| `--muted` | `#64748b` | Secondary text |
| `--border` | `#e2e8f0` | Card and input borders |

Status semantics (property status, task deadlines, expense deadlines):

| Status | Text | Background | Border |
|---|---|---|---|
| On track | `#059669` | `#ecfdf5` | `#a7f3d0` |
| Due soon (≤3 days) | `#b45309` | `#fffbeb` | `#fde68a` |
| Overdue | `#dc2626` | `#fef2f2` | `#fecaca` |

Status is computed, never hand-set: `lib/dates.ts#statusFromDays` — negative
days = overdue, 0–3 days = due soon, otherwise on track. Same function
drives the dashboard's status pills, task checklist deadlines, and the
reimbursement tracker.

## Typography

Geist Sans (via `next/font/google`) for UI text, Geist Mono available for
anything tabular/numeric if needed later. No secondary display face —
weight and size carry hierarchy, not a second font.

- Page title: `text-xl font-semibold tracking-tight`
- Section label: `text-sm font-semibold uppercase tracking-wide text-muted`
- Card title: `text-sm font-medium` / `font-semibold` for emphasis
- Body/meta: `text-sm text-muted` or `text-xs text-muted`

## Spacing & layout

- Mobile-first: single column, cards stack; `sm:`/`lg:` breakpoints add
  columns (dashboard grid goes 1 → 2 → 3 columns).
- Content max-width `max-w-3xl`–`max-w-5xl` depending on screen, centered.
- Cards: `rounded-xl border border-border bg-surface p-4 shadow-sm`.
- Every interactive element (buttons, nav links, form fields, task rows)
  carries the `.tap-target` utility (`min-height: 44px`) — the agent and
  every vendor use this on a phone.

## Components (hand-built Tailwind primitives, shadcn/ui conventions)

- `StatusPill` — the on-track/due-soon/overdue badge, used on every
  property card and property detail header.
- `DeadlineText` — colored relative-deadline text ("3d overdue", "due
  tomorrow"), driven by the same status function.
- `AppHeader` — sticky top bar, role-aware nav (agent gets
  Dashboard/Reimbursements, vendor gets My tasks), logout.
- `PropertyCard` — dashboard list item: address, status pill, lender,
  occupancy, open task count, next deadline.
- `TaskChecklistItem` — tap to cycle todo → in progress → done, tap the
  label to expand the lender's requirements text.
- `ExpenseRow` — status badge, deadline, receipt-uploaded toggle, and a
  "mark next status" button that walks the unsubmitted → submitted →
  approved → paid pipeline. Reused on the property detail page and the
  reimbursement tracker (with a property-address label there).
- `AddPropertyForm` — inline card (not a modal) so the flow works the same
  on mobile and desktop; seeds the standard task checklist on submit.
- `RequireAuth` — role gate for every protected route; renders a loading
  state during the localStorage hydration check, then redirects to
  `/login` or the other role's home if the session doesn't match.

## Real-estate feel

Clean, dense-but-scannable cards over a light neutral background — no
photography, no gradients, no dark mode. The one accent blue is reserved
for actions and active states so the status colors (green/amber/red) stay
the loudest thing on any screen, since deadlines are the entire point of
this app.

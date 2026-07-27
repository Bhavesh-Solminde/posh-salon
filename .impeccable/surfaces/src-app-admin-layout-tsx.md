---
version: 1
slug: "src-app-admin-layout-tsx"
primary_target: "src/app/admin/layout.tsx"
related_targets: []
---

## Scope & Visitor Mode
Admin dashboard **shell** (`src/app/admin/layout.tsx` → `AdminShell`), Operate mode.
This pass builds only the navigation frame + an honest placeholder per section; no section
screen, no backend, UI-only with clearly-mocked identity.

## Audience, Job, Action, Proof
Front-desk Cashier (primary) + Manager/Admin. Job: land anywhere, know *where they are* and
*what else exists*, reach any of 12 sections in one click. Proof it's Posh Salon not a
generic admin kit = the seal in the rail, gold-foil active nav + primary action, ink-on-warm
paper, Bodoni for the page title only. No fabricated customers/invoices/revenue.

## Chosen Direction — "The Maison Ledger" (Operate register of the Stationery world)
- `warm-panel` left sidebar, seal + Bodoni wordmark; groups Operations / Management.
- Active nav = 2px gold left-edge + gold icon + `aria-current`; hover = warm-line wash.
- Deckle/grain **retired** from all chrome/data — sharp rectangles + `warm-line` hairlines.
- Sticky topbar: global search (shell only), gold "+ New Invoice", mock staff chip (initials
  tile, not a circular avatar — the circle rule reserves circles for the seal).
- Bodoni only for the per-screen title (`ui-title`); all else Inter on the fixed-rem UI scale.

## Reused / New
- Reuses `Seal` and Lucide thin-line icons. Adds `AdminButton` (compact, 150ms, semantic
  `danger`) rather than the landing's expressive embossed `Button` — the landing button is
  left untouched so the homepage can't regress.
- Adds Operate tokens: semantic state colors (success/warning/danger/info) + fixed-rem UI
  scale (ui-title/ui-lg/ui/ui-sm). DESIGN.md reconciled to the light world + Operate rules.

## States Implemented
Nav default/hover/active/focus; sidebar full-label / icon-rail (`md`) / off-canvas drawer
(`< md`, scrim + focus trap + Esc + scroll-lock + focus restore); skip-to-content link;
`SectionPlaceholder` empty state per section. Topbar search = idle/focus (results deferred).

## Unresolved / Deferred
- Sidebar tone asserted as all-light warm rail (dark-ink-rail alternative available).
- RBAC gating (`role` on nav items) is recorded but not enforced — arrives with real auth.
- Real data, Prisma/Postgres, Better Auth, and each section's actual screen are later passes.
- Global-search results dropdown deferred to the Billing/POS or Customers build.

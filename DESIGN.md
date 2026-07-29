---
name: Solminde Studio
description: A luxury salon rendered as maison stationery — warm cream card stock, gold foil marks, crisp ink type. One design system across a Persuade landing and an Operate admin.
colors:
  warm-white: "#FAF6ED"
  warm-panel: "#F3EBDD"
  warm-line: "#E2D5C0"
  gold-shadow: "#8A6A2E"
  gold: "#C7A24B"
  gold-bright: "#E6C978"
  cream: "#F6EEDD"
  ink: "#1C160E"
  ink-muted: "#6B5D45"
  success: "#3E6B44"
  warning: "#8A5A0E"
  danger: "#9E3B34"
  info: "#3E5C7A"
typography:
  display:
    fontFamily: "Bodoni Moda, Didot, Bodoni, Georgia, serif"
    fontSize: "clamp(2.75rem, 3.2vw + 2rem, 5.75rem)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Bodoni Moda, Didot, Bodoni, Georgia, serif"
    fontSize: "clamp(1.6rem, 1.2vw + 1.3rem, 2.5rem)"
    fontWeight: 500
    lineHeight: 1.1
  particulars:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "0.28em"
  nav:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.68rem"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "0.28em"
  meta:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.65rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.28em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  ui-title:
    fontFamily: "Bodoni Moda, Didot, Bodoni, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.15
  ui-lg:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.4
  ui:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  ui-sm:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  none: "0px"
  seal: "9999px"
spacing:
  section-y: "6rem"
  section-y-lg: "8rem"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "14px 28px"
  button-primary-hover:
    backgroundColor: "{colors.gold-bright}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.gold}"
    rounded: "{rounded.none}"
    padding: "14px 28px"
---

# Design System: Solminde Studio (Light / Cream Stationery Version)

## Overview

**Creative North Star: "The Maison Stationery"**

Solminde Studio's light homepage reads as the opened interior of a luxury maison invitation — warm cream card stock, gold foil rules and seals, and crisp ink typography. The page is built on the logic of folded stationery paper: a soft warm-white ground (`#FAF6ED`), textured warm panels (`#F3EBDD`), and rich gold foil accents.

Key Characteristics:
- Warm-white card-stock ground with gold foil accents and warm paper inserts.
- The real logo functions as the wax seal throughout.
- Deckle (torn-paper) edges replace border-radius on content panels.
- Didone display serif (Bodoni Moda) for headlines; Inter for functional text.
- Sections read as a printed program (numbered service list, lettered clauses) rather than icon-plus-heading cards.

### Two registers of one world

The system serves two surface types, and the same stationery world speaks differently in each:

- **Persuade (public landing):** full expression — deckle-edged cream inserts, fluid didone
  headlines, the seal's stamp animation, generous air. Design is the product.
- **Operate (staff admin, "The Maison Ledger"):** the world in a working register — the tool
  disappears into the task. Identity survives in precise details (the seal in the rail, gold
  foil on the active nav item and primary actions, ink-on-warm-paper, Bodoni for the page
  title only). But **deckle edges, grain texture, fluid type, and orchestrated motion all
  retire**; admin chrome and data are sharp rectangles with hairline rules, a fixed-rem type
  scale, and 150–250ms state-only transitions. Per-mode composition lives in each surface
  brief, not here.

## Colors

Warm paper, gold foil, ink. The brand palette is a single family — warm neutrals + gold —
matching the logo; there is no second decorative accent hue. A restrained set of **semantic
state colors** exists **only for the Operate (admin) surface** and is functional, never
decorative.

### Primary
- **Gold** (`#C7A24B`): the one carrying accent — primary buttons, the seal's ring, active
  nav state, hairline rules, list numerals. Used sparingly; it marks emphasis, not decoration.
- **Gold Bright** (`#E6C978`): hover state for gold-filled elements only.
- **Gold Shadow** (`#8A6A2E`): the engraved/recessed register of gold — roman numerals, tier
  initials, italic captions on paper. Never used on its own as an interactive color.

### Neutral
- **Warm White** (`#FAF6ED`): the base ground everywhere — the open stationery page.
- **Warm Panel** (`#F3EBDD`): the one-step-deeper surface — the admin sidebar rail and any
  raised/inset panel. A tonal lift, not a shadow.
- **Warm Line** (`#E2D5C0`): all hairline dividers, borders, and table rules.
- **Cream** (`#F6EEDD`): the "opened card insert" surface for deckle-edged panels (landing
  only — About, membership tickets, forms).
- **Ink** (`#1C160E`) / **Ink Muted** (`#6B5D45`): primary and secondary text on warm paper.

### Semantic States (Operate surface only)
Muted, ledger-ink tones that sit on warm paper; each `DEFAULT` is AA-legible as text on
`#FAF6ED`, each `soft` is a chip/badge tint. Used for status, never for brand emphasis.
- **Success** (`#3E6B44`, soft `#E6EEE3`): paid, active, present, in-stock.
- **Warning** (`#8A5A0E`, soft `#F2E6C9`): low stock, expiring soon, partial payment.
- **Danger** (`#9E3B34`, soft `#F1E0DC`): overdue, cancelled, out-of-stock, destructive.
- **Info** (`#3E5C7A`, soft `#E1E7ED`): neutral notices and non-urgent status.

### Named Rules
**The One Seal Rule.** Gold never fills a whole surface and never appears as a gradient; it
is always a line, a ring, a numeral, or a button fill — a foil mark, not a wash.
**The States-Are-Operate-Only Rule.** Semantic colors appear only in the admin, only on
status marks (chips, dots, inline validation). They never touch the public landing or the
brand's expressive moments.

## Typography

**Display Font:** Bodoni Moda (with Didot, Bodoni, Georgia fallback)
**Body Font:** Inter (with system sans-serif fallback)

**Character:** Bodoni Moda is a genuine high-contrast didone in the lineage French maisons and fashion mastheads (Chanel, Vogue) have historically used in print — chosen for that specific documented association, not as a generic "luxury serif." Inter carries every functional word (nav, buttons, form labels, body copy) so the didone stays reserved for the invitation's own voice.

### Hierarchy
- **Display** (500, `clamp(2.75rem, 3.2vw + 2rem, 5.75rem)`, italic, line-height 1.02): the hero headline only.
- **Headline** (500, `clamp(1.6rem, 1.2vw + 1.3rem, 2.5rem)`, italic): section titles ("The Program.", "The Privilege Extended.").
- **Particulars** (500, 0.72rem, letter-spacing 0.28em, uppercase): the hero letterhead line only — the one-time device, not a general label size.
- **Nav** (500, 0.68rem, letter-spacing 0.28em, uppercase): primary navigation and footer links.
- **Meta** (400–500, 0.65rem, letter-spacing 0.28em, uppercase): the smallest tier — form field labels, dt labels, card captions, tags ("Most Extended").
- **Body** (400, 1rem, line-height 1.6, max measure 70ch): paragraph copy.

**Operate (admin) UI scale — fixed rem, ~1.2 ratio, never fluid:**
- **UI Title** (Bodoni, 500, 1.5rem): the per-screen page title and the sidebar wordmark — the *only* Bodoni in the admin.
- **UI Lg** (Inter, 500, 1.125rem): panel/section subheads within a screen.
- **UI** (Inter, 400, 0.9375rem / 15px): default admin body and table data — slightly denser than the landing's 1rem.
- **UI Sm** (Inter, 400, 0.8125rem / 13px): secondary data, helper text, dense cells.

### Named Rules
**The Didone-Speaks Rule.** Bodoni Moda only ever renders words the surface itself is "saying" — landing headlines/tier names, and in the admin **the page title and the rail wordmark** only. All other UI chrome (nav, buttons, labels, data, chips) stays in Inter without exception.
**The Fixed-In-Operate Rule.** The admin never uses the fluid `clamp` display sizes; it uses the fixed-rem UI scale so nothing reflows with viewport width inside a tool.

## Layout

**Landing (Persuade):** single-column, section-stacked, `max-w-6xl`→`max-w-4xl` containers,
generous vertical rhythm (`py-24`–`py-32`), more space above a heading than below it.
Alternating warm-white / warm-panel tonal bands substitute for card borders as the
section separator. Responsive: hero CTA row and membership grid go single-column below
`sm`/`lg`; header nav collapses to a full-bleed mobile drawer below `md`.

**Admin (Operate):** a fixed app frame — persistent left **sidebar** (`warm-panel`) + sticky
**topbar** + scrolling content region (`warm-white`). Content can run dense and wide (tables
past 100ch are fine). Responsive is **structural, not fluid**: sidebar → icon-rail at `lg`,
→ off-canvas drawer (scrim + focus trap) at `md`. No clamp typography anywhere in the app.

## Elevation & Depth

Flat by default — most surfaces have no shadow at all, separated only by tonal shifts
(warm-white → warm-panel) and 1px `warm-line` hairlines. Shadows are reserved for objects that
are physically "raised off the paper": the seal, the featured membership tier, and (in the
admin) transient overlays only.

### Shadow Vocabulary (current light values)
- **`shadow-seal`** (`0 8px 24px -6px rgba(28,22,14,0.25), 0 0 0 1px rgba(199,162,75,0.4)`): the logo seal — stamped/pressed onto paper.
- **`shadow-emboss`** (`0 1px 0 0 rgba(230,201,120,0.3), 0 12px 28px -10px rgba(138,106,46,0.35)`): the primary gold button's foil-embossed edge.
- **`shadow-card-lift`** (`0 20px 48px -20px rgba(28,22,14,0.18)`): the featured membership tier, and reused for admin overlays that leave the page plane (dropdowns, drawers).

### Named Rules
**The Stamped-Not-Floating Rule.** Shadows always carry a real offset and blur, sized to argue a specific object is raised (seal, lifted card); a shadow never appears as ambient decoration on a plain container.

## Shapes

No border-radius anywhere except circular seal marks — the logo itself, the membership tier initials (S/G/P/C, each a small gold-ringed medallion), and the WhatsApp chip. All three are the same device at different scales: a pressed medallion, not a "friendly rounded" UI habit. Every other surface is either a sharp rectangle (buttons, service-list rows, gallery frames) or a deckle (irregular torn-paper) silhouette via CSS `clip-path` on cream panels — the card-stock alternative to a rounded corner. Gallery placeholder frames use open corner brackets rather than a filled border, evoking a print-mount rather than a photo card.

### Named Rules
**The Medallion-or-Deckle Rule.** A circle is only ever a seal-echo (the logo, a tier mark, the WhatsApp chip); a rectangle is only ever sharp or deckle-edged. No other rounding exists in the system.
**The Deckle-Retires-In-Operate Rule.** Deckle edges and grain texture belong to the Persuade
landing. In the admin, chrome and every data panel/table/card are **sharp rectangles with 1px
`warm-line` hairlines**. Deckle may appear at most once, on a single identity moment (e.g. a
login card), and never on a table, list row, or data container.

## Components

### Buttons
- **Shape:** sharp rectangle, no radius.
- **Primary:** gold fill (`#C7A24B`), ink text, `shadow-emboss`; hover → `#E6C978` fill with a 1px lift; label always uppercase, letter-spacing 0.28em.
- **Outline:** transparent fill, 1px gold/70 border, gold text; hover fills solid gold with ink text (mirrors Primary's hover state).
- **Ghost:** no border or fill — an underlined text link (gold underline at 40% opacity, brightening on hover) for the lowest-emphasis action per section.

### Cards / Containers (DeckleCard)
- **Corner Style:** deckle (torn-paper) `clip-path`, never a border-radius.
- **Background:** `cream` tone = `warm-panel` with a soft shadow; `plain` tone = `warm-white` with a 1px `warm-line` ring.
- **Texture:** a 5%-opacity SVG fractal-noise overlay (`.grain`) reads as card-stock fiber; kept far below a decorative threshold.
- **Shadow Strategy:** none by default; only the featured membership tier adds `shadow-card-lift`.

### Inputs / Fields (reservation form)
- **Style:** no border box — a single 1px `ink/20` bottom rule, transparent background, sitting directly on the cream card.
- **Focus:** the bottom rule shifts to `gold-shadow`.
- **Error:** the rule shifts to a muted red; an inline message appears below in the same red, naming the problem in plain language ("Please share a valid phone number").
- **States implemented:** idle, submitting ("Sending…", disabled), success (form replaced by a confirmation message), validation error (per-field).

### Navigation (landing Header)
- Transparent over the hero; solidifies to `warm-white/95` with a 1px gold-tinted bottom line once scrolled past the hero.
- Links: Inter, 0.68rem, uppercase, letter-spacing 0.28em, ink-muted → gold-shadow on hover.
- Mobile: hamburger morphs into an X; drawer opens as a full-width warm panel below the header bar.

### Seal (signature component)
The salon's real logo, rendered at four fixed sizes (sm/md/lg/xl), always ringed in `gold/40` and carrying `shadow-seal`. In the hero only, it plays a single `stamp` entrance animation (scale down from 1.22 with a slight rotate, cubic-bezier ease-out, ~1.1s) — the page's one authored motion moment. Elsewhere (landing nav/footer, admin sidebar) it is static.

### Admin Sidebar (Operate)
- `warm-panel` rail, 1px `warm-line` right border, no radius, no deckle. Seal + "Solminde Studio" wordmark (Bodoni) at top.
- **Nav item:** Inter `text-ui`, Lucide thin-line icon + label. Default = ink-muted; hover = ink on a faint `warm-line/40` wash; **active** = ink label + `gold-shadow` icon (the accessible foil register — literal `gold` #C7A24B fails contrast on the panel) + a 2px `gold` left-edge marker, `aria-current="page"`.
- **Collapse:** labels hide → icon-only rail at `lg`; becomes an off-canvas drawer (scrim + focus trap, Esc to close) below `md`.

### Admin Topbar (Operate)
- Sticky, `warm-white`, 1px `warm-line` bottom rule. Holds global search (idle/focus states), a primary "+ New Invoice" gold button, and the signed-in staff chip (name + role, Inter).

### Data Table & Status Chip (Operate)
- **Table:** sharp, `warm-line` row rules, `text-ui`/`text-ui-sm` data, tabular-nums for money; header row in `text-meta` uppercase ink-muted. No zebra fill; hover tints the row `warm-panel/60`.
- **Status chip:** small sharp rectangle, `{state}.soft` background + `{state}` text (e.g. Success/Warning/Danger/Info). Meaning by color + label, never color alone.

### Section Placeholder (Operate, this pass)
Honest empty state for not-yet-built sections: a Lucide icon, the section name in `ui-title` (Bodoni), a one-line description of what will live there, and a `text-meta` "Coming soon" tag. Sits on `warm-white`, centered, no fabricated data.

## Do's and Don'ts

### Do:
- **Do** treat gold as a foil line, ring, or fill on a single element — never a gradient, never a wash across a whole surface.
- **Do** use the real logo file as the seal everywhere a mark is needed; never redraw or approximate it.
- **Do** give cream panels a deckle edge and grain texture instead of a border-radius — **on the landing only**.
- **Do** keep Bodoni Moda reserved for words the surface is "saying" (landing headlines/tier names; in the admin, the page title only); everything functional stays in Inter.
- **Do** show an honest empty state rather than inventing photography, quotes, customers, or money figures.
- **Do** use the fixed-rem UI scale and semantic state colors in the admin; give every interactive element its full state set (hover/focus/active/disabled/loading/error).

### Don't:
- **Don't** use border-radius on any surface except the seal.
- **Don't** put deckle edges or grain texture on admin chrome, tables, or data panels (landing device only).
- **Don't** use fluid `clamp` display type inside the admin, or Bodoni on admin labels/data/buttons.
- **Don't** build a section as same-size icon-plus-heading-plus-text cards; the landing's list/clause/ticket vocabulary replaces that pattern.
- **Don't** invent prices, durations, testimonials, or business details; render them as explicitly labelled placeholders until the salon supplies real values.
- **Don't** introduce a second decorative accent hue; the brand is gold-on-warm and ink-on-paper. Semantic state colors are functional and admin-only.

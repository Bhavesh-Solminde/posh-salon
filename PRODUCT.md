# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary operator — Front-desk Cashier.** Uses the staff-only Admin Dashboard during
  business hours to register walk-in customers, bill services and products, create and
  redeem memberships, and record daily operations. Needs speed and accuracy under
  in-person, at-the-counter pressure.
- **Manager / Admin.** Broader access: reporting, staff/attendance, pricing, website
  content, settings, and audit oversight (RBAC: Admin / Manager / Cashier).
- **Prospective clients (public website visitors).** Discover services and are driven to
  enquire or book via Call, WhatsApp, or a contact form. They do **not** log in — booking
  and all records are staff-managed.

## Product Purpose

A two-part system for a single premium salon:

1. **Public landing website** that presents the salon and its services and converts
   visitors into salon visits through Call / WhatsApp / Book-Appointment / contact form.
2. **Staff-only Admin Dashboard** that runs day-to-day operations: customer registration,
   service + product billing, a wallet-based membership program, inventory, employee and
   attendance tracking, and financial reporting.

**Success:** the front desk can register a walk-in, bill services + products, and
issue/redeem a membership quickly and accurately, while the website turns visitors into
booked visits.

## Positioning

Confirmed differentiators (the site's core promise, in priority order):

1. **Signature specialist treatments** — Hydra Facial, Korean Facial, HD & Bridal makeup.
2. **Wallet membership value** — paid balance is redeemable **only against services** at a
   premium rate (e.g. pay ₹5,000 → ₹7,000 of service value), tracked as an auditable
   ledger. This services-only wallet is the operationally distinctive mechanism.
3. **Luxury experience** — premium ambience and end-to-end pampering.

(Not claimed as the lead differentiator: "master stylists" — omitted per user selection.)

## Operating Context

- **Single physical branch**, front-desk POS usage during business hours (multi-branch
  deferred but the data model is branch-ready).
- **Walk-in-first flow:** customer arrives → cashier registers (name + phone) → adds
  services/products → invoice → optional membership (system generates membership number +
  QR + card, sent **manually** via WhatsApp) → on return visits, cashier searches by
  phone / QR / membership ID → redeems wallet against services.
- **No WhatsApp Business API** — staff send membership cards, receipts, and invoices
  manually. The system only *generates* those artifacts.
- **Region:** GST + UPI indicate India → currency INR, timezone Asia/Kolkata assumed.
  *(Inferred — to confirm.)*
- **Business identity** (city, address, phone, hours) **not yet provided.** Operating salon,
  details to follow — use clearly-marked placeholders; do not fabricate.

## Capabilities and Constraints

**Confirmed MVP scope:**
- Customer management (name + phone mandatory, phone = unique lookup key; rest optional).
- **Membership = wallet/ledger** (Silver / Gold / Platinum / Custom); every credit/debit is
  an immutable transaction; **redeemable against services only, never products.**
- Appointments: walk-in + future, manual booking (online booking later).
- Invoicing with services **and** products on one bill; typed line items
  (`SERVICE | PRODUCT | MEMBERSHIP-TOPUP`).
- Payments: cash / UPI / card / mixed / partial.
- **Inventory** with a stock-movement ledger: `PURCHASE` (supplier restock → expense),
  `SALE`, `CONSUMPTION` (in-salon use, auto-deducts on the linked service), `ADJUSTMENT`.
- **Services CRUD** (single source of truth for both the billing picker and public pages).
- **Employees + attendance tracking only — no salary / payroll / commission.**
- **Unified financial ledger** (income + expense) with a Billing tab and Billing History;
  income = memberships, product sales, service sales; expense = supplier purchases + misc.
- Dashboard + reports (PDF / Excel), CMS for landing content.
- RBAC (Admin / Manager / Cashier), audit logs, soft-delete, all money mutations
  transactional.

**Constraints:** staff-only authentication (no customer login); manual notifications.

**Explicitly undecided product facts (do not invent):** exact service catalog, durations,
and prices; membership plan values (price / validity / bonus / discount % / free services);
GST registration + rate; invoice-number format; cancellation and discount policies;
attendance-marking style; business location and hours.

## Brand Commitments

- **Name:** Solminde Studio. **Logo:** `public/solminde-seal.png` — a terracotta script
  "S" monogram on a flat cream field, cropped into the site's circular seal treatment.
  This is a rebrand of the original Posh Salon build (see below) — the client's identity
  was fully replaced for use as a portfolio demo; the layout, palette direction, and
  product decisions below carry over unchanged.
- User-stated binding direction (recorded, not expanded here — the visual world is decided
  in later design work): **Black, Gold, Cream**; luxury / premium / minimal / elegant /
  modern; Dior / Chanel / Apple-level simplicity; **avoid colorful gradients.**

## Evidence on Hand

- **Available:** the Solminde Studio **seal** at `public/solminde-seal.png`.
- **Not yet available — must NOT be fabricated:** professional photography, real customer
  testimonials/reviews, the final service catalog with prices, real business
  address/phone/hours, and GST details. Until the salon supplies these, use clearly-marked
  placeholders.

## Product Principles

1. **Front-desk speed and accuracy first.** The cashier's core loop (register → bill →
   membership → redeem) must be fast and error-proof.
2. **Money is ledgered, never overwritten.** Membership wallet, stock, and finances are
   append-only transaction logs for full auditability.
3. **Services-only membership value.** Wallet redemption applies to services, never
   products — an inviolable rule.
4. **Staff-operated, not self-service.** Customers never log in; the system is optimized for
   trained staff, not public account management.
5. **Truthful content.** Never fabricate testimonials, prices, photos, or business facts;
   use clearly-marked placeholders until the salon supplies real assets.

## Accessibility & Inclusion

Public site targets WCAG 2.1 AA (contrast, keyboard, focus, alt text); English-only at
launch. No further product-specific requirement established.

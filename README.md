# Posh Salon

The public landing website for Posh Salon, a premium hair, skin & makeup atelier.
Built with Next.js 15, TypeScript, and Tailwind CSS. See [PRODUCT.md](./PRODUCT.md)
for product context and [DESIGN.md](./DESIGN.md) for the visual design system.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

## Notes

- Business details (address, phone, hours, Google Maps and social profiles) are
  confirmed and live in [`src/lib/business.ts`](./src/lib/business.ts). Staff can
  override the contact fields at `/admin/settings`; whatever they save wins, and
  anything they leave blank falls back to that file. Edit it to change what the
  landing page publishes.
- Final service pricing is still unconfirmed, so services render "terms by
  consultation" rather than a figure. Marketing copy for membership tiers lives in
  `src/data/membership.ts`.

## Deploy

Deploy on [Vercel](https://vercel.com/docs/deployments) or any Next.js-compatible host.
# posh-salon
# posh-salon

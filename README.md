# Solminde Studio — demo

A portfolio demo built from a real client project: a salon's public landing website plus
a full staff admin (billing, memberships, invoices, reporting). Rebranded from the
original client build for demonstration purposes. Built with Next.js 15, TypeScript,
Prisma/Postgres, and Tailwind CSS. See [PRODUCT.md](./PRODUCT.md) for product context and
[DESIGN.md](./DESIGN.md) for the visual design system.

## Getting Started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL / DIRECT_URL and NEXT_PUBLIC_SITE_URL
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

Staff sign-in at `/admin/login` — seeded demo accounts: `admin@solminde.studio`,
`manager@solminde.studio`, `cashier@solminde.studio`, all with password `demo1234`.

## Notes

- This is a demo deployment — expect a slow first load on free-tier hosting with a
  cold-start database. A dismissible notice on the site says as much; a client's actual
  build would not be built or hosted this way.
- Business details (address, phone, hours) and service pricing are left as clearly
  labelled placeholders throughout the site, matching the original client engagement's
  rule against fabricating business facts. Update them from **Admin → Settings** once
  real values exist.
- `NEXT_PUBLIC_SITE_URL` drives canonical URLs, the sitemap, robots, OpenGraph tags, auth
  trusted origins, and the membership QR codes — set it to wherever this is hosted.

## Deploy

Deploy on [Vercel](https://vercel.com/docs/deployments) or any Next.js-compatible host.
# Solminde-Studio

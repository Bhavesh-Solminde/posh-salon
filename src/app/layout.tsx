import type { Metadata } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";
import "./globals.css";
import { DemoNotice, demoNoticeNoFlashScript } from "@/components/DemoNotice";
import { BRAND_NAME, BRAND_SEAL, SITE_URL } from "@/lib/brand";

const bodoniModa = Bodoni_Moda({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const TITLE = `${BRAND_NAME} — Premier Hair, Skin & Makeup Atelier`;
const DESCRIPTION =
  `${BRAND_NAME} is a premium hair, skin & makeup atelier. Signature facials, bridal and HD makeup, hair artistry, and a services-only membership wallet — an experience extended, not sold.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: SITE_URL,
    siteName: BRAND_NAME,
    images: [{ url: BRAND_SEAL }],
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
    images: [BRAND_SEAL],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodoniModa.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Collapses the demo bar's reserved height before first paint so a
            visitor who already dismissed it never sees it flash back in. */}
        <script dangerouslySetInnerHTML={{ __html: demoNoticeNoFlashScript }} />
      </head>
      <body className="bg-warm-white font-body text-ink antialiased">
        <DemoNotice />
        {children}
      </body>
    </html>
  );
}

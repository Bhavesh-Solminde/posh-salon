import type { Metadata } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";
import "./globals.css";

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

const SITE_URL = "https://www.poshsalon.co.in";
const TITLE = "Posh Salon — Premier Hair, Skin & Makeup Atelier";
const DESCRIPTION =
  "Posh Salon is a premium hair, skin & makeup atelier. Signature facials, bridal and HD makeup, hair artistry, and a services-only membership wallet — an experience extended, not sold.";

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
    siteName: "Posh Salon",
    images: [{ url: "/posh-salon-seal.png" }],
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/posh-salon-seal.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodoniModa.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="bg-warm-white font-body text-ink antialiased">
        {children}
      </body>
    </html>
  );
}

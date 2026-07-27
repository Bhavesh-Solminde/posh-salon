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

export const metadata: Metadata = {
  title: "Posh Salon — Premier Hair, Skin & Makeup Atelier",
  description:
    "Posh Salon is a premium hair, skin & makeup atelier. Signature treatments, a services-only membership wallet, and an experience extended, not sold.",
  openGraph: {
    title: "Posh Salon — Premier Hair, Skin & Makeup Atelier",
    description:
      "Signature treatments, a services-only membership wallet, and a luxury salon experience.",
    type: "website",
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

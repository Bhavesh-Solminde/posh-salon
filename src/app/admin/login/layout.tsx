import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff Sign In · Posh Salon",
  // Staff-only tool — keep it out of search indexes.
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

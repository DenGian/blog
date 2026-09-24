import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "Software Engineering Stagejournaal",
    template: "%s | Stagejournaal",
  },
  description:
    "Ian Mondelaers blikt terug op vijftien weken software engineering bij HolonCom in 2025.",
  applicationName: "Stagejournaal",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    type: "website",
    locale: "nl_BE",
    siteName: "Software Engineering Stagejournaal",
  },
  robots: { index: true, follow: true },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}

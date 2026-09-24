import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "Blog van Ian Mondelaers",
    template: "%s | Blog van Ian Mondelaers",
  },
  description:
    "Ian Mondelaers schrijft over vijftien weken als software engineer bij HolonCom in 2025.",
  applicationName: "Blog van Ian Mondelaers",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    type: "website",
    locale: "nl_BE",
    siteName: "Blog van Ian Mondelaers",
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

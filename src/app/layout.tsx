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
    "Een openbaar journaal over vijftien weken werkplekleren en professionele groei in software engineering.",
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

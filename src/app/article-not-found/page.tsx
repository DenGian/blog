import type { Metadata } from "next";
import NotFound from "@/app/not-found";

export const metadata: Metadata = {
  title: "Artikel niet gevonden",
  robots: { index: false, follow: false },
};

export default NotFound;

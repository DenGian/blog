import type { Metadata } from "next";
import { NotFoundContent } from "@/components/site/NotFoundContent";

export const metadata: Metadata = {
  title: "Blogpost niet gevonden",
  robots: { index: false, follow: false },
};

export default NotFoundContent;

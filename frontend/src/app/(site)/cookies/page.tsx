import type { Metadata } from "next";
import { LegalPageContent } from "@/components/legal/LegalPageContent";

export const metadata: Metadata = {
  title: "Cookie Policy — ONHOUSE",
  description: "Which cookies and local storage the ONHOUSE website uses.",
};

export default function CookiePolicyPage() {
  return <LegalPageContent doc="cookies" />;
}

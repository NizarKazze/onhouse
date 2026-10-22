import type { Metadata } from "next";
import { LegalPageContent } from "@/components/legal/LegalPageContent";

export const metadata: Metadata = {
  title: "Legal Notice — ONHOUSE",
  description: "Owner details and terms of use of the ONHOUSE website.",
};

export default function LegalNoticePage() {
  return <LegalPageContent doc="notice" />;
}

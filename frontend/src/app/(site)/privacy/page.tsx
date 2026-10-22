import type { Metadata } from "next";
import { LegalPageContent } from "@/components/legal/LegalPageContent";

export const metadata: Metadata = {
  title: "Privacy Policy — ONHOUSE",
  description: "How ONHOUSE handles personal data.",
};

export default function PrivacyPolicyPage() {
  return <LegalPageContent doc="privacy" />;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — ONHOUSE",
  robots: { index: false, follow: false },
};

/** The admin has its own chrome: none of the public header, footer or grain. */
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <main className="min-h-screen bg-onh-black text-onh-bone">{children}</main>;
}

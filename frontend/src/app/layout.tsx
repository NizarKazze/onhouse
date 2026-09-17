import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Jost } from "next/font/google";
import "./globals.css";
import { GrainOverlay } from "@/components/layout/GrainOverlay";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LanguageProvider } from "@/i18n/LanguageProvider";

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-jost",
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ONHOUSE — The music commands the night.",
  description:
    "ONHOUSE is a house music and club culture project in Ibiza. House, deep house and tech house, played long enough to take the room somewhere.",
  metadataBase: new URL("https://www.onhouse.es"),
  openGraph: {
    title: "ONHOUSE — The music commands the night.",
    description:
      "House, deep house and tech house in Ibiza. Long sets, deep sounds, intimate atmospheres.",
    siteName: "ONHOUSE",
    locale: "en",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jost.variable} ${bebas.variable}`}>
      <body>
        <LanguageProvider>
          <SiteHeader />
          <main id="top" className="block">
            {children}
          </main>
          <SiteFooter />
          <GrainOverlay />
        </LanguageProvider>
      </body>
    </html>
  );
}

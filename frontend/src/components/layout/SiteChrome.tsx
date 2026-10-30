import { GrainOverlay } from "@/components/layout/GrainOverlay";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { RadioMiniPlayer } from "@/components/radio/RadioMiniPlayer";
import { RadioProvider } from "@/components/radio/RadioProvider";

/** Header, footer, grain and the radio player around every public page (not /admin). */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <RadioProvider>
      <SiteHeader />
      <main id="top" className="block">
        {children}
      </main>
      <SiteFooter />
      <RadioMiniPlayer />
      <GrainOverlay />
    </RadioProvider>
  );
}

import { GrainOverlay } from "@/components/layout/GrainOverlay";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

/** Header, footer and grain around every public page (not /admin). */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="top" className="block">
        {children}
      </main>
      <SiteFooter />
      <GrainOverlay />
    </>
  );
}

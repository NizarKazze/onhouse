"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { scrollToHash } from "@/lib/hooks";

type SectionLinkProps = {
  /** Either a route ("/events") or a home-page section ("/#about"). */
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Called after the link is activated — used to close the mobile menu. */
  onNavigate?: () => void;
};

/**
 * Navigates to a route, or scrolls to a home-page section.
 *
 * When the target section is on the page already, this scrolls with the fixed
 * header's height subtracted, exactly as the design does. Otherwise it is an
 * ordinary route change and `HashScroll` finishes the job on arrival.
 */
export function SectionLink({
  href,
  children,
  className,
  style,
  onNavigate,
}: SectionLinkProps) {
  const pathname = usePathname();
  const hash = href.startsWith("/#") ? href.slice(1) : null;

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.();

    if (pathname !== "/") return;

    if (hash) {
      event.preventDefault();
      scrollToHash(hash);
      // Keep the URL in step without adding a history entry per click.
      window.history.replaceState(null, "", href);
      return;
    }

    if (href === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.replaceState(null, "", "/");
    }
  };

  return (
    <Link href={href} className={className} style={style} onClick={handleClick}>
      {children}
    </Link>
  );
}

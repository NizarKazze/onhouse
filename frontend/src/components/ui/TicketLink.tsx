import { SectionLink } from "@/components/layout/SectionLink";

/**
 * The GET TICKETS button for an event: the external ticketing page when the
 * event has one, otherwise the contact section as before.
 */
export function TicketLink({
  href,
  className,
  children,
}: {
  href: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <SectionLink href="/#contact" className={className}>
      {children}
    </SectionLink>
  );
}

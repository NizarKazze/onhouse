import type { Metadata } from "next";
import { EventsPageContent } from "@/components/events/EventsPageContent";
import {
  fetchNextEvent,
  fetchPastEvents,
  fetchActiveEvents,
} from "@/lib/events";

export const metadata: Metadata = {
  title: "Events — ONHOUSE",
  description:
    "An editorial record of ONHOUSE nights. Upcoming dates first, then the archive.",
};

/**
 * The grid hides events whose end time has passed. The page is prerendered,
 * so regenerate it hourly for expired events to drop out without a deploy.
 */
export const revalidate = 3600;

export default async function EventsPage() {
  const [nextEvent, active, past] = await Promise.all([
    fetchNextEvent(),
    fetchActiveEvents(),
    fetchPastEvents(),
  ]);

  // The headline event keeps its own feature block, so never repeat it below.
  const upcoming = nextEvent
    ? active.filter((event) => event.id !== nextEvent.id)
    : active;

  return (
    <EventsPageContent nextEvent={nextEvent} upcoming={upcoming} past={past} />
  );
}

import type { Metadata } from "next";
import { EventsPageContent } from "@/components/events/EventsPageContent";
import {
  fetchNextEvent,
  fetchPastEvents,
  fetchUpcomingEvents,
} from "@/lib/events";

export const metadata: Metadata = {
  title: "Events — ONHOUSE",
  description:
    "An editorial record of ONHOUSE nights. Upcoming dates first, then the archive.",
};

export default async function EventsPage() {
  const [nextEvent, upcoming, past] = await Promise.all([
    fetchNextEvent(),
    fetchUpcomingEvents(),
    fetchPastEvents(),
  ]);

  return (
    <EventsPageContent nextEvent={nextEvent} upcoming={upcoming} past={past} />
  );
}

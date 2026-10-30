import { HashScroll } from "@/components/layout/HashScroll";
import { About } from "@/components/home/About";
import { ArtistsPreview } from "@/components/home/ArtistsPreview";
import { ClubCulture } from "@/components/home/ClubCulture";
import { Contact } from "@/components/home/Contact";
import { EventDeck } from "@/components/home/EventDeck";
import { Experience } from "@/components/home/Experience";
import { Hero } from "@/components/home/Hero";
import { IbizaAfterDark } from "@/components/home/IbizaAfterDark";
import { NextEvent } from "@/components/home/NextEvent";
import { Radio } from "@/components/home/Radio";
import { Sound } from "@/components/home/Sound";
import { fetchArtistsPreview } from "@/lib/artists";
import { fetchNextEvent, fetchUpcomingEvents } from "@/lib/events";

export default async function HomePage() {
  const [nextEvent, upcoming, artists] = await Promise.all([
    fetchNextEvent(),
    fetchUpcomingEvents(),
    fetchArtistsPreview(3),
  ]);

  return (
    <>
      <HashScroll />
      <Hero />
      <NextEvent event={nextEvent} />
      <EventDeck events={upcoming} />
      <About />
      <Sound />
      <ClubCulture />
      <Experience />
      <ArtistsPreview artists={artists} />
      <IbizaAfterDark />
      <Radio />
      <Contact />
    </>
  );
}

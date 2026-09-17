import type { Metadata } from "next";
import { ArtistsPageContent } from "@/components/artists/ArtistsPageContent";
import { fetchArtists } from "@/lib/artists";

export const metadata: Metadata = {
  title: "Artists — ONHOUSE",
  description:
    "Residents and guests. Line-ups are announced here before anywhere else.",
};

export default async function ArtistsPage() {
  const artists = await fetchArtists();

  return <ArtistsPageContent artists={artists} />;
}

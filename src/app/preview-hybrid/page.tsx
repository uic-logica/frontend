import { HomeContent } from "@/app/_previewHome/HomeContent";

/** Hybrid: plain ink cards, torn edge reserved for the two CTA panels. */
export default function PreviewHybrid() {
  return <HomeContent cardVariant="ink" ctaVariant="torn" />;
}

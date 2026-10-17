import { createFileRoute } from "@tanstack/react-router";
import { TripsPage } from "@/features/penny/trips";
export const Route = createFileRoute("/packing")({
  head: () => ({
    meta: [
      { title: "Packing Checklist · Penny2Passport" },
      {
        name: "description",
        content: "Prepare a personalized packing list for your saved adventures.",
      },
      { property: "og:title", content: "Packing Checklist · Penny2Passport" },
      {
        property: "og:description",
        content: "Prepare a personalized packing list for your saved adventures.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <TripsPage packingOnly />,
});

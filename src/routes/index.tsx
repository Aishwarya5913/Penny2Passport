import { createFileRoute } from "@tanstack/react-router";
import { Overview } from "@/features/penny/overview";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview · Penny2Passport" },
      {
        name: "description",
        content: "Your student savings and next affordable adventure, together in one place.",
      },
      { property: "og:title", content: "Overview · Penny2Passport" },
      {
        property: "og:description",
        content: "Your student savings and next affordable adventure, together in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <Overview />,
});

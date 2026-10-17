import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/features/penny/profile";
export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Settings · Penny2Passport" },
      {
        name: "description",
        content: "Personalize your starting city, savings and packing preferences.",
      },
      { property: "og:title", content: "Profile & Settings · Penny2Passport" },
      {
        property: "og:description",
        content: "Personalize your starting city, savings and packing preferences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ProfilePage />,
});

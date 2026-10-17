import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/features/penny/profile";
export const Route = createFileRoute("/savings")({
  head: () => ({
    meta: [
      { title: "Savings Vault · Penny2Passport" },
      {
        name: "description",
        content: "Protect emergency savings and essential bills before planning your adventure.",
      },
      { property: "og:title", content: "Savings Vault · Penny2Passport" },
      {
        property: "og:description",
        content: "Protect emergency savings and essential bills before planning your adventure.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ProfilePage savings />,
});

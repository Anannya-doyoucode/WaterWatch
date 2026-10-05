import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Empty } from "@/components/ww/primitives";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({
    meta: [
      { title: "Settings — WaterWatch" },
      { name: "description", content: "WaterWatch Settings for your home." },
      { property: "og:title", content: "Settings — WaterWatch" },
      { property: "og:description", content: "WaterWatch Settings for your home." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Settings" />
      <Empty title="This section is still being built" desc="It will be completed in the next update." />
    </>
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Empty } from "@/components/ww/primitives";

export const Route = createFileRoute("/_shell/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — WaterWatch" },
      { name: "description", content: "WaterWatch Analytics for your home." },
      { property: "og:title", content: "Analytics — WaterWatch" },
      { property: "og:description", content: "WaterWatch Analytics for your home." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Analytics" />
      <Empty title="This section is still being built" desc="It will be completed in the next update." />
    </>
  ),
});

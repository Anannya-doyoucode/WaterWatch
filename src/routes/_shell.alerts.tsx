import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Empty } from "@/components/ww/primitives";

export const Route = createFileRoute("/_shell/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — WaterWatch" },
      { name: "description", content: "WaterWatch Alerts for your home." },
      { property: "og:title", content: "Alerts — WaterWatch" },
      { property: "og:description", content: "WaterWatch Alerts for your home." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Alerts" />
      <Empty title="This section is still being built" desc="It will be completed in the next update." />
    </>
  ),
});

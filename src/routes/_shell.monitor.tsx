import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Empty } from "@/components/ww/primitives";

export const Route = createFileRoute("/_shell/monitor")({
  head: () => ({
    meta: [
      { title: "Monitor — WaterWatch" },
      { name: "description", content: "WaterWatch Monitor for your home." },
      { property: "og:title", content: "Monitor — WaterWatch" },
      { property: "og:description", content: "WaterWatch Monitor for your home." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Monitor" />
      <Empty title="This section is still being built" desc="It will be completed in the next update." />
    </>
  ),
});

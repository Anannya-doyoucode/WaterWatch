import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Empty } from "@/components/ww/primitives";

export const Route = createFileRoute("/_shell/devices")({
  head: () => ({
    meta: [
      { title: "Devices — WaterWatch" },
      { name: "description", content: "WaterWatch Devices for your home." },
      { property: "og:title", content: "Devices — WaterWatch" },
      { property: "og:description", content: "WaterWatch Devices for your home." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Devices" />
      <Empty title="This section is still being built" desc="It will be completed in the next update." />
    </>
  ),
});

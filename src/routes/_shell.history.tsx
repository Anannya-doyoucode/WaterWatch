import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Empty } from "@/components/ww/primitives";

export const Route = createFileRoute("/_shell/history")({
  head: () => ({
    meta: [
      { title: "History — WaterWatch" },
      { name: "description", content: "WaterWatch History for your home." },
      { property: "og:title", content: "History — WaterWatch" },
      { property: "og:description", content: "WaterWatch History for your home." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="History" />
      <Empty title="This section is still being built" desc="It will be completed in the next update." />
    </>
  ),
});

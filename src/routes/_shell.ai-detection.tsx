import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Empty } from "@/components/ww/primitives";

export const Route = createFileRoute("/_shell/ai-detection")({
  head: () => ({
    meta: [
      { title: "AI Detection — WaterWatch" },
      { name: "description", content: "WaterWatch AI Detection for your home." },
      { property: "og:title", content: "AI Detection — WaterWatch" },
      { property: "og:description", content: "WaterWatch AI Detection for your home." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="AI Detection" />
      <Empty title="This section is still being built" desc="It will be completed in the next update." />
    </>
  ),
});

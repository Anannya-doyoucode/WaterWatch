import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Empty } from "@/components/ww/primitives";

export const Route = createFileRoute("/_shell/home")({
  head: () => ({
    meta: [
      { title: "My Home — WaterWatch" },
      { name: "description", content: "WaterWatch My Home for your home." },
      { property: "og:title", content: "My Home — WaterWatch" },
      { property: "og:description", content: "WaterWatch My Home for your home." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="My Home" />
      <Empty title="This section is still being built" desc="It will be completed in the next update." />
    </>
  ),
});

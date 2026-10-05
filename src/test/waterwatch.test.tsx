import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { defaultOutlets, issueIsOpen } from "@/lib/store";

describe("WaterWatch Core Architecture", () => {
  it("has 12 default outlets matching household configuration", () => {
    const outlets = defaultOutlets();
    const totalCount = outlets.reduce((sum, o) => sum + o.qty, 0);
    expect(totalCount).toBe(12);

    const kitchenTaps = outlets.filter((o) => o.type === "Kitchen tap").reduce((s, o) => s + o.qty, 0);
    const bathroomTaps = outlets.filter((o) => o.type === "Bathroom tap").reduce((s, o) => s + o.qty, 0);
    const showers = outlets.filter((o) => o.type === "Shower").reduce((s, o) => s + o.qty, 0);
    const toilets = outlets.filter((o) => o.type === "Toilet").reduce((s, o) => s + o.qty, 0);
    const washingMachines = outlets.filter((o) => o.type === "Washing machine").reduce((s, o) => s + o.qty, 0);
    const others = outlets.filter((o) => o.type === "Other").reduce((s, o) => s + o.qty, 0);

    expect(kitchenTaps).toBe(2);
    expect(bathroomTaps).toBe(3);
    expect(showers).toBe(2);
    expect(toilets).toBe(3);
    expect(washingMachines).toBe(1);
    expect(others).toBe(1);
  });

  it("evaluates issue open status correctly", () => {
    expect(issueIsOpen("active")).toBe(true);
    expect(issueIsOpen("monitoring")).toBe(true);
    expect(issueIsOpen("plumber")).toBe(true);
    expect(issueIsOpen("municipal")).toBe(true);
    expect(issueIsOpen("resolved")).toBe(false);
    expect(issueIsOpen("dismissed")).toBe(false);
  });

  it("registers all required application routes in router", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const routesToTest = [
      "/dashboard",
      "/monitor",
      "/analytics",
      "/ai-detection",
      "/alerts",
      "/history",
      "/home",
      "/devices",
      "/settings",
    ];

    for (const route of routesToTest) {
      const match = router.matchRoutes(route);
      expect(match.length).toBeGreaterThan(0);
      expect(match.at(-1)?.routeId).toContain(route.replace("/", ""));
    }
  });
});

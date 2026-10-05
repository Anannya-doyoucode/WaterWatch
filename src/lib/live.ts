import { useEffect, useState } from "react";
import { useStore, issueIsOpen, LEAK_OUTLET_ID, type Outlet } from "./store";

export type FlowState = "Active" | "Idle" | "Low flow" | "Continuous flow" | "Unusual flow" | "No signal";
export interface LiveOutlet extends Outlet { flow: number; state: FlowState; lastActive: string; deviceName: string | null }

const BASE: Record<string, [number, FlowState, string]> = {
  kitchen: [3.1, "Active", "Now"], bath2: [0, "Idle", "42 min ago"], showers: [0, "Idle", "1 h ago"],
  toilets: [0.4, "Low flow", "3 min ago"], wm: [2.1, "Active", "Now"], garden: [0, "Idle", "Yesterday"],
};

/** Simulated live flow, refreshed every few seconds. */
export function useLiveFlow() {
  const { state } = useStore();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 2500);
    return () => clearInterval(t);
  }, []);
  const open = issueIsOpen(state.issue.status) && state.issue.status !== "monitoring";
  const outlets: LiveOutlet[] = state.outlets.map((o, i) => {
    const dev = state.devices.find((d) => d.outletId === o.id) ?? null;
    let [flow, st, last] = BASE[o.id] ?? [0, "Idle", "Today"] as [number, FlowState, string];
    if (o.id === LEAK_OUTLET_ID) {
      [flow, st, last] = open ? [0.6, "Continuous flow", "Now"] : [0, "Idle", "18 min ago"];
    }
    if (dev && dev.status === "offline") { flow = 0; st = "No signal"; last = "Sensor offline"; }
    const j = flow > 0 ? 1 + Math.sin(tick * 1.7 + i) * 0.05 : 1;
    return { ...o, flow: Math.round(flow * j * 10) / 10, state: st, lastActive: last, deviceName: dev?.name ?? null };
  });
  const total = Math.round(outlets.reduce((n, o) => n + o.flow, 0) * 10) / 10;
  return { outlets, total, active: outlets.filter((o) => o.flow > 0).length };
}

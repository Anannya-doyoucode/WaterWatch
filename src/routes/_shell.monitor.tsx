import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Activity, Droplets, Layers, Zap, Clock, Cpu, ChevronRight, Waves, Radio, AlertTriangle } from "lucide-react";
import { useMetrics, useStore } from "@/lib/store";
import { useLiveFlow, type LiveOutlet, type FlowState } from "@/lib/live";
import { PageHeader, Panel, Metric, FlowBadge, Bar } from "@/components/ww/primitives";
import { FlowLine, TankVisual } from "@/components/ww/visuals";
import { ResponsiveModal } from "@/components/ww/ResponsiveModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/monitor")({
  head: () => ({
    meta: [
      { title: "Live Monitor — WaterWatch" },
      { name: "description", content: "Real-time household water flow, active outlets, live timeline and tank level." },
      { property: "og:title", content: "Live Monitor — WaterWatch" },
      { property: "og:description", content: "Real-time water telemetry for your home." },
    ],
  }),
  component: MonitorPage,
});

const TIMELINE_SAMPLES: Record<string, { time: string; event: string; volume: string; tone: "normal" | "warning" | "leak" }[]> = {
  kitchen: [
    { time: "Just now", event: "Tap running — meal prep", volume: "3.1 L/min", tone: "normal" },
    { time: "7:48 AM", event: "Dishwashing cycle", volume: "22 L consumed", tone: "normal" },
    { time: "6:30 AM", event: "Kettle fill & breakfast", volume: "3.5 L", tone: "normal" },
  ],
  bath1: [
    { time: "1:40 AM – 4:15 AM", event: "Continuous flow anomaly detected", volume: "86 L wasted", tone: "leak" },
    { time: "Yesterday 11:20 PM", event: "Nighttime handwash", volume: "1.8 L", tone: "normal" },
  ],
  bath2: [
    { time: "42 min ago", event: "Handwashing", volume: "2.1 L", tone: "normal" },
    { time: "7:15 AM", event: "Morning teeth brushing", volume: "4.2 L", tone: "normal" },
  ],
  showers: [
    { time: "1 h ago", event: "Morning shower (2 occupants)", volume: "38 L consumed", tone: "normal" },
    { time: "Yesterday 9:12 PM", event: "Evening warm shower", volume: "41 L", tone: "normal" },
  ],
  toilets: [
    { time: "3 min ago", event: "Cistern refilling", volume: "0.4 L/min (6 L total)", tone: "normal" },
    { time: "7:50 AM", event: "Cistern flush", volume: "6 L", tone: "normal" },
    { time: "6:15 AM", event: "Cistern flush", volume: "6 L", tone: "normal" },
  ],
  wm: [
    { time: "Just now", event: "Main rinse cycle in progress", volume: "2.1 L/min", tone: "normal" },
    { time: "8:10 AM", event: "Eco cycle fill", volume: "32 L", tone: "normal" },
  ],
  garden: [
    { time: "Yesterday 7:10 PM", event: "Drip irrigation scheduled", volume: "64 L consumed", tone: "warning" },
  ],
};

function MonitorPage() {
  const { state } = useStore();
  const m = useMetrics();
  const live = useLiveFlow();
  const [selectedOutlet, setSelectedOutlet] = useState<LiveOutlet | null>(null);
  const [filterState, setFilterState] = useState<string>("All");

  const outlets = live.outlets;
  const filteredOutlets = filterState === "All"
    ? outlets
    : outlets.filter((o) => o.state.toLowerCase() === filterState.toLowerCase());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Water Monitor"
        desc="Real-time telemetry streaming from your WaterWatch Hub and IoT flow sensors."
        actions={
          <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-75" />
              <span className="relative size-2 rounded-full bg-success" />
            </span>
            <span>Live Stream · Refreshes every 2.5s</span>
          </div>
        }
      />

      {/* Top Telemetry Summary */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="panel p-4">
          <Metric
            label="Live Total Flow"
            value={live.total}
            unit="L/min"
            icon={Activity}
            tone={live.total > 5 ? "warning" : "primary"}
            sub={
              <span className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-primary" />
                {live.active} active {live.active === 1 ? "outlet" : "outlets"}
              </span>
            }
          />
        </div>
        <div className="panel p-4">
          <Metric
            label="Tank Level"
            value={`${state.home.tankLevel}%`}
            unit={`${m.tankLiters} L`}
            icon={Layers}
            sub={`${state.home.tankCapacity - m.tankLiters} L remaining capacity`}
          />
        </div>
        <div className="panel p-4">
          <Metric
            label="Today's Consumption"
            value={m.today}
            unit="L"
            icon={Droplets}
            sub={<>vs <strong className="num text-foreground">{m.avgDaily} L</strong> daily avg</>}
          />
        </div>
        <div className="panel p-4">
          <Metric
            label="Active Outlets"
            value={`${live.active} / ${outlets.length}`}
            unit="flowing"
            icon={Zap}
            tone={live.active > 0 ? "info" : "neutral"}
            sub={m.open ? "1 abnormal continuous flow" : "Normal household usage"}
          />
        </div>
      </section>

      {/* Main Content: Outlets List & Live Activity Timeline */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Outlet by Outlet Telemetry */}
        <div className="space-y-4 lg:col-span-8">
          <Panel
            title={
              <div className="flex items-center justify-between gap-3">
                <span>Outlet-by-Outlet Flow</span>
                <span className="num text-xs font-semibold text-muted-foreground">
                  Total: {live.total} L/min
                </span>
              </div>
            }
            action={
              <div className="flex flex-wrap gap-1">
                {["All", "Active", "Idle", "Continuous flow"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterState(st)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                      filterState === st
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            }
          >
            <div className="space-y-3">
              {filteredOutlets.map((outlet) => {
                const isSelected = selectedOutlet?.id === outlet.id;
                const isContinuous = outlet.state === "Continuous flow";
                const isLow = outlet.state === "Low flow";
                const isActive = outlet.flow > 0;

                return (
                  <div
                    key={outlet.id}
                    onClick={() => setSelectedOutlet(outlet)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedOutlet(outlet)}
                    className={cn(
                      "group relative flex flex-col gap-3 rounded-xl border p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm cursor-pointer",
                      isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card",
                      isContinuous ? "border-critical/60 bg-critical-soft/20" : ""
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "grid size-10 place-items-center rounded-xl font-semibold",
                            isContinuous
                              ? "bg-critical-soft text-critical"
                              : isActive
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Droplets className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {outlet.name}
                            </span>
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                              {outlet.qty} {outlet.qty === 1 ? "unit" : "units"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {outlet.deviceName ? (
                              <span className="flex items-center gap-1">
                                <Cpu className="size-3" /> {outlet.deviceName}
                              </span>
                            ) : (
                              "Virtual / Unpaired sensor"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <FlowBadge state={outlet.state} />
                        <div className="text-right">
                          <div className="num text-base font-bold text-foreground">
                            {outlet.flow} <span className="text-xs font-normal text-muted-foreground">L/min</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Last: {outlet.lastActive}
                          </div>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>

                    {/* Pipe flow line & metrics progress */}
                    <div className="space-y-1.5 border-t pt-2.5">
                      <FlowLine flow={outlet.flow} alert={isContinuous} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Today: <strong className="num font-semibold text-foreground">{outlet.usage} L</strong></span>
                        <span>30-Day Avg: <strong className="num font-semibold text-foreground">{outlet.avg} L</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredOutlets.length === 0 && (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No outlets match the selected state "{filterState}".
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* Right: Tank & Live Activity Stream */}
        <div className="space-y-6 lg:col-span-4">
          {/* Tank Visualizer */}
          <Panel
            title="Tank Level"
            action={
              <Link to="/home" className="text-xs font-semibold text-primary hover:underline">
                Configure
              </Link>
            }
          >
            <TankVisual level={state.home.tankLevel} capacity={state.home.tankCapacity} />
            <div className="mt-4 rounded-xl bg-surface p-3 text-xs text-muted-foreground">
              <div className="flex justify-between font-semibold text-foreground">
                <span>Supply source</span>
                <span>{state.home.source}</span>
              </div>
              <p className="mt-1">
                Tank is currently at {state.home.tankLevel}% capacity ({m.tankLiters} L).
              </p>
            </div>
          </Panel>

          {/* Live Activity Timeline */}
          <Panel
            title={
              <div className="flex items-center gap-2">
                <Radio className="size-4 text-primary animate-pulse" />
                <span>Live Activity Timeline</span>
              </div>
            }
            action={
              <Link to="/history" className="text-xs font-semibold text-primary hover:underline">
                Full Log
              </Link>
            }
          >
            <ol className="relative space-y-4 border-l pl-4">
              <li className="relative">
                <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-primary ring-4 ring-card" />
                <p className="text-xs font-semibold text-foreground">Kitchen tap running</p>
                <p className="text-xs text-muted-foreground">Current flow: 3.1 L/min · Meal prep</p>
                <span className="num text-[10px] text-muted-foreground">Just now</span>
              </li>

              <li className="relative">
                <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-primary ring-4 ring-card" />
                <p className="text-xs font-semibold text-foreground">Washing Machine cycle active</p>
                <p className="text-xs text-muted-foreground">Flow rate: 2.1 L/min · Sensor synced</p>
                <span className="num text-[10px] text-muted-foreground">2 min ago</span>
              </li>

              <li className="relative">
                <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-warning ring-4 ring-card" />
                <p className="text-xs font-semibold text-foreground">Toilets Cistern refill completed</p>
                <p className="text-xs text-muted-foreground">0.4 L/min stopped · Normal flush</p>
                <span className="num text-[10px] text-muted-foreground">3 min ago</span>
              </li>

              {m.open && (
                <li className="relative">
                  <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-critical ring-4 ring-card" />
                  <p className="text-xs font-semibold text-critical">Continuous Bathroom 1 flow detected</p>
                  <p className="text-xs text-muted-foreground">Overnight anomaly · 86 L estimated loss</p>
                  <span className="num text-[10px] text-muted-foreground">4:15 AM</span>
                </li>
              )}

              <li className="relative">
                <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-success ring-4 ring-card" />
                <p className="text-xs font-semibold text-foreground">Morning Showers used</p>
                <p className="text-xs text-muted-foreground">38 L consumed across 9 minutes</p>
                <span className="num text-[10px] text-muted-foreground">7:12 AM</span>
              </li>
            </ol>
          </Panel>
        </div>
      </div>

      {/* Outlet Details Modal (Responsive: Centered on Desktop, Bottom Sheet on Mobile) */}
      <ResponsiveModal
        open={!!selectedOutlet}
        onOpenChange={(open) => !open && setSelectedOutlet(null)}
        title={
          selectedOutlet && (
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <Droplets className="size-5" />
              </span>
              <div>
                <span className="font-bold">{selectedOutlet.name}</span>
                <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-normal text-secondary-foreground">
                  {selectedOutlet.type}
                </span>
              </div>
            </div>
          )
        }
      >
        {selectedOutlet && (
          <div className="space-y-4 pt-2">
            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border bg-card p-3">
                <p className="text-xs text-muted-foreground">Current Flow</p>
                <p className="num mt-1 text-xl font-bold text-foreground">
                  {selectedOutlet.flow} <span className="text-xs font-normal">L/min</span>
                </p>
                <FlowBadge state={selectedOutlet.state} />
              </div>
              <div className="rounded-xl border bg-card p-3">
                <p className="text-xs text-muted-foreground">Today's Usage</p>
                <p className="num mt-1 text-xl font-bold text-foreground">
                  {selectedOutlet.usage} <span className="text-xs font-normal">L</span>
                </p>
                <p className="text-[11px] text-muted-foreground">Total today</p>
              </div>
              <div className="rounded-xl border bg-card p-3">
                <p className="text-xs text-muted-foreground">Daily Average</p>
                <p className="num mt-1 text-xl font-bold text-foreground">
                  {selectedOutlet.avg} <span className="text-xs font-normal">L</span>
                </p>
                <p className="text-[11px] text-muted-foreground">30-day baseline</p>
              </div>
              <div className="rounded-xl border bg-card p-3">
                <p className="text-xs text-muted-foreground">Last Active</p>
                <p className="mt-1 text-base font-bold text-foreground">
                  {selectedOutlet.lastActive}
                </p>
                <p className="text-[11px] text-muted-foreground">Recent telemetry</p>
              </div>
            </div>

            {/* Connected Device Card */}
            <div className="rounded-xl border bg-surface p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                  <Cpu className="size-4 text-primary" />
                  <span>Connected Device</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-success">
                  <span className="size-1.5 rounded-full bg-success" /> Online
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Device Name: </span>
                  <span className="font-semibold text-foreground">
                    {selectedOutlet.deviceName ?? "Virtual Metering"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Signal: </span>
                  <span className="font-semibold text-foreground">Strong (-62 dBm)</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Protocol: </span>
                  <span className="font-semibold text-foreground">Zigbee 3.0 via Hub</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Battery: </span>
                  <span className="font-semibold text-foreground">88% (Healthy)</span>
                </div>
              </div>
            </div>

            {/* Usage Timeline for Outlet */}
            <div className="rounded-xl border p-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                Usage Timeline & Recent Events
              </h4>
              <ul className="mt-3 divide-y text-xs">
                {(TIMELINE_SAMPLES[selectedOutlet.id] ?? [
                  { time: "Today", event: "Standard usage pulse recorded", volume: `${selectedOutlet.usage} L`, tone: "normal" }
                ]).map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between py-2">
                    <div>
                      <span className="font-semibold text-foreground">{item.event}</span>
                      <p className="text-muted-foreground">{item.time}</p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 font-medium",
                        item.tone === "leak"
                          ? "bg-critical-soft text-critical"
                          : item.tone === "warning"
                          ? "bg-warning-soft text-warning"
                          : "bg-secondary text-secondary-foreground"
                      )}
                    >
                      {item.volume}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedOutlet.id === "bath1" && m.open && (
              <div className="flex items-center justify-between rounded-xl bg-critical-soft p-3 text-xs text-critical">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>Unresolved overnight leak detected on this outlet.</span>
                </div>
                <Button size="sm" variant="destructive" asChild>
                  <Link to="/ai-detection">Investigate</Link>
                </Button>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedOutlet(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </ResponsiveModal>
    </div>
  );
}

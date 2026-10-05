import { createFileRoute, Link } from "@tanstack/react-router";
import { Droplets, Gauge, TrendingDown, Waves, Activity, ShieldCheck, ShieldAlert, ArrowRight } from "lucide-react";
import { useMetrics, useStore } from "@/lib/store";
import { useLiveFlow } from "@/lib/live";
import { Panel, Metric, StatusBadge, Bar, FlowBadge } from "@/components/ww/primitives";
import { HealthRing, TankVisual, FlowLine } from "@/components/ww/visuals";
import { ConsumptionChart } from "@/components/ww/ConsumptionChart";
import { IssueCard } from "@/components/ww/IssueCard";
import { LeakAlertModal } from "@/components/ww/LeakAlertModal";
import { fmtDay, fmtTime } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — WaterWatch" },
      { name: "description", content: "Today's household water use, live flow, tank level and active issues at a glance." },
      { property: "og:title", content: "Dashboard — WaterWatch" },
      { property: "og:description", content: "Your home's water system at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { state } = useStore();
  const m = useMetrics();
  const live = useLiveFlow();
  const top = [...state.outlets].sort((a, b) => b.usage - a.usage).slice(0, 5);
  const maxU = top[0]?.usage ?? 1;
  const healthy = !m.open;

  return (
    <>
      <LeakAlertModal />
      {/* Status strip */}
      <section className={cn("panel mb-5 flex flex-col gap-5 p-5 sm:flex-row sm:items-center", healthy ? "" : "")}>
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <HealthRing score={m.health} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {healthy ? <ShieldCheck className="size-5 text-success" /> : <ShieldAlert className="size-5 text-warning" />}
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{healthy ? "Water System Healthy" : "Needs attention"}</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {healthy ? "All outlets behaving normally. WaterWatch is watching your home." : "Your system is mostly healthy, but one outlet shows unusual overnight flow."}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><span className="size-1.5 animate-pulse rounded-full bg-success" />Live · {m.outletCount} outlets · {state.devices.length - m.offline}/{state.devices.length} sensors online</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0 lg:grid-cols-4">
          <Metric label="Today" value={m.today} unit="L" icon={Droplets} sub={<>vs <span className="num">{m.avgDaily}</span> L avg</>} />
          <Metric label="Daily average" value={m.avgDaily} unit="L/day" icon={Gauge} sub="Last 30 days" />
          <Metric label="Live flow" value={live.total} unit="L/min" icon={Activity} sub={`${live.active} outlets active`} />
          <Metric label="Est. wastage" value={m.wastage} unit="L" icon={TrendingDown} tone={m.open ? "warning" : "success"} sub={state.issue.savedWater ? `${state.issue.savedWater} L saved` : "Today"} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Consumption"><ConsumptionChart /></Panel>
          <div className="grid gap-5 md:grid-cols-2">
            <Panel title="Outlet usage today" action={<Link to="/monitor" className="text-xs font-semibold text-primary hover:underline">Monitor</Link>}>
              <ul className="space-y-3.5">
                {top.map((o) => (
                  <li key={o.id}>
                    <div className="mb-1.5 flex justify-between text-sm"><span className="truncate font-medium">{o.name}</span><span className="num font-semibold">{o.usage} L</span></div>
                    <Bar value={o.usage} max={maxU} tone={o.id === "bath1" && m.open ? "critical" : "primary"} />
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Live flow" action={<span className="num text-sm font-semibold">{live.total} L/min</span>}>
              <ul className="space-y-3">
                {live.outlets.filter((o) => o.flow > 0 || o.state === "No signal").slice(0, 5).map((o) => (
                  <li key={o.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
                    <span className="truncate text-sm font-medium">{o.name}</span><FlowBadge state={o.state} />
                    <FlowLine flow={o.flow} alert={o.state === "Continuous flow"} /><span className="num text-xs text-muted-foreground">{o.flow} L/min</span>
                  </li>
                ))}
                {live.active === 0 && <p className="text-sm text-muted-foreground">No water flowing right now.</p>}
              </ul>
            </Panel>
          </div>
        </div>
        <div className="space-y-5">
          <IssueCard />
          <Panel title="Tank" action={<Link to="/home" className="text-xs font-semibold text-primary hover:underline">Details</Link>}>
            <TankVisual level={state.home.tankLevel} capacity={state.home.tankCapacity} />
          </Panel>
          <Panel title="Recent alerts" action={<Link to="/alerts" className="text-xs font-semibold text-primary hover:underline">All alerts</Link>}>
            <ul className="-my-2 divide-y">
              {state.alerts.slice(0, 3).map((a) => (
                <li key={a.id}>
                  <Link to={a.link as "/alerts"} className="flex items-center gap-3 py-2.5 hover:opacity-80">
                    <StatusBadge tone={a.status === "resolved" ? "success" : a.severity === "critical" ? "critical" : a.severity === "warning" ? "warning" : "info"} className="px-1.5">{""}</StatusBadge>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{a.title}</p><p className="text-xs text-muted-foreground">{fmtDay(a.time)}, {fmtTime(a.time)}</p></div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Recent activity" action={<Link to="/history" className="text-xs font-semibold text-primary hover:underline">History</Link>}>
            <ol className="relative space-y-3 border-l pl-4">
              {state.history.slice(0, 4).map((e) => (
                <li key={e.id} className="relative">
                  <span className={cn("absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-card", e.type === "leak" ? "bg-critical" : e.type === "resolution" ? "bg-success" : "bg-water")} />
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{fmtDay(e.time)} · {fmtTime(e.time)} · {e.outlet}</p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
      <p className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground"><Waves className="size-3.5" />Data refreshes every few seconds from your WaterWatch Hub.</p>
    </>
  );
}

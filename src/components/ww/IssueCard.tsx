import { Link } from "@tanstack/react-router";
import { CheckCircle2, Droplets, ArrowRight, Wrench, Building2, Radar } from "lucide-react";
import { useStore } from "@/lib/store";
import { StatusBadge } from "./primitives";
import { Button } from "@/components/ui/button";

export function IssueCard() {
  const { state } = useStore();
  const s = state.issue.status;
  if (s === "resolved" || s === "dismissed") {
    return (
      <div className="panel flex items-start gap-4 p-5">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-success-soft text-success"><CheckCircle2 className="size-6" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">No active issues</h3><StatusBadge tone="success">Resolved</StatusBadge></div>
          <p className="mt-1 text-sm text-muted-foreground">
            {s === "resolved" ? <>Bathroom 1 leak resolved. <span className="font-semibold text-foreground">{state.issue.savedWater} L</span> saved per night.</> : "Bathroom 1 overnight flow marked as expected."}
          </p>
          <Link to="/ai-detection" className="mt-2 inline-flex text-sm font-semibold text-primary hover:underline">View report</Link>
        </div>
      </div>
    );
  }
  const label = s === "monitoring" ? { t: "Monitoring resolution", i: Radar } : s === "plumber" ? { t: "Plumber requested", i: Wrench } : s === "municipal" ? { t: "Reported to municipality", i: Building2 } : null;
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-start gap-4 bg-critical-soft/60 p-5">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-card text-critical"><Droplets className="size-6" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">Possible bathroom leakage</h3>
            {label ? <StatusBadge tone="warning">{label.t}</StatusBadge> : <StatusBadge tone="critical">Active issue</StatusBadge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Continuous flow in Bathroom 1, 1:40 AM – 4:15 AM.</p>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x border-t text-center">
        {[["86 L", "Est. loss"], ["92%", "Confidence"], ["2h 35m", "Duration"]].map(([v, k]) => (
          <div key={k} className="p-3"><div className="num text-base font-semibold">{v}</div><div className="text-[11px] text-muted-foreground">{k}</div></div>
        ))}
      </div>
      <div className="border-t p-3">
        <Button asChild className="h-11 w-full"><Link to="/ai-detection">Investigate issue<ArrowRight className="size-4" /></Link></Button>
      </div>
    </div>
  );
}

import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Droplets, Gauge, MapPin, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "./ResponsiveModal";
import { useStore } from "@/lib/store";

export function LeakAlertModal() {
  const { state, markInitialAlertSeen } = useStore();
  const navigate = useNavigate();
  const open = !state.hasSeenInitialAlert && state.issue.status === "active";
  const close = (to?: "/ai-detection" | "/alerts") => {
    markInitialAlertSeen();
    if (to) navigate({ to });
    else toast("WaterWatch Alert", { description: "Possible bathroom leakage detected." });
  };
  return (
    <ResponsiveModal open={open} onOpenChange={(o) => !o && close()}
      title={<span className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-full bg-critical-soft text-critical"><Droplets className="size-5" /></span>Possible water leakage detected</span>}
      description="WaterWatch detected continuous water flow in your bathroom between 1:40 AM and 4:15 AM.">
      <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface p-3">
        {[{ i: Droplets, k: "Est. loss", v: "86 L" }, { i: Gauge, k: "Confidence", v: "92%" }, { i: MapPin, k: "Outlet", v: "Bathroom 1" }].map(({ i: I, k, v }) => (
          <div key={k} className="min-w-0 rounded-lg bg-card p-3">
            <I className="size-4 text-primary" /><p className="mt-2 text-[11px] text-muted-foreground">{k}</p><p className="truncate text-sm font-semibold">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button variant="link" className="h-11 px-0" onClick={() => close("/alerts")}>View alert history</Button>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline" className="h-11" onClick={() => close()}>Dismiss</Button>
          <Button className="h-11" onClick={() => close("/ai-detection")}><ScanSearch className="size-4" />Investigate issue</Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}

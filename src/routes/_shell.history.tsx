import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  History,
  Droplets,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Calendar,
} from "lucide-react";
import { useStore, type EventType, type HistoryEvent } from "@/lib/store";
import { PageHeader, Panel, StatusBadge } from "@/components/ww/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtDay, fmtTime } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/history")({
  head: () => ({
    meta: [
      { title: "Activity History — WaterWatch" },
      { name: "description", content: "Complete chronological timeline of household water events, flow logs, anomalies, and refills." },
      { property: "og:title", content: "History — WaterWatch" },
      { property: "og:description", content: "Historical event logs and timeline." },
    ],
  }),
  component: HistoryPage,
});

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  leak: "Leak & Anomaly",
  usage: "Normal Usage",
  device: "Device & Hardware",
  resolution: "Issue Resolution",
  system: "System & Tank",
};

function HistoryPage() {
  const { state } = useStore();

  const [search, setSearch] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedRange, setSelectedRange] = useState<string>("all");

  // Dynamic list of unique outlets in history
  const uniqueOutlets = useMemo(() => {
    const set = new Set<string>();
    state.history.forEach((e) => set.add(e.outlet));
    return Array.from(set);
  }, [state.history]);

  // Filtered timeline
  const filteredEvents = useMemo(() => {
    return state.history.filter((e) => {
      // Outlet filter
      if (selectedOutlet !== "all" && e.outlet !== selectedOutlet) return false;

      // Event Type filter
      if (selectedType !== "all" && e.type !== selectedType) return false;

      // Date range filter
      if (selectedRange !== "all") {
        const d = new Date(e.time);
        const now = new Date();
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        if (selectedRange === "today" && diffDays > 1) return false;
        if (selectedRange === "yesterday" && (diffDays <= 1 || diffDays > 2)) return false;
        if (selectedRange === "7d" && diffDays > 7) return false;
        if (selectedRange === "30d" && diffDays > 30) return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.detail.toLowerCase().includes(q) ||
          e.outlet.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [state.history, selectedOutlet, selectedType, selectedRange, search]);

  // Group events by day for visual timeline
  const groupedEvents = useMemo(() => {
    const groups: { day: string; events: HistoryEvent[] }[] = [];
    filteredEvents.forEach((ev) => {
      const day = fmtDay(ev.time);
      let g = groups.find((grp) => grp.day === day);
      if (!g) {
        g = { day, events: [] };
        groups.push(g);
      }
      g.events.push(ev);
    });
    return groups;
  }, [filteredEvents]);

  const handleExport = () => {
    const json = JSON.stringify(filteredEvents, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waterwatch-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported activity history");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity History"
        desc="Chronological timeline of all water draws, anomalies, system events, and resolutions."
        actions={
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="size-4" />
            Export Log
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search event logs"
            placeholder="Search events or details..."
            className="h-10 pl-9 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Outlet Filter */}
        <select
          aria-label="Filter by outlet"
          className="h-10 rounded-md border border-input bg-card px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          value={selectedOutlet}
          onChange={(e) => setSelectedOutlet(e.target.value)}
        >
          <option value="all">All Outlets ({uniqueOutlets.length})</option>
          {uniqueOutlets.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>

        {/* Event Type Filter */}
        <select
          aria-label="Filter by event type"
          className="h-10 rounded-md border border-input bg-card px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="all">All Event Types</option>
          <option value="leak">Leaks & Anomalies</option>
          <option value="usage">Normal Usage</option>
          <option value="resolution">Resolutions</option>
          <option value="device">Device & Hardware</option>
          <option value="system">Tank & System</option>
        </select>

        {/* Date Range Filter */}
        <select
          aria-label="Filter by time range"
          className="h-10 rounded-md border border-input bg-card px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          value={selectedRange}
          onChange={(e) => setSelectedRange(e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="7d">Past 7 Days</option>
          <option value="30d">Past 30 Days</option>
        </select>
      </div>

      {/* Main Timeline Card */}
      <Panel
        title={
          <div className="flex items-center gap-2">
            <History className="size-4 text-primary" />
            <span>Event Timeline</span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              {filteredEvents.length} events
            </span>
          </div>
        }
      >
        <div className="space-y-8 pt-2">
          {groupedEvents.map((group) => (
            <div key={group.day} className="space-y-4">
              <div className="sticky top-16 z-10 flex items-center gap-2 bg-card/90 py-1 backdrop-blur">
                <Calendar className="size-3.5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {group.day}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <ol className="relative ml-2 space-y-4 border-l border-border pl-6 sm:ml-4 sm:pl-8">
                {group.events.map((event) => {
                  const isLeak = event.type === "leak";
                  const isRes = event.type === "resolution";
                  const isDev = event.type === "device";
                  const isSys = event.type === "system";

                  return (
                    <li key={event.id} className="relative group">
                      {/* Timeline Node Icon */}
                      <span
                        className={cn(
                          "absolute -left-[31px] sm:-left-[39px] top-1.5 grid size-5 sm:size-6 place-items-center rounded-full border-2 border-card ring-2 ring-border transition-transform group-hover:scale-110",
                          isLeak
                            ? "bg-critical text-critical-foreground ring-critical/30"
                            : isRes
                            ? "bg-success text-success-foreground ring-success/30"
                            : isDev
                            ? "bg-warning text-warning-foreground ring-warning/30"
                            : isSys
                            ? "bg-sky text-foreground ring-sky/30"
                            : "bg-water text-foreground ring-water/30"
                        )}
                      >
                        {isLeak ? (
                          <AlertTriangle className="size-3" />
                        ) : isRes ? (
                          <CheckCircle2 className="size-3" />
                        ) : isDev ? (
                          <Cpu className="size-3" />
                        ) : isSys ? (
                          <Layers className="size-3" />
                        ) : (
                          <Droplets className="size-3" />
                        )}
                      </span>

                      {/* Event Content Card */}
                      <div className="rounded-xl border bg-card p-3.5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-foreground text-sm">
                              {event.title}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                isLeak
                                  ? "bg-critical-soft text-critical"
                                  : isRes
                                  ? "bg-success-soft text-success"
                                  : isDev
                                  ? "bg-warning-soft text-warning"
                                  : isSys
                                  ? "bg-sand text-secondary-foreground"
                                  : "bg-secondary text-secondary-foreground"
                              )}
                            >
                              {EVENT_TYPE_LABELS[event.type]}
                            </span>
                          </div>
                          <span className="num text-xs font-medium text-muted-foreground whitespace-nowrap">
                            {fmtTime(event.time)}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {event.detail}
                        </p>

                        <div className="mt-2.5 flex items-center justify-between border-t pt-2 text-[11px] text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Outlet: <strong>{event.outlet}</strong>
                          </span>
                          <span className="text-[10px]">Logged via WaterWatch Hub</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="rounded-xl border border-dashed p-12 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <History className="size-6" />
              </div>
              <p className="mt-3 text-sm font-semibold">No activity logs found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try selecting different filters or clearing your search.
              </p>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Trash2,
  CheckCheck,
  Search,
  ArrowRight,
  Filter,
  Droplets,
  ExternalLink,
} from "lucide-react";
import { useMetrics, useStore, type Alert, type Severity } from "@/lib/store";
import { PageHeader, Panel, StatusBadge } from "@/components/ww/primitives";
import { ResponsiveModal } from "@/components/ww/ResponsiveModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtDay, fmtTime } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts & Notifications — WaterWatch" },
      { name: "description", content: "Review and manage household water alerts, leak warnings, and hardware notifications." },
      { property: "og:title", content: "Alerts — WaterWatch" },
      { property: "og:description", content: "Household water alerts and safety notices." },
    ],
  }),
  component: AlertsPage,
});

type FilterTab = "all" | "critical" | "warning" | "info" | "resolved";

function AlertsPage() {
  const { state, markAlertRead, markAllAlertsRead, dismissAlert } = useStore();
  const m = useMetrics();
  const navigate = useNavigate();

  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const filteredAlerts = state.alerts.filter((a) => {
    // Filter by tab
    if (filterTab === "critical" && (a.severity !== "critical" || a.status === "resolved")) return false;
    if (filterTab === "warning" && (a.severity !== "warning" || a.status === "resolved")) return false;
    if (filterTab === "info" && (a.severity !== "info" || a.status === "resolved")) return false;
    if (filterTab === "resolved" && a.status !== "resolved") return false;

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.desc.toLowerCase().includes(q) ||
        a.outlet.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleMarkAllRead = () => {
    markAllAlertsRead();
    toast.success("All alerts marked as read");
  };

  const handleDismiss = (id: string, title: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    dismissAlert(id);
    if (selectedAlert?.id === id) setSelectedAlert(null);
    toast.info(`Dismissed "${title}"`);
  };

  const handleOpenAlert = (alert: Alert) => {
    markAlertRead(alert.id);
    setSelectedAlert(alert);
  };

  const handleNavigateToIncident = (link: string) => {
    setSelectedAlert(null);
    navigate({ to: link as any });
  };

  const counts = {
    all: state.alerts.length,
    critical: state.alerts.filter((a) => a.severity === "critical" && a.status !== "resolved").length,
    warning: state.alerts.filter((a) => a.severity === "warning" && a.status !== "resolved").length,
    info: state.alerts.filter((a) => a.severity === "info" && a.status !== "resolved").length,
    resolved: state.alerts.filter((a) => a.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts & Notifications"
        desc="Real-time incident notifications, flow warnings, hardware status and resolution logs."
        actions={
          <div className="flex items-center gap-2">
            {m.unread > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                <CheckCheck className="size-4" />
                Mark all read
              </Button>
            )}
          </div>
        }
      />

      {/* Filter Tabs Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Alert severity filters">
          {(
            [
              { key: "all", label: "All Alerts", count: counts.all },
              { key: "critical", label: "Critical", count: counts.critical },
              { key: "warning", label: "Warnings", count: counts.warning },
              { key: "info", label: "Information", count: counts.info },
              { key: "resolved", label: "Resolved", count: counts.resolved },
            ] as const
          ).map(({ key, label, count }) => (
            <button
              key={key}
              role="tab"
              aria-selected={filterTab === key}
              onClick={() => setFilterTab(key)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                filterTab === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              <span>{label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                  filterTab === key ? "bg-white/20 text-white" : "bg-card text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search alerts"
            placeholder="Search alerts or outlets..."
            className="h-10 pl-9 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Alerts List */}
      <Panel>
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const isUnread = alert.status === "unread";
            const isResolved = alert.status === "resolved";
            const isCrit = alert.severity === "critical" && !isResolved;
            const isWarn = alert.severity === "warning" && !isResolved;

            return (
              <div
                key={alert.id}
                onClick={() => handleOpenAlert(alert)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleOpenAlert(alert)}
                className={cn(
                  "group relative flex flex-col gap-3 rounded-xl border p-4 text-left transition-all hover:border-primary/40 hover:shadow-sm cursor-pointer",
                  isUnread ? "bg-card ring-1 ring-primary/20" : "bg-surface/50",
                  isCrit ? "border-critical/40 bg-critical-soft/10" : ""
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl",
                        isResolved
                          ? "bg-success-soft text-success"
                          : isCrit
                          ? "bg-critical-soft text-critical"
                          : isWarn
                          ? "bg-warning-soft text-warning"
                          : "bg-secondary text-secondary-foreground"
                      )}
                    >
                      {isResolved ? (
                        <CheckCircle2 className="size-5" />
                      ) : isCrit ? (
                        <AlertOctagon className="size-5" />
                      ) : isWarn ? (
                        <AlertTriangle className="size-5" />
                      ) : (
                        <Info className="size-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                          {alert.title}
                        </span>
                        {isUnread && (
                          <span className="size-2 rounded-full bg-primary" title="Unread" />
                        )}
                        <StatusBadge
                          tone={
                            isResolved
                              ? "success"
                              : alert.severity === "critical"
                              ? "critical"
                              : alert.severity === "warning"
                              ? "warning"
                              : "info"
                          }
                        >
                          {isResolved ? "Resolved" : alert.severity}
                        </StatusBadge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {alert.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {fmtDay(alert.time)}, {fmtTime(alert.time)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-critical"
                      aria-label="Dismiss alert"
                      onClick={(e) => handleDismiss(alert.id, alert.title, e)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-2.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Droplets className="size-3.5 text-primary" />
                    Outlet: {alert.outlet}
                  </span>
                  <div className="flex items-center gap-1 font-semibold text-primary group-hover:underline">
                    <span>View details</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            );
          })}

          {filteredAlerts.length === 0 && (
            <div className="rounded-xl border border-dashed p-12 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <Bell className="size-6" />
              </div>
              <p className="mt-3 text-sm font-semibold">No alerts found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {search ? "Try adjusting your search criteria." : "All systems are operating normally."}
              </p>
            </div>
          )}
        </div>
      </Panel>

      {/* Alert Detail Modal */}
      <ResponsiveModal
        open={!!selectedAlert}
        onOpenChange={(open) => !open && setSelectedAlert(null)}
        title={
          selectedAlert && (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-xl",
                  selectedAlert.status === "resolved"
                    ? "bg-success-soft text-success"
                    : selectedAlert.severity === "critical"
                    ? "bg-critical-soft text-critical"
                    : selectedAlert.severity === "warning"
                    ? "bg-warning-soft text-warning"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                {selectedAlert.status === "resolved" ? (
                  <CheckCircle2 className="size-5" />
                ) : selectedAlert.severity === "critical" ? (
                  <AlertOctagon className="size-5" />
                ) : (
                  <AlertTriangle className="size-5" />
                )}
              </span>
              <span className="font-bold text-base">{selectedAlert.title}</span>
            </div>
          )
        }
      >
        {selectedAlert && (
          <div className="space-y-4 pt-2 text-sm">
            <p className="text-muted-foreground leading-relaxed">{selectedAlert.desc}</p>

            <div className="grid grid-cols-2 gap-3 rounded-xl border bg-surface p-3.5 text-xs">
              <div>
                <span className="text-muted-foreground">Affected Outlet</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedAlert.outlet}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Logged At</span>
                <p className="font-semibold text-foreground mt-0.5">
                  {fmtDay(selectedAlert.time)}, {fmtTime(selectedAlert.time)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Severity Level</span>
                <p className="font-semibold capitalize text-foreground mt-0.5">{selectedAlert.severity}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status</span>
                <p className="font-semibold capitalize text-foreground mt-0.5">{selectedAlert.status}</p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => handleDismiss(selectedAlert.id, selectedAlert.title)}
              >
                <Trash2 className="size-4 text-critical mr-1.5" />
                Dismiss Alert
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                  Close
                </Button>
                {selectedAlert.link && (
                  <Button onClick={() => handleNavigateToIncident(selectedAlert.link)}>
                    <ExternalLink className="size-4 mr-1.5" />
                    Open Incident
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </ResponsiveModal>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ScanSearch,
  Droplets,
  Gauge,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Building2,
  HelpCircle,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Phone,
  Loader2,
  Check,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import { useMetrics, useStore } from "@/lib/store";
import { PageHeader, Panel, Metric, StatusBadge } from "@/components/ww/primitives";
import { ResponsiveModal } from "@/components/ww/ResponsiveModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/ai-detection")({
  head: () => ({
    meta: [
      { title: "AI Detection — WaterWatch" },
      { name: "description", content: "Explainable AI leak detection, overnight anomaly investigation and issue resolution." },
      { property: "og:title", content: "AI Detection — WaterWatch" },
      { property: "og:description", content: "WaterWatch explainable leak detection." },
    ],
  }),
  component: AIDetectionPage,
});

function AIDetectionPage() {
  const { state, setIssue } = useStore();
  const m = useMetrics();
  const issue = state.issue;

  // Local state for interactive resolution flow
  const [verifying, setVerifying] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [plumberModalOpen, setPlumberModalOpen] = useState(false);
  const [municipalModalOpen, setMunicipalModalOpen] = useState(false);

  // Verification simulation timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (verifying) {
      const interval = setInterval(() => {
        setVerifyProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setVerifying(false);
            setIssue("resolved");
            toast.success("Abnormal flow stopped! Estimated 86 L saved per night.");
            return 100;
          }
          return prev + 25;
        });
      }, 700);
      return () => clearInterval(interval);
    }
  }, [verifying, setIssue]);

  const handleIFixedIt = () => {
    setVerifyProgress(10);
    setVerifying(true);
    setIssue("monitoring");
  };

  const handlePlumberBooking = (plumberName: string) => {
    setPlumberModalOpen(false);
    setIssue("plumber");
    toast.success(`Plumber booking dispatched to ${plumberName}`);
  };

  const handleMunicipalReport = () => {
    setMunicipalModalOpen(false);
    setIssue("municipal");
    toast.success("Civic water report submitted to Municipal Water Department");
  };

  const handleNotAProblem = () => {
    setIssue("dismissed");
    toast.info("Marked as expected flow. Detection algorithm calibrated.");
  };

  const handleReopen = () => {
    setIssue("active");
    toast.info("Incident reopened for investigation.");
  };

  const isResolved = issue.status === "resolved" || issue.status === "dismissed";

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Incident Detection"
        desc="Machine learning telemetry analysis identifying unusual water draw and silent leaks."
        actions={
          isResolved ? (
            <Button variant="outline" size="sm" onClick={handleReopen}>
              <RotateCcw className="size-4" />
              Reopen Incident
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full bg-critical-soft px-3 py-1 text-xs font-semibold text-critical">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-critical opacity-75" />
                <span className="relative size-2 rounded-full bg-critical" />
              </span>
              Active Incident #8841-BATH
            </div>
          )
        }
      />

      {/* RESOLVED STATE BANNER */}
      {issue.status === "resolved" && (
        <section className="panel border-success/40 bg-success-soft/30 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-success text-success-foreground shadow-sm">
                <CheckCircle2 className="size-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">Abnormal flow stopped</h2>
                  <StatusBadge tone="success">Issue Resolved</StatusBadge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  WaterWatch confirmed Bathroom 1 telemetry has returned to normal idle flow (0.0 L/min).
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium">
                  <span className="inline-flex items-center gap-1 rounded-md bg-success/20 px-2 py-1 text-success">
                    <Droplets className="size-3.5" /> Estimated water saved: <strong>86 L / night</strong>
                  </span>
                  <span className="text-muted-foreground">
                    Verified by Bathroom 1 Flow Sensor
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 sm:self-center">
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* VERIFYING FLOW IN PROGRESS */}
      {verifying && (
        <section className="panel border-primary/50 bg-primary/5 p-6 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Loader2 className="size-6 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Verifying Bathroom 1 sensor telemetry...</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Analyzing real-time sensor pulses to ensure flow rate has dropped back to 0.0 L/min.
              </p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${verifyProgress}%` }}
              />
            </div>
            <p className="text-xs font-semibold text-primary">{verifyProgress}% Complete</p>
          </div>
        </section>
      )}

      {/* ACTIVE INCIDENT DETAILS */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Incident Dossier */}
        <div className="space-y-6 lg:col-span-8">
          {/* Main Card */}
          <Panel
            title={
              <div className="flex items-center gap-2">
                <AlertTriangle className={cn("size-5", isResolved ? "text-success" : "text-critical")} />
                <span>Possible bathroom leakage detected</span>
              </div>
            }
            action={
              <StatusBadge tone={isResolved ? "success" : "critical"}>
                {isResolved ? "Resolved" : "Active Anomaly"}
              </StatusBadge>
            }
          >
            {/* Key stats row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl bg-surface p-4">
              <div>
                <p className="text-xs text-muted-foreground">Affected Outlet</p>
                <p className="mt-1 text-sm font-bold text-foreground">Bathroom 1</p>
                <p className="text-[11px] text-muted-foreground">Master ensuite</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Continuous Flow</p>
                <p className="num mt-1 text-sm font-bold text-foreground">1:40 AM – 4:15 AM</p>
                <p className="text-[11px] text-muted-foreground">2 h 35 m duration</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estimated Water Loss</p>
                <p className="num mt-1 text-sm font-bold text-critical">86 Litres</p>
                <p className="text-[11px] text-muted-foreground">~0.55 L/min rate</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Detection Confidence</p>
                <p className="num mt-1 text-sm font-bold text-foreground">92%</p>
                <p className="text-[11px] text-muted-foreground">High certainty</p>
              </div>
            </div>

            {/* Simulated Telemetry Timeline Graph */}
            <div className="mt-6 rounded-xl border p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Flow Rate Telemetry (Overnight)</span>
                <span className="text-critical font-medium">Abnormal continuous plateau</span>
              </div>
              <div className="mt-4 flex h-24 items-end gap-1.5 sm:gap-2">
                {[0, 0, 0, 0.1, 0.55, 0.58, 0.56, 0.55, 0.57, 0.54, 0.56, 0.55, 0.1, 0, 0, 0].map((v, i) => {
                  const isAnomaly = v >= 0.5;
                  const heightPct = Math.round((v / 0.7) * 100);
                  const times = ["12A", "1A", "1:20", "1:40", "2A", "2:20", "2:40", "3A", "3:20", "3:40", "4A", "4:15", "4:30", "5A", "6A", "7A"];
                  return (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <div className="h-20 w-full flex items-end">
                        <div
                          className={cn(
                            "w-full rounded-t transition-all",
                            isAnomaly ? "bg-critical" : v > 0 ? "bg-water" : "bg-muted"
                          )}
                          style={{ height: `${Math.max(4, heightPct)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{times[i]}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-critical" /> Leak Flow Window (1:40 AM – 4:15 AM)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-muted" /> Normal Quiet Baseline (0 L/min)
                </span>
              </div>
            </div>

            {/* Explain Why It Was Detected */}
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <Sparkles className="size-4 text-primary" />
                Why WaterWatch Detected This
              </h3>
              <ol className="space-y-2.5">
                {[
                  "Continuous flow occurred during a normally inactive period (1:40 AM – 4:15 AM).",
                  "Flow was relatively consistent (0.55 L/min) rather than normal short-duration usage pulses.",
                  "Similar overnight activity has not occurred during the previous 30 days.",
                  "Bathroom 1 is the affected outlet, isolated by dedicated acoustic and turbine flow sensor telemetry.",
                ].map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-3 rounded-lg bg-surface p-3 text-xs">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="text-foreground leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Possible Causes & Recommended Actions */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-card p-4">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <HelpCircle className="size-4 text-muted-foreground" />
                  Possible Causes
                </h4>
                <ul className="mt-2.5 space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-critical" />
                    <span><strong>Running toilet:</strong> Cistern flapper valve stuck open or leaking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-critical" />
                    <span><strong>Leaking tap:</strong> Worn washer or loose cartridge in sink faucet</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-critical" />
                    <span><strong>Pipe leakage:</strong> Joint or braided hose seepage beneath vanity</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border bg-card p-4">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Wrench className="size-4 text-muted-foreground" />
                  Recommended Actions
                </h4>
                <ul className="mt-2.5 space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" />
                    <span>Check bathroom tap handles and aerator for drips</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" />
                    <span>Check toilet tank water level and flapper seal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" />
                    <span>Inspect visible water supply pipes and angle valves</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" />
                    <span>Contact plumber if leak persists behind walls</span>
                  </li>
                </ul>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right: Resolution Control Panel */}
        <div className="space-y-6 lg:col-span-4">
          <Panel title="Issue Resolution">
            <p className="text-xs text-muted-foreground">
              Select an action based on your inspection of Bathroom 1:
            </p>

            <div className="mt-4 space-y-2.5">
              <Button
                className="h-12 w-full justify-start text-sm font-semibold shadow-sm"
                onClick={handleIFixedIt}
                disabled={verifying}
              >
                <Check className="mr-2 size-4" />
                I fixed it (Verify & Resolve)
              </Button>

              <Button
                variant="outline"
                className="h-11 w-full justify-start text-sm"
                onClick={() => setPlumberModalOpen(true)}
              >
                <Wrench className="mr-2 size-4 text-primary" />
                Get plumber
              </Button>

              <Button
                variant="outline"
                className="h-11 w-full justify-start text-sm"
                onClick={() => setMunicipalModalOpen(true)}
              >
                <Building2 className="mr-2 size-4 text-muted-foreground" />
                Municipal issue
              </Button>

              <Button
                variant="ghost"
                className="h-11 w-full justify-start text-sm text-muted-foreground hover:text-foreground"
                onClick={handleNotAProblem}
              >
                <HelpCircle className="mr-2 size-4" />
                Not a problem (Ignore)
              </Button>
            </div>

            <div className="mt-6 rounded-xl bg-surface p-3.5 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">How resolution verification works:</p>
              <p className="mt-1">
                When you click "I fixed it", WaterWatch monitors the Bathroom 1 sensor in real time. Once stable zero-flow is confirmed, the incident is closed and savings are logged.
              </p>
            </div>
          </Panel>

          {/* Connected Sensor Health Card */}
          <Panel title="Monitoring Sensor">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Bathroom 1 Flow Sensor</span>
                <span className="flex items-center gap-1 text-success font-medium">
                  <span className="size-1.5 rounded-full bg-success" /> Online
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>Model: WW-FL-200</div>
                <div>Battery: 88%</div>
                <div>Latency: 18ms</div>
                <div>Firmware: v2.1.0</div>
              </div>
              <div className="border-t pt-2 text-[11px] text-muted-foreground">
                Last heartbeat: Today at 8:57 AM
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* PLUMBER BOOKING MODAL */}
      <ResponsiveModal
        open={plumberModalOpen}
        onOpenChange={setPlumberModalOpen}
        title="Schedule Plumber Visit"
        description="Book a verified local plumbing specialist in Mumbai."
      >
        <div className="space-y-4 pt-2">
          {[
            { name: "Ramesh Plumbing & Sanitary", rating: "4.9 ★ (140 reviews)", distance: "1.2 km away", eta: "Within 45 mins", phone: "+91 98201 44812" },
            { name: "QuickFix Pipeline Services", rating: "4.8 ★ (89 reviews)", distance: "2.4 km away", eta: "Today, 2:00 PM", phone: "+91 98334 11200" },
            { name: "Apex Leak Detection Engineers", rating: "4.9 ★ (210 reviews)", distance: "3.1 km away", eta: "Tomorrow morning", phone: "+91 99200 88711" },
          ].map((plumber) => (
            <div key={plumber.name} className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-foreground text-sm">{plumber.name}</p>
                <p className="text-xs text-muted-foreground">{plumber.rating} · {plumber.distance}</p>
                <p className="mt-1 text-xs text-primary font-medium">Available: {plumber.eta}</p>
              </div>
              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <Button size="sm" onClick={() => handlePlumberBooking(plumber.name)}>
                  Dispatch Plumber
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ResponsiveModal>

      {/* MUNICIPAL ISSUE REPORT MODAL */}
      <ResponsiveModal
        open={municipalModalOpen}
        onOpenChange={setMunicipalModalOpen}
        title="Report to Municipal Corporation"
        description="Submit pressure anomaly or civic water contamination report to BMC."
      >
        <div className="space-y-4 pt-2 text-xs">
          <p className="text-muted-foreground">
            If this flow is due to abnormal main line pressure fluctuation or water contamination backflow, report it directly to Mumbai Municipal Water Board.
          </p>
          <div className="rounded-xl border bg-surface p-3 space-y-1">
            <p className="font-semibold text-foreground">Attached Telemetry Dossier:</p>
            <p>• Incident timestamp: 1:40 AM – 4:15 AM</p>
            <p>• Volume: 86 Litres</p>
            <p>• Ward: K-West / Green Park Road, Mumbai</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setMunicipalModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMunicipalReport}>
              Submit Municipal Report
            </Button>
          </div>
        </div>
      </ResponsiveModal>
    </div>
  );
}

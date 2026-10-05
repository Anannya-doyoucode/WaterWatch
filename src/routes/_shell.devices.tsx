import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Cpu,
  Plus,
  Battery,
  BatteryCharging,
  Wifi,
  WifiOff,
  RefreshCw,
  Edit2,
  Trash2,
  Activity,
  Layers,
  Droplets,
  CheckCircle2,
  AlertCircle,
  Radio,
  Settings,
  ArrowRight,
  Loader2,
  Check,
  RotateCcw,
} from "lucide-react";
import { useStore, type Device } from "@/lib/store";
import { PageHeader, Panel, Metric, StatusBadge } from "@/components/ww/primitives";
import { ResponsiveModal } from "@/components/ww/ResponsiveModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmtTime } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/devices")({
  head: () => ({
    meta: [
      { title: "IoT Devices — WaterWatch" },
      { name: "description", content: "Manage connected WaterWatch Hub, ultrasonic tank monitors, and inline flow sensors." },
      { property: "og:title", content: "Devices — WaterWatch" },
      { property: "og:description", content: "IoT device management and hardware calibration." },
    ],
  }),
  component: DevicesPage,
});

function DevicesPage() {
  const { state, updateDevice, addDevice, removeDevice } = useStore();

  // Dialog states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Device | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; latency: number; signal: string } | null>(null);

  // Add Device Flow State
  const [addStep, setAddStep] = useState(1); // 1: Select Type -> 2: Pair -> 3: Assign Outlet -> 4: Name -> 5: Test Flow -> 6: Connected
  const [newDeviceType, setNewDeviceType] = useState<"Flow sensor" | "Tank sensor" | "Hub">("Flow sensor");
  const [pairingState, setPairingState] = useState<"searching" | "found" | "error">("searching");
  const [assignedOutletId, setAssignedOutletId] = useState<string>(state.outlets[0]?.id || "");
  const [newDeviceName, setNewDeviceName] = useState("");
  const [calibrating, setCalibrating] = useState(false);
  const [flowDetected, setFlowDetected] = useState(false);

  // Test connection trigger
  const handleTestConnection = (dev: Device) => {
    setTestingId(dev.id);
    setTestResult(null);
    setTimeout(() => {
      setTestingId(null);
      setTestResult({
        id: dev.id,
        latency: Math.floor(Math.random() * 12) + 8,
        signal: "-58 dBm (Excellent)",
      });
      toast.success(`Connection verified for ${dev.name}`);
    }, 1200);
  };

  // Rename trigger
  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTarget || !renameValue.trim()) return;
    updateDevice(renameTarget.id, { name: renameValue.trim() });
    toast.success(`Renamed to "${renameValue.trim()}"`);
    setRenameTarget(null);
  };

  // Remove device
  const handleRemove = (dev: Device) => {
    if (dev.type === "Hub") {
      toast.error("Cannot remove the central WaterWatch Hub");
      return;
    }
    removeDevice(dev.id);
    toast.info(`Removed device "${dev.name}"`);
  };

  // ADD DEVICE WIZARD HANDLERS
  const startAddDeviceFlow = () => {
    setAddStep(1);
    setNewDeviceType("Flow sensor");
    setPairingState("searching");
    setAssignedOutletId(state.outlets[0]?.id || "");
    setNewDeviceName("");
    setCalibrating(false);
    setFlowDetected(false);
    setAddModalOpen(true);
  };

  const handleStep1Next = () => {
    setAddStep(2);
    setPairingState("searching");
    // Simulate finding device after 2 seconds
    setTimeout(() => {
      setPairingState("found");
      setNewDeviceName(`New ${newDeviceType}`);
    }, 2000);
  };

  const handleStep5StartFlowTest = () => {
    setCalibrating(true);
    setTimeout(() => {
      setCalibrating(false);
      setFlowDetected(true);
    }, 2200);
  };

  const handleCompleteAdd = () => {
    const newId = `dev-${Date.now().toString(36)}`;
    const created: Device = {
      id: newId,
      name: newDeviceName.trim() || `WaterWatch ${newDeviceType}`,
      type: newDeviceType,
      status: "online",
      battery: newDeviceType === "Hub" ? null : 100,
      lastSync: new Date().toISOString(),
      outletId: newDeviceType === "Flow sensor" ? assignedOutletId : null,
    };
    addDevice(created);
    setAddModalOpen(false);
    toast.success(`Successfully connected ${created.name}`);
  };

  const onlineCount = state.devices.filter((d) => d.status === "online").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hardware & Devices"
        desc="WaterWatch Hub, Zigbee flow sensors, and ultrasonic tank telemetry monitors."
        actions={
          <Button onClick={startAddDeviceFlow}>
            <Plus className="size-4" />
            Add Device
          </Button>
        }
      />

      {/* Top Device Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="panel p-4">
          <Metric
            label="Total Devices"
            value={state.devices.length}
            unit="installed"
            icon={Cpu}
            sub={`${onlineCount} devices communicating`}
          />
        </div>
        <div className="panel p-4">
          <Metric
            label="WaterWatch Hub"
            value="Online"
            icon={Radio}
            tone="success"
            sub="Firmware v2.4.1 (Latest)"
          />
        </div>
        <div className="panel p-4">
          <Metric
            label="Flow Sensors"
            value={state.devices.filter((d) => d.type === "Flow sensor").length}
            unit="monitored"
            icon={Droplets}
            sub="Inline turbine telemetry"
          />
        </div>
        <div className="panel p-4">
          <Metric
            label="Lowest Battery"
            value="78%"
            unit="Washing Machine"
            icon={Battery}
            tone="warning"
            sub="Healthy (>20% threshold)"
          />
        </div>
      </section>

      {/* Device List Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {state.devices.map((device) => {
          const isHub = device.type === "Hub";
          const isTank = device.type === "Tank sensor";
          const isOnline = device.status === "online";
          const assignedOutlet = state.outlets.find((o) => o.id === device.outletId);
          const isTesting = testingId === device.id;
          const hasTestResult = testResult?.id === device.id;

          return (
            <div
              key={device.id}
              className="panel flex flex-col justify-between p-5 transition-shadow hover:shadow-md"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "grid size-11 place-items-center rounded-xl",
                        isHub
                          ? "bg-primary text-primary-foreground"
                          : isTank
                          ? "bg-sky text-primary"
                          : "bg-surface text-primary"
                      )}
                    >
                      {isHub ? <Radio className="size-6" /> : isTank ? <Layers className="size-6" /> : <Droplets className="size-6" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm leading-tight">
                        {device.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{device.type}</p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      isOnline ? "bg-success-soft text-success" : "bg-critical-soft text-critical"
                    )}
                  >
                    <span className={cn("size-1.5 rounded-full", isOnline ? "bg-success animate-pulse" : "bg-critical")} />
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>

                {/* Details list */}
                <div className="mt-4 space-y-2 rounded-xl bg-surface p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Power Source</span>
                    {device.battery !== null ? (
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <Battery className="size-3.5 text-success" />
                        {device.battery}%
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <BatteryCharging className="size-3.5 text-primary" />
                        AC Powered
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Assigned Outlet</span>
                    <span className="font-semibold text-foreground">
                      {assignedOutlet ? assignedOutlet.name : isTank ? "Water Tank" : "Central Gateway"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last Synced</span>
                    <span className="font-semibold text-foreground">
                      {fmtTime(device.lastSync)}
                    </span>
                  </div>
                </div>

                {/* Connection Ping Result Notice */}
                {hasTestResult && (
                  <div className="mt-3 rounded-lg bg-success-soft/40 p-2 text-center text-[11px] text-success font-medium">
                    Verified · Latency {testResult.latency}ms · {testResult.signal}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-5 flex items-center justify-between gap-2 border-t pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs flex-1"
                  onClick={() => handleTestConnection(device)}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-1" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Activity className="size-3.5 mr-1" />
                      Test Link
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  aria-label={`Rename ${device.name}`}
                  onClick={() => {
                    setRenameTarget(device);
                    setRenameValue(device.name);
                  }}
                >
                  <Edit2 className="size-3.5" />
                </Button>

                {!isHub && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:bg-critical-soft hover:text-critical"
                    aria-label={`Remove ${device.name}`}
                    onClick={() => handleRemove(device)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* RENAME MODAL */}
      <ResponsiveModal
        open={!!renameTarget}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        title="Rename Device"
        description="Update the display label for this connected hardware sensor."
      >
        <form onSubmit={handleSaveRename} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="rename-input">Device Name</Label>
            <Input
              id="rename-input"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button type="submit">Save Name</Button>
          </div>
        </form>
      </ResponsiveModal>

      {/* ADD DEVICE 6-STEP MODAL FLOW */}
      <ResponsiveModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        title={
          <div className="flex items-center gap-2">
            <Cpu className="size-5 text-primary" />
            <span>Add New WaterWatch Hardware</span>
          </div>
        }
        description={`Step ${addStep} of 6 — ${
          addStep === 1
            ? "Select Device Type"
            : addStep === 2
            ? "Pair Device"
            : addStep === 3
            ? "Assign Outlet"
            : addStep === 4
            ? "Name Device"
            : addStep === 5
            ? "Test Flow"
            : "Connected"
        }`}
      >
        <div className="space-y-6 pt-2">
          {/* Progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(addStep / 6) * 100}%` }}
            />
          </div>

          {/* STEP 1: SELECT DEVICE TYPE */}
          {addStep === 1 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Choose the kind of WaterWatch sensor you are installing:
              </p>
              <div className="grid gap-3">
                {[
                  {
                    type: "Flow sensor" as const,
                    title: "Inline Flow Sensor",
                    desc: "Monitors real-time flow rate on taps, showers, toilets and appliances.",
                    icon: Droplets,
                  },
                  {
                    type: "Tank sensor" as const,
                    title: "Ultrasonic Tank Monitor",
                    desc: "Measures water level and storage capacity from overhead cisterns.",
                    icon: Layers,
                  },
                  {
                    type: "Hub" as const,
                    title: "Additional Hub / Repeater",
                    desc: "Extends Zigbee mesh wireless coverage across large homes.",
                    icon: Radio,
                  },
                ].map((opt) => (
                  <div
                    key={opt.type}
                    onClick={() => setNewDeviceType(opt.type)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setNewDeviceType(opt.type)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 text-left transition-all cursor-pointer",
                      newDeviceType === opt.type
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:border-primary/40 bg-card"
                    )}
                  >
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface text-primary">
                      <opt.icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{opt.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-3">
                <Button onClick={handleStep1Next}>Continue to Pairing</Button>
              </div>
            </div>
          )}

          {/* STEP 2: PAIR DEVICE */}
          {addStep === 2 && (
            <div className="space-y-4 text-center py-4">
              {pairingState === "searching" ? (
                <>
                  <div className="relative mx-auto grid size-20 place-items-center rounded-full bg-primary/10 text-primary">
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                    <Radio className="size-8 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Searching for device...</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ensure your {newDeviceType} is powered on and within range of the WaterWatch Hub.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-success-soft text-success">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Hardware Discovered!</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Found <strong>WaterWatch {newDeviceType} #8841</strong> via Zigbee 3.0.
                    </p>
                  </div>
                  <div className="flex justify-center gap-2 pt-2">
                    <Button onClick={() => setAddStep(3)}>Continue to Outlet Assignment</Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 3: ASSIGN OUTLET */}
          {addStep === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Assign this hardware sensor to one of your home's water outlets:
              </p>
              <div className="space-y-2">
                <Label htmlFor="assign-outlet">Home Outlet</Label>
                <select
                  id="assign-outlet"
                  className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={assignedOutletId}
                  onChange={(e) => setAssignedOutletId(e.target.value)}
                >
                  {state.outlets.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.type} · {o.qty} qty)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <Button variant="outline" onClick={() => setAddStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setAddStep(4)}>Next: Name Device</Button>
              </div>
            </div>
          )}

          {/* STEP 4: NAME DEVICE */}
          {addStep === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Give this sensor a descriptive friendly label for easy identification:
              </p>
              <div className="space-y-2">
                <Label htmlFor="device-name-input">Device Name</Label>
                <Input
                  id="device-name-input"
                  className="h-11"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="e.g. Master Bath Flow Sensor"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <Button variant="outline" onClick={() => setAddStep(3)}>
                  Back
                </Button>
                <Button onClick={() => setAddStep(5)} disabled={!newDeviceName.trim()}>
                  Next: Flow Calibration
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: TEST FLOW */}
          {addStep === 5 && (
            <div className="space-y-4 text-center py-2">
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-surface text-primary">
                <Droplets className="size-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Calibrate Flow Telemetry</h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                  Turn on the assigned tap for 3 seconds so the turbine sensor can calibrate against water pressure.
                </p>
              </div>

              {calibrating && (
                <div className="space-y-2">
                  <Loader2 className="mx-auto size-6 animate-spin text-primary" />
                  <p className="text-xs font-semibold text-primary">Detecting water flow pulse...</p>
                </div>
              )}

              {flowDetected && (
                <div className="rounded-xl bg-success-soft p-3 text-xs font-medium text-success">
                  Flow verified: <strong>3.2 L/min</strong> telemetry recorded! Calibration successful.
                </div>
              )}

              <div className="flex justify-center gap-2 pt-3">
                {!flowDetected ? (
                  <Button onClick={handleStep5StartFlowTest} disabled={calibrating}>
                    {calibrating ? "Calibrating..." : "Simulate Tap Flow"}
                  </Button>
                ) : (
                  <Button onClick={() => setAddStep(6)}>Proceed</Button>
                )}
              </div>
            </div>
          )}

          {/* STEP 6: CONNECTED SUCCESS */}
          {addStep === 6 && (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-success text-success-foreground">
                <Check className="size-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Device Connected!</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  <strong>{newDeviceName}</strong> is fully operational and streaming telemetry to your dashboard.
                </p>
              </div>
              <div className="rounded-xl border bg-surface p-3 text-xs text-left">
                <p>• Device Type: {newDeviceType}</p>
                <p>• Battery Level: 100% (Full)</p>
                <p>• Connection: Zigbee 3.0 via WaterWatch Hub</p>
              </div>
              <div className="flex justify-center pt-2">
                <Button className="min-w-36" onClick={handleCompleteAdd}>
                  Finish & View Devices
                </Button>
              </div>
            </div>
          )}
        </div>
      </ResponsiveModal>
    </div>
  );
}

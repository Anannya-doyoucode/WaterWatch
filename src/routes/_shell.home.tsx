import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Home, Droplets, Layers, Users, Building, ShieldCheck, Plus, Trash2, RotateCcw, Waves, Check } from "lucide-react";
import { useMetrics, useStore, OUTLET_TYPES, TYPE_USAGE, type Outlet, type OutletType } from "@/lib/store";
import { PageHeader, Panel, Metric } from "@/components/ww/primitives";
import { Stepper } from "@/components/ww/HomeForms";
import { TankVisual } from "@/components/ww/visuals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_shell/home")({
  head: () => ({
    meta: [
      { title: "My Home — WaterWatch" },
      { name: "description", content: "Configure household specifications, water storage, and manage your connected water outlets." },
      { property: "og:title", content: "My Home — WaterWatch" },
      { property: "og:description", content: "Home profile and outlet management for WaterWatch." },
    ],
  }),
  component: MyHome,
});

const selCls = "h-11 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function MyHome() {
  const { state, updateHome, updateOutlets, refillTank } = useStore();
  const m = useMetrics();

  // Local copy of home details for editing
  const [homeForm, setHomeForm] = useState(state.home);
  const [isSaved, setIsSaved] = useState(false);

  // Sync if store home changes externally
  const handleHomeFieldChange = <K extends keyof typeof state.home>(key: K, value: typeof state.home[K]) => {
    const updated = { ...homeForm, [key]: value };
    setHomeForm(updated);
    updateHome({ [key]: value });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveHome = (e: React.FormEvent) => {
    e.preventDefault();
    updateHome(homeForm);
    toast.success("Home details updated successfully");
  };

  // Outlet modifications
  const handlePatchOutlet = (id: string, patch: Partial<Outlet>) => {
    const updated = state.outlets.map((o) => {
      if (o.id !== id) return o;
      const next = { ...o, ...patch };
      if (patch.qty !== undefined || patch.type) {
        const per = o.qty > 0 && !patch.type ? o.usage / o.qty : TYPE_USAGE[next.type];
        next.usage = Math.round(per * next.qty);
        next.avg = Math.round((o.avg / Math.max(1, o.qty)) * next.qty) || next.usage;
      }
      return next;
    });
    updateOutlets(updated);
  };

  const handleAddOutlet = () => {
    const newId = `outlet-${Date.now().toString(36)}`;
    const newOutlet: Outlet = {
      id: newId,
      name: `New Outlet ${state.outlets.length + 1}`,
      type: "Other",
      qty: 1,
      usage: TYPE_USAGE.Other,
      avg: TYPE_USAGE.Other,
    };
    updateOutlets([...state.outlets, newOutlet]);
    toast.success("Added new water outlet");
  };

  const handleRemoveOutlet = (id: string, name: string) => {
    if (state.outlets.length <= 1) {
      toast.error("You must have at least one outlet");
      return;
    }
    const updated = state.outlets.filter((o) => o.id !== id);
    updateOutlets(updated);
    toast.info(`Removed "${name}"`);
  };

  const handleRefillSimulation = () => {
    refillTank(150);
    toast.success("Simulated municipal refill (+150 L added to tank)");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Home"
        desc="Manage your property details, tank storage, and configure individual water outlets."
        actions={
          <Button variant="outline" size="sm" onClick={handleRefillSimulation}>
            <Waves className="size-4 text-primary" />
            Simulate Refill
          </Button>
        }
      />

      {/* Top Highlights Strip */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="panel p-4">
          <Metric label="Total Outlets" value={m.outletCount} unit="outlets" icon={Droplets} sub="Active across 2 floors" />
        </div>
        <div className="panel p-4">
          <Metric label="Residents" value={state.home.residents} unit="people" icon={Users} sub="Household members" />
        </div>
        <div className="panel p-4">
          <Metric label="Tank Level" value={`${state.home.tankLevel}%`} unit={`${m.tankLiters} L`} icon={Layers} sub={`Capacity: ${state.home.tankCapacity} L`} />
        </div>
        <div className="panel p-4">
          <Metric label="System Health" value={`${m.health}%`} icon={ShieldCheck} tone={m.health >= 90 ? "success" : "warning"} sub={m.open ? "1 alert pending" : "All outlets normal"} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Home Specs & Tank Details */}
        <div className="space-y-6 lg:col-span-5">
          {/* Home Specs Card */}
          <Panel
            title="Property Specifications"
            action={
              isSaved && (
                <span className="flex items-center gap-1 text-xs font-medium text-success">
                  <Check className="size-3.5" /> Saved
                </span>
              )
            }
          >
            <form onSubmit={handleSaveHome} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="home-name">Resident / Account Name</Label>
                <Input
                  id="home-name"
                  className="h-11"
                  value={homeForm.name}
                  onChange={(e) => handleHomeFieldChange("name", e.target.value)}
                  placeholder="e.g. Ananya"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="home-address">Property Address</Label>
                <Input
                  id="home-address"
                  className="h-11"
                  value={homeForm.address}
                  onChange={(e) => handleHomeFieldChange("address", e.target.value)}
                  placeholder="e.g. 24 Green Park Road, Mumbai, India"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="home-type">Property Type</Label>
                  <select
                    id="home-type"
                    className={selCls}
                    value={homeForm.homeType}
                    onChange={(e) => handleHomeFieldChange("homeType", e.target.value)}
                  >
                    {["Apartment", "Independent house", "Villa", "Row house"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="water-source">Water Source</Label>
                  <select
                    id="water-source"
                    className={selCls}
                    value={homeForm.source}
                    onChange={(e) => handleHomeFieldChange("source", e.target.value)}
                  >
                    {["Municipal + Tank", "Municipal only", "Borewell + Tank", "Tanker + Tank"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="home-residents">Residents</Label>
                  <Stepper
                    id="home-residents"
                    value={homeForm.residents}
                    min={1}
                    onChange={(v) => handleHomeFieldChange("residents", v)}
                    label="Residents"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="home-floors">Floors</Label>
                  <Stepper
                    id="home-floors"
                    value={homeForm.floors}
                    min={1}
                    onChange={(v) => handleHomeFieldChange("floors", v)}
                    label="Floors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tank-cap">Tank Capacity</Label>
                <select
                  id="tank-cap"
                  className={selCls}
                  value={homeForm.tankCapacity}
                  onChange={(e) => handleHomeFieldChange("tankCapacity", +e.target.value)}
                >
                  {[500, 750, 1000, 1500, 2000, 3000].map((c) => (
                    <option key={c} value={c}>
                      {c} Litres
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="h-11 w-full">
                Save Property Changes
              </Button>
            </form>
          </Panel>

          {/* Tank Storage Visualization Card */}
          <Panel
            title="Water Storage & Reserve"
            action={
              <button
                onClick={handleRefillSimulation}
                className="text-xs font-semibold text-primary hover:underline"
              >
                + Refill Tank
              </button>
            }
          >
            <div className="space-y-4">
              <TankVisual level={state.home.tankLevel} capacity={state.home.tankCapacity} />

              <div className="rounded-xl bg-surface p-3 text-xs text-muted-foreground">
                <div className="flex justify-between font-medium text-foreground">
                  <span>Tank Sensor</span>
                  <span className="flex items-center gap-1.5 text-success">
                    <span className="size-1.5 rounded-full bg-success" /> Online · Battery 83%
                  </span>
                </div>
                <p className="mt-1">
                  Ultrasonic level telemetry synced 1 min ago. At current consumption rate, water will last approx.{" "}
                  <strong className="text-foreground">{(m.tankLiters / Math.max(1, m.avgDaily)).toFixed(1)} days</strong>.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="w-full" onClick={() => updateHome({ tankLevel: 100 })}>
                  Set to 100% Full
                </Button>
                <Button variant="outline" size="sm" className="w-full" onClick={() => updateHome({ tankLevel: 72 })}>
                  Reset to 72%
                </Button>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right Column: Outlets Management */}
        <div className="space-y-6 lg:col-span-7">
          <Panel
            title={
              <div className="flex items-center gap-2">
                <span>Water Outlets</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {m.outletCount} Total
                </span>
              </div>
            }
            action={
              <Button size="sm" onClick={handleAddOutlet}>
                <Plus className="size-4" />
                Add Outlet
              </Button>
            }
          >
            <p className="mb-4 text-sm text-muted-foreground">
              Configure each tap, shower, toilet, or appliance outlet. Quantities update consumption baselines and telemetry attribution across Monitor, Dashboard, and Analytics.
            </p>

            <div className="space-y-3">
              {state.outlets.map((outlet) => {
                const connectedDev = state.devices.find((d) => d.outletId === outlet.id);
                return (
                  <div
                    key={outlet.id}
                    className="rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="grid gap-3 sm:grid-cols-[1.4fr_1.2fr_130px_auto] sm:items-center">
                      <div>
                        <Label className="text-xs text-muted-foreground">Outlet Name</Label>
                        <Input
                          aria-label="Outlet name"
                          className="mt-1 h-10 font-medium"
                          value={outlet.name}
                          onChange={(e) => handlePatchOutlet(outlet.id, { name: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Type</Label>
                        <select
                          aria-label="Outlet type"
                          className="mt-1 h-10 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          value={outlet.type}
                          onChange={(e) => handlePatchOutlet(outlet.id, { type: e.target.value as OutletType })}
                        >
                          {OUTLET_TYPES.map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Quantity</Label>
                        <div className="mt-1">
                          <Stepper
                            label={`${outlet.name} count`}
                            value={outlet.qty}
                            min={1}
                            onChange={(v) => handlePatchOutlet(outlet.id, { qty: v })}
                          />
                        </div>
                      </div>

                      <div className="flex items-end justify-end pt-5 sm:pt-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-10 text-muted-foreground hover:bg-critical-soft hover:text-critical"
                          aria-label={`Remove ${outlet.name}`}
                          disabled={state.outlets.length <= 1}
                          onClick={() => handleRemoveOutlet(outlet.id, outlet.name)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-2.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>Daily est: <strong className="text-foreground">{outlet.usage} L/day</strong></span>
                        <span>·</span>
                        <span>Avg: <strong className="text-foreground">{outlet.avg} L</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {connectedDev ? (
                          <span className="flex items-center gap-1 text-primary">
                            <span className="size-1.5 rounded-full bg-primary" />
                            {connectedDev.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No dedicated sensor</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl border border-dashed p-4 text-center">
              <p className="text-sm font-medium">Looking to install more sensors?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                WaterWatch sensors can be paired and assigned to any outlet in the Devices tab.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

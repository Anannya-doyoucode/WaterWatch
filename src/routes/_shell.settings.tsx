import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  User,
  Home,
  Bell,
  Activity,
  Sun,
  Moon,
  Laptop,
  Shield,
  HelpCircle,
  LogOut,
  RotateCcw,
  Check,
  Download,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import { useMetrics, useStore } from "@/lib/store";
import { PageHeader, Panel, Segmented } from "@/components/ww/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({
    meta: [
      { title: "Settings — WaterWatch" },
      { name: "description", content: "Account settings, alert preferences, monitoring thresholds, appearance, and support." },
      { property: "og:title", content: "Settings — WaterWatch" },
      { property: "og:description", content: "Configure your WaterWatch system preferences." },
    ],
  }),
  component: SettingsPage,
});

type SettingsTab = "account" | "home" | "notifications" | "monitoring" | "appearance" | "privacy" | "support";

function SettingsPage() {
  const { state, updateSettings, updateUser, reset } = useStore();
  const m = useMetrics();

  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  // Account form state
  const [userName, setUserName] = useState(state.user?.name || "Ananya");
  const [userEmail, setUserEmail] = useState(state.user?.email || "ananya@example.in");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: userName.trim(),
      email: userEmail.trim(),
      ...(newPw ? { password: newPw } : {}),
    });
    setNewPw("");
    setCurrentPw("");
    toast.success("Account profile updated");
  };

  const handleThemeChange = (t: "light" | "dark" | "system") => {
    updateSettings({ theme: t });
    toast.success(`Theme switched to ${t}`);
  };

  const handleExportData = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waterwatch-full-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported WaterWatch data backup");
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all WaterWatch demo data to initial factory defaults?")) {
      reset();
      toast.info("Demo data reset to defaults");
    }
  };

  const navItems: { key: SettingsTab; label: string; icon: any }[] = [
    { key: "account", label: "Account Profile", icon: User },
    { key: "home", label: "Home Overview", icon: Home },
    { key: "notifications", label: "Notifications & Alerts", icon: Bell },
    { key: "monitoring", label: "AI & Monitoring", icon: Activity },
    { key: "appearance", label: "Appearance", icon: Sun },
    { key: "privacy", label: "Privacy & Security", icon: Shield },
    { key: "support", label: "Help & Support", icon: HelpCircle },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        desc="System configurations, alert preferences, sensor monitoring parameters, and profile details."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3">
          <nav className="flex flex-row overflow-x-auto lg:flex-col gap-1 rounded-xl border bg-card p-1.5 sm:p-2" aria-label="Settings sections">
            {navItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap lg:whitespace-normal",
                  activeTab === key
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="space-y-6 lg:col-span-9">
          {/* ACCOUNT PROFILE */}
          {activeTab === "account" && (
            <Panel title="Account Information">
              <form onSubmit={handleSaveAccount} className="space-y-4 max-w-xl">
                <div className="space-y-1.5">
                  <Label htmlFor="account-name">Full Name</Label>
                  <Input
                    id="account-name"
                    className="h-11"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="account-email">Email Address</Label>
                  <Input
                    id="account-email"
                    type="email"
                    className="h-11"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>

                <div className="pt-2 border-t space-y-3">
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <KeyRound className="size-3.5 text-muted-foreground" />
                    Change Password
                  </h4>
                  <div className="space-y-1.5">
                    <Label htmlFor="current-pw">Current Password</Label>
                    <Input
                      id="current-pw"
                      type="password"
                      className="h-11"
                      placeholder="••••••••"
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="new-pw">New Password</Label>
                    <Input
                      id="new-pw"
                      type="password"
                      className="h-11"
                      placeholder="At least 6 characters"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-start pt-2">
                  <Button type="submit">Save Account Changes</Button>
                </div>
              </form>
            </Panel>
          )}

          {/* HOME OVERVIEW */}
          {activeTab === "home" && (
            <Panel
              title="Home Configuration Summary"
              action={
                <Button size="sm" asChild>
                  <Link to="/home">
                    Edit Full Configuration
                    <ChevronRight className="size-4 ml-1" />
                  </Link>
                </Button>
              }
            >
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border bg-surface p-3.5">
                    <p className="text-xs text-muted-foreground">Property Name</p>
                    <p className="font-bold text-foreground text-sm mt-0.5">{state.home.name}</p>
                  </div>
                  <div className="rounded-xl border bg-surface p-3.5">
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="font-bold text-foreground text-sm mt-0.5">{state.home.address}</p>
                  </div>
                  <div className="rounded-xl border bg-surface p-3.5">
                    <p className="text-xs text-muted-foreground">Household Size</p>
                    <p className="font-bold text-foreground text-sm mt-0.5">
                      {state.home.residents} Residents · {state.home.floors} Floors
                    </p>
                  </div>
                  <div className="rounded-xl border bg-surface p-3.5">
                    <p className="text-xs text-muted-foreground">Water Storage</p>
                    <p className="font-bold text-foreground text-sm mt-0.5">
                      {state.home.source} ({state.home.tankCapacity} L Tank)
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">Configured Water Outlets</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {m.outletCount} total active outlets configured
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/home">Manage Outlets</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {/* NOTIFICATIONS & ALERTS */}
          {activeTab === "notifications" && (
            <Panel title="Notification Channels & Alerts">
              <div className="divide-y space-y-4">
                <div className="flex items-center justify-between pt-4 first:pt-0">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold text-foreground">Critical Leak Alerts</Label>
                    <p className="text-xs text-muted-foreground">
                      Instant mobile push and audio alarms whenever abnormal continuous flow is detected.
                    </p>
                  </div>
                  <Switch
                    checked={state.settings.leakAlerts}
                    onCheckedChange={(checked) => updateSettings({ leakAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold text-foreground">High Usage Warnings</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive notices if daily household consumption exceeds your 30-day baseline by &gt; 30%.
                    </p>
                  </div>
                  <Switch
                    checked={state.settings.usageAlerts}
                    onCheckedChange={(checked) => updateSettings({ usageAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold text-foreground">Device & Battery Warnings</Label>
                    <p className="text-xs text-muted-foreground">
                      Notifications when an IoT flow sensor drops below 20% battery or loses connection.
                    </p>
                  </div>
                  <Switch
                    checked={state.settings.deviceAlerts}
                    onCheckedChange={(checked) => updateSettings({ deviceAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold text-foreground">Quiet Hours Monitoring</Label>
                    <p className="text-xs text-muted-foreground">
                      Heightened sensitivity for micro-draws between 12:00 AM and 5:00 AM.
                    </p>
                  </div>
                  <Switch
                    checked={state.settings.nightMonitoring}
                    onCheckedChange={(checked) => updateSettings({ nightMonitoring: checked })}
                  />
                </div>
              </div>
            </Panel>
          )}

          {/* AI & MONITORING */}
          {activeTab === "monitoring" && (
            <Panel title="AI Leak Detection & Telemetry Parameters">
              <div className="space-y-6 max-w-xl">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Anomaly Detection Sensitivity</Label>
                  <p className="text-xs text-muted-foreground">
                    Balanced is recommended to avoid false alarms while catching running toilets and dripping taps.
                  </p>
                  <Segmented
                    label="Sensitivity"
                    value={state.settings.sensitivity}
                    onChange={(s) => updateSettings({ sensitivity: s })}
                    options={[
                      { value: "low", label: "Low (Fewer alerts)" },
                      { value: "balanced", label: "Balanced (Recommended)" },
                      { value: "high", label: "High (Catch micro-leaks)" },
                    ]}
                  />
                </div>

                <div className="space-y-2 border-t pt-4">
                  <Label className="text-sm font-semibold text-foreground">Continuous Flow Threshold</Label>
                  <p className="text-xs text-muted-foreground">
                    Flag any unclosed tap running uninterrupted for longer than:
                  </p>
                  <select className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>15 Minutes</option>
                    <option>25 Minutes (Default)</option>
                    <option>45 Minutes</option>
                    <option>60 Minutes</option>
                  </select>
                </div>

                <div className="rounded-xl bg-surface p-3.5 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Acoustic & Turbine Calibration:</p>
                  <p className="mt-1">
                    Telemetry sensors calibrate their baseline noise floor every 7 days during quiet hours.
                  </p>
                </div>
              </div>
            </Panel>
          )}

          {/* APPEARANCE */}
          {activeTab === "appearance" && (
            <Panel title="Appearance & Theme">
              <div className="space-y-4 max-w-xl">
                <p className="text-xs text-muted-foreground">
                  Choose your interface theme. WaterWatch adapts seamlessly between light and dark modes.
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "light" as const, label: "Light", icon: Sun },
                    { key: "dark" as const, label: "Dark", icon: Moon },
                    { key: "system" as const, label: "System", icon: Laptop },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => handleThemeChange(t.key)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-semibold transition-all",
                        state.settings.theme === t.key
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                          : "bg-card text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      <t.icon className="size-6" />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border bg-surface p-3.5 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">WaterWatch Brand Palette:</p>
                  <p className="mt-1 flex items-center gap-2">
                    <span className="size-3 rounded-full border" style={{ backgroundColor: "#8CC0EB" }} title="#8CC0EB (Water)" />
                    <span className="size-3 rounded-full border" style={{ backgroundColor: "#BFDDF0" }} title="#BFDDF0 (Sky)" />
                    <span className="size-3 rounded-full border" style={{ backgroundColor: "#FFEBCC" }} title="#FFEBCC (Sand)" />
                    <span className="size-3 rounded-full border" style={{ backgroundColor: "#FFF9D2" }} title="#FFF9D2 (Cream)" />
                    <span>Curated soft oceanic & sand tones</span>
                  </p>
                </div>
              </div>
            </Panel>
          )}

          {/* PRIVACY & SECURITY */}
          {activeTab === "privacy" && (
            <Panel title="Privacy, Telemetry & Security">
              <div className="space-y-5 max-w-xl">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold text-foreground">Local State & Diagnostics</Label>
                    <p className="text-xs text-muted-foreground">
                      All telemetry and sensor calculations remain stored securely in your browser's localStorage.
                    </p>
                  </div>
                  <Switch checked={true} disabled />
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold text-foreground">Two-Factor Authentication</Label>
                    <p className="text-xs text-muted-foreground">
                      Require one-time verification codes when logging in from new devices.
                    </p>
                  </div>
                  <Switch checked={false} onCheckedChange={() => toast.info("Two-factor authentication enabled")} />
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h4 className="text-xs font-semibold text-foreground">Data Management</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportData}>
                      <Download className="size-4 mr-1.5" />
                      Export Data (JSON)
                    </Button>
                    <Button variant="outline" size="sm" className="text-critical hover:bg-critical-soft" onClick={handleResetData}>
                      <RotateCcw className="size-4 mr-1.5" />
                      Reset Demo Data
                    </Button>
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {/* HELP & SUPPORT */}
          {activeTab === "support" && (
            <Panel title="Customer Support & Help Center">
              <div className="space-y-5">
                <div className="rounded-xl border bg-surface p-4">
                  <h4 className="text-sm font-bold text-foreground">Frequently Asked Questions</h4>
                  <div className="mt-3 space-y-3 text-xs">
                    <div>
                      <p className="font-semibold text-foreground">How does WaterWatch detect toilet leaks?</p>
                      <p className="text-muted-foreground mt-0.5">
                        WaterWatch flags continuous micro-draws (&lt; 1.0 L/min) during quiet hours when household activity is typically dormant.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">What if my flow sensor goes offline?</p>
                      <p className="text-muted-foreground mt-0.5">
                        The sensor will buffer telemetry for up to 48 hours locally and re-sync automatically once the Hub connection is re-established.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">How do I calibrate my ultrasonic tank sensor?</p>
                      <p className="text-muted-foreground mt-0.5">
                        In the "My Home" tab, adjust the tank capacity (litres) or click "Simulate Refill" to verify dynamic level readings.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border p-4 text-xs">
                    <p className="font-semibold text-foreground">Technical Support Helpline</p>
                    <p className="text-muted-foreground mt-1">Available Mon–Sat, 8:00 AM – 8:00 PM IST</p>
                    <p className="mt-2 text-primary font-bold">+91 22 4000 8899</p>
                  </div>
                  <div className="rounded-xl border p-4 text-xs">
                    <p className="font-semibold text-foreground">Email Assistance</p>
                    <p className="text-muted-foreground mt-1">Typical response within 2 hours</p>
                    <p className="mt-2 text-primary font-bold">support@waterwatch.io</p>
                  </div>
                </div>

                <div className="border-t pt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>WaterWatch Hub Firmware: <strong>v2.4.1</strong></span>
                  <span>Application Build: <strong>v1.2.0-prod</strong></span>
                </div>
              </div>
            </Panel>
          )}
        </main>
      </div>
    </div>
  );
}

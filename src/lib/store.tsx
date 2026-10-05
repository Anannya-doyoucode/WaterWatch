import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type OutletType = "Kitchen tap" | "Bathroom tap" | "Shower" | "Toilet" | "Washing machine" | "Other";
export const OUTLET_TYPES: OutletType[] = ["Kitchen tap", "Bathroom tap", "Shower", "Toilet", "Washing machine", "Other"];
export const TYPE_USAGE: Record<OutletType, number> = {
  "Kitchen tap": 45, "Bathroom tap": 30, Shower: 44, Toilet: 22, "Washing machine": 52, Other: 30,
};

export interface Outlet { id: string; name: string; type: OutletType; qty: number; usage: number; avg: number }
export interface Device {
  id: string; name: string; type: "Hub" | "Flow sensor" | "Tank sensor";
  status: "online" | "offline"; battery: number | null; lastSync: string; outletId: string | null;
}
export type Severity = "critical" | "warning" | "info";
export interface Alert {
  id: string; title: string; desc: string; severity: Severity;
  status: "unread" | "read" | "resolved"; outlet: string; time: string; link: string;
}
export type EventType = "leak" | "usage" | "device" | "resolution" | "system";
export interface HistoryEvent { id: string; time: string; title: string; detail: string; outlet: string; type: EventType }
export type IssueStatus = "active" | "monitoring" | "resolved" | "plumber" | "municipal" | "dismissed";

export interface Home {
  name: string; address: string; homeType: string; residents: number; floors: number;
  source: string; tankCapacity: number; tankLevel: number;
}
export interface Settings {
  leakAlerts: boolean; usageAlerts: boolean; deviceAlerts: boolean; nightMonitoring: boolean;
  sensitivity: "low" | "balanced" | "high"; theme: "light" | "dark" | "system";
}
export interface State {
  user: { name: string; email: string; password: string } | null;
  loggedIn: boolean; setupDone: boolean; home: Home; outlets: Outlet[]; devices: Device[];
  alerts: Alert[]; history: HistoryEvent[]; issue: { status: IssueStatus; savedWater: number; updatedAt: string | null };
  hasSeenInitialAlert: boolean; settings: Settings;
}

export const LEAK_OUTLET_ID = "bath1";
const uid = () => Math.random().toString(36).slice(2, 9);
const at = (dayOffset: number, h: number, m: number) => {
  const d = new Date(); d.setDate(d.getDate() + dayOffset); d.setHours(h, m, 0, 0); return d.toISOString();
};

export function defaultOutlets(): Outlet[] {
  return [
    { id: "kitchen", name: "Kitchen", type: "Kitchen tap", qty: 2, usage: 96, avg: 104 },
    { id: "bath1", name: "Bathroom 1", type: "Bathroom tap", qty: 2, usage: 62, avg: 48 },
    { id: "bath2", name: "Bathroom 2", type: "Bathroom tap", qty: 1, usage: 34, avg: 38 },
    { id: "showers", name: "Showers", type: "Shower", qty: 2, usage: 88, avg: 112 },
    { id: "toilets", name: "Toilets", type: "Toilet", qty: 3, usage: 66, avg: 74 },
    { id: "wm", name: "Washing Machine", type: "Washing machine", qty: 1, usage: 52, avg: 58 },
    { id: "garden", name: "Garden", type: "Other", qty: 1, usage: 30, avg: 78 },
  ];
}

function seed(): State {
  return {
    user: null, loggedIn: false, setupDone: false,
    home: {
      name: "Green Park Home", address: "24 Green Park Road, Mumbai, India", homeType: "Apartment",
      residents: 4, floors: 2, source: "Municipal + Tank", tankCapacity: 1000, tankLevel: 72,
    },
    outlets: defaultOutlets(),
    devices: [
      { id: "hub", name: "WaterWatch Hub", type: "Hub", status: "online", battery: null, lastSync: at(0, 8, 58), outletId: null },
      { id: "d-kitchen", name: "Kitchen Flow Sensor", type: "Flow sensor", status: "online", battery: 94, lastSync: at(0, 8, 58), outletId: "kitchen" },
      { id: "d-bath1", name: "Bathroom 1 Flow Sensor", type: "Flow sensor", status: "online", battery: 88, lastSync: at(0, 8, 57), outletId: "bath1" },
      { id: "d-bath2", name: "Bathroom 2 Flow Sensor", type: "Flow sensor", status: "online", battery: 91, lastSync: at(0, 8, 57), outletId: "bath2" },
      { id: "d-tank", name: "Tank Sensor", type: "Tank sensor", status: "online", battery: 83, lastSync: at(0, 8, 58), outletId: null },
      { id: "d-wm", name: "Washing Machine Sensor", type: "Flow sensor", status: "online", battery: 78, lastSync: at(0, 8, 51), outletId: "wm" },
    ],
    alerts: [
      { id: "a-leak", title: "Possible bathroom leakage", desc: "Continuous flow in Bathroom 1 between 1:40 AM and 4:15 AM. Est. loss 86 L.", severity: "critical", status: "unread", outlet: "Bathroom 1", time: at(0, 4, 16), link: "/ai-detection" },
      { id: "a-night", title: "Unusual overnight usage", desc: "Household flow detected during quiet hours (12 AM – 5 AM).", severity: "warning", status: "unread", outlet: "Bathroom 1", time: at(0, 2, 5), link: "/monitor" },
      { id: "a-batt", title: "Sensor battery low", desc: "Washing Machine Sensor battery at 78%. Plan a replacement within 3 weeks.", severity: "info", status: "read", outlet: "Washing Machine", time: at(-1, 18, 30), link: "/devices" },
      { id: "a-cons", title: "Consumption increased", desc: "Garden usage 34% higher than your 7‑day average.", severity: "warning", status: "read", outlet: "Garden", time: at(-2, 19, 10), link: "/analytics" },
      { id: "a-stop", title: "Abnormal flow stopped", desc: "Kitchen tap flow returned to normal after 18 minutes.", severity: "info", status: "resolved", outlet: "Kitchen", time: at(-4, 7, 42), link: "/history" },
    ],
    history: [
      { id: uid(), time: at(0, 4, 15), title: "Continuous flow ended", detail: "Bathroom 1 flow dropped to 0 L/min after 2 h 35 m.", outlet: "Bathroom 1", type: "leak" },
      { id: uid(), time: at(0, 1, 40), title: "Unusual bathroom flow detected", detail: "Steady 0.55 L/min flow during quiet hours.", outlet: "Bathroom 1", type: "leak" },
      { id: uid(), time: at(0, 7, 12), title: "Morning shower usage", detail: "38 L over 9 minutes.", outlet: "Showers", type: "usage" },
      { id: uid(), time: at(0, 7, 48), title: "Kitchen usage", detail: "22 L — cooking and dishes.", outlet: "Kitchen", type: "usage" },
      { id: uid(), time: at(-1, 21, 12), title: "Shower usage detected", detail: "41 L over 10 minutes.", outlet: "Showers", type: "usage" },
      { id: uid(), time: at(-1, 18, 30), title: "Battery warning", detail: "Washing Machine Sensor at 78%.", outlet: "Washing Machine", type: "device" },
      { id: uid(), time: at(-1, 10, 5), title: "Washing machine cycle", detail: "52 L, normal cycle.", outlet: "Washing Machine", type: "usage" },
      { id: uid(), time: at(-2, 19, 10), title: "Garden watering above average", detail: "64 L vs 48 L average.", outlet: "Garden", type: "usage" },
      { id: uid(), time: at(-3, 6, 0), title: "Tank refilled", detail: "Municipal supply filled tank from 31% to 96%.", outlet: "Tank", type: "system" },
      { id: uid(), time: at(-4, 7, 42), title: "Abnormal flow stopped", detail: "Kitchen tap returned to normal after 18 min.", outlet: "Kitchen", type: "resolution" },
      { id: uid(), time: at(-5, 12, 20), title: "Firmware updated", detail: "WaterWatch Hub updated to v2.4.1.", outlet: "Hub", type: "device" },
    ],
    issue: { status: "active", savedWater: 0, updatedAt: null },
    hasSeenInitialAlert: false,
    settings: { leakAlerts: true, usageAlerts: true, deviceAlerts: true, nightMonitoring: true, sensitivity: "balanced", theme: "light" },
  };
}

const KEY = "waterwatch:v1";
const SEEN_KEY = "hasSeenInitialAlert";

interface Ctx {
  state: State; hydrated: boolean;
  update: (fn: (s: State) => State) => void;
  addHistory: (e: Omit<HistoryEvent, "id" | "time">) => void;
  addAlert: (a: Omit<Alert, "id" | "time" | "status">) => void;
  setIssue: (status: IssueStatus) => void;
  markInitialAlertSeen: () => void;
  reset: () => void;
}
const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => seed());
  const [hydrated, setHydrated] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...seed(), ...JSON.parse(raw) });
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (first.current) { first.current = false; }
    localStorage.setItem(KEY, JSON.stringify(state));
    localStorage.setItem(SEEN_KEY, String(state.hasSeenInitialAlert));
  }, [state, hydrated]);

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const t = state.settings.theme;
      const dark = t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.classList.toggle("dark", dark);
    };
    apply();
  }, [state.settings.theme]);

  const ctx = useMemo<Ctx>(() => {
    const update = (fn: (s: State) => State) => setState(fn);
    return {
      state, hydrated, update,
      addHistory: (e) => update((s) => ({ ...s, history: [{ ...e, id: uid(), time: new Date().toISOString() }, ...s.history] })),
      addAlert: (a) => update((s) => ({ ...s, alerts: [{ ...a, id: uid(), time: new Date().toISOString(), status: "unread" }, ...s.alerts] })),
      setIssue: (status) => update((s) => {
        const resolved = status === "resolved" || status === "dismissed";
        const now = new Date().toISOString();
        const titles: Record<IssueStatus, string> = {
          active: "Issue reopened", monitoring: "Monitoring resolution started",
          resolved: "Bathroom leakage resolved", plumber: "Plumber visit requested",
          municipal: "Reported as municipal supply issue", dismissed: "Marked as not a problem",
        };
        const details: Record<IssueStatus, string> = {
          active: "", monitoring: "WaterWatch is watching Bathroom 1 for abnormal flow.",
          resolved: "Abnormal flow stopped. Estimated 86 L saved per night.",
          plumber: "Booking shared with a verified plumber nearby.",
          municipal: "Report submitted to BMC water department.",
          dismissed: "Detection feedback recorded to improve accuracy.",
        };
        return {
          ...s,
          issue: { status, savedWater: status === "resolved" ? 86 : s.issue.savedWater, updatedAt: now },
          alerts: s.alerts.map((a) => a.id === "a-leak" || a.id === "a-night"
            ? { ...a, status: resolved ? "resolved" : a.status === "unread" ? "read" : a.status } : a),
          history: [{ id: uid(), time: now, title: titles[status], detail: details[status], outlet: "Bathroom 1",
            type: resolved ? "resolution" : "system" }, ...s.history],
        };
      }),
      markInitialAlertSeen: () => update((s) => ({ ...s, hasSeenInitialAlert: true })),
      reset: () => { localStorage.removeItem(KEY); localStorage.removeItem(SEEN_KEY); setState(seed()); },
    };
  }, [state, hydrated]);

  return <StoreCtx.Provider value={ctx}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside StoreProvider");
  return c;
}

export function issueIsOpen(s: IssueStatus) { return s === "active" || s === "plumber" || s === "municipal" || s === "monitoring"; }

/** Derived household metrics — every screen reads from here so numbers stay coherent. */
export function useMetrics() {
  const { state } = useStore();
  return useMemo(() => {
    const open = issueIsOpen(state.issue.status);
    const offline = state.devices.filter((d) => d.status === "offline").length;
    const today = state.outlets.reduce((n, o) => n + o.usage, 0);
    const avgDaily = Math.round(state.outlets.reduce((n, o) => n + o.avg, 0));
    const outletCount = state.outlets.reduce((n, o) => n + o.qty, 0);
    const health = Math.max(40, (open ? 86 : 95) - offline * 4);
    const wastage = open ? 34 : 6;
    const tankLiters = Math.round((state.home.tankCapacity * state.home.tankLevel) / 100);
    const unread = state.alerts.filter((a) => a.status === "unread").length;
    return { open, offline, today, avgDaily, outletCount, health, wastage, tankLiters, unread };
  }, [state]);
}

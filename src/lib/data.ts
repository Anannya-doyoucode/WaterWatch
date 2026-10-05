// Deterministic mock telemetry so charts look realistic and stable across reloads.
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export type Range = "today" | "7d" | "30d" | "custom";

export interface Point { label: string; consumption: number; average: number; peak: number }

export function hourlyToday(total: number, leakOpen: boolean): Point[] {
  // shape: morning + evening peaks, overnight leak 1–4 AM
  const shape = [0.2, 0.3, 0.3, 0.3, 0.3, 1.2, 4.5, 9.5, 8.2, 5, 3.5, 3, 3.8, 3, 2.4, 2.6, 3.4, 4.6, 6.8, 9.2, 8.6, 5.2, 2.6, 1];
  const leak = [0, 9, 34, 33, 10];
  const sum = shape.reduce((a, b) => a + b, 0);
  const now = new Date().getHours();
  return shape.map((v, h) => {
    const base = (v / sum) * (total - (leakOpen ? 0 : 0) - 86);
    const c = Math.round(h <= now ? base + (leak[h] ?? 0) : 0);
    return {
      label: `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "a" : "p"}`,
      consumption: c,
      average: Math.round((v / sum) * 512),
      peak: Math.round((v / sum) * 512 * 1.35),
    };
  });
}

export function daily(days: number, avg: number, todayTotal: number, offset = 0): Point[] {
  const out: Point[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i - offset);
    const wk = d.getDay() === 0 || d.getDay() === 6 ? 1.12 : 1;
    const v = i === 0 && offset === 0 ? todayTotal : Math.round(avg * wk * (0.82 + rand(d.getDate() + d.getMonth() * 31) * 0.3));
    out.push({
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      consumption: v, average: avg, peak: Math.round(v * 0.18 + 30),
    });
  }
  return out;
}

export function seriesFor(range: Range, avg: number, today: number, leakOpen: boolean, custom = 14) {
  if (range === "today") return hourlyToday(today, leakOpen);
  if (range === "7d") return daily(7, avg, today);
  if (range === "30d") return daily(30, avg, today);
  return daily(custom, avg, today);
}

export const hourlyPattern = [
  { slot: "12–5 AM", liters: 28 }, { slot: "5–9 AM", liters: 164 }, { slot: "9 AM–1 PM", liters: 86 },
  { slot: "1–5 PM", liters: 62 }, { slot: "5–7 PM", liters: 58 }, { slot: "7–9 PM", liters: 124 }, { slot: "9 PM–12", liters: 40 },
];

export function tankTrend(level: number) {
  const pts = [96, 92, 85, 79, 74, 63, 58, 54, 51, 94, 90, 84, 80, 76, level];
  return pts.map((v, i) => ({ t: `${(i * 2) % 24}:00`, level: v }));
}

export function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}
export function fmtDay(iso: string) {
  const d = new Date(iso); const t = new Date();
  const diff = Math.round((new Date(t.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
export function ago(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

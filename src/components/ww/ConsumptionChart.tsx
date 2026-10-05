import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ComposedChart, Bar } from "recharts";
import { Segmented } from "./primitives";
import { seriesFor, type Range } from "@/lib/data";
import { useMetrics } from "@/lib/store";

export const RANGE_OPTS: { value: Range; label: string }[] = [
  { value: "today", label: "Today" }, { value: "7d", label: "7 Days" }, { value: "30d", label: "30 Days" }, { value: "custom", label: "Custom" },
];

export function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-pop">
      <div className="mb-1 font-semibold">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}</span><span className="num ml-auto font-semibold">{p.value} L</span></div>
      ))}
    </div>
  );
}

export function useRangeSeries(range: Range, customDays: number) {
  const m = useMetrics();
  return seriesFor(range, m.avgDaily, m.today, m.open, customDays);
}

export function ConsumptionChart({ height = 260 }: { height?: number }) {
  const [range, setRange] = useState<Range>("today");
  const [days, setDays] = useState(14);
  const [show, setShow] = useState({ consumption: true, average: true, peak: false });
  const data = useRangeSeries(range, days);
  const Chart = range === "today" ? AreaChart : ComposedChart;
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented label="Range" value={range} onChange={setRange} options={RANGE_OPTS} />
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {range === "custom" && (
            <label className="flex items-center gap-2 text-muted-foreground">Last
              <select className="rounded-md border bg-card px-2 py-1 text-foreground" value={days} onChange={(e) => setDays(+e.target.value)}>
                {[10, 14, 21, 45, 60].map((d) => <option key={d} value={d}>{d} days</option>)}
              </select>
            </label>
          )}
          {(["consumption", "average", "peak"] as const).map((k) => (
            <label key={k} className="flex cursor-pointer items-center gap-1.5 capitalize">
              <input type="checkbox" className="accent-[var(--primary)]" checked={show[k]} onChange={(e) => setShow({ ...show, [k]: e.target.checked })} />
              {k === "peak" ? "Peak usage" : k}
            </label>
          ))}
        </div>
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={data} margin={{ left: -18, right: 4, top: 4 }}>
            <defs>
              <linearGradient id="fillC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} interval="preserveStartEnd" minTickGap={16} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
            {range === "today" ? (
              show.consumption && <Area type="monotone" dataKey="consumption" name="Consumption" stroke="var(--chart-1)" strokeWidth={2} fill="url(#fillC)" />
            ) : (
              show.consumption && <Bar dataKey="consumption" name="Consumption" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            )}
            {show.average && <Line type="monotone" dataKey="average" name="Average" stroke="var(--chart-1)" strokeDasharray="4 4" dot={false} strokeWidth={1.5} />}
            {show.peak && <Line type="monotone" dataKey="peak" name="Peak usage" stroke="var(--chart-3)" dot={false} strokeWidth={2} />}
          </Chart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

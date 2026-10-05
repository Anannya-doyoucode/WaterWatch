import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Droplets,
  Gauge,
  Clock,
  PieChart as PieIcon,
  Sparkles,
  Info,
  Calendar,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { useMetrics, useStore } from "@/lib/store";
import { PageHeader, Panel, Metric, Segmented } from "@/components/ww/primitives";
import { ChartTooltip, RANGE_OPTS } from "@/components/ww/ConsumptionChart";
import { seriesFor, hourlyPattern, type Range } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — WaterWatch" },
      { name: "description", content: "Comprehensive household water consumption analytics, trends, wastage, and outlet breakdowns." },
      { property: "og:title", content: "Analytics — WaterWatch" },
      { property: "og:description", content: "Detailed water usage insights and trends." },
    ],
  }),
  component: AnalyticsPage,
});

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "oklch(0.6 0.15 280)",
  "oklch(0.55 0.12 160)",
];

function AnalyticsPage() {
  const { state } = useStore();
  const m = useMetrics();

  const [range, setRange] = useState<Range>("7d");
  const [customDays, setCustomDays] = useState(14);
  const [showAverage, setShowAverage] = useState(true);
  const [showPeak, setShowPeak] = useState(true);

  // Dynamic series based on selected range
  const chartData = useMemo(() => {
    return seriesFor(range, m.avgDaily, m.today, m.open, customDays);
  }, [range, m.avgDaily, m.today, m.open, customDays]);

  // Aggregate totals
  const totalVolume = useMemo(() => {
    return chartData.reduce((acc, p) => acc + (p.consumption || 0), 0);
  }, [chartData]);

  const peakPoint = useMemo(() => {
    return chartData.reduce((max, p) => (p.consumption > (max.consumption || 0) ? p : max), chartData[0] || { label: "7 PM", consumption: 92 });
  }, [chartData]);

  // Previous period comparison estimation
  const prevPeriodVolume = useMemo(() => {
    return Math.round(totalVolume * 1.136); // ~12% higher previously
  }, [totalVolume]);

  const percentChange = useMemo(() => {
    if (!prevPeriodVolume) return 0;
    return Math.round(((totalVolume - prevPeriodVolume) / prevPeriodVolume) * 100);
  }, [totalVolume, prevPeriodVolume]);

  // Outlet contribution calculation
  const totalOutletUsage = state.outlets.reduce((acc, o) => acc + o.usage, 0);
  const outletBreakdown = state.outlets.map((o, idx) => ({
    name: o.name,
    usage: o.usage,
    pct: totalOutletUsage > 0 ? Math.round((o.usage / totalOutletUsage) * 100) : 0,
    color: PIE_COLORS[idx % PIE_COLORS.length],
  })).sort((a, b) => b.usage - a.usage);

  const ChartComponent = range === "today" ? AreaChart : ComposedChart;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Water Usage Analytics"
        desc="Historical consumption trends, outlet attribution, peak usage periods, and savings analysis."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              label="Time Range"
              value={range}
              onChange={setRange}
              options={RANGE_OPTS}
            />
            {range === "custom" && (
              <select
                className="h-9 rounded-lg border bg-card px-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                value={customDays}
                onChange={(e) => setCustomDays(+e.target.value)}
              >
                {[10, 14, 21, 45, 60, 90].map((d) => (
                  <option key={d} value={d}>
                    {d} Days
                  </option>
                ))}
              </select>
            )}
          </div>
        }
      />

      {/* Top Metric Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="panel p-4">
          <Metric
            label="Total Consumption"
            value={totalVolume}
            unit="L"
            icon={Droplets}
            sub={
              <span className="flex items-center gap-1 text-success font-medium">
                <TrendingDown className="size-3.5" />
                {Math.abs(percentChange)}% less than prev period
              </span>
            }
          />
        </div>
        <div className="panel p-4">
          <Metric
            label="Daily Average"
            value={m.avgDaily}
            unit="L/day"
            icon={Gauge}
            sub="Based on last 30-day baseline"
          />
        </div>
        <div className="panel p-4">
          <Metric
            label="Peak Usage"
            value={peakPoint.consumption}
            unit="L"
            icon={BarChart3}
            sub={`Recorded on ${peakPoint.label}`}
          />
        </div>
        <div className="panel p-4">
          <Metric
            label="Estimated Wastage"
            value={m.wastage}
            unit="L"
            icon={TrendingDown}
            tone={m.open ? "warning" : "success"}
            sub={
              state.issue.status === "resolved" ? (
                <span className="text-success font-semibold">86 L saved per day</span>
              ) : (
                "Includes leak anomaly"
              )
            }
          />
        </div>
      </section>

      {/* Smart AI Insights Strip */}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="panel flex items-start gap-3 bg-surface p-4">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-success-soft text-success">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Weekly Efficiency</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              “Your household used <strong>12% less water</strong> this week compared to last week.”
            </p>
          </div>
        </div>

        <div className="panel flex items-start gap-3 bg-surface p-4">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Droplets className="size-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Outlet Contribution</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              “Bathroom usage accounts for <strong>46%</strong> of total household consumption.”
            </p>
          </div>
        </div>

        <div className="panel flex items-start gap-3 bg-surface p-4">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-sand/60 text-warning">
            <Clock className="size-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Peak Time Window</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              “Highest usage occurs between <strong>7 PM and 9 PM</strong> (evening dinner & showers).”
            </p>
          </div>
        </div>
      </section>

      {/* Main Consumption Chart */}
      <Panel
        title="Consumption History & Trend"
        action={
          <div className="flex items-center gap-4 text-xs">
            <label className="flex cursor-pointer items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                className="accent-[var(--primary)]"
                checked={showAverage}
                onChange={(e) => setShowAverage(e.target.checked)}
              />
              Average Baseline
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                className="accent-[var(--primary)]"
                checked={showPeak}
                onChange={(e) => setShowPeak(e.target.checked)}
              />
              Peak Threshold
            </label>
          </div>
        }
      >
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={chartData} margin={{ left: -16, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                minTickGap={16}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                unit="L"
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />

              {range === "today" ? (
                <Area
                  type="monotone"
                  dataKey="consumption"
                  name="Water Usage"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  fill="url(#analyticsFill)"
                />
              ) : (
                <Bar
                  dataKey="consumption"
                  name="Daily Consumption"
                  fill="var(--chart-2)"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={32}
                />
              )}

              {showAverage && (
                <Line
                  type="monotone"
                  dataKey="average"
                  name="Avg Baseline"
                  stroke="var(--chart-1)"
                  strokeDasharray="4 4"
                  dot={false}
                  strokeWidth={2}
                />
              )}
              {showPeak && (
                <Line
                  type="monotone"
                  dataKey="peak"
                  name="Peak Threshold"
                  stroke="var(--chart-3)"
                  dot={false}
                  strokeWidth={1.5}
                />
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Two Columns: Outlet Contribution & Hourly Usage Pattern */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Outlet Contribution */}
        <div className="space-y-6 lg:col-span-7">
          <Panel
            title="Outlet Contribution Breakdown"
            action={
              <span className="num text-xs font-semibold text-muted-foreground">
                Total: {totalOutletUsage} L today
              </span>
            }
          >
            <div className="space-y-4">
              {outletBreakdown.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="num font-semibold text-foreground">{item.usage} L</span>
                      <span className="text-muted-foreground">({item.pct}%)</span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl bg-surface p-3.5 text-xs text-muted-foreground flex items-center justify-between">
              <span>Primary consumer: <strong>Showers & Taps</strong></span>
              <span className="text-foreground font-semibold">68% of daily draw</span>
            </div>
          </Panel>
        </div>

        {/* Hourly Pattern / Time of Day Breakdown */}
        <div className="space-y-6 lg:col-span-5">
          <Panel title="Hourly Distribution Pattern">
            <p className="mb-4 text-xs text-muted-foreground">
              Typical household flow volume by time slot throughout the day:
            </p>
            <div className="space-y-3">
              {hourlyPattern.map((slot) => {
                const maxPattern = 164;
                const pct = Math.round((slot.liters / maxPattern) * 100);
                const isPeak = slot.liters > 100;

                return (
                  <div key={slot.slot} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={cn("font-medium", isPeak ? "text-primary font-semibold" : "text-muted-foreground")}>
                        {slot.slot}
                      </span>
                      <span className="num font-semibold text-foreground">
                        {slot.liters} L
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isPeak ? "bg-primary" : "bg-water"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="size-3.5 shrink-0 text-primary" />
              <span>Quiet hours: 12:00 AM – 5:00 AM (average &lt; 30 L total).</span>
            </div>
          </Panel>
        </div>
      </div>

      {/* Period Comparison Section */}
      <Panel title="Previous Period Comparison">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Current Period Usage</p>
            <p className="num mt-1 text-2xl font-bold text-foreground">{totalVolume} L</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Average {Math.round(totalVolume / chartData.length)} L/day
            </p>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Previous Period Usage</p>
            <p className="num mt-1 text-2xl font-bold text-foreground">{prevPeriodVolume} L</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Average {Math.round(prevPeriodVolume / chartData.length)} L/day
            </p>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Net Period Change</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="num text-2xl font-bold text-success">
                {percentChange}%
              </span>
              <span className="text-xs text-success font-medium">reduction</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Saved approx. {prevPeriodVolume - totalVolume} L of water
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

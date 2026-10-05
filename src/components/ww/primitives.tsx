import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, WifiOff, Droplets, CircleDot, type LucideIcon } from "lucide-react";
import type { FlowState } from "@/lib/live";

type Tone = "success" | "warning" | "critical" | "info" | "neutral";
const toneCls: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  critical: "bg-critical-soft text-critical",
  info: "bg-secondary text-secondary-foreground",
  neutral: "bg-muted text-muted-foreground",
};
const toneIcon: Record<Tone, LucideIcon> = {
  success: CheckCircle2, warning: AlertTriangle, critical: AlertOctagon, info: Info, neutral: CircleDot,
};

export function StatusBadge({ tone, children, icon = true, className }: { tone: Tone; children: ReactNode; icon?: boolean; className?: string }) {
  const I = toneIcon[tone];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", toneCls[tone], className)}>
      {icon && <I className="size-3.5" aria-hidden />}{children}
    </span>
  );
}

export const flowTone = (s: FlowState): Tone =>
  s === "Active" ? "info" : s === "Continuous flow" || s === "Unusual flow" ? "critical" : s === "Low flow" ? "warning" : s === "No signal" ? "neutral" : "neutral";

export function FlowBadge({ state }: { state: FlowState }) {
  const tone = flowTone(state);
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold", toneCls[tone])}>
      {state === "No signal" ? <WifiOff className="size-3.5" /> :
        <span className="relative flex size-2">
          {(state === "Active" || state === "Continuous flow") && <span className="absolute inset-0 animate-ripple rounded-full bg-current" />}
          <span className="relative size-2 rounded-full bg-current" />
        </span>}
      {state}
    </span>
  );
}

export function PageHeader({ title, desc, actions }: { title: string; desc?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{title}</h1>
        {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className, bodyClass }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClass?: string }) {
  return (
    <section className={cn("panel min-w-0", className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 px-5 pt-4">
          <h2 className="truncate text-sm font-semibold">{title}</h2>
          {action}
        </div>
      )}
      <div className={cn("p-5", title && "pt-3", bodyClass)}>{children}</div>
    </section>
  );
}

export function Metric({ label, value, unit, sub, icon: I = Droplets, tone }: { label: string; value: ReactNode; unit?: string; sub?: ReactNode; icon?: LucideIcon; tone?: Tone }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <I className={cn("size-4 shrink-0", tone === "critical" ? "text-critical" : tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-primary")} />
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="num text-2xl font-semibold sm:text-[28px]">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-lg bg-muted p-1">
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)}
          className={cn("min-h-8 rounded-md px-3 text-xs font-semibold transition-colors",
            value === o.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Bar({ value, max, tone = "primary" }: { value: number; max: number; tone?: "primary" | "critical" | "water" }) {
  const pct = Math.min(100, (value / Math.max(1, max)) * 100);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full transition-all duration-700", tone === "critical" ? "bg-critical" : tone === "water" ? "bg-water" : "bg-primary")} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Empty({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center">
      <p className="text-sm font-semibold">{title}</p>
      {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
    </div>
  );
}

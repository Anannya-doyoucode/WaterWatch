import { cn } from "@/lib/utils";

export function TankVisual({ level, capacity, className }: { level: number; capacity: number; className?: string }) {
  const liters = Math.round((capacity * level) / 100);
  return (
    <div className={cn("flex items-center gap-5", className)}>
      <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-sky bg-surface" role="img" aria-label={`Tank ${level}% full`}>
        <div className="absolute inset-x-0 bottom-0 bg-water/70 transition-all duration-1000" style={{ height: `${level}%` }}>
          <svg className="absolute -top-2 left-0 h-3 w-[200%] animate-wave text-water/70" viewBox="0 0 200 10" preserveAspectRatio="none">
            <path d="M0 5 Q 12.5 0 25 5 T 50 5 T 75 5 T 100 5 T 125 5 T 150 5 T 175 5 T 200 5 V10 H0Z" fill="currentColor" />
          </svg>
        </div>
        {[25, 50, 75].map((t) => (
          <div key={t} className="absolute right-0 h-px w-3 bg-foreground/20" style={{ bottom: `${t}%` }} />
        ))}
        <div className="absolute inset-0 grid place-items-center">
          <span className="num text-xl font-semibold">{level}%</span>
        </div>
      </div>
      <dl className="grid min-w-0 gap-2 text-sm">
        <div><dt className="text-xs text-muted-foreground">Remaining</dt><dd className="num font-semibold">{liters} L</dd></div>
        <div><dt className="text-xs text-muted-foreground">Capacity</dt><dd className="num font-semibold">{capacity} L</dd></div>
        <div><dt className="text-xs text-muted-foreground">Lasts approx.</dt><dd className="num font-semibold">{(liters / 512).toFixed(1)} days</dd></div>
      </dl>
    </div>
  );
}

/** Small animated pipe showing flow intensity. */
export function FlowLine({ flow, alert }: { flow: number; alert?: boolean }) {
  const active = flow > 0;
  return (
    <svg viewBox="0 0 120 8" className="h-2 w-full" aria-hidden>
      <line x1="0" y1="4" x2="120" y2="4" className="stroke-muted" strokeWidth="6" strokeLinecap="round" />
      {active && (
        <line x1="0" y1="4" x2="120" y2="4" strokeWidth="6" strokeLinecap="round" strokeDasharray="6 6"
          className={cn("animate-flow", alert ? "stroke-critical" : "stroke-water")}
          style={{ animationDuration: `${Math.max(0.4, 2.2 - flow / 2)}s` }} />
      )}
    </svg>
  );
}

export function HealthRing({ score }: { score: number }) {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <div className="relative size-24 shrink-0" role="img" aria-label={`Health score ${score} of 100`}>
      <svg viewBox="0 0 80 80" className="size-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" className="stroke-muted" strokeWidth="7" />
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" strokeLinecap="round"
          className={cn("transition-all duration-1000", score >= 90 ? "stroke-success" : score >= 75 ? "stroke-primary" : "stroke-warning")}
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div><div className="num text-2xl font-semibold leading-none">{score}</div><div className="text-[10px] text-muted-foreground">/ 100</div></div>
      </div>
    </div>
  );
}

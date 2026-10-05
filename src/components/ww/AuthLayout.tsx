import type { ReactNode } from "react";
import { Logo } from "./AppShell";
import { ShieldCheck, Activity, Bell } from "lucide-react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</div>
        <p className="text-xs text-muted-foreground">© 2026 WaterWatch Labs · Mumbai</p>
      </div>
      <div className="relative hidden overflow-hidden bg-sky/50 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,var(--cream),transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-center p-14">
          <p className="max-w-md text-3xl font-bold leading-tight tracking-tight">Know where every litre goes — and catch leaks while you sleep.</p>
          <div className="mt-10 max-w-sm space-y-3">
            {[
              { i: Activity, t: "Live flow across every outlet", d: "6.2 L/min · 3 outlets active" },
              { i: Bell, t: "Explainable leak detection", d: "Overnight flow flagged with 92% confidence" },
              { i: ShieldCheck, t: "Works with your existing plumbing", d: "Clip-on sensors, no pipe cutting" },
            ].map(({ i: I, t, d }) => (
              <div key={t} className="panel flex items-center gap-3 p-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary"><I className="size-5" /></div>
                <div className="min-w-0"><p className="text-sm font-semibold">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

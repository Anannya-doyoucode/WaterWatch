import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ww/AppShell";
import { HomeFields, OutletEditor } from "@/components/ww/HomeForms";
import { Loading } from "@/components/ww/Loading";
import { useStore, type Home, type Outlet } from "@/lib/store";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Set up your home — WaterWatch" },
      { name: "description", content: "Tell WaterWatch about your home, tank and water outlets." },
      { property: "og:title", content: "Set up your home — WaterWatch" },
      { property: "og:description", content: "Configure your home for water monitoring." },
    ],
  }),
  component: Setup,
});

const STEPS = ["Your home", "Water outlets", "Review"];

function Setup() {
  const { state, hydrated, update } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [home, setHome] = useState<Home>(state.home);
  const [outlets, setOutlets] = useState<Outlet[]>(state.outlets);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (hydrated) { setHome(state.home); setOutlets(state.outlets); } }, [hydrated]); // eslint-disable-line
  useEffect(() => { if (hydrated && !state.loggedIn) navigate({ to: "/signup" }); }, [hydrated, state.loggedIn, navigate]);
  if (!hydrated) return <Loading />;

  const finish = () => {
    setBusy(true);
    setTimeout(() => {
      update((s) => ({ ...s, home, outlets, setupDone: true }));
      navigate({ to: "/dashboard" });
    }, 900);
  };
  const total = outlets.reduce((n, o) => n + o.qty, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card"><div className="mx-auto flex h-16 max-w-3xl items-center px-5"><Logo /></div></header>
      <main className="mx-auto max-w-3xl px-5 py-8">
        <p className="text-sm font-semibold text-primary">Hi {state.user?.name.split(" ")[0]}, let's set up your home</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{STEPS[step]}</h1>
        <ol className="mt-6 flex gap-2" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s} className="flex-1">
              <div className={cn("h-1.5 rounded-full", i <= step ? "bg-primary" : "bg-muted")} />
              <span className={cn("mt-2 block text-xs", i === step ? "font-semibold" : "text-muted-foreground")}>{i + 1}. {s}</span>
            </li>
          ))}
        </ol>
        <div className="panel mt-6 p-5 sm:p-6">
          {step === 0 && <HomeFields home={home} onChange={setHome} />}
          {step === 1 && (
            <>
              <p className="mb-4 text-sm text-muted-foreground">Group outlets by where they are. WaterWatch uses this to attribute usage and spot unusual flow.</p>
              <OutletEditor outlets={outlets} onChange={setOutlets} />
            </>
          )}
          {step === 2 && (
            <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              {[["Home", home.name], ["Address", home.address], ["Type", home.homeType], ["Residents", home.residents], ["Floors", home.floors],
                ["Water source", home.source], ["Tank capacity", `${home.tankCapacity} L`], ["Water outlets", total]].map(([k, v]) => (
                <div key={String(k)}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-semibold">{v}</dd></div>
              ))}
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Outlets</dt>
                <dd className="mt-2 flex flex-wrap gap-2">{outlets.map((o) => <span key={o.id} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">{o.name} · {o.qty}</span>)}</dd>
              </div>
            </dl>
          )}
        </div>
        <div className="mt-6 flex justify-between gap-3">
          <Button variant="ghost" className="h-11" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
          {step < 2 ? <Button className="h-11 min-w-32" disabled={!home.name.trim()} onClick={() => setStep(step + 1)}>Continue</Button>
            : <Button className="h-11 min-w-40" onClick={finish} disabled={busy}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}{busy ? "Connecting sensors…" : "Finish setup"}</Button>}
        </div>
      </main>
    </div>
  );
}

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { OUTLET_TYPES, TYPE_USAGE, type Home, type Outlet, type OutletType } from "@/lib/store";

const sel = "h-11 w-full rounded-md border border-input bg-card px-3 text-sm";

export function HomeFields({ home, onChange }: { home: Home; onChange: (h: Home) => void }) {
  const set = <K extends keyof Home>(k: K, v: Home[K]) => onChange({ ...home, [k]: v });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="hn">Home name</Label>
        <Input id="hn" className="h-11" value={home.name} onChange={(e) => set("name", e.target.value)} /></div>
      <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="ad">Address</Label>
        <Input id="ad" className="h-11" value={home.address} onChange={(e) => set("address", e.target.value)} /></div>
      <div className="space-y-1.5"><Label htmlFor="ht">Home type</Label>
        <select id="ht" className={sel} value={home.homeType} onChange={(e) => set("homeType", e.target.value)}>
          {["Apartment", "Independent house", "Villa", "Row house"].map((o) => <option key={o}>{o}</option>)}
        </select></div>
      <div className="space-y-1.5"><Label htmlFor="ws">Water source</Label>
        <select id="ws" className={sel} value={home.source} onChange={(e) => set("source", e.target.value)}>
          {["Municipal + Tank", "Municipal only", "Borewell + Tank", "Tanker + Tank"].map((o) => <option key={o}>{o}</option>)}
        </select></div>
      <NumField id="res" label="Residents" value={home.residents} min={1} onChange={(v) => set("residents", v)} />
      <NumField id="fl" label="Floors" value={home.floors} min={1} onChange={(v) => set("floors", v)} />
      <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="tc">Tank capacity (litres)</Label>
        <select id="tc" className={sel} value={home.tankCapacity} onChange={(e) => set("tankCapacity", +e.target.value)}>
          {[500, 750, 1000, 1500, 2000, 3000].map((o) => <option key={o} value={o}>{o} L</option>)}
        </select></div>
    </div>
  );
}

function NumField({ id, label, value, min, onChange }: { id: string; label: string; value: number; min: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5"><Label htmlFor={id}>{label}</Label>
      <Stepper id={id} value={value} min={min} onChange={onChange} /></div>
  );
}

export function Stepper({ id, value, min = 0, onChange, label }: { id?: string; value: number; min?: number; onChange: (v: number) => void; label?: string }) {
  return (
    <div className="flex h-11 items-center rounded-md border border-input bg-card">
      <button type="button" aria-label={`Decrease ${label ?? ""}`} className="grid h-full w-11 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-40" disabled={value <= min} onClick={() => onChange(value - 1)}><Minus className="size-4" /></button>
      <input id={id} aria-label={label} className="num w-full min-w-0 bg-transparent text-center text-sm font-semibold outline-none" inputMode="numeric" value={value}
        onChange={(e) => { const n = parseInt(e.target.value || "0", 10); if (!isNaN(n)) onChange(Math.max(min, n)); }} />
      <button type="button" aria-label={`Increase ${label ?? ""}`} className="grid h-full w-11 place-items-center text-muted-foreground hover:text-foreground" onClick={() => onChange(value + 1)}><Plus className="size-4" /></button>
    </div>
  );
}

export function OutletEditor({ outlets, onChange }: { outlets: Outlet[]; onChange: (o: Outlet[]) => void }) {
  const total = outlets.reduce((n, o) => n + o.qty, 0);
  const patch = (id: string, p: Partial<Outlet>) => onChange(outlets.map((o) => {
    if (o.id !== id) return o;
    const n = { ...o, ...p };
    if (p.qty !== undefined || p.type) {
      const per = o.qty > 0 && !p.type ? o.usage / o.qty : TYPE_USAGE[n.type];
      n.usage = Math.round(per * n.qty); n.avg = Math.round((o.avg / Math.max(1, o.qty)) * n.qty) || n.usage;
    }
    return n;
  }));
  const add = () => onChange([...outlets, { id: Math.random().toString(36).slice(2, 8), name: `New outlet ${outlets.length + 1}`, type: "Other", qty: 1, usage: TYPE_USAGE.Other, avg: TYPE_USAGE.Other }]);
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Total outlets: <span className="num font-semibold text-foreground">{total}</span></p>
        <Button type="button" variant="outline" size="sm" onClick={add}><Plus className="size-4" />Add outlet</Button>
      </div>
      <ul className="divide-y rounded-xl border">
        {outlets.map((o) => (
          <li key={o.id} className="grid gap-2 p-3 sm:grid-cols-[1.3fr_1fr_140px_auto] sm:items-center">
            <Input aria-label="Outlet name" className="h-11" value={o.name} onChange={(e) => patch(o.id, { name: e.target.value })} />
            <select aria-label="Outlet type" className={sel} value={o.type} onChange={(e) => patch(o.id, { type: e.target.value as OutletType })}>
              {OUTLET_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <div className="grid grid-cols-[1fr_auto] gap-2 sm:contents">
              <Stepper label={`${o.name} quantity`} value={o.qty} min={1} onChange={(v) => patch(o.id, { qty: v })} />
              <Button type="button" variant="ghost" size="icon" className="size-11 text-muted-foreground hover:text-critical" aria-label={`Remove ${o.name}`} disabled={outlets.length <= 1}
                onClick={() => onChange(outlets.filter((x) => x.id !== o.id))}><Trash2 className="size-4" /></Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

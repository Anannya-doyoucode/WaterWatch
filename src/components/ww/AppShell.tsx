import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Activity, BarChart3, ScanSearch, Bell, History, Home, Cpu, Settings, MoreHorizontal,
  MapPin, LogOut, User, Droplet, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMetrics, useStore } from "@/lib/store";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResponsiveModal } from "./ResponsiveModal";

export const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/monitor", label: "Monitor", icon: Activity },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/ai-detection", label: "AI Detection", icon: ScanSearch },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/history", label: "History", icon: History },
  { to: "/home", label: "My Home", icon: Home },
  { to: "/devices", label: "Devices", icon: Cpu },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const MOBILE = ["/dashboard", "/monitor", "/alerts", "/analytics", "/home"];

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Droplet className="size-5" /></div>
      {!compact && <span className="text-lg font-bold tracking-tight">WaterWatch</span>}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { state, update } = useStore();
  const m = useMetrics();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [more, setMore] = useState(false);
  const logout = () => { update((s) => ({ ...s, loggedIn: false })); navigate({ to: "/login" }); };
  const first = state.user?.name.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar: icon-only on tablet, full on desktop (collapsible) */}
      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden flex-col border-r bg-sidebar md:flex transition-[width]",
        collapsed ? "w-[76px]" : "w-[76px] lg:w-64")}>
        <div className="flex h-16 items-center px-5">
          <span className={cn(collapsed ? "" : "lg:hidden")}><Logo compact /></span>
          <span className={cn("hidden", !collapsed && "lg:block")}><Logo /></span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Main">
          {NAV.map(({ to, label, icon: I }) => {
            const active = path.startsWith(to);
            return (
              <Link key={to} to={to} title={label}
                className={cn("flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                  active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/75 hover:bg-muted hover:text-sidebar-foreground")}>
                <I className="size-[18px] shrink-0" />
                <span className={cn("hidden truncate", !collapsed && "lg:inline")}>{label}</span>
                {to === "/alerts" && m.unread > 0 && (
                  <span className={cn("ml-auto hidden rounded-full bg-critical px-1.5 text-[11px] font-bold text-destructive-foreground", !collapsed && "lg:inline")}>{m.unread}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <div className={cn("mb-2 hidden rounded-xl bg-cream p-3 text-xs", !collapsed && "lg:block")}>
            <div className="flex items-center gap-2 font-semibold"><span className="size-2 rounded-full bg-success" />Hub online</div>
            <p className="mt-1 text-muted-foreground">{state.devices.length - m.offline} of {state.devices.length} devices connected</p>
          </div>
          <button onClick={() => setCollapsed(!collapsed)} className="hidden h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground hover:bg-muted lg:flex" aria-label="Toggle sidebar">
            {collapsed ? <ChevronsRight className="size-[18px]" /> : <><ChevronsLeft className="size-[18px]" />Collapse</>}
          </button>
        </div>
      </aside>

      <div className={cn("md:pl-[76px]", !collapsed && "lg:pl-64")}>
        <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
          <div className="mx-auto grid h-16 max-w-[1400px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="md:hidden"><Logo compact /></span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{greeting()}, {first}</p>
                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground"><MapPin className="size-3 shrink-0" />{state.home.name} · {state.home.address.split(",").slice(-2).join(",").trim()}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link to="/alerts" className="relative grid size-10 place-items-center rounded-full hover:bg-muted" aria-label={`Alerts, ${m.unread} unread`}>
                <Bell className="size-5" />
                {m.unread > 0 && <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-critical text-[10px] font-bold text-destructive-foreground">{m.unread}</span>}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="grid size-10 place-items-center rounded-full bg-sand text-sm font-bold" aria-label="Profile menu">
                  {first[0]?.toUpperCase()}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="font-semibold">{state.user?.name}</div>
                    <div className="truncate text-xs font-normal text-muted-foreground">{state.user?.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}><User className="size-4" />Account</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/home" })}><Home className="size-4" />My Home</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}><LogOut className="size-4" />Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] px-4 pb-28 pt-6 sm:px-6 md:pb-12">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Mobile">
        {NAV.filter((n) => MOBILE.includes(n.to)).map(({ to, label, icon: I }) => {
          const active = path.startsWith(to);
          return (
            <Link key={to} to={to} className={cn("relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium", active ? "text-primary" : "text-muted-foreground")}>
              <I className="size-5" />{label === "My Home" ? "Home" : label}
              {to === "/alerts" && m.unread > 0 && <span className="absolute right-[22%] top-2 size-2 rounded-full bg-critical" />}
            </Link>
          );
        })}
        <button onClick={() => setMore(true)} className="flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground">
          <MoreHorizontal className="size-5" />More
        </button>
      </nav>
      <ResponsiveModal open={more} onOpenChange={setMore} title="More">
        <div className="grid grid-cols-2 gap-2">
          {NAV.filter((n) => !MOBILE.includes(n.to)).map(({ to, label, icon: I }) => (
            <Link key={to} to={to} onClick={() => setMore(false)} className="flex h-14 items-center gap-3 rounded-xl border px-4 text-sm font-medium hover:bg-muted">
              <I className="size-5 text-primary" />{label}
            </Link>
          ))}
          <button onClick={logout} className="flex h-14 items-center gap-3 rounded-xl border px-4 text-sm font-medium hover:bg-muted"><LogOut className="size-5 text-primary" />Log out</button>
        </div>
      </ResponsiveModal>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/ww/AppShell";
import { Droplet } from "lucide-react";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

export function Loading() {
  return (
    <div className="grid min-h-screen place-items-center">
      <Droplet className="size-8 animate-pulse text-primary" aria-label="Loading" />
    </div>
  );
}

function ShellLayout() {
  const { state, hydrated } = useStore();
  const navigate = useNavigate();
  const ok = state.loggedIn && state.setupDone;
  useEffect(() => {
    if (!hydrated) return;
    if (!state.loggedIn) navigate({ to: "/signup" });
    else if (!state.setupDone) navigate({ to: "/setup" });
  }, [hydrated, state.loggedIn, state.setupDone, navigate]);
  if (!hydrated || !ok) return <Loading />;
  return <AppShell><Outlet /></AppShell>;
}

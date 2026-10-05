import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/ww/AppShell";
import { Loading } from "@/components/ww/Loading";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

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

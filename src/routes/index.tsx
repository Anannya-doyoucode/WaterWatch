import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { Loading } from "@/components/ww/Loading";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WaterWatch — Your home's water, watched" },
      { name: "description", content: "Track household water use, tank level and outlets in real time, and catch leaks before they waste water." },
      { property: "og:title", content: "WaterWatch — Your home's water, watched" },
      { property: "og:description", content: "Real-time household water monitoring and explainable leak detection." },
    ],
  }),
  component: Index,
});

function Index() {
  const { state, hydrated } = useStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!hydrated) return;
    if (!state.loggedIn) navigate({ to: state.user ? "/login" : "/signup", replace: true });
    else navigate({ to: state.setupDone ? "/dashboard" : "/setup", replace: true });
  }, [hydrated, state.loggedIn, state.setupDone, state.user, navigate]);
  return <Loading />;
}

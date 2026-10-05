import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/ww/AuthLayout";
import { useStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — WaterWatch" },
      { name: "description", content: "Log in to see your home's live water flow, tank level and alerts." },
      { property: "og:title", content: "Log in — WaterWatch" },
      { property: "og:description", content: "Access your WaterWatch home dashboard." },
    ],
  }),
  component: Login,
});

function Login() {
  const { state, update } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState(state.user?.email ?? "");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.user) return setErr("No account found on this device. Please create one.");
    if (email.trim().toLowerCase() !== state.user.email.toLowerCase() || pw !== state.user.password)
      return setErr("Email or password is incorrect.");
    setErr(""); setBusy(true);
    setTimeout(() => {
      update((s) => ({ ...s, loggedIn: true }));
      navigate({ to: state.setupDone ? "/dashboard" : "/setup" });
    }, 500);
  };
  return (
    <AuthLayout>
      <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">Log in to check on your home's water.</p>
      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <div className="space-y-1.5"><Label htmlFor="email">Email</Label>
          <Input id="email" type="email" className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="pw">Password</Label>
          <Input id="pw" type="password" className="h-11" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
        {err && <p role="alert" className="text-sm font-medium text-critical">{err}</p>}
        <Button type="submit" className="h-11 w-full" disabled={busy}>{busy && <Loader2 className="size-4 animate-spin" />}Log in</Button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">New to WaterWatch? <Link to="/signup" className="font-semibold text-primary hover:underline">Create an account</Link></p>
    </AuthLayout>
  );
}

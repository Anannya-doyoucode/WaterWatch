import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/ww/AuthLayout";
import { useStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — WaterWatch" },
      { name: "description", content: "Create your WaterWatch account and set up water monitoring for your home." },
      { property: "og:title", content: "Create account — WaterWatch" },
      { property: "og:description", content: "Start monitoring your household water in minutes." },
    ],
  }),
  component: Signup,
});

function Signup() {
  const { update } = useStore();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "Ananya", email: "ananya@example.in", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) return setErr("Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr("Please enter a valid email address.");
    if (f.password.length < 6) return setErr("Password must be at least 6 characters.");
    setErr(""); setBusy(true);
    setTimeout(() => {
      update((s) => ({ ...s, user: { ...f, name: f.name.trim() }, loggedIn: true }));
      navigate({ to: "/setup" });
    }, 600);
  };
  return (
    <AuthLayout>
      <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">Next, we'll set up your home so WaterWatch can learn its normal patterns.</p>
      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <div className="space-y-1.5"><Label htmlFor="name">Full name</Label>
          <Input id="name" className="h-11" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div className="space-y-1.5"><Label htmlFor="email">Email</Label>
          <Input id="email" type="email" className="h-11" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div className="space-y-1.5"><Label htmlFor="pw">Password</Label>
          <Input id="pw" type="password" className="h-11" placeholder="At least 6 characters" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
        {err && <p role="alert" className="text-sm font-medium text-critical">{err}</p>}
        <Button type="submit" className="h-11 w-full" disabled={busy}>{busy && <Loader2 className="size-4 animate-spin" />}Create account</Button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link></p>
    </AuthLayout>
  );
}

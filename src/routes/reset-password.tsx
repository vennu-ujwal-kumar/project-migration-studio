import { useEffect, useState, type FormEvent } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword } from "@/lib/api/auth";
import { pageMeta } from "@/lib/page-meta";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: pageMeta("Choose a new password", "Set a new password for your CYC account.") }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const isRecovery = hash.get("type") === "recovery";
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setReady(isRecovery && Boolean(data.session));
    });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setErrorMessage("");
    const { error } = await updatePassword(password);
    if (error) setErrorMessage(error.message);
    else await navigate({ to: "/dashboard" });
    setBusy(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="w-full max-w-md space-y-7">
        <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> Back to sign in</Link>
        <div className="brand-mark" aria-hidden="true"><LockKeyhole size={19} /></div>
        <div className="space-y-2"><p className="section-kicker">Account recovery</p><h1 className="text-2xl font-semibold text-foreground">Choose a new password</h1><p className="text-sm leading-6 text-muted-foreground">Use at least 8 characters for your new password.</p></div>
        {ready ? <form className="space-y-4" onSubmit={(event) => void submit(event)}>
          <div className="space-y-2"><Label htmlFor="password">New password</Label><Input id="password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
          {errorMessage ? <p role="alert" className="text-sm text-destructive-foreground">{errorMessage}</p> : null}
          <Button className="w-full" disabled={busy}>{busy ? "Updating…" : "Update password"}</Button>
        </form> : <p role="status" className="border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">This reset link is missing or has expired. Request a new one to continue.</p>}
      </section>
    </main>
  );
}
import { useState, type FormEvent } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendPasswordReset } from "@/lib/api/auth";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: pageMeta("Reset password", "Request a password reset for your CYC account.") }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setErrorMessage("");
    const { error } = await sendPasswordReset(email);
    if (error) setErrorMessage(error.message);
    else setSent(true);
    setBusy(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="w-full max-w-md space-y-7">
        <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> Back to sign in</Link>
        <div className="brand-mark" aria-hidden="true"><Mail size={19} /></div>
        <div className="space-y-2">
          <p className="section-kicker">Account recovery</p>
          <h1 className="text-2xl font-semibold text-foreground">Reset your password</h1>
          <p className="text-sm leading-6 text-muted-foreground">Enter the email address for your CYC account. We’ll send a secure reset link if an account matches.</p>
        </div>
        {sent ? <p role="status" className="border border-primary/30 bg-primary/10 p-4 text-sm leading-6 text-foreground">If an account uses that email, a reset link is on its way.</p> : (
          <form className="space-y-4" onSubmit={(event) => void submit(event)}>
            <div className="space-y-2"><Label htmlFor="email">Email address</Label><Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
            {errorMessage ? <p role="alert" className="text-sm text-destructive-foreground">{errorMessage}</p> : null}
            <Button className="w-full" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</Button>
          </form>
        )}
      </section>
    </main>
  );
}
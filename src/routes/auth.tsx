import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Code2, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { signInWithPassword, signUpWithPassword } from "@/lib/api/auth";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: pageMeta("Sign in", "Sign in or create your CYC Code Practice account.") }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) void navigate({ to: "/dashboard", replace: true });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setErrorMessage("");
    try {
      if (mode === "signup") {
        const result = await signUpWithPassword({ email, password, username });
        if (result.error) throw result.error;
        if (result.needsEmailConfirmation) {
          setMessage("Check your email to verify your address. You can sign in after confirming.");
          return;
        }
        await navigate({ to: "/dashboard" });
        return;
      }

      const { error } = await signInWithPassword(email, password);
      if (error) throw error;
      await navigate({ to: "/dashboard" });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Sign in could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function signInSocial(provider: "google" | "lovable") {
    setBusy(true);
    setErrorMessage("");
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      await navigate({ to: "/dashboard" });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "This sign-in method is unavailable.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-aside">
        <div className="flex items-center gap-3">
          <span className="brand-mark" aria-hidden="true"><Code2 size={20} /></span>
          <span className="text-sm font-semibold text-foreground">CYC Code Practice</span>
        </div>
        <div className="auth-aside-note max-w-xl space-y-6">
          <p className="section-kicker">Build a sharper practice</p>
              <h1 className="max-w-xl text-5xl font-semibold leading-[1.08] text-foreground">
            Think clearly.<br />
            <span className="text-primary">Code with intent.</span>
          </h1>
          <p className="max-w-lg text-base leading-7 text-muted-foreground">
            A calm workspace for data structures, algorithms, and deliberate progress.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2"><Check size={15} className="text-primary" /> Java-first practice</span>
            <span className="inline-flex items-center gap-2"><Check size={15} className="text-primary" /> A focused workspace</span>
          </div>
        </div>
        <div className="auth-aside-note flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-primary" /> CYC / PRACTICE ENVIRONMENT
        </div>
      </section>

      <section className="auth-form-wrap">
        <div className="auth-form space-y-7">
          <div className="space-y-2">
            <p className="section-kicker">{mode === "signin" ? "Welcome back" : "Create your account"}</p>
            <h2 className="text-2xl font-semibold text-foreground">
              {mode === "signin" ? "Sign in to your workspace" : "Start practicing with CYC"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "signin" ? "Use your email and password to continue." : "Choose a username and use an email you can verify."}
            </p>
          </div>

          {message ? (
            <div role="status" className="flex gap-3 border border-primary/30 bg-primary/10 p-3 text-sm leading-6 text-foreground">
              <Mail className="mt-0.5 shrink-0 text-primary" size={17} />
              <span>{message}</span>
            </div>
          ) : null}
          {errorMessage ? (
            <div role="alert" className="border border-destructive/40 bg-destructive/10 p-3 text-sm leading-6 text-destructive-foreground">
              {errorMessage}
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={(event) => void submit(event)}>
            {mode === "signup" ? (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input id="username" name="username" autoComplete="username" className="pl-9" value={username} onChange={(event) => setUsername(event.target.value)} required />
                </div>
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input id="email" name="email" type="email" autoComplete="email" className="pl-9" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="password">Password</Label>
                {mode === "signin" ? <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link> : null}
              </div>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} className="pl-9 pr-11" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 size-8 -translate-y-1/2" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((current) => !current)}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
            <Button className="w-full" type="submit" disabled={busy}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              {!busy ? <ArrowRight /> : null}
            </Button>
          </form>

          <div className="relative flex items-center gap-4 text-xs text-muted-foreground">
            <span className="subtle-rule flex-1" />
            <span>or continue with</span>
            <span className="subtle-rule flex-1" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="outline" disabled={busy} onClick={() => void signInSocial("google")}>
              <GoogleMark /> Continue with Google
            </Button>
            <Button type="button" variant="outline" disabled={busy} onClick={() => void signInSocial("lovable")}>
              <span aria-hidden="true" className="grid size-5 place-items-center rounded border border-border font-mono text-xs font-semibold text-primary">L</span> Continue with Lovable
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to CYC?" : "Already have an account?"}{" "}
            <button type="button" className="font-medium text-primary hover:underline" onClick={() => { setMode((current) => current === "signin" ? "signup" : "signin"); setMessage(""); setErrorMessage(""); }}>
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

function GoogleMark() {
  return <span aria-hidden="true" className="font-semibold text-foreground">G</span>;
}
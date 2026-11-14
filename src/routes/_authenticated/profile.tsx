import { useState, type FormEvent } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/cyc/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOwnProfile, getOwnRole, updateOwnUsername } from "@/lib/api/profile";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/_authenticated/profile")({
  loader: async () => {
    const [profile, role] = await Promise.all([getOwnProfile(), getOwnRole()]);
    return { profile, role };
  },
  head: () => ({ meta: pageMeta("Profile", "Manage your CYC account profile.") }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, role } = Route.useLoaderData();
  const router = useRouter();
  const [username, setUsername] = useState(profile?.username ?? "");
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateOwnUsername(username.trim().toLowerCase());
      toast.success("Username updated");
      await router.invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update your username.");
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return <AppShell email="" username="Coder" role={role}><div className="content-width"><p role="alert" className="text-sm text-destructive-foreground">Your profile could not be loaded. Refresh the page or sign in again.</p></div></AppShell>;
  }

  return (
    <AppShell email={profile.email} username={profile.username} role={role}>
      <div className="content-width space-y-8">
        <header className="space-y-3"><p className="section-kicker">Account</p><h1 className="text-3xl font-semibold text-foreground">Profile</h1><p className="text-sm text-muted-foreground">Manage the details shown in your CYC workspace.</p></header>
        <div className="subtle-rule" />
        <section className="max-w-2xl space-y-7">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-full border border-border bg-card text-xl font-semibold text-primary">{profile.username.slice(0, 1).toUpperCase()}</div>
            <div><div className="font-medium text-foreground">{profile.username}</div><div className="text-sm text-muted-foreground">{profile.email}</div></div>
          </div>
          <form className="max-w-lg space-y-4" onSubmit={(event) => void save(event)}>
            <div className="space-y-2"><Label htmlFor="profile-username">Username</Label><Input id="profile-username" value={username} onChange={(event) => setUsername(event.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="profile-email">Email address</Label><Input id="profile-email" value={profile.email} readOnly aria-readonly="true" /><p className="text-xs text-muted-foreground">Your verified email is managed with your account.</p></div>
            <Button disabled={saving || username.trim().toLowerCase() === profile.username}>{saving ? "Saving…" : "Save username"}</Button>
          </form>
          <div className="border-t border-border pt-5"><p className="text-xs text-muted-foreground">Account role</p><p className="mt-1 text-sm font-medium capitalize text-foreground">{role ?? "user"}</p></div>
        </section>
      </div>
    </AppShell>
  );
}
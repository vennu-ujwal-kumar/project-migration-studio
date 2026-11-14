import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/cyc/app-shell";
import { SectionPage } from "@/components/cyc/section-page";
import { getOwnProfile, getOwnRole } from "@/lib/api/profile";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/_authenticated/bookmarks")({
  loader: async () => {
    const [profile, role] = await Promise.all([getOwnProfile(), getOwnRole()]);
    return { profile, role };
  },
  head: () => ({ meta: pageMeta("Bookmarks", "Return to coding problems saved for later.") }),
  component: () => {
    const { profile, role } = Route.useLoaderData();
    return <AppShell email={profile?.email ?? ""} username={profile?.username ?? "Coder"} role={role}><SectionPage eyebrow="Saved for later" title="Bookmarks" description="Keep track of the problems you want to return to." emptyTitle="No bookmarks yet" emptyDescription="Saved problems will appear here." /></AppShell>;
  },
});
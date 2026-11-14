import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/cyc/app-shell";
import { SectionPage } from "@/components/cyc/section-page";
import { getOwnProfile, getOwnRole } from "@/lib/api/profile";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/_authenticated/topics")({
  loader: async () => {
    const [profile, role] = await Promise.all([getOwnProfile(), getOwnRole()]);
    return { profile, role };
  },
  head: () => ({ meta: pageMeta("Topics", "Browse coding practice by topic.") }),
  component: () => {
    const { profile, role } = Route.useLoaderData();
    return <AppShell email={profile?.email ?? ""} username={profile?.username ?? "Coder"} role={role}><SectionPage eyebrow="Study map" title="Topics" description="Organize practice around data structures and algorithm patterns." emptyTitle="No topics available" emptyDescription="Topic collections will appear here when the library is added." /></AppShell>;
  },
});
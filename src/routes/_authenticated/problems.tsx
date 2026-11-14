import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/cyc/app-shell";
import { SectionPage } from "@/components/cyc/section-page";
import { getOwnProfile, getOwnRole } from "@/lib/api/profile";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/_authenticated/problems")({
  loader: async () => {
    const [profile, role] = await Promise.all([getOwnProfile(), getOwnRole()]);
    return { profile, role };
  },
  head: () => ({ meta: pageMeta("Problems", "Browse coding problems by topic and difficulty.") }),
  component: () => {
    const { profile, role } = Route.useLoaderData();
    return <AppShell email={profile?.email ?? ""} username={profile?.username ?? "Coder"} role={role}><SectionPage eyebrow="Practice" title="Problems" description="Explore coding challenges and build fluency one problem at a time." emptyTitle="No problems available" emptyDescription="The question library has not been imported yet." /></AppShell>;
  },
});
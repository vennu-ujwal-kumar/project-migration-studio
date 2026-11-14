import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/cyc/app-shell";
import { SectionPage } from "@/components/cyc/section-page";
import { getOwnProfile, getOwnRole } from "@/lib/api/profile";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/_authenticated/submissions")({
  loader: async () => {
    const [profile, role] = await Promise.all([getOwnProfile(), getOwnRole()]);
    return { profile, role };
  },
  head: () => ({ meta: pageMeta("Submissions", "Review your coding practice submissions.") }),
  component: () => {
    const { profile, role } = Route.useLoaderData();
    return <AppShell email={profile?.email ?? ""} username={profile?.username ?? "Coder"} role={role}><SectionPage eyebrow="Your work" title="Submissions" description="Review solutions you have submitted and revisit your progress." emptyTitle="No submissions yet" emptyDescription="Your submitted solutions will appear here." /></AppShell>;
  },
});
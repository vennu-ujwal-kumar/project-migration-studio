import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/cyc/app-shell";
import { SectionPage } from "@/components/cyc/section-page";
import { getOwnProfile, getOwnRole } from "@/lib/api/profile";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/_authenticated/_admin/admin/questions")({
  loader: async () => {
    const [profile, role] = await Promise.all([getOwnProfile(), getOwnRole()]);
    return { profile, role };
  },
  head: () => ({ meta: pageMeta("Question manager", "Manage coding practice questions.") }),
  component: () => {
    const { profile, role } = Route.useLoaderData();
    return <AppShell email={profile?.email ?? ""} username={profile?.username ?? "Coder"} role={role}><SectionPage eyebrow="Administration" title="Question Manager" description="Review and organize the question library." emptyTitle="No questions imported" emptyDescription="Question management will be available when the library is added." /></AppShell>;
  },
});
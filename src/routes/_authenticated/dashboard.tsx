import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/cyc/app-shell";
import { SectionPage } from "@/components/cyc/section-page";
import { pageMeta } from "@/lib/page-meta";
import { getOwnProfile, getOwnRole } from "@/lib/api/profile";

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: async () => {
    const [profile, role] = await Promise.all([getOwnProfile(), getOwnRole()]);
    return { profile, role };
  },
  head: () => ({ meta: pageMeta("Dashboard", "Your CYC coding practice dashboard.") }),
  component: DashboardPage,
});

function DashboardPage() {
  const { profile, role } = Route.useLoaderData();
  return (
    <AppShell email={profile?.email ?? ""} username={profile?.username ?? "Coder"} role={role}>
      <SectionPage
        eyebrow="Your workspace"
        title="Dashboard"
        description="A clear view of your coding practice, topics, and recent activity."
        emptyTitle="Your practice starts here"
        emptyDescription="There are no practice records in this workspace yet. Add your existing question and activity data to see it here."
      />
    </AppShell>
  );
}
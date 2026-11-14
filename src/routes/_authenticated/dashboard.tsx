import { createFileRoute } from "@tanstack/react-router";
import { Activity, ArrowRight, CircleDot, Code2, Flame, Gauge, Target } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/cyc/app-shell";
import { loadDashboardData } from "@/lib/api/practice";
import { getActivityCalendar, getPracticeSummary } from "@/lib/practice-metrics";
import { pageMeta } from "@/lib/page-meta";
import { getOwnProfile, getOwnRole } from "@/lib/api/profile";

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: async () => {
    const [profile, role, practice] = await Promise.all([
      getOwnProfile(),
      getOwnRole(),
      loadDashboardData(),
    ]);
    return { profile, role, practice };
  },
  pendingComponent: () => <DashboardLoading />,
  head: () => ({ meta: pageMeta("Dashboard", "Your CYC coding practice dashboard.") }),
  component: DashboardPage,
});

function DashboardPage() {
  const { profile, role, practice } = Route.useLoaderData();
  const { problems, totalProblems, progress, activity, submissions, topicCounts } = practice;
  const summary = getPracticeSummary(totalProblems, progress, activity);
  const calendar = getActivityCalendar(activity);
  const progressByProblem = new Map(progress.map((item) => [item.problem_id, item]));
  const difficultyStats = ["easy", "medium", "hard", "very_hard"].map((difficulty) => {
    const group = problems.filter((problem) => problem.difficulty === difficulty);
    const solved = group.filter((problem) => progressByProblem.get(problem.id)?.status === "solved").length;
    return { difficulty, count: group.length, solved };
  });
  const topicProgress = topicCounts.map((topic) => {
    const topicProblems = problems.filter((problem) =>
      problem.problem_topics.some((link) => link.topic_id === topic.id),
    );
    const solved = topicProblems.filter((problem) => progressByProblem.get(problem.id)?.status === "solved").length;
    return { ...topic, total: topicProblems.length, solved };
  }).filter((topic) => topic.total > 0).sort((a, b) => b.total - a.total).slice(0, 6);

  return (
    <AppShell email={profile?.email ?? ""} username={profile?.username ?? "Coder"} role={role}>
      <div className="content-width space-y-8">
        <header className="space-y-3">
          <p className="section-kicker">Your workspace</p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Your practice, progress, and recent activity.
              </p>
            </div>
            <Button asChild><Link to="/problems">Browse problems <ArrowRight aria-hidden="true" /></Link></Button>
          </div>
        </header>
        <div className="subtle-rule" />

        <section aria-label="Practice statistics" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
          <Metric label="Problems" value={totalProblems} icon={<Code2 />} />
          <Metric label="Solved" value={summary.solved} icon={<Target />} />
          <Metric label="Attempted" value={summary.attempted} icon={<CircleDot />} />
          <Metric label="Unsolved" value={summary.unsolved} icon={<Activity />} />
          <Metric label="Accuracy" value={`${summary.accuracy}%`} icon={<Gauge />} />
          <Metric label="Submissions" value={summary.totalSubmissions} icon={<Code2 />} />
          <Metric label="Day streak" value={summary.streak} icon={<Flame />} />
        </section>

        <section className="space-y-4" aria-labelledby="activity-title">
          <div className="flex items-end justify-between gap-3">
            <div><h2 id="activity-title" className="text-lg font-semibold">Activity</h2><p className="text-sm text-muted-foreground">Your last 52 weeks</p></div>
            <p className="text-sm text-muted-foreground">{summary.totalSubmissions} submissions</p>
          </div>
          {activity.length === 0 ? <EmptyState title="No activity yet" text="Your daily practice will appear here." /> : (
            <div className="overflow-x-auto border-y border-border py-4">
              <div className="min-w-[680px]">
                <div className="mb-2 grid grid-cols-12 text-xs text-muted-foreground">
                  {monthLabels(calendar).map((month) => <span key={month.key} className="col-span-1">{month.label}</span>)}
                </div>
                <div className="grid grid-flow-col grid-rows-7 gap-1" aria-label="Daily submission activity">
                  {calendar.map((day) => {
                    const count = day.submission_count ?? 0;
                    const intensity = count === 0 ? "bg-muted" : count < 3 ? "bg-primary/30" : count < 6 ? "bg-primary/60" : "bg-primary";
                    return <span key={day.date} title={`${day.date}: ${count} submissions`} className={`size-3 rounded-[2px] ${intensity}`} />;
                  })}
                </div>
                <div className="mt-2 flex items-center justify-end gap-2 text-xs text-muted-foreground">
                  <span>Less</span><span className="size-3 rounded-[2px] bg-muted" /><span className="size-3 rounded-[2px] bg-primary/30" /><span className="size-3 rounded-[2px] bg-primary/60" /><span className="size-3 rounded-[2px] bg-primary" /><span>More</span>
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="space-y-4" aria-labelledby="difficulty-title">
            <div><h2 id="difficulty-title" className="text-lg font-semibold">Progress by difficulty</h2><p className="text-sm text-muted-foreground">Solved challenges across each level</p></div>
            {totalProblems === 0 ? <EmptyState title="No published problems" text="Difficulty progress will appear when the problem library is available." /> : (
              <div className="divide-y divide-border border-y border-border">
                {difficultyStats.map((stat) => <div key={stat.difficulty} className="flex items-center justify-between gap-4 py-3">
                  <DifficultyLabel difficulty={stat.difficulty} />
                  <span className="text-sm text-muted-foreground">{stat.solved} / {stat.count} solved</span>
                </div>)}
              </div>
            )}
          </section>
          <section className="space-y-4" aria-labelledby="topic-progress-title">
            <div><h2 id="topic-progress-title" className="text-lg font-semibold">Topic progress</h2><p className="text-sm text-muted-foreground">Your largest topic collections</p></div>
            {topicProgress.length === 0 ? <EmptyState title="No topic progress yet" text="Topics with published problems will appear here." /> : (
              <div className="divide-y divide-border border-y border-border">
                {topicProgress.map((topic) => <div key={topic.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0"><p className="truncate font-medium">{topic.name}</p><p className="text-xs text-muted-foreground">{topic.category}</p></div>
                  <span className="shrink-0 text-sm text-muted-foreground">{topic.solved} / {topic.total}</span>
                </div>)}
              </div>
            )}
          </section>
        </div>

        <section className="space-y-4" aria-labelledby="recent-title">
          <div className="flex items-center justify-between gap-3"><div><h2 id="recent-title" className="text-lg font-semibold">Recent submissions</h2><p className="text-sm text-muted-foreground">Your latest attempts</p></div><Button variant="ghost" size="sm" asChild><Link to="/submissions">View all <ArrowRight aria-hidden="true" /></Link></Button></div>
          {submissions.length === 0 ? <EmptyState title="No submissions yet" text="Your recent attempts will show here." /> : (
            <div className="divide-y divide-border border-y border-border">
              {submissions.map((submission) => <div key={submission.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0"><p className="truncate font-medium">{submission.problems?.title ?? "Problem unavailable"}</p><p className="font-mono text-xs text-muted-foreground">{submission.problems?.problem_code ?? "—"} · {new Date(submission.created_at).toLocaleDateString()}</p></div>
                <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground">{submission.score === null ? "—" : `${submission.score} pts`}</span><Badge variant={submission.verdict === "accepted" ? "secondary" : "outline"}>{submission.verdict ?? submission.status.replaceAll("_", " ")}</Badge></div>
              </div>)}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Metric({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return <div className="min-w-0 border border-border bg-card p-4">
    <div className="flex items-center justify-between gap-2 text-muted-foreground"><span className="truncate text-xs">{label}</span><span className="shrink-0 [&>svg]:size-4">{icon}</span></div>
    <p className="mt-3 font-mono text-2xl font-semibold text-foreground">{value}</p>
  </div>;
}

function DifficultyLabel({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = { easy: "text-status-easy", medium: "text-status-medium", hard: "text-status-hard", very_hard: "text-status-very-hard" };
  return <span className={`text-sm font-medium capitalize ${colors[difficulty] ?? "text-foreground"}`}>{difficulty.replaceAll("_", " ")}</span>;
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="border-y border-border py-8 text-center"><h3 className="font-medium">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{text}</p></div>;
}

function monthLabels(calendar: ReturnType<typeof getActivityCalendar>) {
  const seen = new Set<string>();
  return calendar.filter((day) => {
    const date = new Date(`${day.date}T00:00:00Z`);
    const month = date.toLocaleString("en", { month: "short", timeZone: "UTC" });
    if (seen.has(month)) return false;
    seen.add(month);
    return true;
  }).map((day) => ({ key: day.date, label: new Date(`${day.date}T00:00:00Z`).toLocaleString("en", { month: "short", timeZone: "UTC" })));
}

function DashboardLoading() {
  return <div className="content-width space-y-5" aria-busy="true"><p className="section-kicker">Your workspace</p><h1 className="text-3xl font-semibold">Loading dashboard…</h1><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">{Array.from({ length: 7 }, (_, index) => <div key={index} className="h-24 animate-pulse border border-border bg-card" />)}</div></div>;
}
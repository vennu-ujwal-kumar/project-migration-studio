import type { DailyActivity, ProblemProgress } from "@/lib/api/practice";

export function getPracticeSummary(
  totalProblems: number,
  progress: ProblemProgress[],
  activity: DailyActivity[],
) {
  const solved = progress.filter((item) => item.status === "solved").length;
  const attempted = progress.filter((item) => item.status === "attempted").length;
  const totalSubmissions = activity.reduce((sum, day) => sum + day.submission_count, 0);
  const accepted = activity.reduce((sum, day) => sum + day.accepted_count, 0);

  return {
    solved,
    attempted,
    unsolved: Math.max(0, totalProblems - solved - attempted),
    totalSubmissions,
    accuracy: totalSubmissions === 0 ? 0 : Math.round((accepted / totalSubmissions) * 100),
    streak: getCurrentStreak(activity),
  };
}

export function getCurrentStreak(activity: DailyActivity[], today = new Date()) {
  const activeDays = new Set(
    activity.filter((day) => day.submission_count > 0).map((day) => day.activity_date),
  );
  const currentDate = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  const todayKey = currentDate.toISOString().slice(0, 10);
  if (!activeDays.has(todayKey)) currentDate.setUTCDate(currentDate.getUTCDate() - 1);

  let streak = 0;
  while (activeDays.has(currentDate.toISOString().slice(0, 10))) {
    streak += 1;
    currentDate.setUTCDate(currentDate.getUTCDate() - 1);
  }
  return streak;
}

export function sortDifficulty<T extends { difficulty: string }>(items: T[]) {
  const order: Record<string, number> = { easy: 0, medium: 1, hard: 2, very_hard: 3 };
  return [...items].sort((a, b) => (order[a.difficulty] ?? 99) - (order[b.difficulty] ?? 99));
}

export function getActivityCalendar(activity: DailyActivity[], today = new Date()) {
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const dates = Array.from({ length: 364 }, (_, index) => {
    const date = new Date(todayUtc);
    date.setUTCDate(todayUtc.getUTCDate() - (363 - index));
    const key = date.toISOString().slice(0, 10);
    return { date: key, ...(activity.find((day) => day.activity_date === key) ?? null) };
  });
  return dates;
}
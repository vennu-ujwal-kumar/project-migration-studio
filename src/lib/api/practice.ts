import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

export type Topic = Tables<"topics">;
export type ProblemProgress = Pick<
  Tables<"user_problem_progress">,
  "problem_id" | "status" | "best_score" | "solved_at" | "last_submission_at"
>;
export type DailyActivity = Tables<"daily_activity">;

export type PracticeProblem = {
  id: string;
  problem_code: string;
  title: string;
  slug: string;
  difficulty: Tables<"problems">["difficulty"];
  maximum_score: number;
  created_at: string;
  problem_topics: Array<{
    topic_id: string;
    is_primary: boolean;
    topics: { name: string } | null;
  }>;
};

export type RecentSubmission = {
  id: string;
  problem_id: string;
  status: Tables<"submissions">["status"];
  verdict: string | null;
  score: number | null;
  created_at: string;
  problems: { title: string; problem_code: string } | null;
};

export type TopicProblemCount = { topic_id: string; problem_count: number };

async function requireUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Your session has expired. Please sign in again.");
  return data.user.id;
}

export async function getPublishedProblems() {
  const pageSize = 500;
  const rows: PracticeProblem[] = [];
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("problems")
      .select(
        "id, problem_code, title, slug, difficulty, maximum_score, created_at, problem_topics(topic_id, is_primary, topics(name))",
      )
      .eq("status", "published")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);
    if (error) throw error;
    rows.push(...((data ?? []) as PracticeProblem[]));
    if (!data || data.length < pageSize) return rows;
  }
}

export async function getPublishedProblemTotal() {
  const { count, error } = await supabase
    .from("problems")
    .select("id", { count: "exact", head: true })
    .eq("status", "published")
    .is("deleted_at", null);
  if (error) throw error;
  return count ?? 0;
}

export async function getOwnProblemProgress() {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("user_problem_progress")
    .select("problem_id, status, best_score, solved_at, last_submission_at")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []) as ProblemProgress[];
}

export async function getOwnDailyActivity() {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("daily_activity")
    .select("user_id, activity_date, submission_count, accepted_count")
    .eq("user_id", userId)
    .order("activity_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getOwnRecentSubmissions() {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("submissions")
    .select("id, problem_id, status, verdict, score, created_at, problems(title, problem_code)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) throw error;
  return (data ?? []) as RecentSubmission[];
}

export async function getTopicsWithPublishedCounts() {
  const [topicsResult, linksResult] = await Promise.all([
    supabase.from("topics").select("id, name, category, created_at").order("category").order("name"),
    supabase.from("problem_topics").select("topic_id"),
  ]);
  if (topicsResult.error) throw topicsResult.error;
  if (linksResult.error) throw linksResult.error;

  const counts = new Map<string, number>();
  for (const link of linksResult.data ?? []) {
    counts.set(link.topic_id, (counts.get(link.topic_id) ?? 0) + 1);
  }
  return (topicsResult.data ?? []).map((topic) => ({
    ...topic,
    problem_count: counts.get(topic.id) ?? 0,
  }));
}

export async function loadDashboardData() {
  const [problems, totalProblems, progress, activity, submissions, topicCounts] = await Promise.all([
    getPublishedProblems(),
    getPublishedProblemTotal(),
    getOwnProblemProgress(),
    getOwnDailyActivity(),
    getOwnRecentSubmissions(),
    getTopicsWithPublishedCounts(),
  ]);
  return { problems, totalProblems, progress, activity, submissions, topicCounts };
}
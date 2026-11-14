CREATE TYPE public.problem_difficulty AS ENUM ('easy', 'medium', 'hard', 'very_hard');
CREATE TYPE public.problem_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.submission_status AS ENUM ('queued', 'running', 'done', 'system_error');
CREATE TYPE public.problem_progress_status AS ENUM ('attempted', 'solved');

CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.topics TO authenticated;
GRANT ALL ON public.topics TO service_role;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read topics"
  ON public.topics FOR SELECT TO authenticated USING (true);

CREATE TABLE public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_code TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  difficulty public.problem_difficulty NOT NULL,
  statement TEXT NOT NULL,
  input_format TEXT NOT NULL,
  output_format TEXT NOT NULL,
  constraints TEXT[] NOT NULL DEFAULT '{}',
  time_limit_ms INTEGER NOT NULL,
  memory_limit_mb INTEGER NOT NULL,
  maximum_score INTEGER NOT NULL DEFAULT 100,
  checker_type TEXT NOT NULL DEFAULT 'exact',
  checker_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  status public.problem_status NOT NULL DEFAULT 'draft',
  schema_version INTEGER NOT NULL DEFAULT 1,
  test_set_version INTEGER NOT NULL DEFAULT 1,
  primary_topic_id UUID REFERENCES public.topics(id),
  subcategory TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
GRANT SELECT ON public.problems TO authenticated;
GRANT ALL ON public.problems TO service_role;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read published problems"
  ON public.problems FOR SELECT TO authenticated
  USING (status = 'published' AND deleted_at IS NULL);

CREATE TABLE public.problem_topics (
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (problem_id, topic_id)
);
GRANT SELECT ON public.problem_topics TO authenticated;
GRANT ALL ON public.problem_topics TO service_role;
ALTER TABLE public.problem_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read tags for published problems"
  ON public.problem_topics FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.problems p
    WHERE p.id = problem_id AND p.status = 'published' AND p.deleted_at IS NULL
  ));

CREATE TABLE public.public_test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  explanation TEXT,
  display_order INTEGER NOT NULL DEFAULT 0
);
GRANT SELECT ON public.public_test_cases TO authenticated;
GRANT ALL ON public.public_test_cases TO service_role;
ALTER TABLE public.public_test_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read test cases for published problems"
  ON public.public_test_cases FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.problems p
    WHERE p.id = problem_id AND p.status = 'published' AND p.deleted_at IS NULL
  ));

CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  problem_id UUID NOT NULL REFERENCES public.problems(id),
  language TEXT NOT NULL,
  source_code TEXT NOT NULL,
  status public.submission_status NOT NULL DEFAULT 'queued',
  verdict TEXT,
  first_failure_type TEXT,
  score INTEGER,
  passed_tests INTEGER,
  total_tests INTEGER,
  failed_tests INTEGER,
  execution_time_ms INTEGER,
  memory_kb INTEGER,
  test_set_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);
GRANT SELECT ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own submissions"
  ON public.submissions FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.user_problem_progress (
  user_id UUID NOT NULL,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  status public.problem_progress_status NOT NULL DEFAULT 'attempted',
  best_score INTEGER NOT NULL DEFAULT 0,
  solved_at TIMESTAMPTZ,
  solved_test_set_version INTEGER,
  last_submission_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, problem_id)
);
GRANT SELECT ON public.user_problem_progress TO authenticated;
GRANT ALL ON public.user_problem_progress TO service_role;
ALTER TABLE public.user_problem_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own problem progress"
  ON public.user_problem_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.daily_activity (
  user_id UUID NOT NULL,
  activity_date DATE NOT NULL,
  submission_count INTEGER NOT NULL DEFAULT 0,
  accepted_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, activity_date)
);
GRANT SELECT ON public.daily_activity TO authenticated;
GRANT ALL ON public.daily_activity TO service_role;
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own daily activity"
  ON public.daily_activity FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.bookmarks (
  user_id UUID NOT NULL,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, problem_id)
);
GRANT SELECT, INSERT, DELETE ON public.bookmarks TO authenticated;
GRANT ALL ON public.bookmarks TO service_role;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own bookmarks"
  ON public.bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bookmarks"
  ON public.bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks"
  ON public.bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX submissions_user_problem_created_idx ON public.submissions (user_id, problem_id, created_at DESC);
CREATE INDEX submissions_user_created_idx ON public.submissions (user_id, created_at DESC);
CREATE INDEX problems_status_difficulty_idx ON public.problems (status, difficulty);
CREATE INDEX problem_topics_topic_problem_idx ON public.problem_topics (topic_id, problem_id);
CREATE INDEX user_problem_progress_user_status_idx ON public.user_problem_progress (user_id, status);
CREATE INDEX daily_activity_user_date_idx ON public.daily_activity (user_id, activity_date DESC);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;
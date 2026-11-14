import { createFileRoute, redirect } from "@tanstack/react-router";
import { pageMeta } from "@/lib/page-meta";

// The home route ships no og:image, so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({ meta: pageMeta("Welcome", "Sign in to your CYC Code Practice workspace.") }),
  beforeLoad: () => {
    throw redirect({ to: "/auth" });
  },
});

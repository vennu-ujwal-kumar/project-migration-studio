import { useState, type ReactNode } from "react";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Bookmark,
  ChevronDown,
  Code2,
  FileCode2,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Shield,
  Tags,
  Users,
  UserRound,
  ClipboardList,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { canAccessAdmin } from "@/lib/permissions";
import { toast } from "sonner";

type RoleRow = { role: "admin" | "user" };

const mainNavigation = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/problems", label: "Problems", icon: Code2 },
  { to: "/topics", label: "Topics", icon: Tags },
  { to: "/submissions", label: "Submissions", icon: ClipboardList },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

const adminNavigation = [
  { to: "/admin", label: "Admin Dashboard", icon: Shield },
  { to: "/admin/questions", label: "Question Manager", icon: FileCode2 },
  { to: "/admin/import", label: "JSON Importer", icon: FolderKanban },
  { to: "/admin/test-cases", label: "Test Case Manager", icon: Database },
  { to: "/admin/users", label: "User Management", icon: Users },
] as const;

export function AppShell({
  email,
  username,
  role,
  children,
}: {
  email: string;
  username: string;
  role: RoleRow["role"] | null;
  children?: ReactNode;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut();
      await navigate({ to: "/auth", replace: true });
    } catch {
      toast.error("Could not sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="app-frame">
      <aside className="app-sidebar">
        <Link to="/dashboard" className="flex items-center gap-3 px-2" aria-label="CYC dashboard">
          <span className="brand-mark" aria-hidden="true">
            <Code2 size={19} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-foreground">CYC Practice</span>
            <span className="block font-mono text-[0.65rem] text-muted-foreground">CODE WORKSPACE</span>
          </span>
        </Link>

        <nav className="mt-8 flex flex-col gap-1" aria-label="Main navigation">
          {mainNavigation.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`app-nav-item ${location.pathname === to ? "is-active" : ""}`}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {canAccessAdmin(role) ? (
          <div className="mt-8 space-y-2">
            <div className="px-3 font-mono text-[0.65rem] uppercase text-muted-foreground">
              Administration
            </div>
            <nav className="flex flex-col gap-1" aria-label="Administration">
              {adminNavigation.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`app-nav-item ${location.pathname === to ? "is-active" : ""}`}
                >
                  <Icon size={17} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </div>
        ) : null}

        <div className="app-sidebar-footer mt-auto border-t border-sidebar-border pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card text-sm font-semibold text-primary">
              {username.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">{username}</div>
              <div className="truncate text-xs text-muted-foreground">{email}</div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Sign out"
              aria-label="Sign out"
              disabled={signingOut}
              onClick={() => void handleSignOut()}
            >
              {signingOut ? <ChevronDown className="animate-pulse" /> : <LogOut />}
            </Button>
          </div>
        </div>
      </aside>

      <main className="app-main">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
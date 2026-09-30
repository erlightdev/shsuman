import { hasRole } from "@shsuman/auth/permissions";
import { ExternalLink, Loader2, LogOut, Moon, PanelLeftClose, PanelLeftOpen, ShieldAlert, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AnimatedSidebar,
  AnimatedSidebarContent,
  AnimatedSidebarFooter,
  AnimatedSidebarGroup,
  AnimatedSidebarGroupContent,
  AnimatedSidebarGroupLabel,
  AnimatedSidebarHeader,
  AnimatedSidebarInset,
  AnimatedSidebarMenu,
  AnimatedSidebarMenuButton,
  AnimatedSidebarMenuItem,
  AnimatedSidebarProvider,
  AnimatedSidebarRail,
  AnimatedSidebarTrigger,
} from "@/components/motion/animated-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

import { ErrorBoundary } from "./ErrorBoundary";
import { type DashboardRoute, navGroups, pathToRoute } from "./nav";
import { BlogList } from "./pages/BlogList";
import { ContentList } from "./pages/ContentList";
import { McpPage } from "./pages/McpPage";
import { Overview } from "./pages/Overview";
import { PostEditor } from "./pages/PostEditor";
import { ResourceEditor } from "./pages/ResourceEditor";
import { ResourceList } from "./pages/ResourceList";
import { SectionEditor } from "./pages/SectionEditor";
import { UsersPage } from "./pages/UsersPage";

function toggleTheme() {
  const dark = document.documentElement.classList.toggle("dark");
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {}
}

function RoutePage({ route, isAdmin }: { route: DashboardRoute; isAdmin: boolean }) {
  switch (route.page) {
    case "overview":
      return <Overview key="overview" />;
    case "content":
      return <ContentList key="content" />;
    case "section":
      return <SectionEditor key={`section-${route.section}`} section={route.section} />;
    case "blog":
      return <BlogList key="blog" />;
    case "post":
      return <PostEditor key={`post-${route.slug}`} slug={route.slug} />;
    case "resources":
      return <ResourceList key="resources" />;
    case "resource":
      return <ResourceEditor key={`resource-${route.slug}`} slug={route.slug} />;
    case "users":
      return isAdmin ? <UsersPage key="users" /> : <NoAccess message="Only admins can manage users." />;
    case "mcp":
      return <McpPage key="mcp" />;
  }
}

function NoAccess({ message }: { message: string }) {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-2xl border border-border p-8 text-center">
      <ShieldAlert className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
      <p className="mt-4 font-medium text-foreground">No access</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      <Button asChild variant="outline" className="mt-6 rounded-full">
        <a href="/">Back to the website</a>
      </Button>
    </div>
  );
}

export function DashboardShell({ route: initialRoute }: { route: DashboardRoute }) {
  const [currentRoute, setCurrentRoute] = useState<DashboardRoute>(() => {
    if (typeof window !== "undefined") {
      return pathToRoute(window.location.pathname);
    }
    return initialRoute;
  });
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as ({ role?: string | null } & NonNullable<typeof session>["user"]) | undefined;

  useEffect(() => {
    if (!isPending && !session) window.location.replace("/login");
  }, [isPending, session]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(pathToRoute(window.location.pathname));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("auth_toast");
      if (stored) {
        sessionStorage.removeItem("auth_toast");
        const parsed = JSON.parse(stored);
        if (parsed?.type === "success") {
          toast.success(parsed.message || "Signed in successfully.");
        } else if (parsed?.type === "error") {
          toast.error(parsed.message || "An error occurred.");
        } else if (parsed?.message) {
          toast(parsed.message);
        }
      }
    } catch {}
  }, []);

  const navigate = (href: string) => {
    if (href.startsWith("/")) {
      window.history.pushState({}, "", href);
      setCurrentRoute(pathToRoute(href));
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  const signOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            try {
              sessionStorage.setItem(
                "auth_toast",
                JSON.stringify({
                  type: "success",
                  message: "Signed out successfully.",
                })
              );
            } catch {}
            window.location.replace("/login");
          },
          onError: (ctx) => {
            setIsSigningOut(false);
            toast.error(ctx.error.message || "Failed to sign out. Please try again.");
          },
        },
      });
    } catch {
      setIsSigningOut(false);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  if (isPending || !session || !user) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  const canEdit = hasRole(user.role, "admin", "editor");
  const isAdmin = hasRole(user.role, "admin");

  if (!canEdit) {
    return (
      <div className="px-4">
        <NoAccess message="Your account doesn't have dashboard access yet. Ask an admin to give you the editor role." />
      </div>
    );
  }

  const initials = (user.name || user.email)
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AnimatedSidebarProvider className="bg-background-secondary">
      <AnimatedSidebar variant="inset" collapsible="icon" ariaLabel="Dashboard" panelClassName="bg-transparent">
        <AnimatedSidebarHeader>
          <a
            href="/dashboard"
            onClick={(e) => {
              e.preventDefault();
              navigate("/dashboard");
            }}
            className="flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-brand-8"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 font-mono text-xs font-bold text-white shadow-sm ring-1 ring-emerald-400/30">
              SK
            </span>
            <div className="min-w-0 flex flex-col group-data-[state=collapsed]/sidebar:hidden">
              <span className="truncate text-sm font-semibold text-foreground">
                Site Dashboard
              </span>
              <span className="truncate text-[10px] font-mono tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                Admin Area
              </span>
            </div>
          </a>
        </AnimatedSidebarHeader>

        <AnimatedSidebarContent>
          {navGroups.map((group) => {
            const items = group.items.filter((item) => !item.adminOnly || isAdmin);
            if (!items.length) return null;
            return (
              <AnimatedSidebarGroup key={group.label}>
                <AnimatedSidebarGroupLabel>{group.label}</AnimatedSidebarGroupLabel>
                <AnimatedSidebarGroupContent>
                  <AnimatedSidebarMenu>
                    {items.map((item) => (
                      <AnimatedSidebarMenuItem key={item.href}>
                        <AnimatedSidebarMenuButton
                          href={item.href}
                          isActive={item.match(currentRoute)}
                          onSelect={() => navigate(item.href)}
                          icon={<item.icon className="size-4" aria-hidden="true" />}
                        >
                          {item.label}
                        </AnimatedSidebarMenuButton>
                      </AnimatedSidebarMenuItem>
                    ))}
                  </AnimatedSidebarMenu>
                </AnimatedSidebarGroupContent>
              </AnimatedSidebarGroup>
            );
          })}
        </AnimatedSidebarContent>

        <AnimatedSidebarFooter>
          <AnimatedSidebarMenu>
            <AnimatedSidebarMenuItem>
              <AnimatedSidebarMenuButton
                href="/"
                target="_blank"
                rel="noopener"
                className="hover:text-emerald-600 dark:hover:text-emerald-400"
                icon={<ExternalLink className="size-4" aria-hidden="true" />}
              >
                View website
              </AnimatedSidebarMenuButton>
            </AnimatedSidebarMenuItem>
          </AnimatedSidebarMenu>
          <div className="flex items-center gap-3 rounded-md p-2 bg-brand-8/60 border border-brand-base/15">
            <Avatar className="size-8 ring-1 ring-emerald-500/30">
              <AvatarFallback className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 group-data-[state=collapsed]/sidebar:hidden">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs font-mono text-emerald-600 dark:text-emerald-400 capitalize">{user.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              disabled={isSigningOut}
              aria-label="Sign out"
              className="size-8 text-muted-foreground hover:text-destructive group-data-[state=collapsed]/sidebar:hidden disabled:opacity-50"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </AnimatedSidebarFooter>
        <AnimatedSidebarRail />
      </AnimatedSidebar>

      <AnimatedSidebarInset className="border border-border">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-border bg-background/90 px-4 backdrop-blur md:rounded-t-2xl">
          <AnimatedSidebarTrigger
            aria-label="Toggle sidebar"
            className="group/trigger size-9 rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <PanelLeftClose className="size-4 group-data-[state=collapsed]/trigger:hidden" aria-hidden="true" />
            <PanelLeftOpen className="hidden size-4 group-data-[state=collapsed]/trigger:block" aria-hidden="true" />
          </AnimatedSidebarTrigger>
          <span className="h-4 w-px bg-border" aria-hidden="true" />
          <div className="flex items-center gap-2 truncate">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" aria-hidden="true" />
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle color theme" className="size-9">
              <Sun className="hidden size-4 dark:block" aria-hidden="true" />
              <Moon className="size-4 dark:hidden" aria-hidden="true" />
            </Button>
          </div>
        </header>
        <div
          onClick={(e) => {
            const anchor = (e.target as HTMLElement).closest("a");
            if (
              anchor &&
              anchor.href &&
              !anchor.target &&
              !anchor.hasAttribute("download") &&
              !e.metaKey &&
              !e.ctrlKey &&
              !e.shiftKey
            ) {
              const url = new URL(anchor.href, window.location.origin);
              if (url.origin === window.location.origin && url.pathname.startsWith("/dashboard")) {
                e.preventDefault();
                navigate(url.pathname);
              }
            }
          }}
          className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-8"
        >
          <ErrorBoundary>
            <RoutePage route={currentRoute} isAdmin={isAdmin} />
          </ErrorBoundary>
        </div>
      </AnimatedSidebarInset>
      <Toaster position="bottom-right" />
    </AnimatedSidebarProvider>
  );
}

import { hasRole } from "@shsuman/auth/permissions";
import { ExternalLink, Loader2, LogOut, Moon, PanelLeftClose, PanelLeftOpen, ShieldAlert, Sun } from "lucide-react";
import { useEffect } from "react";
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

import { type DashboardRoute, navGroups } from "./nav";
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
      return <Overview />;
    case "content":
      return <ContentList />;
    case "section":
      return <SectionEditor section={route.section} />;
    case "blog":
      return <BlogList />;
    case "post":
      return <PostEditor slug={route.slug} />;
    case "resources":
      return <ResourceList />;
    case "resource":
      return <ResourceEditor slug={route.slug} />;
    case "users":
      return isAdmin ? <UsersPage /> : <NoAccess message="Only admins can manage users." />;
    case "mcp":
      return <McpPage />;
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

export function DashboardShell({ route }: { route: DashboardRoute }) {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as ({ role?: string | null } & NonNullable<typeof session>["user"]) | undefined;

  useEffect(() => {
    if (!isPending && !session) window.location.replace("/login");
  }, [isPending, session]);

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

  const signOut = () =>
    authClient.signOut({ fetchOptions: { onSuccess: () => window.location.replace("/login") } });

  return (
    <AnimatedSidebarProvider className="bg-background-secondary">
      <AnimatedSidebar variant="inset" collapsible="icon" ariaLabel="Dashboard" panelClassName="bg-transparent">
        <AnimatedSidebarHeader>
          <a href="/dashboard" className="flex items-center gap-3 rounded-xl px-2 py-1.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary font-mono text-xs text-primary-foreground">
              SK
            </span>
            <span className="min-w-0 truncate text-sm font-semibold text-foreground group-data-[state=collapsed]/sidebar:hidden">
              Site dashboard
            </span>
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
                          isActive={item.match(route)}
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
                icon={<ExternalLink className="size-4" aria-hidden="true" />}
              >
                View website
              </AnimatedSidebarMenuButton>
            </AnimatedSidebarMenuItem>
          </AnimatedSidebarMenu>
          <div className="flex items-center gap-3 rounded-xl p-2">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 group-data-[state=collapsed]/sidebar:hidden">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              aria-label="Sign out"
              className="size-8 group-data-[state=collapsed]/sidebar:hidden"
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
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle color theme" className="size-9">
              <Sun className="hidden size-4 dark:block" aria-hidden="true" />
              <Moon className="size-4 dark:hidden" aria-hidden="true" />
            </Button>
          </div>
        </header>
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-8">
          <RoutePage route={route} isAdmin={isAdmin} />
        </div>
      </AnimatedSidebarInset>
      <Toaster position="bottom-right" />
    </AnimatedSidebarProvider>
  );
}

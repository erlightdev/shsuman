import {
  BookOpen,
  FolderOpen,
  LayoutDashboard,
  type LucideIcon,
  PanelBottom,
  PlugZap,
  SquarePen,
  Users,
} from "lucide-react";

export type DashboardRoute =
  | { page: "overview" }
  | { page: "content" }
  | { page: "section"; section: string }
  | { page: "blog" }
  | { page: "post"; slug: string }
  | { page: "resources" }
  | { page: "resource"; slug: string }
  | { page: "users" }
  | { page: "mcp" };

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  match: (route: DashboardRoute) => boolean;
  adminOnly?: boolean;
}

export const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard, match: (r) => r.page === "overview" },
      {
        label: "Homepage",
        href: "/dashboard/content",
        icon: SquarePen,
        match: (r) => r.page === "content" || (r.page === "section" && r.section !== "footer"),
      },
      { label: "Blog", href: "/dashboard/blog", icon: BookOpen, match: (r) => r.page === "blog" || r.page === "post" },
      {
        label: "Resources",
        href: "/dashboard/resources",
        icon: FolderOpen,
        match: (r) => r.page === "resources" || r.page === "resource",
      },
      {
        label: "Footer",
        href: "/dashboard/content/footer",
        icon: PanelBottom,
        match: (r) => r.page === "section" && r.section === "footer",
      },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Users", href: "/dashboard/users", icon: Users, match: (r) => r.page === "users", adminOnly: true },
      { label: "MCP", href: "/dashboard/mcp", icon: PlugZap, match: (r) => r.page === "mcp" },
    ],
  },
];

export function pathToRoute(pathname: string): DashboardRoute {
  const clean = pathname.replace(/\/$/, "");
  if (clean === "/dashboard" || clean === "") return { page: "overview" };
  if (clean === "/dashboard/content") return { page: "content" };
  if (clean.startsWith("/dashboard/content/")) {
    return { page: "section", section: clean.replace("/dashboard/content/", "") };
  }
  if (clean === "/dashboard/blog") return { page: "blog" };
  if (clean.startsWith("/dashboard/blog/")) {
    return { page: "post", slug: clean.replace("/dashboard/blog/", "") };
  }
  if (clean === "/dashboard/resources") return { page: "resources" };
  if (clean.startsWith("/dashboard/resources/")) {
    return { page: "resource", slug: clean.replace("/dashboard/resources/", "") };
  }
  if (clean === "/dashboard/users") return { page: "users" };
  if (clean === "/dashboard/mcp") return { page: "mcp" };
  return { page: "overview" };
}

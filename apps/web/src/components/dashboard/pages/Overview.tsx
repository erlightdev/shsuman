import { ArrowUpRight, BookOpen, FolderOpen, PlugZap, SquarePen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";

import { useLoader } from "../hooks";
import { PageHeader } from "../PageHeader";

export function Overview() {
  const { data, loading } = useLoader(async () => {
    const [meta, posts, resources, tokens] = await Promise.all([
      orpc.content.meta(),
      orpc.blog.adminList(),
      orpc.resources.adminList(),
      orpc.mcp.tokens(),
    ]);
    return { meta, posts, resources, tokens };
  });

  const cards = data
    ? [
        {
          label: "Homepage sections",
          value: `${data.meta.filter((row) => row.customized).length}/${data.meta.length}`,
          hint: "edited from defaults",
          href: "/dashboard/content",
          icon: SquarePen,
        },
        {
          label: "Blog posts",
          value: String(data.posts.filter((post) => !post.draft).length),
          hint: `${data.posts.filter((post) => post.draft).length} drafts`,
          href: "/dashboard/blog",
          icon: BookOpen,
        },
        {
          label: "Resources",
          value: String(data.resources.filter((item) => !item.draft).length),
          hint: `${data.resources.filter((item) => item.draft).length} drafts`,
          href: "/dashboard/resources",
          icon: FolderOpen,
        },
        {
          label: "MCP tokens",
          value: String(data.tokens.filter((token) => !token.revokedAt).length),
          hint: "active",
          href: "/dashboard/mcp",
          icon: PlugZap,
        },
      ]
    : [];

  const recent = data
    ? [
        ...data.posts.map((post) => ({ kind: "Post", title: post.title, href: `/dashboard/blog/${post.slug}`, at: new Date(post.updatedAt) })),
        ...data.resources.map((item) => ({ kind: "Resource", title: item.title, href: `/dashboard/resources/${item.slug}`, at: new Date(item.updatedAt) })),
        ...data.meta
          .filter((row) => row.updatedAt)
          .map((row) => ({ kind: "Section", title: row.section, href: `/dashboard/content/${row.section}`, at: new Date(row.updatedAt as Date) })),
      ]
        .sort((a, b) => b.at.valueOf() - a.at.valueOf())
        .slice(0, 6)
    : [];

  return (
    <div className="space-y-8">
      <PageHeader title="Overview" description="Manage what visitors see. Design and layout stay fixed; only content changes." />

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
              <li key={i}>
                <Skeleton className="h-28 rounded-2xl" />
              </li>
            ))
          : cards.map((card) => (
              <li key={card.label}>
                <a href={card.href} className="group block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/20">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-sm">{card.label}</span>
                    <card.icon className="size-4" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-3xl font-semibold tabular-nums text-foreground">{card.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
                </a>
              </li>
            ))}
      </ul>

      <section aria-labelledby="recent-title" className="rounded-2xl border border-border">
        <h2 id="recent-title" className="border-b border-border px-5 py-4 text-sm font-medium">
          Recently updated
        </h2>
        {loading ? (
          <div className="space-y-2 p-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        ) : recent.length ? (
          <ul className="divide-y divide-border">
            {recent.map((item) => (
              <li key={`${item.kind}-${item.href}`}>
                <a href={item.href} className="flex items-center gap-4 px-5 py-3 text-sm hover:bg-muted/60">
                  <span className="w-20 shrink-0 text-muted-foreground">{item.kind}</span>
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground capitalize">{item.title}</span>
                  <time className="shrink-0 tabular-nums text-muted-foreground" dateTime={item.at.toISOString()}>
                    {item.at.toLocaleDateString()}
                  </time>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-6 text-sm text-muted-foreground">Nothing edited yet.</p>
        )}
      </section>
    </div>
  );
}

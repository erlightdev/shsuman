import { SECTION_LABELS, type SectionKey } from "@shsuman/api/content/schema";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";

import { useLoader } from "../hooks";
import { PageHeader } from "../PageHeader";

export function ContentList() {
  const { data, loading } = useLoader(() => orpc.content.meta());
  const rows = (data ?? []).filter((row) => row.section !== "footer");

  return (
    <div className="space-y-8">
      <PageHeader title="Homepage" description="Edit text, links, images and icons for each homepage section." />
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
        {loading
          ? Array.from({ length: 6 }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
              <li key={i} className="p-4">
                <Skeleton className="h-10" />
              </li>
            ))
            : rows.map((row) => {
              const meta = SECTION_LABELS[row.section as SectionKey];
              return (
                <li key={row.section}>
                  <a href={`/dashboard/content/${row.section}`} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-brand-8/40">
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                        {meta.label}
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">{meta.description}</span>
                    </span>
                    <span className="hidden shrink-0 text-xs sm:block">
                      {row.updatedAt ? (
                        <span className="inline-flex items-center rounded-full bg-brand-8 px-2.5 py-0.5 font-mono text-[11px] font-medium text-emerald-700 dark:text-emerald-300 border border-brand-base/20">
                          Edited {new Date(row.updatedAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Default</span>
                      )}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
                  </a>
                </li>
              );
            })}
      </ul>
    </div>
  );
}

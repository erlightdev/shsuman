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
                  <a href={`/dashboard/content/${row.section}`} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/60">
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-foreground">{meta.label}</span>
                      <span className="block truncate text-sm text-muted-foreground">{meta.description}</span>
                    </span>
                    <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                      {row.updatedAt ? `Edited ${new Date(row.updatedAt).toLocaleDateString()}` : "Default"}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </a>
                </li>
              );
            })}
      </ul>
    </div>
  );
}

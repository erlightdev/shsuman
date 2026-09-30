import { SECTION_LABELS, type SectionKey } from "@shsuman/api/content/schema";
import { ChevronRight, ExternalLink, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";

import { errorMessage, useLoader } from "../hooks";
import { PageHeader } from "../PageHeader";

const previewAnchor: Partial<Record<SectionKey, string>> = {
  hero: "/#top",
  profile: "/#top",
  about: "/#about",
  services: "/#services",
  work: "/#work",
  experience: "/#experience",
  credentials: "/#credentials",
  awards: "/#awards",
  blog: "/#blog",
  contact: "/#contact",
  footer: "/blog/",
  seo: "/",
};

export function ContentList() {
  const { data, loading, reload } = useLoader(() => orpc.content.meta());
  const [items, setItems] = useState<Array<{
    section: SectionKey;
    customized: boolean;
    enabled: boolean;
    updatedAt: Date | string | null;
    updatedBy: string | null;
  }>>([]);
  const [toggling, setToggling] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (data) {
      setItems(
        data
          .filter((row) => row.section !== "footer")
          .map((row) => ({
            ...row,
            section: row.section as SectionKey,
            enabled: row.enabled ?? true,
          })),
      );
    }
  }, [data]);

  async function handleToggle(section: SectionKey, nextEnabled: boolean) {
    setToggling((prev) => ({ ...prev, [section]: true }));
    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) => (item.section === section ? { ...item, enabled: nextEnabled } : item)),
    );

    try {
      await orpc.content.toggle({ section, enabled: nextEnabled });
      const meta = SECTION_LABELS[section];
      toast.success(`${meta.label} section ${nextEnabled ? "enabled" : "hidden from homepage"}.`);
      void reload();
    } catch (err) {
      toast.error(errorMessage(err));
      // Revert on error
      setItems((prev) =>
        prev.map((item) => (item.section === section ? { ...item, enabled: !nextEnabled } : item)),
      );
    } finally {
      setToggling((prev) => ({ ...prev, [section]: false }));
    }
  }

  const enabledCount = items.filter((item) => item.enabled).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Homepage"
        description="Manage visibility, text, links, images and icons for each homepage section."
        actions={
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-card border border-border px-3.5 py-1.5 rounded-full">
            <span className="size-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>{enabledCount} of {items.length} sections active</span>
          </div>
        }
      />

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        {loading && items.length === 0
          ? Array.from({ length: 6 }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
              <li key={i} className="p-4">
                <Skeleton className="h-12" />
              </li>
            ))
          : items.map((row) => {
              const meta = SECTION_LABELS[row.section];
              const isToggling = toggling[row.section];
              const isProfileOrSeo = row.section === "profile" || row.section === "seo";

              return (
                <li
                  key={row.section}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:px-5 sm:py-4 transition-colors hover:bg-muted/40",
                    !row.enabled && "opacity-65 bg-muted/20",
                  )}
                >
                  {/* Left: Section details + link */}
                  <a
                    href={`/dashboard/content/${row.section}`}
                    className="group flex flex-1 items-center gap-4 min-w-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                          {meta?.label ?? row.section}
                        </span>

                        {!isProfileOrSeo && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium border",
                              row.enabled
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                                : "bg-muted text-muted-foreground border-border",
                            )}
                          >
                            {row.enabled ? (
                              <>
                                <Eye className="size-3 text-emerald-500" />
                                Visible
                              </>
                            ) : (
                              <>
                                <EyeOff className="size-3 text-muted-foreground" />
                                Hidden
                              </>
                            )}
                          </span>
                        )}
                      </div>
                      <span className="block truncate text-xs sm:text-sm text-muted-foreground mt-0.5">
                        {meta?.description}
                      </span>
                    </div>
                  </a>

                  {/* Right: Toggle Switch + Edit & Preview Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                    <span className="hidden sm:block text-xs text-muted-foreground">
                      {row.updatedAt ? (
                        <span className="inline-flex items-center rounded-full bg-brand-8 px-2.5 py-0.5 font-mono text-[11px] font-medium text-emerald-700 dark:text-emerald-300 border border-brand-base/20">
                          Edited {new Date(row.updatedAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground font-mono text-[11px]">Default</span>
                      )}
                    </span>

                    {/* Enable / Disable Toggle */}
                    {!isProfileOrSeo && (
                      <div className="flex items-center gap-2 pr-2 border-r border-border">
                        <label
                          htmlFor={`toggle-${row.section}`}
                          className="text-xs text-muted-foreground cursor-pointer select-none font-medium hidden sm:inline"
                        >
                          {row.enabled ? "Enabled" : "Disabled"}
                        </label>
                        {isToggling ? (
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        ) : (
                          <Switch
                            id={`toggle-${row.section}`}
                            checked={row.enabled}
                            onCheckedChange={(checked) => handleToggle(row.section, checked)}
                            aria-label={`Toggle ${meta?.label ?? row.section} section visibility`}
                          />
                        )}
                      </div>
                    )}

                    {/* Quick Preview Link */}
                    {previewAnchor[row.section] && (
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground"
                        title={`Preview ${meta?.label}`}
                      >
                        <a href={previewAnchor[row.section]} target="_blank" rel="noopener">
                          <ExternalLink className="size-3.5" />
                        </a>
                      </Button>
                    )}

                    {/* Edit Link Button */}
                    <Button asChild variant="outline" size="sm" className="rounded-full gap-1 text-xs">
                      <a href={`/dashboard/content/${row.section}`}>
                        Edit
                        <ChevronRight className="size-3.5 text-muted-foreground" />
                      </a>
                    </Button>
                  </div>
                </li>
              );
            })}
      </ul>
    </div>
  );
}

import { SECTION_KEYS, SECTION_LABELS, type SectionKey, sectionSchemas } from "@shsuman/api/content/schema";
import { ArrowLeft, ExternalLink, Loader2, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";

import { ConfirmDialog } from "../ConfirmDialog";
import { errorMessage, useLoader } from "../hooks";
import { PageHeader } from "../PageHeader";
import { type FieldErrors, type JsonSchema, ObjectFields, toFieldErrors } from "../SchemaForm";

const previewAnchor: Partial<Record<SectionKey, string>> = {
  hero: "/#top",
  profile: "/#top",
  about: "/#about",
  services: "/#services",
  work: "/#work",
  experience: "/#experience",
  credentials: "/#credentials",
  blog: "/#blog",
  contact: "/#contact",
  footer: "/blog/",
  seo: "/",
};

export function SectionEditor({ section }: { section: string }) {
  const key = section as SectionKey;
  const valid = SECTION_KEYS.includes(key);
  const schema = useMemo(() => (valid ? (z.toJSONSchema(sectionSchemas[key]) as JsonSchema) : null), [key, valid]);
  const [value, setValue] = useState<Record<string, unknown> | null>(null);
  const [saved, setSaved] = useState<string>("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const { loading, error } = useLoader(async () => {
    if (!valid) return null;
    const content = await orpc.content.get();
    const current = content[key] as Record<string, unknown>;
    setValue(current);
    setSaved(JSON.stringify(current));
    return current;
  }, [key]);

  if (!valid || !schema) {
    return <p className="text-sm text-muted-foreground">Unknown section “{section}”.</p>;
  }

  const meta = SECTION_LABELS[key];
  const dirty = value !== null && JSON.stringify(value) !== saved;

  async function save() {
    if (!value) return;
    const parsed = sectionSchemas[key].safeParse(value);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error.issues));
      toast.error("Check the highlighted fields.");
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const next = (await orpc.content.update({ section: key, data: parsed.data as Record<string, unknown> })) as Record<string, unknown>;
      setValue(next);
      setSaved(JSON.stringify(next));
      toast.success(`${meta.label} saved.`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    try {
      const next = (await orpc.content.reset({ section: key })) as Record<string, unknown>;
      setValue(next);
      setSaved(JSON.stringify(next));
      setErrors({});
      toast.success(`${meta.label} reset.`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <div className="space-y-4">
        {key !== "footer" && (
          <a href="/dashboard/content" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Homepage
          </a>
        )}
        <PageHeader
          title={meta.label}
          description={meta.description}
          actions={
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <a href={previewAnchor[key] ?? "/"} target="_blank" rel="noopener">
                  <ExternalLink className="size-4" aria-hidden="true" />
                  Preview
                </a>
              </Button>
              <ConfirmDialog
                title={`Reset ${meta.label}?`}
                description="Saved changes to this section will be discarded and the default content restored."
                confirmLabel="Reset section"
                onConfirm={reset}
                trigger={
                  <Button type="button" variant="ghost" size="sm" className="rounded-full">
                    <RotateCcw className="size-4" aria-hidden="true" />
                    Reset
                  </Button>
                }
              />
            </>
          }
        />
      </div>

      {error && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{errorMessage(error)}</p>}

      {loading || !value ? (
        <div className="space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <ObjectFields schema={schema} path="" value={value} onChange={setValue} errors={errors} />
        </div>
      )}

      <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-2xl border border-border bg-background/90 p-3 shadow-md backdrop-blur">
        <p className="mr-auto pl-2 text-sm flex items-center gap-2">
          <span className={cn("size-2 rounded-full", dirty ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
          <span className="text-muted-foreground">{dirty ? "Unsaved changes" : "All changes saved"}</span>
        </p>
        <Button type="button" variant="ghost" className="rounded-full" disabled={!dirty || saving} onClick={() => setValue(JSON.parse(saved))}>
          Discard
        </Button>
        <Button
          type="submit"
          className={cn(
            "rounded-full transition-all",
            dirty && "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20"
          )}
          disabled={!dirty || saving}
        >
          {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}

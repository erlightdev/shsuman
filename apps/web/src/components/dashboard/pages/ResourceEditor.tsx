import { RESOURCE_TYPES, resourceInput } from "@shsuman/api/content/schema";
import { ArrowLeft, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";

import { ConfirmDialog } from "../ConfirmDialog";
import { TextField, toDateInput } from "../fields";
import { errorMessage, useLoader } from "../hooks";
import { PageHeader } from "../PageHeader";
import { RichTextEditor } from "../RichTextEditor";
import { type FieldErrors, toFieldErrors } from "../SchemaForm";

interface Draft {
  title: string;
  slug: string;
  summary: string;
  type: (typeof RESOURCE_TYPES)[number];
  url: string;
  category: string;
  featured: boolean;
  draft: boolean;
  publishedAt: string;
  body: string;
}

const blank: Draft = {
  title: "",
  slug: "",
  summary: "",
  type: "guide",
  url: "",
  category: "Guides",
  featured: false,
  draft: true,
  publishedAt: toDateInput(undefined),
  body: "",
};

export function ResourceEditor({ slug }: { slug: string }) {
  const isNew = slug === "new";
  const [form, setForm] = useState<Draft | null>(isNew ? blank : null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [currentSlug, setCurrentSlug] = useState(slug);

  const { loading, error } = useLoader(async () => {
    if (isNew) return null;
    const item = await orpc.resources.adminGet({ slug });
    setForm({
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      type: item.type as Draft["type"],
      url: item.url ?? "",
      category: item.category,
      featured: item.featured,
      draft: item.draft,
      publishedAt: toDateInput(item.publishedAt),
      body: item.body,
    });
    return item;
  }, [slug]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  async function save() {
    if (!form) return;
    const parsed = resourceInput.safeParse({
      title: form.title,
      slug: form.slug || undefined,
      summary: form.summary,
      type: form.type,
      url: form.url || null,
      category: form.category,
      featured: form.featured,
      draft: form.draft,
      publishedAt: new Date(form.publishedAt),
      body: form.body,
    });
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error.issues));
      toast.error("Check the highlighted fields.");
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const item = isNew
        ? await orpc.resources.create(parsed.data)
        : await orpc.resources.update({ slug: currentSlug, data: parsed.data });
      toast.success(form.draft ? "Draft saved." : "Resource published.");
      if (isNew || item.slug !== currentSlug) {
        window.location.replace(`/dashboard/resources/${item.slug}`);
        return;
      }
      setCurrentSlug(item.slug);
      set("slug", item.slug);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      await orpc.resources.delete({ slug: currentSlug });
      toast.success("Resource deleted.");
      window.location.replace("/dashboard/resources");
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
        <a href="/dashboard/resources" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Resources
        </a>
        <PageHeader
          title={isNew ? "New resource" : "Edit resource"}
          actions={
            !isNew && (
              <>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <a href="/resources/" target="_blank" rel="noopener">
                    <ExternalLink className="size-4" aria-hidden="true" />
                    View
                  </a>
                </Button>
                <ConfirmDialog
                  title="Delete this resource?"
                  description="It is removed from the Resources page permanently. To hide it instead, switch it to draft."
                  confirmLabel="Delete resource"
                  onConfirm={remove}
                  trigger={
                    <Button type="button" variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-4" aria-hidden="true" />
                      Delete
                    </Button>
                  }
                />
              </>
            )
          }
        />
      </div>

      {error && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{errorMessage(error)}</p>}

      {loading || !form ? (
        <div className="space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
          <div className="min-w-0 space-y-6">
            <TextField label="Title" value={form.title} onChange={(v) => set("title", v)} error={errors.title} max={200} />
            <TextField label="Summary" value={form.summary} onChange={(v) => set("summary", v)} error={errors.summary} max={320} multiline />
            <TextField
              label="File or link"
              value={form.url}
              onChange={(v) => set("url", v)}
              error={errors.url}
              placeholder="https://… or /file.pdf"
              hint="Optional. Visitors get a Download or Open button."
            />
            <div className="space-y-2">
              <Label>Details (optional)</Label>
              <RichTextEditor value={form.body} onChange={(v) => set("body", v)} aria-label="Resource details" placeholder="Add details, steps or notes. Leave empty to link straight to the file." />
              {errors.body && <p className="text-sm text-destructive">{errors.body}</p>}
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="resource-draft">Draft</Label>
                <Switch id="resource-draft" checked={form.draft} onCheckedChange={(v) => set("draft", v)} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="resource-featured">Featured</Label>
                <Switch id="resource-featured" checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => set("type", v as Draft["type"])}>
                  <SelectTrigger className="w-full" aria-label="Resource type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <TextField label="Category" value={form.category} onChange={(v) => set("category", v)} error={errors.category} hint="Resources are grouped by category." />
              <TextField label="Publish date" type="datetime-local" value={form.publishedAt} onChange={(v) => set("publishedAt", v)} error={errors.publishedAt} />
              <TextField label="URL slug" value={form.slug} onChange={(v) => set("slug", v)} error={errors.slug} placeholder="generated from title" />
            </div>
          </aside>
        </div>
      )}

      <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-2xl border border-border bg-background/90 p-3 shadow-md backdrop-blur">
        <p className="mr-auto pl-2 text-sm flex items-center gap-2">
          <span className={cn("size-2 rounded-full", form?.draft ? "bg-amber-500" : "bg-emerald-500 animate-pulse")} />
          <span className="text-muted-foreground">{form?.draft ? "Saved as draft" : "Visible on the website"}</span>
        </p>
        <Button
          type="submit"
          className={cn(
            "rounded-full transition-all",
            !form?.draft && "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20"
          )}
          disabled={saving || !form}
        >
          {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {form?.draft ? "Save draft" : isNew ? "Publish resource" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

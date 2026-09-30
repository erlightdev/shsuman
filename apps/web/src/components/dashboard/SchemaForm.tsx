import { ICONS } from "@shsuman/api/content/schema";
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AttachmentUpload } from "@/components/ui/attachment-upload";
import { contentIcons } from "@/lib/icons";
import { cn } from "@/lib/utils";

import { RichTextEditor } from "./RichTextEditor";

/**
 * Renders a form from a JSON Schema (generated from the strict Zod content
 * schemas), so every editable field gets an input automatically and nothing
 * outside the schema can be edited.
 */

export interface JsonSchema {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: string[];
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  format?: string;
  description?: string;
  anyOf?: JsonSchema[];
}

export type FieldErrors = Record<string, string>;

const LABELS: Record<string, string> = {
  flipPrefix: "Rotating text prefix",
  flipWords: "Rotating words",
  highlightRole: "Portrait caption",
  portraitUrl: "Portrait image",
  portraitAlt: "Portrait description (alt text)",
  cvUrl: "CV / Resume file",
  ogImage: "Social share image",
  sameAs: "Profile links for search engines",
  logoUrl: "Logo image",
  term: "Label",
  detail: "Value",
  clientsTitle: "Clients card title",
  clientsDescription: "Clients card description",
  blurb: "Footer text",
  note: "Copyright note",
  href: "Link",
  issuer: "Issuing body / Organization",
  credentialId: "Credential ID / License (optional)",
  school: "School / Institution",
  degree: "Degree / Qualification",
  enabled: "Section visible on homepage",
  imageUrl: "Image / Badge (optional)",
  credentialUrl: "Credential verification URL (optional)",
  certificateUrl: "Certificate file / link (optional)",
  card1Title: "Card 1: Title (Certifications)",
  card1Description: "Card 1: Description",
  card1Image: "Card 1: Cover image (optional)",
  certifications: "Card 1: Certifications list",
  card2Title: "Card 2: Title (Honors & Leadership)",
  card2Description: "Card 2: Description",
  card2Image: "Card 2: Cover image (optional)",
  awards: "Card 2: Honors & awards list",
  card3Title: "Card 3: Title (Proven Governance)",
  card3Description: "Card 3: Description",
  card3Image: "Card 3: Cover image (optional)",
  metrics: "Card 3: Governance metric rows",
};

const MARKDOWN_FIELDS = new Set(["blurb"]);
const ATTACHMENT_FIELDS =
  /(portraitUrl|cvUrl|logoUrl|ogImage|imageUrl|coverImage|certificateUrl|bannerUrl|.*Image|.*Attachment|.*File)$/i;

function humanize(key: string) {
  if (LABELS[key]) return LABELS[key];
  const words = key.replace(/([A-Z])/g, " $1").toLowerCase().trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function singular(label: string) {
  return label.replace(/ies$/, "y").replace(/s$/, "");
}

function emptyFor(schema?: JsonSchema): unknown {
  if (!schema) return "";
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  if (schema.enum && schema.enum.length > 0) return schema.enum[0];
  if (type === "object") {
    return Object.fromEntries(
      Object.entries(schema.properties ?? {}).map(([key, value]) => [key, emptyFor(value)]),
    );
  }
  if (type === "array") return [];
  if (type === "boolean") return false;
  return "";
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  );
}

interface FieldProps {
  name: string;
  path: string;
  schema: JsonSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  errors: FieldErrors;
}

function StringField({ name, path, schema, value, onChange, errors }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const text = typeof value === "string" ? value : "";
  const error = errors[path];
  const label = humanize(name);
  const common = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
  };

  if (schema.enum && name === "icon") {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Select value={text} onValueChange={onChange}>
          <SelectTrigger {...common} className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ICONS.map((icon) => {
              const Icon = contentIcons[icon];
              return (
                <SelectItem key={icon} value={icon}>
                  <Icon className="size-4" aria-hidden="true" />
                  {humanize(icon.replace(/-/g, " "))}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <FieldError id={errorId} message={error} />
      </div>
    );
  }

  if (schema.enum) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Select value={text} onValueChange={onChange}>
          <SelectTrigger {...common} className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {schema.enum.map((option) => (
              <SelectItem key={option} value={option}>
                {humanize(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError id={errorId} message={error} />
      </div>
    );
  }

  if (MARKDOWN_FIELDS.has(name)) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <RichTextEditor id={id} aria-label={label} value={text} onChange={onChange} compact />
        <FieldError id={errorId} message={error} />
      </div>
    );
  }

  if (ATTACHMENT_FIELDS.test(name)) {
    const isDoc = name.toLowerCase().includes("cv") || name.toLowerCase().includes("certificate");
    return (
      <div className="space-y-2">
        <AttachmentUpload
          id={id}
          label={label}
          value={text}
          onChange={(newUrl) => onChange(newUrl)}
          accept={isDoc ? "image/*,application/pdf" : "image/*"}
          previewType={isDoc ? "auto" : "image"}
          hint={
            isDoc
              ? "Upload a PDF document or image file, or paste a URL."
              : "Upload an image (PNG, JPG, WebP, SVG) or paste a URL."
          }
        />
        <FieldError id={errorId} message={error} />
      </div>
    );
  }

  const long = (schema.maxLength ?? 0) > 200;
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <Label htmlFor={id}>{label}</Label>
        {schema.maxLength && (
          <span className={cn("text-xs tabular-nums text-muted-foreground", text.length > schema.maxLength && "text-destructive")}>
            {text.length}/{schema.maxLength}
          </span>
        )}
      </div>
      {long ? (
        <Textarea {...common} value={text} onChange={(e) => onChange(e.target.value)} rows={4} className="text-base md:text-sm" />
      ) : (
        <Input
          {...common}
          type={schema.format === "email" ? "email" : "text"}
          value={text}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function BooleanField({ name, path, value, onChange, errors }: FieldProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
      <Label htmlFor={id}>{humanize(name)}</Label>
      <Switch id={id} checked={Boolean(value)} onCheckedChange={onChange} />
      <FieldError id={`${id}-error`} message={errors[path]} />
    </div>
  );
}

function move<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function ItemControls({
  index,
  count,
  canRemove,
  label,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  canRemove: boolean;
  label: string;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <Button type="button" variant="ghost" size="icon" className="size-8" disabled={index === 0} onClick={() => onMove(index - 1)} aria-label={`Move ${label} ${index + 1} up`}>
        <ArrowUp className="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="size-8" disabled={index === count - 1} onClick={() => onMove(index + 1)} aria-label={`Move ${label} ${index + 1} down`}>
        <ArrowDown className="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" disabled={!canRemove} onClick={onRemove} aria-label={`Remove ${label} ${index + 1}`}>
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

function ArrayField({ name, path, schema, value, onChange, errors }: FieldProps) {
  const list = Array.isArray(value) ? value : [];
  const itemSchema = schema.items ?? { type: "string" };
  const isObject = itemSchema.type === "object";
  const label = humanize(name);
  const itemLabel = singular(label).toLowerCase();
  const canAdd = schema.maxItems === undefined || list.length < schema.maxItems;
  const canRemove = list.length > (schema.minItems ?? 0);
  const [open, setOpen] = useState<number | null>(null);

  const update = (index: number, next: unknown) => onChange(list.map((item, i) => (i === index ? next : item)));

  return (
    <fieldset className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <legend className="text-sm font-medium text-foreground">{label}</legend>
        {schema.maxItems && (
          <span className="text-xs tabular-nums text-muted-foreground">
            {list.length}/{schema.maxItems}
          </span>
        )}
      </div>

      {isObject ? (
        <ul className="space-y-2">
          {list.map((item, index) => {
            const record = (item ?? {}) as Record<string, unknown>;
            const title = String(record.title ?? record.name ?? record.role ?? record.label ?? record.degree ?? record.term ?? record.value ?? `${singular(label)} ${index + 1}`);
            const expanded = open === index;
            const hasError = Object.keys(errors).some((key) => key.startsWith(`${path}.${index}.`));
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: list items have no stable id
              <li key={index} className={cn("rounded-xl border border-border", hasError && "border-destructive")}>
                <div className="flex items-center gap-2 pl-3">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 py-2.5 text-left text-sm"
                    aria-expanded={expanded}
                    onClick={() => setOpen(expanded ? null : index)}
                  >
                    <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")} aria-hidden="true" />
                    <span className="truncate font-medium text-foreground">{title || `${singular(label)} ${index + 1}`}</span>
                  </button>
                  <ItemControls
                    index={index}
                    count={list.length}
                    canRemove={canRemove}
                    label={itemLabel}
                    onMove={(to) => {
                      onChange(move(list, index, to));
                      setOpen(to);
                    }}
                    onRemove={() => {
                      onChange(list.filter((_, i) => i !== index));
                      setOpen(null);
                    }}
                  />
                </div>
                {expanded && (
                  <div className="space-y-4 border-t border-border p-4">
                    <ObjectFields schema={itemSchema} path={`${path}.${index}`} value={record} onChange={(next) => update(index, next)} errors={errors} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="space-y-2">
          {list.map((item, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: list items have no stable id
            <li key={index} className="flex items-start gap-1">
              <div className="min-w-0 flex-1">
                <Input
                  value={String(item ?? "")}
                  onChange={(e) => update(index, e.target.value)}
                  aria-label={`${singular(label)} ${index + 1}`}
                  aria-invalid={errors[`${path}.${index}`] ? true : undefined}
                />
                <FieldError id={`${path}-${index}-error`} message={errors[`${path}.${index}`]} />
              </div>
              <ItemControls
                index={index}
                count={list.length}
                canRemove={canRemove}
                label={itemLabel}
                onMove={(to) => onChange(move(list, index, to))}
                onRemove={() => onChange(list.filter((_, i) => i !== index))}
              />
            </li>
          ))}
        </ul>
      )}

      <FieldError id={`${path}-error`} message={errors[path]} />

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full transition-colors hover:border-emerald-500/40 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-brand-8/50"
        disabled={!canAdd}
        onClick={() => {
          onChange([...list, emptyFor(itemSchema)]);
          if (isObject) setOpen(list.length);
        }}
      >
        <Plus className="size-4" aria-hidden="true" />
        Add {itemLabel}
      </Button>
    </fieldset>
  );
}

function Field(props: FieldProps) {
  const schema = props.schema ?? {};
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  if (type === "array") return <ArrayField {...props} />;
  if (type === "boolean") return <BooleanField {...props} />;
  if (type === "object") {
    return (
      <fieldset className="space-y-4 rounded-xl border border-border p-4">
        <legend className="px-1 text-sm font-medium">{humanize(props.name)}</legend>
        <ObjectFields
          schema={schema}
          path={props.path}
          value={(props.value ?? {}) as Record<string, unknown>}
          onChange={props.onChange}
          errors={props.errors}
        />
      </fieldset>
    );
  }
  return <StringField {...props} />;
}

export function ObjectFields({
  schema,
  path,
  value,
  onChange,
  errors,
}: {
  schema: JsonSchema;
  path: string;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  errors: FieldErrors;
}) {
  const safeValue = value ?? {};
  const properties = schema?.properties ?? {};
  return (
    <>
      {Object.entries(properties).map(([key, child]) => (
        <Field
          key={key}
          name={key}
          path={path ? `${path}.${key}` : key}
          schema={child ?? { type: "string" }}
          value={safeValue[key]}
          onChange={(next) => onChange({ ...safeValue, [key]: next })}
          errors={errors}
        />
      ))}
    </>
  );
}

/** Flattens Zod issues into `a.b.0.c` → message. */
export function toFieldErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

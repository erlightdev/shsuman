import type { ReactNode } from "react";
import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** Small labelled field wrappers used by the post and resource editors. */

export function TextField({
  label,
  value,
  onChange,
  error,
  hint,
  max,
  multiline,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: ReactNode;
  max?: number;
  multiline?: boolean;
  placeholder?: string;
  type?: string;
}) {
  const id = useId();
  const described = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  const props = {
    id,
    value,
    placeholder,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": described,
  };
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <Label htmlFor={id}>{label}</Label>
        {max && (
          <span className={`text-xs tabular-nums ${value.length > max ? "text-destructive" : "text-muted-foreground"}`}>
            {value.length}/{max}
          </span>
        )}
      </div>
      {multiline ? (
        <Textarea {...props} rows={3} onChange={(e) => onChange(e.target.value)} className="text-base md:text-sm" />
      ) : (
        <Input {...props} type={type} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function toDateInput(value: Date | string | undefined) {
  const date = value ? new Date(value) : new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.valueOf() - offset).toISOString().slice(0, 16);
}

export function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

import {
  Check,
  Copy,
  ExternalLink,
  FileIcon,
  Link as LinkIcon,
  Loader2,
  Paperclip,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import React, { useCallback, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resolveMediaUrl } from "@/lib/media";
import { SERVER_URL } from "@/lib/server-url";
import { cn } from "@/lib/utils";

export interface AttachmentUploadProps {
  id?: string;
  value?: string | null;
  onChange: (value: string) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  hint?: string;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
  previewType?: "image" | "file" | "auto";
}

export function AttachmentUpload({
  id: customId,
  value = "",
  onChange,
  accept = "image/*,application/pdf",
  maxSizeMB = 20,
  label,
  hint,
  disabled = false,
  compact = false,
  className,
  previewType = "auto",
}: AttachmentUploadProps) {
  const generatedId = useId();
  const inputId = customId || generatedId;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"upload" | "url">("upload");

  const stringValue = typeof value === "string" ? value : "";
  const hasValue = Boolean(stringValue && stringValue.trim().length > 0);
  const isPdf = stringValue.toLowerCase().endsWith(".pdf") || stringValue.toLowerCase().includes(".pdf?");
  const isImage =
    previewType === "image" ||
    (previewType === "auto" &&
      !isPdf &&
      (/\.(jpeg|jpg|png|webp|gif|svg|avif)(\?.*)?$/i.test(stringValue) ||
        stringValue.startsWith("data:image/") ||
        mode === "upload"));

  const handleUploadFile = useCallback(
    async (file: File) => {
      if (disabled || isUploading) return;

      // Validate size
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        toast.error(`File is too large. Maximum size allowed is ${maxSizeMB}MB.`);
        return;
      }

      setIsUploading(true);
      setUploadProgress(15);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const uploadEndpoint = `${SERVER_URL}/api/upload`;

        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 90);
            setUploadProgress(Math.max(15, percent));
          }
        };

        const uploadPromise = new Promise<{ url: string }>((resolve, reject) => {
          xhr.open("POST", uploadEndpoint, true);
          xhr.withCredentials = true;

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch {
                resolve({ url: xhr.responseText });
              }
            } else {
              let errorMsg = "Upload failed";
              try {
                const errData = JSON.parse(xhr.responseText);
                if (errData.error) errorMsg = errData.error;
              } catch {
                // Ignore json parse error
              }
              reject(new Error(errorMsg));
            }
          };

          xhr.onerror = () => reject(new Error("Network error during file upload"));
          xhr.send(formData);
        });

        const res = await uploadPromise;
        setUploadProgress(100);
        onChange(res.url);
        toast.success(`Uploaded "${file.name}" successfully!`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to upload file";
        toast.error(message);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [disabled, isUploading, maxSizeMB, onChange],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      void handleUploadFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      void handleUploadFile(files[0]);
    }
  };

  const copyToClipboard = () => {
    if (!stringValue) return;
    navigator.clipboard.writeText(stringValue);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAttachment = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2.5", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </Label>
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={cn(
                "rounded px-2 py-0.5 font-medium transition-colors",
                mode === "upload"
                  ? "bg-primary/10 text-primary dark:bg-primary/20"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Upload
            </button>
            <span className="text-muted-foreground/40">•</span>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={cn(
                "rounded px-2 py-0.5 font-medium transition-colors",
                mode === "url"
                  ? "bg-primary/10 text-primary dark:bg-primary/20"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Paste URL
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="sr-only hidden"
        aria-hidden="true"
      />

      {mode === "url" ? (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <LinkIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="url"
              placeholder="https://… or /uploads/…"
              value={stringValue}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="pl-9 text-sm"
            />
          </div>
          {hasValue && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 size-9 text-muted-foreground hover:text-destructive"
              onClick={clearAttachment}
              title="Clear URL"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      ) : hasValue ? (
        /* Preview / Uploaded Card */
        <div className="group relative flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card/60 p-3 shadow-sm backdrop-blur-sm transition-all hover:border-border hover:shadow">
          {/* Visual Thumbnail */}
          <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/60">
            {isImage ? (
              <img
                src={resolveMediaUrl(stringValue)}
                alt="Uploaded media"
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  // Fallback to icon on broken image
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : isPdf ? (
              <FileIcon className="size-6 text-red-500/80" />
            ) : (
              <Paperclip className="size-6 text-primary" />
            )}
          </div>

          {/* Details & Actions */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-xs font-medium text-foreground" title={stringValue}>
                {stringValue.split("/").pop() || "Attachment"}
              </span>
            </div>
            <p className="truncate text-[11px] text-muted-foreground font-mono" title={stringValue}>
              {stringValue}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={copyToClipboard}
              title="Copy URL"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            </Button>

            <Button
              type="button"
              asChild
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <a href={resolveMediaUrl(stringValue)} target="_blank" rel="noopener noreferrer" title="Open file in new tab">
                <ExternalLink className="size-3.5" />
              </a>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-muted-foreground hover:text-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              title="Replace file"
            >
              <UploadCloud className="size-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-muted-foreground hover:text-destructive"
              onClick={clearAttachment}
              disabled={disabled || isUploading}
              title="Remove attachment"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        /* Drag & Drop Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && !disabled && fileInputRef.current?.click()}
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 px-6 py-6 text-center transition-all duration-200 hover:border-primary/50 hover:bg-primary/[0.02]",
            isDragging && "border-primary bg-primary/5 shadow-inner scale-[0.99]",
            disabled && "cursor-not-allowed opacity-60",
            compact ? "py-4" : "py-6",
          )}
        >
          {isUploading ? (
            <div className="w-full max-w-xs space-y-3 py-2">
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>Uploading attachment... {uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-background border border-border/80 shadow-sm transition-transform duration-200 group-hover:scale-110">
                <UploadCloud className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-foreground">
                  <span className="text-primary hover:underline">Click to upload</span> or drag and drop
                </p>
                <p className="text-[11px] text-muted-foreground">
                  PNG, JPG, WebP, SVG or PDF (up to {maxSizeMB}MB)
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

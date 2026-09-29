import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import { type Editor, EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  type LucideIcon,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface Props {
  /** Markdown */
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  /** Compact editor for short fields like the footer blurb */
  compact?: boolean;
  id?: string;
  "aria-label"?: string;
}

const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

function ToolButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-brand-8 hover:text-emerald-700 dark:hover:text-emerald-300 disabled:opacity-40",
        active && "bg-brand-8 text-emerald-700 dark:text-emerald-300 font-medium ring-1 ring-brand-base/20",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}

function Toolbar({ editor, compact }: { editor: Editor; compact?: boolean }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (https://, mailto:, / or #)", previous ?? "https://");
    if (url === null) return;
    if (!url) return editor.chain().focus().extendMarkRange("link").unsetLink().run();
    if (!SAFE_URL.test(url)) return window.alert("Use a link starting with https://, mailto:, tel:, / or #");
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Image URL (https:// or /path)");
    if (!url) return;
    if (!/^(https?:\/\/|\/)/i.test(url)) return window.alert("Use an image URL starting with https:// or /");
    const alt = window.prompt("Describe the image (alt text)") ?? "";
    editor.chain().focus().setImage({ src: url, alt }).run();
  };

  const c = () => editor.chain().focus();

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5"
    >
      {!compact && (
        <>
          <ToolButton icon={Heading2} label="Heading" active={state.h2} onClick={() => c().toggleHeading({ level: 2 }).run()} />
          <ToolButton icon={Heading3} label="Subheading" active={state.h3} onClick={() => c().toggleHeading({ level: 3 }).run()} />
          <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        </>
      )}
      <ToolButton icon={Bold} label="Bold" active={state.bold} onClick={() => c().toggleBold().run()} />
      <ToolButton icon={Italic} label="Italic" active={state.italic} onClick={() => c().toggleItalic().run()} />
      <ToolButton icon={Strikethrough} label="Strikethrough" active={state.strike} onClick={() => c().toggleStrike().run()} />
      <ToolButton icon={Link2} label="Link" active={state.link} onClick={setLink} />
      {!compact && (
        <>
          <ToolButton icon={Code} label="Inline code" active={state.code} onClick={() => c().toggleCode().run()} />
          <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
          <ToolButton icon={List} label="Bulleted list" active={state.bullet} onClick={() => c().toggleBulletList().run()} />
          <ToolButton icon={ListOrdered} label="Numbered list" active={state.ordered} onClick={() => c().toggleOrderedList().run()} />
          <ToolButton icon={Quote} label="Quote" active={state.quote} onClick={() => c().toggleBlockquote().run()} />
          <ToolButton icon={Minus} label="Divider" onClick={() => c().setHorizontalRule().run()} />
          <ToolButton icon={ImagePlus} label="Image" onClick={addImage} />
        </>
      )}
      <span className="ml-auto flex items-center gap-0.5">
        <ToolButton icon={Undo2} label="Undo" disabled={!state.canUndo} onClick={() => c().undo().run()} />
        <ToolButton icon={Redo2} label="Redo" disabled={!state.canRedo} onClick={() => c().redo().run()} />
      </span>
    </div>
  );
}

/** Tiptap editor that reads and writes Markdown. */
export function RichTextEditor({ value, onChange, placeholder, compact, id, "aria-label": ariaLabel }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, protocols: ["mailto", "tel"] },
      }),
      Image,
      Markdown,
      Placeholder.configure({ placeholder: placeholder ?? "Start writing…" }),
    ],
    content: value,
    contentType: "markdown",
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        "aria-label": ariaLabel ?? "Rich text editor",
        class: cn("prose-post prose-editor max-w-none px-4 py-3 focus:outline-none", compact ? "min-h-24 text-base" : "min-h-80"),
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getMarkdown()),
  });

  // Sync external value changes (e.g. after load) without clobbering typing.
  useEffect(() => {
    if (!editor || editor.isFocused) return;
    if (editor.getMarkdown() !== value) editor.commands.setContent(value, { contentType: "markdown", emitUpdate: false });
  }, [editor, value]);

  return (
    <div className="overflow-hidden rounded-xl border border-input bg-background focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30">
      {editor && <Toolbar editor={editor} compact={compact} />}
      <EditorContent editor={editor} />
    </div>
  );
}

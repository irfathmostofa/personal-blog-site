"use client";

import { useState, type ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  HighlighterIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  QuoteIcon,
  Redo2Icon,
  SquareCodeIcon,
  StrikethroughIcon,
  TableIcon,
  UnderlineIcon,
  Undo2Icon,
  UnlinkIcon,
} from "lucide-react";

import { ImagePicker } from "@/components/media/image-picker";
import { insertAssets } from "@/components/editor/image-node";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [href, setHref] = useState("");

  if (!editor) return null;

  function openLink() {
    setHref(editor?.getAttributes("link").href ?? "");
    setLinkOpen(true);
  }

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-border bg-card/95 px-2 py-1.5 backdrop-blur">
      <Group>
        <MarkButton
          label="Undo"
          shortcut="Ctrl+Z"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2Icon />
        </MarkButton>
        <MarkButton
          label="Redo"
          shortcut="Ctrl+Shift+Z"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2Icon />
        </MarkButton>
      </Group>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Group>
        <MarkButton
          label="Heading 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1Icon />
        </MarkButton>
        <MarkButton
          label="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2Icon />
        </MarkButton>
        <MarkButton
          label="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3Icon />
        </MarkButton>
        <MarkButton
          label="Heading 4"
          active={editor.isActive("heading", { level: 4 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        >
          <Heading4Icon />
        </MarkButton>
      </Group>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Group>
        <MarkButton
          label="Bold"
          shortcut="Ctrl+B"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon />
        </MarkButton>
        <MarkButton
          label="Italic"
          shortcut="Ctrl+I"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon />
        </MarkButton>
        <MarkButton
          label="Underline"
          shortcut="Ctrl+U"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon />
        </MarkButton>
        <MarkButton
          label="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <StrikethroughIcon />
        </MarkButton>
        <MarkButton
          label="Highlight"
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <HighlighterIcon />
        </MarkButton>
        <MarkButton
          label="Inline code"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <CodeIcon />
        </MarkButton>
      </Group>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Group>
        <MarkButton
          label="Align left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeftIcon />
        </MarkButton>
        <MarkButton
          label="Align center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenterIcon />
        </MarkButton>
        <MarkButton
          label="Align right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRightIcon />
        </MarkButton>
        <MarkButton
          label="Justify"
          active={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustifyIcon />
        </MarkButton>
      </Group>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Group>
        <MarkButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <ListIcon />
        </MarkButton>
        <MarkButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrderedIcon />
        </MarkButton>
        <MarkButton
          label="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <QuoteIcon />
        </MarkButton>
        <MarkButton
          label="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <SquareCodeIcon />
        </MarkButton>
        <MarkButton
          label="Divider"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <MinusIcon />
        </MarkButton>
      </Group>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Group>
        <MarkButton
          label="Link"
          active={editor.isActive("link")}
          onClick={openLink}
        >
          <LinkIcon />
        </MarkButton>
        <MarkButton
          label="Remove link"
          disabled={!editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <UnlinkIcon />
        </MarkButton>
        <MarkButton label="Insert image" onClick={() => setPickerOpen(true)}>
          <ImageIcon />
        </MarkButton>
        <MarkButton
          label="Insert table"
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          <TableIcon />
        </MarkButton>
      </Group>

      <ImagePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        folder="articles"
        multiple
        title="Insert images"
        onConfirm={(selection) => {
          const assets = Array.isArray(selection) ? selection : [selection];
          insertAssets(editor, assets);
        }}
      />

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="editor-href">URL</Label>
            <Input
              id="editor-href"
              value={href}
              placeholder="https://"
              onChange={(event) => setHref(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLinkOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                const value = href.trim();
                if (!value) {
                  editor.chain().focus().unsetLink().run();
                } else {
                  editor
                    .chain()
                    .focus()
                    .extendMarkRange("link")
                    .setLink({ href: value, target: "_blank" })
                    .run();
                }
                setLinkOpen(false);
              }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Group({ children }: { children: ReactNode }) {
  return <div className="flex items-center">{children}</div>;
}

function MarkButton({
  children,
  label,
  shortcut,
  active,
  disabled,
  onClick,
}: {
  children: ReactNode;
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant={active ? "secondary" : "ghost"}
      aria-label={shortcut ? `${label} (${shortcut})` : label}
      aria-pressed={active}
      disabled={disabled}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={cn(active && "bg-muted")}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

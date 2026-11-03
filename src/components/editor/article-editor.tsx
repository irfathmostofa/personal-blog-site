"use client";

import { useCallback, useEffect, useRef } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { toast } from "sonner";

import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { createEditorExtensions } from "@/components/editor/extensions";
import { insertAssets } from "@/components/editor/image-node";
import { uploadOptimizedFile } from "@/lib/media/upload-file";
import type { TiptapNode } from "@/lib/article/tiptap";
import { MEDIA_ALLOWED_TYPES } from "@/lib/media/constants";
import { cn } from "@/lib/utils";

function isImageFile(file: File) {
  return (MEDIA_ALLOWED_TYPES as readonly string[]).includes(file.type);
}

export function ArticleEditor({
  value,
  onChange,
  disabled = false,
}: {
  value: TiptapNode;
  onChange: (doc: TiptapNode) => void;
  disabled?: boolean;
}) {
  const uploading = useRef(false);
  const editorRef = useRef<Editor | null>(null);

  const insertFiles = useCallback(async (files: File[]) => {
    const instance = editorRef.current;
    const images = files.filter(isImageFile);
    if (!instance || images.length === 0) return false;
    if (uploading.current) return true;
    uploading.current = true;
    try {
      const assets = [];
      for (const file of images) {
        assets.push(await uploadOptimizedFile(file, "articles"));
      }
      insertAssets(instance, assets);
      toast.success(assets.length === 1 ? "Image inserted." : `${assets.length} images inserted.`);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "The image could not be uploaded.");
    } finally {
      uploading.current = false;
    }
    return true;
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: createEditorExtensions(),
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: "article-prose editor-surface min-h-[28rem] px-5 py-6 focus:outline-none sm:px-8",
      },
      handlePaste(_view, event) {
        const files = Array.from(event.clipboardData?.files ?? []);
        if (files.some(isImageFile)) {
          event.preventDefault();
          void insertFiles(files);
          return true;
        }
        return false;
      },
      handleDrop(_view, event) {
        const files = Array.from(event.dataTransfer?.files ?? []);
        if (files.some(isImageFile)) {
          event.preventDefault();
          void insertFiles(files);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getJSON() as TiptapNode);
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  const counts = useEditorState({
    editor,
    selector: (snapshot) => {
      if (!snapshot.editor) return { words: 0, characters: 0 };
      const counter = snapshot.editor.storage?.characterCount as
        | { words?: () => number; characters?: () => number }
        | undefined;
      if (typeof counter?.words === "function" && typeof counter.characters === "function") {
        return {
          words: counter.words(),
          characters: counter.characters(),
        };
      }
      const text = snapshot.editor.getText();
      const trimmed = text.trim();
      return {
        words: trimmed ? trimmed.split(/\s+/).length : 0,
        characters: text.length,
      };
    },
  });

  const minutes =
    (counts?.words ?? 0) === 0 ? 0 : Math.max(1, Math.round((counts?.words ?? 0) / 220));

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card")}>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2 text-xs text-muted-foreground">
        <p>
          {counts?.words ?? 0} words · {counts?.characters ?? 0} characters · {minutes} min read
        </p>
        <p>Drop or paste images. They use the same optimizer as the media library.</p>
      </div>
    </div>
  );
}

"use client";

import CharacterCount from "@tiptap/extension-character-count";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import { ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";

import { ImageNodeView } from "@/components/editor/image-node";

const lowlight = createLowlight(common);

export const ArticleImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: { default: null },
      align: { default: "center" },
      mediaId: { default: null },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

export function createEditorExtensions() {
  return [
    StarterKit.configure({
      codeBlock: false,
      heading: { levels: [1, 2, 3, 4] },
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      },
    }),
    ArticleImage.configure({
      inline: false,
      allowBase64: false,
      resize: false,
    }),
    CodeBlockLowlight.configure({ lowlight }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Highlight,
    Placeholder.configure({
      placeholder: "Begin the piece. Drop images, paste from the clipboard, or write.",
    }),
    CharacterCount,
    Typography,
    TableKit.configure({
      table: { resizable: true, renderWrapper: true },
    }),
  ];
}

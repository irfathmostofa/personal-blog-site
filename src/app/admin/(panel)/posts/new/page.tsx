import type { Metadata } from "next";

import { EditorMediaPanel } from "@/components/media/editor-media-panel";
import { Badge } from "@/components/ui/badge";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "New post",
  description: "Compose a new article.",
  path: "/admin/posts/new",
  noIndex: true,
});

export default function AdminNewPostPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <Badge
        variant="outline"
        className="h-auto rounded-full border-brand/30 bg-brand-muted/40 px-3 py-1 text-brand"
      >
        Phase 8
      </Badge>
      <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        New post
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Title, Tiptap, autosave and publishing still belong to Phase 8. Cover
        selection already uses the Phase 7 media picker so the editor will not
        need a second upload path.
      </p>
      <EditorMediaPanel />
    </div>
  );
}

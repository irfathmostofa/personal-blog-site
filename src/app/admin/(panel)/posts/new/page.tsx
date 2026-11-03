import type { Metadata } from "next";
import { Suspense } from "react";

import { PostForm } from "@/components/editor/post-form";
import { Skeleton } from "@/components/ui/skeleton";
import { listEditorTaxonomy } from "@/lib/admin/posts";
import { requireStaff } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "New post",
  description: "Compose a new article.",
  path: "/admin/posts/new",
  noIndex: true,
});

export default function AdminNewPostPage() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <NewPostBody />
    </Suspense>
  );
}

async function NewPostBody() {
  const session = await requireStaff("/admin/posts/new");
  const taxonomy = await listEditorTaxonomy();

  return (
    <PostForm
      post={null}
      categories={taxonomy.data.categories}
      tags={taxonomy.data.tags}
      authors={
        taxonomy.data.authors.length > 0
          ? taxonomy.data.authors
          : [
              {
                id: session.userId,
                display_name: session.profile.display_name,
                slug: session.profile.slug,
                role: session.profile.role,
              },
            ]
      }
      currentUserId={session.userId}
    />
  );
}

function EditorSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-8 h-[28rem] w-full" />
    </div>
  );
}

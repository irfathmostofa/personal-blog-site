import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { QueryError } from "@/components/content/empty-state";
import { PostForm } from "@/components/editor/post-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminPost, listEditorTaxonomy } from "@/lib/admin/posts";
import { requireStaff } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  return buildMetadata({
    title: "Edit post",
    description: "Edit an article.",
    path: `/admin/posts/${id}`,
    noIndex: true,
  });
}

export default function AdminEditPostPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <EditPostBody params={params} />
    </Suspense>
  );
}

async function EditPostBody({ params }: { params: Params }) {
  const session = await requireStaff("/admin/posts");
  const { id } = await params;
  const [loaded, taxonomy] = await Promise.all([
    getAdminPost(id),
    listEditorTaxonomy(),
  ]);

  if (!loaded.configured) notFound();
  if (loaded.error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <QueryError message={loaded.error} />
      </div>
    );
  }
  if (!loaded.data) notFound();

  return (
    <PostForm
      post={loaded.data}
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

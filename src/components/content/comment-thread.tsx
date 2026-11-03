import { formatDate } from "@/lib/format";
import type { PublicComment } from "@/lib/queries/comments";

export function CommentThread({ comments }: { comments: PublicComment[] }) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No comments yet. The first approved note will appear here.
      </p>
    );
  }

  const roots = comments.filter((item) => !item.parent_id);
  const byParent = new Map<string, PublicComment[]>();
  for (const item of comments) {
    if (!item.parent_id) continue;
    const list = byParent.get(item.parent_id) ?? [];
    list.push(item);
    byParent.set(item.parent_id, list);
  }

  return (
    <ol className="space-y-6">
      {roots.map((item) => (
        <li key={item.id} className="rounded-2xl border border-border bg-surface p-5">
          <CommentBody comment={item} />
          {(byParent.get(item.id) ?? []).length > 0 ? (
            <ol className="mt-4 space-y-4 border-l border-border pl-4">
              {(byParent.get(item.id) ?? []).map((reply) => (
                <li key={reply.id}>
                  <CommentBody comment={reply} />
                </li>
              ))}
            </ol>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function CommentBody({ comment }: { comment: PublicComment }) {
  return (
    <article>
      <p className="text-sm font-medium">{comment.author_name}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(comment.created_at)}</p>
      <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{comment.body}</p>
    </article>
  );
}

import Link from "next/link";

import { Sparkline } from "@/components/admin/sparkline";
import { EmptyState } from "@/components/content/empty-state";
import type { AnalyticsStats } from "@/lib/admin/analytics";
import { formatCompactNumber } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  scheduled: "Scheduled",
  archived: "Archived",
};

export function AnalyticsView({ stats }: { stats: AnalyticsStats }) {
  return (
    <div className="space-y-6">
      {!stats.configured ? (
        <EmptyState
          title="Analytics are waiting on a database."
          description="View events, likes and bookmarks are counted from stored rows, not estimated unique visitors."
        />
      ) : null}

      {stats.error ? (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          Some analytics queries failed. {stats.error}
        </p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="View events" value={stats.totals.views} hint="Hits, not unique readers" />
        <Metric label="Likes" value={stats.totals.likes} />
        <Metric label="Comments" value={stats.totals.comments} />
        <Metric label="Bookmarks" value={stats.totals.bookmarks} />
        <Metric label="Published" value={stats.totals.published} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Views over time"
          caption="View events in the last 30 days. These are hits, not unique readers."
        >
          <Sparkline
            points={stats.views}
            label="Article views per day over the last 30 days"
            empty="No view events were recorded in the last 30 days."
          />
        </ChartCard>
        <ChartCard
          title="Publishing activity"
          caption="Published articles in the last 30 days."
        >
          <Sparkline
            points={stats.publishing}
            label="Articles published per day over the last 30 days"
            empty="No articles were published in the last 30 days."
          />
        </ChartCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Most viewed articles
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Ranked by stored view counts. Likes are listed beside each row.
          </p>
          {stats.popular.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No articles yet. Popularity appears after the first post is saved.
            </p>
          ) : (
            <ol className="mt-5 divide-y divide-border">
              {stats.popular.map((post, index) => (
                <li key={post.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="w-5 shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href="/admin/posts" className="block truncate text-sm font-medium hover:underline">
                      {post.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {STATUS_LABEL[post.status] ?? post.status} · {formatCompactNumber(post.like_count)} likes
                    </p>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                    {formatCompactNumber(post.view_count)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Category performance
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Published article counts and stored view totals per category.
          </p>
          {stats.categories.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No categories yet.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-border">
              {stats.categories.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.posts} published
                    </p>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                    {formatCompactNumber(item.views)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs tracking-widest text-muted-foreground uppercase">{label}</p>
      <p className="mt-3 font-heading text-3xl font-semibold tracking-tight tabular-nums">
        {formatCompactNumber(value)}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function ChartCard({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="font-heading text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

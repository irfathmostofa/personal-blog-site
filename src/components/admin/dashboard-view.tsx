import Link from "next/link";
import {
  EyeIcon,
  FileTextIcon,
  FolderTreeIcon,
  MailIcon,
  MessageSquareIcon,
  PenLineIcon,
  TagsIcon,
  UsersIcon,
} from "lucide-react";

import { Sparkline } from "@/components/admin/sparkline";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { DashboardStats } from "@/lib/admin/stats";
import { formatCompactNumber, formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  scheduled: "Scheduled",
  archived: "Archived",
};

export function DashboardView({
  stats,
  greeting,
}: {
  stats: DashboardStats;
  greeting: string;
}) {
  const { counts } = stats;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-brand uppercase">
            Overview
          </p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {greeting}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Counts are read from the live database for this session. Zeros mean
            the table is empty, not that the number is invented.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className={cn(buttonVariants({ size: "lg" }), "h-9 px-3")}
        >
          New post
        </Link>
      </header>

      {!stats.configured ? (
        <p className="mt-8 rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          Supabase is not configured. Copy `.env.example` to `.env.local` and
          apply migrations to see live numbers.
        </p>
      ) : null}

      {stats.error ? (
        <p role="alert" className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          Some newsroom queries failed. {stats.error}
        </p>
      ) : null}

      <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Articles"
          value={counts.posts}
          href="/admin/posts"
          icon={FileTextIcon}
          hint={`${counts.published} published · ${counts.drafts} draft · ${counts.scheduled} scheduled`}
        />
        <StatCard
          label="Views"
          value={counts.views}
          href="/admin/analytics"
          icon={EyeIcon}
          hint="Article view events, not unique visitors"
        />
        <StatCard
          label="Comments"
          value={counts.comments}
          href="/admin/comments"
          icon={MessageSquareIcon}
          hint={
            counts.pendingComments
              ? `${counts.pendingComments} awaiting review`
              : "None pending"
          }
        />
        <StatCard
          label="Subscribers"
          value={counts.subscribers}
          href="/admin/subscribers"
          icon={UsersIcon}
          hint="Confirmed newsletter addresses"
        />
        <StatCard
          label="Categories"
          value={counts.categories}
          href="/admin/categories"
          icon={FolderTreeIcon}
        />
        <StatCard
          label="Tags"
          value={counts.tags}
          href="/admin/tags"
          icon={TagsIcon}
        />
        <StatCard
          label="Unread messages"
          value={counts.unreadMessages}
          href="/admin/messages"
          icon={MailIcon}
        />
        <StatCard
          label="Drafts"
          value={counts.drafts}
          href="/admin/posts"
          icon={PenLineIcon}
          hint={counts.archived ? `${counts.archived} archived` : undefined}
        />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Publishing activity"
          caption="Published articles in the last 14 days"
        >
          <Sparkline
            points={stats.publishing}
            label="Articles published per day over the last 14 days"
            empty="No articles were published in the last 14 days."
          />
        </ChartCard>
        <ChartCard
          title="Views over time"
          caption="View events in the last 14 days. These are hits, not unique readers."
        >
          <Sparkline
            points={stats.views}
            label="Article views per day over the last 14 days"
            empty="No view events were recorded in the last 14 days."
          />
        </ChartCard>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Popular articles
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Ranked by stored view counts across every status.
          </p>
          {stats.popular.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No articles yet. Popularity will appear after the first post is
              saved.
            </p>
          ) : (
            <ol className="mt-5 divide-y divide-border">
              {stats.popular.map((post, index) => (
                <li key={post.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="w-5 shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/posts`}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {STATUS_LABEL[post.status] ?? post.status}
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
            Recent activity
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Latest article updates, including drafts.
          </p>
          {stats.recent.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Nothing has been written yet. Activity will list the last six
              article edits.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-border">
              {stats.recent.map((post) => (
                <li key={post.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Link
                      href="/admin/posts"
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatRelativeDate(post.updated_at)}
                    </p>
                  </div>
                  <Badge variant="outline" className="h-5 shrink-0 capitalize">
                    {post.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  href,
  icon: Icon,
}: {
  label: string;
  value: number;
  hint?: string;
  href: string;
  icon: typeof FileTextIcon;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-2xl border border-border bg-card p-4 transition-colors hover:border-brand/40 hover:bg-card/80",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs tracking-widest text-muted-foreground uppercase">
          {label}
        </p>
        <Icon className="size-4 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-3 font-heading text-3xl font-semibold tracking-tight tabular-nums">
        {formatCompactNumber(value)}
      </p>
      {hint ? (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </Link>
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

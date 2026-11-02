import Image from "next/image";

import { getInitials } from "@/lib/format";
import type { AuthorRef } from "@/lib/queries/types";

const SOCIAL = [
  ["website_url", "Website"],
  ["twitter_url", "X"],
  ["github_url", "GitHub"],
  ["linkedin_url", "LinkedIn"],
] as const;

export function AuthorCard({ author }: { author: AuthorRef }) {
  const links = SOCIAL.filter(([key]) => author[key]);

  return (
    <aside className="flex gap-4 rounded-2xl border border-border bg-surface p-6">
      {author.avatar ? (
        <Image
          src={author.avatar.public_url}
          alt={author.avatar.alt_text || author.display_name}
          width={64}
          height={64}
          className="size-16 rounded-full object-cover"
        />
      ) : (
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-muted font-heading text-lg font-semibold text-brand">
          {getInitials(author.display_name)}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs tracking-widest text-muted-foreground uppercase">
          Written by
        </p>
        <h2 className="mt-1 font-heading text-xl font-semibold tracking-tight">
          {author.display_name}
        </h2>
        {author.bio ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {author.bio}
          </p>
        ) : null}
        {links.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-3 text-sm">
            {links.map(([key, label]) => (
              <li key={key}>
                <a
                  href={author[key] ?? undefined}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-brand hover:underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </aside>
  );
}

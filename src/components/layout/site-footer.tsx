import Link from "next/link";
import { ArrowUpRightIcon, RssIcon } from "lucide-react";

import { Wordmark } from "@/components/brand/wordmark";
import { FOOTER_LINKS, SITE } from "@/lib/constants";

const YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="container-editorial grid gap-12 py-14 md:grid-cols-[1.4fr_repeat(3,minmax(0,0.7fr))] md:gap-8">
        <div className="max-w-sm">
          <Wordmark />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {SITE.description}
          </p>
          <Link
            href="/feed.xml"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-opacity hover:opacity-80"
          >
            <RssIcon className="size-3.5" aria-hidden />
            Subscribe via RSS
          </Link>
        </div>

        <FooterColumn title="Read" links={FOOTER_LINKS.read} />
        <FooterColumn title="Publication" links={FOOTER_LINKS.publication} />
        <FooterColumn title="Legal" links={FOOTER_LINKS.legal} />
      </div>

      <div className="border-t border-border">
        <div className="container-editorial flex flex-col gap-3 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {YEAR} {SITE.name}. Independently published by{" "}
            {SITE.author.name}.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            Admin
            <ArrowUpRightIcon className="size-3" aria-hidden />
          </Link>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ readonly label: string; readonly href: string }>;
}) {
  return (
    <div>
      <h2 className="font-sans text-xs font-semibold tracking-widest text-foreground uppercase">
        {title}
      </h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

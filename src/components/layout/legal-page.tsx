import { FileTextIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type LegalSection = {
  heading: string;
  body: string;
};

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="container-editorial py-16 sm:py-24">
      <div className="container-read mx-auto">
        <Badge
          variant="outline"
          className="h-auto gap-2 rounded-full border-brand/30 bg-brand-muted/40 px-3 py-1 text-brand"
        >
          <FileTextIcon className="size-3" aria-hidden />
          Draft pending {updated} implementation
        </Badge>

        <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>

        <p className="mt-5 border-l-2 border-brand/40 pl-5 text-base leading-relaxed text-muted-foreground italic">
          {intro}
        </p>

        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                {section.heading}
              </h2>
              <p className="mt-3 text-[0.975rem] leading-relaxed text-foreground/80">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

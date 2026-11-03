import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  pending: "border-brand/30 bg-brand-muted/40 text-brand",
  approved: "border-border bg-muted text-foreground",
  confirmed: "border-border bg-muted text-foreground",
  published: "border-border bg-muted text-foreground",
  rejected: "border-destructive/30 bg-destructive/10 text-destructive",
  spam: "border-destructive/30 bg-destructive/10 text-destructive",
  unsubscribed: "border-border text-muted-foreground",
  archived: "border-border text-muted-foreground",
  unread: "border-brand/30 bg-brand-muted/40 text-brand",
};

export function StatusBadge({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("h-5 capitalize", TONE[value] ?? "", className)}
    >
      {value}
    </Badge>
  );
}
